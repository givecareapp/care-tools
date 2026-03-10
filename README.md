# GiveCare Tools

> Open-source assessment tools and scoring SDK for caregiving support and social determinants of health

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

## Overview

GiveCare Tools provides assessment instruments, scoring algorithms, and a TypeScript SDK for organizations building caregiving support systems. Used in production by [givecareapp.com](https://givecareapp.com).

## Instruments

| Instrument | Questions | Purpose | Time |
|-----------|-----------|---------|------|
| **SDOH-6** | 6 (1 per zone) | Quick screening, returning users | ~2 min |
| **EMA-3** | 3 | Daily wellbeing micro-check (stress/mood/coping) | ~1 min |
| **SDOH-30** | 30 (5 per zone) | Adaptive deep-dive, flagged zones only | ~5-6 min |

All use a 0-4 deficit-framed scale. Six priority zones: Social Support (P1), Physical Health (P2), Housing & Environment (P3), Financial Resources (P4), Legal & Navigation (P5), Emotional Wellbeing (P6).

**Documentation:** See [GC-SDOH.md](./GC-SDOH.md) for complete questions, scoring, and implementation details.

## Install

```bash
npm install @givecare/tools
```

## Usage

```typescript
import {
  scoreInstrument,
  getInstrument,
  getSdoh30QuestionsForZones,
  computeGiveCareScoreFromInstruments,
  flaggedZones,
} from '@givecare/tools'

// Score an SDOH-6
const sdoh6 = scoreInstrument('sdoh6', 'v1', {
  financial: 3, social: 2, health: 1,
  housing: 0, navigation: 2, burnout: 3,
})
// → { score: 11, maxScore: 24, subscores: {...}, riskBand: 'moderate' }

// Compute composite GiveCare Score (0-100)
const composite = computeGiveCareScoreFromInstruments([
  { instrument: 'sdoh6', subscores: sdoh6.subscores },
  { instrument: 'ema3', subscores: { stress: 2, mood: 3, coping: 2 } },
])
// → { score: 52, band: 'steady', bandLabel: 'Holding steady', zones: {...} }

// Adaptive deep-dive: find flagged zones and get targeted questions
const flagged = flaggedZones(composite.zones) // e.g. ['P4', 'P6']
const deepDiveQuestions = getSdoh30QuestionsForZones(flagged)
```

## Documentation

- [GC-SDOH.md](./GC-SDOH.md) — Full assessment questions, scoring, and guidelines
- [Adaptive Assessment Pattern](./docs/ADAPTIVE-ASSESSMENT-PATTERN.md) — 3-tiered progressive assessment

## Project Structure

```
src/
  index.ts          # Re-exports
  instruments.ts    # SDOH-6, EMA-3, SDOH-30 definitions + scoreInstrument()
  scoring.ts        # Zone model, composite scoring, trending
docs/
  ADAPTIVE-ASSESSMENT-PATTERN.md
GC-SDOH.md          # Complete assessment specification
```

## Use Cases

- **Healthcare Organizations** — Integrate SDOH screening into care coordination
- **Non-Profits** — Identify client needs and connect to resources
- **Research** — Study social determinants in caregiving populations
- **Technology Platforms** — Build caregiving support applications

## Evidence Base

- **PRAPARE** — Protocol for Responding to and Assessing Patients' Assets, Risks, and Experiences
- **AHC Screening Tool** — Accountable Health Communities Health-Related Social Needs Screening
- **NAM Framework** — National Academy of Medicine Social Determinants of Health recommendations

## Contributing

Contributions welcome from developers, healthcare professionals, researchers, social workers, and caregivers. Please open an issue or PR.

## Citation

Originally created by Ali Madad (@amadad).

```bibtex
@misc{madad_givecare_tools_2026,
  author       = {Ali Madad},
  title        = {{GiveCare Tools}: Open-source frameworks for caregiving support and social determinants of health assessment},
  note         = {GC-SDOH-30 v3.0},
  howpublished = {\url{https://github.com/givecareapp/care-tools}},
  year         = {2026}
}
```

## License

MIT. Attribution required — credit "GiveCare Tools" and link to this repository.
