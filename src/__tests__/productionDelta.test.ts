import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildInstrumentExport } from '../assessments/instrumentExport'

// Guards the production-delta manifest: the PUBLIC side against this repo, and —
// when the ../gc-sms sibling checkout is present — the declared divergences
// against the actual production runtime. gc-sms is read-only here (grep-level
// text assertions; no import of the Convex-coupled module). A new divergence on
// a tracked dimension beyond the manifest fails the test.
const here = path.dirname(fileURLToPath(import.meta.url))

interface Divergence {
  dimension: string
  public: unknown
  production: unknown
  reason: string
}
const manifest = JSON.parse(
  readFileSync(path.resolve(here, '../../data/production-delta.json'), 'utf8'),
) as { divergences: Divergence[] }

function divergence(dimension: string): Divergence {
  const found = manifest.divergences.find(d => d.dimension === dimension)
  if (!found) throw new Error(`production-delta manifest missing dimension: ${dimension}`)
  return found
}

const gcSmsScoringPath = path.resolve(here, '../../../gc-sms/src/scoring.ts')
const siblingPresent = existsSync(gcSmsScoringPath)
const prodSrc = siblingPresent ? readFileSync(gcSmsScoringPath, 'utf8') : ''

describe('production-delta manifest — public side (self-check against this repo)', () => {
  it('public risk band vocabulary is low/moderate/high/critical', () => {
    expect(divergence('risk_band_vocabulary').public).toEqual(['low', 'moderate', 'high', 'critical'])
    expect(divergence('risk_band_vocabulary').production).toEqual(['low', 'moderate', 'high', 'severe'])
  })

  it('public composite is zone-weighted and the export carries the zone weights', () => {
    expect(divergence('composite_weighting').public).toBe('zone_weighted')
    expect(buildInstrumentExport().zoneWeights).toEqual({
      P1: 0.2, P2: 0.2, P3: 0.1, P4: 0.2, P5: 0.1, P6: 0.2,
    })
  })

  it('BSFC-s is genuinely absent from the public toolkit', () => {
    expect(divergence('bsfc_s_instrument').public).toBe('absent')
    const scoringSrc = readFileSync(path.resolve(here, '../scoring/givecareScore.ts'), 'utf8')
    const instrumentsSrc = readFileSync(path.resolve(here, '../assessments/instruments.ts'), 'utf8')
    expect(scoringSrc).not.toMatch(/bsfc/i)
    expect(instrumentsSrc).not.toMatch(/bsfc/i)
  })
})

describe.skipIf(!siblingPresent)('production-delta manifest — production side (../gc-sms)', () => {
  it('production risk bands use "severe", not "critical"', () => {
    expect(prodSrc).toMatch(/"severe"/)
    expect(prodSrc).not.toMatch(/critical/)
  })

  it('production scores BSFC-s (prod-only, licensing-restricted instrument)', () => {
    expect(prodSrc).toMatch(/export function scoreBsfc\b/)
  })

  it('production composite is instrument-weighted, not zone-weighted', () => {
    // per-instrument component weights + renormalization over normalizedRisk
    expect(prodSrc).toMatch(/scoreComponent\(\s*"sdoh6"/)
    expect(prodSrc).toMatch(/normalizedRisk/)
    // and it does NOT reuse the public zone-weight table
    expect(prodSrc).not.toMatch(/ZONE_WEIGHTS/)
  })
})
