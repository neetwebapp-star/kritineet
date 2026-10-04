/**
 * Phase 6: Image Doubt Solver
 * Processes OCR/vision doubts, checks OCR confidence score, gates low-confidence inputs
 * with confirmation prompts, and matches against existing platform question bank.
 */

import prisma from '@/lib/prisma';
import { AIProviderManager } from './ai-provider';

export interface ImageDoubtResult {
  extractedText: string;
  confidence: number;
  confirmationRequired: boolean;
  warningMessage?: string;
  matchedQuestion?: {
    id: string;
    questionText: string;
    chapterTitle?: string;
    subjectName?: string;
    sourceType: string;
    examYear?: number | null;
  } | null;
  diagramDescription?: string;
}

export class ImageDoubtSolver {
  public static async processImageDoubt(
    imageData: string | Buffer,
    userQuery?: string
  ): Promise<ImageDoubtResult> {
    const providerManager = AIProviderManager.getInstance();
    const visionProvider = providerManager.getProvider('vision');

    // Run OCR / vision extraction
    const visionResult = await visionProvider.vision(imageData, userQuery);

    const isLowConfidence = visionResult.confidence < 0.75;

    // Search for matching question in database
    let matchedQuestion: ImageDoubtResult['matchedQuestion'] = null;

    if (!isLowConfidence && visionResult.extractedText) {
      // Extract keywords from OCR text
      const words = visionResult.extractedText
        .replace(/[^a-zA-Z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 4);

      if (words.length > 0) {
        const potentialMatch = await prisma.question.findFirst({
          where: {
            OR: words.slice(0, 3).map(w => ({
              questionText: { contains: w }
            })),
            verificationStatus: 'VERIFIED',
          },
          include: {
            chapter: { include: { subject: true } }
          }
        });

        if (potentialMatch) {
          matchedQuestion = {
            id: potentialMatch.id,
            questionText: potentialMatch.questionText,
            chapterTitle: potentialMatch.chapter?.title,
            subjectName: potentialMatch.chapter?.subject?.name,
            sourceType: potentialMatch.sourceType,
            examYear: potentialMatch.examYear,
          };
        }
      }
    }

    return {
      extractedText: visionResult.extractedText,
      confidence: visionResult.confidence,
      confirmationRequired: isLowConfidence,
      warningMessage: isLowConfidence
        ? '⚠️ Low confidence in image transcription. Please review and confirm if the extracted text accurately represents your question before generating a solution.'
        : undefined,
      matchedQuestion,
      diagramDescription: visionResult.diagramDescription,
    };
  }
}
