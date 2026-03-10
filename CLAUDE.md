# GiveCare Tools

Open-source caregiving domain logic SDK. Pure functions, zero I/O.

## Structure

| Path | Purpose |
|------|---------|
| src/assessments/instruments.ts | SDOH-6, EMA-3, SDOH-30 definitions + scoreInstrument() |
| src/scoring/givecareScore.ts | Zone model, composite GiveCare Score, trending, spike detection |
| src/benefits/screener.ts | Schema-agnostic eligibility matching |
| src/sms/classification.ts | C-SSRS risk tiers, consent, crisis replies |
| src/sms/regulatory.ts | STOP/START/HELP parsing |
| src/sms/quietHours.ts | Quiet hours enforcement |
| src/sms/turnValidator.ts | Reply quality + assessment scheduling |
| src/sms/briefing.ts | Weekly briefing SMS renderer |
| src/sms/bootstrapSteps.ts | Onboarding state machine |
| src/transitions.ts | Journey phase state machine (15 phases) |
| src/interventions/tips.ts | Zone-matched intervention bank |
| src/geo/timezone.ts | Area code -> timezone inference |
| src/geo/zipToState.ts | ZIP -> US state lookup |
| src/lib/time.ts | days() helper |
| src/index.ts | Star re-exports |
| GC-SDOH.md | Full assessment spec |

## Commands

| Task | Command |
|------|---------|
| Build | npm run build |
| Typecheck | npx tsc --noEmit |

## Conventions

- Pure domain logic only — no Convex, no DB, no I/O
- Deficit-framed 0-4 scale for all instruments
- Six zones: P1-P6
- Mira system prompt is proprietary and excluded
