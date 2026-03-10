# Codemap

Generated: 2026-03-10

## Architecture

Pure TypeScript domain logic for caregiving platforms. Zero runtime dependencies, zero I/O, zero framework imports. Mirrors the internal `care-domain` package from the GiveCare monorepo, minus the proprietary Mira system prompt.

## Directory Structure

| Path | Purpose | Key Exports |
|------|---------|-------------|
| src/assessments/ | Instrument definitions + scoring | `scoreInstrument()`, `getInstrument()`, `getSdoh30QuestionsForZones()` |
| src/scoring/ | Composite GiveCare Score (0-100) | `computeGiveCareScore()`, `computeGiveCareScoreFromInstruments()`, `detectSpike()` |
| src/benefits/ | Eligibility matching engine | `screenPrograms()`, `suggestNextQuestion()` |
| src/sms/ | SMS domain logic (6 modules) | `assessRisk()`, `composeSmsReply()`, `validateTurnOutcome()`, `renderBriefing()` |
| src/interventions/ | Zone-matched tips | `getInterventionForZone()`, `ZONE_INTERVENTIONS` |
| src/geo/ | Geographic utilities | `inferTimezoneFromAreaCode()`, `zipToState()` |
| src/lib/ | Shared helpers | `days()` |
| src/ | State machine + barrel | `resolveTransition()`, re-exports |

## Entry Points

| Entry | File | Description |
|-------|------|-------------|
| Main | src/index.ts | Star re-exports from all modules |
| Assessments | src/assessments/instruments.ts | Subpath `@givecare/tools/assessments` |
| Scoring | src/scoring/givecareScore.ts | Subpath `@givecare/tools/scoring` |
| Benefits | src/benefits/screener.ts | Subpath `@givecare/tools/benefits` |
| SMS | src/sms/classification.ts | Subpath `@givecare/tools/sms` |
| Transitions | src/transitions.ts | Subpath `@givecare/tools/transitions` |
| Geo | src/geo/timezone.ts | Subpath `@givecare/tools/geo` |

## Data Flow

```
Instrument responses (0-4 deficit scale)
  → scoreInstrument() → subscores per domain
  → mapInstrumentToZones() → normalized 0-1 zone data points
  → mergeZoneData() → combined multi-instrument data
  → computeZoneScores() → zone scores 0-100
  → computeGiveCareScore() → composite score + band + pressures/supports
  → flaggedZones() → zones needing SDOH-30 deep-dive
```

## Key Patterns

- **Zone Model**: Six priority zones P1-P6, weighted 0.1-0.2, scored 0-100
- **Deficit Framing**: Higher raw value = worse outcome, inverted during normalization
- **Instrument Routing**: `mapInstrumentToZones()` dispatches by instrument name to zone mappings
- **State Machine**: 15 journey phases with signal-based transitions, preemptive safety signals
- **Risk Classification**: C-SSRS-aligned tiers (critical/high/medium/low) with `cssrsTier`
- **Schema-agnostic Screening**: Benefits `screenPrograms()` matches `CaregiverFacts` against `EligibilityCriteria[]`

## SMS Module Breakdown

| File | Responsibility |
|------|---------------|
| classification.ts | Risk assessment, consent detection, crisis replies |
| regulatory.ts | STOP/START/HELP/UNSTOP keyword parsing |
| quietHours.ts | Time-based send suppression |
| turnValidator.ts | Reply quality scoring, assessment scheduling |
| briefing.ts | Weekly update SMS rendering |
| bootstrapSteps.ts | Onboarding flow (name, situation, timezone, zip) |

## Common Tasks

| Task | Steps |
|------|-------|
| Add new instrument | 1. Define in `assessments/instruments.ts` 2. Add zone mapping in `scoring/givecareScore.ts` 3. Add to `mapInstrumentToZones()` switch |
| Add new zone | 1. Add to `ZoneCode` type + `ZONES` array 2. Add weight in `ZONE_WEIGHTS` 3. Add label in `ZONE_LABELS` 4. Add intervention in `interventions/tips.ts` |
| Add benefit program | Create `EligibilityCriteria` object, pass to `screenPrograms()` |
| Add journey phase | 1. Add to `JOURNEY_PHASES` 2. Add transition rules in `TRANSITIONS` |
