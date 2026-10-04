# Security Policy — Ekriti NEET Platform

## Supported Versions

Only the latest release running on the `main` branch is actively supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| latest (`main`) | :white_check_mark: |
| legacy branches | :x:                |

## Reporting a Vulnerability

The Ekriti NEET engineering team takes security vulnerabilities seriously.

If you believe you have discovered a vulnerability, please DO NOT open a public issue. Instead, report it privately via email:

**Email**: `security@ekriti.internal` (or via GitHub Private Vulnerability Reporting on this repository)

Please include:
1. Description of the vulnerability.
2. Step-by-step reproduction instructions or proof-of-concept.
3. Affected components or API endpoints.
4. Proposed remediation (if available).

Our security team will review and respond within 48 hours.

## Security Controls & Invariants

- **Zero-Secret Invariant**: Production credentials, database connection strings, and LLM API keys must never be committed to Git.
- **Client Security**: Correct exam answers and explanations are stripped from all active CBT session payloads sent to client browsers to prevent inspect-element inspection or cheating.
- **Data Protection**: Personal student performance data and test attempt logs are strictly partitioned per tenant/user with row-level ownership checks.
