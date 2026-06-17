# GC-SDOH-30: GiveCare Social Determinants of Health Assessment

## Overview

The GC-SDOH-30 is a 30-question assessment tool designed to identify social determinants of health impacting caregivers and care recipients. All questions use a consistent 0-4 deficit-framed scale (higher = greater need) across six priority zones with 5 questions each.

Informed by PRAPARE and AHC-HRSN methodology. Administered selectively per flagged zone via the adaptive pattern, not necessarily as a full 30-question battery.

## Assessment Time

- **SDOH-6 (Tier 1):** ~2 minutes (1 question per zone)
- **Deep-Dive (Tier 2):** ~3-4 minutes (flagged zones only)
- **Full SDOH-30 (Tier 3):** ~5-6 minutes (all 30 questions)

## Priority Zones

| Zone | Label | Questions |
|------|-------|-----------|
| P1 | Social Support | 5 (16.7%) |
| P2 | Physical Health | 5 (16.7%) |
| P3 | Housing & Environment | 5 (16.7%) |
| P4 | Financial Resources | 5 (16.7%) |
| P5 | Legal & Navigation | 5 (16.7%) |
| P6 | Emotional Wellbeing | 5 (16.7%) |

## Instruments

### SDOH-6: Six-Domain Snapshot (Tier 1)

Quick screening with one question per zone. Used as default check-in for returning users.

| ID | Domain | Prompt |
|----|--------|--------|
| financial | P4 | How much financial strain is caregiving causing? |
| social | P1 | How often do you feel alone in caregiving? |
| health | P2 | How much has your own health worsened? |
| housing | P3 | How unstable does your home situation feel? |
| navigation | P5 | How hard is it to navigate care systems right now? |
| burnout | P6 | How overwhelmed do you feel today? |

**Scale:** 0 = Not at all | 1 = A little | 2 = Somewhat | 3 = Quite a bit | 4 = Extremely

### EMA-3: Daily Wellbeing Micro-Check

3-item ecological momentary assessment for daily tracking.

| ID | Domain | Prompt | Scale |
|----|--------|--------|-------|
| stress | stress | How stressed do you feel right now? | 0=none, 4=extreme |
| mood | mood | How would you rate your mood right now? | 0=very low, 4=great |
| coping | coping | How well are you coping today? | 0=not at all, 4=very well |

**Zone mapping:** stress → P2 (inverted), mood+coping → P6 (direct)

### SDOH-30: Adaptive Deep-Dive (Tier 2/3)

All questions are deficit-framed on a 0-4 scale (higher = greater need).

---

#### P1: Social Support

| ID | Prompt |
|----|--------|
| P1-1 | How often do you feel you have no one to talk to about caregiving? |
| P1-2 | How hard is it to find someone to step in when you need a break? |
| P1-3 | How often do you feel isolated because of your caregiving role? |
| P1-4 | How difficult is it to ask family or friends for help? |
| P1-5 | How often do you feel you handle everything alone? |

**Zone Resources:** Support groups, counseling services, respite care, community programs, peer support networks

---

#### P2: Physical Health

| ID | Prompt |
|----|--------|
| P2-1 | How much has caregiving worsened your physical health? |
| P2-2 | How often are you too exhausted to take care of yourself? |
| P2-3 | How hard is it to get enough sleep because of caregiving? |
| P2-4 | How often do you skip your own medical appointments? |
| P2-5 | How much does caregiving interfere with eating well or exercising? |

**Zone Resources:** Respite care services, health screenings, sleep hygiene programs, caregiver wellness programs

---

#### P3: Housing & Environment

| ID | Prompt |
|----|--------|
| P3-1 | How unstable does your living situation feel right now? |
| P3-2 | How hard is it to keep up with home repairs or maintenance? |
| P3-3 | How often do safety or accessibility issues at home affect caregiving? |
| P3-4 | How difficult is it to get reliable transportation for care needs? |
| P3-5 | How much does your neighborhood lack services you need? |

**Zone Resources:** Housing assistance programs, home modification services, transportation subsidies

---

#### P4: Financial Resources

| ID | Prompt |
|----|--------|
| P4-1 | How much financial strain is caregiving causing you? |
| P4-2 | How often do costs prevent you from getting needed care help? |
| P4-3 | How hard is it to find affordable caregiving support? |
| P4-4 | How much has caregiving reduced your income or work hours? |
| P4-5 | How worried are you about long-term financial security? |

**Zone Resources:** Financial assistance programs, benefit enrollment, medication assistance, utility assistance

---

#### P5: Legal & Navigation

| ID | Prompt |
|----|--------|
| P5-1 | How hard is it to understand or navigate care system options? |
| P5-2 | How often do confusing rules or paperwork slow you down? |
| P5-3 | How difficult is it to find trustworthy information about benefits? |
| P5-4 | How hard is it to deal with legal, insurance, or government forms? |
| P5-5 | How often do you feel lost trying to coordinate between providers? |

**Zone Resources:** Healthcare navigation support, patient advocacy, legal aid, care coordination services

---

#### P6: Emotional Wellbeing

| ID | Prompt |
|----|--------|
| P6-1 | How overwhelmed do you feel by your caregiving responsibilities? |
| P6-2 | How often do you feel anxious or worried about the future? |
| P6-3 | How hard is it to find time for things that bring you joy? |
| P6-4 | How often do you feel guilty about how you handle caregiving? |
| P6-5 | How much has caregiving affected your sense of who you are? |

**Zone Resources:** Mental health services, emergency planning, stress management, caregiver identity support

---

## Scoring

### Per-Instrument Scoring

All instruments use `scoreInstrument()` which sums raw answers and classifies by ratio:

| Risk Band | Score Ratio |
|-----------|------------|
| Low | < 25% of max |
| Moderate | 25-49% of max |
| High | 50-74% of max |
| Critical | >= 75% of max |

### Composite GiveCare Score (0-100, higher = better)

Zone scores are computed by normalizing and inverting deficit-framed items (0-4 → 1.0-0.0), then averaging per zone. The composite score is a weighted average:

| Zone | Weight |
|------|--------|
| P1: Social Support | 20% |
| P2: Physical Health | 20% |
| P3: Housing & Environment | 10% |
| P4: Financial Resources | 20% |
| P5: Legal & Navigation | 10% |
| P6: Emotional Wellbeing | 20% |

### Bands

| Band | Score Range | Label |
|------|-----------|-------|
| Strong | 75-100 | Standing strong |
| Steady | 50-74 | Holding steady |
| Building | 25-49 | Pushing through |
| Needs Attention | 0-24 | Carrying a lot |

### Confidence

| Instruments Completed | Level |
|----------------------|-------|
| 0-1 | Early estimate |
| 2 | Building |
| 3+ | Solid |

### Adaptive Deep-Dive Trigger

Zones scoring below 40 on the composite scale are flagged for SDOH-30 deep-dive questions.

## Implementation

See [`docs/ADAPTIVE-ASSESSMENT-PATTERN.md`](./docs/ADAPTIVE-ASSESSMENT-PATTERN.md) for the 3-tiered progressive assessment pattern.

### TypeScript SDK

```bash
npm install @givecare/tools
```

```typescript
import { scoreInstrument, computeGiveCareScoreFromInstruments } from '@givecare/tools'

// Score a single instrument
const result = scoreInstrument('sdoh6', 'v1', {
  financial: 3, social: 2, health: 1,
  housing: 0, navigation: 2, burnout: 3,
})
// → { score: 11, maxScore: 24, subscores: {...}, riskBand: 'moderate' }

// Compute composite GiveCare Score
const composite = computeGiveCareScoreFromInstruments([
  { instrument: 'sdoh6', subscores: result.subscores },
  { instrument: 'ema3', subscores: { stress: 2, mood: 3, coping: 2 } },
])
// → { score: 52, band: 'steady', bandLabel: 'Holding steady', ... }
```

## Evidence Base

The GC-SDOH draws from:
- PRAPARE (Protocol for Responding to and Assessing Patients' Assets, Risks, and Experiences)
- AHC (Accountable Health Communities) screening tool
- U.S. Household Food Security Survey Module
- NAM (National Academy of Medicine) SDOH framework
- CDC Social Determinants of Health guidelines

## Updates & Versioning

**Current Version:** 3.0 (GC-SDOH-30)
**Last Updated:** 2026

### Version History
- **v3.0 (GC-SDOH-30):** Aligned with production. Uniform 5 questions per zone, 0-4 deficit-framed scale, TypeScript SDK with scoring algorithms, added EMA-3 instrument
- **v2.0 (GC-SDOH-30):** Streamlined to 30 questions with 1-5 scale, 6 priority zones
- **v1.0 (GC-SDOH-28):** Initial 28-question assessment with 9 domains

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

---

**License:** MIT. Attribution is requested, not required: credit "GiveCare Tools" and link to this repository when practical.
