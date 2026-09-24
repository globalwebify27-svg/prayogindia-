import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedStaff } from "@/lib/staffAuth";
import { getSecurityHeaders } from "@/lib/security";

// GET /api/admin/crm/dashboard — Aggregated B2B CRM Overview KPIs
export async function GET(request: Request) {
  const headers = getSecurityHeaders();
  const staff = await getAuthenticatedStaff();

  if (
    !staff ||
    (staff.role !== "SUPER_ADMIN" &&
      staff.role !== "REGIONAL_MANAGER" &&
      staff.role !== "STORE_MANAGER")
  ) {
    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403, headers },
    );
  }

  if (process.env.DATABASE_URL) {
    try {
      const where: any = {};

      // Role-based store isolation
      if (staff.role === "STORE_MANAGER" && staff.storeId) {
        where.assignedStoreId = staff.storeId;
      } else if (
        staff.role === "REGIONAL_MANAGER" &&
        staff.allowedStoreCodes?.length
      ) {
        const regionalStores = await db.store.findMany({
          where: { code: { in: staff.allowedStoreCodes } },
          select: { id: true },
        });
        where.assignedStoreId = { in: regionalStores.map((s) => s.id) };
      }

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [
        totalCompanies,
        activeCustomers,
        prospects,
        pendingFollowUps,
        overdueFollowUps,
        monthlyQuotes,
        monthlyB2BOrders,
      ] = await Promise.all([
        db.b2BCompany.count({ where }),
        db.b2BCompany.count({ where: { ...where, status: "ACTIVE_CUSTOMER" } }),
        db.b2BCompany.count({
          where: {
            ...where,
            status: { in: ["PROSPECT", "LEAD", "NEGOTIATION"] },
          },
        }),
        db.b2BFollowUp.count({
          where: {
            status: "PENDING",
            dueDate: { gte: now },
            company: where.assignedStoreId
              ? { assignedStoreId: where.assignedStoreId }
              : undefined,
          },
        }),
        db.b2BFollowUp.count({
          where: {
            status: "PENDING",
            dueDate: { lt: now },
            company: where.assignedStoreId
              ? { assignedStoreId: where.assignedStoreId }
              : undefined,
          },
        }),
        db.quotation.count({
          where: {
            createdAt: { gte: startOfMonth },
          },
        }),
        db.order.findMany({
          where: {
            customerType: "B2B",
            createdAt: { gte: startOfMonth },
          },
          select: { totalAmount: true },
        }),
      ]);

      const monthlySales = monthlyB2BOrders.reduce(
        (sum, o) => sum + o.totalAmount,
        0,
      );

      return NextResponse.json(
        {
          success: true,
          data: {
            totalCompanies,
            activeCustomers,
            prospects,
            pendingFollowUps,
            overdueFollowUps,
            monthlyQuotes,
            monthlyB2BOrders: monthlyB2BOrders.length,
            monthlySales,
          },
        },
        { headers },
      );
    } catch (error: any) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500, headers },
      );
    }
  }

  return NextResponse.json(
    {
      success: true,
      data: {
        totalCompanies: 0,
        activeCustomers: 0,
        prospects: 0,
        pendingFollowUps: 0,
        overdueFollowUps: 0,
        monthlyQuotes: 0,
        monthlyB2BOrders: 0,
        monthlySales: 0,
      },
    },
    { headers },
  );
}
