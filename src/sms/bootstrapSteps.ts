/**
 * Bootstrap step config, pure helpers, extraction functions, and welcome message.
 * Pure module — no Convex runtime, no AI SDK.
 */

import { inferTimezoneFromAreaCode, parseTimezoneResponse, TZ_DISPLAY_NAME } from '../geo/timezone'
import { composeSmsReply } from './classification'

// -- Bootstrap stage + memory key constants --

export const STAGE = {
  WELCOME: 'bootstrap:welcome',
  SITUATION: 'bootstrap:situation',
  TIMEZONE: 'bootstrap:timezone',
  ZIPCODE: 'bootstrap:zipcode',
  PLAN: 'bootstrap:plan',
} as const

export const MEM = {
  FIRST_NAME: 'first_name',
  CARE_RECIPIENT: 'care_recipient',
  SITUATION_RAW: 'situation_raw',
  PRESSURE_ZONES: 'pressure_zones',
  TIMEZONE: 'timezone',
  ZIP_CODE: 'zip_code',
  CHECK_IN_FREQUENCY: 'check_in_frequency',
} as const

// -- Bootstrap step config (declarative, drives skip logic) --

export interface CaregiverWebContext {
  firstName?: string | null
  careRecipient?: string | null
  relationship?: string | null
  timezone?: string | null
  zipCode?: string | null
  checkInFrequency?: string | null
}

interface BootstrapStepDef {
  stage: string
  isSatisfied: (c: CaregiverWebContext) => boolean
  memorySeeds: (c: CaregiverWebContext) => Array<{
    key: string
    value: string
    confidence: number
  }>
}

const BOOTSTRAP_STEPS: readonly BootstrapStepDef[] = [
  {
    stage: STAGE.WELCOME,
    isSatisfied: c => !!c.firstName,
    memorySeeds: c =>
      c.firstName ? [{ key: MEM.FIRST_NAME, value: c.firstName, confidence: 0.95 }] : [],
  },
  {
    stage: STAGE.SITUATION,
    isSatisfied: c => !!(c.careRecipient || c.relationship),
    memorySeeds: c => {
      const val = c.careRecipient ?? c.relationship
      return val ? [{ key: MEM.CARE_RECIPIENT, value: val, confidence: 0.95 }] : []
    },
  },
  {
    stage: STAGE.TIMEZONE,
    isSatisfied: c => !!c.timezone,
    memorySeeds: c =>
      c.timezone ? [{ key: MEM.TIMEZONE, value: c.timezone, confidence: 0.95 }] : [],
  },
  {
    stage: STAGE.ZIPCODE,
    isSatisfied: c => !!c.zipCode,
    memorySeeds: c =>
      c.zipCode ? [{ key: MEM.ZIP_CODE, value: c.zipCode, confidence: 0.95 }] : [],
  },
]

// -- Pure resolver --

export function resolveBootstrapStart(caregiver: CaregiverWebContext): {
  nextStage: string
  memorySeeds: Array<{ key: string; value: string; confidence: number }>
} {
  const seeds: Array<{ key: string; value: string; confidence: number }> = []
  for (const step of BOOTSTRAP_STEPS) {
    if (step.isSatisfied(caregiver)) {
      seeds.push(...step.memorySeeds(caregiver))
      continue
    }
    return { nextStage: step.stage, memorySeeds: seeds }
  }
  if (caregiver.checkInFrequency) {
    seeds.push({ key: MEM.CHECK_IN_FREQUENCY, value: caregiver.checkInFrequency, confidence: 0.95 })
  }
  return { nextStage: STAGE.PLAN, memorySeeds: seeds }
}

// -- Pure helpers --

const SKIP_PATTERNS = /^\s*(skip|next|pass|no|nah|later)\s*$/i

export function isSkip(text: string): boolean {
  return !text.trim() || SKIP_PATTERNS.test(text)
}

export function extractFirstName(text: string): string | null {
  if (isSkip(text)) return null
  const cleaned = text.replace(/^(my name is|i'm|i am|call me|it's|its)\s+/i, '').trim()
  const words = cleaned.split(/\s+/)
  if (words.length > 3) return null
  const firstWord = words[0]
  if (!firstWord || firstWord.length < 2 || firstWord.length > 30) return null
  const name = firstWord.replace(/[.,!?]+$/, '')
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
}

const RECIPIENT_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\b(?:my\s+)?mom(?:my)?\b/i, label: 'mom' },
  { pattern: /\b(?:my\s+)?mother\b/i, label: 'mother' },
  { pattern: /\b(?:my\s+)?dad(?:dy)?\b/i, label: 'dad' },
  { pattern: /\b(?:my\s+)?father\b/i, label: 'father' },
  { pattern: /\b(?:my\s+)?husband\b/i, label: 'husband' },
  { pattern: /\b(?:my\s+)?wife\b/i, label: 'wife' },
  { pattern: /\b(?:my\s+)?spouse\b/i, label: 'spouse' },
  { pattern: /\b(?:my\s+)?partner\b/i, label: 'partner' },
  { pattern: /\b(?:my\s+)?parent\b/i, label: 'parent' },
  { pattern: /\b(?:my\s+)?grandm(?:a|other)\b/i, label: 'grandmother' },
  { pattern: /\b(?:my\s+)?grand(?:father|pa|dad)\b/i, label: 'grandfather' },
  { pattern: /\b(?:my\s+)?(?:son|daughter|child|kid)\b/i, label: 'child' },
  { pattern: /\b(?:my\s+)?(?:brother|sister|sibling)\b/i, label: 'sibling' },
]

export function extractCareRecipient(text: string): string | null {
  if (isSkip(text)) return null
  for (const { pattern, label } of RECIPIENT_PATTERNS) {
    if (pattern.test(text)) return label
  }
  return null
}

const ZIP_PATTERN = /\b(\d{5})(?:-\d{4})?\b/

export function extractZipCode(text: string): string | null {
  if (isSkip(text)) return null
  const match = text.match(ZIP_PATTERN)
  return match ? match[1] : null
}

export function buildTimezonePrompt(phoneE164: string): string {
  const tz = inferTimezoneFromAreaCode(phoneE164)
  const name = TZ_DISPLAY_NAME[tz] ?? 'Eastern'
  return `What time zone are you in? (I'm guessing ${name} based on your area code — just reply OK if that's right)`
}

export { inferTimezoneFromAreaCode, parseTimezoneResponse }

// -- Welcome message --

export function getBootstrapWelcomeReply(
  caregiver: CaregiverWebContext & { phoneE164: string }
): {
  text: string
  nextStage: string
  memorySeeds: Array<{ key: string; value: string; confidence: number }>
} {
  const { nextStage, memorySeeds } = resolveBootstrapStart(caregiver)
  const intro =
    "I'm Mira, your caregiving chief of staff. I track what matters, find programs you qualify for, and help you stay ahead."

  if (nextStage === STAGE.WELCOME) {
    return { text: composeSmsReply([intro, 'What should I call you?']), nextStage, memorySeeds }
  }

  const greeting = `Thanks for signing up, ${caregiver.firstName}! ${intro}`

  if (nextStage === STAGE.SITUATION) {
    return {
      text: composeSmsReply([
        greeting,
        "Tell me about your situation — who are you caring for, and what's hardest right now?",
      ]),
      nextStage,
      memorySeeds,
    }
  }

  if (nextStage === STAGE.PLAN) {
    return {
      text: composeSmsReply([greeting, 'Building your personalized plan now...']),
      nextStage,
      memorySeeds,
    }
  }

  if (nextStage === STAGE.ZIPCODE) {
    return {
      text: composeSmsReply([
        greeting,
        'What\'s your zip code? This helps me find local resources near you. (Reply "skip" if you\'d rather not.)',
      ]),
      nextStage,
      memorySeeds,
    }
  }

  return {
    text: composeSmsReply([greeting, buildTimezonePrompt(caregiver.phoneE164)]),
    nextStage,
    memorySeeds,
  }
}
