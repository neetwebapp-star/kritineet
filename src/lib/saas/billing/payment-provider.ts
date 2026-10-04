/**
 * Phase 8: Payment Provider Abstraction
 * Defines the generic PaymentProvider interface and concrete SandboxPaymentProvider
 * with HMAC-SHA256 signature verification, keeping credentials strictly server-side.
 */

import crypto from 'crypto';

export interface CustomerInput {
  name: string;
  email: string;
  tenantId: string;
}

export interface CheckoutInput {
  customerId: string;
  tenantId: string;
  planId: string;
  amount: number;
  currency: string;
  successUrl: string;
  cancelUrl: string;
}

export interface WebhookResult {
  isValid: boolean;
  eventId: string;
  eventType: string;
  tenantId?: string;
  planId?: string;
  providerSubscriptionId?: string;
  amount?: number;
  rawPayload: any;
}

export interface PaymentProvider {
  createCustomer(input: CustomerInput): Promise<{ customerId: string }>;
  createCheckout(input: CheckoutInput): Promise<{ checkoutUrl: string; sessionId: string }>;
  createSubscription(customerId: string, planId: string): Promise<{ subscriptionId: string; status: string }>;
  cancelSubscription(subscriptionId: string): Promise<boolean>;
  verifyPayment(paymentId: string): Promise<{ isPaid: boolean; amount: number; currency: string }>;
  verifyWebhookSignature(rawBody: string, signature: string, secret: string): boolean;
  parseWebhook(payload: any): WebhookResult;
}

export class SandboxPaymentProvider implements PaymentProvider {
  private webhookSecret: string;

  constructor(secret: string = 'sandbox_secret_key_neet2027') {
    this.webhookSecret = secret;
  }

  public async createCustomer(input: CustomerInput): Promise<{ customerId: string }> {
    return { customerId: `cus_sandbox_${Buffer.from(input.email).toString('hex').substring(0, 12)}` };
  }

  public async createCheckout(input: CheckoutInput): Promise<{ checkoutUrl: string; sessionId: string }> {
    const sessionId = `cs_sandbox_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      checkoutUrl: `/billing/checkout?session_id=${sessionId}&tenantId=${input.tenantId}&planId=${input.planId}`,
      sessionId,
    };
  }

  public async createSubscription(customerId: string, planId: string): Promise<{ subscriptionId: string; status: string }> {
    return {
      subscriptionId: `sub_sandbox_${Date.now()}`,
      status: 'ACTIVE',
    };
  }

  public async cancelSubscription(subscriptionId: string): Promise<boolean> {
    return true;
  }

  public async verifyPayment(paymentId: string): Promise<{ isPaid: boolean; amount: number; currency: string }> {
    // Verified server-side: sandbox payments starting with "pay_sandbox_valid" evaluate as paid
    const isPaid = paymentId.startsWith('pay_sandbox_valid');
    return {
      isPaid,
      amount: isPaid ? 999 : 0,
      currency: 'INR',
    };
  }

  public verifyWebhookSignature(rawBody: string, signature: string, secret?: string): boolean {
    const key = secret || this.webhookSecret;
    const computedSignature = crypto.createHmac('sha256', key).update(rawBody).digest('hex');
    return computedSignature === signature;
  }

  public parseWebhook(payload: any): WebhookResult {
    return {
      isValid: true,
      eventId: payload.id || `evt_${Date.now()}`,
      eventType: payload.type || 'subscription.created',
      tenantId: payload.tenantId,
      planId: payload.planId,
      providerSubscriptionId: payload.subscriptionId || payload.id,
      amount: payload.amount,
      rawPayload: payload,
    };
  }

  /**
   * Helper to generate a valid test webhook signature for automated testing
   */
  public generateTestSignature(rawBody: string, secret?: string): string {
    const key = secret || this.webhookSecret;
    return crypto.createHmac('sha256', key).update(rawBody).digest('hex');
  }
}
