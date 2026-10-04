# PRODUCTION ENVIRONMENT VARIABLES SPECIFICATION
**NEET UG 2027 Intelligent Preparation Platform**
*Authoritative Configuration Dictionary, Validation Rules, and Secret Hygiene*

---

## 1. Environment Variable Reference

| Variable Name | Required? | Example Value | Description |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | **Yes** | `postgresql://...` or `file:./dev.db` | Primary database connection string |
| `DIRECT_URL` | Optional | `postgresql://...` | Direct connection string for Prisma migrations bypassing PgBouncer |
| `NODE_ENV` | **Yes** | `production` / `development` | Runtime environment mode |
| `APP_URL` | **Yes** | `https://neet2027.example.com` | Public canonical base URL for webhook validation & emails |
| `AUTH_SECRET` | **Yes** | `c2a688b5...` (64-char hex) | Cryptographic secret for signing session cookies |
| `STORAGE_SIGNING_SECRET`| **Yes** | `a90d4f1...` (64-char hex) | HMAC key for signed private file download URLs |
| `PAYMENT_PROVIDER` | Optional | `SANDBOX` / `RAZORPAY` / `STRIPE` | Active payment provider adapter |
| `PAYMENT_WEBHOOK_SECRET`| **Yes** | `whsec_...` | HMAC secret for verifying incoming payment webhooks |
| `AI_PROVIDER_MODE` | Optional | `SYSTEM_ENGINE` / `EXTERNAL` | Primary AI inference provider (default: local grounded) |
| `NEXT_PUBLIC_APP_NAME` | Optional | `NEET UG 2027 Platform` | Client-facing brand title |

---

## 2. Fail-Fast Validation Rule

The application validates mandatory environment variables at boot. In production, missing `DATABASE_URL` or `AUTH_SECRET` causes an immediate process exit (`code 1`) with structured log output, preventing silent execution in unauthenticated or insecure states.

---

## 3. Secret Hygiene Standards

* Secrets must **NEVER** be committed to version control (`.env` is git-ignored).
* All secrets are stripped from application logs via [`StructuredLogger.sanitize`](file:///C:/Users/sagar/.gemini/antigravity/scratch/neet-cbt-platform/src/lib/saas/observability/logger.ts).
* Use cloud secret managers (AWS Secrets Manager, Supabase Vault, Doppler) for production deployments.
