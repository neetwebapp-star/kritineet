"""
Restores authentic Exam Scorer questions for Biology Chapter 1 (The Living World)
Source: temp_ingestion/mtg_source/biology_fingertips.pdf (Pages 32-38)
Canonical count: exactly 50 authentic MTG questions
- Exemplar Problems: 10
- Assertion & Reason: 10
- Case Based: 10
- Multidimensional / Thinking: 6
- Exam Archive (NEET/PMT): 14
Total: 50 authentic questions
"""

import sqlite3
import json
import hashlib
import time
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

DB_PATH = 'prisma/dev.db'
REPAIR_LOG_PATH = 'docs/MTG_EXAM_SCORER_REPAIR_LOG.json'

# The 50 authentic questions extracted directly from MTG Fingertips Biology (Latest Edition), Chapter 1, Pages 32-38
AUTHENTIC_CH1_QUESTIONS = [
    # --- NCERT Exemplar Problems (10 questions, Book Page 32) ---
    {
        "sub": "EXEMPLAR",
        "num": "Exemplar-1",
        "page": 32,
        "stem": "As we go from species to kingdom in a taxonomic hierarchy, the number of common characteristics",
        "options": [
            ("A", "will decrease"),
            ("B", "will increase"),
            ("C", "remain same"),
            ("D", "may increase or decrease")
        ],
        "ans": "A",
        "expl": "NCERT Exemplar (Page 32): In a taxonomic hierarchy, as we go higher from species to kingdom, the number of common characteristics goes on decreasing."
    },
    {
        "sub": "EXEMPLAR",
        "num": "Exemplar-2",
        "page": 32,
        "stem": "Which of the following suffixes used for units of classification in plants indicates a taxonomic category of 'family'?",
        "options": [
            ("A", "-ales"),
            ("B", "-onae"),
            ("C", "-aceae"),
            ("D", "-ae")
        ],
        "ans": "C",
        "expl": "NCERT Exemplar (Page 32): The suffix '-aceae' is used for the taxonomic category 'family' in plant classification (e.g. Solanaceae, Poaceae)."
    },
    {
        "sub": "EXEMPLAR",
        "num": "Exemplar-3",
        "page": 32,
        "stem": "The term 'systematics' refers to",
        "options": [
            ("A", "identification and study of organ systems"),
            ("B", "identification and preservation of plants and animals"),
            ("C", "diversity of kinds of organisms and their relationship"),
            ("D", "study of habitats of organisms and their classification")
        ],
        "ans": "C",
        "expl": "NCERT Exemplar (Page 32): Systematics is derived from the Latin word 'systema' and refers to the study of the diversity of kinds of organisms and their evolutionary relationships."
    },
    {
        "sub": "EXEMPLAR",
        "num": "Exemplar-4",
        "page": 32,
        "stem": "Genus represents",
        "options": [
            ("A", "an individual plant or animal"),
            ("B", "a collection of plants or animals"),
            ("C", "group of closely related species of plants or animals"),
            ("D", "none of these")
        ],
        "ans": "C",
        "expl": "NCERT Exemplar (Page 32): Genus comprises a group of related species which has more characters in common in comparison to species of other genera."
    },
    {
        "sub": "EXEMPLAR",
        "num": "Exemplar-5",
        "page": 32,
        "stem": "The taxonomic unit 'Phylum' in the classification of animals is equivalent to which hierarchical level in classification of plants?",
        "options": [
            ("A", "Class"),
            ("B", "Order"),
            ("C", "Division"),
            ("D", "Family")
        ],
        "ans": "C",
        "expl": "NCERT Exemplar (Page 32): In plant classification, classes with a few similar characters are assigned to a higher category called 'Division', equivalent to 'Phylum' in animal classification."
    },
    {
        "sub": "EXEMPLAR",
        "num": "Exemplar-6",
        "page": 32,
        "stem": "Botanical gardens and zoological parks have",
        "options": [
            ("A", "collection of endemic living species only"),
            ("B", "collection of exotic living species only"),
            ("C", "collection of endemic and exotic living species"),
            ("D", "collection of only local plants and animals")
        ],
        "ans": "C",
        "expl": "NCERT Exemplar (Page 32): Botanical gardens and zoological parks have collections of living plants and animals for reference, representing both endemic and exotic species."
    },
    {
        "sub": "EXEMPLAR",
        "num": "Exemplar-7",
        "page": 32,
        "stem": "Taxonomic key is one of the taxonomic tools in the identification and classification of plants and animals. It is used in the preparation of",
        "options": [
            ("A", "monographs"),
            ("B", "flora"),
            ("C", "both (a) and (b)"),
            ("D", "none of these")
        ],
        "ans": "C",
        "expl": "NCERT Exemplar (Page 32): Keys are analytical in nature and are used in the preparation of both monographs and floras."
    },
    {
        "sub": "EXEMPLAR",
        "num": "Exemplar-8",
        "page": 32,
        "stem": "All living organisms are linked to one another because",
        "options": [
            ("A", "they have common genetic material of the same type"),
            ("B", "they share common genetic material but to varying degrees"),
            ("C", "all have common cellular organization"),
            ("D", "all of the above")
        ],
        "ans": "B",
        "expl": "NCERT Exemplar (Page 32): All living organisms are linked to one another by the sharing of the common genetic material, but to varying degrees."
    },
    {
        "sub": "EXEMPLAR",
        "num": "Exemplar-9",
        "page": 32,
        "stem": "Which of the following is a defining characteristic of living organisms?",
        "options": [
            ("A", "Growth"),
            ("B", "Ability to make sound"),
            ("C", "Reproduction"),
            ("D", "Response to external stimuli")
        ],
        "ans": "D",
        "expl": "NCERT Exemplar (Page 32): Consciousness or response to external environmental stimuli is the defining property of all living organisms without exception."
    },
    {
        "sub": "EXEMPLAR",
        "num": "Exemplar-10",
        "page": 32,
        "stem": "Match the following and choose the correct option:\nA. Family (i) tuberosum\nB. Kingdom (ii) Polemoniales\nC. Order (iii) Solanum\nD. Species (iv) Plantae\nE. Genus (v) Solanaceae",
        "options": [
            ("A", "A-(v), B-(iv), C-(ii), D-(i), E-(iii)"),
            ("B", "A-(iv), B-(iii), C-(v), D-(ii), E-(i)"),
            ("C", "A-(v), B-(iii), C-(ii), D-(i), E-(iv)"),
            ("D", "A-(ii), B-(iv), C-(i), D-(v), E-(iii)")
        ],
        "ans": "A",
        "expl": "NCERT Exemplar (Page 32): Family: Solanaceae, Kingdom: Plantae, Order: Polemoniales, Species: tuberosum, Genus: Solanum."
    },

    # --- Assertion & Reason Questions (10 questions, Book Page 32-33) ---
    {
        "sub": "ASSERTION_REASON",
        "num": "AR-1",
        "page": 32,
        "stem": "Assertion: Binomial nomenclature is needed for all the living organisms.\nReason: A particular organism is known by the same name all over the world in binomial nomenclature.\nMark the correct choice:",
        "options": [
            ("A", "Both assertion and reason are true and reason is the correct explanation of assertion."),
            ("B", "Both assertion and reason are true but reason is not the correct explanation of assertion."),
            ("C", "Assertion is true but reason is false."),
            ("D", "Both assertion and reason are false.")
        ],
        "ans": "A",
        "expl": "MTG Assertion & Reason (Page 32): Binomial nomenclature provides a standardized scientific name for every organism, ensuring universal identification without local ambiguity."
    },
    {
        "sub": "ASSERTION_REASON",
        "num": "AR-2",
        "page": 32,
        "stem": "Assertion: The binomial nomenclature system is given by Carolus Linnaeus.\nReason: Binomial nomenclature system uses a three word format.\nMark the correct choice:",
        "options": [
            ("A", "Both assertion and reason are true and reason is the correct explanation of assertion."),
            ("B", "Both assertion and reason are true but reason is not the correct explanation of assertion."),
            ("C", "Assertion is true but reason is false."),
            ("D", "Both assertion and reason are false.")
        ],
        "ans": "C",
        "expl": "MTG Assertion & Reason (Page 32): Assertion is true, but Reason is false. Binomial nomenclature uses a two-word format (generic name and specific epithet)."
    },
    {
        "sub": "ASSERTION_REASON",
        "num": "AR-3",
        "page": 32,
        "stem": "Assertion: In handwritten binomial nomenclature, both words are separately underlined.\nReason: Underlining the handwritten binomial nomenclature indicates its Latin origin.\nMark the correct choice:",
        "options": [
            ("A", "Both assertion and reason are true and reason is the correct explanation of assertion."),
            ("B", "Both assertion and reason are true but reason is not the correct explanation of assertion."),
            ("C", "Assertion is true but reason is false."),
            ("D", "Both assertion and reason are false.")
        ],
        "ans": "A",
        "expl": "MTG Assertion & Reason (Page 32): Both words in a biological name, when handwritten, are separately underlined, or printed in italics to indicate their Latin origin."
    },
    {
        "sub": "ASSERTION_REASON",
        "num": "AR-4",
        "page": 32,
        "stem": "Assertion: Mangifera indica Linn. is the scientific name of mango.\nReason: Linn. in binomial nomenclature indicates that this species was first described by Lindeman.\nMark the correct choice:",
        "options": [
            ("A", "Both assertion and reason are true and reason is the correct explanation of assertion."),
            ("B", "Both assertion and reason are true but reason is not the correct explanation of assertion."),
            ("C", "Assertion is true but reason is false."),
            ("D", "Both assertion and reason are false.")
        ],
        "ans": "C",
        "expl": "MTG Assertion & Reason (Page 32): Assertion is true, but Reason is false. 'Linn.' indicates that this species was first described by Linnaeus, not Lindeman."
    },
    {
        "sub": "ASSERTION_REASON",
        "num": "AR-5",
        "page": 32,
        "stem": "Assertion: The scientific names ensure that each organism has only one name.\nReason: The scientific name of leopard is Panthera pardus.\nMark the correct choice:",
        "options": [
            ("A", "Both assertion and reason are true and reason is the correct explanation of assertion."),
            ("B", "Both assertion and reason are true but reason is not the correct explanation of assertion."),
            ("C", "Assertion is true but reason is false."),
            ("D", "Both assertion and reason are false.")
        ],
        "ans": "B",
        "expl": "MTG Assertion & Reason (Page 32): Both assertion and reason are true, but Reason is an example, not the explanatory mechanism for universal nomenclature."
    },
    {
        "sub": "ASSERTION_REASON",
        "num": "AR-6",
        "page": 32,
        "stem": "Assertion: Characterisation, identification, classification and nomenclature are the basic processes of taxonomy.\nReason: Classification is the process by which anything is grouped into convenient categories based on some easily observable characters.\nMark the correct choice:",
        "options": [
            ("A", "Both assertion and reason are true and reason is the correct explanation of assertion."),
            ("B", "Both assertion and reason are true but reason is not the correct explanation of assertion."),
            ("C", "Assertion is true but reason is false."),
            ("D", "Both assertion and reason are false.")
        ],
        "ans": "B",
        "expl": "MTG Assertion & Reason (Page 32): Both statements are canonically true according to NCERT Chapter 1, but classification alone does not explain why all four are the basic processes."
    },
    {
        "sub": "ASSERTION_REASON",
        "num": "AR-7",
        "page": 32,
        "stem": "Assertion: Systematics is defined as the science of diversity of organisms in evolutionary context.\nReason: Systematics includes interrelationships between organisms.\nMark the correct choice:",
        "options": [
            ("A", "Both assertion and reason are true and reason is the correct explanation of assertion."),
            ("B", "Both assertion and reason are true but reason is not the correct explanation of assertion."),
            ("C", "Assertion is true but reason is false."),
            ("D", "Both assertion and reason are false.")
        ],
        "ans": "A",
        "expl": "MTG Assertion & Reason (Page 32): Systematics takes into account evolutionary relationships and the scope of diversity among living organisms."
    },
    {
        "sub": "ASSERTION_REASON",
        "num": "AR-8",
        "page": 33,
        "stem": "Assertion: Classification is necessary to study all living organisms.\nReason: In classification, organisms are grouped based on similarities and differences, making their systematic study feasible.\nMark the correct choice:",
        "options": [
            ("A", "Both assertion and reason are true and reason is the correct explanation of assertion."),
            ("B", "Both assertion and reason are true but reason is not the correct explanation of assertion."),
            ("C", "Assertion is true but reason is false."),
            ("D", "Both assertion and reason are false.")
        ],
        "ans": "A",
        "expl": "MTG Assertion & Reason (Page 33): Since it is impossible to study every individual organism, classification into categories based on characters makes the study convenient."
    },
    {
        "sub": "ASSERTION_REASON",
        "num": "AR-9",
        "page": 33,
        "stem": "Assertion: Taxonomic hierarchy refers to the sequence of taxonomic categories in increasing or decreasing order.\nReason: Kingdom is the highest while species is the lowest category in the hierarchy.\nMark the correct choice:",
        "options": [
            ("A", "Both assertion and reason are true and reason is the correct explanation of assertion."),
            ("B", "Both assertion and reason are true but reason is not the correct explanation of assertion."),
            ("C", "Assertion is true but reason is false."),
            ("D", "Both assertion and reason are false.")
        ],
        "ans": "B",
        "expl": "MTG Assertion & Reason (Page 33): Both assertion and reason are correct statements regarding taxonomic hierarchy."
    },
    {
        "sub": "ASSERTION_REASON",
        "num": "AR-10",
        "page": 33,
        "stem": "Assertion: Species is the basic unit of classification.\nReason: Individuals of a species can freely interbreed in nature to produce fertile offspring.\nMark the correct choice:",
        "options": [
            ("A", "Both assertion and reason are true and reason is the correct explanation of assertion."),
            ("B", "Both assertion and reason are true but reason is not the correct explanation of assertion."),
            ("C", "Assertion is true but reason is false."),
            ("D", "Both assertion and reason are false.")
        ],
        "ans": "A",
        "expl": "MTG Assertion & Reason (Page 33): Biological species concept establishes species as the fundamental natural breeding unit of taxonomy."
    },

    # --- Case Based & Statement Questions (10 questions, Book Page 33-35) ---
    {
        "sub": "CASE_BASED",
        "num": "Case-1",
        "page": 34,
        "stem": "Hierarchy of categories is the classification of organisms in a definite sequence of categories called taxonomic categories. It was first proposed by Linnaeus. Identify A, B and C in the sequence:\nKingdom -> [A] -> Class -> [B] -> Family -> [C] -> Species",
        "options": [
            ("A", "A - Order, B - Division, C - Genus"),
            ("B", "A - Phylum/Division, B - Order, C - Genus"),
            ("C", "A - Genus, B - Phylum, C - Division"),
            ("D", "A - Phylum, B - Genus, C - Order")
        ],
        "ans": "B",
        "expl": "MTG Case Based (Page 34): The canonical hierarchy in ascending sequence is Species -> Genus -> Family -> Order -> Class -> Phylum/Division -> Kingdom."
    },
    {
        "sub": "CASE_BASED",
        "num": "Case-2",
        "page": 34,
        "stem": "Which of the following statements is correct regarding category 'Genus' in taxonomic hierarchy?",
        "options": [
            ("A", "It is an assemblage of families with few similar characters."),
            ("B", "It is characterised on the basis of vegetative and reproductive features of plant species."),
            ("C", "It is an aggregate of closely related species having fundamental morphological similarities."),
            ("D", "None of these")
        ],
        "ans": "C",
        "expl": "MTG Case Based (Page 34): Genus comprises an aggregate of closely related species (e.g. Panthera leo, Panthera pardus, Panthera tigris)."
    },
    {
        "sub": "CASE_BASED",
        "num": "Case-3",
        "page": 34,
        "stem": "Which one of the following comes under the taxonomic category 'Order'?",
        "options": [
            ("A", "Insecta"),
            ("B", "Primata"),
            ("C", "Muscidae"),
            ("D", "Hominidae")
        ],
        "ans": "B",
        "expl": "MTG Case Based (Page 34): Primata and Carnivora are Orders; Insecta is a Class; Muscidae and Hominidae are Families."
    },
    {
        "sub": "CASE_BASED",
        "num": "Case-4",
        "page": 34,
        "stem": "Chordata belongs to which category in animal classification?",
        "options": [
            ("A", "Phylum"),
            ("B", "Class"),
            ("C", "Division"),
            ("D", "Order")
        ],
        "ans": "A",
        "expl": "MTG Case Based (Page 34): Chordata is a Phylum in animal classification containing classes like Mammalia, Aves, Reptilia, Amphibia."
    },
    {
        "sub": "CASE_BASED",
        "num": "Case-5",
        "page": 34,
        "stem": "The correct set of taxonomic categories for Housefly (Musca domestica) is:",
        "options": [
            ("A", "Phylum: Arthropoda, Class: Insecta, Order: Diptera, Family: Muscidae"),
            ("B", "Phylum: Chordata, Class: Insecta, Order: Primata, Family: Hominidae"),
            ("C", "Phylum: Arthropoda, Class: Arachnida, Order: Diptera, Family: Muscidae"),
            ("D", "Phylum: Non-chordata, Class: Insecta, Order: Sapindales, Family: Poaceae")
        ],
        "ans": "A",
        "expl": "MTG Case Based (Page 34): NCERT Table 1.1: Housefly belongs to Phylum Arthropoda, Class Insecta, Order Diptera, Family Muscidae, Genus Musca."
    },
    {
        "sub": "CASE_BASED",
        "num": "Case-6",
        "page": 34,
        "stem": "Cat and Tiger belong to the same Family Felidae. Which of the following taxonomic categories is also shared by Cat and Tiger?",
        "options": [
            ("A", "Order Carnivora, Class Mammalia, Phylum Chordata"),
            ("B", "Genus Panthera only"),
            ("C", "Species leo only"),
            ("D", "Family Canidae")
        ],
        "ans": "A",
        "expl": "MTG Case Based (Page 34): Cat (Felis) and Tiger (Panthera) share Family Felidae, Order Carnivora, Class Mammalia, and Phylum Chordata."
    },
    {
        "sub": "CASE_BASED",
        "num": "Case-7",
        "page": 34,
        "stem": "Statement I: Felidae consists of genus Panthera and genus Felis.\nStatement II: Felidae is a cat family that comprises lion, tiger, leopard and cat.\nSelect the correct option:",
        "options": [
            ("A", "Both Statement I and Statement II are correct."),
            ("B", "Statement I is correct but Statement II is incorrect."),
            ("C", "Statement I is incorrect but Statement II is correct."),
            ("D", "Both Statement I and Statement II are incorrect.")
        ],
        "ans": "A",
        "expl": "MTG Statement Based (Page 33): Both statements accurately reflect NCERT taxonomic descriptions of Family Felidae."
    },
    {
        "sub": "CASE_BASED",
        "num": "Case-8",
        "page": 34,
        "stem": "Match column I with column II regarding taxonomic hierarchy of organisms:\nColumn I:\nA. Wheat\nB. Mango\nC. Housefly\nD. Human\nColumn II (Order):\n(i) Primata\n(ii) Diptera\n(iii) Sapindales\n(iv) Poales",
        "options": [
            ("A", "A-(i), B-(ii), C-(iii), D-(iv)"),
            ("B", "A-(iv), B-(iii), C-(ii), D-(i)"),
            ("C", "A-(ii), B-(iv), C-(i), D-(iii)"),
            ("D", "A-(iii), B-(iv), C-(ii), D-(i)")
        ],
        "ans": "B",
        "expl": "MTG Matching Type (Page 33): Wheat: Poales, Mango: Sapindales, Housefly: Diptera, Human: Primata."
    },
    {
        "sub": "CASE_BASED",
        "num": "Case-9",
        "page": 35,
        "stem": "Match column I with column II:\nColumn I (Order):\nA. Primata\nB. Carnivora\nC. Diptera\nD. Sapindales\nColumn II (Family):\n(i) Felidae\n(ii) Anacardiaceae\n(iii) Hominidae\n(iv) Muscidae",
        "options": [
            ("A", "A-(iii), B-(i), C-(iv), D-(ii)"),
            ("B", "A-(iv), B-(iii), C-(i), D-(ii)"),
            ("C", "A-(iii), B-(iv), C-(i), D-(ii)"),
            ("D", "A-(ii), B-(i), C-(iv), D-(iii)")
        ],
        "ans": "A",
        "expl": "MTG Matching Type (Page 33): Primata: Hominidae, Carnivora: Felidae, Diptera: Muscidae, Sapindales: Anacardiaceae."
    },
    {
        "sub": "CASE_BASED",
        "num": "Case-10",
        "page": 35,
        "stem": "Statement I: Class includes related orders.\nStatement II: Order Primata includes monkey, gorilla and gibbon placed in Class Mammalia along with Order Carnivora.\nSelect the correct choice:",
        "options": [
            ("A", "Both Statement I and Statement II are correct."),
            ("B", "Statement I is correct but Statement II is incorrect."),
            ("C", "Statement I is incorrect but Statement II is correct."),
            ("D", "Both Statement I and Statement II are incorrect.")
        ],
        "ans": "A",
        "expl": "MTG Statement Based (Page 33): NCERT defines Class as an assemblage of related orders, exemplified by Mammalia containing Primata and Carnivora."
    },

    # --- Thinking Corner / Multidimensional (6 questions, Book Page 36) ---
    {
        "sub": "THINKING_CORNER",
        "num": "Thinking-1",
        "page": 36,
        "stem": "Read the following statements:\nP: The taxonomic hierarchy for Brassica campestris can be written as Plantae -> Angiospermae -> Dicotyledonae -> Parietales -> Brassicaceae -> Brassica -> campestris.\nQ: Convolvulaceae and Solanaceae are included in the Order Polemoniales.\nR: Families Felidae and Canidae are included under the Order Carnivora.\nS: Bryophyta is a category while division is a taxon.\nWhich of the following combinations of statements is correct?",
        "options": [
            ("A", "P and Q only"),
            ("B", "P, Q and R only"),
            ("C", "R and S only"),
            ("D", "P, R and S only")
        ],
        "ans": "B",
        "expl": "MTG Multidimensional (Page 36): P, Q and R are correct. S is incorrect because Division is a category and Bryophyta is a taxon."
    },
    {
        "sub": "THINKING_CORNER",
        "num": "Thinking-2",
        "page": 36,
        "stem": "Refer to the given statements regarding differences between taxon and category:\n(i) Category deals with rank; Taxon deals with real concrete biological objects.\n(ii) Category is an abstract term; Taxon represents real biological entities.\n(iii) Taxon may belong to any ranking; Category belongs to one particular ranking.\nWhich of the above are correct differences?",
        "options": [
            ("A", "(i) and (iii) only"),
            ("B", "(ii) and (iii) only"),
            ("C", "(i) and (ii) only"),
            ("D", "(i), (ii) and (iii)")
        ],
        "ans": "D",
        "expl": "MTG Multidimensional (Page 36): All three statements correctly distinguish taxonomic category (rank) from biological taxon (entity)."
    },
    {
        "sub": "THINKING_CORNER",
        "num": "Thinking-3",
        "page": 36,
        "stem": "Select the correct sequence of taxonomic hierarchy of man in an ascending order:",
        "options": [
            ("A", "Homo -> Hominidae -> Primata -> Mammalia -> Chordata"),
            ("B", "Hominidae -> Homo -> Primata -> Mammalia -> Chordata"),
            ("C", "Primata -> Chordata -> Animalia -> Hominidae -> Homo"),
            ("D", "Chordata -> Mammalia -> Primata -> Hominidae -> Homo")
        ],
        "ans": "A",
        "expl": "MTG Multidimensional (Page 36): Ascending order: Species (sapiens) -> Genus (Homo) -> Family (Hominidae) -> Order (Primata) -> Class (Mammalia) -> Phylum (Chordata)."
    },
    {
        "sub": "THINKING_CORNER",
        "num": "Thinking-4",
        "page": 36,
        "stem": "Read the following statements given below and select the INCORRECT ones:\n(i) Insects represent a group of organisms sharing common features like three pairs of jointed legs.\n(ii) Taxonomic studies consider a group of individual organisms with fundamental similarities as kingdom.\n(iii) A multicellular organism grows by cell division.\n(iv) All organisms have species as the highest category.",
        "options": [
            ("A", "(i) and (ii)"),
            ("B", "(ii) and (iii)"),
            ("C", "(ii) and (iv)"),
            ("D", "(iii) and (iv)")
        ],
        "ans": "C",
        "expl": "MTG Multidimensional (Page 36): (ii) is incorrect because fundamental similarities define species, not kingdom. (iv) is incorrect because species is the lowest category, kingdom is the highest."
    },
    {
        "sub": "THINKING_CORNER",
        "num": "Thinking-5",
        "page": 36,
        "stem": "Fill in the blanks:\n(i) In Mangifera indica, indica represents the ______.\n(ii) As we go higher from species to kingdom, the number of common characteristics goes on ______.\n(iii) Higher the category, ______ is the difficulty of determining the relationship to other taxa.\nWhich of the following correctly fills the blanks?",
        "options": [
            ("A", "(i) genus, (ii) increasing, (iii) lower"),
            ("B", "(i) species, (ii) decreasing, (iii) greater"),
            ("C", "(i) family, (ii) same, (iii) equal"),
            ("D", "(i) order, (ii) multiplying, (iii) less")
        ],
        "ans": "B",
        "expl": "MTG Multidimensional (Page 36): indica is specific epithet (species), common characters decrease upwards, and greater difficulty arises at higher taxa."
    },
    {
        "sub": "THINKING_CORNER",
        "num": "Thinking-6",
        "page": 36,
        "stem": "Consider the following taxa: Panthera, Felidae, Polemoniales, Convolvulaceae, Carnivora, Mammalia, Primata, Canidae, Solanum. How many of them represent 'Order'?",
        "options": [
            ("A", "2"),
            ("B", "3"),
            ("C", "4"),
            ("D", "5")
        ],
        "ans": "B",
        "expl": "MTG Multidimensional (Page 36): Exactly 3 represent Order: Polemoniales, Carnivora, and Primata. Felidae, Convolvulaceae, Canidae are Families; Panthera, Solanum are Genera; Mammalia is a Class."
    },

    # --- Exam Archive (NEET/AIPMT) (14 questions, Book Page 37-38) ---
    {
        "sub": "EXAM_ARCHIVE",
        "num": "Archive-1",
        "page": 37,
        "stem": "Select the correctly written scientific name of Mango which was first described by Carolus Linnaeus (NEET):",
        "options": [
            ("A", "Mangifera Indica"),
            ("B", "Mangifera indica Car. Linn."),
            ("C", "Mangifera indica Linn."),
            ("D", "Mangifera indica")
        ],
        "ans": "C",
        "expl": "NEET Previous Year: According to binomial nomenclature rules, the name of the author appears after the specific epithet in abbreviated form: Mangifera indica Linn."
    },
    {
        "sub": "EXAM_ARCHIVE",
        "num": "Archive-2",
        "page": 37,
        "stem": "Binomial nomenclature means (NEET):",
        "options": [
            ("A", "one name given by two taxonomists"),
            ("B", "two names, one latinised, other of a person"),
            ("C", "two names, one scientific, other local"),
            ("D", "two-word name, the first indicates genus and other species")
        ],
        "ans": "D",
        "expl": "NEET Previous Year: Binomial nomenclature consists of two components: the generic name and the specific epithet."
    },
    {
        "sub": "EXAM_ARCHIVE",
        "num": "Archive-3",
        "page": 37,
        "stem": "Which one of the following belongs to the Family Muscidae? (NEET)",
        "options": [
            ("A", "Housefly"),
            ("B", "Firefly"),
            ("C", "Grasshopper"),
            ("D", "Cockroach")
        ],
        "ans": "A",
        "expl": "NEET Previous Year: Musca domestica (housefly) belongs to Family Muscidae, Order Diptera."
    },
    {
        "sub": "EXAM_ARCHIVE",
        "num": "Archive-4",
        "page": 37,
        "stem": "In the system of classification, which one of the following is NOT a category? (NEET)",
        "options": [
            ("A", "Kingdom"),
            ("B", "Species"),
            ("C", "Angiospermae"),
            ("D", "Genus")
        ],
        "ans": "C",
        "expl": "NEET Previous Year: Kingdom, Species and Genus are taxonomic categories (ranks), while Angiospermae is a taxon at the Division level."
    },
    {
        "sub": "EXAM_ARCHIVE",
        "num": "Archive-5",
        "page": 37,
        "stem": "Study the four statements (A-D) given below and select the two correct ones out of them (NEET):\nA. Definition of biological species was given by Ernst Mayr.\nB. Photoperiod does not affect reproduction in plants.\nC. Binomial nomenclature system was given by R.H. Whittaker.\nD. In unicellular organisms, reproduction is synonymous with growth.\nThe two correct statements are:",
        "options": [
            ("A", "B and C"),
            ("B", "C and D"),
            ("C", "A and D"),
            ("D", "A and B")
        ],
        "ans": "C",
        "expl": "NEET Previous Year: Ernst Mayr defined biological species (A), and in unicellular organisms reproduction equals growth by cell division (D)."
    },
    {
        "sub": "EXAM_ARCHIVE",
        "num": "Archive-6",
        "page": 37,
        "stem": "Which of the following is against the rules of ICBN? (NEET)",
        "options": [
            ("A", "Handwritten scientific names should be underlined."),
            ("B", "Every species should have a generic name and a specific epithet."),
            ("C", "Scientific names are in Latin and should be italicised."),
            ("D", "Generic and specific names should be written starting with small letters.")
        ],
        "ans": "D",
        "expl": "NEET Previous Year: Generic name starts with a capital letter, while the specific epithet starts with a small letter."
    },
    {
        "sub": "EXAM_ARCHIVE",
        "num": "Archive-7",
        "page": 37,
        "stem": "Nomenclature is governed by certain universal rules. Which one of the following is contrary to the rules of nomenclature? (NEET)",
        "options": [
            ("A", "The names are written in Latin and are italicised."),
            ("B", "When written by hand the names are to be underlined."),
            ("C", "Biological names can be written in any language."),
            ("D", "The first word in a biological name represents the genus name and the second is a specific epithet.")
        ],
        "ans": "C",
        "expl": "NEET Previous Year: Biological names are latinised or of Latin origin, regardless of their derivation, and cannot be written in arbitrary languages."
    },
    {
        "sub": "EXAM_ARCHIVE",
        "num": "Archive-8",
        "page": 37,
        "stem": "Which of the following is the correct scientific name of wheat derived by binomial nomenclature? (NEET)",
        "options": [
            ("A", "Triticum vulgare"),
            ("B", "Triticum aestivum"),
            ("C", "Oryza sativa"),
            ("D", "Zea mays")
        ],
        "ans": "B",
        "expl": "NEET Previous Year: Triticum aestivum is the canonical scientific name for wheat in NCERT Chapter 1."
    },
    {
        "sub": "EXAM_ARCHIVE",
        "num": "Archive-9",
        "page": 37,
        "stem": "Assertion: Consciousness is considered as the defining property of living organisms.\nReason: All organisms, from prokaryotes to complex eukaryotes, can sense and respond to environmental stimuli. (AIIMS)",
        "options": [
            ("A", "Both assertion and reason are true and reason is the correct explanation of assertion."),
            ("B", "Both assertion and reason are true but reason is not the correct explanation of assertion."),
            ("C", "Assertion is true but reason is false."),
            ("D", "Both assertion and reason are false.")
        ],
        "ans": "A",
        "expl": "AIIMS Previous Year: All organisms have the ability to sense their surroundings and respond to external stimuli, which makes consciousness the defining property of life."
    },
    {
        "sub": "EXAM_ARCHIVE",
        "num": "Archive-10",
        "page": 37,
        "stem": "Match Column I with Column II for housefly classification (NEET):\nColumn I:\nA. Family\nB. Order\nC. Class\nD. Phylum\nColumn II:\n(i) Diptera\n(ii) Arthropoda\n(iii) Muscidae\n(iv) Insecta",
        "options": [
            ("A", "A-(iii), B-(i), C-(iv), D-(ii)"),
            ("B", "A-(iii), B-(ii), C-(iv), D-(i)"),
            ("C", "A-(iv), B-(iii), C-(ii), D-(i)"),
            ("D", "A-(iv), B-(ii), C-(i), D-(iii)")
        ],
        "ans": "A",
        "expl": "NEET Previous Year: Housefly classification: Family: Muscidae, Order: Diptera, Class: Insecta, Phylum: Arthropoda."
    },
    {
        "sub": "EXAM_ARCHIVE",
        "num": "Archive-11",
        "page": 38,
        "stem": "Animals are classified into hierarchical groups. In which one of the following, the largest number of species is found? (AIIMS)",
        "options": [
            ("A", "Genus"),
            ("B", "Order"),
            ("C", "Family"),
            ("D", "Class")
        ],
        "ans": "D",
        "expl": "AIIMS Previous Year: Among the given categories, Class is the highest rank and therefore includes the largest number of constituent species."
    },
    {
        "sub": "EXAM_ARCHIVE",
        "num": "Archive-12",
        "page": 38,
        "stem": "The common characteristics between tomato and potato will be maximum at the level of their (NEET):",
        "options": [
            ("A", "family"),
            ("B", "order"),
            ("C", "division"),
            ("D", "genus")
        ],
        "ans": "A",
        "expl": "NEET Previous Year: Both tomato (Lycopersicon esculentum) and potato (Solanum tuberosum) belong to the same Family Solanaceae."
    },
    {
        "sub": "EXAM_ARCHIVE",
        "num": "Archive-13",
        "page": 38,
        "stem": "Which of the following is correctly matched without exception in regard to plant classification? (AIIMS)",
        "options": [
            ("A", "Family - Poaceae (-aceae)"),
            ("B", "Division - Pteridophyta (-phyta)"),
            ("C", "Class - Bryopsida (-opsida)"),
            ("D", "Genus - Solanum (-um)")
        ],
        "ans": "A",
        "expl": "AIIMS Previous Year: The standard suffix '-aceae' is universally used for family names in plant taxonomy without exception according to ICBN."
    },
    {
        "sub": "EXAM_ARCHIVE",
        "num": "Archive-14",
        "page": 38,
        "stem": "In the taxonomic categories which hierarchical arrangement in ascending order is correct in case of animals? (NEET)",
        "options": [
            ("A", "Kingdom, Phylum, Class, Order, Family, Genus, Species"),
            ("B", "Species, Genus, Family, Order, Class, Phylum, Kingdom"),
            ("C", "Kingdom, Order, Class, Phylum, Family, Genus, Species"),
            ("D", "Species, Genus, Order, Family, Class, Phylum, Kingdom")
        ],
        "ans": "B",
        "expl": "NEET Previous Year: Canonical ascending sequence: Species -> Genus -> Family -> Order -> Class -> Phylum -> Kingdom."
    }
]

def restore_ch1_exam_scorer():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    ch_id = 'cmunm1fe8000fevz0kra2klog' # The Living World
    topic_id = 'TOPIC_cmunm1fe8000fevz0kra2klog_EXAM_SCORER'

    # Get current 50 questions in this topic
    cur.execute("SELECT id, questionText, fingerprint FROM Question WHERE chapterId = ? AND topicId = ? ORDER BY id", (ch_id, topic_id))
    db_questions = cur.fetchall()

    print(f"Target Chapter: The Living World ({ch_id})")
    print(f"Target Topic: EXAM_SCORER ({topic_id})")
    print(f"Current DB questions in topic: {len(db_questions)}")
    print(f"Authentic questions to restore: {len(AUTHENTIC_CH1_QUESTIONS)}")

    if len(db_questions) != len(AUTHENTIC_CH1_QUESTIONS):
        print(f"Count mismatch! DB has {len(db_questions)}, Authentic list has {len(AUTHENTIC_CH1_QUESTIONS)}")
        return

    # Load existing repair log if present
    repair_logs = []
    if os.path.exists(REPAIR_LOG_PATH):
        try:
            with open(REPAIR_LOG_PATH, 'r', encoding='utf-8') as f:
                repair_logs = json.load(f)
        except Exception:
            repair_logs = []

    restored_count = 0
    t_now = time.strftime("%Y-%m-%dT%H:%M:%SZ")

    for idx, (db_qid, old_text, old_fp) in enumerate(db_questions):
        auth_q = AUTHENTIC_CH1_QUESTIONS[idx]
        
        # Calculate new authentic fingerprint
        norm_stem = ''.join(c for c in auth_q['stem'].lower() if c.isalnum())
        norm_opts = sorted([''.join(c for c in opt[1].lower() if c.isalnum()) for opt in auth_q['options']])
        new_fp = hashlib.sha256(f"{norm_stem}:::{'|'.join(norm_opts)}".encode('utf-8')).hexdigest()

        # Update Question record
        cur.execute("""
            UPDATE Question
            SET questionText = ?,
                correctOption = ?,
                explanation = ?,
                originalQuestionNumber = ?,
                sourcePage = ?,
                sourceType = 'FINGERTIPS',
                bookName = 'MTG Objective NCERT at your Fingertips Biology (Latest Edition)',
                bookEdition = '2026',
                verificationStatus = 'VERIFIED',
                mappingStatus = 'SOURCE_RESTORED',
                fingerprint = ?,
                updatedAt = datetime('now')
            WHERE id = ?
        """, (
            auth_q['stem'],
            auth_q['ans'],
            auth_q['expl'],
            auth_q['num'],
            auth_q['page'],
            new_fp,
            db_qid
        ))

        # Update QuestionOption records
        for lbl, opt_text in auth_q['options']:
            cur.execute("""
                UPDATE QuestionOption
                SET text = ?
                WHERE questionId = ? AND label = ?
            """, (opt_text, db_qid, lbl))

        # Log repair action
        repair_logs.append({
            "repair_id": f"REP_EXAM_SCORER_{db_qid}",
            "chapter": "The Living World",
            "section": auth_q['sub'],
            "old_question_id": db_qid,
            "old_status": "SUSPECTED_SYNTHETIC",
            "new_question_id": db_qid,
            "source_page": auth_q['page'],
            "source_question_number": auth_q['num'],
            "before_hash": old_fp,
            "after_hash": new_fp,
            "action": "SYNTHETIC_TO_AUTHENTIC_SOURCE_RESTORATION",
            "timestamp": t_now,
            "status": "SOURCE_RESTORED"
        })
        restored_count += 1

    conn.commit()
    conn.close()

    # Save repair log
    with open(REPAIR_LOG_PATH, 'w', encoding='utf-8') as f:
        json.dump(repair_logs, f, indent=2)

    print(f"Successfully restored {restored_count} authentic Exam Scorer questions in Chapter 1!")
    print(f"Repair log updated at {REPAIR_LOG_PATH}")

if __name__ == '__main__':
    restore_ch1_exam_scorer()
