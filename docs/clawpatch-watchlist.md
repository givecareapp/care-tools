# Clawpatch Public SDK Watchlist

Use Clawpatch as a review ledger for the public SDK boundary, not as an
automatic fixer. The goal is to catch public/private leakage, scoring drift,
impure helper behavior, and documentation/test mismatch.

## Operating Rules

- Keep `.clawpatch/` local. Do not commit generated maps, findings, reports, or
  patch attempts.
- Review first. Do not run `clawpatch fix` until a human has triaged the
  finding and picked a scope.
- Public SDK code must stay pure: no Convex, DB, network, secrets, prompts, or
  private caregiver records.
- Optional drift checks are evidence only when `GIVECARE_CARE_DOMAIN_SRC` is
  intentionally set.

## Setup

```bash
clawpatch --version
clawpatch init
clawpatch map --source agent --reasoning-effort low
```

## Canonical Watchlist

| Watch item | Trigger it when changes touch | Ask Clawpatch to look for | Local verification anchors |
| --- | --- | --- | --- |
| Assessment instruments | `src/assessments`, `GC-SDOH.md`, instruments tests | Scoring semantic drift, deficit scale mismatch, public spec not updated, invalid instrument IDs. | `npm test`, `npm run typecheck`. |
| GiveCare Score helpers | `src/scoring`, score tests | Zone semantics drift, composite/trend/spike behavior not documented, private runtime assumptions. | `npm test`, `npm run ci`. |
| SMS utilities | `src/sms`, regulatory and quiet-hours tests | STOP/START/HELP parsing regressions, quiet-hours timezone ambiguity, runtime consent logic leaking from `gc-sms`. | `npm test`. |
| Geo/time helpers | `src/geo`, `src/lib/time.ts`, sync script | Public helper drift, hidden I/O/env dependency, optional sync treated as proof when skipped. | `npm run check:care-domain` with env only when intentional. |
| Public package boundary | `package.json`, README, exports | Exporting private internals, build artifact drift, docs overclaiming product behavior. | `npm run build`, `npm run ci`. |

## Triage

Treat findings as review input. A finding is actionable only after the public API
surface, privacy boundary, and deterministic test are clear.
