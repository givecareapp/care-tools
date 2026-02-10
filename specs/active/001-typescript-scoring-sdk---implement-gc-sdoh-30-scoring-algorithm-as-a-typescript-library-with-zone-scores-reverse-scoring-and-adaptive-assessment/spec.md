# Spec: TypeScript Scoring SDK - Implement GC-SDOH-30 scoring algorithm as a TypeScript library with zone scores, reverse-scoring, and adaptive assessment

## Requirements

### Requirement: GC-SDOH-30 metadata
The system SHALL expose GC-SDOH-30 question and zone metadata, including zone IDs, question IDs, scale types, and reverse-scoring flags.

#### Scenario: [Happy path]
- GIVEN a consumer needs to render the GC-SDOH-30 assessment
- WHEN the consumer reads question and zone metadata from the SDK
- THEN the consumer receives all 30 questions mapped to zones with correct reverse-scoring flags and scale types

### Requirement: Full assessment zone scores
The system SHALL compute per-zone scores for the full GC-SDOH-30 assessment by averaging 1-5 responses after applying reverse scoring to questions 11 and 13-19.

#### Scenario: [Happy path]
- GIVEN responses for all questions in a zone
- WHEN the SDK computes zone scores
- THEN the zone score equals the mean of normalized answers using reverse scoring where required

### Requirement: Zone risk classification
The system SHALL classify each zone as low, moderate, or high risk using thresholds from GC-SDOH-30 documentation (low: >= 3.5, moderate: 2.5-3.49, high: < 2.5).

#### Scenario: [Happy path]
- GIVEN a zone score of 3.7
- WHEN the SDK evaluates zone risk
- THEN the zone is classified as low risk

### Requirement: Overall risk classification
The system SHALL classify overall risk as low when all zones are low, moderate when 1-2 zones are high, and high when 3+ zones are high. The system SHALL allow callers to optionally flag critical responses that force an overall high risk result.

#### Scenario: [Happy path]
- GIVEN two zones are high risk and no critical response flags
- WHEN the SDK computes overall risk
- THEN the overall risk is moderate

### Requirement: Adaptive assessment scoring
The system SHALL support Quick-6 and Deep-Dive scoring per the adaptive assessment pattern, returning zone scores on a 0-100 scale and confidence based on answered ratio.

#### Scenario: [Happy path]
- GIVEN a Quick-6 response of 4 for a zone with 8 total questions
- WHEN the SDK computes the Quick-6 zone score
- THEN the zone score is 75 and confidence is 0.125

### Requirement: Input validation
The system SHALL report invalid inputs for unknown question IDs or responses outside the 1-5 range.

#### Scenario: [Happy path]
- GIVEN a response value of 6
- WHEN the SDK validates inputs
- THEN the SDK reports an error for the invalid response
