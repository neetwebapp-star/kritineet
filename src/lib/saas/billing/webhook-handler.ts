/**
 * Phase 8: Payment Webhook Handler
 * Processes incoming payment provider events with signature verification,
 * strict idempotency, duplicate event suppression, and state transition safety.
 */

import prisma from '@/lib/prisma';
import { PaymentProvider } from './payment-provider';
import { SubscriptionEngine } from './subscription-engine';

export class WebhookHandler {
  /**
   * Processes a verified provider webhook event idempotently
   */
  public static async processWebhook(
    rawBody: string,
    signature: string,
    provider: PaymentProvider,
    webhookSecret?: string
  ): Promise<{ success: boolean; eventId?: string; isDuplicate?: boolean; message?: string }> {
    // 1. Verify signature
    const isValidSignature = provider.verifyWebhookSignature(rawBody, signature, webhookSecret || 'sandbox_secret_key_neet2027');
    if (!isValidSignature) {
      throw new Error('Invalid webhook signature: rejection due to untrusted sender');
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      throw new Error('Invalid JSON payload');
    }

    const event = provider.parseWebhook(payload);

    // 2. Check idempotency: check if event has already been processed
    const existingEvent = await prisma.paymentWebhookEvent.findUnique({
      where: { eventId: event.eventId },
    });

    if (existingEvent) {
      return {
        success: true,
        eventId: event.eventId,
        isDuplicate: true,
        message: 'Duplicate event received and safely suppressed',
      };
    }

    // 3. Record event in database for audit and deduplication
    await prisma.paymentWebhookEvent.create({
      data: {
        provider: 'SANDBOX',
        eventId: event.eventId,
        eventType: event.eventType,
        payloadJson: rawBody,
        status: 'PROCESSED',
      },
    });

    // 4. Handle event types
    if (event.eventType === 'subscription.created' || event.eventType === 'payment.succeeded') {
      if (event.tenantId && event.planId) {
        await SubscriptionEngine.activateSubscription({
          tenantId: event.tenantId,
          planId: event.planId,
          provider: 'SANDBOX',
          providerSubscriptionId: event.providerSubscriptionId,
        });
      }
    } else if (event.eventType === 'subscription.cancelled') {
      if (event.providerSubscriptionId) {
        const sub = await prisma.subscription.findFirst({
          where: { providerSubscriptionId: event.providerSubscriptionId },
        });
        if (sub) {
          await SubscriptionEngine.cancelSubscription(sub.id);
        }
      }
    }

    return {
      success: true,
      eventId: event.eventId,
      isDuplicate: false,
      message: `Event ${event.eventType} processed successfully`,
    };
  }
}
