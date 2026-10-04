/**
 * Phase 14: Source Diff Engine, Asset Validator & Downstream Impact Analyzer
 * Implements:
 * 1. Source change detection (TEXT, FIGURE, TABLE, PAGE, STRUCTURE, METADATA)
 * 2. ContentDiff generation with severity ratings
 * 3. Figure & Table structural validation
 * 4. Downstream dependency tracking and ContentImpactReport compilation
 */

import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export type ChangeType =
  | 'UNCHANGED'
  | 'TEXT_CHANGED'
  | 'FIGURE_CHANGED'
  | 'TABLE_CHANGED'
  | 'PAGE_CHANGED'
  | 'STRUCTURE_CHANGED'
  | 'METADATA_CHANGED'
  | 'REMOVED'
  | 'ADDED';

export interface DiffDetectionInput {
  contentId: string;
  contentType: string;
  oldVersion: number;
  newVersion: number;
  oldContent: string;
  newContent: string;
  oldMetadata?: Record<string, any>;
  newMetadata?: Record<string, any>;
}

export class DiffAndSourceEngine {
  /**
   * Compares old and new content versions and generates ContentDiff
   */
  public static async analyzeDiff(input: DiffDetectionInput) {
    let changeType: ChangeType = 'UNCHANGED';
    let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';

    if (input.oldContent !== input.newContent) {
      if (input.contentType === 'FIGURE') {
        changeType = 'FIGURE_CHANGED';
        severity = 'HIGH';
      } else if (input.contentType === 'TABLE') {
        changeType = 'TABLE_CHANGED';
        severity = 'HIGH';
      } else {
        changeType = 'TEXT_CHANGED';
        // Classify severity based on text edit distance or keywords
        const lengthDiff = Math.abs(input.newContent.length - input.oldContent.length);
        if (lengthDiff > 200 || input.newContent.includes('formula') || input.newContent.includes('answer')) {
          severity = 'HIGH';
        } else if (lengthDiff > 50) {
          severity = 'MEDIUM';
        } else {
          severity = 'LOW';
        }
      }
    } else if (JSON.stringify(input.oldMetadata) !== JSON.stringify(input.newMetadata)) {
      changeType = 'METADATA_CHANGED';
      severity = 'LOW';
    }

    // Identify affected downstream concepts and questions
    const dependencies = await prisma.contentDependency.findMany({
      where: { upstreamId: input.contentId },
    });

    const affectedConcepts = dependencies
      .filter((d) => d.downstreamType === 'CONCEPT')
      .map((d) => d.downstreamId);
    const affectedQuestions = dependencies
      .filter((d) => d.downstreamType === 'QUESTION')
      .map((d) => d.downstreamId);

    if (affectedQuestions.length > 5 || affectedConcepts.length > 2) {
      severity = severity === 'LOW' ? 'MEDIUM' : 'CRITICAL';
    }

    const diff = await prisma.contentDiff.create({
      data: {
        contentId: input.contentId,
        contentType: input.contentType,
        oldVersion: input.oldVersion,
        newVersion: input.newVersion,
        changeType,
        oldValue: input.oldContent.substring(0, 500),
        newValue: input.newContent.substring(0, 500),
        affectedConcepts: JSON.stringify(affectedConcepts),
        affectedQuestions: JSON.stringify(affectedQuestions),
        severity,
        reviewStatus: changeType === 'UNCHANGED' ? 'APPROVED' : 'OPEN',
      },
    });

    // Auto-generate review case if consequential change
    if (changeType !== 'UNCHANGED' && (severity === 'HIGH' || severity === 'CRITICAL')) {
      await prisma.contentReview.create({
        data: {
          contentId: input.contentId,
          contentType: input.contentType,
          reviewType: 'SOURCE',
          severity,
          status: 'OPEN',
          evidenceJson: JSON.stringify({
            diffId: diff.id,
            changeType,
            affectedQuestionsCount: affectedQuestions.length,
          }),
          reviewNotes: `Automated review triggered: Consequential source change (${changeType}) with severity ${severity}.`,
        },
      });
    }

    return diff;
  }

  /**
   * Figure Validation: Verifies file existence, caption integrity, and page linking
   */
  public static validateFigure(figure: {
    figureId: string;
    filePath?: string;
    caption?: string;
    sourcePage?: number;
  }): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];

    if (!figure.caption || figure.caption.trim().length === 0) {
      issues.push('Missing figure caption or scientific description');
    }

    if (!figure.sourcePage || figure.sourcePage <= 0) {
      issues.push('Invalid or missing source page number');
    }

    if (figure.filePath) {
      const publicDir = path.join(process.cwd(), 'public');
      const fullPath = path.join(publicDir, figure.filePath.replace(/^\//, ''));
      if (!fs.existsSync(fullPath)) {
        issues.push(`Broken figure reference: File not found on disk at ${figure.filePath}`);
      }
    } else {
      issues.push('Missing asset file path for figure');
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }

  /**
   * Table Validation: Verifies row/column counts, cell completeness, and shift anomalies
   */
  public static validateTable(table: {
    tableId: string;
    headers: string[];
    rows: string[][];
    sourcePage?: number;
  }): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];

    if (!table.headers || table.headers.length === 0) {
      issues.push('Table missing header row');
    }

    const expectedCols = table.headers ? table.headers.length : 0;

    if (!table.rows || table.rows.length === 0) {
      issues.push('Table has zero data rows');
    } else {
      table.rows.forEach((row, idx) => {
        if (row.length !== expectedCols) {
          issues.push(`Row ${idx + 1} column count mismatch: expected ${expectedCols}, found ${row.length} (potential column shift)`);
        }
        if (row.some((cell) => cell === undefined || cell === null || cell.trim() === '')) {
          issues.push(`Row ${idx + 1} contains blank or missing cell data`);
        }
      });
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }

  /**
   * Registers a downstream dependency relationship
   */
  public static async registerDependency(input: {
    upstreamId: string;
    upstreamType: string;
    downstreamId: string;
    downstreamType: string;
    relationship?: string;
  }) {
    return prisma.contentDependency.upsert({
      where: {
        upstreamId_downstreamId_relationship: {
          upstreamId: input.upstreamId,
          downstreamId: input.downstreamId,
          relationship: input.relationship || 'MAPS_TO',
        },
      },
      update: {},
      create: {
        upstreamId: input.upstreamId,
        upstreamType: input.upstreamType,
        downstreamId: input.downstreamId,
        downstreamType: input.downstreamType,
        relationship: input.relationship || 'MAPS_TO',
      },
    });
  }

  /**
   * Compiles a comprehensive downstream impact report for an upstream content change
   */
  public static async generateImpactReport(contentId: string, changeType: string = 'SOURCE_UPDATE') {
    const dependencies = await prisma.contentDependency.findMany({
      where: { upstreamId: contentId },
    });

    let affectedConcepts = 0;
    let affectedQuestions = 0;
    let affectedTests = 0;
    let affectedPlans = 0;
    let affectedAiIndices = 0;

    for (const dep of dependencies) {
      switch (dep.downstreamType) {
        case 'CONCEPT':
          affectedConcepts++;
          break;
        case 'QUESTION':
          affectedQuestions++;
          break;
        case 'TEST':
        case 'MOCK':
          affectedTests++;
          break;
        case 'ASSIGNMENT':
          affectedPlans++;
          break;
        case 'AI_INDEX':
          affectedAiIndices++;
          break;
      }
    }

    return prisma.contentImpactReport.create({
      data: {
        contentId,
        contentType: 'SOURCE_OBJECT',
        changeType,
        affectedConcepts,
        affectedQuestions,
        affectedTests,
        affectedPlans,
        affectedAiIndices,
        detailsJson: JSON.stringify({ totalDownstreamDependencies: dependencies.length }),
      },
    });
  }
}
