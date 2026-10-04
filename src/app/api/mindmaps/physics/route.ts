import { NextRequest, NextResponse } from 'next/server';
import {
  PHYSICS_MIND_MAPS,
  getMindMapByChapterSlug,
  getAllMindMapsForClass,
} from '@/lib/mindmaps/physics-mindmap-registry';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classLevelParam = searchParams.get('class');
    const chapterSlug = searchParams.get('chapter');
    const statusParam = searchParams.get('status');

    let results = [...PHYSICS_MIND_MAPS];

    if (classLevelParam) {
      const cls = parseInt(classLevelParam, 10);
      if (cls === 11 || cls === 12) {
        results = results.filter((m) => m.classLevel === cls);
      }
    }

    if (chapterSlug) {
      results = results.filter(
        (m) =>
          m.chapterSlug.toLowerCase() === chapterSlug.toLowerCase() ||
          m.chapterTitle.toLowerCase().includes(chapterSlug.toLowerCase())
      );
    }

    if (statusParam && statusParam !== 'ALL') {
      results = results.filter((m) => m.status === statusParam);
    } else if (!statusParam) {
      results = results.filter((m) => m.status === 'ACTIVE');
    }

    const activeMaps = PHYSICS_MIND_MAPS.filter((m) => m.status === 'ACTIVE');

    return NextResponse.json({
      success: true,
      count: results.length,
      totalAvailable: activeMaps.length,
      class11Count: activeMaps.filter((m) => m.classLevel === 11).length,
      class12Count: activeMaps.filter((m) => m.classLevel === 12).length,
      mindMaps: results,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
