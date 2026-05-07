# Codemap

Generated: 2026-04-30

## Architecture

Pure TypeScript caregiver SDOH assessment and scoring toolkit. Zero runtime dependencies, zero I/O, zero framework imports. This repo is a public-safe subset of GiveCare domain logic, not a mirror of the production `care-domain` package.

## Directory Structure

| Path | Purpose | Key Exports |
|------|---------|-------------|
| src/assessments/ | Instrument definitions + scoring | `scoreInstrument()`, `getInstrument()`, `getSdoh30QuestionsForZones()` |
| src/scoring/ | Composite GiveCare Score (0-100) | `computeGiveCareScore()`, `computeGiveCareScoreFromInstruments()`, `detectSpike()` |
| src/sms/ | Public SMS interoperability helpers | `parseRegulatoryKeyword()`, `adjustForQuietHours()` |
| src/geo/ | Geographic utilities | `inferTimezoneFromAreaCode()`, `zipToState()` |
| src/lib/ | Shared helpers | `days()` |
| scripts/ | Maintenance scripts | `sync-care-domain.mjs` |

## Entry Points

| Entry | File | Description |
|-------|------|-------------|
| Main | src/index.ts | Public barrel |
| Assessments | src/assessments/instruments.ts | Subpath `@givecare/tools/assessments` |
| Scoring | src/scoring/givecareScore.ts | Subpath `@givecare/tools/scoring` |
| SMS utilities | src/sms/index.ts | Subpath `@givecare/tools/sms` |
| Regulatory SMS | src/sms/regulatory.ts | Subpath `@givecare/tools/sms/regulatory` |
| Quiet hours | src/sms/quietHours.ts | Subpath `@givecare/tools/sms/quiet-hours` |
| Geo timezone | src/geo/timezone.ts | Subpath `@givecare/tools/geo/timezone` |
| ZIP state | src/geo/zipToState.ts | Subpath `@givecare/tools/geo/zip-to-state` |

## Data Flow

```text
Instrument responses (0-4 deficit scale)
  -> scoreInstrument() -> subscores per domain
  -> mapInstrumentToZones() -> normalized 0-1 zone data points
  -> mergeZoneData() -> combined multi-instrument data
  -> computeZoneScores() -> zone scores 0-100
  -> computeGiveCareScore() -> composite score + band + pressures/supports
  -> flaggedZones() -> zones needing SDOH-30 deep-dive
```

## Key Patterns

- **Zone Model**: Six priority zones P1-P6, weighted 0.1-0.2, scored 0-100.
- **Deficit Framing**: Higher raw value = worse outcome, inverted during normalization.
- **Instrument Routing**: `mapInstrumentToZones()` dispatches by instrument name to zone mappings.
- **Adaptive Assessment**: SDOH-6/EMA-3 identify flagged zones; SDOH-30 deepens only flagged zones.
- **Public-Safe Sync**: `scripts/sync-care-domain.mjs` optionally compares basic helpers against `GIVECARE_CARE_DOMAIN_SRC`. Quiet-hours helpers are locally owned in this public package.

## Common Tasks

| Task | Steps |
|------|-------|
| Sync helper drift | Run `GIVECARE_CARE_DOMAIN_SRC=/path/to/care-domain/src npm run check:care-domain` |
| Add new public instrument | 1. Define in `assessments/instruments.ts` 2. Add zone mapping in `scoring/givecareScore.ts` 3. Add to `mapInstrumentToZones()` switch |
| Add new zone | 1. Add to `ZoneCode` + `ZONES` 2. Add weight/label 3. Update instrument mappings and docs |
| Check package | Run `npm test && npm run build` |

## Explicit Non-Goals

- No benefits catalog or eligibility engine.
- No journey state machine.
- No Mira runtime, memory, identity, prompts, or turn planning.
- No crisis classifier or clinical decision support.
