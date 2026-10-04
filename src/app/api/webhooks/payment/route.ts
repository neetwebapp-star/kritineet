import { NextRequest, NextResponse } from 'next/server';
import { SandboxPaymentProvider } from '@/lib/saas/billing/payment-provider';
import { WebhookHandler } from '@/lib/saas/billing/webhook-handler';
import { StructuredLogger } from '@/lib/saas/observability/logger';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-signature') || '';

    const provider = new SandboxPaymentProvider();
    const result = await WebhookHandler.processWebhook(rawBody, signature, provider);

    StructuredLogger.info('WEBHOOK_PROCESSED', {
      metadata: { eventId: result.eventId, isDuplicate: result.isDuplicate },
    });

    return NextResponse.json(result);
  } catch (error: any) {
    StructuredLogger.error('WEBHOOK_FAILED', error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
