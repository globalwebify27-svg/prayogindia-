
import { NextResponse } from "next/server";
import { db, isDatabaseAvailable } from "@/lib/db";
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
    200,
    Math.max(1, parseInt(searchParams.get("limit") || "100", 10)),
  );

  if (isDatabaseAvailable()) {
    try {
      const where: any = {};
      if (status && status !== "all") where.status = status;

      if (channel && channel !== "all") {
        if (channel === "MOBILE_APP") {
          where.OR = [
            { orderNumber: { contains: "APP" } },
            { paymentMethod: { contains: "Mobile", mode: "insensitive" } },
          ];
        } else if (channel === "B2B_QUOTATION") {
          where.OR = [
            { quotationId: { not: null } },
            { customerType: "B2B" },
          ];
        } else if (channel === "WALK_IN") {
          where.OR = [
            { customerType: "WALK_IN" },
            { orderNumber: { contains: "POS" } },
            { orderNumber: { contains: "WALK" } },
            { orderNumber: { startsWith: "WI-" } },
            { orderNumber: { startsWith: "ORD-PATNA" } },
            { orderNumber: { startsWith: "ORD-RANCHI" } },
            { orderNumber: { startsWith: "ORD-DELHI" } },
            { shippingAddress: { contains: "Walk-in" } },
            { shippingAddress: { contains: "Store" } },
          ];
        } else if (channel === "WEBSITE") {
          where.NOT = [
            { orderNumber: { contains: "APP" } },
            { orderNumber: { contains: "POS" } },
            { orderNumber: { contains: "WALK" } },
            { orderNumber: { startsWith: "WI-" } },
            { orderNumber: { startsWith: "ORD-PATNA" } },
            { orderNumber: { startsWith: "ORD-RANCHI" } },
            { orderNumber: { startsWith: "ORD-DELHI" } },
            { paymentMethod: { contains: "Mobile", mode: "insensitive" } },
            { quotationId: { not: null } },
            { customerType: "B2B" },
            { customerType: "WALK_IN" },
          ];
        }
      }

      const [items, total] = await Promise.all([
        db.order.findMany({
          where,
          include: {
            user: {
              select: { id: true, name: true, email: true, phone: true, companyName: true },
            },
            items: true,
            shipment: true,
            quotation: {
              select: { id: true, quoteNumber: true, companyName: true },
            },
            invoice: {
              select: { id: true, invoiceNumber: true },
            },
            payment: true,
          },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        db.order.count({ where }),
      ]);

      const enrichedItems = items.map((ord: any) => {
        const isMobileApp =
          ord.orderNumber?.includes("APP") ||
          ord.paymentMethod?.toLowerCase().includes("mobile") ||
          (ord as any).orderSource === "MOBILE_APP" ||
          (ord as any).channel === "MOBILE_APP";

        const isB2B = Boolean(ord.quotationId || ord.customerType === "B2B");
        const isWalkIn =
          ord.customerType === "WALK_IN" ||
          ord.orderSource === "WALK_IN" ||
          (ord as any).channel === "WALK_IN" ||
          ord.orderNumber?.includes("POS") ||
          ord.orderNumber?.includes("WALK") ||
          ord.orderNumber?.startsWith("WI-") ||
          ord.orderNumber?.startsWith("ORD-PATNA") ||
          ord.orderNumber?.startsWith("ORD-RANCHI") ||
          ord.orderNumber?.startsWith("ORD-DELHI") ||
          ord.shippingAddress?.toLowerCase().includes("walk-in") ||
          ord.shippingAddress?.toLowerCase().includes("store");

        const orderSource = isMobileApp
          ? "MOBILE_APP"
          : isB2B
            ? "B2B_QUOTATION"
            : isWalkIn
              ? "WALK_IN"
              : "WEBSITE";

        const channelName = isMobileApp
          ? "📱 Prayog Mobile App"
          : isB2B
            ? "📑 Institutional B2B Quote"
            : isWalkIn
              ? "🏬 Store Walk-in POS"
              : "🌐 Prayog Website Store";

        return {
          ...ord,
          orderSource,
          channelName,
          awbNumber: isWalkIn ? "Counter Handover" : ord.shipment?.trackingNumber || null,
          courierProvider: isWalkIn ? "🏬 In-Store Fulfillment" : ord.shipment?.courierName || "Delhivery Surface",
          weightGm: ord.shipment?.weightKg
            ? Math.round(ord.shipment.weightKg * 1000)
            : 500,
          freightMode: isWalkIn ? "Store Handover" : "Surface Express",
        };
      });

      return NextResponse.json({
        success: true,
        data: {
          items: enrichedItems,
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
    {
      id: "ord-walk-3101",
      orderNumber: "PRG-POS-RANCHI-3101",
      user: {
        name: "Abhinav Singh",
        email: "abhinav.singh@gmail.com",
        phone: "+91 98351 44210",
      },
      customerName: "Abhinav Singh",
      customerPhone: "+91 98351 44210",
      totalAmount: 4850,
      shippingAddress: "🏬 Ranchi Central Hub · In-Store Counter Pickup",
      status: "DELIVERED",
      orderSource: "WALK_IN",
      channelName: "🏬 Store Walk-in POS",
      paymentMethod: "Store Counter UPI",
      paymentStatus: "PAID",
      isPaid: true,
      awbNumber: "Counter Handover",
      courierProvider: "🏬 In-Store Fulfillment",
      freightMode: "Store Handover",
      weightGm: 450,
      items: [
        { name: "Arduino Uno R3 Official Rev3 Board", quantity: 2, price: 1499 },
        { name: "Tower Pro SG90 9g Micro Servo Motor", quantity: 4, price: 189 },
        { name: "HC-SR04 Ultrasonic Distance Sensor", quantity: 2, price: 120 },
      ],
      createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    },
    {
      id: "ord-walk-3102",
      orderNumber: "PRG-POS-PATNA-3102",
      user: {
        name: "Ramesh Sharma",
        email: "ramesh.patna.stem@gmail.com",
        phone: "+91 94312 88450",
      },
      customerName: "Ramesh Sharma",
      customerPhone: "+91 94312 88450",
      totalAmount: 12450,
      shippingAddress: "🏬 Patna STEM & Robotics Branch · In-Store Counter Pickup",
      status: "DELIVERED",
      orderSource: "WALK_IN",
      channelName: "🏬 Store Walk-in POS",
      paymentMethod: "Cash Counter",
      paymentStatus: "PAID",
      isPaid: true,
      awbNumber: "Counter Handover",
      courierProvider: "🏬 In-Store Fulfillment",
      freightMode: "Store Handover",
      weightGm: 650,
      items: [
        { name: "Raspberry Pi 4 Model B (4GB RAM)", quantity: 1, price: 7850 },
        { name: "ESP32 Development Board (Wi-Fi + Bluetooth)", quantity: 5, price: 499 },
        { name: "Raspberry Pi 4 Official Power Supply 15.3W", quantity: 1, price: 950 },
      ],
      createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    },
    {
      id: "ord-walk-3103",
      orderNumber: "PRG-POS-DELHI-3103",
      user: {
        name: "Devendra Mehra",
        email: "d.mehra@delhi-robotics.org",
        phone: "+91 98110 55219",
      },
      customerName: "Devendra Mehra",
      customerPhone: "+91 98110 55219",
      totalAmount: 9200,
      shippingAddress: "🏬 Delhi NCR Innovation Center · In-Store Counter Pickup",
      status: "DELIVERED",
      orderSource: "WALK_IN",
      channelName: "🏬 Store Walk-in POS",
      paymentMethod: "Store Counter UPI",
      paymentStatus: "PAID",
      isPaid: true,
      awbNumber: "Counter Handover",
      courierProvider: "🏬 In-Store Fulfillment",
      freightMode: "Store Handover",
      weightGm: 1200,
      items: [
        { name: "4-DOF Acrylic Robotic Arm Manipulator Kit", quantity: 2, price: 2499 },
        { name: "12V 2A DC Power Adapter for Arduino", quantity: 2, price: 350 },
        { name: "L298N Dual H-Bridge Motor Driver Module", quantity: 4, price: 175 },
      ],
      createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
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
