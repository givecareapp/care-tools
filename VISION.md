# gc-tools Vision

`gc-tools` is GiveCare's public TypeScript toolkit for assessment, scoring, SMS
regulatory behavior, quiet hours, and location helpers.

## Product bet

Small, deterministic functions make GiveCare's public methods inspectable and
reusable without exposing private Mira, Convex, or benefits infrastructure.

## Ownership

This repo owns its public APIs, tests, and package boundary. `gc-sms` owns live
behavior, `gc-evals` owns distributable instrument records, and `gc-benefits`
owns screening and program data.

## Invariants

- Pure functions only: no network, database, secrets, or private product state.
- GC-SDOH scoring, EMA readings, and GC1-GC6 meanings match `GC-SDOH.md`.
- Public changes include matching tests and documentation.
- Internal drift checks use explicit source paths. A skipped optional check is
  not evidence of alignment.
- Public extraction is deliberate; this repo never mirrors `gc-sms` wholesale.

## Current focus

- Stable public assessment definitions and scoring helpers.
- Native EMA-3 readings, trends, and baseline-anchored composite updates.
- STOP/START/HELP, quiet-hours, and geo utilities.

## Non-goals

- Benefits screening or runtime orchestration.
- Prompts, journey state, or private classifiers.
- Public API growth without external reuse.
