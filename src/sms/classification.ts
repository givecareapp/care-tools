/**
 * Risk classification, consent detection, resource categorization, and crisis response.
 * C-SSRS-aligned risk tiers for safety-critical SMS routing.
 */

const DEFAULT_FOLLOWUP_MINUTES = 360

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type LoopName =
  | 'onboarding'
  | 'bootstrap'
  | 'activeSupport'
  | 'wellbeingAssessment'
  | 'crisis'
  | 'followUp'

export interface RiskAssessment {
  level: RiskLevel
  reason: string
  hitTerms: string[]
  /** C-SSRS aligned tier: 0=none, 1=strain, 2=passive ideation, 3=active ideation, 4-5=intent/plan */
  cssrsTier: number
}

export type ConsentIntent = 'granted' | 'denied' | 'none'

// C-SSRS-aligned tiers
const CRITICAL_TERMS = [
  'plan to kill myself',
  'plan to end my life',
  'plan to die',
  'going to kill myself',
  'going to end it',
  'want to kill myself',
  'want to die',
  'want to end my life',
  'want to end it all',
  'suicide',
  'kill myself',
  'end my life',
  'overdose',
  "don't want to live",
  'do not want to live',
  'better off dead',
  'no reason to live',
]

const HIGH_TERMS = [
  'wish i were dead',
  'wish i was dead',
  'wish i could disappear',
  "can't go on",
  "can't do this anymore",
  "i'm done",
  'no point',
  'self harm',
  'hurt myself',
  'hopeless',
  'breaking down',
  'panic attack',
  'falling apart',
  "can't take it",
]

const MEDIUM_TERMS = [
  'overwhelmed',
  'burned out',
  'exhausted',
  'alone',
  'anxious',
  'stressed',
  "can't sleep",
  'crying',
  'angry',
  'resentful',
]

const CATEGORY_TERMS: Record<string, string[]> = {
  benefits: ['snap', 'medicaid', 'fmla', 'liheap', 'benefits', 'insurance'],
  respite: ['respite', 'break', 'relief', 'rest', 'day off'],
  support_group: ['support group', 'community', 'group', 'peer'],
  food_energy: ['food', 'groceries', 'heat', 'electric', 'utility'],
  transportation: ['ride', 'rides', 'transport', 'transportation', 'drive', 'driving'],
  adult_day_care: ['day care', 'daycare', 'adult day', 'day program', 'day center'],
}

const CONSENT_GRANT_PATTERNS: RegExp[] = [
  /^\s*(yes|yep|yeah|y|ok|okay|sure|affirmative|absolutely|sounds good|let's do this|i agree|i consent|i accept|sure thing|go ahead)\b/i,
  /\bi\s+(agree|consent|want to|would like to|confirm)\b/i,
]

const CONSENT_DECLINE_PATTERNS: RegExp[] = [
  /^\s*(no|nope|nah|not now|not today|not yet|skip|please stop|stop|don't want|do not want)\b/i,
  /\bnot now\b/i,
]

const CONSENT_REQUEST_REPLY =
  'I can help with caregiver support, benefits, and resources. Reply YES to opt in and continue this SMS chat, or NO to pause for now. For urgent safety needs, call/text 988.'
const CONSENT_DECLINED_REPLY =
  "No worries — you're still welcome to opt back in any time by replying YES. If this is urgent, call/text 988 now."

export function assessRisk(text: string): RiskAssessment {
  const lower = text.toLowerCase()
  const criticalHits = CRITICAL_TERMS.filter(term => lower.includes(term))
  if (criticalHits.length > 0) {
    const hasPlan = criticalHits.some(t => t.startsWith('plan to') || t.startsWith('going to'))
    return {
      level: 'critical',
      reason: hasPlan
        ? 'suicidal intent with plan indicators (C-SSRS 4-5)'
        : 'suicidal ideation with intent (C-SSRS 4)',
      hitTerms: criticalHits,
      cssrsTier: hasPlan ? 5 : 4,
    }
  }

  const highHits = HIGH_TERMS.filter(term => lower.includes(term))
  if (highHits.length > 0) {
    const hasIdeation = highHits.some(
      t =>
        t.includes('wish i were dead') ||
        t.includes('wish i was dead') ||
        t.includes('self harm') ||
        t.includes('hurt myself')
    )
    return {
      level: 'high',
      reason: hasIdeation
        ? 'passive suicidal ideation (C-SSRS 2-3)'
        : 'acute distress without explicit ideation',
      hitTerms: highHits,
      cssrsTier: hasIdeation ? 2 : 1,
    }
  }

  const mediumHits = MEDIUM_TERMS.filter(term => lower.includes(term))
  if (mediumHits.length > 0) {
    return {
      level: 'medium',
      reason: 'caregiver strain indicators detected',
      hitTerms: mediumHits,
      cssrsTier: 0,
    }
  }

  return { level: 'low', reason: 'no direct risk language detected', hitTerms: [], cssrsTier: 0 }
}

export function detectConsentIntent(text: string): ConsentIntent {
  const normalized = text.trim().toLowerCase()
  if (!normalized) return 'none'
  if (CONSENT_DECLINE_PATTERNS.some(pattern => pattern.test(normalized))) return 'denied'
  if (CONSENT_GRANT_PATTERNS.some(pattern => pattern.test(normalized))) return 'granted'
  return 'none'
}

export function getConsentRequestReply(): string {
  return CONSENT_REQUEST_REPLY
}

export function getConsentDeclinedReply(): string {
  return CONSENT_DECLINED_REPLY
}

export function deriveLoop(args: {
  currentLoop: string
  consentStatus: string
  riskLevel: RiskLevel
  latestText: string
  bootstrapCompletedAt?: number | null
}): LoopName {
  if (args.consentStatus !== 'granted') return 'onboarding'
  if (!args.bootstrapCompletedAt) return 'bootstrap'
  const lower = args.latestText.toLowerCase()
  if (isResourceIntent(lower)) return 'activeSupport'
  if (lower.includes('burnout') || lower.includes('overwhelmed') || lower.includes("can't sleep")) {
    return 'wellbeingAssessment'
  }
  return 'activeSupport'
}

export function chooseResourceCategory(text: string): string | null {
  const lower = text.toLowerCase()
  for (const [category, terms] of Object.entries(CATEGORY_TERMS)) {
    if (terms.some(term => lower.includes(term))) return category
  }
  return null
}

export function offerResource(category: string): string[] {
  switch (category) {
    case 'benefits':
      return [
        'SNAP pre-screen: Benefits.gov',
        'Medicaid eligibility lookup: Medicaid.gov',
        'FMLA leave rights: dol.gov/FMLA',
        'LIHEAP utility support: acf.hhs.gov/ocs/liheap',
      ]
    case 'respite':
      return [
        'Aging and Disability Resource Centers (local respite options)',
        'ARCH National Respite Locator: archrespite.org/locator',
      ]
    case 'support_group':
      return ['Family Caregiver Alliance support groups', 'Area Agency on Aging caregiver programs']
    case 'food_energy':
      return [
        '211 can connect you to food and utility relief',
        'LIHEAP and local emergency utility funds',
      ]
    case 'transportation':
      return [
        'Rides in Sight: ridesinsight.org (1-855-607-4337)',
        'Medicaid Non-Emergency Medical Transportation (contact your state Medicaid office)',
      ]
    case 'adult_day_care':
      return [
        'National Adult Day Services Association locator: nadsa.org/locator',
        'Eldercare Locator (1-800-677-1116) can find day programs near you',
      ]
    default:
      return []
  }
}

export function buildCrisisReply(): string {
  return [
    "I hear how much pain you're in. You matter, and you don't need to carry this alone.",
    'If you might act on these thoughts, call or text 988 now.',
    'If you prefer text, message HOME to 741741 for a live crisis counselor.',
    "If you're in immediate danger, call 911 right now.",
  ].join('\n\n')
}

export function getDefaultFollowUpMinutes(riskLevel: RiskLevel): number {
  if (riskLevel === 'critical') return 15
  if (riskLevel === 'high') return 60
  return DEFAULT_FOLLOWUP_MINUTES
}

export function composeSmsReply(parts: string[]): string {
  return clampSmsText(parts.filter(Boolean).join('\n\n'))
}

function isResourceIntent(lower: string): boolean {
  return [
    'benefit',
    'snap',
    'medicaid',
    'fmla',
    'liheap',
    'help paying',
    'respite',
    'support group',
  ].some(token => lower.includes(token))
}

function clampSmsText(text: string): string {
  const normalized = text.replace(/\s+\n/g, '\n').trim()
  if (normalized.length <= 1400) return normalized
  return `${normalized.slice(0, 1396)}...`
}
