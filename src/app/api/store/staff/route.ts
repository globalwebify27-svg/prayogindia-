import { NextResponse } from "next/server";
import { getAuthenticatedStaff } from "@/lib/staffAuth";
import { getSecurityHeaders } from "@/lib/security";

const STORE_STAFF_DIRECTORY: Record<string, any[]> = {
  RANCHI: [
    {
      id: "staff-rnc-mgr",
      name: "Abhishek Kumar",
      username: "ranchi_manager",
      email: "ranchi.manager@prayogindia.com",
      role: "STORE_MANAGER",
      storeCode: "RANCHI",
      status: "ACTIVE",
      assignedDevice: "Ranchi Manager Terminal",
      lastActive: "Active Now",
      permissions: ["MANAGE_LOCAL_STORE", "POS_BILLING", "REQUEST_TRANSFERS"],
    },
    {
      id: "staff-rnc-pos",
      name: "Suresh Mahto",
      username: "ranchi_pos",
      email: "ranchi.pos@prayogindia.com",
      role: "POS_CASHIER",
      storeCode: "RANCHI",
      status: "ACTIVE",
      assignedDevice: "Ranchi POS Terminal 1",
      lastActive: "15 mins ago",
      permissions: ["POS_BILLING", "ISSUE_INVOICES"],
    },
    {
      id: "staff-rnc-kiosk-1",
      name: "Ranchi Shopping Tablet #1",
      username: "ranchi_kiosk",
      email: null,
      role: "KIOSK_USER",
      storeCode: "RANCHI",
      status: "ACTIVE",
      assignedDevice: "Samsung Galaxy Tab S9 - Table 1",
      lastActive: "Live in store",
      permissions: ["WALK_IN_BROWSING", "KIOSK_CHECKOUT"],
    },
    {
      id: "staff-rnc-kiosk-2",
      name: "Ranchi Shopping Tablet #2",
      username: "ranchi_kiosk_2",
      email: null,
      role: "KIOSK_USER",
      storeCode: "RANCHI",
      status: "ACTIVE",
      assignedDevice: "Samsung Galaxy Tab S9 - Table 2",
      lastActive: "Live in store",
      permissions: ["WALK_IN_BROWSING", "KIOSK_CHECKOUT"],
    },
  ],
  PATNA: [
    {
      id: "staff-pat-mgr",
      name: "Jay Prakash",
      username: "patna_manager",
      email: "patna.manager@prayogindia.com",
      role: "STORE_MANAGER",
      storeCode: "PATNA",
      status: "ACTIVE",
      assignedDevice: "Patna Manager Terminal",
      lastActive: "Active Now",
      permissions: ["MANAGE_LOCAL_STORE", "POS_BILLING", "REQUEST_TRANSFERS"],
    },
    {
      id: "staff-pat-pos",
      name: "Manish Sinha",
      username: "patna_pos",
      email: "patna.pos@prayogindia.com",
      role: "POS_CASHIER",
      storeCode: "PATNA",
      status: "ACTIVE",
      assignedDevice: "Patna POS Terminal 1",
      lastActive: "35 mins ago",
      permissions: ["POS_BILLING", "ISSUE_INVOICES"],
    },
    {
      id: "staff-pat-kiosk",
      name: "Patna Shopping Tablet",
      username: "patna_kiosk",
      email: null,
      role: "KIOSK_USER",
      storeCode: "PATNA",
      status: "ACTIVE",
      assignedDevice: "Lenovo Tab M10 - Table 1",
      lastActive: "Live in store",
      permissions: ["WALK_IN_BROWSING", "KIOSK_CHECKOUT"],
    },
  ],
  DELHI: [
    {
      id: "staff-del-mgr",
      name: "Vikramaditya Sahay",
      username: "delhi_manager",
      email: "delhi.manager@prayogindia.com",
      role: "STORE_MANAGER",
      storeCode: "DELHI",
      status: "ACTIVE",
      assignedDevice: "Delhi Manager Terminal",
      lastActive: "Active Now",
      permissions: ["MANAGE_LOCAL_STORE", "POS_BILLING", "REQUEST_TRANSFERS"],
    },
    {
      id: "staff-del-kiosk",
      name: "Delhi Shopping Tablet",
      username: "delhi_kiosk",
      email: null,
      role: "KIOSK_USER",
      storeCode: "DELHI",
      status: "ACTIVE",
      assignedDevice: "iPad 10th Gen - Display Station",
      lastActive: "Live in store",
      permissions: ["WALK_IN_BROWSING", "KIOSK_CHECKOUT"],
    },
  ],
};

// GET /api/store/staff - List staff assigned to this specific branch
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

  const storeStaff = STORE_STAFF_DIRECTORY[targetStore] || STORE_STAFF_DIRECTORY.RANCHI;

  return NextResponse.json(
    {
      success: true,
      store: targetStore,
      total: storeStaff.length,
      data: storeStaff,
    },
    { headers },
  );
}

// POST /api/store/staff - Create new cashier or kiosk login for this branch
export async function POST(request: Request) {
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
    const { name, username, email = null, role = "POS_CASHIER", assignedDevice = "" } = body;

    // Store manager cannot create Super Admin or Manager accounts!
    if (role !== "POS_CASHIER" && role !== "KIOSK_USER") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Forbidden: Store Managers can only create 'POS_CASHIER' or 'KIOSK_USER' accounts for their branch.",
        },
        { status: 403, headers },
      );
    }

    const targetStore = (
      staff.role === "STORE_MANAGER" ? staff.storeCode || "RANCHI" : "RANCHI"
    ).toUpperCase();

    if (!STORE_STAFF_DIRECTORY[targetStore]) {
      STORE_STAFF_DIRECTORY[targetStore] = [];
    }

    const newStaff = {
      id: `staff-${Date.now()}`,
      name: name.trim(),
      username: username.toLowerCase().trim(),
      email: email ? email.trim() : null,
      role,
      storeCode: targetStore,
      status: "ACTIVE",
      assignedDevice: assignedDevice.trim() || `${targetStore} Terminal`,
      lastActive: "Just created",
      permissions:
        role === "POS_CASHIER"
          ? ["POS_BILLING", "ISSUE_INVOICES"]
          : ["WALK_IN_BROWSING", "KIOSK_CHECKOUT"],
    };

    STORE_STAFF_DIRECTORY[targetStore].push(newStaff);

    return NextResponse.json(
      {
        success: true,
        message: `${name} has been assigned to ${targetStore} branch as ${role}.`,
        data: newStaff,
      },
      { headers },
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create staff account" },
      { status: 500, headers },
    );
  }
}

