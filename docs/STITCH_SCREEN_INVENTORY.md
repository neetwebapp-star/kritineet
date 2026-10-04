# GOOGLE STITCH SCREEN INVENTORY & ROUTE MAPPING
**Project ID**: `10830449034186223650`  
**Platform**: Kriti NEET UG 2027 Preparation & CBT OS  
**Audit Date**: October 2026  
**Implementation Status**: 100% Stitch-Compliant Architecture  

---

## 1. Executive Summary

This inventory maps every Google Stitch screen from the single source of truth project (`10830449034186223650`) to its live Next.js route in the application.

All 41 unique screens have been reconstructed to strictly follow the Stitch visual language:
- **Centralized Design System**: Exact Stitch tokens (`surface`, `surface-container-high`, `primary: #3525cd`, `primary-container: #4f46e5`, `secondary: #006c49`, `secondary-container: #6cf8bb`).
- **Icon Architecture**: 100% migrated from font-dependent ligatures to `<StitchIcon />` rendering native `lucide-react` SVG components. Zero raw text strings (`menu_book`, `expand_more`, `arrow_back_ios`, etc.).
- **Dual Responsive Shell**:
  - **Desktop (1024px+)**: `DesktopSidebar` (264px/288px fixed sidebar), `StitchHeader`, fluid multi-column grid, **NO mobile bottom bar**.
  - **Mobile (320px–767px)**: Top mobile header, `MobileBottomNav` with touch targets $\ge 44\text{px}$, zero horizontal overflow.

---

## 2. Master Screen Mapping Table

| # | Stitch Screen Template | Screen Title / Function | Live Application Route | Layout Structure | Status |
|---|---|---|---|---|---|
| 01 | `7b6bb5aa0adf48f48bc6a2a3d9bb5046.html` | Student Home Dashboard | `/` | 2-Col Desktop + Sidebar | Verified |
| 02 | `1caeb1bcde6f43d690106fbdc885141d.html` | Page 19 NCERT Reader | `/ncert/monera-archaebacteria` | 2-Col Reader + Side Notes | Verified |
| 03 | `0534c9f195cc4ddaa3f92a1371583aae.html` | Cognitive Audit & Distractor Lab | `/psychometrics/cognitive-audit` | Dual Column Audit | Verified |
| 04 | `0b68f3cc3cda4028ae09a113484d3a58.html` | WhatsApp Escalation Dispatch | `/admin/whatsapp-dispatch` | Admin Control Grid | Verified |
| 05 | `0cf7275cd78444d29783e30f5c0fdf97.html` | Distractor Breakdown Q05 | `/psychometrics/distractor-breakdown` | Psychometrics Lab | Verified |
| 06 | `17464f8cba314cd0a69c8ceb8ef4f21c.html` | Assertion Reason Drill Setup | `/drills/assertion-reason` | Interactive Quiz Shell | Verified |
| 07 | `17e9019863b34428b38f80c92fe9e8b5.html` | Topic Workspace • Biological Class. | `/workspace/topic` | Fluid Workstation | Verified |
| 08 | `1d87b3205ede41ada38e5d75625500ca.html` | PYQ Drill Session | `/drills/pyq-drill` | Timed Question Flow | Verified |
| 09 | `24f7f19d98cc460ab552f75c08373371.html` | NCERT Library Main | `/ncert` | Editorial Content Grid | Verified |
| 10 | `44e25b53fe1f42669e2fbe0511904410.html` | Assertion Reason Question 02 | `/drills/assertion-reason/q2` | Multi-statement Card | Verified |
| 11 | `45567db560364e73830d9893a89d5b5a.html` | Question Bank Search & Filters | `/question-bank` | Search + Facet Grid | Verified |
| 12 | `4dc8d0f7103843849a93f44fa0849629.html` | Daily Study Planner & Schedule | `/planner` | Task Sequencer | Verified |
| 13 | `656bb2c4e9c7443199f2af47f0c43f19.html` | AI Tutor Diagnostic Dialogue | `/ai-tutor/diagnostic` | Socratic Chat Interface | Verified |
| 14 | `72641f9146a643f2878e5ff4a7e9a405.html` | Rigor & Psychometric Report | `/psychometrics/rigor-report` | Analytical Report Card | Verified |
| 15 | `7a6835434a474690b98508a58e09283f.html` | Flashcards Deck • Monera | `/flashcards` | Interactive 3D Deck | Verified |
| 16 | `7a7c3f84efb6491a8b032bd8d861c7ec.html` | AI Tutor Socratic Context Chat | `/ai-tutor/context` | Sticky Chat Pane | Verified |
| 17 | `7e0a1aca91e349028701eb9218c43544.html` | Distractor Simulation Q01 | `/psychometrics/distractor-sim-q1` | Simulation Deck | Verified |
| 18 | `7e4097e1c0eb42e2977207d86c4aa4c4.html` | Topic Mindmap Visualizer | `/mindmaps` | Interactive SVG Graph | Verified |
| 19 | `928b65edb77e45dc9533ea8f5b150363.html` | Audio Mnemonics Player | `/mnemonics` | Audio Waveform Deck | Verified |
| 20 | `96a8bd932b34490fa2fbdbfd6f559dfd.html` | CBT Full Examination Simulator | `/cbt` | Full NTA Console | Verified |
| 21 | `a5616088f01e4f20b3101b0ebff170fe.html` | Remediation Error Audit | `/remediation/audit` | Error Attribution Card | Verified |
| 22 | `b89c5a35cb2448268f283766c0366468.html` | Distractor Simulation Engine | `/psychometrics/distractor-simulation` | Interactive Matrix | Verified |
| 23 | `b8ab8920bc5a4338a324fd6ea9c2bb64.html` | Saved Remediation List | `/remediation/saved` | Bookmark & Notes List | Verified |
| 24 | `b90ef2dc69674bc9b90bce5617fdf8f5.html` | CBT Result & Scorecard | `/cbt/results` | Scorecard & Breakdown | Verified |
| 25 | `be528b83a73747cd99ae9b027583f41e.html` | DPP Challenger Results | `/dpp/results` | Performance Card | Verified |
| 26 | `c08ddfc606b4463bbfae4a0a16bc44d1.html` | Batch Commit Audit | `/admin/commit-audit` | Audit Log Table | Verified |
| 27 | `c3b0240c298c41d2adc7ecfaf9512366.html` | Tuned DPP Daily Practice | `/dpp/tuned` | Question Card Series | Verified |
| 28 | `c8dfc77cc38c45b29a2abf796549e2e2.html` | DPP Challenger Mode | `/dpp/challenger` | Challenger Timer Bar | Verified |
| 29 | `d01044c63b074509a89bd6d4a1467023.html` | Error Notebook Review | `/error-book` | Categorized Error Log | Verified |
| 30 | `d04cf02bdf13475baf655346ce07050c.html` | PYQ Vault Explorer | `/pyq-vault` | Year-wise Exam Archive | Verified |
| 31 | `d1ea2a7f18534afaa9cbdc5e2c459959.html` | AI Tutor Main Desk | `/ai-tutor` | Split Assistant View | Verified |
| 32 | `d3219b560ec6478babc0865d4f734fb4.html` | Learning Map & Knowledge Graph | `/learning-map` | Radial Syllabus Map | Verified |
| 33 | `d395e97aefb04306b049f85d6cca7775.html` | Admin Push Telemetry | `/admin/push-telemetry` | Telemetry Dashboard | Verified |
| 34 | `de2e5b30753144aa9deea59f2a85d1ce.html` | Admin & Content Hub | `/admin/hub` | 4-Col KPI + Controls | Verified |
| 35 | `e34800f454f84159a948737dbc11373c.html` | DPP Hub & Daily Challenges | `/dpp` | Daily Problem Set | Verified |
| 36 | `e4c27569245e44dd93c6454cd9bd8078.html` | Admin PDF & Smart OCR Pipeline | `/admin/ocr` | Multi-stage Pipeline | Verified |
| 37 | `eb167dab5b9c4b6d9087374905216c36.html` | Admin Broadcast Notification | `/admin/broadcast` | Message Composer | Verified |
| 38 | `edc915250a144c9895e198256e00351a.html` | Admin Taxonomy & Meta Editor | `/admin/taxonomy` | Bulk Taxonomy Editor | Verified |
| 39 | `f145753246484d738026981fcba425a5.html` | Admin Broadcast Recipients | `/admin/recipients` | Recipient Filters | Verified |
| 40 | `fb5958b4a81f4508a8b172bd65b84cde.html` | Admin Cohort CSV Export | `/admin/cohort-export` | Schema & Export Panel | Verified |
| 41 | `25e0f156c0654d79822c5a3f6b8166fc.html` | Student Daily Schedule (Today) | `/today` | Chronological Timeline | Verified |

---

## 3. Design System Tokens Implemented

```css
/* Stitch Colors */
--color-background: #f9f9ff;
--color-on-background: #141b2b;
--color-surface: #f9f9ff;
--color-surface-dim: #d3daef;
--color-surface-container-lowest: #ffffff;
--color-surface-container-low: #f1f3ff;
--color-surface-container: #e9edff;
--color-surface-container-high: #e1e8fd;
--color-surface-container-highest: #dce2f7;
--color-primary: #3525cd;
--color-primary-container: #4f46e5;
--color-on-primary: #ffffff;
--color-on-primary-container: #dad7ff;
--color-secondary: #006c49;
--color-secondary-container: #6cf8bb;
--color-on-secondary-container: #00714d;
--color-tertiary: #004598;
--color-tertiary-container: #005cc6;
--color-error: #ba1a1a;
--color-error-container: #ffdad6;
```
