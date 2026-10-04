import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subjectFilter = searchParams.get('subject') || 'ALL';
    const statusFilter = searchParams.get('status') || 'ALL';

    const manifestPath = path.resolve(process.cwd(), 'docs/MTG_AUTHORITATIVE_SOURCE_INVENTORY.json');
    if (!fs.existsSync(manifestPath)) {
      return NextResponse.json({ error: 'Inventory manifest not found' }, { status: 404 });
    }

    const rawData = fs.readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(rawData);

    // Refresh live deployed counts from database directly to ensure zero staleness
    const counts = await prisma.question.groupBy({
      by: ['chapterId'],
      where: { sourceType: 'FINGERTIPS' },
      _count: { id: true },
    });

    const countMap = new Map<string, number>();
    for (const c of counts) {
      if (c.chapterId) countMap.set(c.chapterId, c._count.id);
    }

    let chapters = manifest.chapters.map((ch: any) => {
      const liveDeployed = countMap.get(ch.chapterId) || 0;
      const isComplete = liveDeployed >= ch.totalSourceMCQs;
      return {
        ...ch,
        deployedMCQs: liveDeployed,
        missingMCQs: Math.max(0, ch.totalSourceMCQs - liveDeployed),
        isComplete,
        status: isComplete ? '🟢 CONTENT COMPLETE' : `🔴 INCOMPLETE (${liveDeployed} / ${ch.totalSourceMCQs})`
      };
    });

    // Apply subject filter
    if (subjectFilter !== 'ALL') {
      chapters = chapters.filter((c: any) => c.subject.toUpperCase() === subjectFilter.toUpperCase());
    }

    // Apply status filter
    if (statusFilter === 'COMPLETE') {
      chapters = chapters.filter((c: any) => c.isComplete);
    } else if (statusFilter === 'INCOMPLETE') {
      chapters = chapters.filter((c: any) => !c.isComplete);
    }

    const totalSource = chapters.reduce((sum: number, c: any) => sum + c.totalSourceMCQs, 0);
    const totalDeployed = chapters.reduce((sum: number, c: any) => sum + c.deployedMCQs, 0);
    const completedCount = chapters.filter((c: any) => c.isComplete).length;
    const incompleteCount = chapters.filter((c: any) => !c.isComplete).length;

    return NextResponse.json({
      success: true,
      metadata: manifest.metadata,
      sourceFiles: manifest.sourceFiles,
      summary: {
        totalChapters: chapters.length,
        totalSourceMCQs: totalSource,
        totalDeployedMCQs: totalDeployed,
        completedChapters: completedCount,
        incompleteChapters: incompleteCount,
        overallParity: `${((totalDeployed / (totalSource || 1)) * 100).toFixed(1)}%`
      },
      chapters
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch inventory'
    }, { status: 500 });
  }
}
