import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveActor } from '@/lib/command-center/auth-utils';
import { SandboxPaymentProvider } from '@/lib/saas/billing/payment-provider';
import { CouponEngine } from '@/lib/saas/billing/coupon-engine';

export async function POST(req: NextRequest) {
  try {
    const actor = await resolveActor(req, 'STUDENT');
    const body = await req.json();
    const { planId, couponCode } = body;

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    let finalAmount = plan.price;
    let discountApplied = 0;

    if (couponCode) {
      const couponCheck = await CouponEngine.validateAndApplyCoupon(couponCode, plan.price, plan.name);
      if (couponCheck.isValid) {
        finalAmount = couponCheck.discountedAmount;
        discountApplied = couponCheck.discountValue;
      }
    }

    const provider = new SandboxPaymentProvider();
    const customer = await provider.createCustomer({
      name: actor.name,
      email: actor.email,
      tenantId: actor.tenantId || actor.id,
    });

    const checkout = await provider.createCheckout({
      customerId: customer.customerId,
      tenantId: actor.tenantId || actor.id,
      planId: plan.id,
      amount: finalAmount,
      currency: plan.currency,
      successUrl: '/billing?status=success',
      cancelUrl: '/billing?status=cancelled',
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: checkout.checkoutUrl,
      sessionId: checkout.sessionId,
      amount: finalAmount,
      discountApplied,
      currency: plan.currency,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
