# Question Quality, Anomaly Detection & Lifecycle Management

## 1. Automated Anomaly Detection (`AnomalyDetector`)

The `AnomalyDetector` continuously analyzes item structure and empirical response behavior to flag problematic questions before they degrade student testing experiences.

### Detected Anomaly Types & Severity

| Anomaly Type | Category | Severity | Detection Rule |
|:---|:---|:---|:---|
| `BROKEN_QUESTION` | Structural | CRITICAL | Question text length $< 10$ characters or corrupted characters. |
| `MISSING_IMAGE` | Structural | HIGH | Question text mentions diagram/figure ("shown below", "in the diagram") but 0 figures are attached. |
| `ANSWER_KEY_CONCERN` | Behavioral | CRITICAL | Accuracy $< 15\%$ on an item authored as EASY, or high performers consistently choose a distractor. |
| `AMBIGUOUS_OPTIONS` | Behavioral | HIGH | A non-keyed option receives $\ge 30\%$ selection rate, or two options each receive $\ge 30\%$. |
| `LOW_DISCRIMINATION` | Statistical | MEDIUM | $D < 0.10$ after at least 30 attempts, failing to differentiate mastery levels. |
| `EXTREME_TIME_PATTERN` | Statistical | MEDIUM | Median response time ($p50$) $> 180$ seconds. |
| `CONCEPT_MISMATCH` | Alignment | LOW | Student error profile diverges from the linked primary concept. |

---

## 2. Question Lifecycle States

Each question transitions through a formal lifecycle state:

```
          [ INGESTION ]
                |
                v
          +------------+     Negative D or Anomaly
          |   ACTIVE   | ----------------------------+
          +------------+                             |
             ^      |                                |
   Restored  |      | High Uncertainty               v
             |      v                           +------------------+
             |  +-----------+                   | REVIEW_REQUIRED  |
             +--| MONITORED |                   +------------------+
                +-----------+                            |
                                      +------------------+------------------+
                                      |                                     |
                                      v                                     v
                          +------------------------+             +--------------------+
                          | TEMPORARILY_SUPPRESSED |             |      RETIRED       |
                          +------------------------+             +--------------------+
```

### State Definitions
1. **ACTIVE**: Available for all mock tests, practice sessions, and adaptive queues.
2. **MONITORED**: Psychometrics are unstable or sample size is borderline; item is kept under observation with strict exposure limits.
3. **REVIEW_REQUIRED**: Significant anomaly detected (e.g. answer key dispute or negative discrimination); excluded from high-stakes mocks.
4. **TEMPORARILY_SUPPRESSED**: Temporarily removed from all test generation and practice queues while editorial reviews take place.
5. **RETIRED**: Permanently decommissioned due to structural flaws, curriculum obsolescence, or unresolvable ambiguity.

---

## 3. Answer Key Disputes & Controlled Governance

### Zero Uncontrolled Mutation Invariant
When a student or teacher challenges an answer key:
1. An `ANSWER_KEY_DISPUTE` review record is filed.
2. The question is **never** automatically mutated.
3. The platform enters the question into `QuestionReview` with status `UNDER_REVIEW`.
4. Only an authorized administrator or subject expert can resolve the dispute after examining empirical option distributions.

### Historical Attempt Immutability
When an answer key is corrected or stem text is revised:
* A new `QuestionVersion` is created with an incremented `versionNumber`.
* Existing `StudentResponse` records remain locked to `questionVersionId` and `correctOptionAtAttempt`.
* Historical mock scores, percentiles, and exam reports remain 100% immutable and reproducible.

---

## 4. Test Blueprint Quality Report (`evaluateTestQuality`)

Before any test is published or delivered, the `BlueprintEngine` runs an 11-dimension psychometric audit:

1. **Question Count Check**: Verifies exact question count against NEET blueprint (e.g. 180 questions).
2. **Duration Check**: Verifies duration (e.g. 200 minutes).
3. **Subject Distribution**: Enforces NEET 45 Physics, 45 Chemistry, 90 Biology.
4. **Difficulty Balance**: Enforces target difficulty ratios (e.g. 30% Easy, 50% Medium, 20% Hard).
5. **Source Separation**: Verifies distribution of PYQ, Fingertips, and NCERT Exemplar items.
6. **Suppressed Item Exclusion**: Asserts 0 suppressed or retired questions are present.
7. **Syllabus Verification**: Asserts 0 outdated syllabus questions are present.
8. **Discrimination Floor**: Flags tests where $> 15\%$ of items exhibit $D < 0.20$.
9. **Ambiguity Ceiling**: Flags tests where any item has ambiguity score $> 0.50$.
10. **Duplicate Identity Prevention**: Ensures no duplicate fingerprint questions exist.
11. **Image Integrity**: Verifies all diagram-based questions have valid, accessible figure assets.
