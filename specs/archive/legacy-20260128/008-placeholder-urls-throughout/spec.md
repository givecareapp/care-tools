# [FEATURE] Placeholder URLs throughout

## Source
- Type: feature
- Requested: 2026-01-27T13:56:51Z
- Priority: P2

## Goal
From AI review (ai-review-2026-01-27). Effort: unknown

## Review Details

`README.md:87`, `README.md:173`, and `LICENSE:33,39` all reference `[your-org]` in GitHub URLs instead of the actual org (`givecareapp`). The actual repo is at `github.com/givecareapp/care-tools` but these placeholders will send users to broken links.

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
