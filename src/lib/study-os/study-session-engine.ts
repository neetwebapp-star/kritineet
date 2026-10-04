import prisma from '../prisma';

export interface SessionProgressPosition {
  questionIndex?: number;
  pageNumber?: number;
  scrollOffset?: number;
  conceptId?: string;
  testId?: string;
  notes?: string;
}

export class StudySessionEngine {
  /**
   * Starts a new study session, bound to an optional DailyStudyTask
   */
  static async startSession(params: {
    userId: string;
    taskId?: string;
    planId?: string;
    plannedMinutes?: number;
    timerPreset?: string;
  }) {
    let task = null;
    let effectivePlanId = params.planId;
    let plannedMinutes = params.plannedMinutes || 30;

    if (params.taskId) {
      task = await prisma.dailyStudyTask.findUnique({
        where: { id: params.taskId },
      });
      if (task) {
        effectivePlanId = effectivePlanId || task.planId;
        plannedMinutes = task.estimatedMinutes;
        // Update task status to IN_PROGRESS
        await prisma.dailyStudyTask.update({
          where: { id: params.taskId },
          data: { status: 'IN_PROGRESS' },
        });
      }
    }

    const session = await prisma.studySession.create({
      data: {
        userId: params.userId,
        taskId: params.taskId || null,
        planId: effectivePlanId || null,
        status: 'STARTED',
        startTime: new Date(),
        plannedMinutes,
        timerPreset: params.timerPreset || 'CUSTOM',
      },
    });

    // Log telemetry event
    await this.logEvent({
      sessionId: session.id,
      userId: params.userId,
      eventType: 'SESSION_STARTED',
      eventData: { taskId: params.taskId, plannedMinutes, preset: params.timerPreset },
    });

    return session;
  }

  /**
   * Pauses an active study session
   */
  static async pauseSession(sessionId: string, userId: string) {
    const session = await prisma.studySession.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) throw new Error(`Study session ${sessionId} not found for user`);

    const updated = await prisma.studySession.update({
      where: { id: sessionId },
      data: { status: 'PAUSED' },
    });

    await this.logEvent({
      sessionId,
      userId,
      eventType: 'SESSION_PAUSED',
      eventData: { timestamp: new Date().toISOString() },
    });

    return updated;
  }

  /**
   * Resumes a paused study session
   */
  static async resumeSession(sessionId: string, userId: string) {
    const session = await prisma.studySession.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) throw new Error(`Study session ${sessionId} not found for user`);

    const updated = await prisma.studySession.update({
      where: { id: sessionId },
      data: { status: 'RESUMED' },
    });

    await this.logEvent({
      sessionId,
      userId,
      eventType: 'SESSION_RESUMED',
      eventData: { timestamp: new Date().toISOString() },
    });

    return updated;
  }

  /**
   * Completes a study session, updates task and plan actual minutes
   */
  static async completeSession(params: {
    sessionId: string;
    userId: string;
    actualMinutes?: number;
    completionNotes?: string;
  }) {
    const session = await prisma.studySession.findFirst({
      where: { id: params.sessionId, userId: params.userId },
      include: { task: true },
    });
    if (!session) throw new Error(`Study session ${params.sessionId} not found`);

    const now = new Date();
    const elapsedMinutes = session.startTime
      ? Math.max(1, Math.round((now.getTime() - session.startTime.getTime()) / (1000 * 60)))
      : session.plannedMinutes;
    const finalMinutes = params.actualMinutes ?? elapsedMinutes;

    const updatedSession = await prisma.studySession.update({
      where: { id: params.sessionId },
      data: {
        status: 'COMPLETED',
        endTime: now,
        actualMinutes: finalMinutes,
        activeDurationSeconds: finalMinutes * 60,
      },
    });

    // Update bound task if present
    if (session.taskId) {
      await prisma.dailyStudyTask.update({
        where: { id: session.taskId },
        data: {
          status: 'COMPLETED',
          actualMinutes: finalMinutes,
          completedAt: now,
        },
      });
    }

    // Update parent plan actualMinutes
    if (session.planId) {
      await prisma.dailyStudyPlan.update({
        where: { id: session.planId },
        data: {
          actualMinutes: { increment: finalMinutes },
        },
      });
    }

    await this.logEvent({
      sessionId: params.sessionId,
      userId: params.userId,
      eventType: 'CONTENT_COMPLETED',
      eventData: {
        taskId: session.taskId,
        actualMinutes: finalMinutes,
        notes: params.completionNotes,
      },
    });

    return updatedSession;
  }

  /**
   * Persists granular progress for session continuity across refresh or navigation
   */
  static async saveSessionProgress(sessionId: string, userId: string, position: SessionProgressPosition) {
    return prisma.studySession.update({
      where: { id: sessionId },
      data: {
        currentPositionJson: JSON.stringify(position),
      },
    });
  }

  /**
   * Logs a lightweight learning telemetry event
   */
  static async logEvent(params: {
    sessionId: string;
    userId: string;
    eventType: string;
    eventData?: Record<string, any>;
  }) {
    return prisma.studyEvent.create({
      data: {
        sessionId: params.sessionId,
        userId: params.userId,
        eventType: params.eventType,
        eventDataJson: params.eventData ? JSON.stringify(params.eventData) : null,
      },
    });
  }

  /**
   * Resolves direct one-tap start URL for any task type
   */
  static resolveOneTapStartUrl(task: {
    taskType: string;
    routeUrl?: string | null;
    conceptId?: string | null;
    chapterSlug?: string | null;
    sourceType?: string;
  }): string {
    if (task.routeUrl) return task.routeUrl;

    switch (task.taskType) {
      case 'NCERT_READ':
      case 'NCERT_REVISION':
        return task.chapterSlug ? `/practice?chapter=${task.chapterSlug}` : '/practice';
      case 'CONCEPT_LEARNING':
      case 'REMEDIATION_TASK':
        return task.conceptId ? `/remediation?conceptId=${task.conceptId}` : '/remediation';
      case 'PRACTICE':
        return task.conceptId ? `/practice?conceptId=${task.conceptId}` : '/practice';
      case 'PYQ':
        return '/practice?sourceType=PYQ';
      case 'FINGERTIPS':
        return '/practice?sourceType=FINGERTIPS';
      case 'MISTAKE_REVIEW':
        return '/error-book';
      case 'SPACED_REVISION':
        return task.conceptId ? `/revision?conceptId=${task.conceptId}` : '/revision';
      case 'MOCK_TEST':
        return '/cbt';
      case 'TEST_REVIEW':
        return '/tests/history';
      case 'AI_TUTOR':
        return '/ai-tutor';
      case 'FORMULA_REVISION':
      case 'DIAGRAM_REVISION':
        return '/revision';
      default:
        return '/today';
    }
  }
}
