# Phase 14: Content Lifecycle Management Engine

## 1. Overview
The Content Lifecycle Engine ensures that educational content follows a strict, auditable, and immutable state machine from discovery through retirement. No content can bypass validation gates or be published without verified multi-factor approvals.

```text
DISCOVERED -> INGESTED -> EXTRACTED -> MAPPED -> VALIDATED -> REVIEW_REQUIRED -> APPROVED -> PUBLISHED -> RETIRED
                                                      |              ^
                                                      v              |
                                                   DISPUTED ---------+
```

## 2. State Machine Transitions

| State | Allowed Transitions | Invariants & Requirements |
|---|---|---|
| `DISCOVERED` | `INGESTED` | Initial ingestion from authoritative source document or publisher corpus. |
| `INGESTED` | `EXTRACTED` | Document normalized; raw text, figures, and tables segmented. |
| `EXTRACTED` | `MAPPED` | Canonical relations linked to NEET chapters, concepts, and syllabus units. |
| `MAPPED` | `VALIDATED`, `REVIEW_REQUIRED` | Automatic algorithmic validation checks executed (formulas, terminology, diagrams). |
| `VALIDATED` | `REVIEW_REQUIRED`, `APPROVED` | Validated by automated systems; queued for editorial approval. |
| `REVIEW_REQUIRED` | `APPROVED`, `DISPUTED`, `REJECTED` | Human editorial and scientific review process. |
| `DISPUTED` | `REVIEW_REQUIRED`, `REJECTED` | Discrepancies raised by users, psychometrics, or multi-source contradiction. |
| `APPROVED` | `PUBLISHED`, `REVIEW_REQUIRED` | Authorized for student serving and AI retrieval. |
| `PUBLISHED` | `RETIRED`, `REVIEW_REQUIRED` | Live active content. If modified, initiates version fork. |
| `RETIRED` | `REVIEW_REQUIRED` | Content deactivated and removed from active exams and AI contexts. |

## 3. Publication Gates & Invariants
1. **Approval Prerequisite**: Direct transition to `PUBLISHED` is strictly rejected unless current status is `APPROVED`.
2. **Immutable Provenance**: Every content record retains its original `sourceType`, `sourceReference`, `sourcePage`, and `sourceDocument`.
3. **Multi-Hash Verification**: Each version computes SHA-256 `contentHash` and whitespace-normalized `normalizedHash` to prevent duplication and undetected mutations.
4. **Historical Isolation**: Edits and corrections never overwrite existing version records; they increment `versionNumber` and persist complete state snapshots.
