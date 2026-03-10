# Proposal: TypeScript Scoring SDK - Implement GC-SDOH-30 scoring algorithm as a TypeScript library with zone scores, reverse-scoring, and adaptive assessment

## Intent
Provide a small, typed TypeScript SDK that exposes GC-SDOH-30 question metadata and scoring utilities, including zone risk classification and adaptive assessment support.

## Scope
**In scope:**
- GC-SDOH-30 question and zone metadata
- Reverse-scoring normalization for questions 11 and 13-19
- Zone score computation and risk classification
- Overall risk classification based on zone risk counts
- Adaptive assessment scoring (Quick-6 and Deep-Dive) with confidence
- Input validation for question IDs and response ranges

**Out of scope:**
- UI rendering, storage, or persistence
- Resource recommendation content
- FHIR mapping or EHR integration
- Localization or translation

## Approach
- Use the existing GC-SDOH-30 question bank as the single source of truth for zones and reverse scoring.
- Implement pure scoring utilities that accept responses keyed by question ID.
- Return structured outputs with zone scores, risk levels, and confidence for adaptive tiers.
