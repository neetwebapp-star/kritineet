/**
 * BIOLOGY MIND MAP CANONICAL REGISTRY
 * Maps all Class 11 and Class 12 NEET NCERT Biology Chapters to original high-resolution mind map files.
 * Strictly preserves original assets without downsampling or conversion.
 */

export interface BiologyMindMapMeta {
  id: string;
  classLevel: 11 | 12;
  subject: 'Biology';
  chapterNumber: number;
  chapterTitle: string;
  chapterSlug: string;
  chapterId?: string;
  title: string;
  type: 'mind_map';
  assetUrl: string;
  downloadFileName: string;
  dimensions: { width: number; height: number };
  status: 'ACTIVE' | 'MAPPED' | 'LEGACY';
  editionType: 'PRIMARY' | 'EXTENDED' | 'COMPANION' | 'LEGACY';
  description: string;
  keyTopics: string[];
}

export const BIOLOGY_MIND_MAPS: BiologyMindMapMeta[] = [
  // ==========================================
  // CLASS 11 BIOLOGY
  // ==========================================
  {
    id: 'mm-bio-11-01',
    classLevel: 11,
    subject: 'Biology',
    chapterNumber: 1,
    chapterTitle: 'The Living World',
    chapterSlug: 'the-living-world',
    chapterId: 'cmunm1fe8000fevz0kra2klog',
    title: 'The Living World Revision Poster',
    type: 'mind_map',
    assetUrl: '/mindmaps/biology/original/The Living World_ NEET Biology Revision Poster.png',
    downloadFileName: 'Class_11_Biology_Chapter_1_The_Living_World_Mind_Map.png',
    dimensions: { width: 1254, height: 1254 },
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Original high-resolution visual mind map for The Living World.',
    keyTopics: ['Diversity in the Living World', 'Taxonomic Categories', 'Taxonomical Aids']
  },
  {
    id: 'mm-bio-11-02',
    classLevel: 11,
    subject: 'Biology',
    chapterNumber: 2,
    chapterTitle: 'Biological Classification',
    chapterSlug: 'biological-classification',
    chapterId: 'cmunm1fel000hevz0sh4z7eiw',
    title: 'Biological Classification Revision Map',
    type: 'mind_map',
    assetUrl: '/mindmaps/biology/original/Class 11 Biology_ Biological Classification Revision Map.png',
    downloadFileName: 'Class_11_Biology_Chapter_2_Biological_Classification_Mind_Map.png',
    dimensions: { width: 1254, height: 1254 },
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Original high-resolution visual mind map for Biological Classification.',
    keyTopics: ['Kingdom Monera', 'Kingdom Protista', 'Kingdom Fungi', 'Kingdom Plantae', 'Kingdom Animalia', 'Viruses & Lichens']
  },
  {
    id: 'mm-bio-11-03',
    classLevel: 11,
    subject: 'Biology',
    chapterNumber: 3,
    chapterTitle: 'Plant Kingdom',
    chapterSlug: 'plant-kingdom',
    chapterId: 'cmunm1fev000jevz0195ie89p',
    title: 'Plant Kingdom Revision Chart',
    type: 'mind_map',
    assetUrl: '/mindmaps/biology/original/Class 11 Plant Kingdom Revision Chart.png',
    downloadFileName: 'Class_11_Biology_Chapter_3_Plant_Kingdom_Mind_Map.png',
    dimensions: { width: 1536, height: 1024 },
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Original high-resolution visual mind map for Plant Kingdom.',
    keyTopics: ['Algae', 'Bryophytes', 'Pteridophytes', 'Gymnosperms', 'Angiosperms', 'Alternation of Generations']
  },
  {
    id: 'mm-bio-11-03-companion',
    classLevel: 11,
    subject: 'Biology',
    chapterNumber: 3,
    chapterTitle: 'Plant Kingdom (Summary)',
    chapterSlug: 'plant-kingdom',
    chapterId: 'cmunm1fev000jevz0195ie89p',
    title: 'Plant Kingdom Summary Chart',
    type: 'mind_map',
    assetUrl: '/mindmaps/biology/original/Plant Kingdom Revision Chart.png',
    downloadFileName: 'Class_11_Biology_Chapter_3_Plant_Kingdom_Summary_Chart.png',
    dimensions: { width: 1536, height: 1024 },
    status: 'ACTIVE',
    editionType: 'COMPANION',
    description: 'Original high-resolution companion summary chart for Plant Kingdom.',
    keyTopics: ['Plant Classification Overview', 'Life Cycle Patterns']
  },
  {
    id: 'mm-bio-11-04',
    classLevel: 11,
    subject: 'Biology',
    chapterNumber: 4,
    chapterTitle: 'Animal Kingdom',
    chapterSlug: 'animal-kingdom',
    chapterId: 'cmunm1ff6000levz0gsfdbb0b',
    title: 'Animal Kingdom Classification Mind Map',
    type: 'mind_map',
    assetUrl: '/mindmaps/biology/original/Animal Kingdom Classification Mind Map.png',
    downloadFileName: 'Class_11_Biology_Chapter_4_Animal_Kingdom_Mind_Map.png',
    dimensions: { width: 1536, height: 1024 },
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Original high-resolution visual mind map for Animal Kingdom.',
    keyTopics: ['Basis of Classification', 'Non-Chordates', 'Chordates', 'Phylum Diagnostics']
  },
  {
    id: 'mm-bio-11-05',
    classLevel: 11,
    subject: 'Biology',
    chapterNumber: 5,
    chapterTitle: 'Morphology of Flowering Plants',
    chapterSlug: 'morphology-of-flowering-plants',
    chapterId: 'CH_KEBO105',
    title: 'Flowering Plant Morphology Revision Notes',
    type: 'mind_map',
    assetUrl: '/mindmaps/biology/original/Colourful Flowering Plant Morphology Notes.png',
    downloadFileName: 'Class_11_Biology_Chapter_5_Morphology_of_Flowering_Plants_Mind_Map.png',
    dimensions: { width: 1536, height: 1024 },
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Original high-resolution visual mind map for Morphology of Flowering Plants.',
    keyTopics: ['Root & Stem Modifications', 'Leaf Venation', 'Inflorescence', 'Flower Parts', 'Fruit & Seed', 'Floral Families']
  },
  {
    id: 'mm-bio-11-06',
    classLevel: 11,
    subject: 'Biology',
    chapterNumber: 6,
    chapterTitle: 'Anatomy of Flowering Plants',
    chapterSlug: 'anatomy-of-flowering-plants',
    chapterId: 'CH_KEBO106',
    title: 'Flowering Plant Anatomy Mind Map',
    type: 'mind_map',
    assetUrl: '/mindmaps/biology/original/Class 11 Flowering Plant Anatomy Mind Map.png',
    downloadFileName: 'Class_11_Biology_Chapter_6_Anatomy_of_Flowering_Plants_Mind_Map.png',
    dimensions: { width: 1536, height: 1024 },
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Original high-resolution visual mind map for Anatomy of Flowering Plants.',
    keyTopics: ['Meristematic & Permanent Tissues', 'Tissue Systems', 'Monocot & Dicot Root/Stem/Leaf Anatomy', 'Secondary Growth']
  },
  {
    id: 'mm-bio-11-07',
    classLevel: 11,
    subject: 'Biology',
    chapterNumber: 7,
    chapterTitle: 'Structural Organisation in Animals',
    chapterSlug: 'structural-organisation-in-animals',
    chapterId: 'CH_KEBO107',
    title: 'Animal Tissue & Organisation Revision Poster',
    type: 'mind_map',
    assetUrl: '/mindmaps/biology/original/Colourful Animal Organisation Revision Poster.png',
    downloadFileName: 'Class_11_Biology_Chapter_7_Structural_Organisation_in_Animals_Mind_Map.png',
    dimensions: { width: 1536, height: 1024 },
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Original high-resolution visual mind map for Structural Organisation in Animals.',
    keyTopics: ['Epithelial Tissue', 'Connective Tissue', 'Muscle & Neural Tissue', 'Frog Anatomy & Organ Systems']
  },
  {
    id: 'mm-bio-11-09',
    classLevel: 11,
    subject: 'Biology',
    chapterNumber: 9,
    chapterTitle: 'Biomolecules',
    chapterSlug: 'biomolecules',
    chapterId: 'CH_KEBO109',
    title: 'Biomolecules Revision Mind Map',
    type: 'mind_map',
    assetUrl: '/mindmaps/biology/original/Biomolecules Chapter 9 Revision Mindmap.png',
    downloadFileName: 'Class_11_Biology_Chapter_9_Biomolecules_Mind_Map.png',
    dimensions: { width: 1536, height: 1024 },
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Original high-resolution visual mind map for Biomolecules.',
    keyTopics: ['Carbohydrates', 'Proteins & Amino Acids', 'Lipids', 'Nucleic Acids', 'Enzyme Kinetics & Classification']
  },
  {
    id: 'mm-bio-11-10',
    classLevel: 11,
    subject: 'Biology',
    chapterNumber: 10,
    chapterTitle: 'Cell Cycle and Cell Division',
    chapterSlug: 'cell-cycle-and-cell-division',
    chapterId: 'CH_KEBO110',
    title: 'Cell Cycle and Cell Division Revision Poster',
    type: 'mind_map',
    assetUrl: '/mindmaps/biology/original/Cell Cycle and Cell Division Revision Poster.png',
    downloadFileName: 'Class_11_Biology_Chapter_10_Cell_Cycle_and_Cell_Division_Mind_Map.png',
    dimensions: { width: 1536, height: 1024 },
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Original high-resolution visual mind map for Cell Cycle and Cell Division.',
    keyTopics: ['Interphase & Mitosis', 'Stages of Meiosis I & II', 'Crossing Over', 'Significance of Cell Division']
  },
  {
    id: 'mm-bio-11-11',
    classLevel: 11,
    subject: 'Biology',
    chapterNumber: 11,
    chapterTitle: 'Photosynthesis in Higher Plants',
    chapterSlug: 'photosynthesis-in-higher-plants',
    chapterId: 'CH_KEBO111',
    title: 'Photosynthesis in Higher Plants Revision Poster',
    type: 'mind_map',
    assetUrl: '/mindmaps/biology/original/Photosynthesis Revision Poster.png',
    downloadFileName: 'Class_11_Biology_Chapter_11_Photosynthesis_in_Higher_Plants_Mind_Map.png',
    dimensions: { width: 1536, height: 1024 },
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Original high-resolution visual mind map for Photosynthesis in Higher Plants.',
    keyTopics: ['Light Reactions', 'Photophosphorylation', 'Calvin Cycle (C3)', 'C4 Pathway', 'Photorespiration', 'Factors Affecting Photosynthesis']
  },
  {
    id: 'mm-bio-11-12',
    classLevel: 11,
    subject: 'Biology',
    chapterNumber: 12,
    chapterTitle: 'Respiration in Plants',
    chapterSlug: 'respiration-in-plants',
    chapterId: 'CH_KEBO112',
    title: 'Cellular Respiration Revision Poster',
    type: 'mind_map',
    assetUrl: '/mindmaps/biology/original/Cellular Respiration Revision Poster.png',
    downloadFileName: 'Class_11_Biology_Chapter_12_Respiration_in_Plants_Mind_Map.png',
    dimensions: { width: 1536, height: 1024 },
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Original high-resolution visual mind map for Respiration in Plants.',
    keyTopics: ['Glycolysis (EMP Pathway)', 'Fermentation', 'Krebs Cycle (TCA)', 'ETS & Oxidative Phosphorylation', 'Respiratory Quotient']
  },
  {
    id: 'mm-bio-11-12-companion',
    classLevel: 11,
    subject: 'Biology',
    chapterNumber: 12,
    chapterTitle: 'Respiration in Plants (Infographic)',
    chapterSlug: 'respiration-in-plants',
    chapterId: 'CH_KEBO112',
    title: 'Plant Respiration Revision Infographic',
    type: 'mind_map',
    assetUrl: '/mindmaps/biology/original/Plant Respiration Revision Infographic.png',
    downloadFileName: 'Class_11_Biology_Chapter_12_Respiration_Infographic.png',
    dimensions: { width: 1536, height: 1024 },
    status: 'ACTIVE',
    editionType: 'COMPANION',
    description: 'Original high-resolution companion infographic for Respiration in Plants.',
    keyTopics: ['ATP Accounting', 'Mitochondrial Pathways']
  },
  {
    id: 'mm-bio-11-13',
    classLevel: 11,
    subject: 'Biology',
    chapterNumber: 13,
    chapterTitle: 'Plant Growth and Development',
    chapterSlug: 'plant-growth-and-development',
    chapterId: 'CH_KEBO113',
    title: 'Plant Growth and Development Infographic',
    type: 'mind_map',
    assetUrl: '/mindmaps/biology/original/Class 11 Biology_ Plant Development Infographic.png',
    downloadFileName: 'Class_11_Biology_Chapter_13_Plant_Growth_and_Development_Mind_Map.png',
    dimensions: { width: 1536, height: 1024 },
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Original high-resolution visual mind map for Plant Growth and Development.',
    keyTopics: ['Phases of Growth', 'Differentiation & Plasticity', 'Phytohormones (Auxin, GA, CK, Ethylene, ABA)', 'Photoperiodism']
  },
  {
    id: 'mm-bio-11-13-companion1',
    classLevel: 11,
    subject: 'Biology',
    chapterNumber: 13,
    chapterTitle: 'Plant Growth and Development (Mind Map)',
    chapterSlug: 'plant-growth-and-development',
    chapterId: 'CH_KEBO113',
    title: 'Plant Growth and Development Mind Map',
    type: 'mind_map',
    assetUrl: '/mindmaps/biology/original/Plant Growth and Development Mind Map.png',
    downloadFileName: 'Class_11_Biology_Chapter_13_Plant_Growth_Mind_Map.png',
    dimensions: { width: 1536, height: 1024 },
    status: 'ACTIVE',
    editionType: 'COMPANION',
    description: 'Original companion mind map for Plant Growth and Development.',
    keyTopics: ['Growth Hormones', 'Vernalisation']
  },
  {
    id: 'mm-bio-11-13-companion2',
    classLevel: 11,
    subject: 'Biology',
    chapterNumber: 13,
    chapterTitle: 'Plant Growth and Development (Study Poster)',
    chapterSlug: 'plant-growth-and-development',
    chapterId: 'CH_KEBO113',
    title: 'Plant Growth and Development Study Poster',
    type: 'mind_map',
    assetUrl: '/mindmaps/biology/original/Plant Growth and Development Study Poster.png',
    downloadFileName: 'Class_11_Biology_Chapter_13_Plant_Growth_Study_Poster.png',
    dimensions: { width: 1536, height: 1024 },
    status: 'ACTIVE',
    editionType: 'COMPANION',
    description: 'Original companion study poster for Plant Growth and Development.',
    keyTopics: ['Plant Hormone Applications']
  },
  {
    id: 'mm-bio-11-14',
    classLevel: 11,
    subject: 'Biology',
    chapterNumber: 14,
    chapterTitle: 'Breathing and Exchange of Gases',
    chapterSlug: 'breathing-and-exchange-of-gases',
    chapterId: 'cmunm1ffe000nevz0tmgsp4lv',
    title: 'Breathing and Gas Exchange Study Chart',
    type: 'mind_map',
    assetUrl: '/mindmaps/biology/original/Breathing and Gas Exchange Study Chart.png',
    downloadFileName: 'Class_11_Biology_Chapter_14_Breathing_and_Exchange_of_Gases_Mind_Map.png',
    dimensions: { width: 1536, height: 1024 },
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Original high-resolution visual mind map for Breathing and Exchange of Gases.',
    keyTopics: ['Respiratory Organs', 'Mechanism of Breathing', 'Respiratory Volumes & Capacities', 'Exchange of Gases', 'Disorders']
  },

  // ==========================================
  // CLASS 12 BIOLOGY
  // ==========================================
  {
    id: 'mm-bio-12-01',
    classLevel: 12,
    subject: 'Biology',
    chapterNumber: 1,
    chapterTitle: 'Sexual Reproduction in Flowering Plants',
    chapterSlug: 'sexual-reproduction-in-flowering-plants',
    chapterId: 'cmunm1fh70011evz04a4n4cen',
    title: 'Flowering Plants Sexual Reproduction Study Map',
    type: 'mind_map',
    assetUrl: '/mindmaps/biology/original/Flowering Plants Sexual Reproduction Study Map.png',
    downloadFileName: 'Class_12_Biology_Chapter_1_Sexual_Reproduction_in_Flowering_Plants_Mind_Map.png',
    dimensions: { width: 1536, height: 1024 },
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Original high-resolution visual mind map for Sexual Reproduction in Flowering Plants.',
    keyTopics: ['Microsporogenesis', 'Megasporogenesis', 'Pollination Mechanisms', 'Double Fertilisation', 'Endosperm & Embryo Development']
  },
  {
    id: 'mm-bio-12-01-companion',
    classLevel: 12,
    subject: 'Biology',
    chapterNumber: 1,
    chapterTitle: 'Sexual Reproduction in Flowering Plants (Alternative)',
    chapterSlug: 'sexual-reproduction-in-flowering-plants',
    chapterId: 'cmunm1fh70011evz04a4n4cen',
    title: 'Flowering Plant Reproduction Study Mind Map',
    type: 'mind_map',
    assetUrl: '/mindmaps/biology/original/Flowering Plant Reproduction Study Mind Map.png',
    downloadFileName: 'Class_12_Biology_Chapter_1_Flowering_Plant_Reproduction_Alternative.png',
    dimensions: { width: 1536, height: 1024 },
    status: 'ACTIVE',
    editionType: 'COMPANION',
    description: 'Original companion study mind map for Sexual Reproduction in Flowering Plants.',
    keyTopics: ['Floral Structures', 'Apomixis & Polyembryony']
  },
  {
    id: 'mm-bio-12-02',
    classLevel: 12,
    subject: 'Biology',
    chapterNumber: 2,
    chapterTitle: 'Human Reproduction',
    chapterSlug: 'human-reproduction',
    chapterId: 'cmunm1fhj0013evz0ocehbb91',
    title: 'Human Reproduction Mind Map',
    type: 'mind_map',
    assetUrl: '/mindmaps/biology/original/Class 12 Human Reproduction Mindmap.png',
    downloadFileName: 'Class_12_Biology_Chapter_2_Human_Reproduction_Mind_Map.png',
    dimensions: { width: 1536, height: 1024 },
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Original high-resolution visual mind map for Human Reproduction.',
    keyTopics: ['Male Reproductive System', 'Female Reproductive System', 'Spermatogenesis & Oogenesis', 'Menstrual Cycle', 'Implantation & Parturition']
  },
  {
    id: 'mm-bio-12-02-companion',
    classLevel: 12,
    subject: 'Biology',
    chapterNumber: 2,
    chapterTitle: 'Human Reproduction (Revision)',
    chapterSlug: 'human-reproduction',
    chapterId: 'cmunm1fhj0013evz0ocehbb91',
    title: 'Human Reproduction Revision Mind Map',
    type: 'mind_map',
    assetUrl: '/mindmaps/biology/original/Human Reproduction Revision Mind Map.png',
    downloadFileName: 'Class_12_Biology_Chapter_2_Human_Reproduction_Revision_Map.png',
    dimensions: { width: 1536, height: 1024 },
    status: 'ACTIVE',
    editionType: 'COMPANION',
    description: 'Original companion revision mind map for Human Reproduction.',
    keyTopics: ['Gametogenesis Comparison', 'Embryonic Development']
  },
  {
    id: 'mm-bio-12-04',
    classLevel: 12,
    subject: 'Biology',
    chapterNumber: 4,
    chapterTitle: 'Principles of Inheritance and Variation',
    chapterSlug: 'principles-of-inheritance-and-variation',
    chapterId: 'CH_LEBO104',
    title: 'Principles of Inheritance and Genetics Infographic',
    type: 'mind_map',
    assetUrl: '/mindmaps/biology/original/Colourful NEET Genetics Revision Infographic.png',
    downloadFileName: 'Class_12_Biology_Chapter_4_Principles_of_Inheritance_and_Variation_Mind_Map.png',
    dimensions: { width: 1536, height: 1024 },
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Original high-resolution visual mind map for Principles of Inheritance and Variation.',
    keyTopics: ["Mendel's Laws of Inheritance", 'Incomplete Dominance & Codominance', 'Chromosomal Theory', 'Linkage & Recombination', 'Mendelian & Chromosomal Disorders']
  },
  {
    id: 'mm-bio-12-05',
    classLevel: 12,
    subject: 'Biology',
    chapterNumber: 5,
    chapterTitle: 'Molecular Basis of Inheritance',
    chapterSlug: 'molecular-basis-of-inheritance',
    chapterId: 'CH_LEBO105',
    title: 'Molecular Basis of Inheritance Study Poster',
    type: 'mind_map',
    assetUrl: '/mindmaps/biology/original/Molecular Basis of Inheritance Study Poster.png',
    downloadFileName: 'Class_12_Biology_Chapter_5_Molecular_Basis_of_Inheritance_Mind_Map.png',
    dimensions: { width: 1536, height: 1024 },
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Original high-resolution visual mind map for Molecular Basis of Inheritance.',
    keyTopics: ['DNA Structure & Packaging', 'Central Dogma', 'Replication Machinery', 'Transcription', 'Genetic Code & Translation', 'Lac Operon', 'HGP & DNA Fingerprinting']
  },
  {
    id: 'mm-bio-12-06',
    classLevel: 12,
    subject: 'Biology',
    chapterNumber: 6,
    chapterTitle: 'Evolution',
    chapterSlug: 'evolution',
    chapterId: 'CH_LEBO106',
    title: 'Evolution Mind Map',
    type: 'mind_map',
    assetUrl: '/mindmaps/biology/original/Class 12 Biology Evolution Mind Map.png',
    downloadFileName: 'Class_12_Biology_Chapter_6_Evolution_Mind_Map.png',
    dimensions: { width: 1536, height: 1024 },
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Original high-resolution visual mind map for Evolution.',
    keyTopics: ['Origin of Life & Miller-Urey', 'Evidences for Evolution', 'Darwinian Theory & Natural Selection', 'Hardy-Weinberg Principle', 'Adaptive Radiation', 'Human Evolution']
  },
  {
    id: 'mm-bio-12-07',
    classLevel: 12,
    subject: 'Biology',
    chapterNumber: 7,
    chapterTitle: 'Human Health and Disease',
    chapterSlug: 'human-health-and-disease',
    chapterId: 'CH_LEBO107',
    title: 'Human Health and Disease Mind Map',
    type: 'mind_map',
    assetUrl: '/mindmaps/biology/original/Human Health and Disease Mind Map.png',
    downloadFileName: 'Class_12_Biology_Chapter_7_Human_Health_and_Disease_Mind_Map.png',
    dimensions: { width: 1536, height: 1024 },
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Original high-resolution visual mind map for Human Health and Disease.',
    keyTopics: ['Pathogens & Common Diseases', 'Innate & Acquired Immunity', 'Vaccination', 'AIDS & HIV Life Cycle', 'Cancer Biology', 'Drug & Alcohol Abuse']
  },
  {
    id: 'mm-bio-12-08',
    classLevel: 12,
    subject: 'Biology',
    chapterNumber: 8,
    chapterTitle: 'Microbes in Human Welfare',
    chapterSlug: 'microbes-in-human-welfare',
    chapterId: 'CH_LEBO108',
    title: 'Microbes in Human Welfare Revision Chart',
    type: 'mind_map',
    assetUrl: '/mindmaps/biology/original/Microbes in Human Welfare Revision Chart.png',
    downloadFileName: 'Class_12_Biology_Chapter_8_Microbes_in_Human_Welfare_Mind_Map.png',
    dimensions: { width: 1536, height: 1024 },
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Original high-resolution visual mind map for Microbes in Human Welfare.',
    keyTopics: ['Microbes in Household Food', 'Industrial Fermentation & Antibiotics', 'Sewage Treatment (STPs)', 'Biogas Production', 'Biocontrol Agents & Biofertilisers']
  },
  {
    id: 'mm-bio-12-09',
    classLevel: 12,
    subject: 'Biology',
    chapterNumber: 9,
    chapterTitle: 'Biotechnology: Principles and Processes',
    chapterSlug: 'biotechnology-principles-and-processes',
    chapterId: 'CH_LEBO109',
    title: 'Biotechnology: Principles and Processes Revision Map',
    type: 'mind_map',
    assetUrl: '/mindmaps/biology/original/Biotechnology Principles and Processes Revision Map.png',
    downloadFileName: 'Class_12_Biology_Chapter_9_Biotechnology_Principles_and_Processes_Mind_Map.png',
    dimensions: { width: 1536, height: 1024 },
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Original high-resolution visual mind map for Biotechnology: Principles and Processes.',
    keyTopics: ['Restriction Endonucleases', 'Cloning Vectors (pBR322)', 'Competent Host Transformation', 'Processes of Recombinant DNA Technology', 'Bioreactors & Downstream Processing']
  },
  {
    id: 'mm-bio-12-09-companion',
    classLevel: 12,
    subject: 'Biology',
    chapterNumber: 9,
    chapterTitle: 'Biotechnology: Principles and Processes (Study Map)',
    chapterSlug: 'biotechnology-principles-and-processes',
    chapterId: 'CH_LEBO109',
    title: 'Biotechnology Chapter 9 Study Mindmap',
    type: 'mind_map',
    assetUrl: '/mindmaps/biology/original/Biotechnology Chapter 9 Study Mindmap.png',
    downloadFileName: 'Class_12_Biology_Chapter_9_Biotechnology_Study_Mindmap.png',
    dimensions: { width: 1536, height: 1024 },
    status: 'ACTIVE',
    editionType: 'COMPANION',
    description: 'Original companion study mind map for Biotechnology Principles.',
    keyTopics: ['rDNA Steps', 'Gel Electrophoresis', 'PCR Steps']
  },
  {
    id: 'mm-bio-12-10',
    classLevel: 12,
    subject: 'Biology',
    chapterNumber: 10,
    chapterTitle: 'Biotechnology and its Applications',
    chapterSlug: 'biotechnology-and-its-applications',
    chapterId: 'CH_LEBO110',
    title: 'Biotechnology Applications Revision Mind Map',
    type: 'mind_map',
    assetUrl: '/mindmaps/biology/original/Biotechnology Applications Revision Mind Map.png',
    downloadFileName: 'Class_12_Biology_Chapter_10_Biotechnology_and_its_Applications_Mind_Map.png',
    dimensions: { width: 1536, height: 1024 },
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Original high-resolution visual mind map for Biotechnology and its Applications.',
    keyTopics: ['Bt Crops (Bt Cotton)', 'RNA Interference (RNAi)', 'Genetically Engineered Insulin', 'Gene Therapy (ADA Deficiency)', 'Transgenic Animals', 'Ethical Issues & GEAC']
  },
  {
    id: 'mm-bio-12-11',
    classLevel: 12,
    subject: 'Biology',
    chapterNumber: 11,
    chapterTitle: 'Organisms and Populations',
    chapterSlug: 'organisms-and-populations',
    chapterId: 'CH_LEBO111',
    title: 'Organisms and Populations Mind Map',
    type: 'mind_map',
    assetUrl: '/mindmaps/biology/original/Class 12 Biology_ Organisms and Populations Mind Map.png',
    downloadFileName: 'Class_12_Biology_Chapter_11_Organisms_and_Populations_Mind_Map.png',
    dimensions: { width: 1536, height: 1024 },
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Original high-resolution visual mind map for Organisms and Populations.',
    keyTopics: ['Major Abiotic Factors', 'Adaptations in Plants & Animals', 'Population Attributes', 'Growth Models (Exponential & Logistic)', 'Population Interactions']
  },
  {
    id: 'mm-bio-12-12',
    classLevel: 12,
    subject: 'Biology',
    chapterNumber: 12,
    chapterTitle: 'Ecosystem',
    chapterSlug: 'ecosystem',
    chapterId: 'CH_LEBO112',
    title: 'Ecosystem Revision Mind Map',
    type: 'mind_map',
    assetUrl: '/mindmaps/biology/original/Class 12 Ecosystem Revision Mind Map.png',
    downloadFileName: 'Class_12_Biology_Chapter_12_Ecosystem_Mind_Map.png',
    dimensions: { width: 1536, height: 1024 },
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Original high-resolution visual mind map for Ecosystem.',
    keyTopics: ['Ecosystem Structure & Components', 'Productivity (GPP & NPP)', 'Decomposition Process', 'Energy Flow & Food Webs', 'Ecological Pyramids']
  },
  {
    id: 'mm-bio-12-13',
    classLevel: 12,
    subject: 'Biology',
    chapterNumber: 13,
    chapterTitle: 'Biodiversity and Conservation',
    chapterSlug: 'biodiversity-and-conservation',
    chapterId: 'CH_LEBO113',
    title: 'Biodiversity and Conservation Mind Map',
    type: 'mind_map',
    assetUrl: '/mindmaps/biology/original/Class 12 Biodiversity Revision Mind Map.png',
    downloadFileName: 'Class_12_Biology_Chapter_13_Biodiversity_and_Conservation_Mind_Map.png',
    dimensions: { width: 1536, height: 1024 },
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Original high-resolution visual mind map for Biodiversity and Conservation.',
    keyTopics: ['Levels of Biodiversity', 'Patterns of Biodiversity & Species-Area Relationship', 'The Evil Quartet (Loss of Biodiversity)', 'In-situ & Ex-situ Conservation']
  },

  // ==========================================
  // RATIONALIZED-OUT / LEGACY POSTERS
  // ==========================================
  {
    id: 'mm-bio-11-legacy-mineral',
    classLevel: 11,
    subject: 'Biology',
    chapterNumber: 12,
    chapterTitle: 'Mineral Nutrition (Old NCERT)',
    chapterSlug: 'mineral-nutrition',
    title: 'Mineral Nutrition Mindmap (Legacy Syllabus)',
    type: 'mind_map',
    assetUrl: '/mindmaps/biology/original/Class 11 Mineral Nutrition Mindmap.png',
    downloadFileName: 'Class_11_Biology_Mineral_Nutrition_Legacy_Mind_Map.png',
    dimensions: { width: 1536, height: 1024 },
    status: 'LEGACY',
    editionType: 'LEGACY',
    description: 'Legacy mind map for Mineral Nutrition (rationalized out of active NEET syllabus).',
    keyTopics: ['Essential Mineral Elements', 'Nitrogen Cycle', 'Deficiency Symptoms']
  },
  {
    id: 'mm-bio-12-legacy-breeding',
    classLevel: 12,
    subject: 'Biology',
    chapterNumber: 9,
    chapterTitle: 'Strategies for Enhancement in Food Production - Plant Breeding (Old NCERT)',
    chapterSlug: 'strategies-for-enhancement-in-food-production',
    title: 'Plant Breeding Study Poster (Legacy Syllabus)',
    type: 'mind_map',
    assetUrl: '/mindmaps/biology/original/Chapter 18_ Plant Breeding Study Poster.png',
    downloadFileName: 'Class_12_Biology_Plant_Breeding_Legacy_Poster.png',
    dimensions: { width: 1536, height: 1024 },
    status: 'LEGACY',
    editionType: 'LEGACY',
    description: 'Legacy study poster for Plant Breeding (rationalized out of active NEET syllabus).',
    keyTopics: ['Plant Breeding Steps', 'Biofortification']
  },
  {
    id: 'mm-bio-12-legacy-tissue-culture',
    classLevel: 12,
    subject: 'Biology',
    chapterNumber: 9,
    chapterTitle: 'Strategies for Enhancement in Food Production - Plant Tissue Culture (Old NCERT)',
    chapterSlug: 'strategies-for-enhancement-in-food-production-tissue-culture',
    title: 'Plant Tissue Culture Mind Map (Legacy Syllabus)',
    type: 'mind_map',
    assetUrl: '/mindmaps/biology/original/Plant Tissue Culture_ Class 12 Biology Mind Map.png',
    downloadFileName: 'Class_12_Biology_Plant_Tissue_Culture_Legacy_Mind_Map.png',
    dimensions: { width: 1536, height: 1024 },
    status: 'LEGACY',
    editionType: 'LEGACY',
    description: 'Legacy mind map for Plant Tissue Culture (rationalized out of active NEET syllabus).',
    keyTopics: ['Cell Totipotency', 'Micropropagation', 'Somatic Hybridisation']
  }
];

/**
 * Helper to match a Biology chapter to its corresponding Mind Map
 */
export function getBiologyMindMapForChapter(chapter: {
  id?: string;
  slug?: string;
  title?: string;
  chapterNumber?: number;
  classLevel?: number | string;
  subjectName?: string;
}): BiologyMindMapMeta | undefined {
  if (!chapter) return undefined;

  // 1. Direct exact match by Chapter ID
  if (chapter.id) {
    const byId = BIOLOGY_MIND_MAPS.find((m) => m.chapterId === chapter.id && m.editionType === 'PRIMARY');
    if (byId) return byId;
  }

  // 2. Direct exact match by Slug
  if (chapter.slug) {
    const normSlug = chapter.slug.toLowerCase().trim();
    const bySlug = BIOLOGY_MIND_MAPS.find(
      (m) => m.chapterSlug.toLowerCase() === normSlug && m.editionType === 'PRIMARY'
    );
    if (bySlug) return bySlug;
  }

  // 3. Exact title match
  if (chapter.title) {
    const normTitle = chapter.title.toLowerCase().trim();
    const byExactTitle = BIOLOGY_MIND_MAPS.find(
      (m) => m.chapterTitle.toLowerCase().trim() === normTitle && m.editionType === 'PRIMARY'
    );
    if (byExactTitle) return byExactTitle;
  }

  // 4. Match by Class Level + Chapter Number for Biology
  if (chapter.chapterNumber) {
    const isBio = !chapter.subjectName || chapter.subjectName.toLowerCase().includes('bio');
    if (isBio && chapter.classLevel) {
      const classNum =
        typeof chapter.classLevel === 'number'
          ? chapter.classLevel
          : chapter.classLevel.toString().includes('12')
          ? 12
          : 11;
      const byNum = BIOLOGY_MIND_MAPS.find(
        (m) => m.classLevel === classNum && m.chapterNumber === chapter.chapterNumber && m.editionType === 'PRIMARY'
      );
      if (byNum) return byNum;
    }
  }

  return undefined;
}
