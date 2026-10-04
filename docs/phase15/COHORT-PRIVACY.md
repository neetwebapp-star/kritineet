# Cohort Analytics, Multi-Tenancy & Privacy Governance

## 1. Privacy-Preserving Cohort Aggregations
Cohort analytics provide institutions and mentors with aggregate performance distributions while strictly protecting student privacy:
- **Zero Raw PII**: Cohort aggregates strip all names, email addresses, phone numbers, and IP addresses.
- **K-Anonymity Minimum**: Aggregations require a minimum of $N \ge 10$ active students before publishing distributions.
- **Multi-Tenant Isolation**: Queries strictly enforce `tenantId` boundaries. No institution can ever inspect another organization's cohort data.

---

## 2. Distribution Statistics (Non-Parametric)
Rather than relying solely on mean and standard deviation (which are susceptible to extreme outliers), cohort performance uses percentiles:
- **P25**: 25th percentile (lower quartile)
- **P50**: Median performance
- **P75**: 75th percentile (upper quartile)
- **P90**: 90th percentile

---

## 3. Outlier & Telemetry Quality Management
Telemetry anomalies are handled scientifically:
- **Rapid Attempts ($< 2$ seconds)**: Flagged as `SUSPICIOUS_SPEED` (potential unread guessing).
- **Impossible Durations ($> 24$ hours or negative seconds)**: Quarantined into `LearningDataQualityEvent` and excluded from longitudinal aggregates.
- **Duplicate Telemetry Events**: Idempotently ignored via unique event hashes.
