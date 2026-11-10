import { NextResponse } from "next/server";
import { getAuthenticatedStaff, hasStoreAccess } from "@/lib/staffAuth";
import { db, isDatabaseAvailable } from "@/lib/db";
import { getSecurityHeaders } from "@/lib/security";
import {
  validateCartForStore,
  deductStoreInventory,
  getProductPriceForStore,
} from "@/lib/inventoryEngine";
import { StoreId, STORES } from "@/data/storeConfig";

// Initial seed orders for each branch (Patna, Ranchi, Delhi)
const INITIAL_STORE_ORDERS: any[] = [
  // ─── PATNA STORE WALK-IN & COUNTER ORDERS ───
  {
    id: "ORD-PATNA-2026-9041",
    invoiceNo: "POS-PAT-10821",
    orderNumber: "PRG-POS-PATNA-3102",
    storeId: "patna",
    storeCode: "PATNA",
    storeLocation: "Prayog India Patna Robotics & STEM Branch",
    customerName: "Ramesh Sharma",
    customerPhone: "+91 94312 88450",
    customerEmail: "ramesh.patna.stem@gmail.com",
    customerType: "WALK_IN",
    orderSource: "WALK_IN",
    channelName: "🏬 Store Walk-in POS",
    paymentMethod: "CASH",
    paymentStatus: "PAID",
    isPaid: true,
    orderStatus: "DELIVERED",
    status: "PAID & BILLED",
    subtotal: 11295,
    discount: 0,
    gstAmount: 2033.1,
    totalAmount: 13328,
    grandTotal: 13328,
    items: [
      {
        productId: "prd-rpi4-4gb",
        name: "Raspberry Pi 4 Model B (4GB RAM)",
        sku: "PRG-2026-RPI-004",
        quantity: 1,
        unitPrice: 7850,
        total: 7850,
      },
      {
        productId: "prd-esp32-wroom",
        name: "ESP32 Development Board (Wi-Fi + Bluetooth)",
        sku: "PRG-2026-ESP-032",
        quantity: 5,
        unitPrice: 499,
        total: 2495,
      },
      {
        productId: "prd-rpi-pwr",
        name: "Raspberry Pi 4 Official Power Supply 15.3W",
        sku: "PRG-2026-ACC-012",
        quantity: 1,
        unitPrice: 950,
        total: 950,
      },
    ],
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: "ORD-PATNA-2026-9042",
    invoiceNo: "POS-PAT-10822",
    orderNumber: "PRG-POS-PATNA-3105",
    storeId: "patna",
    storeCode: "PATNA",
    storeLocation: "Prayog India Patna Robotics & STEM Branch",
    customerName: "Prof. Rajesh Sahay",
    customerPhone: "+91 94310 77120",
    customerEmail: "rajesh.sahay@nitp.ac.in",
    customerType: "WALK_IN",
    orderSource: "WALK_IN",
    channelName: "🏬 Store Walk-in POS",
    paymentMethod: "UPI",
    paymentStatus: "PAID",
    isPaid: true,
    orderStatus: "DELIVERED",
    status: "PAID & BILLED",
    subtotal: 5118,
    discount: 0,
    gstAmount: 921.24,
    totalAmount: 6039,
    grandTotal: 6039,
    items: [
      {
        productId: "prd-ard-mega",
        name: "Arduino Mega 2560 R3 Official Board",
        sku: "PRG-2026-ARD-256",
        quantity: 2,
        unitPrice: 1899,
        total: 3798,
      },
      {
        productId: "prd-drv-l298n",
        name: "L298N Dual H-Bridge Motor Driver Module",
        sku: "PRG-2026-DRV-298",
        quantity: 4,
        unitPrice: 210,
        total: 840,
      },
      {
        productId: "prd-sns-hc04",
        name: "HC-SR04 Ultrasonic Distance Sensor",
        sku: "PRG-2026-SNS-004",
        quantity: 4,
        unitPrice: 120,
        total: 480,
      },
    ],
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  },
  {
    id: "ORD-PATNA-2026-9043",
    invoiceNo: "POS-PAT-10823",
    orderNumber: "PRG-POS-PATNA-3108",
    storeId: "patna",
    storeCode: "PATNA",
    storeLocation: "Prayog India Patna Robotics & STEM Branch",
    customerName: "Priya Kumari",
    customerPhone: "+91 91223 45678",
    customerEmail: "priya.robotics@gmail.com",
    customerType: "WALK_IN",
    orderSource: "WALK_IN",
    channelName: "🏬 Store Walk-in POS",
    paymentMethod: "CARD",
    paymentStatus: "PAID",
    isPaid: true,
    orderStatus: "DELIVERED",
    status: "PAID & BILLED",
    subtotal: 3175,
    discount: 0,
    gstAmount: 571.5,
    totalAmount: 3746,
    grandTotal: 3746,
    items: [
      {
        productId: "prd-arm-4dof",
        name: "4-DOF Acrylic Robot Arm Manipulator Kit",
        sku: "PRG-2026-ROB-4DF",
        quantity: 1,
        unitPrice: 2499,
        total: 2499,
      },
      {
        productId: "prd-srv-sg90",
        name: "Tower Pro SG90 9g Micro Servo Motor",
        sku: "PRG-2026-SRV-090",
        quantity: 4,
        unitPrice: 169,
        total: 676,
      },
    ],
    createdAt: new Date(Date.now() - 22 * 3600 * 1000).toISOString(),
  },
  {
    id: "ORD-PATNA-2026-9044",
    invoiceNo: "POS-PAT-10824",
    orderNumber: "PRG-POS-PATNA-3112",
    storeId: "patna",
    storeCode: "PATNA",
    storeLocation: "Prayog India Patna Robotics & STEM Branch",
    customerName: "Amitav Sen",
    customerPhone: "+91 93344 11223",
    customerEmail: "amitav.sen@gmail.com",
    customerType: "WALK_IN",
    orderSource: "WALK_IN",
    channelName: "🏬 Store Walk-in POS",
    paymentMethod: "CASH",
    paymentStatus: "PENDING",
    isPaid: false,
    orderStatus: "PENDING",
    status: "NEW KIOSK ORDER",
    subtotal: 2120,
    discount: 0,
    gstAmount: 381.6,
    totalAmount: 2501,
    grandTotal: 2501,
    items: [
      {
        productId: "prd-esp-cam",
        name: "ESP32-CAM AI WiFi + Bluetooth Camera Module",
        sku: "PRG-2026-CAM-032",
        quantity: 2,
        unitPrice: 890,
        total: 1780,
      },
      {
        productId: "prd-ftdi-mod",
        name: "FTDI USB to TTL Serial Adapter Module",
        sku: "PRG-2026-MOD-FTD",
        quantity: 1,
        unitPrice: 340,
        total: 340,
      },
    ],
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },

  // ─── RANCHI STORE WALK-IN & COUNTER ORDERS ───
  {
    id: "ORD-RANCHI-2026-8021",
    invoiceNo: "POS-RNC-10701",
    orderNumber: "PRG-POS-RANCHI-3101",
    storeId: "ranchi",
    storeCode: "RANCHI",
    storeLocation: "Prayog India Ranchi Main Branch & Central Hub",
    customerName: "Abhinav Singh",
    customerPhone: "+91 98351 44210",
    customerEmail: "abhinav.singh@gmail.com",
    customerType: "WALK_IN",
    orderSource: "WALK_IN",
    channelName: "🏬 Store Walk-in POS",
    paymentMethod: "UPI",
    paymentStatus: "PAID",
    isPaid: true,
    orderStatus: "DELIVERED",
    status: "PAID & BILLED",
    subtotal: 4110,
    discount: 0,
    gstAmount: 740,
    totalAmount: 4850,
    grandTotal: 4850,
    items: [
      {
        productId: "prd-ard-uno",
        name: "Arduino Uno R3 Official Rev3 Board",
        sku: "PRG-2026-ARD-001",
        quantity: 2,
        unitPrice: 1499,
        total: 2998,
      },
      {
        productId: "prd-srv-sg90",
        name: "Tower Pro SG90 9g Micro Servo Motor",
        sku: "PRG-2026-SRV-090",
        quantity: 4,
        unitPrice: 189,
        total: 756,
      },
      {
        productId: "prd-sns-hc04",
        name: "HC-SR04 Ultrasonic Distance Sensor",
        sku: "PRG-2026-SNS-004",
        quantity: 2,
        unitPrice: 120,
        total: 240,
      },
    ],
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
  },
  {
    id: "ORD-RANCHI-2026-8022",
    invoiceNo: "POS-RNC-10702",
    orderNumber: "PRG-POS-RANCHI-3103",
    storeId: "ranchi",
    storeCode: "RANCHI",
    storeLocation: "Prayog India Ranchi Main Branch & Central Hub",
    customerName: "Sunita Soren",
    customerPhone: "+91 94311 22890",
    customerEmail: "sunita.soren@bitmesra.ac.in",
    customerType: "WALK_IN",
    orderSource: "WALK_IN",
    channelName: "🏬 Store Walk-in POS",
    paymentMethod: "CASH",
    paymentStatus: "PAID",
    isPaid: true,
    orderStatus: "DELIVERED",
    status: "PAID & BILLED",
    subtotal: 6100,
    discount: 0,
    gstAmount: 1100,
    totalAmount: 7200,
    grandTotal: 7200,
    items: [
      {
        productId: "prd-drn-f450",
        name: "Drone F450 Quadcopter Frame with Integrated PCB",
        sku: "PRG-2026-DRN-450",
        quantity: 1,
        unitPrice: 1850,
        total: 1850,
      },
      {
        productId: "prd-mot-1000kv",
        name: "A2212 1000KV Brushless Motor for Drone",
        sku: "PRG-2026-MOT-221",
        quantity: 4,
        unitPrice: 750,
        total: 3000,
      },
      {
        productId: "prd-esc-30a",
        name: "SimonK 30A Brushless ESC with 5V BEC",
        sku: "PRG-2026-ESC-030",
        quantity: 4,
        unitPrice: 312,
        total: 1250,
      },
    ],
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: "ORD-RANCHI-2026-8023",
    invoiceNo: "POS-RNC-10703",
    orderNumber: "PRG-POS-RANCHI-3106",
    storeId: "ranchi",
    storeCode: "RANCHI",
    storeLocation: "Prayog India Ranchi Main Branch & Central Hub",
    customerName: "Vikash Kumar",
    customerPhone: "+91 87097 55120",
    customerEmail: "vikash.stem@gmail.com",
    customerType: "WALK_IN",
    orderSource: "WALK_IN",
    channelName: "🏬 Store Walk-in POS",
    paymentMethod: "UPI",
    paymentStatus: "PAID",
    isPaid: true,
    orderStatus: "DELIVERED",
    status: "PAID & BILLED",
    subtotal: 1568,
    discount: 0,
    gstAmount: 282,
    totalAmount: 1850,
    grandTotal: 1850,
    items: [
      {
        productId: "prd-tool-sld",
        name: "Temperature Controlled Soldering Iron 60W Kit",
        sku: "PRG-2026-TOL-060",
        quantity: 1,
        unitPrice: 1250,
        total: 1250,
      },
      {
        productId: "prd-tool-dmm",
        name: "Digital Multimeter DT830D with Probes",
        sku: "PRG-2026-TOL-830",
        quantity: 1,
        unitPrice: 318,
        total: 318,
      },
    ],
    createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
  },
  {
    id: "ORD-RANCHI-2026-8024",
    invoiceNo: "POS-RNC-10704",
    orderNumber: "PRG-POS-RANCHI-3109",
    storeId: "ranchi",
    storeCode: "RANCHI",
    storeLocation: "Prayog India Ranchi Main Branch & Central Hub",
    customerName: "Rohit Verma",
    customerPhone: "+91 87097 12345",
    customerEmail: "rohit.verma@gmail.com",
    customerType: "WALK_IN",
    orderSource: "WALK_IN",
    channelName: "🏬 Store Walk-in POS",
    paymentMethod: "CASH",
    paymentStatus: "PENDING",
    isPaid: false,
    orderStatus: "PENDING",
    status: "NEW KIOSK ORDER",
    subtotal: 2034,
    discount: 0,
    gstAmount: 366,
    totalAmount: 2400,
    grandTotal: 2400,
    items: [
      {
        productId: "prd-ard-kit",
        name: "Arduino Uno Starter Kit with Sensors & Components",
        sku: "PRG-2026-KIT-UNO",
        quantity: 1,
        unitPrice: 2034,
        total: 2034,
      },
    ],
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },

  // ─── DELHI STORE WALK-IN & COUNTER ORDERS ───
  {
    id: "ORD-DELHI-2026-7011",
    invoiceNo: "POS-DEL-10601",
    orderNumber: "PRG-POS-DELHI-3103",
    storeId: "delhi",
    storeCode: "DELHI",
    storeLocation: "Prayog India NCR Innovation Center",
    customerName: "Devendra Mehra",
    customerPhone: "+91 98110 55219",
    customerEmail: "d.mehra@delhi-robotics.org",
    customerType: "WALK_IN",
    orderSource: "WALK_IN",
    channelName: "🏬 Store Walk-in POS",
    paymentMethod: "UPI",
    paymentStatus: "PAID",
    isPaid: true,
    orderStatus: "DELIVERED",
    status: "PAID & BILLED",
    subtotal: 7796,
    discount: 0,
    gstAmount: 1404,
    totalAmount: 9200,
    grandTotal: 9200,
    items: [
      {
        productId: "prd-jet-case",
        name: "NVIDIA Jetson Nano Metal Case with Cooling Fan",
        sku: "PRG-2026-JET-CSE",
        quantity: 2,
        unitPrice: 1950,
        total: 3900,
      },
      {
        productId: "prd-rpi-cam",
        name: "Raspberry Pi Camera Module V2 8MP",
        sku: "PRG-2026-CAM-RP2",
        quantity: 2,
        unitPrice: 1948,
        total: 3896,
      },
    ],
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
  },
  {
    id: "ORD-DELHI-2026-7012",
    invoiceNo: "POS-DEL-10602",
    orderNumber: "PRG-POS-DELHI-3107",
    storeId: "delhi",
    storeCode: "DELHI",
    storeLocation: "Prayog India NCR Innovation Center",
    customerName: "Ananya Sharma",
    customerPhone: "+91 98711 33456",
    customerEmail: "ananya.sharma@dtu.ac.in",
    customerType: "WALK_IN",
    orderSource: "WALK_IN",
    channelName: "🏬 Store Walk-in POS",
    paymentMethod: "CARD",
    paymentStatus: "PAID",
    isPaid: true,
    orderStatus: "DELIVERED",
    status: "PAID & BILLED",
    subtotal: 4576,
    discount: 0,
    gstAmount: 824,
    totalAmount: 5400,
    grandTotal: 5400,
    items: [
      {
        productId: "prd-rob-mcnm",
        name: "4WD Omnidirectional Mecanum Wheel Robot Chassis Kit",
        sku: "PRG-2026-ROB-MCN",
        quantity: 1,
        unitPrice: 3850,
        total: 3850,
      },
      {
        productId: "prd-mot-dcgr",
        name: "12V 300RPM DC Geared Motor with Encoder",
        sku: "PRG-2026-MOT-300",
        quantity: 2,
        unitPrice: 363,
        total: 726,
      },
    ],
    createdAt: new Date(Date.now() - 7 * 3600 * 1000).toISOString(),
  },
  {
    id: "ORD-DELHI-2026-7013",
    invoiceNo: "POS-DEL-10603",
    orderNumber: "PRG-POS-DELHI-3110",
    storeId: "delhi",
    storeCode: "DELHI",
    storeLocation: "Prayog India NCR Innovation Center",
    customerName: "Kavita Aggarwal",
    customerPhone: "+91 99100 22345",
    customerEmail: "kavita.dtu@gmail.com",
    customerType: "WALK_IN",
    orderSource: "WALK_IN",
    channelName: "🏬 Store Walk-in POS",
    paymentMethod: "CASH",
    paymentStatus: "PAID",
    isPaid: true,
    orderStatus: "DELIVERED",
    status: "PAID & BILLED",
    subtotal: 3262,
    discount: 0,
    gstAmount: 588,
    totalAmount: 3850,
    grandTotal: 3850,
    items: [
      {
        productId: "prd-esp-s3ai",
        name: "ESP32-S3 AI Development Kit with 2.4 inch Screen",
        sku: "PRG-2026-ESP-S3A",
        quantity: 1,
        unitPrice: 2400,
        total: 2400,
      },
      {
        productId: "prd-bat-1865",
        name: "18650 2600mAh Li-ion Rechargeable Battery (Pack of 2)",
        sku: "PRG-2026-BAT-186",
        quantity: 2,
        unitPrice: 431,
        total: 862,
      },
    ],
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
];

// ── Persistent order log using globalThis to survive Next.js hot-reloads in dev ──
// This keeps POS-created orders visible in the Branch Orders page within the same Node process.
const globalForOrders = globalThis as unknown as {
  _PRAYOG_STORE_ORDERS_LOG: any[] | undefined;
};

if (!globalForOrders._PRAYOG_STORE_ORDERS_LOG) {
  globalForOrders._PRAYOG_STORE_ORDERS_LOG = [...INITIAL_STORE_ORDERS];
}
const STORE_ORDERS_LOG = globalForOrders._PRAYOG_STORE_ORDERS_LOG;

// GET /api/store/orders - Store-scoped Orders Endpoint
export async function GET(request: Request) {
  const headers = getSecurityHeaders();
  const staff = await getAuthenticatedStaff();

  if (!staff) {
    return NextResponse.json(
      { success: false, message: "Unauthorized. Staff session required." },
      { status: 401, headers },
    );
  }

  const { searchParams } = new URL(request.url);
  const requestedStore = searchParams.get("storeId");

  // ── STRICT STORE AUTHORIZATION CHECK ──
  // If staff is a STORE_MANAGER, they CANNOT view other stores.
  // E.g. Patna Store Manager (staff.storeCode === "PATNA") is strictly locked to PATNA.
  if (staff.role === "STORE_MANAGER") {
    const managerStore = (staff.storeCode || "PATNA").toUpperCase();
    if (requestedStore && requestedStore.toUpperCase() !== managerStore) {
      return NextResponse.json(
        {
          success: false,
          message: `Forbidden: As the ${managerStore} Store Manager, you are only authorized to access ${managerStore} branch records.`,
        },
        { status: 403, headers },
      );
    }
  }

  // Active store resolution:
  // For STORE_MANAGER: Always their assigned staff.storeCode.
  // For SUPER_ADMIN: requestedStore (defaulting to "RANCHI" or whichever store they selected).
  const activeStoreCode = (
    staff.role === "STORE_MANAGER"
      ? staff.storeCode || "PATNA"
      : requestedStore || staff.storeCode || "RANCHI"
  ).toUpperCase();

  // Filter in-memory walk-in orders matching this specific branch
  const dynamicOrders = STORE_ORDERS_LOG.filter(
    (o) => o.storeCode?.toUpperCase() === activeStoreCode,
  );

  // If DB is available, also search for any recorded in-store orders
  let dbOrders: any[] = [];
  if (isDatabaseAvailable()) {
    try {
      const records = await db.order.findMany({
        where: {
          OR: [
            { customerType: "WALK_IN" },
            { orderNumber: { contains: activeStoreCode } },
            { shippingAddress: { contains: activeStoreCode } },
          ],
        },
        include: {
          items: true,
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      dbOrders = records.map((ord: any) => ({
        id: ord.id,
        invoiceNo: ord.orderNumber || `POS-${activeStoreCode}-${ord.id.slice(-4)}`,
        orderNumber: ord.orderNumber,
        storeId: activeStoreCode.toLowerCase(),
        storeCode: activeStoreCode,
        storeLocation: `${activeStoreCode} Branch`,
        customerName: ord.user?.name || "Walk-in Customer",
        customerPhone: ord.user?.phone || "",
        customerEmail: ord.user?.email || "",
        customerType: "WALK_IN",
        orderSource: "WALK_IN",
        channelName: "🏬 Store Walk-in POS",
        paymentMethod: ord.paymentMethod || "CASH",
        paymentStatus: ord.status === "DELIVERED" ? "PAID" : "PENDING",
        isPaid: ord.status === "DELIVERED",
        orderStatus: ord.status,
        status: ord.status === "DELIVERED" ? "PAID & BILLED" : ord.status,
        subtotal: ord.subtotal || ord.totalAmount,
        discount: ord.discountAmount || 0,
        gstAmount: ord.gstAmount || 0,
        totalAmount: ord.totalAmount,
        grandTotal: ord.totalAmount,
        items: ord.items.map((i: any) => ({
          name: i.productName || i.name,
          quantity: i.quantity,
          unitPrice: i.price,
          total: (i.price || 0) * (i.quantity || 1),
        })),
        createdAt: ord.createdAt.toISOString(),
      }));
    } catch {}
  }

  // Merge and deduplicate by id / orderNumber
  const combined = [...dynamicOrders, ...dbOrders];
  const seenIds = new Set<string>();
  const uniqueOrders = combined.filter((ord) => {
    const key = ord.id || ord.orderNumber;
    if (!key || seenIds.has(key)) return false;
    seenIds.add(key);
    return true;
  });

  // Sort newest first
  uniqueOrders.sort(
    (a, b) =>
      new Date(b.createdAt || 0).getTime() -
      new Date(a.createdAt || 0).getTime(),
  );

  return NextResponse.json(
    {
      success: true,
      store: activeStoreCode,
      data: {
        items: uniqueOrders,
        total: uniqueOrders.length,
      },
    },
    { headers },
  );
}

// POST /api/store/orders - Authoritative Walk-in POS Order Creation
export async function POST(request: Request) {
  const headers = getSecurityHeaders();
  const staff = await getAuthenticatedStaff();

  if (!staff) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized. Active POS/Staff session required.",
      },
      { status: 401, headers },
    );
  }

  try {
    const body = await request.json();
    const {
      storeId: rawStoreId,
      items,
      customerName = "Walk-in Customer",
      customerPhone = "",
      customerEmail = "",
      paymentMethod = "CASH",
      discount = 0,
      notes = "",
    } = body;

    // Backend derives and validates store authorization
    const targetStore = (
      staff.role === "SUPER_ADMIN"
        ? rawStoreId || staff.storeCode || "ranchi"
        : staff.storeCode || staff.storeId || "patna"
    ).toLowerCase() as StoreId;

    if (!hasStoreAccess(staff, targetStore)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Forbidden. You do not have authority to place orders for this store.",
        },
        { status: 403, headers },
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Cart items cannot be empty." },
        { status: 400, headers },
      );
    }

    // 1. Authoritative Backend Cart Stock Validation
    const validation = await validateCartForStore({
      storeId: targetStore,
      items: items.map((i: any) => ({
        productId: i.productId || i.id,
        quantity: i.quantity,
      })),
    });

    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Order validation failed: One or more products have insufficient stock.",
          errors: validation.errors,
        },
        { status: 400, headers },
      );
    }

    const orderId = `ORD-${targetStore.toUpperCase()}-${Date.now().toString().slice(-6)}`;
    const invoiceNo = `POS-${targetStore.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;

    let subtotal = 0;
    const processedItems = [];

    // 2. Atomic Stock Deduction per Item with Audit Logging
    for (const item of items) {
      const pid = item.productId || item.id;
      const qty = item.quantity || 1;
      const unitPrice = await getProductPriceForStore(pid, targetStore);

      const deductionResult = await deductStoreInventory({
        productId: pid,
        quantity: qty,
        orderSource: "WALK_IN",
        storeId: targetStore,
        orderId,
        userId: staff.id,
        deviceId: staff.deviceId || "POS-DEFAULT",
      });

      if (!deductionResult.success) {
        return NextResponse.json(
          { success: false, message: deductionResult.message },
          { status: 400, headers },
        );
      }

      const itemTotal = unitPrice * qty;
      subtotal += itemTotal;

      processedItems.push({
        productId: pid,
        name: item.name,
        sku: item.sku,
        quantity: qty,
        unitPrice,
        total: itemTotal,
      });
    }

    const gstAmount = Math.round(subtotal * 0.18 * 100) / 100;
    const grandTotal = Math.max(0, subtotal + gstAmount - discount);

    const orderRecord = {
      id: orderId,
      invoiceNo,
      orderNumber: orderId,
      storeId: targetStore,
      storeCode: targetStore.toUpperCase(),
      storeLocation: STORES[targetStore]?.name || `${targetStore} Store`,
      deviceId: staff.deviceId || "POS-01",
      cashierId: staff.id,
      cashierName: staff.name,
      customerName,
      customerPhone,
      customerEmail,
      customerType: "WALK_IN",
      orderSource: "WALK_IN",
      channelName: "🏬 Store Walk-in POS",
      items: processedItems,
      subtotal,
      discount,
      gstAmount,
      totalAmount: grandTotal,
      grandTotal,
      paymentMethod,
      paymentStatus: "PAID",
      orderStatus: "DELIVERED",
      status: "PAID & BILLED",
      isPaid: true,
      notes,
      createdAt: new Date().toISOString(),
    };

    STORE_ORDERS_LOG.unshift(orderRecord);

    return NextResponse.json(
      {
        success: true,
        message: `Walk-in order ${orderId} placed and inventory successfully deducted from ${STORES[targetStore]?.name}.`,
        order: orderRecord,
      },
      { headers },
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to process POS walk-in order",
      },
      { status: 500, headers },
    );
  }
}

// PATCH /api/store/orders - Confirm and update order payment status
export async function PATCH(request: Request) {
  const headers = getSecurityHeaders();
  const staff = await getAuthenticatedStaff();

  if (!staff) {
    return NextResponse.json(
      { success: false, message: "Unauthorized. Staff session required." },
      { status: 401, headers },
    );
  }

  try {
    const body = await request.json();
    const { orderId, paymentMethod = "CASH", status = "PAID" } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "orderId is required." },
        { status: 400, headers },
      );
    }

    // Find in STORE_ORDERS_LOG
    const order = STORE_ORDERS_LOG.find(
      (o) => o.id === orderId || o.orderNumber === orderId,
    );

    if (order) {
      // Store authorization: Store Manager can only update orders of their store
      if (staff.role === "STORE_MANAGER") {
        const mgrStore = (staff.storeCode || "").toUpperCase();
        if (order.storeCode && order.storeCode.toUpperCase() !== mgrStore) {
          return NextResponse.json(
            {
              success: false,
              message: "Forbidden: Cannot update orders from another branch.",
            },
            { status: 403, headers },
          );
        }
      }

      order.paymentStatus = status === "PAID" ? "PAID" : status;
      order.orderStatus = "DELIVERED";
      order.status = "PAID & BILLED";
      order.isPaid = true;
      order.paymentMethod = paymentMethod;
      order.updatedAt = new Date().toISOString();
    }

    // If database is available, update db.order as well
    if (isDatabaseAvailable()) {
      try {
        await db.order.updateMany({
          where: {
            OR: [{ id: orderId }, { orderNumber: orderId }],
          },
          data: {
            status: "DELIVERED",
            paymentMethod: paymentMethod,
          },
        });
      } catch {}
    }

    return NextResponse.json(
      {
        success: true,
        message: `Order ${orderId} payment confirmed successfully.`,
        order: order || { id: orderId, status: "PAID & BILLED", isPaid: true },
      },
      { headers },
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update payment status.",
      },
      { status: 500, headers },
    );
  }
}

