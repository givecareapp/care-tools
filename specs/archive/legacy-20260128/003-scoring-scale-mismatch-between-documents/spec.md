# [FEATURE] Scoring scale mismatch between documents

## Source
- Type: feature
- Requested: 2026-01-27T13:56:51Z
- Priority: P2

## Goal
From AI review (ai-review-2026-01-27). Effort: unknown

## Review Details

`GC-SDOH.md:249-254` uses a **1-5 scale** for risk thresholds (Low ≥ 3.5, Moderate 2.5-3.49, High < 2.5). `docs/ADAPTIVE-ASSESSMENT-PATTERN.md:294` uses a **0-100 scale** (`score = (answer - 1) / 4 * 100`). The risk threshold in the adaptive doc at line 309 uses `>50` on the 0-100 scale, which maps to 3.0 on the 1-5 scale — placing it in the "Moderate" range per the main doc, not at the Low/Moderate boundary (3.5). These two documents will produce different risk classifications for the same responses.

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
