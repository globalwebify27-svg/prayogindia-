import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { LogisticsEngine } from "@/lib/logisticsEngine";
import { getSecurityHeaders } from "@/lib/security";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";

/**
 * GET /api/admin/logistics
 * Fetch all shipments from database with filters, search, and pagination
 */
export async function GET(request: Request) {
  const headers = getSecurityHeaders();
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers },
    );
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const courier = searchParams.get("courier");
  const search = searchParams.get("search")?.trim();
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.max(
    1,
    Math.min(50, parseInt(searchParams.get("limit") || "20")),
  );
  const skip = (page - 1) * limit;

  try {
    const where: any = {};
    if (status && status !== "All") {
      where.status = status;
    }
    if (courier && courier !== "All") {
      where.courierCode = courier;
    }
    if (search) {
      where.OR = [
        { trackingNumber: { contains: search, mode: "insensitive" } },
        { order: { orderNumber: { contains: search, mode: "insensitive" } } },
        {
          order: { user: { name: { contains: search, mode: "insensitive" } } },
        },
        {
          order: { user: { phone: { contains: search, mode: "insensitive" } } },
        },
      ];
    }

    const [shipments, totalCount, ordersReadyForShipment] = await Promise.all([
      db.shipment.findMany({
        where,
        include: {
          order: {
            include: {
              user: {
                select: { id: true, name: true, email: true, phone: true },
              },
              items: {
                select: {
                  id: true,
                  productName: true,
                  quantity: true,
                  price: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.shipment.count({ where }),
      db.order.findMany({
        where: {
          status: { in: ["ORDER_PLACED", "PROCESSING", "PACKED"] },
          shipment: null,
        },
        select: {
          id: true,
          orderNumber: true,
          totalAmount: true,
          createdAt: true,
          user: { select: { name: true, phone: true } },
        },
        take: 20,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // Statistics aggregates
    const [
      totalManifested,
      totalInTransit,
      totalOutForDelivery,
      totalDelivered,
    ] = await Promise.all([
      db.shipment.count(),
      db.shipment.count({ where: { status: "In Transit" } }),
      db.shipment.count({ where: { status: "Out for Delivery" } }),
      db.shipment.count({ where: { status: "Delivered" } }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: shipments,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
        stats: {
          totalManifested,
          totalInTransit,
          totalOutForDelivery,
          totalDelivered,
        },
        pendingOrders: ordersReadyForShipment,
      },
      { headers },
    );
  } catch (error: any) {
    console.error("[Admin Logistics GET Error]", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch shipments.",
      },
      { status: 500, headers },
    );
  }
}

/**
 * POST /api/admin/logistics
 * Create Shipment Manifest & Generate AWB
 */
export async function POST(request: Request) {
  const headers = getSecurityHeaders();
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers },
    );
  }

  try {
    const body = await request.json();
    const {
      orderId,
      courierCode,
      weightKg,
      lengthCm,
      breadthCm,
      heightCm,
      customAwb,
    } = body;

    if (!orderId || !courierCode) {
      return NextResponse.json(
        { success: false, message: "orderId and courierCode are required." },
        { status: 400, headers },
      );
    }

    const shipment = await LogisticsEngine.createShipment({
      orderId,
      courierCode,
      weightKg: weightKg ? parseFloat(weightKg) : 0.5,
      lengthCm: lengthCm ? parseFloat(lengthCm) : 20,
      breadthCm: breadthCm ? parseFloat(breadthCm) : 15,
      heightCm: heightCm ? parseFloat(heightCm) : 10,
      customAwb,
      actor: admin,
      req: request,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Shipment created with AWB ${shipment.trackingNumber}`,
        data: shipment,
      },
      { headers },
    );
  } catch (error: any) {
    console.error("[Admin Logistics POST Error]", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create shipment.",
      },
      { status: 500, headers },
    );
  }
}
