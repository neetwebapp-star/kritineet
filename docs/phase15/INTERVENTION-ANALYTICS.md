# Pedagogical Interventions & Educational Experiment Analytics

## 1. Multi-Horizon Intervention Tracking
Pedagogical interventions (e.g., targeted NCERT rereading, error book drills, spaced revisions, formula flashcards) must not rely on immediate impressions alone. Phase 15 measures efficacy across three distinct temporal horizons:

| Horizon | Evaluation Window | Purpose |
| :--- | :--- | :--- |
| **IMMEDIATE** | 0 – 24 Hours | Verifies comprehension of the specific intervention topic. |
| **SHORT_TERM_7D** | 7 Calendar Days | Verifies transfer to related concepts and chapter-level tasks. |
| **DELAYED_30D** | 30 Calendar Days | Evaluates long-term stability and resistance to performance decay. |

---

## 2. Non-Causal Reporting Standard
In all reports, intervention outcomes are stated in strictly correlational and descriptive terms:
- **Approved**: "Following the 45-minute NCERT formula review intervention, rotational dynamics accuracy shifted from 40% to 65% (+25 percentage points) across 15 questions over the subsequent 7 days."
- **Forbidden**: "The formula review cured the student's physics weakness."

---

## 3. Educational Experiments (A/B Testing)
Controlled experiments test educational delivery methods (e.g. Socratic guiding prompts vs direct worked examples, practice test ordering) without degrading content quality or altering authoritative syllabus coverage.

### Experiment Safety Rules:
1. **Zero Content Distortion**: Both experiment variants must use identical verified, published questions.
2. **Deterministic Assignment**: Students are assigned deterministically via `hash(userId + experimentId) % 100` to avoid assignment drift.
3. **No Fabricated P-Values**: If sample size is below the statistical threshold ($N < 30$), the system reports `status: 'INCONCLUSIVE'` with an explicit sample count rather than computing bogus p-values.
4. **Tenant Scoping**: Institutional experiments are strictly scoped to the tenant organization.
