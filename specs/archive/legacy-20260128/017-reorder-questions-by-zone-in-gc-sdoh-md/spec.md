# [FEATURE] Reorder questions by zone in `GC-SDOH.md`

## Source
- Type: feature
- Requested: 2026-01-27T13:56:51Z
- Priority: P2

## Goal
From AI review (ai-review-2026-01-27). Effort: unknown

## Review Details
**Impact: Medium | Effort: Low**
Present P2 questions in their numeric position (after P1) rather than at the end of the document. Alternatively, renumber questions so zone order matches question order. The current arrangement invites mapping bugs.

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
