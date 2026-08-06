# Changelog

All notable changes to `@givecare/tools` are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- **gc-tools is now the declared canonical owner of the public SDOH instrument
  definition** (ids, question prompts, domains, scale, and composite scoring
  semantics). Downstream copies gate against this repo instead of being
  hand-synced. Root `VISION.md` ownership table updated to match.

### Added

- Hound `corpus.project` is the only supported writer for the canonical shared
  instrument snapshot at `data/instruments-export.json`. It binds exact bytes,
  mode, and SHA-256 in its plan and verified run. It emits a public
  `givecare.artifact-ref/v1` for consumers. The public sibling
  `../gc-evals` syncs the exact verified artifact before adding its local
  packaging overlay.
- `src/assessments/instrumentExport.ts` — `buildInstrumentExport()`, the single
  builder behind the snapshot.

## [3.0.0]

Baseline of the public `@givecare/tools` SDK:

- SDOH-6, EMA-3, and SDOH-30 caregiver assessment instruments with
  `scoreInstrument()` and adaptive deep-dive routing.
- Six-zone GiveCare Score model: composite scoring, bands, trend, and spike
  detection.
- Public-safe SMS utilities (STOP/START/HELP parsing, quiet-hours helpers).
- Public-safe geo helpers (ZIP → state, area code → timezone).
- Pure functions, zero I/O; MIT-licensed.
