# DATABASE MIGRATION PLAN: SQLITE TO MANAGED POSTGRESQL
**NEET UG 2027 Intelligent Preparation & CBT Platform**
*Production SaaS Multi-Tenant Migration & Zero-Downtime Transition Runbook*

---

## 1. Overview & Current State

* **Current Database**: SQLite 3 (`prisma/dev.db`, 9.68 MB) via Prisma ORM 6.4.1.
* **Target Database**: Managed PostgreSQL (AWS RDS / Supabase / DigitalOcean Managed DB) with PgBouncer connection pooling.
* **Pre-Migration Safety Backup**: Committed at `prisma/dev.db.phase7.backup` (SHA-256 verified, valid SQLite format 3 header).
* **Target Objective**: Migrate all 3,455 canonical NCERT concepts, 2,172 verified questions, exam blueprints, student learning histories, and multi-tenant entities to PostgreSQL without data corruption or schema discrepancies.

---

## 2. Schema Compatibility Assessment

Prisma models adhere to ANSI SQL standard types. Key translations between SQLite and PostgreSQL:

| Feature / Model | SQLite Implementation | PostgreSQL Target | Notes |
| :--- | :--- | :--- | :--- |
| **String IDs** | `@id @default(cuid())` | `VARCHAR(30) PRIMARY KEY` / `cuid()` | 100% Compatible |
| **JSON Fields** | `String?` (Serialized JSON) | `Json` or `Jsonb` | Maintain `String?` initially or migrate to native `Jsonb` for indexing |
| **Booleans** | `INTEGER` (0 / 1) | `BOOLEAN` (`true` / `false`) | Prisma ORM handles auto-conversion |
| **Dates** | ISO 8601 Strings / Timestamps | `TIMESTAMPTZ` | Preserved via UTC DateTime |
| **Enums** | String constants in comments | Native PostgreSQL ENUMs | Keep String representations to preserve existing test suites |

---

## 3. Step-by-Step Migration Procedure

### Phase A: Pre-Migration Backup & Freeze
1. Put the application in maintenance mode:
   ```bash
   # Enable maintenance banner via feature flag or edge proxy
   ```
2. Create an immutable final snapshot of `prisma/dev.db`:
   ```powershell
   Copy-Item prisma/dev.db -Destination prisma/dev.db.final.snapshot
   ```

### Phase B: Provisioning & Schema Application
1. Provision PostgreSQL instance (PostgreSQL 16+) with connection pooling.
2. Configure `.env.production`:
   ```env
   DATABASE_URL="postgresql://neet_admin:SECURE_PASSWORD@postgres-host:5432/neet_prod?sslmode=require&pgbouncer=true"
   DIRECT_URL="postgresql://neet_admin:SECURE_PASSWORD@postgres-host:5432/neet_prod?sslmode=require"
   ```
3. Update `prisma/schema.prisma` datasource:
   ```prisma
   datasource db {
     provider  = "postgresql"
     url       = env("DATABASE_URL")
     directUrl = env("DIRECT_URL")
   }
   ```
4. Run Prisma schema push to create tables, foreign keys, and indexes:
   ```bash
   npx prisma db push
   ```

### Phase C: Data Extraction & Transfer
1. Use an automated ETL transfer tool (`pgloader` or custom TypeScript extraction script):
   ```bash
   pgloader sqlite:///path/to/dev.db.final.snapshot postgresql://neet_admin:PASSWORD@postgres-host:5432/neet_prod
   ```
2. Verify row counts across all critical tables:
   - Concepts: `SELECT count(*) FROM "Concept";` $\ge 3,455$
   - Questions: `SELECT count(*) FROM "Question";` $\ge 2,172$
   - Chapters: `SELECT count(*) FROM "Chapter";` $\ge 79$
   - Plans: `SELECT count(*) FROM "Plan";` $\ge 4$

### Phase D: Post-Migration Smoke Test & Cutover
1. Run automated regression suite against the new database:
   ```bash
   npx tsx tests/phase8_acceptance.test.ts
   ```
2. Switch production DNS / deployment environment variables to point to PostgreSQL.
3. Remove maintenance banner.

---

## 4. Rollback Plan

If data validation fails during cutover:
1. Revert `prisma/schema.prisma` datasource provider to `"sqlite"`.
2. Restore `.env` `DATABASE_URL="file:./dev.db"`.
3. Verify integrity against `dev.db.phase7.backup`.
4. Estimated Rollback Time: $< 3$ minutes.
