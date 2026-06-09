# givecare-tools Vision

`givecare-tools` is GiveCare's public TypeScript toolkit: the assessment,
scoring, SMS-regulatory, quiet-hours, and geo helper logic that is safe to expose
outside the private product runtime.

This document is the repo's product and agent decision frame. It explains where
the SDK is going, what matters now, and which changes are out of bounds. For
ownership and evaluation contracts, see `CHARTER.md`.

## The Product Bet

`givecare-tools` makes GiveCare's public methods trustworthy by packaging them as
small, tested, zero-I/O functions that developers, evaluators, and standards
efforts can inspect and reuse without depending on private Mira, Convex, or
benefits infrastructure.

The discipline is the product: pure functions, deterministic tests, and a
package boundary kept deliberately narrower than the internal runtime. The bet is
that a small, correct, public SDK strengthens external credibility without
increasing maintenance or privacy risk.

## Current Focus

Priority:

- Public SDOH-6, EMA-3, and SDOH-30 definitions and scoring helpers kept
  consistent with the public spec.
- GiveCare Score zone helpers, composite scoring, trending, and spike detection
  that are public-safe.
- STOP/START/HELP parsing, quiet-hours, and ZIP/state/area-code/timezone helpers.

Next priorities:

- Deliberate, reviewed public-safe extraction from internal code — not automatic
  copying.
- Optional drift checks against explicitly supplied internal source paths.
- Documentation and spec files (`GC-SDOH.md`) that support external reuse and
  standards work.

## Purity Rule

Pure functions, zero I/O, no Convex, no DB, no network, no secrets. Keep the
package narrower than the internal product runtime. Deficit-framed assessment
scoring and P1-P6 zone semantics stay consistent with the public spec. Drift is
evidence only when the source path is explicitly set — never inferred from a
skipped optional check.

## Repo Boundary

`givecare-tools` owns the public assessment/scoring/SMS/geo helper APIs, their
tests, and the SDK boundary. It does not own Mira runtime, benefits screening,
public eval datasets, or web presentation, and it holds no function that needs
private product state. Full ownership matrix is in `CHARTER.md`.

## Source Of Truth

- Public scoring/SMS/geo helper logic is canonical here.
- Private runtime behavior is canonical in `../gc-sms`.
- Public instrument records for distribution live in `../givecare-evals`.
- Benefits logic and records live in `../gc-benefits`.

## Evaluation Loop

Every change should keep the utility genuinely public-safe and reusable, preserve
pure-function behavior and deterministic tests, and keep scoring semantics
aligned with public instruments. Run `npm test` and `npm run ci` before
considering a change done.

## Agent Rules

- Add a function only if it is genuinely public-safe and reusable outside
  GiveCare.
- Never add network, database, or environment-coupled behavior.
- Do not mirror private `gc-sms` internals here.
- Update public docs and tests when public scoring semantics change.
- Treat a skipped optional drift check as no evidence, not as confirmation.

## What Not To Build For Now

- Benefits screening, resource orchestration, journey transitions, risk
  classifiers, prompts, or runtime state.
- Network or database dependencies.
- A mirror of private product internals.
- Public scoring changes without matching docs and tests.

## Read Order

- `VISION.md` → SDK direction, priority frame, and agent guardrails.
- `CHARTER.md` → ownership and evaluation contract.
- `CLAUDE.md` → SDOH SDK, scoring, SMS utilities, and geo helpers.
- `GC-SDOH.md` → public SDOH instrument spec.
- `../VISION.md` → ecosystem direction and cross-repo seams.
