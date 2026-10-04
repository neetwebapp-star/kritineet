# MTG Fingertips → EKriti NCERT Topic Integration — Documentation

**Spec**: 35-section MTG Fingertips → EKriti NCERT Topic Integration
**Generated**: 2026-10-05

This document is the integration guide for connecting the canonical MTG
Fingertips question dataset to the EKriti NCERT topic hierarchy. It is
intended to be read alongside the audit report (`docs/MTG_NCERT_INTEGRATION_AUDIT.md`)
and the deterministic mapping registry (`docs/MTG_NCERT_TOPIC_MAPPING.json`).

---

## 1. Overview

The MTG → NCERT integration is structured as two strictly-separated layers
per spec §7:

```
CHAPTER
├── TOPIC_DRILL       (1.1, 1.2, 1.3, ...)
│   Each topic maps to exactly ONE NCERT topic.
│   Questions preserve source ordering via SHA-256 sequence hash.
└── EXAM_SCORER       (chapter-level)
    Subsections: EXEMPLAR / ASSERTION_REASON / STATEMENT_BASED /
                MATCHING_BASED / CORE / CASE_BASED / FIGURE_BASED /
                MULTIDIMENSIONAL / EXAM_ARCHIVE / THINKING_CORNER /
                + any other source-defined subsection (per spec §23)
```

Per spec §1, §4, §11: TOPIC_DRILL and EXAM_SCORER must NEVER be merged.
Exam Scorer questions must NEVER be attached to a numbered NCERT topic.

---

## 2. Canonical Source State

The canonical MTG source is documented in three repo-resident artifacts:

| Artifact | Purpose | Records |
|---|---|---|
| `docs/MTG_AUTHORITATIVE_SOURCE_INVENTORY.json` | Master chapter-level inventory | 79 in-syllabus chapters across BIO/CHE/PHY × Class 11+12 |
| `docs/MTG_SOURCE_MASTER_MANIFEST.json` | Verbatim canonical manifest (with fingerprints) | 2466 questions |
| `src/lib/auditor/canonical_topic_registry.py` | NCERT topic registry | 79 chapters × 302 topics |

**Source PDFs** (per `MTG_AUTHORITATIVE_SOURCE_INVENTORY.json`):

| Subject | File | Pages |
|---|---|---|
| Biology | temp_ingestion/mtg_source\biology_fingertips.pdf | 1029 |
| Chemistry | temp_ingestion/mtg_source\chemistry_fingertips.pdf | 853 |
| Physics | temp_ingestion/mtg_source\physics_fingertips.pdf | 500 |

**Source location**: Google Drive folder ID `1X9uI9yRlzY4itV7mVdLt6xVlKv_gQjdN`
(per `MTG_AUTHORITATIVE_SOURCE_INVENTORY.json -> metadata.sourceLocation`)

### 2.1 Canonical accounting

Per `MTG_AUTHORITATIVE_SOURCE_INVENTORY.json -> metadata.summary`:

- **Total source MCQs**: 13750
- **Total deployed MCQs** (DB rows, including synthetic): 13750
- **Total in-syllabus chapters**: 79
- **Total out-of-syllabus chapters** (filtered out): 19

### 2.2 Verbatim content gap

Per `MTG_EXAM_SCORER_AUDIT_RESULT.json -> globalMetrics`:

- **AUTHENTIC_EXACT_MATCH**: 2101
- **SUSPECTED_SYNTHETIC_GLOBAL**: 6044
- **SUSPECTED_SYNTHETIC**: 5605

Only `2101` of the
`13750` DB rows have question text
that exactly matches the canonical source. The remaining
`11649` rows have placeholder/synthetic
question text and must be back-filled with authentic source content.

---

## 3. Mapping Registry

File: `docs/MTG_NCERT_TOPIC_MAPPING.json` — 460 records

Each record follows spec §9 schema:

```
{
  "NCERT_TOPIC_ID":        "PHY11-CH01-T01",
  "SUBJECT":               "Physics",
  "CLASS":                 "Class 11",
  "CHAPTER_ID":            "<cuid>",
  "CHAPTER_NUMBER":        1,
  "CHAPTER_NAME":          "Units and Measurements",
  "NCERT_TOPIC_NUMBER":    "1.1",
  "NCERT_TOPIC_NAME":      "<exact registry title>",
  "MTG_TOPIC_NUMBER":      "1.1",
  "MTG_TOPIC_NAME":        "<exact registry title>",
  "MTG_QUESTION_COUNT":    N,
  "MAPPED_QUESTION_IDS":   ["Q_FT_MTG_KEPH101_T1_1_01", ...],
  "SEQUENCE_HASH":         "<sha256 of source_id_1|source_id_2|...>",
  "MAPPING_STATUS":        "VERIFIED" | "PENDING_SOURCE_BACKFILL"
  "EXAM_SCORER_TYPE"?:     "ASSERTION_REASON" | "EXAM_ARCHIVE" | ...
}
```

- 378 records VERIFIED
- 82 records PENDING_SOURCE_BACKFILL

### 3.1 Topic-drill vs exam-scorer separation

Records WITHOUT `EXAM_SCORER_TYPE` field = topic-drill.
Records WITH `EXAM_SCORER_TYPE` field = exam-scorer pseudo-topic.

The two layers are never merged in the registry, in the JSON manifest, or
in the application schema (per spec §4).

---

## 4. Sequence Validation (SHA-256 per Topic)

File: `docs/MTG_SEQUENCE_VALIDATION.json` — 378 records

Per spec §21, every topic with questions has a deterministic SHA-256
sequence fingerprint computed over the ordered concatenation of source_ids:

```python
import hashlib
h = hashlib.sha256()
for q in questions_in_topic_in_source_order:
    h.update(q['source_id'].encode()); h.update(b'|')
canonical_sequence_hash = h.hexdigest()
```

After DB migration, the post-migration validator computes the same hash from
the application's `Question` rows ordered by `originalQuestionNumber` within
each `Topic`. The two hashes MUST match (per spec §21).

Current state:

- 378 topics with questions in the canonical manifest
- 378 canonical-side hashes computed
- 0 application-side hashes computed (DB migration not yet run)

---

## 5. Unmapped / Synthetic Review Queue

File: `docs/MTG_UNMAPPED_REVIEW_QUEUE.json`

Per spec §29, every question that cannot be cleanly mapped is kept here —
nothing is silently dropped, randomly assigned, or hidden.

Queue composition:

| Source | Items |
|---|---|
| `docs/MTG_TOPIC_REPAIR_QUEUE.json` | 0 |
| `docs/MTG_EXAM_SCORER_REPAIR_QUEUE.json` | 0 |
| Application DB synthetic (per audit) | 11649 |

**Total review items**: 11649

---

## 6. Migration Procedure (DB Integration)

Per spec §32, this is PHASE 8 (only after PHASE 6 read-only validation passes).
Per spec §13, take a complete DB snapshot before any write operation.
Per spec §14, student progress MUST survive the migration.

### 6.1 Prerequisites

```bash
# 1. Ensure .env has a live DATABASE_URL
cp .env.example .env
# Edit .env: set DATABASE_URL to your PostgreSQL/SQLite instance

# 2. Install dependencies
pnpm install

# 3. Generate Prisma client
pnpm exec prisma generate

# 4. Apply schema (creates/migrates tables)
pnpm exec prisma db push    # dev
# OR
pnpm exec prisma migrate deploy  # prod
```

### 6.2 Pre-migration snapshot (spec §13)

```bash
# Create a complete DB snapshot before any write
mkdir -p prisma/backups
DATE=$(date +%Y%m%d-%H%M%S)
cp dev.db prisma/backups/dev.db.pre-mtg-integration.$DATE.bak   # SQLite
# OR for PostgreSQL:
# pg_dump $DATABASE_URL > prisma/backups/pg.pre-mtg-integration.$DATE.sql
```

### 6.3 Run the canonical-back-fill migration

The migration script is `scripts/ingest_mtg_master_pipeline.py` (already in
the repo). It reads the canonical manifest and upserts each question into
the `Question` table using `id` (= canonical source_id) as the deterministic
primary key (per spec §31 IDEMPOTENCY).

```bash
pnpm exec tsx scripts/ingest_mtg_master_pipeline.py \
    --manifest docs/MTG_SOURCE_MASTER_MANIFEST.json \
    --mapping   docs/MTG_NCERT_TOPIC_MAPPING.json \
    --dry-run   # first run with --dry-run to preview changes

# Then commit if dry-run is clean:
pnpm exec tsx scripts/ingest_mtg_master_pipeline.py \
    --manifest docs/MTG_SOURCE_MASTER_MANIFEST.json \
    --mapping   docs/MTG_NCERT_TOPIC_MAPPING.json
```

### 6.4 Replacing synthetic questions with authentic source

For the ~11,284 source questions NOT in the canonical manifest, the migration
requires a re-extraction from the MTG PDFs. Per spec §33, this is normally
forbidden — but the canonical manifest in the repo is incomplete, so the
user must explicitly authorise a re-extraction pass.

Re-extraction procedure:

1. Download the 3 MTG PDFs from the Google Drive folder
   (ID `1X9uI9yRlzY4itV7mVdLt6xVlKv_gQjdN)`):
   - `biology_fingertips.pdf` (1029 pages)
   - `chemistry_fingertips.pdf` (853 pages)
   - `physics_fingertips.pdf` (500 pages)

2. Run the VLM-based extractor (per the canonical-extraction spec from the
   previous session — see `scripts/integration/` for the reference impl):

   ```bash
   # For each chapter in docs/MTG_AUTHORITATIVE_SOURCE_INVENTORY.json:
   python3 scripts/integration/04_vlm_extract_chapter.py \
       <book_id> <pdf_page_start> <pdf_page_end> \
       --class <11|12> --chapter <N> --chapter-title '<title>'
   ```

3. Each VLM run appends canonical records to
   `data/canonical/<book_id>/ch<N>/questions.jsonl`.

4. Run the canonical merger to extend `docs/MTG_SOURCE_MASTER_MANIFEST.json`
   with the new verbatim question text, options, and answers.

5. Re-run the migration script (idempotent — only new records are inserted,
   existing records with the same `id` are updated with verbatim text).

### 6.5 Post-migration validation

```bash
# Run the existing auditor
pnpm exec tsx src/lib/auditor/engine.ts --mode validate --report docs/MTG_POST_MIGRATION_AUDIT.json

# Compute application-side sequence hashes and compare to canonical
python3 scripts/integration/03_validate_app_sequences.py \
    --mapping docs/MTG_NCERT_TOPIC_MAPPING.json \
    --output  docs/MTG_SEQUENCE_VALIDATION.json
```

Per spec §22, a chapter is COMPLETE only when:
- every NCERT topic has the canonical count of questions in the DB
- every question's `Question.fingerprint` matches the canonical SHA-256
- every topic's app-side sequence hash matches the canonical-side hash
- zero records have `verificationStatus = 'NEEDS_REVIEW'`

---

## 7. Frontend Integration

The repo already has the frontend wiring for MTG Practice:

- **API route**: `src/app/api/ncert/mtg/inventory/route.ts`
  Returns the canonical MTG inventory (chapters + topics + question counts).
- **API route**: `src/app/api/ncert/mtg/topic-audit/route.ts`
  Returns per-topic audit data (canonical count vs app count, hash match, etc).
- **Frontend page**: `src/app/ncert/mtg-inventory/page.tsx`
  Renders the MTG inventory dashboard.

Per spec §16, the student-facing flow is:

```
NCERT → Subject → Class → Chapter → Topic 1.1 → MTG Practice
                                                       ↓
                                              Q1 → Q2 → Q3 → ...
                                              (in canonical source order)
```

The existing API routes already fetch questions ordered by
`originalQuestionNumber` within each `Topic`. The frontend renders them in
that order. As long as the migration script populates `Question.originalQuestionNumber`
from the canonical manifest's `id` suffix (e.g. `Q_FT_MTG_KEPH101_T1_1_01` →
`originalQuestionNumber = 1`), the source sequence is preserved.

Per spec §27 (UI QA), after migration the following must be manually verified:

- [ ] Open `Class 11 → Physics → Chapter 1 → Topic 1.1 → MTG Practice`
- [ ] Verify the exact canonical MTG 1.1 MCQs appear in source order
- [ ] Repeat for 1.2, 1.3, 1.4, ...
- [ ] Repeat for several chapters across all three subjects
- [ ] Open Exam Scorer section for a chapter and verify subsection questions

---

## 8. Idempotency (spec §31)

Running the integration multiple times MUST NOT create duplicate questions.
The migration script uses `Question.id` (= canonical source_id) as the
deterministic primary key. Re-running the script:

1. Existing records with the same `id` → UPDATE (text/options/answer refreshed)
2. New records (from extended canonical manifest) → INSERT
3. Records in the DB not in the canonical manifest → leave untouched
   (so student attempts on legacy questions are preserved)

Per spec §31, re-running the integration results in:
- same question count (per chapter / per topic)
- same mappings
- same ordering (deterministic source_id ordering)
- same SHA-256 fingerprints (deterministic hash of canonical question text)

### 8.1 Student progress preservation (spec §14)

The migration NEVER deletes a `Question` row. It only:
- INSERT new rows for canonical source_ids not yet in DB
- UPDATE existing rows to refresh `questionText` / `correctOption` /
  `explanation` / `fingerprint` from the canonical manifest

Student data preserved:
- `StudentResponse` (attempts)
- `StudentMistake` (incorrect-question tracking)
- `StudentBookmark` (saved questions)
- `RevisionSchedule` (SM-2 spaced repetition)
- `TopicProgress` (per-topic completion)

All student data joins to `Question.id` which is the canonical source_id —
stable across migrations.

---

## 9. Validation Commands

```bash
# Build the deterministic mapping registry (idempotent)
python3 scripts/integration/01_build_mapping_and_queues.py

# Generate the audit report
python3 scripts/integration/02_generate_audit_report.py

# Generate this integration doc
python3 scripts/integration/03_generate_integration_doc.py

# (After DB migration) Validate app-side sequence hashes
python3 scripts/integration/04_validate_app_sequences.py \
    --mapping docs/MTG_NCERT_TOPIC_MAPPING.json \
    --output  docs/MTG_SEQUENCE_VALIDATION.json

# Existing auditor scripts in the repo
python3 src/lib/auditor/test_suite.py           # full audit test suite
python3 src/lib/auditor/mtg_topic_auditor.py   # topic-drill audit
python3 src/lib/auditor/exam_scorer_auditor.py # exam-scorer audit
python3 src/lib/repair/mtg_topic_repairer.py   # repair engine
```

---

## 10. Current Status — Honest Verdict (spec §28)

| Spec phase | Status |
|---|---|
| PHASE 1 Inspect project | ✅ DONE — repo cloned, Next.js 16 + Prisma 6.4.1 + SQLite dev |
| PHASE 2 Locate canonical MTG dataset | ✅ DONE — manifest + inventory + registry present |
| PHASE 3 Locate NCERT topic registry | ✅ DONE — `canonical_topic_registry.py` (79 ch × 302 topics) |
| PHASE 4 Audit current MTG database | ✅ DONE — `MTG_EXAM_SCORER_AUDIT_RESULT.json` shows 13750 DB rows, 2101 authentic |
| PHASE 5 Deterministic NCERT↔MTG mapping | ✅ DONE — `docs/MTG_NCERT_TOPIC_MAPPING.json` (460 records) |
| PHASE 6 READ-ONLY validation | ✅ DONE — `docs/MTG_NCERT_INTEGRATION_AUDIT.md` produced |
| PHASE 7 Mapping report | ✅ DONE |
| PHASE 8 Database migration | ⏸️ PENDING — requires live `DATABASE_URL` (none in this clone) |
| PHASE 9 Post-migration validation | ⏸️ PENDING — requires PHASE 8 first |
| PHASE 10 Frontend MTG Practice wiring | ✅ EXISTING — `src/app/api/ncert/mtg/` + `src/app/ncert/mtg-inventory/` present |
| PHASE 11 Exam Scorer connection | ⚠️ PARTIAL — registry has the subsections; verbatim content back-fill pending |
| PHASE 12 Frontend QA | ⏸️ PENDING — requires PHASE 8 first |
| PHASE 13 Final global audit | ✅ DONE (canonical-side) — full audit pending DB migration |

### 10.1 What's blocking COMPLETE status

Per spec §28 NO FAKE SUCCESS, the integration CANNOT be marked COMPLETE
until:

1. The ~11,284 source questions not in the canonical manifest are re-extracted
   from the MTG PDFs (requires the user to authorise re-extraction per §33).

2. The migration script (`scripts/ingest_mtg_master_pipeline.py`) is run
   against a live `DATABASE_URL` to replace the 11,649 synthetic DB rows
   with authentic source content.

3. The post-migration validator (`src/lib/auditor/engine.ts`) confirms:
   - `MAPPED == CANONICAL` (per topic, per chapter, per subject)
   - `MISSING == 0`
   - `DUPLICATE == 0`
   - `WRONG_TOPIC == 0`
   - `WRONG_CHAPTER == 0`
   - `SEQUENCE_MISMATCH == 0`
   - `HASH_MISMATCH == 0`

Per spec §28, until all of the above are zero, the verdict remains
`PARTIAL — METADATA-VERIFIED, CONTENT-BACK-FILL-PENDING`.

---

## 11. Deliverables Index (spec §34)

| # | Deliverable | File | Status |
|---|---|---|---|
| 1 | NCERT → MTG mapping registry | `docs/MTG_NCERT_TOPIC_MAPPING.json` | ✅ |
| 2 | Topic-level mapping report | `docs/MTG_NCERT_INTEGRATION_AUDIT.md` §26 | ✅ |
| 3 | Chapter-level audit report | `docs/MTG_NCERT_INTEGRATION_AUDIT.md` §25 | ✅ |
| 4 | Global audit report | `docs/MTG_NCERT_INTEGRATION_AUDIT.md` §24 | ✅ |
| 5 | Unmapped/review queue | `docs/MTG_UNMAPPED_REVIEW_QUEUE.json` | ✅ |
| 6 | Database migration/integration | `scripts/ingest_mtg_master_pipeline.py` (existing) | ✅ (script ready; not run) |
| 7 | Frontend MTG Practice integration | `src/app/api/ncert/mtg/` + `src/app/ncert/mtg-inventory/` (existing) | ✅ (existing) |
| 8 | Exam Scorer integration | `docs/MTG_NCERT_TOPIC_MAPPING.json` (records with `EXAM_SCORER_TYPE`) | ✅ (registry-level) |
| 9 | Automated validator | `src/lib/auditor/test_suite.py` + `engine.py` (existing) | ✅ (existing) |
| 10 | Sequence-hash validator | `docs/MTG_SEQUENCE_VALIDATION.json` (canonical-side) | ✅ (canonical-side) |
| 11 | Documentation | `docs/MTG_INTEGRATION.md` (this file) | ✅ |

---

**End of integration documentation.**