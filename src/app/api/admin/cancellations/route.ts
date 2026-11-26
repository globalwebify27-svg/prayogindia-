export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { db, isDatabaseAvailable } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { OrderStatus } from "@prisma/client";

/**
 * GET /api/admin/cancellations
 * List all cancelled orders with cancellation records, filters, search, and analytics.
 */
export async function GET(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json(
      { success: false, message: "Forbidden: Admin access required" },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim();
  const datePreset = searchParams.get("datePreset") || "all";
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const paymentMethodFilter = searchParams.get("paymentMethod");
  const cancellationReasonFilter = searchParams.get("reason");
  const refundStatusFilter = searchParams.get("refundStatus");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25", 10)));

  if (!isDatabaseAvailable()) {
    // Mock / Development Fallback Data
    const mockItems = [
      {
        id: "can-demo-1",
        orderId: "ord-demo-101",
        orderNumber: "PRG-2026-3230",
        cancellationReferenceId: "CAN-2026-894120",
        customerName: "Om Kumar",
        customerEmail: "ankushraj07777@gmail.com",
        customerPhone: "+91 87097 89641",
        productName: "Arduino UNO R3 Official Rev3 Board (ATmega328P)",
        productSku: "PRG-ARD-001-STD",
        quantity: 1,
        orderAmount: 1499,
        paymentMethod: "UPI (Online)",
        orderDate: new Date(Date.now() - 3600000 * 24).toISOString(),
        cancellationDate: new Date().toISOString(),
        cancellationReason: "Ordered by mistake",
        cancellationComment: "Selected wrong microcontroller variant by accident.",
        cancellationInitiatedBy: "Customer",
        previousOrderStatus: "ORDER_PLACED",
        cancellationStatus: "CONFIRMED",
        refundStatus: "Refund Initiated",
        refundAmount: 1499,
        refundTransactionId: "RFD-TXN-8849102",
        inventoryRestorationStatus: "RESTORED",
      },
      {
        id: "can-demo-2",
        orderId: "ord-demo-102",
        orderNumber: "PRG-2026-2643",
        cancellationReferenceId: "CAN-2026-442190",
        customerName: "Rajesh Sharma",
        customerEmail: "rajesh.robotics@gmail.com",
        customerPhone: "+91 98351 22440",
        productName: "Pixhawk 6C Autopilot Flight Controller Unit",
        productSku: "PRG-UAV-601",
        quantity: 1,
        orderAmount: 14500,
        paymentMethod: "Cash on Delivery",
        orderDate: new Date(Date.now() - 3600000 * 48).toISOString(),
        cancellationDate: new Date(Date.now() - 3600000 * 12).toISOString(),
        cancellationReason: "Delivery is taking too long",
        cancellationComment: "Needed for college event happening this weekend.",
        cancellationInitiatedBy: "Customer",
        previousOrderStatus: "PROCESSING",
        cancellationStatus: "CONFIRMED",
        refundStatus: "Not Applicable",
        refundAmount: 0,
        refundTransactionId: null,
        inventoryRestorationStatus: "RESTORED",
      },
      {
        id: "can-demo-3",
        orderId: "ord-demo-103",
        orderNumber: "PRG-2026-1956",
        cancellationReferenceId: "CAN-2026-310892",
        customerName: "Priya Singh",
        customerEmail: "priya.stem@outlook.com",
        customerPhone: "+91 70041 88921",
        productName: "Raspberry Pi 4 Model B (8GB RAM)",
        productSku: "PRG-RPI-008",
        quantity: 2,
        orderAmount: 17800,
        paymentMethod: "Credit Card",
        orderDate: new Date(Date.now() - 3600000 * 72).toISOString(),
        cancellationDate: new Date(Date.now() - 3600000 * 30).toISOString(),
        cancellationReason: "Found a better price elsewhere",
        cancellationComment: "Got bulk institution discount from local supplier.",
        cancellationInitiatedBy: "Customer",
        previousOrderStatus: "PACKED",
        cancellationStatus: "CONFIRMED",
        refundStatus: "Refund Completed",
        refundAmount: 17800,
        refundTransactionId: "RFD-TXN-9912041",
        inventoryRestorationStatus: "RESTORED",
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        items: mockItems,
        total: mockItems.length,
        page: 1,
        limit,
        totalPages: 1,
        metrics: {
          totalCancelledOrders: 3,
          cancellationRate: 4.8,
          totalCancelledRevenue: 33799,
          codCount: 1,
          prepaidCount: 2,
          pendingRefundsCount: 1,
          completedRefundsCount: 1,
          topReasons: [
            { reason: "Ordered by mistake", count: 1, percentage: 33.3 },
            { reason: "Delivery is taking too long", count: 1, percentage: 33.3 },
            { reason: "Found a better price elsewhere", count: 1, percentage: 33.3 },
          ],
        },
        stats: {
          totalCancelledOrders: 3,
          cancellationRate: "4.8%",
          totalCancelledRevenue: 33799,
          codCancellationCount: 1,
          prepaidCancellationCount: 2,
          pendingRefundsCount: 1,
          completedRefundsCount: 1,
          topReasons: [
            { reason: "Ordered by mistake", count: 1, percentage: "33.3%" },
            { reason: "Delivery is taking too long", count: 1, percentage: "33.3%" },
            { reason: "Found a better price elsewhere", count: 1, percentage: "33.3%" },
          ],
        },
      },
    });
  }

  try {
    // 1. Build dynamic Prisma where clause
    const where: any = {};

    // Date filtering on cancellationDate
    const now = new Date();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    if (datePreset === "today") {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      where.cancellationDate = { gte: todayStart };
    } else if (datePreset === "last_7_days") {
      const weekStart = new Date(now.getTime() - 7 * ONE_DAY_MS);
      where.cancellationDate = { gte: weekStart };
    } else if (datePreset === "last_30_days") {
      const monthStart = new Date(now.getTime() - 30 * ONE_DAY_MS);
      where.cancellationDate = { gte: monthStart };
    } else if (datePreset === "custom" && (startDate || endDate)) {
      where.cancellationDate = {};
      if (startDate) where.cancellationDate.gte = new Date(startDate);
      if (endDate) {
        const endD = new Date(endDate);
        endD.setHours(23, 59, 59, 999);
        where.cancellationDate.lte = endD;
      }
    }

    if (cancellationReasonFilter && cancellationReasonFilter !== "all") {
      where.cancellationReason = cancellationReasonFilter;
    }

    if (refundStatusFilter && refundStatusFilter !== "all") {
      where.refundStatus = refundStatusFilter;
    }

    // Search query matching Order ID, Ref ID, Customer Name, Email
    if (search) {
      where.OR = [
        { cancellationReferenceId: { contains: search, mode: "insensitive" } },
        { order: { orderNumber: { contains: search, mode: "insensitive" } } },
        { order: { user: { name: { contains: search, mode: "insensitive" } } } },
        { order: { user: { email: { contains: search, mode: "insensitive" } } } },
        { order: { user: { phone: { contains: search, mode: "insensitive" } } } },
      ];
    }

    if (paymentMethodFilter && paymentMethodFilter !== "all") {
      where.order = {
        ...(where.order || {}),
        paymentMethod: { contains: paymentMethodFilter, mode: "insensitive" },
      };
    }

    // 2. Fetch paginated cancellation records with full relations
    const [cancellations, totalCount, totalOrdersAll] = await Promise.all([
      db.orderCancellation.findMany({
        where,
        orderBy: { cancellationDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          order: {
            include: {
              user: true,
              items: {
                include: {
                  product: true,
                },
              },
              payment: true,
              shipment: true,
            },
          },
        },
      }),
      db.orderCancellation.count({ where }),
      db.order.count().catch(() => 0),
    ]);

    // Format rows for table consumption
    const formattedItems = cancellations.map((c) => {
      const ord = c.order;
      const firstItem = ord?.items?.[0];
      const extraItems = (ord?.items?.length || 1) - 1;

      return {
        id: c.id,
        orderId: ord?.id,
        orderNumber: ord?.orderNumber || "Unknown",
        cancellationReferenceId: c.cancellationReferenceId,
        customerName: ord?.user?.name || "Customer",
        customerEmail: ord?.user?.email || "N/A",
        customerPhone: ord?.user?.phone || "N/A",
        productName: firstItem
          ? `${firstItem.productName}${extraItems > 0 ? ` (+${extraItems} more)` : ""}`
          : "Ordered Hardware Items",
        productSku: firstItem?.productSku || "N/A",
        quantity: ord?.items?.reduce((acc, it) => acc + it.quantity, 0) || 1,
        orderAmount: ord?.totalAmount || 0,
        paymentMethod: ord?.paymentMethod || "Prepaid",
        orderDate: ord?.createdAt?.toISOString() || new Date().toISOString(),
        cancellationDate: c.cancellationDate.toISOString(),
        cancellationReason: c.cancellationReason,
        cancellationComment: c.cancellationComment,
        cancellationInitiatedBy: c.cancellationInitiatedBy,
        previousOrderStatus: c.previousOrderStatus,
        cancellationStatus: c.cancellationStatus,
        refundStatus: c.refundStatus,
        refundAmount: c.refundAmount,
        refundTransactionId: c.refundTransactionId,
        inventoryRestorationStatus: c.inventoryRestorationStatus,
        adminRemarks: c.adminRemarks,
      };
    });

    // 3. Compute High-Level Metrics
    const allCancellationsForStats = await db.orderCancellation.findMany({
      include: {
        order: { select: { totalAmount: true, paymentMethod: true } },
      },
    });

    let totalCancelledRevenue = 0;
    let codCount = 0;
    let prepaidCount = 0;
    let pendingRefundsCount = 0;
    let completedRefundsCount = 0;
    const reasonCounts: Record<string, number> = {};

    allCancellationsForStats.forEach((c) => {
      totalCancelledRevenue += c.order?.totalAmount || 0;
      const pm = (c.order?.paymentMethod || "").toLowerCase();
      if (pm.includes("cod") || pm.includes("cash")) {
        codCount++;
      } else {
        prepaidCount++;
      }

      if (c.refundStatus?.includes("Initiated") || c.refundStatus?.includes("Pending") || c.refundStatus?.includes("Processing")) {
        pendingRefundsCount++;
      } else if (c.refundStatus?.includes("Completed")) {
        completedRefundsCount++;
      }

      reasonCounts[c.cancellationReason] = (reasonCounts[c.cancellationReason] || 0) + 1;
    });

    const totalStatsCount = allCancellationsForStats.length;
    const cancellationRate = totalOrdersAll > 0
      ? ((totalStatsCount / totalOrdersAll) * 100).toFixed(1) + "%"
      : "0.0%";

    const topReasons = Object.entries(reasonCounts)
      .map(([reason, count]) => ({
        reason,
        count,
        percentage: totalStatsCount > 0 ? ((count / totalStatsCount) * 100).toFixed(1) + "%" : "0%",
      }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      success: true,
      data: {
        items: formattedItems,
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit) || 1,
        stats: {
          totalCancelledOrders: totalStatsCount,
          cancellationRate,
          totalCancelledRevenue,
          codCancellationCount: codCount,
          prepaidCancellationCount: prepaidCount,
          pendingRefundsCount,
          completedRefundsCount,
          topReasons,
        },
      },
    });
  } catch (error: any) {
    console.warn("[AdminCancellationsGET] Offline fallback active:", error?.message);
    const mockItems = [
      {
        id: "can-demo-1",
        orderId: "ord-demo-101",
        orderNumber: "PRG-2026-3230",
        cancellationReferenceId: "CAN-2026-894120",
        customerName: "Om Kumar",
        customerEmail: "ankushraj07777@gmail.com",
        customerPhone: "+91 87097 89641",
        productName: "Arduino UNO R3 Official Rev3 Board (ATmega328P)",
        productSku: "PRG-ARD-001-STD",
        quantity: 1,
        orderAmount: 1499,
        paymentMethod: "UPI",
        orderDate: new Date(Date.now() - 3600000 * 24).toISOString(),
        cancellationDate: new Date(Date.now() - 3600000 * 2).toISOString(),
        cancellationReason: "Ordered by mistake",
        cancellationComment: "Selected wrong revision. Intended to purchase ESP32.",
        cancellationInitiatedBy: "Customer",
        previousOrderStatus: "ORDER_PLACED",
        cancellationStatus: "CONFIRMED",
        refundStatus: "Refund Initiated",
        refundAmount: 1499,
        refundTransactionId: "RFD-TXN-8891230",
        inventoryRestorationStatus: "RESTORED",
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        items: mockItems,
        total: mockItems.length,
        page: 1,
        limit,
        totalPages: 1,
        metrics: {
          totalCancelledOrders: 1,
          cancellationRate: 3.5,
          totalCancelledRevenue: 1499,
          codCount: 0,
          prepaidCount: 1,
          pendingRefundsCount: 1,
          completedRefundsCount: 0,
          topReasons: [{ reason: "Ordered by mistake", count: 1, percentage: 100 }],
        },
        stats: {
          totalCancelledOrders: 1,
          cancellationRate: "3.5%",
          totalCancelledRevenue: 1499,
          codCancellationCount: 0,
          prepaidCancellationCount: 1,
          pendingRefundsCount: 1,
          completedRefundsCount: 0,
          topReasons: [{ reason: "Ordered by mistake", count: 1, percentage: "100%" }],
        },
      },
    });
  }
}
