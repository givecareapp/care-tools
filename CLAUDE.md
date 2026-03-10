# GiveCare Tools

TypeScript SDK for caregiver SDOH assessment and scoring.

## Structure

| Path | Purpose |
|------|---------|
| src/instruments.ts | SDOH-6, EMA-3, SDOH-30 definitions + scoreInstrument() |
| src/scoring.ts | Zone model, composite GiveCare Score, trending |
| src/index.ts | Re-exports |
| GC-SDOH.md | Full assessment spec |
| docs/ | Adaptive assessment pattern |

## Commands

| Task | Command |
|------|---------|
| Build | npm run build |
| Typecheck | npx tsc --noEmit |
