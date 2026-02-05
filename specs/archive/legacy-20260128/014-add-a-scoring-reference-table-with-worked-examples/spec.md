# [FEATURE] Add a scoring reference table with worked examples

## Source
- Type: feature
- Requested: 2026-01-27T13:56:51Z
- Priority: P2

## Goal
From AI review (ai-review-2026-01-27). Effort: unknown

## Review Details
**Impact: High | Effort: Medium**
Add a section to `GC-SDOH.md` after line 260 with 2-3 sample respondent profiles, their raw answers, reverse-score normalization, zone averages, and resulting risk classifications. This prevents every implementer from independently guessing the scoring logic.

## Context


## Acceptance Criteria
- [ ] Feature works as described
- [ ] Tests pass
- [ ] No regressions in existing functionality
- [ ] Documentation updated if needed

## Completion Signal
```bash
npm run build
npm run test
```

## Constraints
- Follow existing code patterns
- Keep changes focused on the feature
