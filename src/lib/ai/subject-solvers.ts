/**
 * Phase 6: Specialized Subject Solvers
 * Provides domain-specific pedagogic breakdowns for Physics, Chemistry, and Biology
 * following strict NCERT syllabus guidelines and NEET question patterns.
 */

import { RetrievedGroundingContext } from './knowledge-retriever';

export interface SolvedStep {
  stepNumber: number;
  title: string;
  description: string;
  formulaOrRule?: string;
  calculation?: string;
}

export interface SubjectSolution {
  subject: 'PHYSICS' | 'CHEMISTRY' | 'BIOLOGY';
  summary: string;
  steps: SolvedStep[];
  governingPrinciple: string;
  commonTraps: string[];
  ncertReference: string;
  neetRelevance: string;
  finalAnswer?: string;
}

export class PhysicsSolver {
  public static solve(context: RetrievedGroundingContext, query: string): SubjectSolution {
    const q = context.question;
    const concept = context.concepts[0];

    const governingPrinciple = concept?.name || 'Fundamental Law of Motion / Conservation Principle';
    const formula = concept?.formula || 'F = ma / E = mc² / T = 2π√(l/g)';

    const steps: SolvedStep[] = [
      {
        stepNumber: 1,
        title: 'Identify Given Parameters & Target Unknown',
        description: 'Extract all known physical quantities from the question statement with their standard SI units, and identify the required target variable.',
        formulaOrRule: 'Check: Ensure all units are in SI (e.g., convert cm → m, grams → kg, ms → s).'
      },
      {
        stepNumber: 2,
        title: 'State Applicable Governing Physics Law',
        description: `Apply ${governingPrinciple} as per NCERT Class ${concept?.classLevel || 11} Physics syllabus.`,
        formulaOrRule: formula
      },
      {
        stepNumber: 3,
        title: 'Symbolic Manipulation & Substitution',
        description: 'Rearrange the governing equation to isolate the target unknown before substituting numerical values to minimize algebraic errors.',
        calculation: 'Substitute values: Verify algebraic signs (Cartesian sign convention).'
      },
      {
        stepNumber: 4,
        title: 'Calculation & Dimensional Consistency Check',
        description: 'Compute the final numerical magnitude and verify that the dimensional formula of the LHS matches the RHS.',
      }
    ];

    const commonTraps = [
      'Sign convention error (e.g., negative sign for restoring force in SHM or focal length for concave mirror).',
      'Unit conversion slip (e.g., using km/h instead of m/s or Celsius instead of Kelvin).',
      'Confusing scalar speed with vector velocity or work done on system vs by system.'
    ];

    const ncertRef = context.citations.find(c => c.subject.toLowerCase().includes('phy'))?.title ||
      'NCERT Class 11/12 Physics Core Concepts';

    return {
      subject: 'PHYSICS',
      summary: q ? `Step-by-step Physics solution for: "${q.questionText.slice(0, 100)}..."` : `Physics Concept Breakdown: ${concept?.name || 'Mechanics'}`,
      governingPrinciple,
      steps,
      commonTraps,
      ncertReference: ncertRef,
      neetRelevance: context.relatedPYQs.length > 0 ?
        `High-yield concept tested in NEET ${context.relatedPYQs.map(p => p.examYear).join(', ')}.` :
        'Frequently tested numerical pattern in Section A and Section B of NEET Physics.',
      finalAnswer: q?.correctOption ? `Correct Option: (${q.correctOption})` : undefined
    };
  }
}

export class ChemistrySolver {
  public static solve(context: RetrievedGroundingContext, query: string): SubjectSolution {
    const q = context.question;
    const concept = context.concepts[0];
    const isOrganic = query.toLowerCase().includes('organic') || concept?.name.toLowerCase().includes('reaction') || query.includes('reagent');
    const isPhysical = query.toLowerCase().includes('mole') || query.toLowerCase().includes('equilibrium') || query.toLowerCase().includes('thermo') || concept?.formula;

    const governingPrinciple = concept?.name || (isOrganic ? 'Electrophilic/Nucleophilic Reaction Mechanism' : isPhysical ? 'Stoichiometry & Chemical Equilibrium' : 'Periodic Trends & Electronic Configuration');

    let steps: SolvedStep[] = [];
    let commonTraps: string[] = [];

    if (isOrganic) {
      steps = [
        {
          stepNumber: 1,
          title: 'Analyze Substrate & Reagent Nature',
          description: 'Identify the electrophilic/nucleophilic center and classify the reagent (e.g., Lewis acid, oxidizing agent, reducing agent).'
        },
        {
          stepNumber: 2,
          title: 'Determine Reaction Intermediate & Stability',
          description: 'Determine the most stable intermediate (e.g., 3° carbocation > 2° > 1°, hyperconjugation, resonance stabilization).',
          formulaOrRule: 'Markovnikov Rule / Saytzeff Rule / Aromatic Electrophilic Substitution rules.'
        },
        {
          stepNumber: 3,
          title: 'Deduce Stereochemistry & Major Product',
          description: 'Evaluate regioselectivity and stereochemical inversion (SN2) or retention/racemization (SN1).'
        }
      ];
      commonTraps = [
        'Ignoring carbocation rearrangement (1,2-hydride or 1,2-methyl shift).',
        'Overlooking acidic/basic medium effects on leaving group ability.',
        'Confusing anti-Markovnikov peroxide effect (valid only for HBr, NOT HCl or HI).'
      ];
    } else if (isPhysical) {
      steps = [
        {
          stepNumber: 1,
          title: 'Balanced Chemical Equation & Mole Balance',
          description: 'Write the complete stoichiometrically balanced chemical reaction.',
          formulaOrRule: 'n = mass / MolarMass, PV = nRT'
        },
        {
          stepNumber: 2,
          title: 'Formula Identification',
          description: `Apply the fundamental formula for ${concept?.name || 'chemical equilibrium / kinetics'}.`,
          formulaOrRule: concept?.formula || 'ΔG° = -2.303 RT log K'
        },
        {
          stepNumber: 3,
          title: 'Numerical Evaluation with Significant Figures',
          description: 'Carry out arithmetic computation and check units (J vs kJ, standard states).'
        }
      ];
      commonTraps = [
        'Mixing Joules (J) with kilojoules (kJ) in thermodynamic calculations.',
        'Forgetting temperature must always be in Kelvin (K).',
        'Miscalculating stoichiometry coefficients in equilibrium power expressions.'
      ];
    } else {
      // Inorganic
      steps = [
        {
          stepNumber: 1,
          title: 'Identify Group, Period & Oxidation State',
          description: 'Determine the oxidation state of the central atom and write its electronic configuration.',
          formulaOrRule: 'Aufbau principle & Hund\'s rule'
        },
        {
          stepNumber: 2,
          title: 'Apply NCERT Periodic Trends & Anomalous Rules',
          description: 'Account for inert pair effect, lanthanoid contraction, or high ionization energy exceptions.',
        },
        {
          stepNumber: 3,
          title: 'Verify Against Verified NCERT Facts',
          description: 'Match reasoning against authoritative NCERT tabular data and color/state properties.'
        }
      ];
      commonTraps = [
        'Overlooking anomalous behaviour of second-period elements (small size, lack of d-orbitals).',
        'Exceptions in ionization enthalpy (e.g., O vs N, B vs Be).',
        'Incorrect coordination number or weak/strong field ligand distinction.'
      ];
    }

    const ncertRef = context.citations.find(c => c.subject.toLowerCase().includes('chem'))?.title ||
      'NCERT Class 11/12 Chemistry';

    return {
      subject: 'CHEMISTRY',
      summary: q ? `Step-by-step Chemistry solution for: "${q.questionText.slice(0, 100)}..."` : `Chemistry Concept Breakdown: ${concept?.name || 'Chemical Concept'}`,
      governingPrinciple,
      steps,
      commonTraps,
      ncertReference: ncertRef,
      neetRelevance: 'Direct NCERT textbook line question pattern recurrent in NEET Chemistry Section A & B.',
      finalAnswer: q?.correctOption ? `Correct Option: (${q.correctOption})` : undefined
    };
  }
}

export class BiologySolver {
  public static solve(context: RetrievedGroundingContext, query: string): SubjectSolution {
    const q = context.question;
    const concept = context.concepts[0];
    const category = concept?.biologyCategory || (query.toLowerCase().includes('plant') ? 'BOTANY' : 'ZOOLOGY');

    const governingPrinciple = concept?.name || 'NCERT Verbatim Biological Concept';

    const steps: SolvedStep[] = [
      {
        stepNumber: 1,
        title: 'NCERT Textbook Statement Mapping',
        description: `Direct mapping to NCERT Class ${concept?.classLevel || 11} Biology textbook (${category}).`,
        formulaOrRule: concept?.definition || 'Strict adherence to NCERT line-by-line terminology.'
      },
      {
        stepNumber: 2,
        title: 'Biological Classification & Context',
        description: `Categorized under ${category}. Examine the exact anatomical, physiological, or taxonomic parameters specified in NCERT.`,
      },
      {
        stepNumber: 3,
        title: 'Option Elimination & Scientific Precision',
        description: 'Examine each distractor option against official NCERT definitions to eliminate common misleading keywords (e.g., "always", "exclusively", "never").'
      }
    ];

    const commonTraps = [
      'Confusing botanical terminology with zoological terminology (e.g., monocistronic vs polycistronic, endosperm ploidy).',
      'Misinterpreting exception statements in NCERT (e.g., "most fungi", "almost all enzymes").',
      'Overlooking subtle labels in NCERT diagrams and summary tables.'
    ];

    const ncertRef = context.citations.find(c => c.subject.toLowerCase().includes('bio'))?.title ||
      `NCERT Class ${concept?.classLevel || 11} Biology (${category})`;

    return {
      subject: 'BIOLOGY',
      summary: q ? `NCERT Biology Analysis for: "${q.questionText.slice(0, 100)}..."` : `Biology Concept Analysis: ${concept?.name || 'Cell Biology'}`,
      governingPrinciple,
      steps,
      commonTraps,
      ncertReference: ncertRef,
      neetRelevance: context.relatedPYQs.length > 0 ?
        `Repeatedly tested in NEET ${context.relatedPYQs.map(p => p.examYear).join(', ')}. Over 85% of NEET Biology questions are direct verbatim NCERT lines.` :
        'Crucial NCERT line for 360/360 Biology score target.',
      finalAnswer: q?.correctOption ? `Correct Option: (${q.correctOption})` : undefined
    };
  }
}
