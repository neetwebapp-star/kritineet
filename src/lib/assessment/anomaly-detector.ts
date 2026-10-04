import prisma from '../prisma';

export interface DetectedAnomaly {
  anomalyType:
    | 'AMBIGUOUS_OPTIONS'
    | 'MULTIPLE_PLAUSIBLE_ANSWERS'
    | 'LOW_DISCRIMINATION'
    | 'BROKEN_QUESTION'
    | 'BROKEN_IMAGE'
    | 'MISSING_IMAGE'
    | 'ANSWER_KEY_CONCERN'
    | 'UNEXPECTED_RESPONSE_PATTERN'
    | 'EXTREME_TIME_PATTERN'
    | 'SOURCE_MISMATCH'
    | 'CONCEPT_MISMATCH';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  evidence: Record<string, any>;
  sampleSize: number;
}

export class AnomalyDetector {
  /**
   * Scans a single question for behavioral, statistical, and structural anomalies
   */
  static async scanQuestionAnomalies(questionId: string): Promise<DetectedAnomaly[]> {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        options: true,
        figures: true,
        assessmentProfile: true,
        optionPerformances: true,
      },
    });

    if (!question) return [];

    const anomalies: DetectedAnomaly[] = [];
    const profile = question.assessmentProfile;
    const sampleSize = profile?.attemptCount ?? 0;

    // 1. Structural Checks: Broken text or Missing Figure
    if (!question.questionText || question.questionText.trim().length < 10) {
      anomalies.push({
        anomalyType: 'BROKEN_QUESTION',
        severity: 'CRITICAL',
        evidence: { reason: 'Question stem text is under 10 characters or empty.' },
        sampleSize,
      });
    }

    const textLower = question.questionText.toLowerCase();
    const referencesFigure =
      textLower.includes('given figure') ||
      textLower.includes('shown below') ||
      textLower.includes('in the diagram') ||
      textLower.includes('refer to figure');

    if (referencesFigure && question.figures.length === 0) {
      anomalies.push({
        anomalyType: 'MISSING_IMAGE',
        severity: 'HIGH',
        evidence: { reason: 'Stem references a figure or diagram but no figure asset is linked.' },
        sampleSize,
      });
    }

    // 2. Statistical Checks (Require minimum 10 attempts to prevent false alarms)
    if (profile && sampleSize >= 10) {
      // Check for Answer Key Concern: Accuracy < 15% with adequate attempts
      if (profile.accuracyRate < 15.0 && sampleSize >= 20) {
        anomalies.push({
          anomalyType: 'ANSWER_KEY_CONCERN',
          severity: 'HIGH',
          evidence: {
            accuracyRate: profile.accuracyRate,
            attemptCount: sampleSize,
            correctOption: question.correctOption,
            reason: 'Abnormally low accuracy rate (<15%) suggests potential key conflict.',
          },
          sampleSize,
        });
      }

      // Check for Low or Negative Discrimination
      if (profile.discriminationConfidence !== 'INSUFFICIENT') {
        if (profile.discriminationIndex < 0) {
          anomalies.push({
            anomalyType: 'LOW_DISCRIMINATION',
            severity: 'CRITICAL',
            evidence: {
              discriminationIndex: profile.discriminationIndex,
              reason: 'Negative discrimination: weaker students perform better than stronger students.',
            },
            sampleSize,
          });
        } else if (profile.discriminationIndex <= 0.10 && sampleSize >= 30) {
          anomalies.push({
            anomalyType: 'LOW_DISCRIMINATION',
            severity: 'MEDIUM',
            evidence: {
              discriminationIndex: profile.discriminationIndex,
              reason: 'Low discrimination index (<= 0.10) with medium/high confidence.',
            },
            sampleSize,
          });
        }
      }

      // Check for Extreme Time Patterns (Median < 4s or > 240s)
      if (profile.medianResponseTime < 4.0 && sampleSize >= 15) {
        anomalies.push({
          anomalyType: 'EXTREME_TIME_PATTERN',
          severity: 'MEDIUM',
          evidence: {
            medianResponseTime: profile.medianResponseTime,
            reason: 'Median response time under 4 seconds indicates rapid guessing pattern.',
          },
          sampleSize,
        });
      } else if (profile.medianResponseTime > 240.0 && sampleSize >= 15) {
        anomalies.push({
          anomalyType: 'EXTREME_TIME_PATTERN',
          severity: 'LOW',
          evidence: {
            medianResponseTime: profile.medianResponseTime,
            reason: 'Excessively high median response time (> 240s) indicates cognitive bottleneck.',
          },
          sampleSize,
        });
      }

      // Check for Ambiguous Options (Multiple options attracting >= 30% each)
      const optionsAbove30 = question.optionPerformances.filter((o) => o.selectionRate >= 30.0);
      if (optionsAbove30.length >= 2) {
        anomalies.push({
          anomalyType: 'AMBIGUOUS_OPTIONS',
          severity: 'HIGH',
          evidence: {
            competingOptions: optionsAbove30.map((o) => ({ label: o.optionLabel, rate: o.selectionRate })),
            reason: 'Two or more options attract >= 30% response rate each.',
          },
          sampleSize,
        });
      }
    }

    // Persist newly detected anomalies into QuestionAnomaly table
    for (const anom of anomalies) {
      const existing = await prisma.questionAnomaly.findFirst({
        where: {
          questionId,
          anomalyType: anom.anomalyType,
          status: { in: ['FLAGGED', 'UNDER_REVIEW'] },
        },
      });

      if (!existing) {
        await prisma.questionAnomaly.create({
          data: {
            questionId,
            anomalyType: anom.anomalyType,
            severity: anom.severity,
            evidence: JSON.stringify(anom.evidence),
            sampleSize: anom.sampleSize,
            status: 'FLAGGED',
          },
        });
      }
    }

    return anomalies;
  }

  /**
   * Scans all questions in the bank for anomalies
   */
  static async scanAllQuestions(limit: number = 200): Promise<{ totalScanned: number; anomaliesDetected: number }> {
    const questions = await prisma.question.findMany({
      take: limit,
      select: { id: true },
    });

    let anomaliesDetected = 0;
    for (const q of questions) {
      const detected = await this.scanQuestionAnomalies(q.id);
      anomaliesDetected += detected.length;
    }

    return {
      totalScanned: questions.length,
      anomaliesDetected,
    };
  }
}

