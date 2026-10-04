# Student Baseline, Pacing & Assessment Privacy

## 1. Student Assessment Baseline (`StudentAssessmentBaseline`)

To evaluate individual performance without biased peer-pressure comparisons, each student maintains a self-referenced psychometric baseline:

* **Overall Accuracy Rate**: Cumulative correct response percentage.
* **Median Response Time**: Robust measure of solving speed (in seconds).
* **Speed Category**: `FAST`, `BALANCED`, `CAREFUL`, or `STRUGGLING`.
* **Category Accuracy Distributions**: Fine-grained accuracy maps across:
  * Subjects (`PHYSICS`, `CHEMISTRY`, `BIOLOGY`)
  * Chapters & Difficulty bands (`EASY`, `MEDIUM`, `HARD`)
  * Question types (`SINGLE_CORRECT`, `ASSERTION_REASON`, etc.)

---

## 2. Response Speed Pacing Engine

Individual question response times ($t_{\text{spent}}$) are evaluated relative to the student's own median pacing ($t_{\text{median}}$):

| Pacing Classification | Condition | Pedagogical Assessment |
|:---|:---|:---|
| **`TOO_FAST`** | $t_{\text{spent}} < 0.35 \times t_{\text{median}}$ | High risk of misreading or careless error. |
| **`NORMAL`** | $0.35 \times t_{\text{median}} \le t_{\text{spent}} \le 2.0 \times t_{\text{median}}$ | Healthy, focused solving tempo. |
| **`SLOW`** | $2.0 \times t_{\text{median}} < t_{\text{spent}} \le 3.5 \times t_{\text{median}}$ | Concept difficulty or calculation bottleneck. |
| **`EXTREMELY_SLOW`** | $t_{\text{spent}} > 3.5 \times t_{\text{median}}$ | Severe block or test fatigue. |

---

## 3. Probabilistic Careless Error Detection

Careless mistakes are systematically differentiated from true conceptual misunderstandings:

A student mistake is flagged as a **`Probabilistic Careless Error`** if all four criteria are met:
1. **Speed**: Response was marked `TOO_FAST` ($< 35\%$ of student's median solving time).
2. **Item Difficulty**: The question is empirically `EASY` ($P \ge 75\%$).
3. **Student Mastery**: The student's recorded mastery on the linked concept is $\ge 70\%$.
4. **Historical Competency**: The student previously solved similar questions on this concept correctly.

### Pedagogical Impact
Rather than re-teaching the core concept, the platform suggests pacing remediation: "You answered this question in 14 seconds compared to your normal 55s average. Slow down and underline key qualifiers like *'EXCEPT'*, *'NOT'*, or unit dimensions."

---

## 4. Privacy & Multi-Tenant Data Protection

### 4.1 Cohort Metric Anonymization
Item psychometrics (observed difficulty $P$, discrimination $D$, distractor distributions) are calculated using anonymized cohorts. Individual student IDs, names, and personal identities are completely dissociated from question assessment profiles.

### 4.2 Multi-Tenant Data Isolation (Phase 8 Invariant)
* Institutional tenants (coaching institutes, schools) access aggregate item psychometrics across their registered question bank.
* Student responses, personal baseline snapshots, and error book notes are strictly scoped by `tenantId` and `userId`.
* Cross-tenant access is unconditionally blocked by server-side query filters.
