import { describe, it, expect } from 'vitest'
import {
  toBand,
  getConfidence,
  mapEma3ToZones,
  mapSdoh6ToZones,
  mapSdoh30ToZones,
  mapInstrumentToZones,
  mergeZoneData,
  computeZoneScores,
  flaggedZones,
  computeGiveCareScore,
  computeGiveCareScoreFromInstruments,
  computeScoreTrend,
  detectSpike,
  ZONES,
  ZONE_LABELS,
  ZONE_WEIGHTS,
} from '../scoring/givecareScore'

// ---------------------------------------------------------------------------
// toBand
// ---------------------------------------------------------------------------
describe('toBand', () => {
  it('returns strong for score >= 75', () => {
    expect(toBand(75)).toBe('strong')
    expect(toBand(100)).toBe('strong')
  })

  it('returns steady for score 50-74', () => {
    expect(toBand(50)).toBe('steady')
    expect(toBand(74)).toBe('steady')
  })

  it('returns building for score 25-49', () => {
    expect(toBand(25)).toBe('building')
    expect(toBand(49)).toBe('building')
  })

  it('returns needs_attention for score < 25', () => {
    expect(toBand(0)).toBe('needs_attention')
    expect(toBand(24)).toBe('needs_attention')
  })
})

// ---------------------------------------------------------------------------
// getConfidence
// ---------------------------------------------------------------------------
describe('getConfidence', () => {
  it('returns early_estimate for 0 or 1 instruments', () => {
    expect(getConfidence([])).toBe('early_estimate')
    expect(getConfidence(['sdoh6'])).toBe('early_estimate')
  })

  it('returns building for 2 instruments', () => {
    expect(getConfidence(['sdoh6', 'ema3'])).toBe('building')
  })

  it('returns solid for 3+ instruments', () => {
    expect(getConfidence(['sdoh6', 'ema3', 'sdoh30'])).toBe('solid')
    expect(getConfidence(['a', 'b', 'c', 'd'])).toBe('solid')
  })
})

// ---------------------------------------------------------------------------
// Zone constants
// ---------------------------------------------------------------------------
describe('zone constants', () => {
  it('has 6 zones P1-P6', () => {
    expect(ZONES).toEqual(['P1', 'P2', 'P3', 'P4', 'P5', 'P6'])
  })

  it('zone weights sum to 1.0', () => {
    const sum = Object.values(ZONE_WEIGHTS).reduce((a, b) => a + b, 0)
    expect(sum).toBeCloseTo(1.0)
  })

  it('each zone has a label', () => {
    for (const z of ZONES) {
      expect(ZONE_LABELS[z]).toBeTruthy()
    }
  })
})

// ---------------------------------------------------------------------------
// mapEma3ToZones
// ---------------------------------------------------------------------------
describe('mapEma3ToZones', () => {
  it('maps stress to P2 (inverted)', () => {
    // stress=0 → normalizeItem(0,0,4,true) = 1-0 = 1.0
    const data = mapEma3ToZones({ stress: 0 })
    expect(data.P2).toBeDefined()
    expect(data.P2![0].value).toBe(1.0)
    expect(data.P2![0].instrument).toBe('ema3')
  })

  it('maps stress=4 to P2 as 0 (inverted)', () => {
    const data = mapEma3ToZones({ stress: 4 })
    expect(data.P2![0].value).toBe(0)
  })

  it('maps mood and coping to P6 (direct)', () => {
    const data = mapEma3ToZones({ mood: 4, coping: 4 })
    expect(data.P6).toHaveLength(2)
    expect(data.P6![0].value).toBe(1.0) // 4/4 direct
    expect(data.P6![1].value).toBe(1.0)
  })

  it('maps mood=0 and coping=0 to P6 as 0 (direct)', () => {
    const data = mapEma3ToZones({ mood: 0, coping: 0 })
    expect(data.P6![0].value).toBe(0)
    expect(data.P6![1].value).toBe(0)
  })

  it('returns empty for empty subscores', () => {
    const data = mapEma3ToZones({})
    expect(Object.keys(data)).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// mapSdoh6ToZones
// ---------------------------------------------------------------------------
describe('mapSdoh6ToZones', () => {
  it('maps all 6 domains to correct zones (inverted/deficit-framed)', () => {
    const data = mapSdoh6ToZones({
      social: 0, health: 0, housing: 0,
      financial: 0, navigation: 0, burnout: 0,
    })
    // 0 deficit → inverted → 1.0 (good)
    expect(data.P1![0].value).toBe(1.0)
    expect(data.P2![0].value).toBe(1.0)
    expect(data.P3![0].value).toBe(1.0)
    expect(data.P4![0].value).toBe(1.0)
    expect(data.P5![0].value).toBe(1.0)
    expect(data.P6![0].value).toBe(1.0)
  })

  it('max deficit maps to 0', () => {
    const data = mapSdoh6ToZones({
      social: 4, health: 4, housing: 4,
      financial: 4, navigation: 4, burnout: 4,
    })
    for (const z of ZONES) {
      expect(data[z]![0].value).toBe(0)
    }
  })

  it('maps partial subscores', () => {
    const data = mapSdoh6ToZones({ social: 2 })
    expect(data.P1).toBeDefined()
    expect(data.P2).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// mapSdoh30ToZones
// ---------------------------------------------------------------------------
describe('mapSdoh30ToZones', () => {
  it('groups responses by zone prefix', () => {
    const data = mapSdoh30ToZones([
      { questionId: 'P1-1', value: 0 },
      { questionId: 'P1-2', value: 2 },
      { questionId: 'P3-1', value: 4 },
    ])
    expect(data.P1).toHaveLength(2)
    expect(data.P3).toHaveLength(1)
    expect(data.P2).toBeUndefined()
  })

  it('inverts deficit-framed values', () => {
    const data = mapSdoh30ToZones([{ questionId: 'P1-1', value: 0 }])
    // 0 deficit → 1.0 wellbeing
    expect(data.P1![0].value).toBe(1.0)
  })

  it('skips invalid zone prefixes', () => {
    const data = mapSdoh30ToZones([{ questionId: 'XX-1', value: 2 }])
    expect(Object.keys(data)).toHaveLength(0)
  })

  it('returns empty for empty input', () => {
    const data = mapSdoh30ToZones([])
    expect(Object.keys(data)).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// mapInstrumentToZones (router)
// ---------------------------------------------------------------------------
describe('mapInstrumentToZones', () => {
  it('routes ema3', () => {
    const data = mapInstrumentToZones('ema3', { stress: 2 })
    expect(data.P2).toBeDefined()
  })

  it('routes sdoh6', () => {
    const data = mapInstrumentToZones('sdoh6', { social: 1 })
    expect(data.P1).toBeDefined()
  })

  it('routes sdoh30 by converting subscores to responses', () => {
    const data = mapInstrumentToZones('sdoh30', { 'P4-1': 3 })
    expect(data.P4).toBeDefined()
  })

  it('returns empty for unknown instrument', () => {
    const data = mapInstrumentToZones('unknown' as any, {})
    expect(Object.keys(data)).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// mergeZoneData
// ---------------------------------------------------------------------------
describe('mergeZoneData', () => {
  it('merges data from two sources', () => {
    const a = { P1: [{ value: 0.8, instrument: 'sdoh6' }] }
    const b = { P1: [{ value: 0.6, instrument: 'ema3' }], P2: [{ value: 0.5, instrument: 'ema3' }] }
    const merged = mergeZoneData(a, b)
    expect(merged.P1).toHaveLength(2)
    expect(merged.P2).toHaveLength(1)
  })

  it('handles empty sources', () => {
    const merged = mergeZoneData({}, {})
    expect(Object.keys(merged)).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// computeZoneScores
// ---------------------------------------------------------------------------
describe('computeZoneScores', () => {
  it('averages data points and scales to 0-100', () => {
    const data = {
      P1: [{ value: 0.8, instrument: 'a' }, { value: 0.6, instrument: 'b' }],
    }
    const scores = computeZoneScores(data)
    expect(scores.P1).toBe(70) // Math.round(0.7 * 100)
  })

  it('returns empty for no data', () => {
    expect(Object.keys(computeZoneScores({}))).toHaveLength(0)
  })

  it('handles single data point', () => {
    const scores = computeZoneScores({
      P3: [{ value: 1.0, instrument: 'x' }],
    })
    expect(scores.P3).toBe(100)
  })
})

// ---------------------------------------------------------------------------
// flaggedZones
// ---------------------------------------------------------------------------
describe('flaggedZones', () => {
  it('flags zones below threshold (40)', () => {
    const flagged = flaggedZones({ P1: 80, P2: 30, P3: 39 })
    expect(flagged).toContain('P2')
    expect(flagged).toContain('P3')
    expect(flagged).not.toContain('P1')
  })

  it('does not flag zones at exactly 40', () => {
    const flagged = flaggedZones({ P1: 40 })
    expect(flagged).not.toContain('P1')
  })

  it('returns empty when all zones are strong', () => {
    const flagged = flaggedZones({ P1: 90, P2: 80, P3: 70, P4: 60, P5: 50, P6: 40 })
    expect(flagged).toHaveLength(0)
  })

  it('returns empty for empty zone scores', () => {
    expect(flaggedZones({})).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// computeGiveCareScore
// ---------------------------------------------------------------------------
describe('computeGiveCareScore', () => {
  it('computes weighted score', () => {
    // All zones at 80 → weighted average = 80
    const zones = { P1: 80, P2: 80, P3: 80, P4: 80, P5: 80, P6: 80 }
    const result = computeGiveCareScore(zones, ['sdoh6'])
    expect(result.score).toBe(80)
    expect(result.band).toBe('strong')
    expect(result.bandLabel).toBe('Standing strong')
    expect(result.confidence).toBe('early_estimate')
  })

  it('returns 0 when no zones have data', () => {
    const result = computeGiveCareScore({}, [])
    expect(result.score).toBe(0)
  })

  it('separates supports and pressures correctly', () => {
    const zones = { P1: 70, P2: 30, P3: 10, P4: 90 }
    const result = computeGiveCareScore(zones, ['sdoh6', 'ema3'])
    expect(result.supports.map(s => s.zone)).toEqual(expect.arrayContaining(['P1', 'P4']))
    expect(result.pressures.map(p => p.zone)).toEqual(expect.arrayContaining(['P2', 'P3']))
    // pressures sorted ascending
    expect(result.pressures[0].score).toBeLessThanOrEqual(result.pressures[1].score)
    // topPressure is the worst
    expect(result.topPressure!.zone).toBe('P3')
  })

  it('topPressure is null when no pressures', () => {
    const result = computeGiveCareScore({ P1: 80 }, [])
    expect(result.topPressure).toBeNull()
  })

  it('reflects correct confidence level', () => {
    const zones = { P1: 50 }
    expect(computeGiveCareScore(zones, ['sdoh6', 'ema3', 'sdoh30']).confidence).toBe('solid')
    expect(computeGiveCareScore(zones, ['sdoh6', 'ema3']).confidence).toBe('building')
    expect(computeGiveCareScore(zones, ['sdoh6']).confidence).toBe('early_estimate')
  })
})

// ---------------------------------------------------------------------------
// computeGiveCareScoreFromInstruments (full pipeline)
// ---------------------------------------------------------------------------
describe('computeGiveCareScoreFromInstruments', () => {
  it('produces a score from SDOH-6 results', () => {
    const result = computeGiveCareScoreFromInstruments([
      {
        instrument: 'sdoh6',
        subscores: {
          social: 0, health: 0, housing: 0,
          financial: 0, navigation: 0, burnout: 0,
        },
      },
    ])
    // All 0 deficit → all zones = 100
    expect(result.score).toBe(100)
    expect(result.band).toBe('strong')
    expect(result.instruments).toEqual(['sdoh6'])
  })

  it('produces a score combining SDOH-6 and EMA-3', () => {
    const result = computeGiveCareScoreFromInstruments([
      {
        instrument: 'sdoh6',
        subscores: {
          social: 2, health: 2, housing: 2,
          financial: 2, navigation: 2, burnout: 2,
        },
      },
      {
        instrument: 'ema3',
        subscores: { stress: 2, mood: 2, coping: 2 },
      },
    ])
    expect(result.instruments).toEqual(['sdoh6', 'ema3'])
    expect(result.confidence).toBe('building')
    expect(result.score).toBeGreaterThan(0)
    expect(result.score).toBeLessThan(100)
  })

  it('handles empty instrument list', () => {
    const result = computeGiveCareScoreFromInstruments([])
    expect(result.score).toBe(0)
    expect(result.instruments).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// computeScoreTrend
// ---------------------------------------------------------------------------
describe('computeScoreTrend', () => {
  const DAY = 24 * 60 * 60 * 1000
  const NOW = 1_700_000_000_000

  it('returns stable when no history', () => {
    const trend = computeScoreTrend(50, [], NOW)
    expect(trend.direction).toBe('stable')
    expect(trend.delta7d).toBeUndefined()
    expect(trend.delta30d).toBeUndefined()
  })

  it('detects improving trend (delta >= 5)', () => {
    const history = [{ score: 40, computedAt: NOW - 3 * DAY }]
    const trend = computeScoreTrend(50, history, NOW)
    expect(trend.delta7d).toBe(10)
    expect(trend.direction).toBe('improving')
  })

  it('detects declining trend (delta <= -5)', () => {
    const history = [{ score: 60, computedAt: NOW - 3 * DAY }]
    const trend = computeScoreTrend(50, history, NOW)
    expect(trend.delta7d).toBe(-10)
    expect(trend.direction).toBe('declining')
  })

  it('detects stable trend (small delta)', () => {
    const history = [{ score: 48, computedAt: NOW - 3 * DAY }]
    const trend = computeScoreTrend(50, history, NOW)
    expect(trend.delta7d).toBe(2)
    expect(trend.direction).toBe('stable')
  })

  it('uses oldest entry within 7d for delta7d', () => {
    const history = [
      { score: 30, computedAt: NOW - 6 * DAY }, // oldest within 7d
      { score: 40, computedAt: NOW - 2 * DAY },
    ]
    const trend = computeScoreTrend(50, history, NOW)
    expect(trend.delta7d).toBe(20) // 50 - 30
  })

  it('computes delta30d from older entries', () => {
    const history = [
      { score: 20, computedAt: NOW - 20 * DAY },
    ]
    const trend = computeScoreTrend(50, history, NOW)
    expect(trend.delta7d).toBeUndefined() // > 7d ago
    expect(trend.delta30d).toBe(30)
    expect(trend.direction).toBe('improving') // falls back to delta30d
  })
})

// ---------------------------------------------------------------------------
// detectSpike
// ---------------------------------------------------------------------------
describe('detectSpike', () => {
  const DAY = 24 * 60 * 60 * 1000
  const NOW = 1_700_000_000_000

  it('returns null when no recent history', () => {
    expect(detectSpike(50, [], NOW)).toBeNull()
  })

  it('returns null when history is older than 7 days', () => {
    const history = [{ score: 20, computedAt: NOW - 10 * DAY }]
    expect(detectSpike(50, history, NOW)).toBeNull()
  })

  it('detects notable improvement (swing 20-29)', () => {
    const history = [{ score: 30, computedAt: NOW - 3 * DAY }]
    const spike = detectSpike(50, history, NOW)
    expect(spike).not.toBeNull()
    expect(spike!.direction).toBe('improvement')
    expect(spike!.severity).toBe('notable')
    expect(spike!.magnitude).toBe(20)
  })

  it('detects sharp improvement (swing >= 30)', () => {
    const history = [{ score: 20, computedAt: NOW - 3 * DAY }]
    const spike = detectSpike(50, history, NOW)
    expect(spike!.direction).toBe('improvement')
    expect(spike!.severity).toBe('sharp')
    expect(spike!.magnitude).toBe(30)
  })

  it('detects notable decline', () => {
    const history = [{ score: 70, computedAt: NOW - 3 * DAY }]
    const spike = detectSpike(50, history, NOW)
    expect(spike!.direction).toBe('decline')
    expect(spike!.severity).toBe('notable')
  })

  it('detects sharp decline', () => {
    const history = [{ score: 80, computedAt: NOW - 3 * DAY }]
    const spike = detectSpike(50, history, NOW)
    expect(spike!.direction).toBe('decline')
    expect(spike!.severity).toBe('sharp')
  })

  it('returns null for small swings (< 20)', () => {
    const history = [{ score: 40, computedAt: NOW - 3 * DAY }]
    expect(detectSpike(50, history, NOW)).toBeNull()
  })
})
