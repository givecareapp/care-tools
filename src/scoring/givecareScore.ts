import type { InstrumentName, ZoneCode } from '../assessments/instruments'
import { days } from '../lib/time'

export type { ZoneCode }

export const ZONES: ZoneCode[] = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6']

export const ZONE_LABELS: Record<ZoneCode, string> = {
  P1: 'Social Support',
  P2: 'Physical Health',
  P3: 'Housing & Environment',
  P4: 'Financial Resources',
  P5: 'Legal & Navigation',
  P6: 'Emotional Wellbeing',
}

export const ZONE_WEIGHTS: Record<ZoneCode, number> = {
  P1: 0.2,
  P2: 0.2,
  P3: 0.1,
  P4: 0.2,
  P5: 0.1,
  P6: 0.2,
}

export type Band = 'strong' | 'steady' | 'building' | 'needs_attention'

export const BAND_LABELS: Record<Band, string> = {
  strong: 'Standing strong',
  steady: 'Holding steady',
  building: 'Pushing through',
  needs_attention: 'Carrying a lot',
}

export function toBand(score: number): Band {
  if (score >= 75) return 'strong'
  if (score >= 50) return 'steady'
  if (score >= 25) return 'building'
  return 'needs_attention'
}

export type ConfidenceLevel = 'early_estimate' | 'building' | 'solid'

export function getConfidence(completedInstruments: string[]): ConfidenceLevel {
  const count = completedInstruments.length
  if (count <= 1) return 'early_estimate'
  if (count === 2) return 'building'
  return 'solid'
}

export interface ZoneDataPoint {
  value: number // normalized 0-1
  instrument: string
}

export type ZoneScores = Partial<Record<ZoneCode, number>>
export type ZoneData = Partial<Record<ZoneCode, ZoneDataPoint[]>>

function normalizeItem(raw: number, min: number, max: number, invert: boolean): number {
  const range = max - min
  if (range === 0) return 0
  const normalized = (raw - min) / range
  const clamped = Math.max(0, Math.min(1, normalized))
  return invert ? 1 - clamped : clamped
}

/** Map EMA-3 subscores to zones. stress → P2 (inverted), mood+coping → P6 (direct) */
export function mapEma3ToZones(subscores: Record<string, number>): ZoneData {
  const data: ZoneData = {}
  if (subscores.stress !== undefined) {
    data.P2 = [{ value: normalizeItem(subscores.stress, 0, 4, true), instrument: 'ema3' }]
  }
  const p6Items: ZoneDataPoint[] = []
  if (subscores.mood !== undefined) {
    p6Items.push({ value: normalizeItem(subscores.mood, 0, 4, false), instrument: 'ema3' })
  }
  if (subscores.coping !== undefined) {
    p6Items.push({ value: normalizeItem(subscores.coping, 0, 4, false), instrument: 'ema3' })
  }
  if (p6Items.length > 0) data.P6 = p6Items
  return data
}

/** Map SDOH-6 subscores to zones. Deficit-framed (higher raw = worse). */
export function mapSdoh6ToZones(subscores: Record<string, number>): ZoneData {
  const data: ZoneData = {}
  const mappings: Array<{ key: string; zone: ZoneCode }> = [
    { key: 'social', zone: 'P1' },
    { key: 'health', zone: 'P2' },
    { key: 'housing', zone: 'P3' },
    { key: 'financial', zone: 'P4' },
    { key: 'navigation', zone: 'P5' },
    { key: 'burnout', zone: 'P6' },
  ]
  for (const { key, zone } of mappings) {
    if (subscores[key] !== undefined) {
      data[zone] = [{ value: normalizeItem(subscores[key], 0, 4, true), instrument: 'sdoh6' }]
    }
  }
  return data
}

/** Map SDOH-30 deep-dive responses to zone data points. Deficit-framed 0-4. */
export function mapSdoh30ToZones(
  responses: Array<{ questionId: string; value: number }>
): ZoneData {
  const data: ZoneData = {}
  for (const { questionId, value } of responses) {
    const zone = questionId.split('-')[0] as ZoneCode
    if (!ZONES.includes(zone)) continue
    const normalized = normalizeItem(value, 0, 4, true)
    if (!data[zone]) data[zone] = []
    data[zone].push({ value: normalized, instrument: 'sdoh30' })
  }
  return data
}

/** Route any instrument's subscores to the zone model. */
export function mapInstrumentToZones(
  instrument: InstrumentName,
  subscores: Record<string, number>
): ZoneData {
  switch (instrument) {
    case 'ema3':
      return mapEma3ToZones(subscores)
    case 'sdoh6':
      return mapSdoh6ToZones(subscores)
    case 'sdoh30':
      return mapSdoh30ToZones(
        Object.entries(subscores).map(([questionId, value]) => ({ questionId, value }))
      )
    default:
      return {}
  }
}

/** Merge multiple ZoneData sources, concatenating data points per zone. */
export function mergeZoneData(...sources: ZoneData[]): ZoneData {
  const merged: ZoneData = {}
  for (const source of sources) {
    for (const zone of ZONES) {
      const points = source[zone]
      if (!points || points.length === 0) continue
      if (!merged[zone]) merged[zone] = []
      merged[zone]!.push(...points)
    }
  }
  return merged
}

/** Compute zone scores (0-100) from merged zone data by averaging data points. */
export function computeZoneScores(data: ZoneData): ZoneScores {
  const scores: ZoneScores = {}
  for (const zone of ZONES) {
    const points = data[zone]
    if (!points || points.length === 0) continue
    const avg = points.reduce((sum, p) => sum + p.value, 0) / points.length
    scores[zone] = Math.round(avg * 100)
  }
  return scores
}

const ZONE_FLAG_THRESHOLD = 40

/** Identify zones from SDOH-6 results that need deeper assessment. */
export function flaggedZones(zoneScores: ZoneScores): ZoneCode[] {
  return ZONES.filter(zone => {
    const score = zoneScores[zone]
    return score !== undefined && score < ZONE_FLAG_THRESHOLD
  })
}

export interface GiveCareScoreResult {
  score: number
  band: Band
  bandLabel: string
  confidence: ConfidenceLevel
  instruments: string[]
  zones: ZoneScores
  supports: Array<{ zone: ZoneCode; label: string; score: number }>
  pressures: Array<{ zone: ZoneCode; label: string; score: number }>
  topPressure: { zone: ZoneCode; label: string; score: number } | null
}

export function computeGiveCareScore(
  zones: ZoneScores,
  instruments: string[]
): GiveCareScoreResult {
  let weightedSum = 0
  let totalWeight = 0

  for (const zone of ZONES) {
    const zoneScore = zones[zone]
    if (zoneScore === undefined) continue
    weightedSum += zoneScore * ZONE_WEIGHTS[zone]
    totalWeight += ZONE_WEIGHTS[zone]
  }

  const score = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0
  const band = toBand(score)
  const confidence = getConfidence(instruments)

  const supports: GiveCareScoreResult['supports'] = []
  const pressures: GiveCareScoreResult['pressures'] = []

  for (const zone of ZONES) {
    const zoneScore = zones[zone]
    if (zoneScore === undefined) continue
    const entry = { zone, label: ZONE_LABELS[zone], score: zoneScore }
    if (zoneScore >= 50) {
      supports.push(entry)
    } else {
      pressures.push(entry)
    }
  }

  pressures.sort((a, b) => a.score - b.score)
  supports.sort((a, b) => b.score - a.score)

  return {
    score,
    band,
    bandLabel: BAND_LABELS[band],
    confidence,
    instruments,
    zones,
    supports,
    pressures,
    topPressure: pressures.length > 0 ? pressures[0] : null,
  }
}

export interface InstrumentResult {
  instrument: InstrumentName
  subscores: Record<string, number>
}

/** Full pipeline: instrument results → GiveCare Score. */
export function computeGiveCareScoreFromInstruments(
  instrumentResults: InstrumentResult[]
): GiveCareScoreResult {
  const zoneSources: ZoneData[] = []
  const instruments: string[] = []

  for (const result of instrumentResults) {
    const zoneData = mapInstrumentToZones(result.instrument, result.subscores)
    if (Object.keys(zoneData).length > 0) {
      zoneSources.push(zoneData)
      if (!instruments.includes(result.instrument)) {
        instruments.push(result.instrument)
      }
    }
  }

  const merged = mergeZoneData(...zoneSources)
  const zoneScores = computeZoneScores(merged)
  return computeGiveCareScore(zoneScores, instruments)
}

export type TrendDirection = 'improving' | 'stable' | 'declining'

export interface ScoreTrend {
  delta7d?: number
  delta30d?: number
  direction: TrendDirection
}

const MS_PER_DAY = days(1)

function historyWithinDays(
  history: Array<{ score: number; computedAt: number }>,
  effectiveNow: number,
  daysBack: number
): Array<{ score: number; computedAt: number }> {
  const cutoff = effectiveNow - daysBack * MS_PER_DAY
  return history
    .filter(entry => entry.computedAt >= cutoff && entry.computedAt <= effectiveNow)
    .sort((a, b) => a.computedAt - b.computedAt)
}

export function computeScoreTrend(
  current: number,
  history: Array<{ score: number; computedAt: number }>,
  now?: number
): ScoreTrend {
  const effectiveNow = now ?? Date.now()

  const within7d = historyWithinDays(history, effectiveNow, 7)
  const within30d = historyWithinDays(history, effectiveNow, 30)

  const delta7d = within7d.length > 0 ? current - within7d[0].score : undefined
  const delta30d = within30d.length > 0 ? current - within30d[0].score : undefined

  const recentDelta = delta7d ?? delta30d ?? 0
  const direction: TrendDirection =
    recentDelta >= 5 ? 'improving' : recentDelta <= -5 ? 'declining' : 'stable'

  return { delta7d, delta30d, direction }
}

export interface Spike {
  magnitude: number
  direction: 'improvement' | 'decline'
  severity: 'sharp' | 'notable'
}

export function detectSpike(
  current: number,
  history: Array<{ score: number; computedAt: number }>,
  now?: number
): Spike | null {
  const effectiveNow = now ?? Date.now()
  const recent = historyWithinDays(history, effectiveNow, 7)

  if (recent.length === 0) return null

  const oldest = recent[0].score
  const swing = current - oldest

  if (Math.abs(swing) >= 20) {
    return {
      magnitude: Math.abs(swing),
      direction: swing > 0 ? 'improvement' : 'decline',
      severity: Math.abs(swing) >= 30 ? 'sharp' : 'notable',
    }
  }
  return null
}
