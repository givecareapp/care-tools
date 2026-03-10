# [FEATURE] Question 29 scoring direction is ambiguous

## Source
- Type: feature
- Requested: 2026-01-27T13:56:51Z
- Priority: P2

## Goal
From AI review (ai-review-2026-01-27). Effort: unknown

## Review Details

`GC-SDOH.md:216-218` — "How often do you feel physically exhausted from caregiving?" uses 1=Never to 5=Always. Higher scores mean *worse* outcomes, but Q29 is **not** listed as reverse-scored (`GC-SDOH.md:22` only lists Q11, Q13-19). This means physical exhaustion will be counted as a *positive* indicator, inflating P2 scores and hiding health risk.

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
