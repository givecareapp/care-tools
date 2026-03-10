import { SUPPORTED_INSTRUMENTS, type InstrumentKey } from '../transitions'

export interface TurnValidation {
  valid: boolean
  reason?: string
}

/** Validate that an instrument key is in the canonical set. */
export function isValidInstrument(instrument: string): instrument is InstrumentKey {
  return (SUPPORTED_INSTRUMENTS as readonly string[]).includes(instrument)
}

export function validateTurnOutcome(replyText: string): TurnValidation {
  if (!replyText || !replyText.trim()) {
    return { valid: false, reason: 'empty_reply' }
  }
  const trimmed = replyText.trim()
  if (trimmed.length < 10) {
    return { valid: false, reason: 'too_short' }
  }
  if (/^[.\s!?…]+$/.test(trimmed)) {
    return { valid: false, reason: 'punctuation_only' }
  }
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return { valid: false, reason: 'json_output' }
  }
  return { valid: true }
}

/** Check if recordObservation was called in this turn's tool calls */
export function wasMemoryPersisted(toolCallsJson: string): boolean {
  try {
    const calls = JSON.parse(toolCallsJson) as Array<{ toolName?: string; name?: string }>
    return calls.some(c => (c.toolName ?? c.name) === 'recordObservation')
  } catch {
    return false
  }
}

/** Score a reply for conversational quality (0-1) */
export function replyQualityScore(replyText: string): number {
  let score = 0.5

  if (/\b(i hear|that sounds|that must|it makes sense)\b/i.test(replyText)) {
    score += 0.15
  }
  if (/\?/.test(replyText)) {
    score += 0.1
  }
  if (/\b(try|consider|option|resource|program|help|support)\b/i.test(replyText)) {
    score += 0.1
  }
  if (replyText.length < 40) {
    score -= 0.2
  }
  if (replyText.length > 600) {
    score -= 0.1
  }

  return Math.max(0, Math.min(1, score))
}

/** Keep fallback repair minimal. */
export function enrichFallbackReply(args: {
  replyText: string
  currentLoop: string
  riskLevel: string
  assessmentOverdue: boolean
  cwbsOverdue?: boolean
  lastOutboundText?: string
}): string {
  const quality = replyQualityScore(args.replyText)
  if (quality >= 0.35) return args.replyText
  return "I'm here with you. Can you say a little more about what's going on?"
}

/** Determine if SDOH6 assessment is overdue (14-day cadence). */
export function isAssessmentOverdue(args: {
  lastAssessmentAt: number | null
  turnsSinceAssessment: number
  now: number
}): boolean {
  const ASSESSMENT_INTERVAL_MS = 14 * 24 * 60 * 60 * 1000
  const TURNS_THRESHOLD = 20

  if (args.lastAssessmentAt === null) {
    return args.turnsSinceAssessment >= 5
  }
  if (args.now - args.lastAssessmentAt > ASSESSMENT_INTERVAL_MS) return true
  if (args.turnsSinceAssessment >= TURNS_THRESHOLD) return true
  return false
}

/** Determine if benefits screening should be suggested. */
export function isBenefitsScreeningDue(args: {
  lastScreenedAt: number | null
  hasState: boolean
  now: number
}): boolean {
  const SCREENING_INTERVAL_MS = 90 * 24 * 60 * 60 * 1000
  if (!args.hasState) return false
  if (args.lastScreenedAt === null) return true
  return args.now - args.lastScreenedAt > SCREENING_INTERVAL_MS
}

/** Determine if CWBS-14 monthly check is overdue (30-day cadence). */
export function isCwbsOverdue(args: { lastCwbsAt: number | null; now: number }): boolean {
  const CWBS_INTERVAL_MS = 30 * 24 * 60 * 60 * 1000
  if (args.lastCwbsAt === null) return false
  return args.now - args.lastCwbsAt > CWBS_INTERVAL_MS
}

/** Determine if SDOH-30 adaptive deep-dive should be suggested. */
export function isSdoh30DeepDiveDue(args: {
  hasSdoh6: boolean
  hasSdoh30: boolean
  flaggedZoneCount: number
}): boolean {
  if (!args.hasSdoh6) return false
  if (args.hasSdoh30) return false
  return args.flaggedZoneCount > 0
}
