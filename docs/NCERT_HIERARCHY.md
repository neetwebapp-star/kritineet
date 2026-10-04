# NEET UG 2027 — NCERT Syllabus Hierarchy Specification

## Canonical Navigation Tree

The application implements a 7-level strict hierarchy:

```text
NCERT
  └── Class (Class 11, Class 12)
        └── Subject (Biology, Chemistry, Physics)
              └── Book (e.g., Biology Part 1, Chemistry Part 2)
                    └── Unit (e.g., Unit 1: Diversity in the Living World)
                          └── Chapter (e.g., Chapter 2: Biological Classification)
                                └── Topic (e.g., 2.1 Kingdom Monera)
                                      └── Subtopic (e.g., 2.1.1 Archaebacteria)
```

## Structure Verification

- **Class Levels**:
  - `CLASS_11`: Order 1, includes Biology (Class 11), Chemistry (Class 11), Physics (Class 11).
  - `CLASS_12`: Order 2, includes Biology (Class 12), Chemistry (Class 12), Physics (Class 12).
- **Units**: 48 official units mapped.
- **Chapters**: 79 canonical chapters.
- **Topics**: 426 topics numbered sequentially (`1.1`, `1.2`, `2.1`, `2.2` ...).
- **Subtopics**: 397 subtopics with numbered subsections (`2.1.1`, `2.1.2` ...).

## API Contract

`GET /api/ncert/hierarchy?classLevel=11&subject=BIOLOGY` returns the deterministic hierarchy filtered as requested or in full, with each chapter annotated with topic counts, completed topics count, and completion percentage.
