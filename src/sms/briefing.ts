/**
 * Pure briefing helpers for weekly SMS updates.
 * No Convex imports. No DB access.
 */

import {
  BAND_LABELS,
  type ZoneCode,
  type GiveCareScoreResult,
  type ScoreTrend,
  type Spike,
} from '../scoring/givecareScore'

const ONE_DAY_MS = 24 * 60 * 60 * 1000
const SEVEN_DAYS_MS = 7 * ONE_DAY_MS

/** Map checkInFrequency preference -> interval in ms. Returns null for 'as_needed'. */
export function getCheckInIntervalMs(frequency?: string | null): number | null {
  switch (frequency) {
    case 'daily':
      return ONE_DAY_MS
    case 'as_needed':
      return null
    case 'weekly':
    default:
      return SEVEN_DAYS_MS
  }
}

export interface LocalResourceHint {
  title: string
  uri: string
  zone: ZoneCode
}

export interface BriefingContext {
  firstName?: string
  gcScore: GiveCareScoreResult
  trend: ScoreTrend
  spike: Spike | null
  localResource?: LocalResourceHint
}

/** Render the weekly briefing SMS body. */
export function renderBriefing(ctx: BriefingContext): string {
  const name = ctx.firstName ? `${ctx.firstName}, here's` : "Here's"
  const { gcScore, trend, spike } = ctx

  const deltaStr = formatDelta(trend.delta7d)
  const scoreLine = `GiveCare Score: ${gcScore.score}${deltaStr}`
  const bandLabel = BAND_LABELS[gcScore.band]
  const improved = pickImprovedZone(gcScore)
  const watchZone = pickWatchZone(gcScore)
  const action = suggestAction(gcScore)

  const spikeNote = spike
    ? spike.direction === 'improvement'
      ? ' Big jump this week!'
      : ' Noticed a dip — checking in.'
    : ''

  const parts = [`${name} your weekly update.`, scoreLine + ` (${bandLabel}).${spikeNote}`]
  if (improved) parts.push(`Improved: ${improved}.`)
  if (watchZone) parts.push(`Watch: ${watchZone}.`)
  if (action) parts.push(`This week: ${action}.`)
  if (ctx.localResource) parts.push(`Near you: ${ctx.localResource.title}.`)
  parts.push("How's today going? (1-5)")

  return parts.join(' ')
}

export function formatDelta(delta?: number): string {
  if (delta === undefined || delta === 0) return ''
  return delta > 0 ? ` (up ${delta})` : ` (down ${Math.abs(delta)})`
}

export function pickImprovedZone(gcScore: GiveCareScoreResult): string | null {
  if (gcScore.supports.length === 0) return null
  return gcScore.supports[0].label
}

export function pickWatchZone(gcScore: GiveCareScoreResult): string | null {
  if (gcScore.pressures.length === 0) return null
  return gcScore.pressures[0].label
}

export function suggestAction(gcScore: GiveCareScoreResult): string | null {
  if (gcScore.pressures.length === 0) return "keep doing what's working"

  const worst = gcScore.pressures[0].zone
  const actions: Record<ZoneCode, string> = {
    P1: 'reach out to one person who gets it',
    P2: 'schedule one rest block for yourself',
    P3: 'check one housing/utility resource',
    P4: 'look into one financial support option',
    P5: 'make one call to sort out a care question',
    P6: 'try one 5-minute stress reset today',
  }
  return actions[worst] ?? null
}
