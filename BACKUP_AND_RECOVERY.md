# BACKUP AND DISASTER RECOVERY RUNBOOK
**NEET UG 2027 Intelligent Preparation Platform**
*Authoritative Recovery Procedures, RPO/RTO Objectives, and Restoration Tests*

---

## 1. Disaster Recovery Objectives

* **Recovery Point Objective (RPO)**: $\le 1$ hour (Maximum acceptable data loss in catastrophic disaster).
* **Recovery Time Objective (RTO)**: $\le 15$ minutes (Maximum acceptable downtime before system is restored).

---

## 2. Backup Strategy & Scheduling

| Backup Type | Frequency | Destination | Retention Policy | Encryption |
| :--- | :--- | :--- | :--- | :--- |
| **Database Snapshots** | Automated Daily (02:00 UTC) | Encrypted S3 / Cloud Bucket | 30 Days Daily, 12 Months Monthly | AES-256 |
| **Continuous WAL Logs** | Real-time (Point-in-Time) | Managed Cloud Database Engine | 7 Days Rolling Window | In-transit & At-rest (TLS + KMS) |
| **Object Storage Assets** | Daily Sync | Multi-region Replication Bucket | Indefinite for verified NCERT/PYQ | SSE-S3 |
| **Pre-Migration Backups** | Prior to any DDL change | Local & Encrypted Cloud Cold Storage | 90 Days post-release | AES-256 |

---

## 3. Verified Restore Procedure

Restoration scenarios were tested in Phase 8 (`Test 23` in `tests/phase8_acceptance.test.ts`):
1. **Identify Snapshot**: Select the most recent verified backup (e.g. `dev.db.phase7.backup` or latest cloud dump).
2. **Verify Checksum & Integrity**:
   - Check file header:
     ```bash
     head -c 16 prisma/dev.db.phase7.backup
     # Output must match: "SQLite format 3"
     ```
   - Check SHA-256 hash against verified deployment manifest.
3. **Execute Restoration**:
   - For SQLite:
     ```powershell
     Copy-Item prisma/dev.db.phase7.backup -Destination prisma/dev.db -Force
     ```
   - For Managed PostgreSQL:
     ```bash
     pg_restore --clean --if-exists -h $DB_HOST -U $DB_USER -d $DB_NAME backup_file.dump
     ```
4. **Post-Restore Verification**:
   - Run `/api/health/ready` check.
   - Execute regression test `npx tsx tests/phase8_acceptance.test.ts`.

---

## 4. Failure Scenario Action Plans

### 4.1 Database Failure / Data Corruption
1. Divert traffic to maintenance page via Cloudflare / edge proxy.
2. Spin up hot-standby replica or restore latest WAL point-in-time snapshot.
3. Re-sync Prisma client: `npx prisma generate`.
4. Run health check `/api/health`.
5. Re-enable traffic. Estimated duration: 8 minutes.

### 4.2 Storage / Asset Failure
1. If public assets are corrupted, re-run figure extraction script `scripts/reindex_figures.ts` or sync from replicated cold storage bucket.
2. Verified figure assets are deterministic and re-derivable from original PDF source manifests.

### 4.3 Corrupted Queue / Stuck Jobs
1. Inspect dead-letter jobs:
   ```sql
   SELECT count(*) FROM "BackgroundJob" WHERE status = 'DEAD_LETTER';
   ```
2. Trigger automated queue reset:
   ```typescript
   await PersistentQueue.retryFailed();
   ```
3. Purge poisoned payloads with invalid JSON syntax.
