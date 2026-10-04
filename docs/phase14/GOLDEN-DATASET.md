# Phase 14: Golden Dataset & Extraction Regression Engine

## 1. Overview
The Golden Dataset Engine ensures that changes to ingestion pipelines, OCR engines, or parser algorithms do not silently degrade extracted content quality.

## 2. Architecture
- **Controlled Benchmark Corpus**: Canonical reference items in Physics, Chemistry, and Biology are stored with vetted text, equations, and diagrams in `ContentGoldenDatasetItem`.
- **Extraction Comparator**: Compares candidate extraction outputs against golden reference records across 4 severity tiers:
  - `EXACT_MATCH`: 100% character and formatting correspondence.
  - `NORMALIZED_MATCH`: Minor whitespace or formatting variances with zero semantic difference.
  - `TEXT_MUTATION`: Exponent, formula constant, or scientific phrase modified.
  - `SEVERE_LOSS`: Significant portion of text or diagram missing (>20% difference).

## 3. Regression Automation
Prior to running bulk corpus migrations or updating ingestion parsers:
1. Automated worker job `golden-dataset-regression` executes against all active golden dataset items.
2. If any item detects `TEXT_MUTATION` or `SEVERE_LOSS`, the migration run is halted and flagged for administrative inspection.
