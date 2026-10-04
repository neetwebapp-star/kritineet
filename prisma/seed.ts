import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding Canonical NEET 2027 Hierarchy ---');

  // 1. Classes
  const class11 = await prisma.classLevel.upsert({
    where: { code: 'CLASS_11' },
    update: {},
    create: {
      name: 'Class 11',
      code: 'CLASS_11',
      order: 1,
    },
  });

  const class12 = await prisma.classLevel.upsert({
    where: { code: 'CLASS_12' },
    update: {},
    create: {
      name: 'Class 12',
      code: 'CLASS_12',
      order: 2,
    },
  });

  // 2. Subjects
  const phy11 = await prisma.subject.upsert({
    where: { code_classLevelId: { code: 'PHYSICS', classLevelId: class11.id } },
    update: {},
    create: { name: 'Physics (Class 11)', code: 'PHYSICS', classLevelId: class11.id },
  });

  const chem11 = await prisma.subject.upsert({
    where: { code_classLevelId: { code: 'CHEMISTRY', classLevelId: class11.id } },
    update: {},
    create: { name: 'Chemistry (Class 11)', code: 'CHEMISTRY', classLevelId: class11.id },
  });

  const bio11 = await prisma.subject.upsert({
    where: { code_classLevelId: { code: 'BIOLOGY', classLevelId: class11.id } },
    update: {},
    create: { name: 'Biology (Class 11)', code: 'BIOLOGY', classLevelId: class11.id },
  });

  const phy12 = await prisma.subject.upsert({
    where: { code_classLevelId: { code: 'PHYSICS', classLevelId: class12.id } },
    update: {},
    create: { name: 'Physics (Class 12)', code: 'PHYSICS', classLevelId: class12.id },
  });

  const chem12 = await prisma.subject.upsert({
    where: { code_classLevelId: { code: 'CHEMISTRY', classLevelId: class12.id } },
    update: {},
    create: { name: 'Chemistry (Class 12)', code: 'CHEMISTRY', classLevelId: class12.id },
  });

  const bio12 = await prisma.subject.upsert({
    where: { code_classLevelId: { code: 'BIOLOGY', classLevelId: class12.id } },
    update: {},
    create: { name: 'Biology (Class 12)', code: 'BIOLOGY', classLevelId: class12.id },
  });

  // 3. Units & Chapters (with official Biology Botany/Zoology mappings)
  const chaptersData = [
    // Biology Class 11 (Botany / Zoology)
    {
      title: 'The Living World',
      slug: 'the-living-world',
      chapterNumber: 1,
      subjectId: bio11.id,
      biologyCategory: 'BOTANY',
      ncertBookCode: 'kebo101',
      concepts: [
        {
          id: 'CONCEPT_LIVING_CHARACTERISTICS',
          name: 'Defining Characteristics of Living Organisms',
          definition: 'Growth and reproduction are non-defining, while cellular organization and consciousness are defining properties of life.',
          formula: null,
          laws: 'Biological Hierarchy & Self-regulation',
        },
        {
          id: 'CONCEPT_BINOMIAL_NOMENCLATURE',
          name: 'Binomial Nomenclature & Taxonomic Hierarchy',
          definition: 'System of naming proposed by Carolus Linnaeus: Generic name capitalized, specific epithet in lower case, Latinized/Italics.',
          formula: null,
          laws: 'ICBN and ICZN naming codes',
        },
      ],
    },
    {
      title: 'Biological Classification',
      slug: 'biological-classification',
      chapterNumber: 2,
      subjectId: bio11.id,
      biologyCategory: 'BOTANY',
      ncertBookCode: 'kebo102',
      concepts: [
        {
          id: 'CONCEPT_FIVE_KINGDOM_SYSTEM',
          name: 'Five Kingdom Classification',
          definition: 'R.H. Whittaker (1969) classification based on cell structure, body organisation, mode of nutrition, reproduction, and phylogenetic relationships.',
          formula: null,
          laws: 'Monera, Protista, Fungi, Plantae, Animalia',
        },
      ],
    },
    {
      title: 'Plant Kingdom',
      slug: 'plant-kingdom',
      chapterNumber: 3,
      subjectId: bio11.id,
      biologyCategory: 'BOTANY',
      ncertBookCode: 'kebo103',
      concepts: [
        {
          id: 'CONCEPT_PLANT_LIFE_CYCLES',
          name: 'Alternation of Generations in Plants',
          definition: 'Haplontic, Diplontic, and Haplo-diplontic life cycles.',
          formula: null,
          laws: 'Gametophyte (n) producing gametes and Sporophyte (2n) producing spores.',
        },
      ],
    },
    {
      title: 'Animal Kingdom',
      slug: 'animal-kingdom',
      chapterNumber: 4,
      subjectId: bio11.id,
      biologyCategory: 'ZOOLOGY',
      ncertBookCode: 'kebo104',
      concepts: [
        {
          id: 'CONCEPT_COELOM_SYMMETRY',
          name: 'Levels of Organisation, Symmetry and Coelom',
          definition: 'Classification criteria including acoelomates, pseudocoelomates, and eucoelomates with radial or bilateral symmetry.',
          formula: null,
          laws: 'Triploblastic and Diploblastic organization',
        },
      ],
    },
    {
      title: 'Breathing and Exchange of Gases',
      slug: 'breathing-and-exchange-of-gases',
      chapterNumber: 14,
      subjectId: bio11.id,
      biologyCategory: 'ZOOLOGY',
      ncertBookCode: 'kebo114',
      concepts: [
        {
          id: 'CONCEPT_RESPIRATORY_VOLUMES',
          name: 'Respiratory Volumes and Capacities',
          definition: 'Tidal volume (TV), Inspiratory Reserve Volume (IRV), Expiratory Reserve Volume (ERV), Residual Volume (RV).',
          formula: 'VC = TV + IRV + ERV; TLC = VC + RV',
          laws: 'Dalton’s Law of Partial Pressures applied to Alveolar exchange',
        },
      ],
    },

    // Physics Class 11
    {
      title: 'Units and Measurements',
      slug: 'units-and-measurements',
      chapterNumber: 1,
      subjectId: phy11.id,
      biologyCategory: null,
      ncertBookCode: 'keph101',
      concepts: [
        {
          id: 'CONCEPT_DIMENSIONAL_ANALYSIS',
          name: 'Dimensional Analysis and Error Analysis',
          definition: 'Principle of homogeneity of dimensions: only physical quantities of the same dimension can be added, subtracted or equated.',
          formula: 'ΔZ/Z = a(ΔA/A) + b(ΔB/B)',
          laws: 'Principle of Homogeneity',
        },
      ],
    },
    {
      title: 'Laws of Motion',
      slug: 'laws-of-motion',
      chapterNumber: 4,
      subjectId: phy11.id,
      biologyCategory: null,
      ncertBookCode: 'keph104',
      concepts: [
        {
          id: 'CONCEPT_NEWTON_2ND_LAW',
          name: "Newton's Second Law of Motion",
          definition: 'The rate of change of momentum of a body is directly proportional to the applied force and takes place in the direction in which the force acts.',
          formula: 'F = dp/dt = ma',
          laws: "Newton's Laws of Motion",
        },
        {
          id: 'CONCEPT_CONSERVATION_MOMENTUM',
          name: 'Conservation of Linear Momentum and Friction',
          definition: 'In an isolated system, the total linear momentum is conserved. Static and kinetic friction laws.',
          formula: 'm1*u1 + m2*u2 = m1*v1 + m2*v2; fs <= μs * N',
          laws: 'Law of Conservation of Linear Momentum',
        },
      ],
    },

    // Physics Class 12
    {
      title: 'Electric Charges and Fields',
      slug: 'electric-charges-and-fields',
      chapterNumber: 1,
      subjectId: phy12.id,
      biologyCategory: null,
      ncertBookCode: 'leph101',
      concepts: [
        {
          id: 'CONCEPT_COULOMBS_LAW',
          name: "Coulomb's Law and Gauss's Theorem",
          definition: 'Electrostatic force between two point charges and electric flux through a closed surface.',
          formula: 'F = (1 / 4πε₀) * (q1 * q2 / r²); ∮ E · dA = q_enclosed / ε₀',
          laws: "Coulomb's Law and Gauss's Law",
        },
      ],
    },
    {
      title: 'Current Electricity',
      slug: 'current-electricity',
      chapterNumber: 3,
      subjectId: phy12.id,
      biologyCategory: null,
      ncertBookCode: 'leph103',
      concepts: [
        {
          id: 'CONCEPT_KIRCHHOFFS_LAWS',
          name: "Kirchhoff's Laws and Wheatstone Bridge",
          definition: "Junction Rule (KCL: conservation of charge) and Loop Rule (KVL: conservation of energy).",
          formula: '∑ I_in = ∑ I_out; ∑ ΔV = 0; R1/R2 = R3/R4 (balanced bridge)',
          laws: "Kirchhoff's Current & Voltage Laws",
        },
      ],
    },

    // Chemistry Class 11
    {
      title: 'Some Basic Concepts of Chemistry',
      slug: 'some-basic-concepts-of-chemistry',
      chapterNumber: 1,
      subjectId: chem11.id,
      biologyCategory: null,
      ncertBookCode: 'kech101',
      concepts: [
        {
          id: 'CONCEPT_MOLE_CONCEPT',
          name: 'Mole Concept and Stoichiometry',
          definition: 'One mole contains exactly 6.02214076 × 10²³ elementary entities (Avogadro number).',
          formula: 'Moles = Mass / Molar Mass; Molarity = Moles of solute / Volume of solution (L)',
          laws: 'Law of Definite and Multiple Proportions',
        },
      ],
    },

    // Chemistry Class 12
    {
      title: 'Electrochemistry',
      slug: 'electrochemistry',
      chapterNumber: 2,
      subjectId: chem12.id,
      biologyCategory: null,
      ncertBookCode: 'lech102',
      concepts: [
        {
          id: 'CONCEPT_NERNST_EQUATION',
          name: 'Nernst Equation and Kohlrausch Law',
          definition: 'Relates cell potential to standard potential and reaction quotient Q.',
          formula: 'E_cell = E°_cell - (0.0591 / n) * log10(Q); Λ°m = ν+ * λ°+ + ν- * λ°-',
          laws: 'Nernst Equation and Kohlrausch Law of Independent Migration',
        },
      ],
    },

    // Biology Class 12 (Botany / Zoology)
    {
      title: 'Sexual Reproduction in Flowering Plants',
      slug: 'sexual-reproduction-in-flowering-plants',
      chapterNumber: 1,
      subjectId: bio12.id,
      biologyCategory: 'BOTANY',
      ncertBookCode: 'lebo101',
      concepts: [
        {
          id: 'CONCEPT_DOUBLE_FERTILIZATION',
          name: 'Double Fertilization & Embryo Development',
          definition: 'Syngamy (egg + male gamete -> zygote 2n) and Triple Fusion (polar nuclei + male gamete -> PEN 3n). Unique to angiosperms.',
          formula: null,
          laws: 'Navashin (1898) Double Fertilization in Angiosperms',
        },
      ],
    },
    {
      title: 'Human Reproduction',
      slug: 'human-reproduction',
      chapterNumber: 2,
      subjectId: bio12.id,
      biologyCategory: 'ZOOLOGY',
      ncertBookCode: 'lebo102',
      concepts: [
        {
          id: 'CONCEPT_GAMETOGENESIS_HORMONES',
          name: 'Spermatogenesis, Oogenesis and Menstrual Cycle',
          definition: 'Hormonal regulation (GnRH, LH, FSH, Estrogen, Progesterone) of gametogenesis and ovarian cycle.',
          formula: null,
          laws: 'Negative and Positive Feedback Endocrine Controls',
        },
      ],
    },
  ];

  for (const cData of chaptersData) {
    const chapter = await prisma.chapter.upsert({
      where: { slug: cData.slug },
      update: {
        biologyCategory: cData.biologyCategory,
        ncertBookCode: cData.ncertBookCode,
      },
      create: {
        title: cData.title,
        slug: cData.slug,
        chapterNumber: cData.chapterNumber,
        subjectId: cData.subjectId,
        biologyCategory: cData.biologyCategory,
        ncertBookCode: cData.ncertBookCode,
      },
    });

    for (const c of cData.concepts) {
      await prisma.concept.upsert({
        where: { id: c.id },
        update: {
          name: c.name,
          definition: c.definition,
          formula: c.formula,
          laws: c.laws,
          chapterId: chapter.id,
        },
        create: {
          id: c.id,
          name: c.name,
          definition: c.definition,
          formula: c.formula,
          laws: c.laws,
          chapterId: chapter.id,
          ncertReference: JSON.stringify({
            chapterTitle: cData.title,
            ncertBookCode: cData.ncertBookCode,
          }),
        },
      });
    }
  }

  // 4. Default Seed Student & Admin Users
  const student = await prisma.user.upsert({
    where: { email: 'student@neet2027.com' },
    update: {},
    create: {
      email: 'student@neet2027.com',
      name: 'NEET 2027 Aspirant',
      role: 'STUDENT',
      profile: {
        create: {
          targetExamYear: 2027,
          dailyTargetQuestions: 50,
          dailyTargetMinutes: 180,
          currentStreak: 7,
          totalAttempted: 120,
          totalCorrect: 96,
          accuracyRate: 80.0,
        },
      },
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@neet2027.com' },
    update: {},
    create: {
      email: 'admin@neet2027.com',
      name: 'System Admin',
      role: 'ADMIN',
    },
  });

  console.log(`✓ Seeded canonical hierarchy, users: ${student.email}, ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
