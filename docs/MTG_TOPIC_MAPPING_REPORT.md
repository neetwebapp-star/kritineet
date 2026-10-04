# MTG NCERT at your Fingertips: Topic-Wise Question Mapping

## 1. Provenance & Ingestion Source
- **Source Books**:
  - `MTG Objective NCERT at your Fingertips Biology` (Class 11 & 12, 11th Edition)
  - `MTG Objective NCERT at your Fingertips Chemistry`
  - `MTG Objective NCERT at your Fingertips Physics`
- **Location**: `C:\Users\sagar\Downloads\MTG - NCERT at your fingertips Biology - 2024.pdf` etc.
- **Ingestion Script**: `scripts/ingest_mtg_topic_questions.py`

## 2. Topic-Level Placement Strategy
In the Kriti NEET learning system, practice is interleaved directly at the topic level:
```
NCERT Topic Reader -> AI Hinglish -> Audio Capsule -> DPP (Fundamental) -> MTG Fingertips (NEET Exam Rigor)
```
- Each NCERT Topic contains 5 to 10 curated MTG Fingertips questions covering every sub-heading, diagram-based question, and experimental factoid.
- Questions carry exact question numbering, page citations, and authentic 4-option MCQs.

## 3. Database Architecture & API
- **Question Schema**:
  - `sourceType`: `FINGERTIPS`
  - `bookName`: `MTG NCERT at your Fingertips Biology`
  - `topicId`: Foreign key to `Topic.id`
  - `chapterId`: Foreign key to `Chapter.id`
- **Endpoints**:
  - `GET /api/ncert/topic/[id]/fingertips`: Fetches questions for the active topic.
  - `POST /api/ncert/topic/[id]/fingertips`: Evaluates student submissions, updates topic progress, marks incorrect attempts in `StudentMistake`, and returns comprehensive explanations.

## 4. Sample Mapping Matrix

| Subject | Chapter | Topic Number & Title | MTG Question Count | Question Types Included |
| :--- | :--- | :--- | :--- | :--- |
| Biology | Ch 1: The Living World | 1.1 What is Living? | 5 | NCERT Line Extract, Characteristics |
| Biology | Ch 1: The Living World | 1.2 Diversity in Living World | 5 | Nomenclature, Taxa, Taxonomic hierarchy |
| Biology | Ch 2: Biological Classification | 2.1 Kingdom Monera | 7 | Archaebacteria, Eubacteria, Cyanobacteria |
| Biology | Ch 2: Biological Classification | 2.2 Kingdom Protista | 5 | Chrysophytes, Dinoflagellates, Euglenoids, Protozoans |
| Biology | Ch 2: Biological Classification | 2.3 Kingdom Fungi | 5 | Phycomycetes, Ascomycetes, Basidiomycetes |
| Biology | Ch 2: Biological Classification | 2.4 Kingdom Plantae & Animalia | 5 | Alternation of Generations, Characteristics |
| Biology | Ch 2: Biological Classification | 2.5 Viruses, Viroids & Lichens | 5 | Viral structure, Prions, Mycobiont/Phycobiont |
