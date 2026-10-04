# Phase 14: Content Licensing & Export Gating Controls

## 1. Overview
The Licensing & Export Gating subsystem governs how proprietary, licensed, and open educational assets are served, indexed, exported, and retrieved across the platform.

## 2. Policy Enums & Capabilities

| Policy Flag | Public Student Serving | AI RAG Retrieval | Full CSV/PDF Export |
|---|---|---|---|
| `LICENSE_ALLOWED` | Allowed | Allowed | Allowed (subject to role) |
| `PRIVATE_SOURCE` | Allowed within Tenant | Allowed within Tenant | Restricted |
| `LICENSE_RESTRICTED` | Blocked / Redacted | Blocked | Blocked |
| `LICENSE_UNKNOWN` | Blocked | Blocked | Blocked |

## 3. Gating Enforcement Points
1. **Search & Discovery**:
   - `searchContent()` filters out any items tagged `LICENSE_RESTRICTED` or `LICENSE_UNKNOWN` from student search queries.
2. **AI Tutor Context Assembly**:
   - RAG pipelines query `RetrievalEligibility` table. Items lacking `isEligible = true` or tagged with restricted licenses are strictly excluded from AI system prompts.
3. **Student Practice & CBT Sessions**:
   - Practice generators verify content accessibility policies prior to rendering questions or solutions.
4. **Data Exports**:
   - Administrative and user data export endpoints filter out copyrighted publisher texts and figures.
