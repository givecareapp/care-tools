# [FEATURE] `CONTRIBUTING.md` referenced but missing

## Source
- Type: feature
- Requested: 2026-01-27T13:56:51Z
- Priority: P2

## Goal
From AI review (ai-review-2026-01-27). Effort: unknown

## Review Details

`README.md:6` has a badge linking to `CONTRIBUTING.md`, and `README.md:126` directs contributors to read it. The file doesn't exist. This is a broken contract with potential contributors.

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
