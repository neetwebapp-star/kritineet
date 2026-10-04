import prisma from '@/lib/prisma';

export interface SyllabusNode {
  subject: string; // BIOLOGY | PHYSICS | CHEMISTRY
  unitNumber: number;
  unitTitle: string;
  chapterNumber: number;
  chapterTitle: string;
  topicTitle: string;
  subtopics?: string[];
}

export interface DiffResult {
  added: Array<{ subject: string; chapterTitle: string; topicTitle: string; details?: string }>;
  removed: Array<{ subject: string; chapterTitle: string; topicTitle: string; details?: string }>;
  modified: Array<{ subject: string; chapterTitle: string; topicTitle: string; oldDetails: string; newDetails: string }>;
  unchangedCount: number;
  affectedChapters: string[];
}

/**
 * Deterministically compare two official syllabus versions
 */
export function compareSyllabusTrees(
  oldList: SyllabusNode[],
  newList: SyllabusNode[]
): DiffResult {
  const oldMap = new Map<string, SyllabusNode>();
  const newMap = new Map<string, SyllabusNode>();

  const makeKey = (node: SyllabusNode) =>
    `${node.subject.toUpperCase()}::${node.chapterTitle.trim().toLowerCase()}::${node.topicTitle.trim().toLowerCase()}`;

  oldList.forEach((n) => oldMap.set(makeKey(n), n));
  newList.forEach((n) => newMap.set(makeKey(n), n));

  const added: DiffResult['added'] = [];
  const removed: DiffResult['removed'] = [];
  const modified: DiffResult['modified'] = [];
  let unchangedCount = 0;
  const affectedChaptersSet = new Set<string>();

  // Check new items against old
  for (const [key, newNode] of newMap.entries()) {
    if (!oldMap.has(key)) {
      added.push({
        subject: newNode.subject,
        chapterTitle: newNode.chapterTitle,
        topicTitle: newNode.topicTitle,
        details: newNode.subtopics?.join(', '),
      });
      affectedChaptersSet.add(newNode.chapterTitle);
    } else {
      const oldNode = oldMap.get(key)!;
      const oldSub = (oldNode.subtopics || []).sort().join(', ');
      const newSub = (newNode.subtopics || []).sort().join(', ');
      if (oldSub !== newSub) {
        modified.push({
          subject: newNode.subject,
          chapterTitle: newNode.chapterTitle,
          topicTitle: newNode.topicTitle,
          oldDetails: oldSub,
          newDetails: newSub,
        });
        affectedChaptersSet.add(newNode.chapterTitle);
      } else {
        unchangedCount++;
      }
    }
  }

  // Check removed items
  for (const [key, oldNode] of oldMap.entries()) {
    if (!newMap.has(key)) {
      removed.push({
        subject: oldNode.subject,
        chapterTitle: oldNode.chapterTitle,
        topicTitle: oldNode.topicTitle,
        details: oldNode.subtopics?.join(', '),
      });
      affectedChaptersSet.add(oldNode.chapterTitle);
    }
  }

  return {
    added,
    removed,
    modified,
    unchangedCount,
    affectedChapters: Array.from(affectedChaptersSet),
  };
}

/**
 * Record syllabus diff and planner impact event in database
 */
export async function recordSyllabusDiff(
  oldVersionId: string | null,
  newVersionId: string,
  diff: DiffResult,
  notificationId?: string
) {
  // Record individual changes in OfficialSyllabusChange
  const createdChanges = [];

  for (const a of diff.added) {
    const sc = await prisma.officialSyllabusChange.create({
      data: {
        oldVersionId,
        newVersionId,
        changeType: 'ADDED',
        subject: a.subject,
        chapterTitle: a.chapterTitle,
        topicTitle: a.topicTitle,
        newDetails: a.details || null,
        sourceEvidence: `Added in official syllabus version ${newVersionId}`,
      },
    });
    createdChanges.push(sc);
  }

  for (const r of diff.removed) {
    const sc = await prisma.officialSyllabusChange.create({
      data: {
        oldVersionId,
        newVersionId,
        changeType: 'REMOVED',
        subject: r.subject,
        chapterTitle: r.chapterTitle,
        topicTitle: r.topicTitle,
        previousDetails: r.details || null,
        sourceEvidence: `Removed in official syllabus version ${newVersionId}. Preserved historically.`,
      },
    });
    createdChanges.push(sc);
  }

  for (const m of diff.modified) {
    const sc = await prisma.officialSyllabusChange.create({
      data: {
        oldVersionId,
        newVersionId,
        changeType: 'MODIFIED',
        subject: m.subject,
        chapterTitle: m.chapterTitle,
        topicTitle: m.topicTitle,
        previousDetails: m.oldDetails,
        newDetails: m.newDetails,
        sourceEvidence: `Curriculum scope revised in version ${newVersionId}`,
      },
    });
    createdChanges.push(sc);
  }

  // If connected to an official notification, create NotificationImpact
  if (notificationId) {
    await prisma.notificationImpact.create({
      data: {
        notificationId,
        impactType: 'SYLLABUS_UPDATE',
        affectedTopicsCount: diff.added.length + diff.removed.length + diff.modified.length,
        affectedChaptersCount: diff.affectedChapters.length,
        plannerEventTitle: `Official Syllabus Update: ${diff.added.length} added, ${diff.removed.length} removed across ${diff.affectedChapters.length} chapters.`,
        requiresStudentAction: diff.added.length > 0,
        actionDescription: diff.added.length > 0
          ? 'Review new syllabus additions and trigger planner recalculation to incorporate newly prescribed topics.'
          : 'Official syllabus updated. No manual replanning required.',
      },
    });
  }

  return { createdChanges, diff };
}
