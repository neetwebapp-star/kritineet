# PRODUCTION DEPLOYMENT RUNBOOK & CI/CD PIPELINE
**NEET UG 2027 Intelligent Preparation Platform**
*Release Engineering, Multi-Environment Stages, and Rollback Operations*

---

## 1. Environments Overview

1. **DEVELOPMENT**: Local developer environment using local SQLite (`dev.db`) and sandbox payment providers.
2. **STAGING**: Identical cloud mirror of production using staging database, sandbox Razorpay/Stripe, and synthetic test cohorts.
3. **PRODUCTION**: High-availability managed database, strict HTTPS, CDN caching, and live monitoring.

---

## 2. CI/CD Pipeline Stages

Every deployment follows strict automated validation gates before promoting to production:

```
Code Push (git)
      ↓
Lint & Code Quality (eslint)
      ↓
TypeScript Typecheck (tsc --noEmit)
      ↓
Phase Acceptance Tests (tests/phase8_acceptance.test.ts)
      ↓
Full Cross-Phase Regressions (Phases 2-7: 199 tests)
      ↓
Production Next.js Build (pnpm build)
      ↓
Staging Automated Smoke Test (/api/health/ready)
      ↓
Production Deployment & Traffic Promotion
```

---

## 3. Pre-Deployment Checklist

- [ ] All 44 Phase 8 automated tests pass (`npx tsx tests/phase8_acceptance.test.ts`).
- [ ] All 199 cumulative regression tests pass across Phases 2 through 7.
- [ ] Production build succeeds with 0 errors (`pnpm build`).
- [ ] Database backup executed and verified.
- [ ] Required environment variables validated.

---

## 4. Production Release Command Sequence

```bash
# 1. Fetch latest release tag
git checkout tags/v8.0.0

# 2. Install frozen production dependencies
pnpm install --frozen-lockfile

# 3. Apply Prisma database schema push
npx prisma db push

# 4. Generate Prisma Client
npx prisma generate

# 5. Build Next.js production bundle
pnpm build

# 6. Verify health probes
curl -I http://localhost:3000/api/health
curl -I http://localhost:3000/api/health/ready

# 7. Start production server process
pnpm start
```

---

## 5. Post-Deployment Verification

1. Query `/api/health`: Verify `status === "OPERATIONAL"`.
2. Query `/api/health/ready`: Verify HTTP 200 `ready: true`.
3. Check `/admin/system`: Confirm p50 latency $< 100$ms and 0 dead-letter queue jobs.
