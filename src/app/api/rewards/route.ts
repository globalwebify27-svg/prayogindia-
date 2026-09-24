import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedCustomer } from "@/lib/authUtils";
import { getSecurityHeaders } from "@/lib/security";

/**
 * GET /api/rewards
 * Returns customer reward balance and transaction history.
 */
export async function GET(request: Request) {
  const headers = getSecurityHeaders();
  const user = await getAuthenticatedCustomer();
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthenticated" },
      { status: 401, headers },
    );
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(
    50,
    Math.max(1, parseInt(searchParams.get("limit") || "20", 10)),
  );

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      success: true,
      data: {
        balance: 0,
        transactions: { items: [], page, limit, total: 0, totalPages: 0 },
      },
      source: "mock",
    });
  }

  try {
    // Fetch authoritative balance and customer tier from DB
    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: { rewardPoints: true, customerType: true },
    });

    const balance = dbUser?.rewardPoints || 0;
    const { LoyaltyEngine } = await import("@/lib/loyaltyEngine");
    const tierRule = await LoyaltyEngine.getTierRule(dbUser?.customerType);

    const total = await db.rewardTransaction.count({
      where: { userId: user.id },
    });
    const totalPages = Math.ceil(total / limit) || 1;

    const transactions = await db.rewardTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Calculate total earned points across history
    const earnedAggregate = await db.rewardTransaction.aggregate({
      where: { userId: user.id, points: { gt: 0 } },
      _sum: { points: true },
    });

    const redeemedAggregate = await db.rewardTransaction.aggregate({
      where: { userId: user.id, points: { lt: 0 } },
      _sum: { points: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        balance,
        rupeeValue:
          Math.round(balance * tierRule.redemptionRateRupees * 100) / 100,
        lifetimeEarned: earnedAggregate._sum.points || 0,
        lifetimeRedeemed: Math.abs(redeemedAggregate._sum.points || 0),
        tierRule: {
          tierCode: tierRule.tierCode,
          name: tierRule.name,
          pointsPer100Spent: tierRule.pointsPer100Spent,
          redemptionRateRupees: tierRule.redemptionRateRupees,
          minRedemptionPoints: tierRule.minRedemptionPoints,
          maxRedemptionPercentage: tierRule.maxRedemptionPercentage,
          validityDays: tierRule.validityDays,
        },
        transactions: {
          items: transactions,
          page,
          limit,
          total,
          totalPages,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch rewards." },
      { status: 500, headers },
    );
  }
}
