# Phase 14: Source Provenance & Strict Separation Architecture

## 1. Core Principle
Educational sources are categorically segregated into distinct tiers. Under no circumstances may authoritative source materials be conflated or mutated.

```text
TIER 1 (Authoritative Official) : NCERT Textbooks, Official NEET / NTA PYQs
TIER 2 (Licensed Reference)     : MTG Fingertips, Standard Reference Works
TIER 3 (Synthesized / Derived)  : Generated Practice Drills, System Explanations
```

## 2. Invariants
1. `FINGERTIPS ≠ PYQ ≠ NCERT`: Source types must never be interchanged or merged.
2. Every PYQ item maintains authenticated provenance:
   - `examYear` (1995–2024 verified only)
   - `examName` (NEET, AIPMT, AIIMS)
   - `sourceDocument` (Official paper code PDF)
   - `status` (`VERIFIED` vs `UNVERIFIED`)
3. NCERT sections and textbook questions preserve exact book title, edition, chapter, and page references.
4. Fingertips reference items track edition and publisher copyright metadata.

## 3. Provenance Auditing
All modifications to content, mapping, or source classification write immutable records to the `ContentQualityEvent` audit table, linking:
- Actor ID & Role
- Previous vs New State Snapshot
- Justification / Change Reason
- Timestamp & System Signature
