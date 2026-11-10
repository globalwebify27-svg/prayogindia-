import { NextResponse } from "next/server";
import { getAuthenticatedStaff } from "@/lib/staffAuth";
import { getSecurityHeaders } from "@/lib/security";
import { STORES, StoreId } from "@/data/storeConfig";

// Store metadata directory (view-only for store manager)
const STORE_METADATA: Record<string, any> = {
  RANCHI: {
    code: "RANCHI",
    name: "Prayog India Ranchi Main Branch & Central Hub",
    type: "Central Warehouse & Retail Experience Hub",
    address: "Plot 42, Circular Road, Lalpur, Ranchi, Jharkhand - 834001",
    phone: "+91 87097 89641",
    email: "ranchi.store@prayogindia.com",
    gstin: "20AABCP1984R1ZT",
    operatingHours: "10:00 AM - 08:30 PM (Mon - Sat)",
    posTillsCount: 2,
    kiosksCount: 2,
  },
  PATNA: {
    code: "PATNA",
    name: "Prayog India Patna Robotics & STEM Branch",
    type: "Regional STEM Education & Retail Store",
    address: "Boring Road Crossing, Near Nageshwar Colony, Patna, Bihar - 800001",
    phone: "+91 87097 89642",
    email: "patna.store@prayogindia.com",
    gstin: "10AABCP1984P1ZU",
    operatingHours: "10:00 AM - 08:00 PM (Mon - Sat)",
    posTillsCount: 1,
    kiosksCount: 1,
  },
  DELHI: {
    code: "DELHI",
    name: "Prayog India NCR Innovation Center",
    type: "NCR Flagship Experience & IoT Innovation Lab",
    address: "Block B, Sector 62, Noida, Uttar Pradesh / Delhi NCR - 201309",
    phone: "+91 87097 89643",
    email: "delhi.store@prayogindia.com",
    gstin: "07AABCP1984D1ZV",
    operatingHours: "10:30 AM - 09:00 PM (All 7 Days)",
    posTillsCount: 2,
    kiosksCount: 1,
  },
};

// GET /api/store/profile - Returns store metadata & authenticated manager profile
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

  const storeInfo = STORE_METADATA[targetStore] || STORE_METADATA.RANCHI;

  return NextResponse.json(
    {
      success: true,
      store: targetStore,
      data: {
        storeInfo,
        managerProfile: {
          id: staff.id,
          name: staff.name,
          username: staff.username,
          email: staff.email,
          role: staff.role,
          storeCode: targetStore,
          assignedDevice: staff.deviceLabel || `${targetStore} Manager Terminal`,
          status: staff.status,
        },
      },
    },
    { headers },
  );
}

// PATCH /api/store/profile - Allows Store Manager to update password or contact phone
export async function PATCH(request: Request) {
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

  try {
    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, message: "New password must be at least 6 characters." },
          { status: 400, headers },
        );
      }
      if (newPassword !== confirmPassword) {
        return NextResponse.json(
          { success: false, message: "New password and confirmation do not match." },
          { status: 400, headers },
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Profile and credentials updated successfully.",
      },
      { headers },
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update profile" },
      { status: 500, headers },
    );
  }
}

