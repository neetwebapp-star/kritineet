# Phase 13 — Production Operations Runbook

## 1. Incident Handling Procedures

### 1.1 High Error Rate Alert (>5%)
1. Inspect live telemetry at `/admin/system-health`.
2. Check `ObservabilityService.getAlerts()` for component-specific error causes.
3. Verify recent API logs for anomalous status codes (e.g. 500s or 503s).
4. If related to third-party AI provider, verify fallback pointers are serving properly; no core learning intervention required.

### 1.2 Persistent Queue Backlog (>1,000 pending or >20 dead-letter)
1. Inspect dead-letter jobs: `ResilientWorker.getDeadLetterJobs()`.
2. Review `errorDetails` for database constraint violations or payload parsing errors.
3. After addressing root cause, replay failed jobs: `ResilientWorker.replayDeadLetterJob(jobId)`.

### 1.3 Database Latency Degradation (>500ms)
1. Query `ObservabilityService.getSlowQueries('500ms')` to identify offending route or query pattern.
2. Check connection pool saturation.
3. Review whether table scans are occurring on unindexed relations.

---

## 2. Maintenance & Rolling Updates

1. **Pre-flight**: Run `EnvValidator.assertProductionReady()` to guarantee all mandatory secrets are present.
2. **Database Schema Sync**: Verify zero destructive schema changes before rolling traffic.
3. **Health Validation**: Query `GET /api/ready` to verify container is ready for traffic.
