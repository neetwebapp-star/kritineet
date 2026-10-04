import { NextRequest, NextResponse } from 'next/server';
import { resolveActor } from '@/lib/command-center/auth-utils';
import { NotificationEngine } from '@/lib/command-center/notification-engine';

export async function GET(req: NextRequest) {
  try {
    const actor = await resolveActor(req);
    const isParent = actor.role === 'PARENT';

    const [notifications, unreadCount] = await Promise.all([
      NotificationEngine.getNotifications(actor.id, isParent),
      NotificationEngine.getUnreadCount(actor.id),
    ]);

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const actor = await resolveActor(req);
    const body = await req.json();
    const { notificationId, markAll } = body;

    if (markAll) {
      await NotificationEngine.markAllAsRead(actor.id);
      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    if (notificationId) {
      const updated = await NotificationEngine.markAsRead(notificationId, actor.id);
      return NextResponse.json({ success: true, notification: updated });
    }

    return NextResponse.json({ error: 'notificationId or markAll is required' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const actor = await resolveActor(req, 'MENTOR');
    const body = await req.json();

    const { recipientId, type, title, message, relatedEntity, isParentVisible } = body;

    if (!recipientId || !title || !message) {
      return NextResponse.json({ error: 'recipientId, title, and message are required' }, { status: 400 });
    }

    const notif = await NotificationEngine.createNotification({
      recipientId,
      type: type || 'FEEDBACK',
      title,
      message,
      relatedEntity,
      isParentVisible: Boolean(isParentVisible),
    });

    return NextResponse.json({ success: true, notification: notif });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
