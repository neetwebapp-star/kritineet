/**
 * CHEMISTRY MIND MAP CANONICAL REGISTRY
 * Maps all 19 Class 11 and Class 12 NEET NCERT Chemistry Chapters to original mind map files.
 * Strictly preserves original high-resolution assets without conversion or redrawing.
 */

export interface ChemistryMindMapMeta {
  id: string;
  classLevel: 11 | 12;
  subject: 'Chemistry';
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
  editionType: 'PRIMARY' | 'EXTENDED' | 'COMPANION';
  description: string;
  keyTopics: string[];
}

export const CHEMISTRY_MIND_MAPS: ChemistryMindMapMeta[] = [
  // ==========================================
  // CLASS 11 CHEMISTRY (9 Chapters)
  // ==========================================
  {
    id: 'mm-chem-11-01',
    classLevel: 11,
    subject: 'Chemistry',
    chapterNumber: 1,
    chapterTitle: 'Some Basic Concepts of Chemistry',
    chapterSlug: 'some-basic-concepts-of-chemistry',
    chapterId: 'cmunm1fgr000xevz01a6mbtmt',
    title: 'Some Basic Concepts of Chemistry Mind Map',
    type: 'mind_map',
    assetUrl: '/mindmaps/chemistry/original/Chemistry Concepts Revision Mind Map.png',
    downloadFileName: 'Class_11_Chemistry_Chapter_1_Some_Basic_Concepts_of_Chemistry_Mind_Map.png',
    dimensions: { width: 1024, height: 1536 },
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Original high-resolution visual mind map for Some Basic Concepts of Chemistry.',
    keyTopics: ['Laws of Chemical Combination', 'Mole Concept', 'Stoichiometry', 'Concentration Terms']
  },
  {
    id: 'mm-chem-11-02',
    classLevel: 11,
    subject: 'Chemistry',
    chapterNumber: 2,
    chapterTitle: 'Structure of Atom',
    chapterSlug: 'structure-of-atom',
    chapterId: 'CH_KECH102',
    title: 'Structure of Atom Study Map',
    type: 'mind_map',
    assetUrl: '/mindmaps/chemistry/original/Structure of Atom_ Chemistry Study Map.png',
    downloadFileName: 'Class_11_Chemistry_Chapter_2_Structure_of_Atom_Mind_Map.png',
    dimensions: { width: 1024, height: 1536 },
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Original high-resolution visual mind map for Structure of Atom.',
    keyTopics: ['Bohr Model', 'Quantum Numbers', 'Electronic Configuration', 'de Broglie & Heisenberg']
  },
  {
    id: 'mm-chem-11-03',
    classLevel: 11,
    subject: 'Chemistry',
    chapterNumber: 3,
    chapterTitle: 'Classification of Elements and Periodicity in Properties',
    chapterSlug: 'classification-of-elements-and-periodicity-in-properties',
    chapterId: 'CH_KECH103',
    title: 'Classification of Elements & Periodicity Mind Map',
    type: 'mind_map',
    assetUrl: '/mindmaps/chemistry/original/Colourful Periodicity Chapter Mind Map.png',
    downloadFileName: 'Class_11_Chemistry_Chapter_3_Periodicity_Mind_Map.png',
    dimensions: { width: 1024, height: 1536 },
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Original high-resolution visual mind map for Periodic Trends & Classification.',
    keyTopics: ['Periodic Trends', 'Ionization Enthalpy', 'Electronegativity', 'Atomic Radii']
  },
  {
    id: 'mm-chem-11-04',
    classLevel: 11,
    subject: 'Chemistry',
    chapterNumber: 4,
    chapterTitle: 'Chemical Bonding and Molecular Structure',
    chapterSlug: 'chemical-bonding-and-molecular-structure',
    chapterId: 'CH_KECH104',
    title: 'Chemical Bonding and Molecular Structure Mind Map',
    type: 'mind_map',
    assetUrl: '/mindmaps/chemistry/original/Class 11 Chemical Bonding Mind Map.png',
    downloadFileName: 'Class_11_Chemistry_Chapter_4_Chemical_Bonding_Mind_Map.png',
    dimensions: { width: 1024, height: 1536 },
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Original high-resolution visual mind map for Chemical Bonding & Molecular Structure.',
    keyTopics: ['VSEPR Theory', 'Hybridization', 'Molecular Orbital Theory', 'Hydrogen Bonding']
  },
  {
    id: 'mm-chem-11-05',
    classLevel: 11,
    subject: 'Chemistry',
    chapterNumber: 5,
    chapterTitle: 'Chemical Thermodynamics',
    chapterSlug: 'chemical-thermodynamics',
    chapterId: 'CH_KECH105',
    title: 'Chemical Thermodynamics Mind Map',
    type: 'mind_map',
    assetUrl: '/mindmaps/chemistry/original/Thermodynamics Chapter 6 Mind Map.png',
    downloadFileName: 'Class_11_Chemistry_Chapter_5_Thermodynamics_Mind_Map.png',
    dimensions: { width: 1024, height: 1536 },
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Original high-resolution visual mind map for Chemical Thermodynamics.',
    keyTopics: ['First Law', 'Enthalpy', 'Entropy', 'Gibbs Free Energy', 'Hess Law']
  },
  {
    id: 'mm-chem-11-06',
    classLevel: 11,
    subject: 'Chemistry',
    chapterNumber: 6,
    chapterTitle: 'Equilibrium',
    chapterSlug: 'equilibrium',
    chapterId: 'CH_KECH106',
    title: 'Chemical & Ionic Equilibrium Mind Map',
    type: 'mind_map',
    assetUrl: '/mindmaps/chemistry/original/Class 11 Chemistry_ Equilibrium Mind Map.png',
    downloadFileName: 'Class_11_Chemistry_Chapter_6_Equilibrium_Mind_Map.png',
    dimensions: { width: 1024, height: 1536 },
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Original high-resolution visual mind map for Equilibrium.',
    keyTopics: ['Le Chatelier Principle', 'pH Calculations', 'Buffer Solutions', 'Solubility Product']
  },
  {
    id: 'mm-chem-11-07',
    classLevel: 11,
    subject: 'Chemistry',
    chapterNumber: 7,
    chapterTitle: 'Redox Reactions',
    chapterSlug: 'redox-reactions',
    chapterId: 'CH_KECH201',
    title: 'Redox Reactions Revision Mind Map',
    type: 'mind_map',
    assetUrl: '/mindmaps/chemistry/original/Redox Reactions Revision Mind Map.png',
    downloadFileName: 'Class_11_Chemistry_Chapter_7_Redox_Reactions_Mind_Map.png',
    dimensions: { width: 1024, height: 1536 },
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Original high-resolution visual mind map for Redox Reactions.',
    keyTopics: ['Oxidation Numbers', 'Balancing Redox Equations', 'Electrochemical Series']
  },
  {
    id: 'mm-chem-11-08',
    classLevel: 11,
    subject: 'Chemistry',
    chapterNumber: 8,
    chapterTitle: 'Organic Chemistry – Some Basic Principles and Techniques',
    chapterSlug: 'organic-chemistry-some-basic-principles-and-techniques',
    chapterId: 'CH_KECH202',
    title: 'Organic Chemistry: Principles & Techniques Mind Map',
    type: 'mind_map',
    assetUrl: '/mindmaps/chemistry/original/Organic Chemistry Study Mind Map.png',
    downloadFileName: 'Class_11_Chemistry_Chapter_8_Organic_Chemistry_Mind_Map.png',
    dimensions: { width: 1024, height: 1536 },
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Original high-resolution visual mind map for Organic Chemistry: Principles and Techniques.',
    keyTopics: ['IUPAC Nomenclature', 'Isomerism', 'Inductive & Mesomeric Effects', 'Reaction Intermediates']
  },
  {
    id: 'mm-chem-11-09',
    classLevel: 11,
    subject: 'Chemistry',
    chapterNumber: 9,
    chapterTitle: 'Hydrocarbons',
    chapterSlug: 'hydrocarbons',
    chapterId: 'CH_KECH203',
    title: 'Hydrocarbons Study Mind Map',
    type: 'mind_map',
    assetUrl: '/mindmaps/chemistry/original/Chapter 13 Hydrocarbons Study Map.png',
    downloadFileName: 'Class_11_Chemistry_Chapter_9_Hydrocarbons_Mind_Map.png',
    dimensions: { width: 1024, height: 1536 },
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Original high-resolution visual mind map for Hydrocarbons.',
    keyTopics: ['Alkanes, Alkenes, Alkynes', 'Markovnikov Rule', 'Aromatic Hydrocarbons', 'Electrophilic Substitution']
  },

  // ==========================================
  // CLASS 12 CHEMISTRY (10 Chapters)
  // ==========================================
  {
    id: 'mm-chem-12-01',
    classLevel: 12,
    subject: 'Chemistry',
    chapterNumber: 1,
    chapterTitle: 'Solutions',
    chapterSlug: 'solutions',
    chapterId: 'CH_LECH101',
    title: 'Solutions Revision Mind Map',
    type: 'mind_map',
    assetUrl: '/mindmaps/chemistry/original/Colourful Chemistry Solutions Revision Mind Map.png',
    downloadFileName: 'Class_12_Chemistry_Chapter_1_Solutions_Mind_Map.png',
    dimensions: { width: 1024, height: 1536 },
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Original high-resolution visual mind map for Solutions.',
    keyTopics: ['Raoult Law', 'Colligative Properties', 'Van t Hoff Factor', 'Azeotropes']
  },
  {
    id: 'mm-chem-12-02',
    classLevel: 12,
    subject: 'Chemistry',
    chapterNumber: 2,
    chapterTitle: 'Electrochemistry',
    chapterSlug: 'electrochemistry',
    chapterId: 'cmunm1fgz000zevz0yjj353gm',
    title: 'Electrochemistry Revision Mind Map',
    type: 'mind_map',
    assetUrl: '/mindmaps/chemistry/original/Colourful Electrochemistry Revision Mind Map.png',
    downloadFileName: 'Class_12_Chemistry_Chapter_2_Electrochemistry_Mind_Map.png',
    dimensions: { width: 1024, height: 1536 },
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Original high-resolution visual mind map for Electrochemistry.',
    keyTopics: ['Nernst Equation', 'Kohlrausch Law', 'Batteries & Fuel Cells', 'Electrolysis']
  },
  {
    id: 'mm-chem-12-03',
    classLevel: 12,
    subject: 'Chemistry',
    chapterNumber: 3,
    chapterTitle: 'Chemical Kinetics',
    chapterSlug: 'chemical-kinetics',
    chapterId: 'CH_LECH103',
    title: 'Chemical Kinetics Revision Mind Map',
    type: 'mind_map',
    assetUrl: '/mindmaps/chemistry/original/Chemical Kinetics Revision Mind Map.png',
    downloadFileName: 'Class_12_Chemistry_Chapter_3_Chemical_Kinetics_Mind_Map.png',
    dimensions: { width: 1024, height: 1536 },
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Original high-resolution visual mind map for Chemical Kinetics.',
    keyTopics: ['Rate Law', 'Order & Molecularity', 'Integrated Rate Equations', 'Arrhenius Equation']
  },
  {
    id: 'mm-chem-12-04',
    classLevel: 12,
    subject: 'Chemistry',
    chapterNumber: 4,
    chapterTitle: 'The d- and f-Block Elements',
    chapterSlug: 'the-d-and-f-block-elements',
    chapterId: 'CH_LECH104',
    title: 'd- and f-Block Elements Infographic',
    type: 'mind_map',
    assetUrl: '/mindmaps/chemistry/original/Class 12 Chemistry d- and f-Block Elements Infographic.png',
    downloadFileName: 'Class_12_Chemistry_Chapter_4_d_and_f_Block_Elements_Mind_Map.png',
    dimensions: { width: 1024, height: 1536 },
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Original high-resolution visual mind map for d- and f-Block Elements.',
    keyTopics: ['Transition Metals', 'Lanthanoid Contraction', 'KMnO4 and K2Cr2O7', 'Magnetic Properties']
  },
  {
    id: 'mm-chem-12-05',
    classLevel: 12,
    subject: 'Chemistry',
    chapterNumber: 5,
    chapterTitle: 'Coordination Compounds',
    chapterSlug: 'coordination-compounds',
    chapterId: 'CH_LECH105',
    title: 'Coordination Compounds Mind Map',
    type: 'mind_map',
    assetUrl: '/mindmaps/chemistry/original/Coordination Compounds Revision Mind Map.png',
    downloadFileName: 'Class_12_Chemistry_Chapter_5_Coordination_Compounds_Mind_Map.png',
    dimensions: { width: 1024, height: 1536 },
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Original high-resolution visual mind map for Coordination Compounds.',
    keyTopics: ['Werner Theory', 'IUPAC Nomenclature', 'Crystal Field Theory', 'Isomerism']
  },
  {
    id: 'mm-chem-12-06',
    classLevel: 12,
    subject: 'Chemistry',
    chapterNumber: 6,
    chapterTitle: 'Haloalkanes and Haloarenes',
    chapterSlug: 'haloalkanes-and-haloarenes',
    chapterId: 'CH_LECH201',
    title: 'Haloalkanes and Haloarenes Mind Map',
    type: 'mind_map',
    assetUrl: '/mindmaps/chemistry/original/Haloalkanes and Haloarenes Chemistry Mind Map.png',
    downloadFileName: 'Class_12_Chemistry_Chapter_6_Haloalkanes_and_Haloarenes_Mind_Map.png',
    dimensions: { width: 1024, height: 1536 },
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Original high-resolution visual mind map for Haloalkanes and Haloarenes.',
    keyTopics: ['SN1 and SN2 Mechanisms', 'Elimination Reactions', 'Organometallic Compounds']
  },
  {
    id: 'mm-chem-12-07',
    classLevel: 12,
    subject: 'Chemistry',
    chapterNumber: 7,
    chapterTitle: 'Alcohols, Phenols and Ethers',
    chapterSlug: 'alcohols-phenols-and-ethers',
    chapterId: 'CH_LECH202',
    title: 'Alcohols, Phenols and Ethers Mind Map',
    type: 'mind_map',
    assetUrl: '/mindmaps/chemistry/original/Colourful Chemistry Chapter 7 Mind Map.png',
    downloadFileName: 'Class_12_Chemistry_Chapter_7_Alcohols_Phenols_and_Ethers_Mind_Map.png',
    dimensions: { width: 1536, height: 1024 },
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Original high-resolution visual mind map for Alcohols, Phenols and Ethers.',
    keyTopics: ['Preparation & Properties of Alcohols', 'Phenol Acidity', 'Kolbe & Reimer-Tiemann', 'Williamson Ether Synthesis']
  },
  {
    id: 'mm-chem-12-08',
    classLevel: 12,
    subject: 'Chemistry',
    chapterNumber: 8,
    chapterTitle: 'Aldehydes, Ketones and Carboxylic Acids',
    chapterSlug: 'aldehydes-ketones-and-carboxylic-acids',
    chapterId: 'CH_LECH203',
    title: 'Aldehydes, Ketones and Carboxylic Acids Mind Map',
    type: 'mind_map',
    assetUrl: '/mindmaps/chemistry/original/Organic Chemistry Reaction Mind Map.png',
    downloadFileName: 'Class_12_Chemistry_Chapter_8_Aldehydes_Ketones_and_Carboxylic_Acids_Mind_Map.png',
    dimensions: { width: 1536, height: 1024 },
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Original high-resolution visual mind map for Aldehydes, Ketones and Carboxylic Acids.',
    keyTopics: ['Nucleophilic Addition', 'Aldol & Cannizzaro Reactions', 'Carboxylic Acid Derivatives', 'HVZ Reaction']
  },
  {
    id: 'mm-chem-12-09',
    classLevel: 12,
    subject: 'Chemistry',
    chapterNumber: 9,
    chapterTitle: 'Amines',
    chapterSlug: 'amines',
    chapterId: 'CH_LECH204',
    title: 'Amines Revision Mind Map',
    type: 'mind_map',
    assetUrl: '/mindmaps/chemistry/original/Class 12 Chemistry_ Amines Revision Mindmap.png',
    downloadFileName: 'Class_12_Chemistry_Chapter_9_Amines_Mind_Map.png',
    dimensions: { width: 1024, height: 1536 },
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Original high-resolution visual mind map for Amines.',
    keyTopics: ['Basicity of Amines', 'Hoffmann Bromamide', 'Diazonium Salts', 'Coupling Reactions']
  },
  {
    id: 'mm-chem-12-10',
    classLevel: 12,
    subject: 'Chemistry',
    chapterNumber: 10,
    chapterTitle: 'Biomolecules',
    chapterSlug: 'chemistry-class-12-biomolecules',
    chapterId: 'CH_LECH205',
    title: 'Biomolecules Infographic Mind Map',
    type: 'mind_map',
    assetUrl: '/mindmaps/chemistry/original/Biomolecules Chapter 10 Infographic.png',
    downloadFileName: 'Class_12_Chemistry_Chapter_10_Biomolecules_Mind_Map.png',
    dimensions: { width: 1024, height: 1536 },
    status: 'ACTIVE',
    editionType: 'PRIMARY',
    description: 'Original high-resolution visual mind map for Biomolecules.',
    keyTopics: ['Carbohydrates', 'Proteins & Amino Acids', 'Nucleic Acids', 'Vitamins & Enzymes']
  }
];

export function getChemistryMindMapForChapter(chapter: {
  id?: string;
  slug?: string;
  title?: string;
  chapterNumber?: number;
  classLevel?: number | string;
  subjectName?: string;
}): ChemistryMindMapMeta | undefined {
  if (!chapter) return undefined;

  // 1. Direct exact match by Chapter ID
  if (chapter.id) {
    const byId = CHEMISTRY_MIND_MAPS.find((m) => m.chapterId === chapter.id);
    if (byId) return byId;
  }

  // 2. Direct exact match by Slug
  if (chapter.slug) {
    const normSlug = chapter.slug.toLowerCase().trim();
    const bySlug = CHEMISTRY_MIND_MAPS.find((m) => m.chapterSlug.toLowerCase() === normSlug);
    if (bySlug) return bySlug;
  }

  // 3. Exact title match
  if (chapter.title) {
    const normTitle = chapter.title.toLowerCase().trim();
    const byExactTitle = CHEMISTRY_MIND_MAPS.find(
      (m) => m.chapterTitle.toLowerCase().trim() === normTitle
    );
    if (byExactTitle) return byExactTitle;
  }

  // 4. Match by Class Level + Chapter Number for Chemistry
  if (chapter.chapterNumber) {
    const isChem = !chapter.subjectName || chapter.subjectName.toLowerCase().includes('chem');
    if (isChem && chapter.classLevel) {
      const classNum =
        typeof chapter.classLevel === 'number'
          ? chapter.classLevel
          : chapter.classLevel.toString().includes('12')
          ? 12
          : 11;
      const byNum = CHEMISTRY_MIND_MAPS.find(
        (m) => m.classLevel === classNum && m.chapterNumber === chapter.chapterNumber
      );
      if (byNum) return byNum;
    }
  }

  return undefined;
}
