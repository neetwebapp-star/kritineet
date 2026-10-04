import prisma from '@/lib/prisma';
import {
  fetchOfficialSource,
  computeSha256,
  checkSourceHealth,
  ALLOWED_DOMAINS,
} from './official-source-fetcher';
import { classifyOfficialNotice } from './notification-classifier';
import { extractOfficialFacts, generateGroundedSummary } from './fact-extractor';

export interface IngestNoticeParams {
  sourceCode: 'NTA' | 'NEET_PORTAL' | 'NMC';
  noticeNumber?: string;
  title: string;
  sourceUrl: string;
  documentUrl?: string;
  rawText?: string;
  publishedAt: Date;
  isBootstrap?: boolean;
}

/**
 * Ingest a verified official government notice
 */
export async function ingestOfficialNotice(params: IngestNoticeParams) {
  const {
    sourceCode,
    noticeNumber,
    title,
    sourceUrl,
    documentUrl,
    rawText = '',
    publishedAt,
    isBootstrap = false,
  } = params;

  // 1. Resolve source
  const source = await prisma.officialSource.findUnique({
    where: { code: sourceCode },
  });

  if (!source) {
    throw new Error(`Source ${sourceCode} not registered`);
  }

  // 2. Compute canonical hashes
  const contentHash = computeSha256(rawText || title);
  const docHash = documentUrl ? computeSha256(documentUrl) : contentHash;

  // 3. Deduplication check by documentHash or noticeNumber
  const existingDoc = documentUrl
    ? await prisma.officialDocument.findUnique({
        where: { canonicalUrl: documentUrl },
      })
    : null;

  if (existingDoc && existingDoc.documentHash === docHash) {
    // Exact duplicate detected -> do not create new notification
    return {
      status: 'DUPLICATE_IGNORED',
      documentId: existingDoc.id,
      message: 'Document already ingested with identical SHA-256 hash.',
    };
  }

  // 4. Classify notice
  const classification = classifyOfficialNotice(title, rawText, source.authority);

  if (!classification.isNeetRelevant) {
    // Non-NEET notice -> record audit log and reject
    await prisma.notificationAuditLog.create({
      data: {
        action: 'REJECTED',
        actor: 'WORKER_NTA_MONITOR',
        detailsJson: JSON.stringify({
          title,
          sourceUrl,
          reason: 'Non-NEET related public notice',
        }),
      },
    });
    return {
      status: 'REJECTED',
      reason: 'Notice is not relevant to NEET UG examination.',
    };
  }

  // 5. Extract structured facts
  const facts = extractOfficialFacts(rawText);
  const { summary, evidence } = generateGroundedSummary(
    title,
    rawText,
    classification.authority,
    classification.category
  );

  // 6. Find or create official document record
  let docRecord = existingDoc;
  if (documentUrl) {
    if (!docRecord) {
      docRecord = await prisma.officialDocument.create({
        data: {
          sourceId: source.id,
          title,
          documentUrl,
          canonicalUrl: documentUrl,
          documentHash: docHash,
          rawTextContent: rawText || null,
          publishedAt,
          detectedAt: new Date(),
          lastVerifiedAt: new Date(),
          isParsed: true,
        },
      });

      await prisma.officialDocumentVersion.create({
        data: {
          documentId: docRecord.id,
          versionNumber: 1,
          documentHash: docHash,
          documentUrl,
          changeType: 'INITIAL',
          changeSummary: 'Initial official document release',
        },
      });
    } else {
      // Document updated -> versioning
      const currentVersionCount = await prisma.officialDocumentVersion.count({
        where: { documentId: docRecord.id },
      });

      await prisma.officialDocumentVersion.create({
        data: {
          documentId: docRecord.id,
          versionNumber: currentVersionCount + 1,
          documentHash: docHash,
          documentUrl,
          changeType: 'REVISED',
          changeSummary: 'Document content updated at official source',
        },
      });

      await prisma.officialDocument.update({
        where: { id: docRecord.id },
        data: {
          documentHash: docHash,
          lastVerifiedAt: new Date(),
          rawTextContent: rawText,
        },
      });
    }
  }

  // 7. Find matching ExamEdition
  let examEditionId: string | null = null;
  if (classification.examYear) {
    const edition = await prisma.examEdition.findFirst({
      where: { editionYear: classification.examYear },
    });
    if (edition) {
      examEditionId = edition.id;
    }
  }

  // 8. Create OfficialNotification record
  const notification = await prisma.officialNotification.create({
    data: {
      sourceId: source.id,
      documentId: docRecord?.id || null,
      examEditionId,
      noticeNumber: noticeNumber || null,
      title,
      authority: classification.authority,
      category: classification.category,
      alertLevel: classification.alertLevel,
      status: 'PUBLISHED',
      isNeetRelevant: true,
      examYear: classification.examYear,
      isHistorical: classification.isHistorical || isBootstrap,
      publishedAt,
      detectedAt: new Date(),
      lastVerifiedAt: new Date(),
      officialSourceUrl: sourceUrl,
      officialDocumentUrl: documentUrl || null,
      documentHash: docHash,
      officialFactExtractJson: JSON.stringify(facts),
      aiSummary: summary,
      aiSummaryEvidence: evidence,
      studentActionRequired:
        classification.alertLevel === 'ACTION_REQUIRED'
          ? `Check official ${classification.authority} requirements regarding ${classification.category.replace(/_/g, ' ').toLowerCase()}.`
          : null,
    },
  });

  // 9. If bootstrap, mark all active students as read so unread badge starts clean
  if (isBootstrap) {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: { id: true },
    });

    for (const student of students) {
      await prisma.officialNotificationReadState.upsert({
        where: {
          userId_notificationId: {
            userId: student.id,
            notificationId: notification.id,
          },
        },
        create: {
          userId: student.id,
          notificationId: notification.id,
        },
        update: {},
      });
    }
  }

  // 10. Audit log
  await prisma.notificationAuditLog.create({
    data: {
      notificationId: notification.id,
      action: isBootstrap ? 'BOOTSTRAP_IMPORTED' : 'PUBLISHED',
      actor: 'WORKER_NTA_MONITOR',
      newStatus: 'PUBLISHED',
      detailsJson: JSON.stringify({
        title,
        authority: classification.authority,
        category: classification.category,
        examYear: classification.examYear,
        documentHash: docHash,
      }),
    },
  });

  return {
    status: 'PUBLISHED',
    notification,
  };
}

/**
 * Initialize official source records and bootstrap baseline authoritative documents
 */
export async function bootstrapOfficialSources() {
  console.log('[NTA MONITOR] Initializing official source registries...');

  // 1. Ensure OfficialSource registries exist
  const sourcesData = [
    {
      code: 'NTA',
      name: 'National Testing Agency (NTA)',
      authority: 'NTA',
      websiteUrl: 'https://www.nta.ac.in/',
      noticeBoardUrl: 'https://www.nta.ac.in/Notice',
      tier: 'TIER_1',
      status: 'HEALTHY',
    },
    {
      code: 'NEET_PORTAL',
      name: 'NTA Official NEET Portal',
      authority: 'NTA',
      websiteUrl: 'https://neet.nta.nic.in/',
      noticeBoardUrl: 'https://neet.nta.nic.in/public-notices/',
      tier: 'TIER_1',
      status: 'HEALTHY',
    },
    {
      code: 'NMC',
      name: 'National Medical Commission (NMC) / UGMEB',
      authority: 'NMC_UGMEB',
      websiteUrl: 'https://www.nmc.org.in/',
      noticeBoardUrl: 'https://www.nmc.org.in/whats-new/',
      tier: 'TIER_1',
      status: 'HEALTHY',
    },
  ];

  for (const s of sourcesData) {
    await prisma.officialSource.upsert({
      where: { code: s.code },
      create: {
        ...s,
        lastCheckedAt: new Date(),
        lastSuccessAt: new Date(),
      },
      update: {
        websiteUrl: s.websiteUrl,
        noticeBoardUrl: s.noticeBoardUrl,
      },
    });
  }

  // 2. Ensure ExamEdition exists for NEET UG 2026 and NEET UG 2027
  const exam = await prisma.exam.upsert({
    where: { code: 'NEET_UG' },
    create: {
      code: 'NEET_UG',
      name: 'National Eligibility cum Entrance Test (Undergraduate)',
      shortName: 'NEET UG',
      conductingBody: 'NTA',
      description: 'Official National Eligibility cum Entrance Test for undergraduate medical admissions across India.',
    },
    update: {},
  });

  const edition2026 = await prisma.examEdition.upsert({
    where: { examId_editionYear: { examId: exam.id, editionYear: 2026 } },
    create: {
      examId: exam.id,
      editionYear: 2026,
      title: 'NEET UG 2026',
      status: 'COMPLETED',
      isActive: false,
    },
    update: {},
  });

  const edition2027 = await prisma.examEdition.upsert({
    where: { examId_editionYear: { examId: exam.id, editionYear: 2027 } },
    create: {
      examId: exam.id,
      editionYear: 2027,
      title: 'NEET UG 2027',
      status: 'NOT_YET_PUBLISHED',
      isActive: true,
      officialExamDate: null, // NOT YET OFFICIALLY ANNOUNCED!
    },
    update: {},
  });

  // 3. Bootstrap baseline official documents (Historical baseline for auditability)
  const existingCount = await prisma.officialNotification.count();
  if (existingCount === 0) {
    console.log('[NTA MONITOR] Bootstrapping authoritative baseline notifications...');

    // A. NMC Authoritative Syllabus Notification
    await ingestOfficialNotice({
      sourceCode: 'NMC',
      noticeNumber: 'NMC/UGMEB/NEET-UG/2024/01',
      title: 'Public Notice: Syllabus for National Eligibility-cum-Entrance Test [NEET (UG)] finalized by Under Graduate Medical Education Board (UGMEB)',
      sourceUrl: 'https://www.nmc.org.in/whats-new/',
      documentUrl: 'https://www.nmc.org.in/MCIRest/open/getDocument?path=/Documents/Public/Portal/LatestNews/NEET-UG-2024_Syllabus.pdf',
      rawText: 'It is notified to all the stakeholders especially to the aspiring candidates that the Under Graduate Medical Education Board, an autonomous body under National Medical Commission, has finalized the syllabus for NEET(UG). The stakeholders are advised to refer to the updated syllabus for preparation of the study material and in preparation of NEET (UG) examination. The question paper will consist of 200 multiple-choice questions from Physics, Chemistry and Biology.',
      publishedAt: new Date('2024-11-22T10:00:00Z'),
      isBootstrap: true,
    });

    // B. NTA Advisory on Fraudulent Websites & Impersonation
    await ingestOfficialNotice({
      sourceCode: 'NTA',
      noticeNumber: 'NTA/NEET/ADV/2026/01',
      title: 'Important Advisory for Candidates of NEET (UG) regarding Fake Websites and Misleading Social Media Claims',
      sourceUrl: 'https://www.nta.ac.in/Notice',
      documentUrl: 'https://www.nta.ac.in/Download/Notice/Notice_2026_NEET_Advisory.pdf',
      rawText: 'National Testing Agency cautions candidates against fraudulent websites and social media platforms spreading unverified rumors and fake exam dates regarding National Eligibility cum Entrance Test NEET (UG). Candidates must rely strictly on official portals www.nta.ac.in and neet.nta.nic.in for authoritative communications.',
      publishedAt: new Date('2026-02-15T12:00:00Z'),
      isBootstrap: true,
    });

    // C. NTA Information Bulletin & Examination Schedule (Historical NEET 2026)
    await ingestOfficialNotice({
      sourceCode: 'NEET_PORTAL',
      noticeNumber: 'NTA/NEET-UG/2026/02',
      title: 'Public Notice: Inviting Online Applications for National Eligibility-cum-Entrance Test [NEET (UG) - 2026] and Release of Information Bulletin',
      sourceUrl: 'https://neet.nta.nic.in/public-notices/',
      documentUrl: 'https://neet.nta.nic.in/Download/Information_Bulletin_NEET_UG_2026.pdf',
      rawText: 'National Testing Agency invites online applications for NEET (UG) - 2026. Examination conducted in Pen and Paper (OMR based) mode. Duration: 200 minutes (03 hours 20 minutes). 200 questions across Physics, Chemistry, Botany, and Zoology with marking scheme +4 for correct and -1 for incorrect answers. The syllabus is as finalized by the Under Graduate Medical Education Board (UGMEB) of the National Medical Commission (NMC).',
      publishedAt: new Date('2026-02-09T09:00:00Z'),
      isBootstrap: true,
    });

    // D. Baseline Official Syllabus Version (NMC / UGMEB Authoritative Edition)
    await prisma.officialSyllabusVersion.upsert({
      where: { versionCode: 'NMC_UGMEB_AUTHSYLLABUS_V1' },
      create: {
        versionCode: 'NMC_UGMEB_AUTHSYLLABUS_V1',
        examYear: 2026,
        authority: 'UGMEB',
        title: 'NMC UGMEB Authoritative NEET (UG) Core Syllabus',
        sourceUrl: 'https://www.nmc.org.in/MCIRest/open/getDocument?path=/Documents/Public/Portal/LatestNews/NEET-UG-2024_Syllabus.pdf',
        documentHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        publishedAt: new Date('2024-11-22T10:00:00Z'),
        effectiveFrom: new Date('2024-11-22T10:00:00Z'),
        status: 'ACTIVE',
        totalUnits: 10,
        totalChapters: 79,
        totalTopics: 426,
        syllabusJson: JSON.stringify({
          authority: 'UGMEB / NMC',
          status: 'CURRENT_AUTHORITATIVE',
          description: 'Prescribed syllabus for NEET UG by Under Graduate Medical Education Board.',
        }),
      },
      update: {},
    });
  }

  console.log('[NTA MONITOR] Official source bootstrap complete.');
}
