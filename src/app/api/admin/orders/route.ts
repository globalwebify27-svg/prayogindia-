import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { MOCK_CUSTOMER_ORDERS } from "@/data/accountData";

// GET /api/admin/orders - List All Orders for Super Admin Management
export async function GET(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const channel = searchParams.get("channel"); // 'all' | 'WEBSITE' | 'MOBILE_APP' | 'WALK_IN'
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(
    50,
    Math.max(1, parseInt(searchParams.get("limit") || "15", 10)),
  );

  if (process.env.DATABASE_URL) {
    try {
      const where: any = {};
      if (status && status !== "all") where.status = status;

      const [items, total] = await Promise.all([
        db.order.findMany({
          where,
          include: {
            user: {
              select: { id: true, name: true, email: true, phone: true },
            },
            items: true,
            shipment: true,
          },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        db.order.count({ where }),
      ]);

      return NextResponse.json({
        success: true,
        data: {
          items,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 },
      );
    }
  }

  // Enriched Super Admin Order Feed with Website & Mobile App & Walk-in Channels
  const enrichedOrders = [
    {
      id: "ord-web-8841",
      orderNumber: "PRG-WEB-2026-8841",
      user: {
        name: "Dr. Amitabh Verma",
        email: "amitabh.verma@iitb.ac.in",
        phone: "+91 98112 34567",
      },
      totalAmount: 18450,
      shippingAddress:
        "Department of Electrical Engineering, IIT Bombay, Powai, Mumbai - 400076",
      status: "PROCESSING",
      orderSource: "WEBSITE",
      channelName: "🌐 Prayog Website Store",
      paymentMethod: "UPI / Razorpay",
      isPaid: true,
      items: [
        { name: "STM32 Nucleo Development Board", quantity: 3, price: 4200 },
        { name: "High Precision Lidar Sensor Kit", quantity: 1, price: 5850 },
      ],
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    {
      id: "ord-app-9920",
      orderNumber: "PRG-APP-2026-9920",
      user: {
        name: "Pooja Hegde",
        email: "pooja.iot.dev@gmail.com",
        phone: "+91 97410 88219",
      },
      totalAmount: 6840,
      shippingAddress:
        "Flat 402, Green Glen Layout, Bellandur, Bengaluru, Karnataka - 560103",
      status: "SHIPPED",
      orderSource: "MOBILE_APP",
      channelName: "📱 Prayog Mobile App",
      paymentMethod: "Credit Card",
      isPaid: true,
      items: [
        { name: "ESP32-S3 AI Development Kit", quantity: 2, price: 2400 },
        {
          name: "OLED Display 0.96 inch I2C (Pack of 4)",
          quantity: 1,
          price: 2040,
        },
      ],
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    },
    {
      id: "ord-web-8839",
      orderNumber: "PRG-WEB-2026-8839",
      user: {
        name: "Kunal Singhania",
        email: "kunal.singhania@delhi-tech.edu",
        phone: "+91 98991 22340",
      },
      totalAmount: 32400,
      shippingAddress:
        "Hostel 4, Room 210, Delhi Technological University, Shahbad Daulatpur, Delhi - 110042",
      status: "PAYMENT_CONFIRMED",
      orderSource: "WEBSITE",
      channelName: "🌐 Prayog Website Store",
      paymentMethod: "Net Banking (HDFC)",
      isPaid: true,
      items: [
        {
          name: "Pixhawk 4 Autopilot Flight Controller",
          quantity: 1,
          price: 28500,
        },
        { name: "Telemetry Radio Set 433MHz", quantity: 1, price: 3900 },
      ],
      createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    },
    {
      id: "ord-app-9915",
      orderNumber: "PRG-APP-2026-9915",
      user: {
        name: "Rohan Deshmukh",
        email: "rohan.robotics@pune.ac.in",
        phone: "+91 94220 11984",
      },
      totalAmount: 4950,
      shippingAddress: "Shivajinagar, Model Colony, Pune, Maharashtra - 411016",
      status: "ORDER_PLACED",
      orderSource: "MOBILE_APP",
      channelName: "📱 Prayog Mobile App",
      paymentMethod: "UPI (PhonePe)",
      isPaid: true,
      items: [
        {
          name: "Arduino Nano V3 with Type-C (Pack of 5)",
          quantity: 1,
          price: 2950,
        },
        { name: "SG90 Micro Servo Motors (10pcs)", quantity: 1, price: 2000 },
      ],
      createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    },
    ...MOCK_CUSTOMER_ORDERS.map((o) => ({
      ...o,
      orderSource: "WEBSITE",
      channelName: "🌐 Prayog Website Store",
    })),
  ];

  const filtered = enrichedOrders.filter((o) => {
    if (status && status !== "all" && o.status !== status) return false;
    if (channel && channel !== "all" && o.orderSource !== channel) return false;
    return true;
  });

  return NextResponse.json({
    success: true,
    data: {
      items: filtered,
      total: filtered.length,
      page: 1,
      limit,
      totalPages: Math.ceil(filtered.length / limit) || 1,
    },
  });
}
