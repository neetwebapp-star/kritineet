# SOURCE VERIFICATION & FAILURE RECOVERY

## 1. Domain Allowlist & SSRF Safeguards
All outbound crawler fetches are strictly validated against:
- `nta.ac.in`
- `www.nta.ac.in`
- `neet.nta.nic.in`
- `www.nmc.org.in`
- `nmc.org.in`

Any attempt to fetch from private IP addresses (`10.x`, `127.x`, `192.168.x`, `localhost`) or untrusted external domains is aborted immediately before socket initialization.

---

## 2. Cryptographic Document Hashing
- Every retrieved PDF and web payload is hashed using **SHA-256**.
- The hash is stored as `documentHash` on both `OfficialDocument` and `OfficialNotification`.
- If a document's SHA-256 hash matches an existing record, the system treats it as an exact duplicate and creates zero redundant alerts or feed items.
- If the content of a document URL changes, a new `OfficialDocumentVersion` record is instantiated (`changeType = REVISED`), preserving full historical provenance.

---

## 3. Failure Handling & Exponential Backoff
- If an official government server times out, returns HTTP 5xx, or is temporarily inaccessible:
  1. The event is recorded as `FETCH_FAILED` in `OfficialSourceCheck`.
  2. The source status transitions to `OUTAGE` or `DEGRADED`.
  3. **Zero fabricated or fallback content is created.** The system never invents a placeholder notice.
  4. The student UI displays the last successfully verified timestamp with transparent notice:
     *"Official source temporarily unavailable. Last successfully verified: [timestamp]"*.
  5. Exponential backoff retry schedule: 5m $\rightarrow$ 15m $\rightarrow$ 30m $\rightarrow$ 60m.
