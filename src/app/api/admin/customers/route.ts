import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";

// GET /api/admin/customers — List all customers with stats
export async function GET(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const type = searchParams.get("type") || "all";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const skip = (page - 1) * limit;

  if (process.env.DATABASE_URL) {
    try {
      const where: any = {};

      if (type !== "all") {
        where.customerType = type;
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { phone: { contains: search } },
          { companyName: { contains: search, mode: "insensitive" } },
        ];
      }

      const [customers, total] = await Promise.all([
        db.user.findMany({
          where,
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            customerType: true,
            companyName: true,
            gstin: true,
            rewardPoints: true,
            createdAt: true,
            _count: {
              select: {
                orders: true,
                tickets: true,
              },
            },
            orders: {
              select: { totalAmount: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: limit,
          skip,
        }),
        db.user.count({ where }),
      ]);

      // Compute total spent per customer
      const customersWithStats = customers.map((c) => ({
        ...c,
        totalOrders: c._count.orders,
        totalSpent: c.orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0),
        openTickets: c._count.tickets,
        orders: undefined,
        _count: undefined,
      }));

      return NextResponse.json({
        success: true,
        data: customersWithStats,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
      });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true, data: [], pagination: { total: 0, page: 1, limit, pages: 0 } });
}
