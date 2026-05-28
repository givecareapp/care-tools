# givecare-tools Charter

This charter is an evaluation document, not an operating manual. For the shared
GiveCare North Star, see `~/agents/wiki/givecare-system.md`.

## Purpose

`givecare-tools` is the public TypeScript toolkit for GiveCare's assessment,
scoring, SMS-regulatory, quiet-hours, and geo helper logic that is safe to expose
outside the private product runtime.

## Role In GiveCare

`givecare-tools` belongs to the open-source credibility domain. It packages the
public, reusable parts of GiveCare's caregiver assessment and utility logic so
developers and evaluators can inspect and use them without depending on private
Mira, Convex, or benefits infrastructure.

## Product / System Promise

The repo should make GiveCare's public methods more trustworthy by providing
small, tested, zero-I/O functions. It should support standards work and external
reuse without leaking proprietary runtime behavior or overexpanding into product
logic.

## What This Repo Owns

- Public SDOH-6, EMA-3, and SDOH-30 assessment definitions and scoring helpers.
- GiveCare Score zone helpers, composite scoring, trending, and spike detection
  that are public-safe.
- STOP/START/HELP parsing and quiet-hours utilities.
- ZIP/state and area-code/timezone helper utilities.
- Package build, tests, and public SDK boundaries.

## What This Repo Does Not Own

- Mira runtime, prompts, context assembly, memory, navigation frames, tools, or
  resource orchestration. Those belong in `../gc-sms`.
- Benefits catalog, eligibility screening, and benefits source data. Those belong
  in `../gc-benefits`.
- Public eval dataset packaging. That belongs in `../givecare-evals`.
- Public web presentation. That belongs in `../gc-web`.
- Any function that needs private product state, production data, or caregiver
  records.

## Inputs

- Public assessment specifications and scoring decisions.
- Public-safe utility logic reviewed for extraction from internal code.
- Drift checks against intentionally supplied internal source paths.
- External developer and standards needs that fit the package boundary.

## Outputs

- Built TypeScript package artifacts.
- Public assessment/scoring/SMS/geo helper APIs.
- Tests that prove deterministic behavior.
- Documentation/spec files that support public reuse.

## Core Invariants

- Pure functions, zero I/O, no Convex, no DB, no network, no secrets.
- Keep the package narrower than the internal product runtime.
- Public-safe extraction requires deliberate review, not automatic copying.
- Deficit-framed assessment scoring and P1-P6 zone semantics must stay
  consistent with the public spec.
- Optional drift checks are evidence only when the source path is explicitly set.

## Evaluation Questions

- Is this utility genuinely public-safe and reusable outside GiveCare?
- Does it belong in the SDK, or is it private runtime/product logic?
- Does the change preserve pure-function behavior and deterministic tests?
- Does it keep assessment/scoring semantics aligned with public instruments?
- Would adding this API strengthen external credibility without increasing
  maintenance or privacy risk?

## Anti-Patterns

- Reintroducing benefits screening, resource orchestration, journey transitions,
  risk classifiers, prompts, or runtime state.
- Adding network/database dependencies or environment-coupled behavior.
- Treating this package as a mirror of private `gc-sms` internals.
- Changing public scoring semantics without updating public docs and tests.
- Inferring drift from a skipped optional sync check.

## Related Documents

- `CLAUDE.md`
- `GC-SDOH.md`
- `../givecare-evals/CHARTER.md`
- `~/agents/wiki/givecare-system.md`
