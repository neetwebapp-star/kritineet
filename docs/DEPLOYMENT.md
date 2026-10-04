# Production Deployment Runbook — Ekriti NEET Preparation Platform

This document details the production deployment architecture, environment configuration, database migration strategy, monitoring, and failover runbooks for the **Ekriti NEET Preparation Platform**.

---

## 1. System Requirements & Architecture

### Compute & Runtime
- **Node.js**: `v20.x`, `v22.x` (Recommended LTS), or `v24.x`
- **Memory**: Minimum 2 GB RAM (4 GB+ recommended for high-concurrency CBT exam sessions)
- **CPU**: 2+ vCPUs recommended for peak exam loads
- **Storage**: Minimum 10 GB SSD for application runtime, static figures, and local cache

### Database Requirements
- **Development**: Local SQLite (`DATABASE_URL="file:./dev.db"`)
- **Production**: PostgreSQL 15+ (Hosted on AWS RDS, Supabase, Neon, or Railway)
  - Connection pooling recommended (e.g. PgBouncer or Supabase connection pooler on port 6543)
  - Set `DIRECT_URL` for migration execution and `DATABASE_URL` with transaction pooling for the application runtime.

---

## 2. Environment Variables Contract

| Variable | Required | Default / Format | Description |
|---|---|---|---|
| `NODE_ENV` | Yes | `production` | Node environment runtime mode |
| `DATABASE_URL` | Yes | `file:./dev.db` or `postgresql://...` | Connection URI for Prisma ORM |
| `PORT` | No | `3000` | HTTP port for the web server |
| `NEXT_PUBLIC_APP_NAME` | No | `"Ekriti NEET"` | Public title used in application UI |
| `NEXT_PUBLIC_APP_URL` | Yes | `https://ekriti.example.com` | Canonical public URL of the application |
| `STORAGE_SIGNING_SECRET` | Yes | *(Random 32+ char hex/base64)* | HMAC key for media signing & session validation |
| `GEMINI_API_KEY` | Optional | `AIza...` | Google Gemini API key for AI study coach |
| `OPENAI_API_KEY` | Optional | `sk-...` | OpenAI API key for AI assistant features |
| `ANTHROPIC_API_KEY` | Optional | `sk-ant-...` | Anthropic Claude API key for deep reasoning features |
| `LOG_LEVEL` | No | `info` | Logging verbosity (`debug`, `info`, `warn`, `error`) |

---

## 3. Pre-Deployment Validation Checklist

Every release artifact must pass all four quality gates prior to production deployment:

```bash
# 1. Verify strict TypeScript compliance
pnpm exec tsc --noEmit

# 2. Verify ESLint static analysis
pnpm run lint

# 3. Execute Phase 2 acceptance test suite
pnpm exec tsx tests/phase2_acceptance.test.ts

# 4. Verify Next.js production compilation
pnpm run build
```

---

## 4. Deployment Strategies

### Option A: Vercel Deployment (Recommended for Next.js)

1. Connect the GitHub repository to Vercel.
2. In the Project Settings:
   - Framework Preset: **Next.js**
   - Node.js Version: **22.x**
   - Package Manager: **pnpm**
3. Configure Environment Variables in the Vercel dashboard:
   - `DATABASE_URL` (Hosted PostgreSQL)
   - `STORAGE_SIGNING_SECRET`
   - `NEXT_PUBLIC_APP_URL`
4. Build & Development Settings:
   - Build Command: `pnpm exec prisma generate && pnpm run build`
   - Install Command: `pnpm install`
5. Deploy.

---

### Option B: Docker / Container Deployment

Use the following multi-stage `Dockerfile` for minimal image footprint and fast startup:

```dockerfile
# Stage 1: Dependencies
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@11.24.0 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@11.24.0 --activate
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN npx prisma generate
RUN pnpm run build

# Stage 3: Runner
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
```

---

### Option C: Bare Metal / VPS Deployment (PM2 + systemd)

1. Provision server running Ubuntu 22.04 LTS or 24.04 LTS.
2. Install Node 22 LTS, pnpm, and PM2:
   ```bash
   npm install -g pnpm pm2
   ```
3. Clone and build:
   ```bash
   git clone https://github.com/qbitconnect/neet-cbt-platform.git /var/www/neet-cbt-platform
   cd /var/www/neet-cbt-platform
   pnpm install --frozen-lockfile
   pnpm exec prisma generate
   pnpm run build
   ```
4. Start via PM2 cluster mode:
   ```bash
   pm2 start npm --name "ekriti-cbt" -i max -- run start
   pm2 save
   pm2 startup
   ```
5. Configure Nginx reverse proxy with SSL (Let's Encrypt / Certbot).

---

## 5. Health Monitoring & Observability

The application exposes real-time health and diagnostics endpoints:

- **`/api/health`**: Comprehensive JSON health check verifying:
  - Application process status and uptime
  - Database connectivity and query latency (ms)
  - Persistent queue depth and dead-letter worker metrics
  - Local/Object storage availability
  - HTTP Status: `200 OK` (Healthy/Degraded) or `503 Service Unavailable`

### Automated Health Check Query
```bash
curl -I https://ekriti.example.com/api/health
```

---

## 6. Disaster Recovery & Rollback

1. **Database Snapshot**: Ensure automated daily snapshots and point-in-time recovery (PITR) are enabled on your PostgreSQL host.
2. **Git Version Pinning**: Production releases should tag canonical commits (e.g. `v1.0.0`, `v1.1.0`).
3. **Instant Rollback**: If a critical regression occurs, revert the deployment via Vercel instant rollback or trigger:
   ```bash
   git checkout <last-stable-tag>
   pnpm install --frozen-lockfile
   pnpm exec prisma generate
   pnpm run build
   pm2 restart ekriti-cbt
   ```
