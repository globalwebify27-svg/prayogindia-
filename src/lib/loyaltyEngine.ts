import { db } from "@/lib/db";
import { recordAuditLog } from "@/lib/auditLogger";
import { CustomerTypeCode } from "@/data/customerTypes";

export interface TierRuleConfig {
  tierCode: string;
  name: string;
  pointsPer100Spent: number;
  redemptionRateRupees: number;
  minRedemptionPoints: number;
  maxRedemptionPercentage: number;
  validityDays: number;
  registrationBonus: number;
  isActive: boolean;
}

export const FALLBACK_TIER_RULES: Record<string, TierRuleConfig> = {
  B2C: {
    tierCode: "B2C",
    name: "Retail B2C Shopper Tier",
    pointsPer100Spent: 1.0,
    redemptionRateRupees: 0.5,
    minRedemptionPoints: 50,
    maxRedemptionPercentage: 20.0,
    validityDays: 365,
    registrationBonus: 50,
    isActive: true,
  },
  REGISTERED: {
    tierCode: "REGISTERED",
    name: "Registered Maker Loyalty Tier",
    pointsPer100Spent: 1.0,
    redemptionRateRupees: 0.5,
    minRedemptionPoints: 50,
    maxRedemptionPercentage: 25.0,
    validityDays: 365,
    registrationBonus: 100,
    isActive: true,
  },
  B2B: {
    tierCode: "B2B",
    name: "B2B & Institutional Labs Tier",
    pointsPer100Spent: 2.0,
    redemptionRateRupees: 0.5,
    minRedemptionPoints: 100,
    maxRedemptionPercentage: 15.0,
    validityDays: 730,
    registrationBonus: 250,
    isActive: true,
  },
  WALK_IN: {
    tierCode: "WALK_IN",
    name: "Walk-in Store Visitor Tier",
    pointsPer100Spent: 1.0,
    redemptionRateRupees: 0.5,
    minRedemptionPoints: 50,
    maxRedemptionPercentage: 20.0,
    validityDays: 365,
    registrationBonus: 50,
    isActive: true,
  },
};

/**
 * Maps raw customer type string to canonical tier code
 */
export function resolveTierCode(rawType?: string | null): string {
  if (!rawType) return "B2C";
  const upper = rawType.toUpperCase().trim();
  if (upper.includes("B2B")) return "B2B";
  if (upper.includes("REGISTERED") || upper.includes("MAKER"))
    return "REGISTERED";
  if (upper.includes("WALK") || upper.includes("POS")) return "WALK_IN";
  return "B2C";
}

export class LoyaltyEngine {
  /**
   * 1. Get active Tier Rule for a customer type (DB with fallback)
   */
  static async getTierRule(
    customerType?: string | null,
  ): Promise<TierRuleConfig> {
    const code = resolveTierCode(customerType);
    if (process.env.DATABASE_URL) {
      try {
        const dbRule = await db.loyaltyRule.findUnique({
          where: { tierCode: code },
        });
        if (dbRule) {
          return {
            tierCode: dbRule.tierCode,
            name: dbRule.name,
            pointsPer100Spent: dbRule.pointsPer100Spent,
            redemptionRateRupees: dbRule.redemptionRateRupees,
            minRedemptionPoints: dbRule.minRedemptionPoints,
            maxRedemptionPercentage: dbRule.maxRedemptionPercentage,
            validityDays: dbRule.validityDays,
            registrationBonus: dbRule.registrationBonus,
            isActive: dbRule.isActive,
          };
        }
      } catch (err) {
        console.warn(
          "[LoyaltyEngine] DB tier rule lookup error, using fallback:",
          err,
        );
      }
    }
    return FALLBACK_TIER_RULES[code] || FALLBACK_TIER_RULES.B2C;
  }

  /**
   * 2. Calculate points earned on eligible order amount
   */
  static async calculatePointsForOrder(
    eligibleAmount: number,
    customerType?: string | null,
  ): Promise<{ points: number; rupeeValue: number; tierCode: string }> {
    const rule = await this.getTierRule(customerType);
    if (!rule.isActive || eligibleAmount <= 0) {
      return { points: 0, rupeeValue: 0, tierCode: rule.tierCode };
    }
    const points = Math.floor((eligibleAmount / 100) * rule.pointsPer100Spent);
    const rupeeValue =
      Math.round(points * rule.redemptionRateRupees * 100) / 100;
    return { points, rupeeValue, tierCode: rule.tierCode };
  }

  /**
   * 3. Server-authoritative Redemption Validator
   * Validates min points, cart % cap, and customer balance.
   */
  static async validateRedemption(
    userId: string,
    requestedPoints: number,
    subtotal: number,
    customerType?: string | null,
  ): Promise<{
    valid: boolean;
    sanitizedPoints: number;
    discountAmount: number;
    message?: string;
  }> {
    if (requestedPoints <= 0) {
      return { valid: true, sanitizedPoints: 0, discountAmount: 0 };
    }

    const rule = await this.getTierRule(customerType);
    if (!rule.isActive) {
      return {
        valid: false,
        sanitizedPoints: 0,
        discountAmount: 0,
        message: "Loyalty redemption is currently inactive for this tier.",
      };
    }

    // Check customer's actual balance from DB
    let userBalance = 0;
    if (process.env.DATABASE_URL) {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { rewardPoints: true },
      });
      userBalance = user?.rewardPoints || 0;
    }

    if (userBalance <= 0) {
      return {
        valid: false,
        sanitizedPoints: 0,
        discountAmount: 0,
        message: "You have 0 Prayog Coins available.",
      };
    }

    // Check minimum redemption points
    if (requestedPoints < rule.minRedemptionPoints) {
      return {
        valid: false,
        sanitizedPoints: 0,
        discountAmount: 0,
        message: `Minimum ${rule.minRedemptionPoints} Prayog Coins required to redeem at checkout.`,
      };
    }

    // Check max cart percentage cap
    const maxDiscountAllowed = (subtotal * rule.maxRedemptionPercentage) / 100;
    const maxPointsAllowedBySubtotal = Math.floor(
      maxDiscountAllowed / rule.redemptionRateRupees,
    );

    const safePoints = Math.min(
      Math.floor(requestedPoints),
      userBalance,
      maxPointsAllowedBySubtotal,
    );

    if (safePoints <= 0) {
      return {
        valid: false,
        sanitizedPoints: 0,
        discountAmount: 0,
        message: `Reward discount exceeds ${rule.maxRedemptionPercentage}% cart subtotal cap.`,
      };
    }

    const discountAmount =
      Math.round(safePoints * rule.redemptionRateRupees * 100) / 100;

    return {
      valid: true,
      sanitizedPoints: safePoints,
      discountAmount,
    };
  }

  /**
   * 4. Award Order Points (Idempotent)
   * Credits points when payment is verified or order reaches delivered state.
   */
  static async awardOrderPoints(
    orderId: string,
    req?: Request | null,
  ): Promise<{ success: boolean; pointsAwarded: number; message: string }> {
    if (!process.env.DATABASE_URL) {
      return {
        success: true,
        pointsAwarded: 0,
        message: "Mock mode — DB not connected.",
      };
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      return { success: false, pointsAwarded: 0, message: "Order not found." };
    }

    // Check idempotency: Has this order already been credited?
    const existingAward = await db.rewardTransaction.findFirst({
      where: {
        orderId: order.id,
        type: "EARNED",
        referenceType: "ORDER_PAYMENT",
      },
    });

    if (existingAward) {
      return {
        success: true,
        pointsAwarded: existingAward.points,
        message: `Order ${order.orderNumber} rewards already awarded previously.`,
      };
    }

    const { points } = await this.calculatePointsForOrder(
      order.totalAmount,
      order.customerType,
    );

    if (points <= 0) {
      return {
        success: true,
        pointsAwarded: 0,
        message: "Order total not eligible for points.",
      };
    }

    const currentBalance = order.user?.rewardPoints || 0;
    const newBalance = currentBalance + points;

    const rule = await this.getTierRule(order.customerType);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + rule.validityDays);

    // Atomic DB execution
    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: order.userId },
        data: { rewardPoints: { increment: points } },
      });

      await tx.order.update({
        where: { id: order.id },
        data: { rewardPointsEarned: points },
      });

      await tx.rewardTransaction.create({
        data: {
          userId: order.userId,
          orderId: order.id,
          type: "EARNED",
          points,
          balanceBefore: currentBalance,
          balanceAfter: newBalance,
          description: `Earned ${points} Prayog Coins on order #${order.orderNumber}`,
          referenceType: "ORDER_PAYMENT",
          referenceId: order.orderNumber,
          expiryDate,
          metadata: {
            orderAmount: order.totalAmount,
            tierCode: rule.tierCode,
          },
        },
      });
    });

    // Record Immutable Audit Log
    await recordAuditLog({
      actionCategory: "ORDER_FULFILLMENT",
      action: "REWARD_POINTS_EARNED",
      entityType: "User",
      entityId: order.userId,
      description: `Credited +${points} Prayog Coins to ${order.user.name} for Order #${order.orderNumber}. New Balance: ${newBalance} PTS.`,
      actor: { id: "system", name: "Loyalty Engine", role: "SYSTEM" },
      previousValue: { rewardPoints: currentBalance },
      newValue: { rewardPoints: newBalance, pointsEarned: points },
      metadata: { orderId: order.id, orderNumber: order.orderNumber },
      req,
    });

    return {
      success: true,
      pointsAwarded: points,
      message: `Successfully awarded ${points} coins.`,
    };
  }

  /**
   * 5. Reverse Order Points on Cancellation / Refund
   * - Deducts points earned on the order
   * - Refunds any points redeemed during checkout back to the customer
   */
  static async reverseOrderPoints(
    orderId: string,
    reason: string,
    actor?: any,
    req?: Request | null,
  ): Promise<{
    success: boolean;
    earnedReversed: number;
    redeemedRefunded: number;
  }> {
    if (!process.env.DATABASE_URL) {
      return { success: true, earnedReversed: 0, redeemedRefunded: 0 };
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      return { success: false, earnedReversed: 0, redeemedRefunded: 0 };
    }

    let earnedReversed = 0;
    let redeemedRefunded = 0;

    await db.$transaction(async (tx) => {
      const freshUser = await tx.user.findUnique({
        where: { id: order.userId },
      });
      let currentBal = freshUser?.rewardPoints || 0;

      // 5a. Reverse earned points if any were awarded
      if (order.rewardPointsEarned > 0) {
        const alreadyReversed = await tx.rewardTransaction.findFirst({
          where: {
            orderId: order.id,
            type: "REFUND_REVERSAL",
            referenceType: "ORDER_CANCEL",
          },
        });

        if (!alreadyReversed) {
          earnedReversed = order.rewardPointsEarned;
          const nextBal = Math.max(0, currentBal - earnedReversed);

          await tx.user.update({
            where: { id: order.userId },
            data: { rewardPoints: nextBal },
          });

          await tx.rewardTransaction.create({
            data: {
              userId: order.userId,
              orderId: order.id,
              type: "REFUND_REVERSAL",
              points: -earnedReversed,
              balanceBefore: currentBal,
              balanceAfter: nextBal,
              description: `Reversed ${earnedReversed} coins — order #${order.orderNumber} ${reason}`,
              referenceType: "ORDER_CANCEL",
              referenceId: order.orderNumber,
            },
          });

          currentBal = nextBal;
        }
      }

      // 5b. Restore redeemed points if customer used coins at checkout
      if (order.rewardPointsUsed > 0) {
        const alreadyRestored = await tx.rewardTransaction.findFirst({
          where: {
            orderId: order.id,
            type: "ADJUSTMENT",
            referenceType: "CHECKOUT_REDEEM_RESTORE",
          },
        });

        if (!alreadyRestored) {
          redeemedRefunded = order.rewardPointsUsed;
          const nextBal = currentBal + redeemedRefunded;

          await tx.user.update({
            where: { id: order.userId },
            data: { rewardPoints: nextBal },
          });

          await tx.rewardTransaction.create({
            data: {
              userId: order.userId,
              orderId: order.id,
              type: "ADJUSTMENT",
              points: redeemedRefunded,
              balanceBefore: currentBal,
              balanceAfter: nextBal,
              description: `Restored ${redeemedRefunded} redeemed coins — order #${order.orderNumber} ${reason}`,
              referenceType: "CHECKOUT_REDEEM_RESTORE",
              referenceId: order.orderNumber,
            },
          });
        }
      }
    });

    if (earnedReversed > 0 || redeemedRefunded > 0) {
      await recordAuditLog({
        actionCategory: "ORDER_FULFILLMENT",
        action: "REWARD_POINTS_REVERSAL",
        entityType: "User",
        entityId: order.userId,
        description: `Order #${order.orderNumber} points adjusted (${reason}). Revoked: -${earnedReversed} PTS, Restored: +${redeemedRefunded} PTS.`,
        actor: actor || {
          id: "system",
          name: "Loyalty Engine",
          role: "SYSTEM",
        },
        metadata: { orderId: order.id, reason },
        req,
      });
    }

    return { success: true, earnedReversed, redeemedRefunded };
  }

  /**
   * 6. Admin Manual Point Adjustment
   * Authoritative balance addition/deduction with complete ledger audit.
   */
  static async manualAdjustPoints(params: {
    userId: string;
    points: number; // positive or negative
    type: "Earned" | "Admin Adjustment" | "Expired" | "Bonus";
    reason: string;
    actor?: any;
    req?: Request | null;
  }): Promise<{ success: boolean; newBalance: number; transactionId: string }> {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "Database connection required for manual loyalty adjustments.",
      );
    }

    const user = await db.user.findUnique({
      where: { id: params.userId },
      select: { id: true, name: true, email: true, rewardPoints: true },
    });

    if (!user) {
      throw new Error(`Customer with ID ${params.userId} not found.`);
    }

    const delta = Math.floor(params.points);
    const balanceBefore = user.rewardPoints || 0;
    const balanceAfter = Math.max(0, balanceBefore + delta);

    const typeCodeMap: Record<string, string> = {
      Earned: "EARNED",
      "Admin Adjustment": "ADJUSTMENT",
      Expired: "EXPIRED",
      Bonus: "BONUS",
    };

    const typeCode = typeCodeMap[params.type] || "ADJUSTMENT";

    const txRecord = await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { rewardPoints: balanceAfter },
      });

      return await tx.rewardTransaction.create({
        data: {
          userId: user.id,
          type: typeCode,
          points: delta,
          balanceBefore,
          balanceAfter,
          description:
            params.reason ||
            `Manual ${params.type} by ${params.actor?.name || "Administrator"}`,
          referenceType: "ADMIN_ADJUSTMENT",
          referenceId: params.actor?.id || null,
          metadata: {
            adjustedBy: params.actor?.name || "Admin",
            actorRole: params.actor?.role || "ADMIN",
          },
        },
      });
    });

    // Record Immutable Audit Log
    await recordAuditLog({
      actionCategory: "USER_MANAGEMENT",
      action: "REWARD_MANUAL_ADJUSTMENT",
      entityType: "User",
      entityId: user.id,
      description: `Manual point adjustment of ${delta > 0 ? `+${delta}` : delta} PTS for ${user.name} (${user.email}). New Balance: ${balanceAfter} PTS. Reason: ${params.reason}`,
      actor: params.actor,
      previousValue: { rewardPoints: balanceBefore },
      newValue: { rewardPoints: balanceAfter, pointsDelta: delta },
      metadata: { transactionId: txRecord.id, reason: params.reason },
      req: params.req,
    });

    return {
      success: true,
      newBalance: balanceAfter,
      transactionId: txRecord.id,
    };
  }

  /**
   * 7. Award Registration Welcome Bonus
   */
  static async awardRegistrationBonus(
    userId: string,
    customerType?: string | null,
    req?: Request | null,
  ): Promise<void> {
    if (!process.env.DATABASE_URL) return;

    try {
      const rule = await this.getTierRule(customerType);
      if (!rule.isActive || rule.registrationBonus <= 0) return;

      const bonus = rule.registrationBonus;
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, rewardPoints: true },
      });

      if (!user) return;

      // Check if already awarded
      const existing = await db.rewardTransaction.findFirst({
        where: {
          userId: user.id,
          referenceType: "REGISTRATION_BONUS",
        },
      });

      if (existing) return;

      const balanceBefore = user.rewardPoints || 0;
      const balanceAfter = balanceBefore + bonus;

      await db.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: user.id },
          data: { rewardPoints: balanceAfter },
        });

        await tx.rewardTransaction.create({
          data: {
            userId: user.id,
            type: "BONUS",
            points: bonus,
            balanceBefore,
            balanceAfter,
            description: `Welcome bonus: ${bonus} Prayog Coins for verified account creation`,
            referenceType: "REGISTRATION_BONUS",
            referenceId: user.id,
            metadata: { tierCode: rule.tierCode },
          },
        });
      });

      await recordAuditLog({
        actionCategory: "AUTH",
        action: "REWARD_WELCOME_BONUS",
        entityType: "User",
        entityId: user.id,
        description: `Awarded welcome bonus of ${bonus} Prayog Coins to newly registered user ${user.name}.`,
        actor: { id: "system", name: "Loyalty Engine", role: "SYSTEM" },
        previousValue: { rewardPoints: balanceBefore },
        newValue: { rewardPoints: balanceAfter },
        req,
      });
    } catch (err) {
      console.error("[LoyaltyEngine] Failed to award registration bonus:", err);
    }
  }
}
