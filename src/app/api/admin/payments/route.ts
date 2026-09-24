import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedStaff } from "@/lib/staffAuth";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { getSecurityHeaders } from "@/lib/security";

async function getAdminOrStaff() {
  const staff = await getAuthenticatedStaff();
  if (
    staff &&
    (staff.role === "SUPER_ADMIN" ||
      staff.role === "REGIONAL_MANAGER" ||
      staff.role === "STORE_MANAGER")
  ) {
    return staff;
  }
  const admin = await getAuthenticatedAdmin();
  if (admin) {
    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: "SUPER_ADMIN" as const,
      storeId: null,
    };
  }
  return null;
}

/**
 * GET /api/admin/payments
 * Lists customer payments (NEFT, RTGS, Bank Transfer, Razorpay) with filters:
 * - status: 'all' | 'PENDING_VERIFICATION' | 'PAID' | 'VERIFIED' | 'REJECTED' | 'PENDING'
 * - method: 'all' | 'NEFT' | 'RTGS' | 'bank_transfer' | 'UPI' | 'card'
 * - search: query across UTR number, Order number, Customer name, Customer email
 * - page & limit
 */
export async function GET(req: NextRequest) {
  const headers = getSecurityHeaders();
  const staff = await getAdminOrStaff();

  if (!staff) {
    return NextResponse.json(
      {
        success: false,
        message: "Forbidden: Admin or Accounts permission required.",
      },
      { status: 403, headers },
    );
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "all";
  const method = searchParams.get("method") || "all";
  const search = searchParams.get("search")?.trim().toLowerCase() || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(
    50,
    Math.max(1, parseInt(searchParams.get("limit") || "15", 10)),
  );

  if (process.env.DATABASE_URL) {
    try {
      const where: any = {};

      if (status !== "all") {
        if (status === "PENDING_VERIFICATION") {
          where.status = { in: ["PENDING_VERIFICATION", "PENDING"] };
        } else if (status === "VERIFIED" || status === "PAID") {
          where.status = { in: ["PAID", "VERIFIED"] };
        } else {
          where.status = status;
        }
      }

      if (method !== "all") {
        if (method === "OFFLINE" || method === "WIRE") {
          where.method = { in: ["NEFT", "RTGS", "bank_transfer", "UPI_WIRE"] };
        } else {
          where.method = { contains: method, mode: "insensitive" };
        }
      }

      if (search) {
        where.OR = [
          { utrNumber: { contains: search, mode: "insensitive" } },
          { order: { orderNumber: { contains: search, mode: "insensitive" } } },
          {
            order: {
              user: { name: { contains: search, mode: "insensitive" } },
            },
          },
          {
            order: {
              user: { email: { contains: search, mode: "insensitive" } },
            },
          },
          {
            order: {
              user: { phone: { contains: search, mode: "insensitive" } },
            },
          },
        ];
      }

      const [items, total, pendingCount, verifiedTotal] = await Promise.all([
        db.payment.findMany({
          where,
          include: {
            order: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    companyName: true,
                    gstin: true,
                    customerType: true,
                  },
                },
                items: true,
                invoice: { select: { invoiceNumber: true, id: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        db.payment.count({ where }),
        db.payment.count({
          where: { status: { in: ["PENDING_VERIFICATION", "PENDING"] } },
        }),
        db.payment.aggregate({
          where: { status: { in: ["PAID", "VERIFIED"] } },
          _sum: { amount: true },
        }),
      ]);

      return NextResponse.json(
        {
          success: true,
          data: {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            summary: {
              pendingVerificationCount: pendingCount,
              totalVerifiedAmount: verifiedTotal._sum.amount || 0,
            },
          },
        },
        { headers },
      );
    } catch (error: any) {
      console.error("[Admin Payments API Error]:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500, headers },
      );
    }
  }

  // Fallback Mock data for dev
  const mockItems = [
    {
      id: "pay-mock-001",
      orderId: "ord-mock-8841",
      order: {
        id: "ord-mock-8841",
        orderNumber: "PRG-2026-8841",
        totalAmount: 48900,
        subtotal: 41440,
        gstAmount: 7460,
        status: "PROCESSING",
        paymentStatus: "PENDING",
        user: {
          name: "Dr. Amitabh Verma",
          email: "amitabh.verma@iitb.ac.in",
          phone: "+91 98112 34567",
          companyName: "IIT Bombay Robotics Lab",
          gstin: "27AAATI1234F1Z5",
          customerType: "B2B",
        },
        items: [
          {
            productName: "STM32 Nucleo Development Board",
            quantity: 6,
            price: 4200,
          },
          {
            productName: "High Precision Lidar Sensor Kit",
            quantity: 2,
            price: 5850,
          },
        ],
      },
      amount: 48900,
      currency: "INR",
      method: "NEFT",
      status: "PENDING_VERIFICATION",
      utrNumber: "SBIN829102938475",
      transactionDate: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      submittedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      customerRemarks:
        "Payment for PO #IITB-ROB-2026-09 via SBI Corporate Banking",
      createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    },
    {
      id: "pay-mock-002",
      orderId: "ord-mock-9920",
      order: {
        id: "ord-mock-9920",
        orderNumber: "PRG-2026-9920",
        totalAmount: 145000,
        subtotal: 122880,
        gstAmount: 22120,
        status: "PROCESSING",
        paymentStatus: "PENDING",
        user: {
          name: "Rajesh Khandelwal",
          email: "rajesh@aerodrones.in",
          phone: "+91 94311 88200",
          companyName: "AeroDrones India Pvt Ltd",
          gstin: "20AABCA9876E1ZT",
          customerType: "B2B",
        },
        items: [
          {
            productName: "Pixhawk 6X Autopilot Flight Controller",
            quantity: 5,
            price: 29000,
          },
        ],
      },
      amount: 145000,
      currency: "INR",
      method: "RTGS",
      status: "PENDING_VERIFICATION",
      utrNumber: "HDFCR20260921008129",
      transactionDate: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      submittedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      customerRemarks: "100% advance RTGS transfer from HDFC Current A/C",
      createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    },
  ];

  return NextResponse.json(
    {
      success: true,
      data: {
        items: mockItems,
        total: mockItems.length,
        page: 1,
        limit: 15,
        totalPages: 1,
        summary: {
          pendingVerificationCount: 2,
          totalVerifiedAmount: 320000,
        },
      },
    },
    { headers },
  );
}
