# GiveCare Tools

Operational guide for the public TypeScript package. Read `VISION.md` for scope.

## Map

- `src/assessments/`: instrument definitions and scoring.
- `src/scoring/`: GiveCare Score helpers.
- `src/sms/`: STOP/START/HELP and quiet hours.
- `src/geo/`: ZIP, state, area-code, and timezone helpers.
- `hound-driver.json`: Hound-owned instrument projection boundary.
- `GC-SDOH.md`: public instrument specification.
- `CODEMAP.md`: entry points and data flow.

```bash
npm run typecheck
npm test
npm run ci
hound driver check --driver hound-driver.json
```

`npm run ci` is the standard gate. Instrument exports feed `gc-evals`. Change
the TypeScript owner first. Then use Hound `corpus.project` to plan, execute,
and verify the exact projection. Consumers bind its verified ArtifactRef.
