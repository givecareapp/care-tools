# [FEATURE] Adaptive assessment lacks concrete question mapping

## Source
- Type: feature
- Requested: 2026-01-27T13:56:51Z
- Priority: P2

## Goal
From AI review (ai-review-2026-01-27). Effort: unknown

## Review Details

`docs/ADAPTIVE-ASSESSMENT-PATTERN.md:27-34` describes selecting Quick-6 questions by "highest item-total correlation" but doesn't specify which questions to use. Without a defined Quick-6 question set, the adaptive pattern can't be implemented or tested.

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
