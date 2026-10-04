# OFFICIAL SOURCE ARCHITECTURE & API REFERENCE

## 1. System Architecture Pipeline

```text
Government Authority (NTA / NMC)
        ↓
HTTPS Fetcher with Domain Allowlist & SSRF Protection
        ↓
SHA-256 Cryptographic Hash Generation
        ↓
Deduplication Engine (Canonical URL & Hash Match)
        ↓
NEET Relevance Classifier (Filter Non-Medical Notices)
        ↓
Authority Separator (NTA vs NMC / UGMEB)
        ↓
Exam Edition Detector (NEET 2027 vs Historical 2026)
        ↓
Structured Fact Extractor (Dates, Mode, Marking Scheme)
        ↓
Grounded Summary & Evidence Traceability
        ↓
Database Persistence (OfficialNotification, Document, AuditLog)
        ↓
Student Feed & Real-time Unread Badge
        ↓
Study Planner Impact Event Trigger
```

---

## 2. API Endpoints

### Student Endpoints
- `GET /api/student/nta-notifications`: Filtered list of verified official notices.
- `GET /api/student/nta-notifications/[id]`: Full notice intelligence with provenance and version history.
- `GET /api/student/nta-notifications/unread`: Real dynamic unread notice count for student.
- `POST /api/student/nta-notifications/[id]/read`: Mark specific notice as read.
- `GET /api/student/exam-status`: Authoritative NEET 2027 status (Date, Mode, Syllabus, Application).
- `GET /api/student/syllabus-status`: Latest active NMC/UGMEB syllabus version.
- `GET /api/student/syllabus-changes`: History of official syllabus diffs.

### Admin & System Endpoints
- `GET /api/health/official-sources`: Live health, latencies, and check timestamps for NTA, NEET Portal, and NMC.
- `GET /api/admin/nta-notifications`: Admin view of all ingested notifications and audit logs.
- `POST /api/admin/nta-notifications/check`: Trigger manual live check against government portals.
