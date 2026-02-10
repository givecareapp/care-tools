# [FEATURE] Scoring contradiction for reverse-scored items

## Source
- Type: feature
- Requested: 2026-01-27T13:56:51Z
- Priority: P2

## Goal
From AI review (ai-review-2026-01-27). Effort: unknown

## Review Details

`GC-SDOH.md:22` states "Questions 11, 13-19 are reverse-scored (higher values indicate greater need)." But the risk threshold at `GC-SDOH.md:254` says **High Risk = zone score < 2.5**. If reverse-scored items aren't actually normalized before averaging, the Financial zone (P4) — which has 7 of 8 questions reverse-scored — will produce inverted risk assessments. The document says "scoring normalization handles this automatically" but never specifies the normalization formula. This is a critical gap for implementers.

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
