# Phase 14: AI Retrieval Eligibility & Indexing Controls

## 1. Overview
The AI Retrieval Eligibility layer prevents unverified, retired, disputed, or license-restricted content from entering the context windows of the AI Tutor or adaptive recommendation engines.

## 2. Invariants & Guardrails
1. **Approval Status Check**: Only content items with `status = APPROVED` or `status = PUBLISHED` can receive `isEligible = true` in `RetrievalEligibility`.
2. **Freshness Assessment**: Content marked `STALE` or `REVIEW_DUE` in `ContentHealthProfile` is prioritized for re-validation; if critical scientific discrepancies arise, `isEligible` is set to `false`.
3. **Strict License Quarantine**: Any content bearing `LICENSE_RESTRICTED` or `LICENSE_UNKNOWN` is categorically disqualified from RAG vector indexing or context embedding.
4. **Dispute Quarantining**: Flagging a question or concept with `DISPUTED` immediately revokes retrieval eligibility until the dispute is resolved and approved by a scientific reviewer.
