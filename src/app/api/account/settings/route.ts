import { NextRequest, NextResponse } from 'next/server';
import { resolveActor } from '@/lib/command-center/auth-utils';
import { AccountEngine } from '@/lib/saas/account/account-engine';

export async function GET(req: NextRequest) {
  try {
    const actor = await resolveActor(req, 'STUDENT');
    const settings = await AccountEngine.getPrivacySettings(actor.id);
    return NextResponse.json({
      user: { id: actor.id, name: actor.name, email: actor.email, role: actor.role },
      settings,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const actor = await resolveActor(req, 'STUDENT');
    const body = await req.json().catch(() => ({}));
    const result = await AccountEngine.deleteAccount(actor.id, body.reason);
    return NextResponse.json({
      success: true,
      message: 'Account successfully deleted and all student profile, attempt, and mistake records have been permanently purged.',
      user: result,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
