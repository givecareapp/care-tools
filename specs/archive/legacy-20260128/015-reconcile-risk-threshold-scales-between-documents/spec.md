# [FEATURE] Reconcile risk threshold scales between documents

## Source
- Type: feature
- Requested: 2026-01-27T13:56:51Z
- Priority: P2

## Goal
From AI review (ai-review-2026-01-27). Effort: unknown

## Review Details
**Impact: High | Effort: Low**
Pick one scale (1-5 or 0-100) and use it consistently, or add explicit conversion formulas. Update the adaptive doc threshold at `docs/ADAPTIVE-ASSESSMENT-PATTERN.md:309` to align with the main risk thresholds.

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
