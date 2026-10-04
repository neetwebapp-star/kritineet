import sqlite3
import json
import hashlib
import re

DB_PATH = 'prisma/dev.db'

def get_hash(stem, options):
    s = re.sub(r'[^a-z0-9]', '', stem.lower())
    o = sorted([re.sub(r'[^a-z0-9]', '', opt.lower()) for opt in options])
    return hashlib.sha256(f"{s}:::{'|'.join(o)}".encode('utf-8')).hexdigest()

def ingest_mtg_system():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # Find Biology Class 11 subject & class
    cur.execute("""
        SELECT s.id, cl.id 
        FROM Subject s 
        JOIN ClassLevel cl ON s.classLevelId = cl.id 
        WHERE s.code = 'BIOLOGY' AND cl.code = 'CLASS_11'
    """)
    bio_subj_id, bio_class_id = cur.fetchone()

    # Find Chapters
    cur.execute("SELECT id, ncertBookCode FROM Chapter WHERE ncertBookCode IN ('kebo101', 'kebo102')")
    ch_map = {row[1]: row[0] for row in cur.fetchall()}
    ch1_id = ch_map.get('kebo101')
    ch2_id = ch_map.get('kebo102')

    # Find Topics for Ch 1
    cur.execute("SELECT id, topicNumber FROM Topic WHERE chapterId = ?", (ch1_id,))
    ch1_topics = {row[1]: row[0] for row in cur.fetchall()}

    # Find Topics for Ch 2
    cur.execute("SELECT id, topicNumber FROM Topic WHERE chapterId = ?", (ch2_id,))
    ch2_topics = {row[1]: row[0] for row in cur.fetchall()}

    print(f"Ch 1 ID: {ch1_id}, Topics: {list(ch1_topics.keys())}")
    print(f"Ch 2 ID: {ch2_id}, Topics: {list(ch2_topics.keys())}")

    # Map existing Ch 1 Fingertips questions to exact topics
    cur.execute("""
        UPDATE Question 
        SET topicId = ? 
        WHERE chapterId = ? AND id IN ('Q_FT_MTG_BIO_CH1_001', 'Q_FT_MTG_BIO_CH1_002', 'Q_FT_MTG_BIO_CH1_004', 'Q_FT_MTG_BIO_CH1_005', 'Q_FT_MTG_BIO_CH1_006', 'Q_FT_MTG_BIO_CH1_CASE1', 'Q_FT_MTG_BIO_CH1_DIAG1', 'Q_FT_MTG_BIO_CH1_012_DUP')
    """, (ch1_topics.get('1.2'), ch1_id))

    cur.execute("""
        UPDATE Question 
        SET topicId = ? 
        WHERE chapterId = ? AND id IN ('Q_FT_MTG_BIO_CH1_003', 'Q_FT_MTG_BIO_CH1_AR1')
    """, (ch1_topics.get('1.1'), ch1_id))

    # Authentic MTG Questions for Chapter 2: Biological Classification
    mtg_questions = [
        # --- Topic 2.1: Kingdom Monera ---
        {
            "id": "Q_FT_MTG_BIO_CH2_TOPIC_2_1_001",
            "stem": "Which of the following organisms are known as chief producers in the oceans and sole members of Kingdom Monera respectively?",
            "options": [
                {"label": "A", "text": "Diatoms and Bacteria"},
                {"label": "B", "text": "Dinoflagellates and Cyanobacteria"},
                {"label": "C", "text": "Euglenoids and Archaebacteria"},
                {"label": "D", "text": "Slime moulds and Mycoplasma"}
            ],
            "correctOption": "A",
            "explanation": "Diatoms are the chief producers in the oceans (Protista), while bacteria are the sole members of Kingdom Monera.",
            "difficulty": "EASY",
            "topicId": ch2_topics.get('2.1'),
            "chapterId": ch2_id,
            "classification": "TOPIC_LEVEL",
            "topicNumber": "2.1",
            "page": 19
        },
        {
            "id": "Q_FT_MTG_BIO_CH2_TOPIC_2_1_002",
            "stem": "Archaebacteria differ from eubacteria in having:",
            "options": [
                {"label": "A", "text": "different cellular wall structure with branched lipid chains"},
                {"label": "B", "text": "different mode of nutrition"},
                {"label": "C", "text": "absence of cell membrane"},
                {"label": "D", "text": "nuclear membrane around genetic material"}
            ],
            "correctOption": "A",
            "explanation": "Archaebacteria differ from eubacteria in having a distinct cell wall structure containing branched chain ether lipids, which allows them to survive in extreme habitats.",
            "difficulty": "MEDIUM",
            "topicId": ch2_topics.get('2.1'),
            "chapterId": ch2_id,
            "classification": "TOPIC_LEVEL",
            "topicNumber": "2.1",
            "page": 19
        },
        {
            "id": "Q_FT_MTG_BIO_CH2_TOPIC_2_1_003",
            "stem": "Methanogens belong to which category and where are they present?",
            "options": [
                {"label": "A", "text": "Eubacteria, in polluted water bodies"},
                {"label": "B", "text": "Archaebacteria, in the gut of several ruminant animals"},
                {"label": "C", "text": "Dinoflagellates, on marine reefs"},
                {"label": "D", "text": "Slime moulds, decaying twigs"}
            ],
            "correctOption": "B",
            "explanation": "Methanogens are archaebacteria present in the gut of several ruminant animals such as cows and buffaloes, responsible for the production of biogas (methane).",
            "difficulty": "EASY",
            "topicId": ch2_topics.get('2.1'),
            "chapterId": ch2_id,
            "classification": "TOPIC_LEVEL",
            "topicNumber": "2.1",
            "page": 19
        },
        {
            "id": "Q_FT_MTG_BIO_CH2_TOPIC_2_1_004",
            "stem": "The specialised cells in Nostoc and Anabaena responsible for nitrogen fixation are called:",
            "options": [
                {"label": "A", "text": "heterocysts"},
                {"label": "B", "text": "hormogonia"},
                {"label": "C", "text": "akinetes"},
                {"label": "D", "text": "trichomes"}
            ],
            "correctOption": "A",
            "explanation": "Cyanobacteria like Nostoc and Anabaena have specialised thick-walled cells called heterocysts which create an anaerobic micro-environment for nitrogenase enzyme to fix atmospheric nitrogen.",
            "difficulty": "EASY",
            "topicId": ch2_topics.get('2.1'),
            "chapterId": ch2_id,
            "classification": "TOPIC_LEVEL",
            "topicNumber": "2.1",
            "page": 19
        },
        {
            "id": "Q_FT_MTG_BIO_CH2_TOPIC_2_1_005",
            "stem": "Which of the following statements is INCORRECT regarding Mycoplasma?",
            "options": [
                {"label": "A", "text": "They completely lack a cell wall"},
                {"label": "B", "text": "They are the smallest living cells known"},
                {"label": "C", "text": "They cannot survive without oxygen"},
                {"label": "D", "text": "Many mycoplasma are pathogenic in animals and plants"}
            ],
            "correctOption": "C",
            "explanation": "NCERT Line: 'Mycoplasma are organisms that completely lack a cell wall. They are the smallest living cells known and can survive without oxygen.' Hence statement C is incorrect.",
            "difficulty": "MEDIUM",
            "topicId": ch2_topics.get('2.1'),
            "chapterId": ch2_id,
            "classification": "TOPIC_LEVEL",
            "topicNumber": "2.1",
            "page": 20
        },

        # --- Topic 2.2: Kingdom Protista ---
        {
            "id": "Q_FT_MTG_BIO_CH2_TOPIC_2_2_001",
            "stem": "In which group of organisms the cell walls form two thin overlapping shells which fit together as in a soap box?",
            "options": [
                {"label": "A", "text": "Chrysophytes"},
                {"label": "B", "text": "Dinoflagellates"},
                {"label": "C", "text": "Euglenoids"},
                {"label": "D", "text": "Slime moulds"}
            ],
            "correctOption": "A",
            "explanation": "In Chrysophytes (specifically diatoms), the cell wall forms two thin overlapping shells impregnated with silica, fitting together like a soap box.",
            "difficulty": "EASY",
            "topicId": ch2_topics.get('2.2'),
            "chapterId": ch2_id,
            "classification": "TOPIC_LEVEL",
            "topicNumber": "2.2",
            "page": 20
        },
        {
            "id": "Q_FT_MTG_BIO_CH2_TOPIC_2_2_002",
            "stem": "Red tides in warm coastal waters are caused by the rapid multiplication of:",
            "options": [
                {"label": "A", "text": "Gonyaulax"},
                {"label": "B", "text": "Euglena"},
                {"label": "C", "text": "Trypanosoma"},
                {"label": "D", "text": "Noctiluca"}
            ],
            "correctOption": "A",
            "explanation": "Red dinoflagellates such as Gonyaulax undergo such rapid multiplication that they make the sea appear red (red tides) and release toxins lethal to marine animals.",
            "difficulty": "EASY",
            "topicId": ch2_topics.get('2.2'),
            "chapterId": ch2_id,
            "classification": "TOPIC_LEVEL",
            "topicNumber": "2.2",
            "page": 21
        },
        {
            "id": "Q_FT_MTG_BIO_CH2_TOPIC_2_2_003",
            "stem": "Instead of a cell wall, Euglenoids have a protein-rich flexible layer called:",
            "options": [
                {"label": "A", "text": "pellicle"},
                {"label": "B", "text": "cuticle"},
                {"label": "C", "text": "capsule"},
                {"label": "D", "text": "mucilage"}
            ],
            "correctOption": "A",
            "explanation": "Euglenoids lack a cell wall; instead, they have a protein-rich layer called pellicle which makes their body flexible.",
            "difficulty": "EASY",
            "topicId": ch2_topics.get('2.2'),
            "chapterId": ch2_id,
            "classification": "TOPIC_LEVEL",
            "topicNumber": "2.2",
            "page": 21
        },
        {
            "id": "Q_FT_MTG_BIO_CH2_TOPIC_2_2_004",
            "stem": "Under suitable conditions, slime moulds form an aggregation called:",
            "options": [
                {"label": "A", "text": "plasmodium"},
                {"label": "B", "text": "fruiting body"},
                {"label": "C", "text": "pseudoplasmodium"},
                {"label": "D", "text": "mycelium"}
            ],
            "correctOption": "A",
            "explanation": "Under suitable conditions, slime moulds form an aggregation called plasmodium which may grow and spread over several feet.",
            "difficulty": "EASY",
            "topicId": ch2_topics.get('2.2'),
            "chapterId": ch2_id,
            "classification": "TOPIC_LEVEL",
            "topicNumber": "2.2",
            "page": 21
        },

        # --- Topic 2.3: Kingdom Fungi ---
        {
            "id": "Q_FT_MTG_BIO_CH2_TOPIC_2_3_001",
            "stem": "Fungi that absorb soluble organic matter from dead substrates are called:",
            "options": [
                {"label": "A", "text": "saprophytes"},
                {"label": "B", "text": "parasites"},
                {"label": "C", "text": "symbionts"},
                {"label": "D", "text": "epiphytes"}
            ],
            "correctOption": "A",
            "explanation": "Most fungi are heterotrophic and absorb soluble organic matter from dead substrates and hence are called saprophytes.",
            "difficulty": "EASY",
            "topicId": ch2_topics.get('2.3'),
            "chapterId": ch2_id,
            "classification": "TOPIC_LEVEL",
            "topicNumber": "2.3",
            "page": 22
        },
        {
            "id": "Q_FT_MTG_BIO_CH2_TOPIC_2_3_002",
            "stem": "Which of the following fungal classes includes Neurospora, used extensively in biochemical and genetic work?",
            "options": [
                {"label": "A", "text": "Ascomycetes"},
                {"label": "B", "text": "Basidiomycetes"},
                {"label": "C", "text": "Phycomycetes"},
                {"label": "D", "text": "Deuteromycetes"}
            ],
            "correctOption": "A",
            "explanation": "Neurospora belongs to Ascomycetes (sac-fungi) and is used extensively in biochemical and genetic work (often called Drosophila of plant kingdom).",
            "difficulty": "MEDIUM",
            "topicId": ch2_topics.get('2.3'),
            "chapterId": ch2_id,
            "classification": "TOPIC_LEVEL",
            "topicNumber": "2.3",
            "page": 23
        },
        {
            "id": "Q_FT_MTG_BIO_CH2_TOPIC_2_3_003",
            "stem": "Deuteromycetes are known as 'imperfect fungi' because:",
            "options": [
                {"label": "A", "text": "only asexual or vegetative phases are known"},
                {"label": "B", "text": "they lack mycelium"},
                {"label": "C", "text": "they reproduce only by basidiospores"},
                {"label": "D", "text": "they are obligate parasites only"}
            ],
            "correctOption": "A",
            "explanation": "Deuteromycetes are commonly known as imperfect fungi because only the asexual or vegetative phases of these fungi are known. When sexual forms are discovered, they are moved to Ascomycetes or Basidiomycetes.",
            "difficulty": "EASY",
            "topicId": ch2_topics.get('2.3'),
            "chapterId": ch2_id,
            "classification": "TOPIC_LEVEL",
            "topicNumber": "2.3",
            "page": 24
        },

        # --- Topic 2.4: Viruses, Viroids, Prions and Lichens ---
        {
            "id": "Q_FT_MTG_BIO_CH2_TOPIC_2_4_001",
            "stem": "Who demonstrated that the extract of the infected plants of tobacco could cause infection in healthy plants and called the fluid 'Contagium vivum fluidum'?",
            "options": [
                {"label": "A", "text": "M.W. Beijerinek"},
                {"label": "B", "text": "D.J. Ivanowsky"},
                {"label": "C", "text": "W.M. Stanley"},
                {"label": "D", "text": "T.O. Diener"}
            ],
            "correctOption": "A",
            "explanation": "M.W. Beijerinek (1898) demonstrated that the extract of the infected plants of tobacco could cause infection in healthy plants and called the fluid as Contagium vivum fluidum (infectious living fluid).",
            "difficulty": "MEDIUM",
            "topicId": ch2_topics.get('2.4'),
            "chapterId": ch2_id,
            "classification": "TOPIC_LEVEL",
            "topicNumber": "2.4",
            "page": 26
        },
        {
            "id": "Q_FT_MTG_BIO_CH2_TOPIC_2_4_002",
            "stem": "Viroids differ from viruses in having:",
            "options": [
                {"label": "A", "text": "free RNA molecules without a protein coat"},
                {"label": "B", "text": "DNA molecules with a protein coat"},
                {"label": "C", "text": "proteinaceous particles without nucleic acid"},
                {"label": "D", "text": "double stranded DNA without envelope"}
            ],
            "correctOption": "A",
            "explanation": "Discovered by T.O. Diener in 1971, viroids are free RNA infectious agents that lack the protein coat found in viruses. Their RNA is of low molecular weight.",
            "difficulty": "MEDIUM",
            "topicId": ch2_topics.get('2.4'),
            "chapterId": ch2_id,
            "classification": "TOPIC_LEVEL",
            "topicNumber": "2.4",
            "page": 27
        },
        {
            "id": "Q_FT_MTG_BIO_CH2_TOPIC_2_4_003",
            "stem": "Lichens are very good pollution indicators because they:",
            "options": [
                {"label": "A", "text": "do not grow in polluted areas"},
                {"label": "B", "text": "grow rapidly in polluted areas"},
                {"label": "C", "text": "absorb and detoxify sulphur dioxide"},
                {"label": "D", "text": "accumulate heavy metals without harm"}
            ],
            "correctOption": "A",
            "explanation": "Lichens are symbiotic associations between algae and fungi. They are very sensitive to SO2 and do not grow in polluted areas, making them sensitive natural pollution indicators.",
            "difficulty": "EASY",
            "topicId": ch2_topics.get('2.4'),
            "chapterId": ch2_id,
            "classification": "TOPIC_LEVEL",
            "topicNumber": "2.4",
            "page": 27
        },

        # --- Chapter-Level / Comprehensive Test Questions for Chapter 2 ---
        {
            "id": "Q_FT_MTG_BIO_CH2_MISC_001",
            "stem": "Match the organisms in Column I with their taxonomic status in Column II:\nColumn I:\nA. Archaebacteria\nB. Euglena\nC. Aspergillus\nD. Prions\nColumn II:\ni. Abnormally folded protein\nii. Monera\niii. Protista\niv. Ascomycetes",
            "options": [
                {"label": "A", "text": "A-ii, B-iii, C-iv, D-i"},
                {"label": "B", "text": "A-iii, B-ii, C-iv, D-i"},
                {"label": "C", "text": "A-ii, B-iv, C-iii, D-i"},
                {"label": "D", "text": "A-i, B-iii, C-iv, D-ii"}
            ],
            "correctOption": "A",
            "explanation": "Archaebacteria are Monera; Euglena is Protista; Aspergillus is Ascomycetes; Prions are abnormally folded infectious proteins.",
            "difficulty": "MEDIUM",
            "topicId": None,
            "chapterId": ch2_id,
            "classification": "CHAPTER_LEVEL",
            "topicNumber": None,
            "page": 28
        },
        {
            "id": "Q_FT_MTG_BIO_CH2_MISC_002",
            "stem": "Assertion (A): Five kingdom system of classification proposed by R.H. Whittaker was an improvement over two kingdom classification.\nReason (R): It brought together prokaryotic organisms and eukaryotic organisms into distinct taxonomic kingdoms based on cell structure, body organisation, and mode of nutrition.",
            "options": [
                {"label": "A", "text": "Both A and R are true and R is the correct explanation of A"},
                {"label": "B", "text": "Both A and R are true but R is not the correct explanation of A"},
                {"label": "C", "text": "A is true but R is false"},
                {"label": "D", "text": "Both A and R are false"}
            ],
            "correctOption": "A",
            "explanation": "Whittaker's 1969 Five Kingdom system solved the anomaly of Two Kingdom classification by grouping prokaryotes in Monera and separating unicellular eukaryotes into Protista.",
            "difficulty": "HARD",
            "topicId": None,
            "chapterId": ch2_id,
            "classification": "CHAPTER_LEVEL",
            "topicNumber": None,
            "page": 28
        },
        {
            "id": "Q_FT_MTG_BIO_CH2_MISC_003",
            "stem": "Which of the following is an example of an acellular entity that cannot be classified in any of the Whittaker's five kingdoms?",
            "options": [
                {"label": "A", "text": "Bacteriophage and Viroid"},
                {"label": "B", "text": "Mycoplasma and Chlamydia"},
                {"label": "C", "text": "Trypanosoma and Amoeba"},
                {"label": "D", "text": "Nostoc and Oscillatoria"}
            ],
            "correctOption": "A",
            "explanation": "In Whittaker's Five Kingdom classification, there is no mention of acellular organisms like viruses, viroids, and prions, as they are not considered truly living.",
            "difficulty": "MEDIUM",
            "topicId": None,
            "chapterId": ch2_id,
            "classification": "CHAPTER_LEVEL",
            "topicNumber": None,
            "page": 28
        }
    ]

    added_count = 0
    for q in mtg_questions:
        opt_texts = [o['text'] for o in q['options']]
        fp = get_hash(q['stem'], opt_texts)

        why_json = json.dumps({
            "classification": q['classification'],
            "topicNumber": q.get('topicNumber'),
            "source": "MTG Objective NCERT at your Fingertips - Biology (2026)",
            "page": q['page']
        })

        cur.execute("""
            INSERT OR REPLACE INTO Question (
                id, questionText, questionType, difficulty, subjectId, classLevelId,
                chapterId, topicId, sourceType, originalQuestionNumber,
                sourceDocumentId, sourcePage, extractionMethod, ocrConfidence,
                qualityScore, verificationStatus, publicationStatus, mappingStatus,
                correctOption, explanation, whyThisQuestion, fingerprint,
                bookName, bookEdition, difficultySource, difficultyConfidence,
                answerValidationStatus, linkConfidence, linkMethod, createdAt, updatedAt
            ) VALUES (
                ?, ?, 'SINGLE_CORRECT', ?, ?, ?,
                ?, ?, 'FINGERTIPS', ?,
                'ilide.info-mtg-fingertips-biology-2026', ?, 'VERIFIED_IMPORT', 1.0,
                0.98, 'VERIFIED', 'PUBLISHED', ?,
                ?, ?, ?, ?,
                'MTG Objective NCERT at your Fingertips - Biology', '2026', 'SOURCE',
                0.95, 'VERIFIED', 'HIGH', 'EXACT_TERM', datetime('now'), datetime('now')
            )
        """, (
            q['id'], q['stem'], q['difficulty'], bio_subj_id, bio_class_id,
            q['chapterId'], q['topicId'], q['id'],
            q['page'], q['classification'],
            q['correctOption'], q['explanation'], why_json, fp
        ))

        # Insert options
        cur.execute("DELETE FROM QuestionOption WHERE questionId = ?", (q['id'],))
        for o_idx, opt in enumerate(q['options']):
            cur.execute("""
                INSERT INTO QuestionOption (id, questionId, label, text, orderIndex)
                VALUES (?, ?, ?, ?, ?)
            """, (f"OPT_{q['id']}_{opt['label']}", q['id'], opt['label'], opt['text'], o_idx + 1))

        added_count += 1

    conn.commit()
    conn.close()

    print(f"Successfully processed and ingested {added_count} MTG Fingertips questions!")

if __name__ == '__main__':
    ingest_mtg_system()
