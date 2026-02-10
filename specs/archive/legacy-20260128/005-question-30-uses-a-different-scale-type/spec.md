# [FEATURE] Question 30 uses a different scale type

## Source
- Type: feature
- Requested: 2026-01-27T13:56:51Z
- Priority: P2

## Goal
From AI review (ai-review-2026-01-27). Effort: unknown

## Review Details

`GC-SDOH.md:222-224` uses "Very Poor / Poor / Fair / Good / Excellent" instead of the "Never / Rarely / Sometimes / Often / Always" frequency scale used by all other questions. While the numeric values are 1-5, the semantic meaning differs. The document claims "consistent 1-5 scale" (`GC-SDOH.md:5`) but Q30 breaks that consistency. Implementers building a uniform UI will need special handling.

---

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
