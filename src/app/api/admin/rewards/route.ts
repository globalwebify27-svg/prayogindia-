import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { getAuthenticatedStaff } from "@/lib/staffAuth";
import { LoyaltyEngine } from "@/lib/loyaltyEngine";

// GET /api/admin/rewards — List global reward transactions with search & pagination
export async function GET(req: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    const staff = await getAuthenticatedStaff();

    if (!admin && (!staff || (staff.role !== "SUPER_ADMIN" && staff.role !== "REGIONAL_MANAGER"))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get("limit") || "30", 10)));
    const skip = (page - 1) * limit;

    const search = searchParams.get("search")?.trim() || "";
    const type = searchParams.get("type");

    const where: any = {};

    if (type && type !== "ALL") {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { description: { contains: search, mode: "insensitive" } },
        { referenceId: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [total, transactions, stats] = await Promise.all([
      db.rewardTransaction.count({ where }),
      db.rewardTransaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              customerType: true,
              rewardPoints: true,
            },
          },
        },
      }),
      db.user.aggregate({
        _sum: { rewardPoints: true },
        _count: { id: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
      stats: {
        totalCirculatingCoins: stats._sum.rewardPoints || 0,
        totalCustomers: stats._count.id || 0,
      },
    });
  } catch (error: any) {
    console.error("GET /api/admin/rewards error:", error);
    return NextResponse.json({ error: "Failed to fetch reward ledger", details: error.message }, { status: 500 });
  }
}

// POST /api/admin/rewards — Create manual points adjustment
export async function POST(req: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    const staff = await getAuthenticatedStaff();

    if (!admin && (!staff || staff.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized: Admin privileges required" }, { status: 403 });
    }

    const body = await req.json();
    const { email, points, type, reason } = body;

    if (!email || typeof points !== "number" || points === 0) {
      return NextResponse.json({ error: "Invalid parameters: email and non-zero points required" }, { status: 400 });
    }

    // Lookup customer by email
    const targetUser = await db.user.findFirst({
      where: { email: { equals: email.trim(), mode: "insensitive" } },
    });

    if (!targetUser) {
      return NextResponse.json({ error: `Customer with email ${email} not found` }, { status: 404 });
    }

    const actor = admin || staff;

    const result = await LoyaltyEngine.manualAdjustPoints({
      userId: targetUser.id,
      points,
      type: type || "Admin Adjustment",
      reason: reason || "Manual administrator adjustment",
      actor,
      req,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully adjusted ${points > 0 ? `+${points}` : points} coins for ${targetUser.name}.`,
      data: result,
    });
  } catch (error: any) {
    console.error("POST /api/admin/rewards error:", error);
    return NextResponse.json({ error: "Failed to create points adjustment", details: error.message }, { status: 500 });
  }
}
