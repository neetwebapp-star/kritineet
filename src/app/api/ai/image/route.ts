import { NextRequest, NextResponse } from 'next/server';
import { ImageDoubtSolver } from '@/lib/ai/image-solver';
import { AIRateLimiter } from '@/lib/ai/rate-limiter';
import { resolveUser } from '@/lib/ai/auth-helper';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, query, userId: bodyUserId } = body;

    if (!image) {
      return NextResponse.json({ error: 'Image data is required' }, { status: 400 });
    }

    const user = await resolveUser(req, bodyUserId);

    // Rate limit check for image doubt queries
    const rateLimit = await AIRateLimiter.checkLimit(user.id, true);
    if (!rateLimit.allowed) {
      return NextResponse.json({
        error: rateLimit.errorMessage || 'Daily image doubt limit reached',
        rateLimit
      }, { status: 429 });
    }

    const doubtResult = await ImageDoubtSolver.processImageDoubt(image, query);

    // Record image usage
    await AIRateLimiter.recordUsage(user.id, true);

    return NextResponse.json({
      ...doubtResult,
      remainingImages: rateLimit.remainingImages - 1,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
