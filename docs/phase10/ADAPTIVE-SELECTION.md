# Adaptive Selection 2.0 & Item Exposure Engine

## 1. Objective

Adaptive Selection 2.0 advances Phase 4's concept-mastery adaptive engine into an **evidence-aware, psychometrically balanced item recommender**.

Rather than selecting items purely on concept weakness, the engine computes a composite multi-factor fitness score for candidate items while applying non-linear penalties for overexposure.

---

## 2. Multi-Factor Item Selection Model

For student $S$ with target subject/chapter and candidate question $Q$, the composite priority score is computed as:

$$\text{Score}(Q, S) = W_{\text{weakness}} + W_{\text{diff}} + W_{\text{disc}} + W_{\text{quality}} + W_{\text{source}} - P_{\text{exposure}}$$

### Component Formulas

1. **Weakness Alignment ($W_{\text{weakness}} \in [0, 40]$)**:
   $$W_{\text{weakness}} = 40 \times (1.0 - \text{Mastery}(S, Q.\text{concept}))$$
   Focuses practice on unmastered concepts.

2. **Difficulty Match ($W_{\text{diff}} \in [0, 25]$)**:
   Points awarded based on student baseline accuracy band:
   * If Student Mastery $< 40\%$ and Item is `EASY`: $+25$
   * If Student Mastery $40\%-75\%$ and Item is `MEDIUM`: $+25$
   * If Student Mastery $> 75\%$ and Item is `HARD`: $+25$
   * Other adjacent pairings: $+10$

3. **Discrimination Bonus ($W_{\text{disc}} \in [0, 15]$)**:
   $$W_{\text{disc}} = \max(0, Q.D) \times 15$$
   Prioritizes high-discriminating items that provide crisp diagnostic feedback.

4. **Quality Score ($W_{\text{quality}} \in [0, 10]$)**:
   $$W_{\text{quality}} = Q.\text{qualityScore} \times 10$$
   Favors structurally verified, non-ambiguous questions.

5. **Authoritative Source Bonus ($W_{\text{source}} \in [0, 10]$)**:
   * `PYQ` (NEET official past paper): $+10$
   * `NCERT_EXEMPLAR` / `FINGERTIPS`: $+6$
   * Other: $+2$

---

## 3. Exposure Regulation & Fatigue Control

### Exposure State Transitions

```
[ UNSEEN ] (Count = 0)
    |
    v (First view)
[ SEEN ] (Count = 1)
    |
    v (Answered)
[ PRACTICED ] (Count = 2..4)
    |
    +---> (Answered correctly >= 3 times) ---> [ MASTERED ]
    |
    +---> (Exposure count >= 5) ------------> [ OVEREXPOSED ]
```

### Overexposure Penalty ($P_{\text{exposure}}$)
To prevent question memorization and preserve diagnostic validity:
* If $Q.\text{exposureCount} \ge 5$: $P_{\text{exposure}} = 100$ (effectively removes item from normal adaptive queues).
* If $Q.\text{exposureCount} = 4$: $P_{\text{exposure}} = 40$.
* If $Q.\text{exposureCount} = 3$: $P_{\text{exposure}} = 20$.
* If $Q.\text{exposureCount} \le 2$: $P_{\text{exposure}} = 0$.

---

## 4. Explainable Selection Rationale (`selectedBecause`)

Every item returned by `AdaptiveEngineV2` includes a transparent, deterministic audit array `selectedBecause`. This eliminates "black-box" confusion for mentors and students:

```json
{
  "questionId": "Q_AIIMS_2006_PHY_001",
  "priorityScore": 78.5,
  "selectedBecause": [
    "Targets weak concept: CONCEPT_NEWTON_2ND_LAW (Mastery: 22%)",
    "Matches current learning level: EASY",
    "High psychometric discrimination index: D = 0.52",
    "Authoritative NEET Past Year Question (PYQ)"
  ]
}
```

---

## 5. Content Gap Detection (`detectContentGaps`)

The engine continuously audits the question bank against the Phase 2 Knowledge Graph to identify coverage deficits:

1. **`CONCEPT_WITHOUT_PRACTICE`**: A canonical NCERT concept has 0 verified questions linked to it.
2. **`CONCEPT_WITHOUT_PYQ`**: A high-frequency NEET concept has zero past-year exam questions mapped.
3. **`CONCEPT_UNBALANCED_DIFFICULTY`**: A concept has only EASY questions without MEDIUM or HARD assessment depth.
