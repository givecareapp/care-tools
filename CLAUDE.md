# GiveCare Tools

Operational guide for the public TypeScript package. Read `VISION.md` for scope.

## Map

- `src/assessments/`: instrument definitions and scoring.
- `src/scoring/`: GiveCare Score helpers.
- `src/sms/`: STOP/START/HELP and quiet hours.
- `src/geo/`: ZIP, state, area-code, and timezone helpers.
- `GC-SDOH.md`: public instrument specification.
- `CODEMAP.md`: entry points and data flow.

```bash
npm run typecheck
npm test
npm run check:care-domain
npm run export:instruments
npm run ci
```

`npm run ci` is the standard gate. Instrument exports feed `gc-evals`; update
the owner here, regenerate, and inspect the data diff. Optional internal drift
checks require explicit source paths and must not become runtime dependencies.
