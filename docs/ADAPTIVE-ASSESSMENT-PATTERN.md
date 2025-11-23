# Adaptive Assessment Pattern for GC-SDOH-30

## Overview

This document describes a 3-tiered adaptive assessment pattern that reduces assessment time by 60%+ for users with low-risk profiles while maintaining data quality for those who need more detailed evaluation.

## Problem Statement

While comprehensive assessments like the GC-SDOH-30 provide valuable insights, they can be time-consuming for users who have stable conditions across most domains. The adaptive pattern addresses this by:

- Starting with a quick screening for returning users
- Targeting detailed questions only to areas that show elevated need
- Maintaining comprehensive baseline assessments for initial evaluations

## Architecture: 3-Tiered Progressive Assessment

### Tier 1: SDOH-Quick-6 (2 minutes)

**Purpose:** Fast screening to identify problem zones

**Structure:**
- 6 questions total (1 per priority zone)
- Uses highest item-total correlation questions from each zone
- Default starting point for returning users

**Question Selection Criteria:**
Select the question from each zone that has the highest correlation with the total zone score from validation data:

- **P1 (Social Support):** Choose question with strongest correlation to social support needs
- **P2 (Physical Health):** Choose question with strongest correlation to physical wellbeing
- **P3 (Housing):** Choose question with strongest correlation to housing stability
- **P4 (Financial):** Choose question with strongest correlation to financial resources
- **P5 (Legal/Navigation):** Choose question with strongest correlation to navigation ability
- **P6 (Emotional):** Choose question with strongest correlation to emotional wellbeing

**Scoring:**
- Calculate preliminary zone scores (1 data point per zone, confidence = 1/N where N is total questions in zone)
- Flag zones with scores >50 (on normalized 0-100 scale) for deep dive

### Tier 2: SDOH-Deep-Dive (3-4 minutes)

**Purpose:** Targeted detail gathering for flagged zones

**Structure:**
- Dynamic question set based on Quick-6 results
- 3-4 questions per flagged zone only
- Skips zones that scored <50 in Quick-6

**Question Selection:**
For each flagged zone, select 3-4 additional questions that:
1. Weren't asked in Quick-6
2. Provide maximum additional information (highest item-remainder correlation)
3. Cover different aspects of the zone

**Example Deep-Dive Sets:**

**P1 Deep Dive (4 questions):**
- Questions 2, 4, 6, 8 from original P1 set (if Q1 was used in Quick-6)

**P2 Deep Dive (2 questions):**
- Both questions (Q29, Q30) if not already in Quick-6

**P3 Deep Dive (3 questions):**
- Questions covering stability, safety, and adequacy

**P4 Deep Dive (4 questions):**
- Questions covering healthcare costs, basic needs, utilities, transportation

**P5 Deep Dive (3 questions):**
- Questions covering communication, coordination, legal preparedness

**P6 Deep Dive (2 questions):**
- Both questions if not already in Quick-6

**Scoring:**
- Combine Quick-6 and Deep-Dive responses
- Calculate updated zone scores with higher confidence
- Generate zone-specific recommendations

### Tier 3: SDOH-30 Comprehensive (5-6 minutes)

**Purpose:** Complete baseline assessment and periodic comprehensive evaluation

**Structure:**
- All 30 questions from GC-SDOH-30
- Used for initial assessments (need baseline)
- Recommended monthly for ongoing monitoring

**When to Use:**
- First-time assessment (always)
- Monthly comprehensive check-in
- After major life changes
- When user requests full assessment

## Decision Logic

```
START
│
├─ First assessment?
│  ├─ YES → SDOH-30 Comprehensive
│  └─ NO → Continue
│
├─ Monthly check-in due?
│  ├─ YES → Offer SDOH-30 Comprehensive
│  └─ NO → Continue
│
├─ Major life change reported?
│  ├─ YES → Offer SDOH-30 Comprehensive
│  └─ NO → Continue
│
└─ Regular check-in:
   │
   ├─ Step 1: Administer SDOH-Quick-6
   │
   ├─ Step 2: Calculate zone scores
   │
   ├─ Step 3: Any zone score >50?
   │  │
   │  ├─ YES → Offer Deep Dive
   │  │   │
   │  │   ├─ "I see [zone names] could use more attention."
   │  │   ├─ "May I ask 3-4 more questions about these areas
   │  │   │   for better recommendations?"
   │  │   │
   │  │   ├─ User accepts?
   │  │   │  ├─ YES → Administer Deep Dive for flagged zones
   │  │   │  └─ NO → Complete with Quick-6 data only
   │  │   │
   │  │   └─ Calculate final scores
   │  │
   │  └─ NO → Complete (all zones <50)
   │      │
   │      └─ "Great news! Everything looks stable today."
```

## Implementation Considerations

### Data Quality

**Confidence Scoring:**
- Track how many questions were answered per zone
- Store confidence level with each zone score
- Example: P1 with 1/8 questions = 12.5% confidence

**Score Adjustment:**
- Quick-6 only: Lower confidence, wider margin of error
- Deep-Dive: Higher confidence for specific zones
- Comprehensive: Highest confidence across all zones

**Validation:**
Recommend parallel testing period:
1. Administer both Quick-6 and full SDOH-30 to sample population
2. Compare zone scores from Quick-6 vs. full assessment
3. Validate that Quick-6 correctly identifies high-risk zones (sensitivity >85%)
4. Ensure low false-negative rate (<10%)

### User Experience

**Messaging:**
- **Quick-6 Introduction:** "Quick check-in time! Just 6 questions today."
- **Deep-Dive Offer:** "I notice [zones] might need support. May I ask a few more questions for better recommendations?"
- **Optional:** Always make Deep-Dive optional, frame as benefit
- **Completion:** "All done! Based on your responses, here are some resources..."

**Timing:**
- Quick-6: ~30 seconds per question = 3 minutes total (with reading time)
- Deep-Dive: ~30-45 seconds per question = 2-3 minutes for 4 questions
- Total time saved: 60-70% for low-risk users

### Privacy & Consent

**Informed Consent:**
- Explain adaptive assessment approach
- Clarify that fewer questions may mean less detailed recommendations
- Allow user to request full assessment at any time

**Data Storage:**
- Link Deep-Dive responses to originating Quick-6 assessment
- Store assessment chain for audit trail
- Track which tier was used for each assessment

## Success Metrics

### Completion Rates
- Target: >85% (vs. ~70% for full SDOH-30)
- Track by tier: Quick-6, Deep-Dive acceptance, Full completion

### Time Efficiency
- Average time saved per assessment
- Target: 60%+ reduction for users scoring <50 on all zones

### Data Quality
- Zone score correlation: Quick-6 vs. Full assessment
- Target: r >0.85 for zone identification
- False negative rate: <10%

### User Satisfaction
- Survey: "The assessment length felt appropriate" (agree/strongly agree)
- NPS score for assessment experience
- Voluntary full assessment requests (should be <15%)

## Risk Mitigation

### Risk 1: Quick-6 Misses High-Need Zone

**Mitigation:**
- Validate question selection using item-total correlation from pilot data
- Choose questions with highest predictive power
- Monitor false-negative rate in production
- Adjust threshold if needed (lower from 50 to 45)

### Risk 2: Users Skip Deep-Dive

**Mitigation:**
- Frame as "better recommendations" not "more burden"
- Keep truly optional
- Track Deep-Dive acceptance rate
- If <50%, revise messaging or auto-trigger for very high scores (>70)

### Risk 3: Score Inconsistency

**Mitigation:**
- Run parallel testing for 2-4 weeks
- Document expected confidence intervals by tier
- Provide score range (±5 points) for Quick-6 results
- Recommend full assessment for borderline cases

### Risk 4: Loss of Longitudinal Data

**Mitigation:**
- Ensure monthly comprehensive assessments
- Store all historical assessment data
- Calculate trend scores using time-weighted averaging
- Alert if user hasn't completed comprehensive in >60 days

## Implementation Roadmap

### Phase 1: Assessment Definition (Week 1)
- Define SDOH-Quick-6 question set
- Create Deep-Dive question pools per zone
- Update assessment validators

### Phase 2: Decision Logic (Week 1-2)
- Implement zone risk detection
- Create Deep-Dive triggering logic
- Build question selection algorithms

### Phase 3: Scoring System (Week 2)
- Implement confidence scoring
- Handle partial zone data
- Merge Quick-6 and Deep-Dive results

### Phase 4: Testing & Validation (Week 2-3)
- Unit tests for all scoring logic
- Integration tests for assessment flows
- Parallel testing with sample users

### Phase 5: Rollout (Week 3-4)
- Deploy with feature flag
- Beta test with 5-10 users
- Monitor metrics
- Gradual rollout to 25%, then 100%

## Technical Specifications

### Assessment Type Identifiers
- `sdoh_quick`: Quick-6 screening
- `sdoh_deep`: Deep-Dive targeted assessment
- `sdoh`: Full SDOH-30 comprehensive

### Data Schema Requirements

**Assessments Table:**
- `type`: Assessment type identifier
- `parentAssessmentId`: Links Deep-Dive to Quick-6
- `zonesFlagged`: Array of zone IDs that triggered Deep-Dive

**Scores Table:**
- `instrument`: Assessment type used
- `confidence`: Confidence level per zone (0-1)
- `answeredRatio`: Questions answered / total questions per zone

**Assessment Sessions Table:**
- `assessmentType`: Current tier being administered
- `deepDiveZones`: Zones requiring Deep-Dive
- `deepDiveOffered`: Boolean
- `deepDiveAccepted`: Boolean

### Scoring Formulas

**Zone Score (Quick-6):**
```
score = (answer - 1) / 4 * 100  // Convert 1-5 to 0-100
confidence = 1 / totalQuestionsInZone
```

**Zone Score (Deep-Dive):**
```
quickAnswer = quickScreenResponses[zone]
deepAnswers = deepDiveResponses[zone]
allAnswers = [quickAnswer, ...deepAnswers]
score = mean(allAnswers.map(a => (a - 1) / 4 * 100))
confidence = allAnswers.length / totalQuestionsInZone
```

**Risk Threshold:**
```
if (zoneScore > 50 && confidence < 0.5) {
  flagForDeepDive = true
}
```

## Example User Flows

### Flow 1: Low-Risk User
1. User starts check-in
2. System: "Quick 6-question check-in today!"
3. User completes Quick-6 (2 minutes)
4. All zones score <50
5. System: "Great! Everything looks stable. Here are your resources."
6. **Time saved: 3-4 minutes**

### Flow 2: Mixed-Risk User
1. User starts check-in
2. User completes Quick-6 (2 minutes)
3. P4 (Financial) scores 65, P5 (Legal) scores 55
4. System: "I notice financial resources and healthcare navigation might need support. May I ask 4 more questions for better recommendations?"
5. User accepts
6. User answers 4 Deep-Dive questions for P4 and P5 (2 minutes)
7. System provides targeted financial and navigation resources
8. **Time saved: 1-2 minutes vs. full assessment**

### Flow 3: High-Risk User
1. User starts monthly check-in
2. System: "It's time for your monthly comprehensive assessment"
3. User completes all 30 questions (5-6 minutes)
4. Multiple zones flagged
5. System connects user to case management
6. **Full data quality maintained for high-need user**

## References

- [GC-SDOH-30 Assessment Framework](../GC-SDOH.md)
- Protocol for Responding to and Assessing Patients' Assets, Risks, and Experiences (PRAPARE)
- Accountable Health Communities (AHC) screening tool
- Computer Adaptive Testing (CAT) methodologies

## Version History

- **v1.0 (2025-11-23):** Initial adaptive assessment pattern documentation

---

**For implementation guidance specific to your tech stack, see platform-specific documentation.**
