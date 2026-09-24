import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedStaff } from "@/lib/staffAuth";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { AuditActionCategory } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const staff = await getAuthenticatedStaff();
    const admin = await getAuthenticatedAdmin();

    if (!staff && !admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isSuperAdmin =
      (admin?.role as string) === "SUPER_ADMIN" ||
      (admin?.role as string) === "ADMIN" ||
      staff?.role === "SUPER_ADMIN";
    const isRegional = staff?.role === "REGIONAL_MANAGER";

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      100,
      Math.max(10, parseInt(searchParams.get("limit") || "30", 10)),
    );
    const skip = (page - 1) * limit;

    const category = searchParams.get("category") as AuditActionCategory | null;
    const search = searchParams.get("search")?.trim() || "";
    const storeIdParam = searchParams.get("storeId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {};

    // 1. Role-based Store Scope
    if (isSuperAdmin) {
      if (storeIdParam && storeIdParam !== "ALL") {
        where.storeId = storeIdParam;
      }
    } else if (isRegional) {
      const allowedCodes = staff?.allowedStoreCodes || [];
      // If storeIdParam provided and within allowed, use it; else filter by allowed stores
      if (storeIdParam && storeIdParam !== "ALL") {
        where.storeId = storeIdParam;
      } else {
        const allowedStores = await prisma.store.findMany({
          where: { code: { in: allowedCodes } },
          select: { id: true },
        });
        where.storeId = { in: allowedStores.map((s) => s.id) };
      }
    } else {
      // Store Manager / Cashier / Kiosk -> strictly scoped to their assigned storeId
      if (!staff?.storeId) {
        return NextResponse.json(
          { error: "Forbidden: No assigned store context" },
          { status: 403 },
        );
      }
      where.storeId = staff.storeId;
    }

    // 2. Action Category Filter
    if (category && Object.values(AuditActionCategory).includes(category)) {
      where.actionCategory = category;
    }

    // 3. Search Filter (action, entityType, entityId, actorName, actorEmail, description)
    if (search) {
      where.OR = [
        { action: { contains: search, mode: "insensitive" } },
        { entityType: { contains: search, mode: "insensitive" } },
        { entityId: { contains: search, mode: "insensitive" } },
        { actorName: { contains: search, mode: "insensitive" } },
        { actorEmail: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // 4. Date Range Filter
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          store: {
            select: {
              id: true,
              name: true,
              code: true,
              city: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("GET /api/admin/audit error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch audit logs",
        details: error?.message || String(error),
      },
      { status: 500 },
    );
  }
}
