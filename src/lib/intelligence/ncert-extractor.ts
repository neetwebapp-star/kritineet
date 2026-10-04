import prisma from '../prisma';

export interface ExtractedConceptItem {
  id: string; // Stable ID
  name: string;
  category:
    | 'DEFINITION'
    | 'LAW'
    | 'FORMULA'
    | 'IMPORTANT_STATEMENT'
    | 'EXAMPLE'
    | 'PROCESS'
    | 'EXCEPTION'
    | 'SCIENTIFIC_NAME'
    | 'CHEMICAL_REACTION'
    | 'MATHEMATICAL_RELATIONSHIP';
  definition?: string;
  formula?: string;
  laws?: string;
  importantStatements?: string;
  scientificNames?: string;
  chemicalReactions?: string;
  exceptions?: string;
  ncertPageReference?: number;
  sectionNumber?: string;
}

export class NcertConceptExtractor {
  /**
   * Parse extracted raw text blocks from NCERT chapter PDF and identify structured concept entities
   */
  static extractConceptsFromChapterText(
    chapterSlug: string,
    rawText: string,
    pageNumber: number = 1
  ): ExtractedConceptItem[] {
    const items: ExtractedConceptItem[] = [];

    // 1. Definition patterns: "...is defined as...", "The term... refers to..."
    const defRegex = /(?:is defined as|refers to|is called|is known as)\s+([^.\n]+[.])/gi;
    let match;
    let defIndex = 1;
    while ((match = defRegex.exec(rawText)) !== null) {
      const sentence = match[0].trim();
      if (sentence.length > 25 && sentence.length < 300) {
        items.push({
          id: `CONCEPT_${chapterSlug.toUpperCase().replace(/-/g, '_')}_DEF_${defIndex++}`,
          name: `Definition ${defIndex - 1}: ${sentence.slice(0, 40)}...`,
          category: 'DEFINITION',
          definition: sentence,
          ncertPageReference: pageNumber,
        });
      }
      if (defIndex > 10) break;
    }

    // 2. Scientific name patterns (Italicized/Binomial e.g. Homo sapiens, Mangifera indica)
    const sciRegex = /\b([A-Z][a-z]+)\s+([a-z]+)\b(?:\s+(?:Linn|L\.))?/g;
    const commonWords = new Set(['The', 'This', 'These', 'Chapter', 'Figure', 'Table', 'When', 'Where', 'Which']);
    let sciMatch;
    let sciIndex = 1;
    while ((sciMatch = sciRegex.exec(rawText)) !== null) {
      const genus = sciMatch[1];
      const species = sciMatch[2];
      if (!commonWords.has(genus) && genus.length > 3 && species.length > 3) {
        const binom = `${genus} ${species}`;
        items.push({
          id: `CONCEPT_${chapterSlug.toUpperCase().replace(/-/g, '_')}_SCI_${sciIndex++}`,
          name: `Scientific Name: ${binom}`,
          category: 'SCIENTIFIC_NAME',
          scientificNames: binom,
          ncertPageReference: pageNumber,
        });
      }
      if (sciIndex > 5) break;
    }

    // 3. Formula patterns (e.g. F = ma, E = mc^2, ΔG = ΔH - TΔS)
    const formulaRegex = /([A-Za-z_Δθλ][A-Za-z0-9_Δθλ]*\s*=\s*[A-Za-z0-9_Δθλ+\-*/^() ]{2,40})/g;
    let formMatch;
    let formIndex = 1;
    while ((formMatch = formulaRegex.exec(rawText)) !== null) {
      const eq = formMatch[1].trim();
      if (eq.length >= 4 && eq.includes('=')) {
        items.push({
          id: `CONCEPT_${chapterSlug.toUpperCase().replace(/-/g, '_')}_FORM_${formIndex++}`,
          name: `Formula: ${eq}`,
          category: 'FORMULA',
          formula: eq,
          ncertPageReference: pageNumber,
        });
      }
      if (formIndex > 8) break;
    }

    return items;
  }

  /**
   * Save extracted concept items to PostgreSQL / SQLite database under the chapter
   */
  static async persistExtractedConcepts(chapterSlug: string, concepts: ExtractedConceptItem[]) {
    const chapter = await prisma.chapter.findUnique({
      where: { slug: chapterSlug },
    });

    if (!chapter) {
      throw new Error(`Cannot persist concepts: Chapter '${chapterSlug}' not found.`);
    }

    const saved: any[] = [];
    for (const item of concepts) {
      const record = await prisma.concept.upsert({
        where: { id: item.id },
        update: {
          name: item.name,
          definition: item.definition,
          formula: item.formula,
          laws: item.laws,
          importantStatements: item.importantStatements,
          scientificNames: item.scientificNames,
          chemicalReactions: item.chemicalReactions,
          exceptions: item.exceptions,
          ncertReference: JSON.stringify({
            page: item.ncertPageReference,
            section: item.sectionNumber,
            chapterTitle: chapter.title,
            ncertBookCode: chapter.ncertBookCode,
          }),
        },
        create: {
          id: item.id,
          name: item.name,
          definition: item.definition,
          formula: item.formula,
          laws: item.laws,
          importantStatements: item.importantStatements,
          scientificNames: item.scientificNames,
          chemicalReactions: item.chemicalReactions,
          exceptions: item.exceptions,
          chapterId: chapter.id,
          ncertReference: JSON.stringify({
            page: item.ncertPageReference,
            section: item.sectionNumber,
            chapterTitle: chapter.title,
            ncertBookCode: chapter.ncertBookCode,
          }),
        },
      });
      saved.push(record);
    }

    return saved;
  }
}
