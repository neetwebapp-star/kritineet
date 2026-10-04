# Longitudinal Trend Methodology & Algorithms

## 1. Core Principles
The **Learning Trend Engine** evaluates whether a student's accuracy, pacing, or retention is changing over a specified time window ($W$, default 30 days).

Key constraints:
1. **Minimum Sample Size ($N_{\min} = 5$)**: Never classify a trend if fewer than 5 attempts exist in the window. Return `INSUFFICIENT_DATA` with `confidence: 'INSUFFICIENT_DATA'`.
2. **Confidence Grading**:
   - `HIGH`: $N \ge 30$ and $W \ge 14$ days.
   - `MODERATE`: $N \ge 15$ and $W \ge 7$ days.
   - `LOW`: $N \ge 5$.
   - `INSUFFICIENT_DATA`: $N < 5$.

---

## 2. Trend Direction Calculation

### 2.1 Mid-Point Window Partition
The time window $[t - W, t]$ is divided into an earlier period $[t - W, t - W/2)$ and a recent period $[t - W/2, t]$.
$$\text{Accuracy}_{\text{early}} = \frac{\sum_{\text{early}} \mathbb{I}(\text{correct})}{N_{\text{early}}}$$
$$\text{Accuracy}_{\text{recent}} = \frac{\sum_{\text{recent}} \mathbb{I}(\text{correct})}{N_{\text{recent}}}$$
$$\Delta = \text{Accuracy}_{\text{recent}} - \text{Accuracy}_{\text{early}} \quad (\text{expressed in percentage points})$$

### 2.2 Volatility Detection
To avoid misclassifying wild oscillations as steady improvement, a sliding-window volatility check is computed:
- The attempts are partitioned into chunks of size $k = \max(3, \lfloor N / 4 \rfloor)$.
- Chunk accuracies $\{a_1, a_2, \dots, a_m\}$ are calculated.
- If the standard deviation $\sigma(a) \ge 0.22$ across at least 3 chunks:
  $$\text{Direction} = \text{VOLATILE}$$
- Otherwise:
  - If $\Delta \ge +5.0\%$: $\text{Direction} = \text{IMPROVING}$
  - If $\Delta \le -5.0\%$: $\text{Direction} = \text{DECLINING}$
  - Otherwise: $\text{Direction} = \text{STABLE}$

---

## 3. Evidence Generation
Every trend result includes human-readable evidence text detailing:
- Exact subject, chapter, or question type evaluated.
- Initial accuracy, final accuracy, and delta in percentage points.
- Sample size ($N$) and observation window in days.
- Zero moralizing or speculative claims about student motivation.
