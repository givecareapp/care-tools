# GiveCare Tools

> Ecosystem context: see `~/agents/wiki/givecare-system.md` — this repo is in the **open-source credibility** domain.

Open-source caregiver SDOH assessment and scoring toolkit. Pure functions, zero I/O.

## Scope

This repo is intentionally narrower than GiveCare's internal runtime domain logic.

Included:

- SDOH-6, EMA-3, SDOH-30 caregiver assessment instruments
- Six-zone GiveCare Score helpers and adaptive deep-dive routing
- Public-safe SMS utilities: STOP/START/HELP parsing and quiet-hours helpers
- Public-safe geo helpers: ZIP → state and area-code → timezone

Excluded:

- Mira runtime, prompts, turn planning, memory, identity, and resource orchestration
- Benefits catalog, eligibility filing workflows, and review queues
- Crisis operations or clinical decision support

## Structure

| Path | Purpose |
|------|---------|
| src/assessments/instruments.ts | SDOH-6, EMA-3, SDOH-30 definitions + `scoreInstrument()` |
| src/scoring/givecareScore.ts | Zone model, composite GiveCare Score, trending, spike detection |
| src/sms/regulatory.ts | STOP/START/HELP parsing |
| src/sms/quietHours.ts | Quiet hours enforcement |
| src/sms/index.ts | Public SMS utility barrel |
| src/geo/timezone.ts | Area code -> timezone inference |
| src/geo/zipToState.ts | ZIP -> US state lookup |
| src/lib/time.ts | `days()` helper |
| scripts/sync-care-domain.mjs | Optional drift check against an explicitly supplied care-domain source |
| GC-SDOH.md | Full assessment spec |

## Commands

| Task | Command |
|------|---------|
| Optional care-domain drift check | GIVECARE_CARE_DOMAIN_SRC=/path/to/source npm run check:care-domain |
| Build | npm run build |
| Typecheck | npm run typecheck |
| Test | npm test |

## Sync policy

There is no default internal source path. Set `GIVECARE_CARE_DOMAIN_SRC` only when intentionally comparing against a reviewed source tree. The optional sync script is limited to these public-safe files:

- `geo/timezone.ts`
- `geo/zipToState.ts`
- `lib/time.ts`
- `sms/regulatory.ts`

`src/sms/quietHours.ts`, assessment files, and scoring files are public-specific and should be edited deliberately here unless the matching care-domain change is reviewed for public safety.

## Conventions

- Keep this repo public-safe: no Convex, no DB, no Mira runtime, no proprietary prompts.
- Deficit-framed 0-4 scale for all instruments.
- Six zones: P1-P6.
- Do not re-add benefits screening, journey transitions, resource orchestration, or risk classifiers without an explicit public-product decision.
