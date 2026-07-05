import { describe, it, expect } from 'vitest'
import { buildInstrumentExport } from '../assessments/instrumentExport'

// The committed snapshot `data/instruments-export.json` is the canonical shared
// instrument artifact downstream copies gate against (gc-evals validate.py,
// gc-sms production-delta test). It is regenerated with `npm run export:instruments`
// (vitest `-u`) and verified here in `npm run ci`, so a source edit that is not
// re-exported fails the build.
const SNAPSHOT_PATH = '../../data/instruments-export.json'

function serialize(): string {
  return `${JSON.stringify(buildInstrumentExport(), null, 2)}\n`
}

describe('instruments export snapshot', () => {
  it('data/instruments-export.json matches source (run `npm run export:instruments` if this fails)', async () => {
    await expect(serialize()).toMatchFileSnapshot(SNAPSHOT_PATH)
  })

  it('projects all three instruments with ids, prompts, and zones', () => {
    const snap = buildInstrumentExport()
    expect(Object.keys(snap.instruments)).toEqual(['sdoh6', 'ema3', 'sdoh30'])
    expect(snap.instruments.sdoh6).toHaveLength(6)
    expect(snap.instruments.ema3).toHaveLength(3)
    expect(snap.instruments.sdoh30).toHaveLength(30)
    // SDOH-6 and SDOH-30 are zone-anchored; EMA-3 is multi-mapped and carries none.
    expect(snap.instruments.sdoh6.every(q => q.zone !== undefined)).toBe(true)
    expect(snap.instruments.sdoh30.every(q => q.zone !== undefined)).toBe(true)
    expect(snap.instruments.ema3.every(q => q.zone === undefined)).toBe(true)
    expect(snap.zoneWeights).toEqual({ P1: 0.2, P2: 0.2, P3: 0.1, P4: 0.2, P5: 0.1, P6: 0.2 })
  })
})
