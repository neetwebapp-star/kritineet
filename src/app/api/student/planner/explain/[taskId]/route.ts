import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveUser } from '@/lib/ai/auth-helper';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const user = await resolveUser(req);
    const { taskId } = await params;

    const task = await prisma.dailyStudyTask.findUnique({
      where: { id: taskId },
      include: {
        plan: true,
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (task.userId !== user.id && task.plan.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    let topic = null;
    if (task.topicId) {
      topic = await prisma.topic.findUnique({
        where: { id: task.topicId },
        include: {
          chapter: {
            include: { subject: true },
          },
          subtopics: { select: { id: true, title: true } },
          concepts: { select: { id: true, name: true } },
        },
      });
    }

    let meta: any = null;
    try {
      meta = task.metaJson ? JSON.parse(task.metaJson) : null;
    } catch (e) {}

    const whyToday =
      meta?.whyToday ||
      task.description ||
      'Calibrated for optimal NEET UG 2027 memory retention and mastery.';

    // Pedagogical rationale generator based on taskType
    let pedagogicalRationale = '';
    let prerequisites: string[] = [];

    switch (task.taskType) {
      case 'NCERT_READ':
        pedagogicalRationale =
          'Line-by-line NCERT theory comprehension with AI Rabbit audio-visual guidance is the golden foundation of NEET UG. Direct line questions form >90% of Biology and fundamental Physics/Chemistry questions.';
        prerequisites = ['Previous topic completion in chapter progression'];
        break;
      case 'FINGERTIPS':
        pedagogicalRationale =
          'MTG Objective NCERT at your Fingertips provides rigorous line-by-line topic MCQ drills. Solving MCQs immediately after NCERT reading converts passive reading into active retrieval and solidifies conceptual anchors.';
        prerequisites = [`NCERT reading of "${topic?.title || 'Topic'}"`];
        break;
      case 'PYQ':
        pedagogicalRationale =
          'Previous 10-15 Years NEET & AIPMT Questions reveal exact examiner patterns, high-yield traps, and testing depth required for NEET UG 2027.';
        prerequisites = ['NCERT line comprehension', 'Fingertips topic drill'];
        break;
      case 'SPACED_REVISION':
      case 'ACTIVE_RECALL':
        pedagogicalRationale =
          'Ebbinghaus Forgetting Curve countermeasure: Spaced reviews at R1 (+2d), R2 (+3d), R3 (+5d), and R4 (+7d) systematically shift short-term working memory into permanent long-term memory.';
        prerequisites = ['Initial learning & MCQ drill completed earlier'];
        break;
      case 'CHAPTER_TEST':
        pedagogicalRationale =
          'Timed chapter-level assessment under CBT conditions trains speed, accuracy, and negative-marking discipline (+4 / -1).';
        prerequisites = ['All topics in chapter read & drilled'];
        break;
      case 'HALF_BOOK_TEST':
        pedagogicalRationale =
          'Multi-chapter synthesis test testing cross-concept recall and endurance across an entire half-syllabus book.';
        prerequisites = ['Half syllabus topics completed'];
        break;
      case 'MOCK_TEST':
        pedagogicalRationale =
          'Full 200-question (attempt 180), 720-mark, 200-minute CBT simulation calibrating exam temperament, biological clock, and pacing.';
        prerequisites = ['Syllabus completion milestone reached'];
        break;
      case 'MISTAKE_REVIEW':
        pedagogicalRationale =
          'Targeted analysis of errors, silly mistakes, and conceptual traps. Error logging directly eliminates recurring score leakages.';
        prerequisites = ['Attempted MCQ drills or chapter tests with recorded errors'];
        break;
      case 'EXTERNAL_TEST_SLOT':
        pedagogicalRationale =
          'Reserved 5-10% buffer slot designed to absorb external coaching mock tests (e.g. Allen, Aakash, Sri Chaitanya) or handle backlog without schedule disruption.';
        prerequisites = ['None (Adaptive Buffer)'];
        break;
      default:
        pedagogicalRationale =
          'High-yield NEET UG 2027 preparation task systematically calibrated for 9.0h daily capacity.';
        prerequisites = [];
    }

    return NextResponse.json({
      taskId: task.id,
      title: task.title,
      taskType: task.taskType,
      estimatedMinutes: task.estimatedMinutes,
      actualMinutes: task.actualMinutes,
      status: task.status,
      whyToday,
      scheduledDate: task.plan?.date || task.date,
      pedagogicalRationale,
      prerequisites,
      topic: topic
        ? {
            id: topic.id,
            title: topic.title,
            chapterTitle: topic.chapter.title,
            subject: topic.chapter.subject?.name || topic.chapter.subjectId,
            biologyCategory: topic.chapter.biologyCategory,
            subtopicsCount: topic.subtopics.length,
            conceptsCount: topic.concepts.length,
          }
        : null,
    });
  } catch (error: any) {
    console.error('Error fetching task explanation:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
