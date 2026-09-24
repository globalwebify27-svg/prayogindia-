import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { getAuthenticatedStaff } from "@/lib/staffAuth";
import { FALLBACK_TIER_RULES } from "@/lib/loyaltyEngine";
import { recordAuditLog } from "@/lib/auditLogger";

// GET /api/admin/rewards/rules — List all configurable tier rules
export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();
    const staff = await getAuthenticatedStaff();

    if (
      !admin &&
      (!staff ||
        (staff.role !== "SUPER_ADMIN" && staff.role !== "REGIONAL_MANAGER"))
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        success: true,
        rules: Object.values(FALLBACK_TIER_RULES),
      });
    }

    // Fetch from DB or seed defaults if table is empty
    let rules = await db.loyaltyRule.findMany({ orderBy: { tierCode: "asc" } });

    if (rules.length === 0) {
      for (const fallback of Object.values(FALLBACK_TIER_RULES)) {
        await db.loyaltyRule.create({
          data: {
            tierCode: fallback.tierCode,
            name: fallback.name,
            pointsPer100Spent: fallback.pointsPer100Spent,
            redemptionRateRupees: fallback.redemptionRateRupees,
            minRedemptionPoints: fallback.minRedemptionPoints,
            maxRedemptionPercentage: fallback.maxRedemptionPercentage,
            validityDays: fallback.validityDays,
            registrationBonus: fallback.registrationBonus,
            isActive: fallback.isActive,
          },
        });
      }
      rules = await db.loyaltyRule.findMany({ orderBy: { tierCode: "asc" } });
    }

    return NextResponse.json({ success: true, rules });
  } catch (error: any) {
    console.error("GET /api/admin/rewards/rules error:", error);
    return NextResponse.json(
      { error: "Failed to fetch rules", details: error.message },
      { status: 500 },
    );
  }
}

// PATCH /api/admin/rewards/rules — Update a tier rule
export async function PATCH(req: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    const staff = await getAuthenticatedStaff();

    if (!admin && (!staff || staff.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Forbidden: Super Admin required" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const {
      tierCode,
      name,
      pointsPer100Spent,
      redemptionRateRupees,
      minRedemptionPoints,
      maxRedemptionPercentage,
      validityDays,
      registrationBonus,
      isActive,
    } = body;

    if (!tierCode) {
      return NextResponse.json(
        { error: "tierCode is required" },
        { status: 400 },
      );
    }

    const existing = await db.loyaltyRule.findUnique({
      where: { tierCode },
    });

    const updated = await db.loyaltyRule.upsert({
      where: { tierCode },
      create: {
        tierCode,
        name: name || `${tierCode} Loyalty Tier`,
        pointsPer100Spent: Number(pointsPer100Spent) || 1.0,
        redemptionRateRupees: Number(redemptionRateRupees) || 0.5,
        minRedemptionPoints: Number(minRedemptionPoints) || 50,
        maxRedemptionPercentage: Number(maxRedemptionPercentage) || 20.0,
        validityDays: Number(validityDays) || 365,
        registrationBonus: Number(registrationBonus) || 100,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
      update: {
        name: name || undefined,
        pointsPer100Spent:
          pointsPer100Spent !== undefined
            ? Number(pointsPer100Spent)
            : undefined,
        redemptionRateRupees:
          redemptionRateRupees !== undefined
            ? Number(redemptionRateRupees)
            : undefined,
        minRedemptionPoints:
          minRedemptionPoints !== undefined
            ? Number(minRedemptionPoints)
            : undefined,
        maxRedemptionPercentage:
          maxRedemptionPercentage !== undefined
            ? Number(maxRedemptionPercentage)
            : undefined,
        validityDays:
          validityDays !== undefined ? Number(validityDays) : undefined,
        registrationBonus:
          registrationBonus !== undefined
            ? Number(registrationBonus)
            : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
    });

    // Record Immutable Audit Log for loyalty rule changes
    await recordAuditLog({
      actionCategory: "SYSTEM_SECURITY",
      action: "LOYALTY_RULE_UPDATE",
      entityType: "LoyaltyRule",
      entityId: updated.id,
      description: `Loyalty rule updated for tier "${updated.name}" (${updated.tierCode}). Earning: ${updated.pointsPer100Spent} pts/₹100, Max Cap: ${updated.maxRedemptionPercentage}%.`,
      actor: admin || staff,
      previousValue: existing
        ? {
            pointsPer100Spent: existing.pointsPer100Spent,
            redemptionRateRupees: existing.redemptionRateRupees,
            maxRedemptionPercentage: existing.maxRedemptionPercentage,
          }
        : null,
      newValue: {
        pointsPer100Spent: updated.pointsPer100Spent,
        redemptionRateRupees: updated.redemptionRateRupees,
        maxRedemptionPercentage: updated.maxRedemptionPercentage,
      },
      metadata: { tierCode: updated.tierCode },
      req,
    });

    return NextResponse.json({
      success: true,
      message: `Tier rule for ${updated.name} updated successfully.`,
      rule: updated,
    });
  } catch (error: any) {
    console.error("PATCH /api/admin/rewards/rules error:", error);
    return NextResponse.json(
      { error: "Failed to update rule", details: error.message },
      { status: 500 },
    );
  }
}
