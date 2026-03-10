# [FEATURE] Zone ordering is inconsistent in `GC-SDOH.md`

## Source
- Type: feature
- Requested: 2026-01-27T13:56:51Z
- Priority: P2

## Goal
From AI review (ai-review-2026-01-27). Effort: unknown

## Review Details

The questions are presented **out of zone order**: P1 (Q1-8), then P3 (Q9-12), then P4 (Q13-20), then P5 (Q21-26), then P6 (Q27-28), then P2 (Q29-30). The header at `GC-SDOH.md:10-16` lists zones P1-P6 in numeric order, but P2 (Physical Health) appears last in the actual questions (`GC-SDOH.md:214`), after P6. This makes the document confusing to read and prone to implementation errors where developers may mismap questions to zones.

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
