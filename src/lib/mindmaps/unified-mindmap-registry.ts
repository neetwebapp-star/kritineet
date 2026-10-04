/**
 * UNIFIED MIND MAP CANONICAL REGISTRY
 * Maps original chapter mind map files (Images, PDFs, HTML, SVG) to NCERT Chapters
 * Strictly uses original high-resolution files without redrawing, recreating, or converting.
 */

import { PHYSICS_MIND_MAPS, PhysicsMindMapMeta } from './physics-mindmap-registry';
import { BIOLOGY_MIND_MAPS, BiologyMindMapMeta } from './biology-mindmap-registry';

export interface UnifiedMindMapMeta {
  id: string;
  chapterId?: string;
  classLevel: 11 | 12;
  subject: 'Physics' | 'Chemistry' | 'Biology';
  chapterNumber: number;
  chapterTitle: string;
  chapterSlug: string;
  title: string;
  fileType: 'image' | 'pdf' | 'html' | 'svg';
  assetUrl: string;
  downloadFileName: string;
  dimensions?: { width: number; height: number };
  description?: string;
}

// ==========================================
// CHEMISTRY ORIGINAL MIND MAPS
// ==========================================
export const CHEMISTRY_ORIGINAL_MIND_MAPS: UnifiedMindMapMeta[] = [
  // Class 11 Chemistry
  {
    id: 'mm-chem-11-01',
    chapterId: 'cmunm1fgr000xevz01a6mbtmt',
    classLevel: 11,
    subject: 'Chemistry',
    chapterNumber: 1,
    chapterTitle: 'Some Basic Concepts of Chemistry',
    chapterSlug: 'some-basic-concepts-of-chemistry',
    title: 'Some Basic Concepts of Chemistry Mind Map',
    fileType: 'image',
    assetUrl: '/mindmaps/chemistry/original/Chemistry Concepts Revision Mind Map.png',
    downloadFileName: 'Class_11_Chemistry_Chapter_1_Some_Basic_Concepts_of_Chemistry_Mind_Map.png',
    dimensions: { width: 1024, height: 1536 },
    description: 'Original high-resolution visual mind map for Some Basic Concepts of Chemistry.'
  },
  {
    id: 'mm-chem-11-02',
    chapterId: 'CH_KECH102',
    classLevel: 11,
    subject: 'Chemistry',
    chapterNumber: 2,
    chapterTitle: 'Structure of Atom',
    chapterSlug: 'structure-of-atom',
    title: 'Structure of Atom Study Map',
    fileType: 'image',
    assetUrl: '/mindmaps/chemistry/original/Structure of Atom_ Chemistry Study Map.png',
    downloadFileName: 'Class_11_Chemistry_Chapter_2_Structure_of_Atom_Mind_Map.png',
    dimensions: { width: 1024, height: 1536 },
    description: 'Original high-resolution visual mind map for Structure of Atom.'
  },
  {
    id: 'mm-chem-11-03',
    chapterId: 'CH_KECH103',
    classLevel: 11,
    subject: 'Chemistry',
    chapterNumber: 3,
    chapterTitle: 'Classification of Elements and Periodicity in Properties',
    chapterSlug: 'classification-of-elements-and-periodicity-in-properties',
    title: 'Classification of Elements & Periodicity Mind Map',
    fileType: 'image',
    assetUrl: '/mindmaps/chemistry/original/Colourful Periodicity Chapter Mind Map.png',
    downloadFileName: 'Class_11_Chemistry_Chapter_3_Periodicity_Mind_Map.png',
    dimensions: { width: 1024, height: 1536 },
    description: 'Original high-resolution visual mind map for Classification of Elements.'
  },
  {
    id: 'mm-chem-11-04',
    chapterId: 'CH_KECH104',
    classLevel: 11,
    subject: 'Chemistry',
    chapterNumber: 4,
    chapterTitle: 'Chemical Bonding and Molecular Structure',
    chapterSlug: 'chemical-bonding-and-molecular-structure',
    title: 'Chemical Bonding and Molecular Structure Mind Map',
    fileType: 'image',
    assetUrl: '/mindmaps/chemistry/original/Class 11 Chemical Bonding Mind Map.png',
    downloadFileName: 'Class_11_Chemistry_Chapter_4_Chemical_Bonding_Mind_Map.png',
    dimensions: { width: 1024, height: 1536 },
    description: 'Original high-resolution visual mind map for Chemical Bonding.'
  },
  {
    id: 'mm-chem-11-05',
    chapterId: 'CH_KECH105',
    classLevel: 11,
    subject: 'Chemistry',
    chapterNumber: 5,
    chapterTitle: 'Chemical Thermodynamics',
    chapterSlug: 'chemical-thermodynamics',
    title: 'Thermodynamics Mind Map',
    fileType: 'image',
    assetUrl: '/mindmaps/chemistry/original/Thermodynamics Chapter 6 Mind Map.png',
    downloadFileName: 'Class_11_Chemistry_Chapter_5_Thermodynamics_Mind_Map.png',
    dimensions: { width: 1024, height: 1536 },
    description: 'Original high-resolution visual mind map for Chemical Thermodynamics.'
  },
  {
    id: 'mm-chem-11-06',
    chapterId: 'CH_KECH106',
    classLevel: 11,
    subject: 'Chemistry',
    chapterNumber: 6,
    chapterTitle: 'Equilibrium',
    chapterSlug: 'equilibrium',
    title: 'Equilibrium Mind Map',
    fileType: 'image',
    assetUrl: '/mindmaps/chemistry/original/Class 11 Chemistry_ Equilibrium Mind Map.png',
    downloadFileName: 'Class_11_Chemistry_Chapter_6_Equilibrium_Mind_Map.png',
    dimensions: { width: 1024, height: 1536 },
    description: 'Original high-resolution visual mind map for Equilibrium.'
  },
  {
    id: 'mm-chem-11-07',
    chapterId: 'CH_KECH201',
    classLevel: 11,
    subject: 'Chemistry',
    chapterNumber: 7,
    chapterTitle: 'Redox Reactions',
    chapterSlug: 'redox-reactions',
    title: 'Redox Reactions Revision Mind Map',
    fileType: 'image',
    assetUrl: '/mindmaps/chemistry/original/Redox Reactions Revision Mind Map.png',
    downloadFileName: 'Class_11_Chemistry_Chapter_7_Redox_Reactions_Mind_Map.png',
    dimensions: { width: 1024, height: 1536 },
    description: 'Original high-resolution visual mind map for Redox Reactions.'
  },
  {
    id: 'mm-chem-11-08',
    chapterId: 'CH_KECH202',
    classLevel: 11,
    subject: 'Chemistry',
    chapterNumber: 8,
    chapterTitle: 'Organic Chemistry – Some Basic Principles and Techniques',
    chapterSlug: 'organic-chemistry-some-basic-principles-and-techniques',
    title: 'Organic Chemistry Study Mind Map',
    fileType: 'image',
    assetUrl: '/mindmaps/chemistry/original/Organic Chemistry Study Mind Map.png',
    downloadFileName: 'Class_11_Chemistry_Chapter_8_Organic_Chemistry_Mind_Map.png',
    dimensions: { width: 1024, height: 1536 },
    description: 'Original high-resolution visual mind map for Organic Chemistry.'
  },
  {
    id: 'mm-chem-11-09',
    chapterId: 'CH_KECH203',
    classLevel: 11,
    subject: 'Chemistry',
    chapterNumber: 9,
    chapterTitle: 'Hydrocarbons',
    chapterSlug: 'hydrocarbons',
    title: 'Hydrocarbons Study Mind Map',
    fileType: 'image',
    assetUrl: '/mindmaps/chemistry/original/Chapter 13 Hydrocarbons Study Map.png',
    downloadFileName: 'Class_11_Chemistry_Chapter_9_Hydrocarbons_Mind_Map.png',
    dimensions: { width: 1024, height: 1536 },
    description: 'Original high-resolution visual mind map for Hydrocarbons.'
  },

  // Class 12 Chemistry
  {
    id: 'mm-chem-12-01',
    chapterId: 'CH_LECH101',
    classLevel: 12,
    subject: 'Chemistry',
    chapterNumber: 1,
    chapterTitle: 'Solutions',
    chapterSlug: 'solutions',
    title: 'Solutions Revision Mind Map',
    fileType: 'image',
    assetUrl: '/mindmaps/chemistry/original/Colourful Chemistry Solutions Revision Mind Map.png',
    downloadFileName: 'Class_12_Chemistry_Chapter_1_Solutions_Mind_Map.png',
    dimensions: { width: 1024, height: 1536 },
    description: 'Original high-resolution visual mind map for Solutions.'
  },
  {
    id: 'mm-chem-12-02',
    chapterId: 'cmunm1fgz000zevz0yjj353gm',
    classLevel: 12,
    subject: 'Chemistry',
    chapterNumber: 2,
    chapterTitle: 'Electrochemistry',
    chapterSlug: 'electrochemistry',
    title: 'Electrochemistry Revision Mind Map',
    fileType: 'image',
    assetUrl: '/mindmaps/chemistry/original/Colourful Electrochemistry Revision Mind Map.png',
    downloadFileName: 'Class_12_Chemistry_Chapter_2_Electrochemistry_Mind_Map.png',
    dimensions: { width: 1024, height: 1536 },
    description: 'Original high-resolution visual mind map for Electrochemistry.'
  },
  {
    id: 'mm-chem-12-03',
    chapterId: 'CH_LECH103',
    classLevel: 12,
    subject: 'Chemistry',
    chapterNumber: 3,
    chapterTitle: 'Chemical Kinetics',
    chapterSlug: 'chemical-kinetics',
    title: 'Chemical Kinetics Revision Mind Map',
    fileType: 'image',
    assetUrl: '/mindmaps/chemistry/original/Chemical Kinetics Revision Mind Map.png',
    downloadFileName: 'Class_12_Chemistry_Chapter_3_Chemical_Kinetics_Mind_Map.png',
    dimensions: { width: 1024, height: 1536 },
    description: 'Original high-resolution visual mind map for Chemical Kinetics.'
  },
  {
    id: 'mm-chem-12-04',
    chapterId: 'CH_LECH104',
    classLevel: 12,
    subject: 'Chemistry',
    chapterNumber: 4,
    chapterTitle: 'The d- and f-Block Elements',
    chapterSlug: 'the-d-and-f-block-elements',
    title: 'd- and f-Block Elements Infographic',
    fileType: 'image',
    assetUrl: '/mindmaps/chemistry/original/Class 12 Chemistry d- and f-Block Elements Infographic.png',
    downloadFileName: 'Class_12_Chemistry_Chapter_4_d_and_f_Block_Elements_Mind_Map.png',
    dimensions: { width: 1024, height: 1536 },
    description: 'Original high-resolution visual mind map for d- and f-Block Elements.'
  },
  {
    id: 'mm-chem-12-05',
    chapterId: 'CH_LECH105',
    classLevel: 12,
    subject: 'Chemistry',
    chapterNumber: 5,
    chapterTitle: 'Coordination Compounds',
    chapterSlug: 'coordination-compounds',
    title: 'Coordination Compounds Mind Map',
    fileType: 'image',
    assetUrl: '/mindmaps/chemistry/original/Coordination Compounds Revision Mind Map.png',
    downloadFileName: 'Class_12_Chemistry_Chapter_5_Coordination_Compounds_Mind_Map.png',
    dimensions: { width: 1024, height: 1536 },
    description: 'Original high-resolution visual mind map for Coordination Compounds.'
  },
  {
    id: 'mm-chem-12-06',
    chapterId: 'CH_LECH201',
    classLevel: 12,
    subject: 'Chemistry',
    chapterNumber: 6,
    chapterTitle: 'Haloalkanes and Haloarenes',
    chapterSlug: 'haloalkanes-and-haloarenes',
    title: 'Haloalkanes and Haloarenes Mind Map',
    fileType: 'image',
    assetUrl: '/mindmaps/chemistry/original/Haloalkanes and Haloarenes Chemistry Mind Map.png',
    downloadFileName: 'Class_12_Chemistry_Chapter_6_Haloalkanes_and_Haloarenes_Mind_Map.png',
    dimensions: { width: 1024, height: 1536 },
    description: 'Original high-resolution visual mind map for Haloalkanes and Haloarenes.'
  },
  {
    id: 'mm-chem-12-07',
    chapterId: 'CH_LECH202',
    classLevel: 12,
    subject: 'Chemistry',
    chapterNumber: 7,
    chapterTitle: 'Alcohols, Phenols and Ethers',
    chapterSlug: 'alcohols-phenols-and-ethers',
    title: 'Alcohols, Phenols and Ethers Mind Map',
    fileType: 'image',
    assetUrl: '/mindmaps/chemistry/original/Colourful Chemistry Chapter 7 Mind Map.png',
    downloadFileName: 'Class_12_Chemistry_Chapter_7_Alcohols_Phenols_and_Ethers_Mind_Map.png',
    dimensions: { width: 1024, height: 1536 },
    description: 'Original high-resolution visual mind map for Alcohols, Phenols and Ethers.'
  },
  {
    id: 'mm-chem-12-08',
    chapterId: 'CH_LECH203',
    classLevel: 12,
    subject: 'Chemistry',
    chapterNumber: 8,
    chapterTitle: 'Aldehydes, Ketones and Carboxylic Acids',
    chapterSlug: 'aldehydes-ketones-and-carboxylic-acids',
    title: 'Aldehydes, Ketones and Carboxylic Acids Mind Map',
    fileType: 'image',
    assetUrl: '/mindmaps/chemistry/original/Organic Chemistry Reaction Mind Map.png',
    downloadFileName: 'Class_12_Chemistry_Chapter_8_Aldehydes_Ketones_and_Carboxylic_Acids_Mind_Map.png',
    dimensions: { width: 1536, height: 1024 },
    description: 'Original high-resolution visual mind map for Aldehydes, Ketones and Carboxylic Acids.'
  },
  {
    id: 'mm-chem-12-09',
    chapterId: 'CH_LECH204',
    classLevel: 12,
    subject: 'Chemistry',
    chapterNumber: 9,
    chapterTitle: 'Amines',
    chapterSlug: 'amines',
    title: 'Amines Revision Mind Map',
    fileType: 'image',
    assetUrl: '/mindmaps/chemistry/original/Class 12 Chemistry_ Amines Revision Mindmap.png',
    downloadFileName: 'Class_12_Chemistry_Chapter_9_Amines_Mind_Map.png',
    dimensions: { width: 1024, height: 1536 },
    description: 'Original high-resolution visual mind map for Amines.'
  },
  {
    id: 'mm-chem-12-10',
    chapterId: 'CH_LECH205',
    classLevel: 12,
    subject: 'Chemistry',
    chapterNumber: 10,
    chapterTitle: 'Biomolecules',
    chapterSlug: 'chemistry-class-12-biomolecules',
    title: 'Biomolecules Infographic Mind Map',
    fileType: 'image',
    assetUrl: '/mindmaps/chemistry/original/Biomolecules Chapter 10 Infographic.png',
    downloadFileName: 'Class_12_Chemistry_Chapter_10_Biomolecules_Mind_Map.png',
    dimensions: { width: 1024, height: 1536 },
    description: 'Original high-resolution visual mind map for Biomolecules.'
  }
];

// ==========================================
// BIOLOGY ORIGINAL MIND MAPS
// ==========================================
export const BIOLOGY_ORIGINAL_MIND_MAPS: UnifiedMindMapMeta[] = BIOLOGY_MIND_MAPS.map((b) => ({
  id: b.id,
  chapterId: b.chapterId,
  classLevel: b.classLevel,
  subject: 'Biology',
  chapterNumber: b.chapterNumber,
  chapterTitle: b.chapterTitle,
  chapterSlug: b.chapterSlug,
  title: b.title,
  fileType: 'image' as const,
  assetUrl: b.assetUrl,
  downloadFileName: b.downloadFileName,
  dimensions: b.dimensions,
  description: b.description,
}));

// Convert PHYSICS_MIND_MAPS into UnifiedMindMapMeta
export const PHYSICS_ORIGINAL_MIND_MAPS: UnifiedMindMapMeta[] = PHYSICS_MIND_MAPS.map((p) => ({
  id: p.id,
  chapterId: p.chapterId,
  classLevel: p.classLevel,
  subject: 'Physics',
  chapterNumber: p.chapterNumber,
  chapterTitle: p.chapterTitle,
  chapterSlug: p.chapterSlug,
  title: p.title,
  fileType: 'image' as const,
  assetUrl: p.assetUrl,
  downloadFileName: p.downloadFileName,
  dimensions: p.dimensions,
  description: p.description
}));

// All Mind Maps Combined
export const UNIFIED_MIND_MAPS: UnifiedMindMapMeta[] = [
  ...PHYSICS_ORIGINAL_MIND_MAPS,
  ...CHEMISTRY_ORIGINAL_MIND_MAPS,
  ...BIOLOGY_ORIGINAL_MIND_MAPS
];

/**
 * Robust chapter matcher resolving by ID, slug, title, or (subject + classLevel + chapterNumber)
 */
export function getUnifiedMindMapForChapter(chapter: {
  id?: string;
  slug?: string;
  title?: string;
  chapterNumber?: number;
  classLevel?: number | string;
  subjectName?: string;
}): UnifiedMindMapMeta | undefined {
  if (!chapter) return undefined;

  // 1. Direct ID match
  if (chapter.id) {
    const byId = UNIFIED_MIND_MAPS.find((m) => m.chapterId === chapter.id);
    if (byId) return byId;
  }

  // 2. Direct Slug match
  if (chapter.slug) {
    const normSlug = chapter.slug.toLowerCase().trim();
    const bySlug = UNIFIED_MIND_MAPS.find((m) => m.chapterSlug.toLowerCase() === normSlug);
    if (bySlug) return bySlug;
  }

  // 3. Exact Title match
  if (chapter.title) {
    const normTitle = chapter.title.toLowerCase().trim();
    const byTitle = UNIFIED_MIND_MAPS.find(
      (m) => m.chapterTitle.toLowerCase().trim() === normTitle
    );
    if (byTitle) return byTitle;
  }

  // 4. Subject + Class + Chapter Number match
  if (chapter.chapterNumber) {
    const classNum =
      typeof chapter.classLevel === 'number'
        ? chapter.classLevel
        : chapter.classLevel?.toString().includes('12')
        ? 12
        : 11;

    const subj = chapter.subjectName?.toLowerCase() || '';
    let targetSubj: 'Physics' | 'Chemistry' | 'Biology' | null = null;
    if (subj.includes('phys')) targetSubj = 'Physics';
    else if (subj.includes('chem')) targetSubj = 'Chemistry';
    else if (subj.includes('bio')) targetSubj = 'Biology';

    if (targetSubj) {
      const byDetails = UNIFIED_MIND_MAPS.find(
        (m) =>
          m.subject === targetSubj &&
          m.classLevel === classNum &&
          m.chapterNumber === chapter.chapterNumber
      );
      if (byDetails) return byDetails;
    }
  }

  return undefined;
}
