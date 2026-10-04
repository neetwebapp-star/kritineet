import prisma from '../prisma';
import crypto from 'crypto';

export type SourceTier = 'OFFICIAL_SOURCE' | 'VERIFIED_PLATFORM_DATA' | 'SECONDARY_REFERENCE' | 'UNVERIFIED';

export interface CountdownResult {
  isAnnounced: boolean;
  message?: string;
  targetDate: Date | null;
  days: number | null;
  hours: number | null;
  minutes: number | null;
  seconds: number | null;
}

export class ExamRegistry {
  /**
   * Initializes or fetches canonical NEET UG exam entry
   */
  static async getOrCreateNeetExam() {
    let exam = await prisma.exam.findUnique({
      where: { code: 'NEET_UG' },
    });

    if (!exam) {
      exam = await prisma.exam.create({
        data: {
          code: 'NEET_UG',
          name: 'National Eligibility cum Entrance Test (Undergraduate)',
          shortName: 'NEET UG',
          conductingBody: 'NTA',
          description: 'Single national entrance examination for undergraduate medical education (MBBS/BDS/AYUSH) in India.',
        },
      });
    }

    return exam;
  }

  /**
   * Initializes or fetches NEET UG 2027 Exam Edition
   */
  static async getOrCreateEdition(year: number = 2027, initialDate?: Date | null) {
    const exam = await this.getOrCreateNeetExam();

    let edition = await prisma.examEdition.findUnique({
      where: {
        examId_editionYear: {
          examId: exam.id,
          editionYear: year,
        },
      },
    });

    if (!edition) {
      edition = await prisma.examEdition.create({
        data: {
          examId: exam.id,
          editionYear: year,
          title: `NEET UG ${year}`,
          officialExamDate: initialDate || null,
          status: initialDate ? 'ANNOUNCED' : 'NOT_YET_PUBLISHED',
          isActive: true,
          syllabusVersion: 1,
          patternVersion: 1,
        },
      });
    }

    return edition;
  }

  /**
   * Registers an authoritative official source
   */
  static async registerOfficialSource(data: {
    sourceName: string;
    sourceUrl: string;
    sourceTier?: SourceTier;
    authorityType?: string;
    notes?: string;
    adminUserId?: string;
  }) {
    const sourceTier = data.sourceTier || 'OFFICIAL_SOURCE';
    const source = await prisma.examOfficialSource.create({
      data: {
        sourceName: data.sourceName,
        sourceUrl: data.sourceUrl,
        sourceTier,
        authorityType: data.authorityType || 'GOVERNMENT_BODY',
        notes: data.notes || null,
        status: 'ACTIVE',
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: data.adminUserId || null,
        action: 'REGISTER_OFFICIAL_SOURCE',
        entityType: 'ExamOfficialSource',
        entityId: source.id,
        newValues: JSON.stringify(source),
      },
    });

    return source;
  }

  /**
   * Controlled source-refresh check: checks content string hash against stored hash.
   * If different, records detection and flags need for verification.
   */
  static async checkSourceForUpdates(sourceId: string, currentContentText: string, adminUserId?: string) {
    const source = await prisma.examOfficialSource.findUnique({ where: { id: sourceId } });
    if (!source) throw new Error('Source not found');

    const newHash = crypto.createHash('sha256').update(currentContentText).digest('hex');
    const hasChanged = source.contentHash !== null && source.contentHash !== newHash;

    const updatedSource = await prisma.examOfficialSource.update({
      where: { id: sourceId },
      data: {
        contentHash: newHash,
        lastCheckedAt: new Date(),
        lastSuccessfulCheck: new Date(),
      },
    });

    if (hasChanged) {
      await prisma.auditLog.create({
        data: {
          userId: adminUserId || null,
          action: 'SOURCE_CONTENT_CHANGED',
          entityType: 'ExamOfficialSource',
          entityId: sourceId,
          oldValues: JSON.stringify({ previousHash: source.contentHash }),
          newValues: JSON.stringify({ newHash }),
        },
      });
    }

    return {
      source: updatedSource,
      hasChanged,
      newHash,
    };
  }

  /**
   * Adds an official verified rule
   */
  static async addExamRule(data: {
    editionId: string;
    ruleKey: string;
    ruleCategory: 'ELIGIBILITY' | 'EXAMINATION' | 'SCORING' | 'ADMISSION';
    ruleTitle: string;
    ruleValue: string;
    sourceName: string;
    sourceUrl: string;
    verificationStatus?: 'UNVERIFIED' | 'VERIFIED' | 'SUPERSEDED' | 'ARCHIVED';
    adminUserId?: string;
  }) {
    const rule = await prisma.examRule.create({
      data: {
        editionId: data.editionId,
        ruleKey: data.ruleKey,
        ruleCategory: data.ruleCategory,
        ruleTitle: data.ruleTitle,
        ruleValue: data.ruleValue,
        sourceName: data.sourceName,
        sourceUrl: data.sourceUrl,
        verificationStatus: data.verificationStatus || 'VERIFIED',
        verifiedAt: data.verificationStatus === 'UNVERIFIED' ? null : new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: data.adminUserId || null,
        action: 'ADD_EXAM_RULE',
        entityType: 'ExamRule',
        entityId: rule.id,
        newValues: JSON.stringify(rule),
      },
    });

    return rule;
  }

  /**
   * Safely calculates countdown for an edition.
   * If official date is missing or NOT_YET_PUBLISHED, strictly avoids fabricating dates.
   */
  static calculateCountdown(edition: { officialExamDate: Date | null; status: string }): CountdownResult {
    if (!edition.officialExamDate || edition.status === 'NOT_YET_PUBLISHED') {
      return {
        isAnnounced: false,
        message: 'Exam date not officially announced.',
        targetDate: null,
        days: null,
        hours: null,
        minutes: null,
        seconds: null,
      };
    }

    const now = new Date();
    const diffMs = edition.officialExamDate.getTime() - now.getTime();

    if (diffMs <= 0) {
      return {
        isAnnounced: true,
        message: 'Exam date has arrived or passed.',
        targetDate: edition.officialExamDate,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      isAnnounced: true,
      targetDate: edition.officialExamDate,
      days,
      hours,
      minutes,
      seconds,
    };
  }
}
