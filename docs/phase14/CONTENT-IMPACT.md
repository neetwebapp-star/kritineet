# Phase 14: Downstream Content Impact & Dependency Engine

## 1. Overview
The Content Impact Engine calculates the cascade effect whenever an upstream educational unit (e.g. NCERT textbook paragraph, formula definition, or concept) is modified, deprecated, or disputed.

```text
[NCERT Section]
       |
       v
   [Concept]
    /     \
   v       v
[Question] [Formula Rule]
   |
   v
[CBT Exam Blueprint / Active Test]
```

## 2. Dependency Tracking
The `ContentDependency` model maps directed acyclic edges between:
- `upstreamId` & `upstreamType`
- `downstreamId` & `downstreamType`
- `relationType` (`MAPS_TO`, `DERIVED_FROM`, `PREREQUISITE_FOR`, `CITES`)

## 3. Impact Assessment
When `DiffAndSourceEngine.generateImpactReport(contentId)` is evaluated:
1. All direct downstream concepts, questions, and revision items are traversed recursively.
2. Active CBT simulation blueprints containing linked questions are cataloged.
3. If an upstream change carries `HIGH` or `CRITICAL` severity, affected downstream questions are flagged with `REVIEW_REQUIRED` to prevent outdated content from being served to candidates.
