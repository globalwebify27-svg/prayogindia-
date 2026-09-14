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

    const isSuperAdmin = (admin?.role as string) === "SUPER_ADMIN" || (admin?.role as string) === "ADMIN" || staff?.role === "SUPER_ADMIN";
    const isRegional = staff?.role === "REGIONAL_MANAGER";

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") as AuditActionCategory | null;
    const search = searchParams.get("search")?.trim() || "";
    const storeIdParam = searchParams.get("storeId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {};

    if (isSuperAdmin) {
      if (storeIdParam && storeIdParam !== "ALL") {
        where.storeId = storeIdParam;
      }
    } else if (isRegional) {
      const allowedCodes = staff?.allowedStoreCodes || [];
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
      if (!staff?.storeId) {
        return NextResponse.json({ error: "Forbidden: No assigned store context" }, { status: 403 });
      }
      where.storeId = staff.storeId;
    }

    if (category && Object.values(AuditActionCategory).includes(category)) {
      where.actionCategory = category;
    }

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

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 2000, // Export up to 2,000 records safely
      include: {
        store: {
          select: { name: true, code: true },
        },
      },
    });

    const headers = [
      "ID",
      "Timestamp",
      "Category",
      "Action",
      "Entity Type",
      "Entity ID",
      "Description",
      "Actor Name",
      "Actor Role",
      "Actor Email",
      "Store Code",
      "Store Name",
      "IP Address",
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = logs.map((log) => [
      escapeCsv(log.id),
      escapeCsv(log.createdAt.toISOString()),
      escapeCsv(log.actionCategory),
      escapeCsv(log.action),
      escapeCsv(log.entityType),
      escapeCsv(log.entityId),
      escapeCsv(log.description),
      escapeCsv(log.actorName),
      escapeCsv(log.actorRole),
      escapeCsv(log.actorEmail || ""),
      escapeCsv(log.store?.code || "GLOBAL"),
      escapeCsv(log.store?.name || "Global / Central"),
      escapeCsv(log.ipAddress || ""),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="audit_logs_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error: any) {
    console.error("GET /api/admin/audit/export error:", error);
    return NextResponse.json({ error: "Failed to export audit logs" }, { status: 500 });
  }
}
