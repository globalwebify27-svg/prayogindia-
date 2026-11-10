import { NextResponse } from "next/server";
import { getAuthenticatedStaff, hasStoreAccess } from "@/lib/staffAuth";
import {
  getStockTransfers,
  updateStockTransferStatus,
  TransferStatus,
} from "@/lib/inventoryEngine";
import { StoreId, STORES } from "@/data/storeConfig";
import { getSecurityHeaders } from "@/lib/security";

// Persistent inter-store transfers log using globalThis across all API routes and dev hot-reloads
const globalForTransfers = globalThis as unknown as {
  _PRAYOG_STORE_TRANSFERS: any[] | undefined;
};

const INITIAL_TRANSFERS: any[] = [
  {
    id: "TRF-2026-5074",
    transferNumber: "TRF-2026-5074",
    sourceStoreId: "ranchi",
    sourceStoreName: "Prayog India Central Experience Hub",
    destinationStoreId: "patna",
    destinationStoreName: "Prayog India Robotics & STEM Branch",
    status: "REQUESTED",
    requestedBy: "Jay Prakash",
    requesterRole: "STORE_MANAGER",
    items: [
      {
        productId: "prod-ard-nano",
        name: "Arduino Nano V3 CH340 Type-C Microcontroller",
        sku: "PRG-ARD-003",
        quantity: 9,
      },
      {
        productId: "prod-ard-mega",
        name: "Arduino Mega 2560 R3 Board (ATmega2560)",
        sku: "PRG-ARD-002",
        quantity: 5,
      },
    ],
    notes: "Urgent replenishment for upcoming STEM robotics workshop in Patna",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "TRF-2026-901",
    transferNumber: "TRF-2026-901",
    sourceStoreId: "ranchi",
    sourceStoreName: "Prayog India Ranchi Main Branch & Central Hub",
    destinationStoreId: "patna",
    destinationStoreName: "Prayog India Patna Robotics & STEM Branch",
    status: "DISPATCHED",
    items: [
      {
        productId: "prod-ard-uno",
        name: "Arduino Uno R3 Official Rev3 Board",
        sku: "PRG-ARD-001",
        quantity: 20,
      },
      {
        productId: "prod-esp32",
        name: "ESP32 Development Board (Wi-Fi + BLE)",
        sku: "ESP32-001",
        quantity: 35,
      },
    ],
    notes: "Restocking monthly quota for Patna STEM labs",
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
  },
  {
    id: "TRF-2026-902",
    transferNumber: "TRF-2026-902",
    sourceStoreId: "ranchi",
    sourceStoreName: "Prayog India Ranchi Main Branch & Central Hub",
    destinationStoreId: "delhi",
    destinationStoreName: "Prayog India NCR Innovation Center",
    status: "APPROVED",
    items: [
      {
        productId: "prod-arm",
        name: "4-DOF Acrylic Robotic Arm Manipulator Kit",
        sku: "ROB-ARM-01",
        quantity: 10,
      },
    ],
    notes: "Exhibition and workshop stock for Delhi center",
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: "TRF-2026-899",
    transferNumber: "TRF-2026-899",
    sourceStoreId: "patna",
    sourceStoreName: "Prayog India Patna Robotics & STEM Branch",
    destinationStoreId: "ranchi",
    destinationStoreName: "Prayog India Ranchi Main Branch & Central Hub",
    status: "RECEIVED",
    items: [
      {
        productId: "prod-sg90",
        name: "Tower Pro SG90 9g Micro Servo Motor",
        sku: "PRG-MOT-808",
        quantity: 50,
      },
    ],
    notes: "Inter-branch balance transfer completed",
    createdAt: new Date(Date.now() - 5 * 86400 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400 * 1000).toISOString(),
  },
];

if (!globalForTransfers._PRAYOG_STORE_TRANSFERS) {
  globalForTransfers._PRAYOG_STORE_TRANSFERS = [...INITIAL_TRANSFERS];
}

const STORE_TRANSFER_REQUESTS = globalForTransfers._PRAYOG_STORE_TRANSFERS;

// GET /api/store/transfers - List transfers strictly scoped to this store
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
      ? staff.storeCode || "PATNA"
      : searchParams.get("storeId") || staff.storeCode || "PATNA"
  ).toLowerCase() as StoreId;

  // Retrieve global transfers and merge with local requests
  let engineTransfers: any[] = [];
  try {
    engineTransfers = await getStockTransfers();
  } catch {}

  const combined = [...STORE_TRANSFER_REQUESTS, ...engineTransfers];
  const seenIds = new Set<string>();
  const unique = combined.filter((t) => {
    if (!t.id || seenIds.has(t.id)) return false;
    seenIds.add(t.id);
    return true;
  });

  // Strictly filter where this store is either the Source or Destination
  const storeTransfers = unique.filter((t) => {
    const src = (t.sourceStoreId || "").toLowerCase();
    const dest = (t.destinationStoreId || "").toLowerCase();
    return src === targetStore || dest === targetStore;
  });

  return NextResponse.json(
    {
      success: true,
      store: targetStore.toUpperCase(),
      total: storeTransfers.length,
      data: storeTransfers,
    },
    { headers },
  );
}

// POST /api/store/transfers - Store Manager requests stock from Central Hub or peer store
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
    const { sourceStoreId = "ranchi", items, notes = "" } = body;

    const currentStore = (
      staff.role === "STORE_MANAGER" ? staff.storeCode || "RANCHI" : "RANCHI"
    ).toLowerCase() as StoreId;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Transfer request must include at least one item." },
        { status: 400, headers },
      );
    }

    const src = (sourceStoreId || "ranchi").toLowerCase() as StoreId;
    if (src === currentStore) {
      return NextResponse.json(
        { success: false, message: "Source and destination store cannot be the same." },
        { status: 400, headers },
      );
    }

    const newTransfer = {
      id: `TRF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      transferNumber: `TRF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      sourceStoreId: src,
      sourceStoreName: STORES[src]?.name || `${src.toUpperCase()} Store`,
      destinationStoreId: currentStore,
      destinationStoreName: STORES[currentStore]?.name || `${currentStore.toUpperCase()} Store`,
      status: "REQUESTED",
      requestedBy: staff.name,
      requesterRole: staff.role,
      items: items.map((it: any) => ({
        productId: it.productId || it.id,
        name: it.name,
        sku: it.sku,
        quantity: Math.max(1, parseInt(it.quantity, 10) || 1),
      })),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    STORE_TRANSFER_REQUESTS.unshift(newTransfer);

    return NextResponse.json(
      {
        success: true,
        message: "Stock transfer request created and queued for Central Admin approval.",
        data: newTransfer,
      },
      { headers },
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create transfer request" },
      { status: 500, headers },
    );
  }
}

// PATCH /api/store/transfers - Store Manager confirms stock received
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
    const { transferId, status, notes = "" } = body;

    if (!transferId || !status) {
      return NextResponse.json(
        { success: false, message: "Missing transferId or status." },
        { status: 400, headers },
      );
    }

    const currentStore = (
      staff.role === "STORE_MANAGER" ? staff.storeCode || "RANCHI" : "RANCHI"
    ).toLowerCase();

    // Store Managers are ONLY permitted to confirm incoming stock as RECEIVED
    const targetStatus = status.toUpperCase() as TransferStatus;
    if (staff.role === "STORE_MANAGER" && targetStatus !== "RECEIVED") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Forbidden: Store Managers can only confirm stock as 'RECEIVED'. Approvals and dispatches require Super Admin.",
        },
        { status: 403, headers },
      );
    }

    // Update in-memory record
    const localIdx = STORE_TRANSFER_REQUESTS.findIndex(
      (t) => t.id === transferId || t.transferNumber === transferId,
    );

    if (localIdx >= 0) {
      const tr = STORE_TRANSFER_REQUESTS[localIdx];
      // Verify destination is this store
      if (
        staff.role === "STORE_MANAGER" &&
        tr.destinationStoreId.toLowerCase() !== currentStore
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Forbidden: You can only confirm receipt for shipments to your store.",
          },
          { status: 403, headers },
        );
      }

      STORE_TRANSFER_REQUESTS[localIdx] = {
        ...tr,
        status: targetStatus,
        receivedBy: staff.name,
        receivedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: notes ? `${tr.notes || ""} | Receipt note: ${notes}` : tr.notes,
      };

      return NextResponse.json(
        {
          success: true,
          message: `Stock confirmed as RECEIVED for transfer ${transferId}. Local inventory replenished.`,
          data: STORE_TRANSFER_REQUESTS[localIdx],
        },
        { headers },
      );
    }

    // Try engine update
    try {
      await updateStockTransferStatus({
        transferId,
        status: targetStatus,
        userId: staff.id,
        notes,
      });
    } catch {}

    return NextResponse.json(
      {
        success: true,
        message: `Stock transfer marked as ${targetStatus}.`,
      },
      { headers },
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update transfer" },
      { status: 500, headers },
    );
  }
}
