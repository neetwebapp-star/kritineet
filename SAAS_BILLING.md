# SAAS BILLING, SUBSCRIPTIONS & FEATURE ENTITLEMENT ARCHITECTURE
**NEET UG 2027 Intelligent Preparation Platform**
*Authoritative Billing Engine, Payment Abstraction, and Entitlement Specifications*

---

## 1. Plan Architecture & Pricing Tiers

Managed via [`PlanEngine`](file:///C:/Users/sagar/.gemini/antigravity/scratch/neet-cbt-platform/src/lib/saas/billing/plan-engine.ts):

| Plan | Price (INR) | Interval | Target Audience | Key Feature Entitlements |
| :--- | :---: | :---: | :--- | :--- |
| **FREE** | ₹0 | Monthly | Casual Self-Study | NCERT Reading, 20 Practice Qs/day, 10 PYQs/day, 5 AI Doubts/day |
| **STUDENT** | ₹999 | Monthly | Dedicated Aspirant | Unlimited Practice & PYQs, Fingertips, 4 CBT Mocks/month, 50 AI Doubts/day, Parent Portal |
| **PRO** | ₹1,999 | Monthly | High-Intensity Aspirant | Unlimited AI Tutor, Unlimited CBT Mocks, Advanced Analytics, Mentor Portal, Image Doubt Solver |
| **INSTITUTE**| ₹9,999 | Monthly | Coaching Centers / Schools | Multi-Tenant Organization, Custom Tests, Multi-Mentor Workspaces, Batch Enrollment, Bulk Assignments |

---

## 2. Subscription State Machine

Managed via [`SubscriptionEngine`](file:///C:/Users/sagar/.gemini/antigravity/scratch/neet-cbt-platform/src/lib/saas/billing/subscription-engine.ts):

```
New Tenant ───► TRIAL (7-14 Days Server Calculated)
                  │
                  ├─────► Payment Succeeded ────► ACTIVE
                  │                                  │
                  │                                  ├─────► Renewal Failed ──► PAST_DUE
                  │                                  ├─────► User Request ───► CANCELLED
                  │                                  └─────► Term End ───────► EXPIRED
                  │
                  └─────► Trial Expiration ─────────────────────────────────► EXPIRED (Fallback to FREE)
```

---

## 3. Server-Side Feature Entitlements

Feature gating is enforced strictly server-side by [`EntitlementEngine.canAccessFeature`](file:///C:/Users/sagar/.gemini/antigravity/scratch/neet-cbt-platform/src/lib/saas/billing/entitlement-engine.ts). Client-side UI manipulation can never bypass feature restrictions.

* **Usage Limits**: Managed via [`UsageEngine`](file:///C:/Users/sagar/.gemini/antigravity/scratch/neet-cbt-platform/src/lib/saas/billing/usage-engine.ts) using `UsageCounter` tracking:
  - `AI_MESSAGES` (Daily)
  - `AI_IMAGE_QUESTIONS` (Daily)
  - `MOCK_TESTS` (Monthly)
  - `QUESTIONS_DAILY` (Daily)
  - `EXPORTS_MONTHLY` (Monthly)

---

## 4. Payment Provider Abstraction & Webhook Security

* **Provider Interface**: [`PaymentProvider`](file:///C:/Users/sagar/.gemini/antigravity/scratch/neet-cbt-platform/src/lib/saas/billing/payment-provider.ts) standardizes customer creation, checkout sessions, and payment verification.
* **Webhook Idempotency**: [`WebhookHandler`](file:///C:/Users/sagar/.gemini/antigravity/scratch/neet-cbt-platform/src/lib/saas/billing/webhook-handler.ts) validates HMAC-SHA256 signatures, logs incoming payloads into `PaymentWebhookEvent`, and rejects duplicates to prevent double-charging or replay attacks.
* **Coupons**: Validated server-side by [`CouponEngine`](file:///C:/Users/sagar/.gemini/antigravity/scratch/neet-cbt-platform/src/lib/saas/billing/coupon-engine.ts) with expiration, maximum redemptions, and plan applicability constraints.
