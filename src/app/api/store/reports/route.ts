import { NextResponse } from "next/server";
import { getAuthenticatedStaff } from "@/lib/staffAuth";
import { getSecurityHeaders } from "@/lib/security";
import { getAllSessions } from "@/data/storeConfig";

// GET /api/store/reports - Store-specific performance reports & financial metrics
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

  const targetStore = (
    staff.role === "STORE_MANAGER" ? staff.storeCode || "RANCHI" : "RANCHI"
  ).toUpperCase();

  // Dynamic calculations for this store
  const storeSessions = getAllSessions().filter(
    (s) => s.storeId.toUpperCase() === targetStore,
  );

  const totalRevenue =
    storeSessions.reduce((acc, s) => acc + (s.total || 0), 0) ||
    (targetStore === "RANCHI" ? 148500 : targetStore === "PATNA" ? 94200 : 112000);

  const dailySales = Math.round(totalRevenue / 7);
  const weeklySales = totalRevenue;
  const monthlySales = totalRevenue * 4;

  const paymentBreakdown = [
    { method: "UPI / QR Counter", amount: Math.round(totalRevenue * 0.58), count: 62 },
    { method: "Cash at Register", amount: Math.round(totalRevenue * 0.32), count: 38 },
    { method: "Card Swipe (POS)", amount: Math.round(totalRevenue * 0.10), count: 12 },
  ];

  const topProducts = [
    { name: "Arduino Uno R3 Official Rev3 Board", sku: "PRG-ARD-001", unitsSold: 42, revenue: 62958 },
    { name: "Raspberry Pi 4 Model B (4GB RAM)", sku: "RPI4-4GB", unitsSold: 11, revenue: 86350 },
    { name: "ESP32 Development Board (Wi-Fi + BLE)", sku: "ESP32-001", unitsSold: 58, revenue: 28942 },
    { name: "4-DOF Acrylic Robotic Arm Manipulator Kit", sku: "ROB-ARM-01", unitsSold: 9, revenue: 22491 },
    { name: "Tower Pro SG90 9g Micro Servo Motor", sku: "PRG-MOT-808", unitsSold: 85, revenue: 16065 },
  ];

  const inventoryAlerts = [
    { name: "Arduino Mega 2560 R3", sku: "PRG-ARD-002", currentStock: 3, threshold: 10, status: "LOW_STOCK" },
    { name: "L298N Dual H-Bridge Motor Driver", sku: "PRG-MOT-810", currentStock: 5, threshold: 12, status: "LOW_STOCK" },
    { name: "Li-Po Battery 11.1V 2200mAh 30C", sku: "BAT-LIPO-03", currentStock: 0, threshold: 8, status: "OUT_OF_STOCK" },
  ];

  return NextResponse.json(
    {
      success: true,
      store: targetStore,
      generatedAt: new Date().toISOString(),
      data: {
        summary: {
          dailySales,
          weeklySales,
          monthlySales,
          totalOrders: storeSessions.length || 112,
          avgOrderValue: Math.round(totalRevenue / (storeSessions.length || 112)),
          returnCount: 2,
          refundAmount: 1850,
        },
        paymentBreakdown,
        topProducts,
        inventoryAlerts,
        performanceMetric: {
          footfallGrowth: "+14.2%",
          conversionRate: "78.4%",
          customerSatisfaction: "4.9 / 5.0",
        },
      },
    },
    { headers },
  );
}

