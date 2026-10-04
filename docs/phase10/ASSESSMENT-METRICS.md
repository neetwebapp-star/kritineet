# Psychometric Assessment Metrics Reference

## 1. Classical Test Theory (CTT) Foundation

The NEET UG 2027 Assessment Engine evaluates question quality using Classical Test Theory principles, augmented by empirical response-time distributions and distractor behavior analysis.

---

## 2. Sample Size Thresholds & Statistical Confidence

To avoid fabricating statistical precision when sample sizes are small, the engine enforces strict confidence tiers:

$$\text{Confidence Tier} = \begin{cases} 
\text{INSUFFICIENT} & N < 10 \\ 
\text{LOW} & 10 \le N < 30 \\ 
\text{MEDIUM} & 30 \le N < 100 \\ 
\text{HIGH} & N \ge 100 
\end{cases}$$

### Zero-Fabrication Rule
* When $N < 10$, statistical confidence is strictly `INSUFFICIENT`.
* Observed difficulty defaults to authored difficulty without inventing empirical accuracy rates.
* Discrimination index is not computed ($D = \text{null}$) until at least 10 attempts are recorded.

---

## 3. Observed Difficulty ($P$)

Observed difficulty represents empirical item facility, defined as the proportion of students who answered the question correctly:

$$P = \frac{R_{\text{correct}}}{N_{\text{total}}}$$

### Categorization Boundaries
The platform maps empirical accuracy rate ($P \times 100\%$) into standard assessment tiers:
* **EASY**: $P \ge 75\%$ (Accuracy $\ge 75\%$)
* **MEDIUM**: $40\% \le P < 75\%$ (Accuracy $40\% - 74\%$)
* **HARD**: $P < 40\%$ (Accuracy $< 40\%$)

### Difficulty Migration
The system monitors drift between authored difficulty and observed difficulty:
* **Easier than Authored**: Item authored as `HARD` but exhibiting $P \ge 75\%$.
* **Harder than Authored**: Item authored as `EASY` but exhibiting $P < 40\%$.

---

## 4. Discrimination Index ($D$)

Item discrimination measures how effectively a question differentiates between high-performing and low-performing candidates.

### Upper / Lower 27% Method (Kelley's Rule)
For a cohort of $N$ students ranked by total test score:
1. Identify the top 27% ($U$, Upper Group) and bottom 27% ($L$, Lower Group).
2. Let $n_u = n_l = \text{round}(0.27 \times N)$ (minimum 2 students per group).
3. Count correct responses in the upper group ($R_u$) and lower group ($R_l$).
4. Compute:

$$D = \frac{R_u - R_l}{n_u}$$

Where $D \in [-1.0, 1.0]$.

### Interpretation Standards
| Discrimination ($D$) | Evaluation | Operational Action |
|:---|:---|:---|
| **$D \ge 0.40$** | Excellent | Prime item for NEET mock exams and diagnostic evaluations |
| **$0.30 \le D < 0.40$** | Good | Standard item; no revision needed |
| **$0.20 \le D < 0.30$** | Marginal | Acceptable for practice; flagged for monitoring in high-stakes mocks |
| **$0.00 \le D < 0.20$** | Poor | Fails to differentiate; triggers `LOW_DISCRIMINATION` anomaly |
| **$D < 0.00$** | Negative | Lower group outperforms upper group; triggers `ANSWER_KEY_CONCERN` or `AMBIGUOUS_OPTIONS` |

---

## 5. Distractor Effectiveness Analysis

Every non-keyed option is evaluated to determine candidate attraction patterns:

Let $f_i$ be the selection frequency of option $i$, and $P_i = \frac{f_i}{N}$ be its selection rate.

### Distractor Categories
1. **KEY**: The officially keyed correct answer.
2. **STRONG**: A plausible distractor attracting between $15\%$ and $29.9\%$ of test takers ($0.15 \le P_i < 0.30$).
3. **WEAK**: A non-functioning distractor chosen by fewer than $5\%$ of test takers ($P_i < 0.05$). Indicates transparent filler options.
4. **AMBIGUOUS**: A distractor attracting $30\%$ or more of test takers ($P_i \ge 0.30$). Signals potential double-keying or misleading phrasing.
5. **SUSPICIOUS**: A distractor selected by more high-ability candidates (upper 27%) than low-ability candidates ($R_{u, i} > R_{l, i}$).
6. **NORMAL**: Standard functioning distractor ($0.05 \le P_i < 0.15$).

---

## 6. Response Time Percentiles

Raw average time is vulnerable to outliers (e.g. students walking away from their screen). The engine computes rank-based percentiles from sorted response times $T = [t_1, t_2, \dots, t_N]$:

* **p25 (First Quartile)**: $T[\text{round}(0.25 \times N)]$
* **p50 (Median)**: $T[\text{round}(0.50 \times N)]$
* **p75 (Third Quartile)**: $T[\text{round}(0.75 \times N)]$
* **p90 (Ninetieth Percentile)**: $T[\text{round}(0.90 \times N)]$

### Extreme Time Consumption Anomaly
An item is flagged with `EXTREME_TIME_PATTERN` if:
$$\text{p50} > 180\text{ seconds (3.0 minutes for a standard NEET question)}$$

---

## 7. Ambiguity Score ($A$)

The ambiguity score aggregates multiple warning signs of poorly formulated questions into a normalized $[0.0, 1.0]$ index:

$$A = \min\left(1.0, w_d \cdot I_{\text{distractor}} + w_{neg} \cdot I_{D < 0} + w_{comp} \cdot I_{\text{competing}}\right)$$

Where:
* $I_{\text{distractor}} = 0.4$ if any distractor attracts $\ge 30\%$ of responses.
* $I_{D < 0} = 0.5$ if discrimination index is negative.
* $I_{\text{competing}} = 0.3$ if two distractors each attract $\ge 20\%$ of responses.

---

## 8. Test Reliability: Spearman-Brown Formula

Mock tests and CBT assessments evaluate split-half internal consistency using the Spearman-Brown prophecy formula:

Let $r_{12}$ be the Pearson correlation between scores on odd-numbered questions and even-numbered questions:

$$r_{sb} = \frac{2 \cdot r_{12}}{1 + r_{12}}$$

### Benchmark Standards
* **$r_{sb} \ge 0.85$**: High reliability (suitable for official ranking and percentile predictions).
* **$0.70 \le r_{sb} < 0.85$**: Acceptable reliability.
* **$r_{sb} < 0.70$**: Low reliability; test blueprint requires item recalibration.
