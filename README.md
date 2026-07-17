<!-- Diátaxis: reference -->

# GiveCare Tools

> Open-source caregiver social-determinants assessment and scoring toolkit

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

## Overview

GiveCare Tools provides a small, public-safe TypeScript SDK for caregiver SDOH screening and domain-based scoring. It is intentionally narrower than GiveCare's internal production `care-domain` package: no Mira runtime, no benefits catalog, no filing workflow, and no proprietary turn-planning logic.

## Public surface

| Area | Included | Why |
|------|----------|-----|
| **Caregiver SDOH** | GC-SDOH-6, EMA-3, GC-SDOH-30, targeted deep dive | Main open-source contribution |
| **Scoring** | Six-domain model, composite score, bands, trend/spike helpers | Helps teams operationalize caregiver pressure signals |
| **Basic SMS utilities** | STOP/START/HELP parsing, quiet-hours helpers | Safe interoperability primitives |
| **Geo helpers** | ZIP → state, phone area code → timezone | Useful for state/resource routing |

Not included: production benefits data, eligibility filing flows, Mira prompt/runtime, memory, identity, resource orchestration, crisis operations, or clinical decision support.

## Instruments

| Instrument | Questions | Purpose | Time |
|-----------|-----------|---------|------|
| **GC-SDOH-6** | 6 (1 per domain) | Baseline and structural remeasurement | ~2 min |
| **EMA-3** | 3 | Momentary reading (stress/mood/coping) | ~1 min |
| **GC-SDOH-30** | 30-item bank | Four additional questions in one flagged domain | ~1-2 min |

All use a 0-4 response scale. SDOH items are deficit-framed; EMA mood and coping are positively framed. The six caregiver load domains are Social Support (GC1), Physical Health (GC2), Housing & Environment (GC3), Financial Resources (GC4), Navigation (GC5), and Emotional Wellbeing (GC6).

**Documentation:** See [GC-SDOH.md](./GC-SDOH.md) for complete questions, scoring, and implementation details.

This repo is the **canonical owner of the public SDOH instrument definition** — the instrument ids, question prompts, domains, and scale. `npm run export:instruments` emits that shared definition to [`data/instruments-export.json`](./data/instruments-export.json); public distribution copies (e.g. the `givecare-evals` dataset) regenerate or parity-check against it rather than hand-syncing.

## Scoring model

The GiveCare Score is a GC1-GC6 weighted composite. GC-SDOH-6 supplies the structural baseline, a completed targeted GC-SDOH-30 branch refines its matching domain, and EMA-3 updates the current health and emotional-wellbeing domains after that baseline exists. EMA-3 also retains its native reading. Higher values mean lower caregiver pressure.

## Install

Not yet published to the npm registry. Install from source:

```bash
git clone https://github.com/givecareapp/givecare-tools
cd givecare-tools
npm ci && npm run build
```

## Usage

```typescript
import {
  scoreInstrument,
  getInstrument,
  getSdoh30QuestionsForDomains,
  computeGiveCareScoreFromInstruments,
  computeEmaReading,
  flaggedDomains,
} from '@givecare/tools'

// Score GC-SDOH-6
const sdoh6 = scoreInstrument('gc_sdoh6', 'v2', {
  financial: 3,
  social: 2,
  health: 1,
  housing: 0,
  navigation: 2,
  burnout: 3,
})

// Compute composite GiveCare Score (0-100; higher = lower pressure)
const composite = computeGiveCareScoreFromInstruments([
  { instrument: 'gc_sdoh6', subscores: sdoh6.subscores },
])

const emaReading = computeEmaReading({ stress: 2, mood: 3, coping: 2 })

// Adaptive deep-dive: find flagged domains and get remaining targeted questions
const flagged = flaggedDomains(composite.domains) // e.g. ['GC4', 'GC6']
const deepDiveQuestions = getSdoh30QuestionsForDomains(flagged)
```

## Subpath exports

```typescript
import { scoreInstrument } from '@givecare/tools/assessments'
import { computeGiveCareScore } from '@givecare/tools/scoring'
import { parseRegulatoryKeyword } from '@givecare/tools/sms'
import { inferTimezoneFromAreaCode, zipToState } from '@givecare/tools/geo'
import { zipToState as zipToStateOnly } from '@givecare/tools/geo/zip-to-state'
```

## Project structure

```text
src/
  index.ts                       # Public barrel
  assessments/instruments.ts     # GC-SDOH-6, EMA-3, GC-SDOH-30 definitions + scoreInstrument()
  assessments/instrumentExport.ts# buildInstrumentExport() — canonical shared snapshot builder
  scoring/givecareScore.ts       # Domain model, composite scoring, trending, spike detection
  sms/regulatory.ts              # STOP/START/HELP parsing
  sms/quietHours.ts              # Quiet hours enforcement
  geo/timezone.ts                # Area code → timezone inference
  geo/zipToState.ts              # ZIP → US state lookup
  lib/time.ts                    # days() helper
data/
  instruments-export.json        # Canonical shared instrument snapshot (npm run export:instruments)
scripts/
  sync-care-domain.mjs           # Optional public-safe helper drift check
```

## Care-domain sync policy

This public repo owns its runtime surface. The optional sync script only runs when `GIVECARE_CARE_DOMAIN_SRC` points at a reviewed source tree, and it is limited to files that are safe and intentionally open:

- `geo/timezone.ts`
- `geo/zipToState.ts`
- `lib/time.ts`
- `sms/regulatory.ts`

`sms/quietHours.ts` is locally owned in this public package; it is not currently mirrored from `care-domain`.

Run only when comparing against an explicit source tree:

```bash
GIVECARE_CARE_DOMAIN_SRC=/path/to/care-domain/src npm run check:care-domain
GIVECARE_CARE_DOMAIN_SRC=/path/to/care-domain/src npm run sync:care-domain
```

If `GIVECARE_CARE_DOMAIN_SRC` is unset, the drift check skips so the public repo remains usable standalone.

## Use cases

- **Healthcare organizations** — add caregiver SDOH screening to care coordination
- **Non-profits** — identify caregiver pressure domains and route support
- **Research** — study caregiver-specific social determinants patterns
- **Technology platforms** — build caregiver support workflows without adopting GiveCare infra

## Evidence base

- **PRAPARE** — Protocol for Responding to and Assessing Patients' Assets, Risks, and Experiences
- **AHC Screening Tool** — Accountable Health Communities Health-Related Social Needs Screening
- **NAM Framework** — National Academy of Medicine Social Determinants of Health recommendations

This toolkit is not a medical device, diagnostic instrument, crisis service, or eligibility determination engine.

## Citation

Originally created by Ali Madad (@amadad).

```bibtex
@misc{madad_givecare_tools_2026,
  author       = {Ali Madad},
  title        = {{GiveCare Tools}: Open-source frameworks for caregiving support and social determinants of health assessment},
  note         = {GC-SDOH-30 v3.0},
  howpublished = {\url{https://github.com/givecareapp/givecare-tools}},
  year         = {2026}
}
```

## License

MIT. Attribution is requested, not required: credit "GiveCare Tools" and link
to this repository when practical.
