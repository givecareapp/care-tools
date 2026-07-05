# Changelog

All notable changes to `@givecare/tools` are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- **gc-tools is now the declared canonical owner of the public SDOH instrument
  definition** (ids, question prompts, zones, scale, and composite scoring
  semantics). Downstream copies gate against this repo instead of being
  hand-synced. Root `VISION.md` ownership table updated to match.

### Added

- `npm run export:instruments` emits the canonical shared instrument snapshot to
  `data/instruments-export.json` (deterministic, offline). The public sibling
  `../gc-evals` parity-checks its distribution record against this file; freshness
  is pinned by `npm run ci`.
- `src/assessments/instrumentExport.ts` — `buildInstrumentExport()`, the single
  builder behind the snapshot.
- `data/production-delta.json` — the manifest of known, intentional divergences
  between this public definition and the GiveCare production runtime
  (`../gc-sms`): risk-band label `critical` (public) vs `severe` (production),
  zone-weighted (public) vs instrument-weighted (production) composite, and the
  BSFC-s instrument (production-only, licensing-restricted). Verified against the
  sibling by `src/__tests__/productionDelta.test.ts`.
- `SDOH6_ZONE_MAP` exported from `src/scoring/givecareScore.ts` — one canonical
  SDOH-6 item → zone decision site, shared by `mapSdoh6ToZones` and the export.
- README "Public vs production scoring" section.

## [3.0.0]

Baseline of the public `@givecare/tools` SDK:

- SDOH-6, EMA-3, and SDOH-30 caregiver assessment instruments with
  `scoreInstrument()` and adaptive deep-dive routing.
- Six-zone GiveCare Score model: composite scoring, bands, trend, and spike
  detection.
- Public-safe SMS utilities (STOP/START/HELP parsing, quiet-hours helpers).
- Public-safe geo helpers (ZIP → state, area code → timezone).
- Pure functions, zero I/O; MIT-licensed.
