import { NextResponse } from "next/server";
import { getAuthenticatedStaff, hasStoreAccess } from "@/lib/staffAuth";
import { getSecurityHeaders } from "@/lib/security";
import { getAllSessions } from "@/data/storeConfig";

// Store-specific customer database
const STORE_CUSTOMERS_SEED: Record<string, any[]> = {
  RANCHI: [
    {
      id: "cust-rnc-01",
      name: "Abhinav Singh",
      phone: "+91 98351 44210",
      email: "abhinav.singh@gmail.com",
      storeCode: "RANCHI",
      totalOrders: 6,
      totalSpent: 18450,
      customerType: "WALK_IN",
      lastVisit: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      recentPurchases: ["Arduino Uno R3", "SG90 Servo Motors", "Ultrasonic Sensor"],
    },
    {
      id: "cust-rnc-02",
      name: "Prakash Soren",
      phone: "+91 94311 02934",
      email: "prakash.soren@bitmesra.ac.in",
      storeCode: "RANCHI",
      totalOrders: 11,
      totalSpent: 42100,
      customerType: "STUDENT_INNOVATOR",
      lastVisit: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
      recentPurchases: ["Raspberry Pi 4 4GB", "L298N Motor Driver", "LiPo Battery 3S"],
    },
    {
      id: "cust-rnc-03",
      name: "Ananya Sen",
      phone: "+91 97092 11845",
      email: "ananya.robotics@gmail.com",
      storeCode: "RANCHI",
      totalOrders: 3,
      totalSpent: 8900,
      customerType: "WALK_IN",
      lastVisit: new Date(Date.now() - 5 * 86400 * 1000).toISOString(),
      recentPurchases: ["ESP32 Dev Board", "OLED Display 0.96", "Jumper Wires"],
    },
    {
      id: "cust-rnc-04",
      name: "Vikramaditya Sahay",
      phone: "+91 99341 55210",
      email: "vikramaditya@ranchi-stem.edu",
      storeCode: "RANCHI",
      totalOrders: 4,
      totalSpent: 26500,
      customerType: "INSTITUTIONAL",
      lastVisit: new Date(Date.now() - 9 * 86400 * 1000).toISOString(),
      recentPurchases: ["Robotic Arm Kit", "Arduino Starter Kit x5", "Breadboards"],
    },
  ],
  PATNA: [
    {
      id: "cust-pat-01",
      name: "Ramesh Sharma",
      phone: "+91 94312 88450",
      email: "ramesh.patna.stem@gmail.com",
      storeCode: "PATNA",
      totalOrders: 8,
      totalSpent: 31200,
      customerType: "WALK_IN",
      lastVisit: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      recentPurchases: ["Raspberry Pi 4 4GB", "ESP32 Board x5", "Official Power Adapter"],
    },
    {
      id: "cust-pat-02",
      name: "Dr. Alok Kumar",
      phone: "+91 98350 11980",
      email: "alok.kumar@nitp.ac.in",
      storeCode: "PATNA",
      totalOrders: 5,
      totalSpent: 19800,
      customerType: "INSTITUTIONAL",
      lastVisit: new Date(Date.now() - 4 * 86400 * 1000).toISOString(),
      recentPurchases: ["Lidar Sensor Kit", "STM32 Nucleo Board", "Precision Jumper Kit"],
    },
    {
      id: "cust-pat-03",
      name: "Pooja Kumari",
      phone: "+91 97090 44211",
      email: "pooja.bihar.robotics@gmail.com",
      storeCode: "PATNA",
      totalOrders: 2,
      totalSpent: 4500,
      customerType: "WALK_IN",
      lastVisit: new Date(Date.now() - 7 * 86400 * 1000).toISOString(),
      recentPurchases: ["4-DOF Robotic Arm", "SG90 Micro Servos"],
    },
  ],
  DELHI: [
    {
      id: "cust-del-01",
      name: "Devendra Mehra",
      phone: "+91 98110 55219",
      email: "d.mehra@delhi-robotics.org",
      storeCode: "DELHI",
      totalOrders: 14,
      totalSpent: 68400,
      customerType: "WALK_IN",
      lastVisit: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      recentPurchases: ["Pixhawk 4 Autopilot", "Telemetry Radio Set", "High-Torque DC Motors"],
    },
    {
      id: "cust-del-02",
      name: "Kavita Aggarwal",
      phone: "+91 99100 22345",
      email: "kavita.dtu@gmail.com",
      storeCode: "DELHI",
      totalOrders: 7,
      totalSpent: 24600,
      customerType: "STUDENT_INNOVATOR",
      lastVisit: new Date(Date.now() - 3 * 86400 * 1000).toISOString(),
      recentPurchases: ["ESP32-S3 AI Kit", "Camera Module OV2640", "Li-ion Battery 18650"],
    },
  ],
};

// GET /api/store/customers - Customers list scoped strictly to this branch
export async function GET(request: Request) {
  const headers = getSecurityHeaders();
  const staff = await getAuthenticatedStaff();

  if (
    !staff ||
    (staff.role !== "STORE_MANAGER" && staff.role !== "SUPER_ADMIN")
  ) {
    return NextResponse.json(
      { success: false, message: "Forbidden. Store Manager access required." },
      { status: 403, headers },
    );
  }

  const { searchParams } = new URL(request.url);
  const targetStore = (
    staff.role === "STORE_MANAGER"
      ? staff.storeCode || "RANCHI"
      : searchParams.get("storeId") || staff.storeCode || "RANCHI"
  ).toUpperCase();

  const baseList = STORE_CUSTOMERS_SEED[targetStore] || STORE_CUSTOMERS_SEED.RANCHI;

  // Dynamically extract customers from recent store walk-in sessions
  const storeSessions = getAllSessions().filter(
    (s) => s.storeId.toUpperCase() === targetStore,
  );

  const dynamicCustomers: any[] = [];
  storeSessions.forEach((s) => {
    if (s.customerPhone && !baseList.some((c) => c.phone === s.customerPhone)) {
      dynamicCustomers.push({
        id: `dyn-${s.id}`,
        name: s.customerName || "Walk-in Guest",
        phone: s.customerPhone,
        email: s.customerEmail || "in-store@prayogindia.com",
        storeCode: targetStore,
        totalOrders: 1,
        totalSpent: s.total,
        customerType: "WALK_IN",
        lastVisit: s.createdAt,
        recentPurchases: s.items?.map((it) => it.name) || [],
      });
    }
  });

  const allCustomers = [...dynamicCustomers, ...baseList];

  return NextResponse.json(
    {
      success: true,
      store: targetStore,
      total: allCustomers.length,
      data: allCustomers,
    },
    { headers },
  );
}

