# Phase 13 — Production Release Checklist

Before promoting any release to production, every check in this checklist must be satisfied:

- [x] **Acceptance Tests**: 75 / 75 Phase 13 tests PASS.
- [x] **Full Regression**: 531 / 531 platform regression tests PASS (Phases 2 through 13).
- [x] **TypeScript Typecheck**: `pnpm exec tsc --noEmit` exits with 0 errors.
- [x] **Production Build**: `pnpm build` completes with 131/131 routes successfully compiled.
- [x] **Security Audit**: IDOR, Tenant Isolation, Prompt Injection, and Rate Limiting verified.
- [x] **Environment Validation**: `EnvValidator.assertProductionReady()` succeeds.
- [x] **Database Migration Check**: Zero destructive column drops; backward compatibility confirmed.
- [x] **Database Backup**: Valid snapshot created and verified via restore test.
- [x] **Health Probes**: `/api/health`, `/api/ready`, and `/api/worker-health` return 200 with verified status.
- [x] **No Fake Telemetry**: Dashboards display only verified live health states (`HEALTHY`, `DEGRADED`, `UNAVAILABLE`).
- [x] **Rollback Plan**: Rollback procedures verified and documented in `DISASTER-RECOVERY.md`.
