/**
 * Canonical SMS journey state machine.
 *
 * Pure module — no Convex runtime, no infrastructure imports.
 * Single source of truth for phase transitions, job types, and instruments.
 */

// ---------------------------------------------------------------------------
// Journey phases
// ---------------------------------------------------------------------------

export const JOURNEY_PHASES = [
  'welcome_pending',
  'welcome_sent',
  'welcome_send_failed',
  'consent_pending',
  'consent_granted',
  'bootstrap_started',
  'bootstrap_welcome',
  'bootstrap_situation',
  'bootstrap_timezone',
  'bootstrap_zipcode',
  'activeSupport',
  'stale_wait',
  'opted_out',
  'unreachable',
  'crisis',
] as const

export type JourneyPhase = (typeof JOURNEY_PHASES)[number]

// ---------------------------------------------------------------------------
// Signals (events that trigger transitions)
// ---------------------------------------------------------------------------

export const SIGNALS = [
  'welcome_sent',
  'welcome_failed',
  'consent_received',
  'consent_declined',
  'bootstrap_complete',
  'crisis_detected',
  'assessment_due',
  'benefits_screening_due',
  'stale_timeout',
  'retry_exhausted',
  'reconnect_exhausted',
  'regulatory_stop',
  'regulatory_start',
  'inbound_message',
  'job_fired',
] as const

export type Signal = (typeof SIGNALS)[number]

// ---------------------------------------------------------------------------
// Actions (what the system does in response)
// ---------------------------------------------------------------------------

export const ACTIONS = [
  'sendWelcomeSms',
  'sendCrisisResponse',
  'advancePhase',
  'scheduleJob',
  'escalateToHuman',
  'suppress',
  'logWarning',
  'cancelAllJobs',
  'resumeJourney',
  'replyConsentDeclined',
] as const

export type Action = (typeof ACTIONS)[number]

// ---------------------------------------------------------------------------
// Transition table
// ---------------------------------------------------------------------------

export interface TransitionResult {
  action: Action
  nextPhase: JourneyPhase
  meta?: string
}

const ANY = '*' as const

type TransitionMap = Record<JourneyPhase | typeof ANY, Partial<Record<Signal, TransitionResult>>>

export const TRANSITIONS: TransitionMap = {
  welcome_pending: {
    welcome_sent: { action: 'advancePhase', nextPhase: 'welcome_sent' },
    welcome_failed: { action: 'logWarning', nextPhase: 'welcome_send_failed' },
    stale_timeout: { action: 'scheduleJob', nextPhase: 'stale_wait', meta: 'welcomeRetry' },
    inbound_message: { action: 'advancePhase', nextPhase: 'consent_pending', meta: 'early_reply' },
  },
  welcome_sent: {
    inbound_message: { action: 'advancePhase', nextPhase: 'consent_pending' },
    stale_timeout: { action: 'scheduleJob', nextPhase: 'stale_wait', meta: 'consent_reminder' },
  },
  welcome_send_failed: {
    inbound_message: { action: 'advancePhase', nextPhase: 'consent_pending' },
    retry_exhausted: {
      action: 'logWarning',
      nextPhase: 'welcome_send_failed',
      meta: 'max_retries',
    },
  },
  consent_pending: {
    consent_received: { action: 'advancePhase', nextPhase: 'consent_granted' },
    consent_declined: { action: 'replyConsentDeclined', nextPhase: 'consent_pending' },
    stale_timeout: { action: 'scheduleJob', nextPhase: 'stale_wait', meta: 'consent_reminder' },
  },
  consent_granted: {
    inbound_message: { action: 'advancePhase', nextPhase: 'bootstrap_started' },
  },
  bootstrap_started: {
    inbound_message: { action: 'advancePhase', nextPhase: 'bootstrap_welcome' },
  },
  bootstrap_welcome: {
    inbound_message: { action: 'advancePhase', nextPhase: 'bootstrap_situation' },
  },
  bootstrap_situation: {
    inbound_message: { action: 'advancePhase', nextPhase: 'bootstrap_timezone' },
  },
  bootstrap_timezone: {
    inbound_message: { action: 'advancePhase', nextPhase: 'bootstrap_zipcode' },
  },
  bootstrap_zipcode: {
    bootstrap_complete: { action: 'advancePhase', nextPhase: 'activeSupport' },
    inbound_message: { action: 'advancePhase', nextPhase: 'activeSupport', meta: 'plan_generated' },
  },
  activeSupport: {
    assessment_due: { action: 'scheduleJob', nextPhase: 'activeSupport', meta: 'ema3_or_sdoh6' },
    benefits_screening_due: { action: 'scheduleJob', nextPhase: 'activeSupport', meta: 'benefits' },
    inbound_message: { action: 'advancePhase', nextPhase: 'activeSupport', meta: 'ai_turn' },
    job_fired: { action: 'advancePhase', nextPhase: 'activeSupport', meta: 'scheduled_outbound' },
    stale_timeout: { action: 'scheduleJob', nextPhase: 'stale_wait', meta: 'dormancy' },
  },
  stale_wait: {
    inbound_message: { action: 'advancePhase', nextPhase: 'consent_pending', meta: 'reengagement' },
    retry_exhausted: { action: 'escalateToHuman', nextPhase: 'unreachable' },
    reconnect_exhausted: { action: 'escalateToHuman', nextPhase: 'unreachable' },
  },
  opted_out: {
    regulatory_start: {
      action: 'resumeJourney',
      nextPhase: 'activeSupport',
      meta: 'resume_if_bootstrap_done',
    },
  },
  unreachable: {
    inbound_message: { action: 'resumeJourney', nextPhase: 'consent_pending', meta: 'reconnect' },
  },
  crisis: {
    inbound_message: {
      action: 'advancePhase',
      nextPhase: 'activeSupport',
      meta: 'post_crisis_recovery',
    },
    job_fired: { action: 'advancePhase', nextPhase: 'crisis', meta: 'crisis_followup' },
  },
  [ANY]: {
    crisis_detected: { action: 'sendCrisisResponse', nextPhase: 'crisis' },
    regulatory_stop: { action: 'cancelAllJobs', nextPhase: 'opted_out' },
  },
}

// ---------------------------------------------------------------------------
// Resolver
// ---------------------------------------------------------------------------

const PREEMPTIVE_SIGNALS: ReadonlySet<Signal> = new Set(['crisis_detected', 'regulatory_stop'])

/**
 * Resolve the transition for a given phase + signal.
 *
 * For preemptive signals (crisis, opt-out), wildcards are checked FIRST
 * so phases cannot shadow safety-critical transitions.
 *
 * Returns null for unknown combinations (caller decides fallback).
 */
export function resolveTransition(phase: JourneyPhase, signal: Signal): TransitionResult | null {
  if (PREEMPTIVE_SIGNALS.has(signal)) {
    const wildcardEntry = TRANSITIONS[ANY]?.[signal]
    if (wildcardEntry) return wildcardEntry
  }

  const phaseEntry = TRANSITIONS[phase]?.[signal]
  if (phaseEntry) return phaseEntry

  const wildcardEntry = TRANSITIONS[ANY]?.[signal]
  if (wildcardEntry) return wildcardEntry

  return null
}

// ---------------------------------------------------------------------------
// Job types — single source of truth
// ---------------------------------------------------------------------------

export const SUPPORTED_JOB_TYPES = ['followup', 'weeklyBriefing', 'welcomeRetry'] as const
export type JobType = (typeof SUPPORTED_JOB_TYPES)[number]

// ---------------------------------------------------------------------------
// Instruments — single source of truth
// ---------------------------------------------------------------------------

export const SUPPORTED_INSTRUMENTS = ['bsfc_s', 'sdoh6', 'ema3', 'cwbs14', 'sdoh30'] as const
export type InstrumentKey = (typeof SUPPORTED_INSTRUMENTS)[number]
