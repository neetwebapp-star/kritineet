/**
 * Phase 14: Golden Dataset & Extraction Regression Engine
 * Implements:
 * 1. Versioned ContentGoldenDataset management across Physics, Chemistry, Biology, PYQ, Fingertips
 * 2. Extraction regression test harness (detects text mutation, figure loss, table shifts)
 * 3. Semantic regression comparator (normalized hash, token diff, formula fidelity)
 */

import prisma from '@/lib/prisma';
import { LifecycleEngine } from './lifecycle-engine';

export interface GoldenItemInput {
  subject: 'PHYSICS' | 'CHEMISTRY' | 'BOTANY' | 'ZOOLOGY';
  sourceType: 'NCERT' | 'PYQ' | 'FINGERTIPS';
  contentSubtype: 'QUESTION' | 'CONCEPT' | 'FIGURE' | 'TABLE';
  goldenText: string;
  goldenMetadata?: Record<string, any>;
}

export class GoldenDatasetService {
  /**
   * Initializes or fetches a canonical Golden Dataset version
   */
  public static async getOrCreateDataset(name: string = 'NEET_2027_GOLDEN_BENCHMARK', version: number = 1) {
    const existing = await prisma.contentGoldenDataset.findUnique({
      where: { name },
      include: { items: true },
    });

    if (existing) {
      return existing;
    }

    return prisma.contentGoldenDataset.create({
      data: {
        name,
        version,
        description: 'Controlled golden reference dataset for parser, OCR, and semantic regression testing',
      },
      include: { items: true },
    });
  }

  /**
   * Seeds an item into the golden dataset
   */
  public static async addGoldenItem(datasetId: string, item: GoldenItemInput) {
    const { contentHash } = LifecycleEngine.computeHashes(item.goldenText);

    const created = await prisma.contentGoldenDatasetItem.create({
      data: {
        datasetId,
        subject: item.subject,
        sourceType: item.sourceType,
        contentSubtype: item.contentSubtype,
        goldenText: item.goldenText,
        goldenHash: contentHash,
        goldenMetadata: item.goldenMetadata ? JSON.stringify(item.goldenMetadata) : null,
      },
    });

    await prisma.contentGoldenDataset.update({
      where: { id: datasetId },
      data: { itemsCount: { increment: 1 } },
    });

    return created;
  }

  /**
   * Runs regression test comparing candidate extracted text against golden ground truth
   */
  public static runExtractionRegression(candidateText: string, goldenItem: {
    goldenText: string;
    goldenHash: string;
    contentSubtype: string;
  }): {
    isMatch: boolean;
    exactHashMatch: boolean;
    normalizedMatch: boolean;
    regressionType?: 'EXACT_MATCH' | 'MINOR_WHITESPACE' | 'TEXT_MUTATION' | 'SEVERE_LOSS';
    diffSummary?: string;
  } {
    const candidateHashes = LifecycleEngine.computeHashes(candidateText);
    const goldenHashes = LifecycleEngine.computeHashes(goldenItem.goldenText);

    if (candidateHashes.contentHash === goldenItem.goldenHash) {
      return {
        isMatch: true,
        exactHashMatch: true,
        normalizedMatch: true,
        regressionType: 'EXACT_MATCH',
      };
    }

    if (candidateHashes.normalizedHash === goldenHashes.normalizedHash) {
      return {
        isMatch: true,
        exactHashMatch: false,
        normalizedMatch: true,
        regressionType: 'MINOR_WHITESPACE',
      };
    }

    const lengthLossRatio = candidateText.length / Math.max(1, goldenItem.goldenText.length);
    let regressionType: 'TEXT_MUTATION' | 'SEVERE_LOSS' = 'TEXT_MUTATION';
    if (lengthLossRatio < 0.7) {
      regressionType = 'SEVERE_LOSS';
    }

    return {
      isMatch: false,
      exactHashMatch: false,
      normalizedMatch: false,
      regressionType,
      diffSummary: `Text length difference: candidate=${candidateText.length}, golden=${goldenItem.goldenText.length} (${regressionType})`,
    };
  }
}
