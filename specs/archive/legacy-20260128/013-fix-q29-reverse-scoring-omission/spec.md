# [FEATURE] Fix Q29 reverse-scoring omission

## Source
- Type: feature
- Requested: 2026-01-27T13:56:51Z
- Priority: P2

## Goal
From AI review (ai-review-2026-01-27). Effort: unknown

## Review Details
**Impact: High | Effort: Low**
Add Q29 to the reverse-scored list at `GC-SDOH.md:22` and update the regular scoring list at `GC-SDOH.md:235`. Without this, every P2 Physical Health zone score will be inverted.

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
