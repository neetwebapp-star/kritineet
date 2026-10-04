# Phase 13 — Disaster Recovery & Backup Strategy

## 1. Objectives & Metrics

- **Recovery Point Objective (RPO)**: <= 1 hour (maximum permissible data loss window in extreme catastrophic events).
- **Recovery Time Objective (RTO)**: <= 30 minutes (time required to restore database, verify migrations, and resume student testing).

---

## 2. Backup Schedules & Retention

| Data Category | Backup Frequency | Encryption | Storage Location | Retention Window |
| :--- | :--- | :--- | :--- | :--- |
| **Relational Database** | Daily snapshot + hourly WAL | AES-256 | Geo-redundant cloud storage | 90 days rolling |
| **Question Assets & Diagrams** | Synchronous replication | In-transit / Rest | Multi-region bucket | Indefinite |
| **Audit Logs & Snapshots** | Append-only cold archive | Encrypted | Immutable cold storage | 3 years (Regulatory) |

---

## 3. Verified Staging Restore Procedure

The restore pipeline follows a 6-step verified sequence:
1. **Fetch Backup Artifact**: Download latest validated backup snapshot (e.g. `dev.db.phase12.backup`).
2. **Checksum Verification**: Validate SHA-256 integrity hash against backup manifest.
3. **Database Restore**: Apply snapshot to isolated staging instance.
4. **Prisma Migration Safety Check**: Execute `prisma migrate status` or `prisma db push` to verify schema compatibility.
5. **Data Integrity Audit**: Execute `DataIntegrityService.runFullAudit()` to guarantee zero orphan questions or attempts.
6. **Health Probe Activation**: Query `/api/ready` to confirm ready state before opening DNS routing.
