/**
 * Phase 8: Coupon System Engine
 * Validates discount coupons server-side, preventing expired reuse,
 * redemption cap violations, and client-side discount manipulation.
 */

import prisma from '@/lib/prisma';

export interface CreateCouponInput {
  code: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  maxRedemptions?: number;
  validFrom?: Date;
  validUntil: Date;
  applicablePlans?: string[]; // e.g. ['STUDENT', 'PRO']
}

export class CouponEngine {
  /**
   * Create a promotional coupon
   */
  public static async createCoupon(input: CreateCouponInput) {
    return prisma.coupon.create({
      data: {
        code: input.code.toUpperCase().trim(),
        discountType: input.discountType,
        discountValue: input.discountValue,
        maxRedemptions: input.maxRedemptions ?? 100,
        validFrom: input.validFrom || new Date(),
        validUntil: input.validUntil,
        applicablePlans: input.applicablePlans ? input.applicablePlans.join(',') : null,
        status: 'ACTIVE',
      },
    });
  }

  /**
   * Authoritative server-side validation and discount calculation
   */
  public static async validateAndApplyCoupon(
    code: string,
    originalAmount: number,
    planName: string
  ): Promise<{ isValid: boolean; discountedAmount: number; discountValue: number; reason?: string }> {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon) {
      return { isValid: false, discountedAmount: originalAmount, discountValue: 0, reason: 'Invalid coupon code' };
    }

    if (coupon.status !== 'ACTIVE') {
      return { isValid: false, discountedAmount: originalAmount, discountValue: 0, reason: 'Coupon is no longer active' };
    }

    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
      return { isValid: false, discountedAmount: originalAmount, discountValue: 0, reason: 'Coupon has expired' };
    }

    if (coupon.currentRedemptions >= coupon.maxRedemptions) {
      return { isValid: false, discountedAmount: originalAmount, discountValue: 0, reason: 'Coupon redemption limit reached' };
    }

    if (coupon.applicablePlans) {
      const allowed = coupon.applicablePlans.split(',').map(p => p.trim());
      if (!allowed.includes(planName)) {
        return { isValid: false, discountedAmount: originalAmount, discountValue: 0, reason: `Coupon not applicable to plan ${planName}` };
      }
    }

    let calculatedDiscount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      calculatedDiscount = (originalAmount * coupon.discountValue) / 100;
    } else {
      calculatedDiscount = coupon.discountValue;
    }

    // Never let discounted amount go below 0
    const finalAmount = Math.max(0, Math.round(originalAmount - calculatedDiscount));
    const effectiveDiscount = originalAmount - finalAmount;

    return {
      isValid: true,
      discountedAmount: finalAmount,
      discountValue: effectiveDiscount,
    };
  }

  /**
   * Increment redemption counter on successful purchase
   */
  public static async redeemCoupon(code: string) {
    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase().trim() } });
    if (!coupon) throw new Error('Coupon not found');

    const updated = await prisma.coupon.update({
      where: { id: coupon.id },
      data: {
        currentRedemptions: { increment: 1 },
      },
    });

    if (updated.currentRedemptions >= updated.maxRedemptions) {
      await prisma.coupon.update({
        where: { id: coupon.id },
        data: { status: 'EXPIRED' },
      });
    }

    return updated;
  }
}
