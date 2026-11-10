import { NextResponse } from "next/server";
import { getAuthenticatedStaff } from "@/lib/staffAuth";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import {
  getStockTransfers,
  transferStockBetweenStores,
  updateStockTransferStatus,
  TransferStatus,
} from "@/lib/inventoryEngine";
import { StoreId, STORES } from "@/data/storeConfig";
import { getSecurityHeaders } from "@/lib/security";

// GET /api/admin/transfers - List all inter-store stock transfers
export async function GET(request: Request) {
  const headers = getSecurityHeaders();
  const staff =
    (await getAuthenticatedStaff()) || (await getAuthenticatedAdmin());

  if (
    !staff ||
    (staff.role !== "ADMIN" &&
      staff.role !== "SUPER_ADMIN" &&
      staff.role !== "REGIONAL_MANAGER" &&
      staff.role !== "STORE_MANAGER")
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "Forbidden. Admin or Manager access required.",
      },
      { status: 403, headers },
    );
  }

  let engineTransfers: any[] = [];
  try {
    engineTransfers = await getStockTransfers();
  } catch {}

  const globalForTransfers = globalThis as unknown as {
    _PRAYOG_STORE_TRANSFERS: any[] | undefined;
  };
  const memTransfers = globalForTransfers._PRAYOG_STORE_TRANSFERS || [];

  // Map memory transfer records to Admin InterStoreTransfer format
  const formattedMem = memTransfers.map((t) => {
    const firstItem = t.items?.[0];
    const totalQty = (t.items || []).reduce(
      (acc: number, curr: any) => acc + (curr.quantity || 1),
      0,
    );
    const prodNames = (t.items || [])
      .map((i: any) => `${i.name || i.productName || "Component"} (x${i.quantity || 1})`)
      .join(", ");
    const skus = (t.items || [])
      .map((i: any) => i.sku)
      .filter(Boolean)
      .join(", ");

    let adminStatus = "Draft / Requested";
    const st = (t.status || "").toUpperCase();
    if (st === "DISPATCHED" || st === "IN_TRANSIT" || st === "DISPATCHED (IN TRANSIT)") {
      adminStatus = "Dispatched & In Transit";
    } else if (st === "RECEIVED" || st === "COMPLETED") {
      adminStatus = "Received & Stock Updated";
    } else if (st === "APPROVED") {
      adminStatus = "Approved";
    } else if (st === "CANCELLED" || st === "REJECTED") {
      adminStatus = "Cancelled";
    }

    return {
      id: t.id,
      transferNumber: t.transferNumber || t.id,
      sourceStoreCode: (t.sourceStoreId || "ranchi").toUpperCase(),
      sourceStoreName: t.sourceStoreName || "Central Warehouse (Ranchi)",
      destinationStoreCode: (t.destinationStoreId || "patna").toUpperCase(),
      destinationStoreName: t.destinationStoreName || "Branch Store",
      productId: firstItem?.productId || "prod-multi",
      productName: prodNames || firstItem?.name || "Robotics Hardware Kit",
      sku: skus || firstItem?.sku || "PRG-MULTI-SKU",
      quantity: totalQty || 1,
      initiatedBy: t.requestedBy || "Store Manager",
      approvedBy: t.approvedBy,
      dispatchedAt: t.createdAt
        ? new Date(t.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : undefined,
      receivedAt: t.receivedAt
        ? new Date(t.receivedAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : undefined,
      status: adminStatus,
      rawStatus: t.status,
      items: t.items || [],
      notes: t.notes || "",
    };
  });

  const combined = [...formattedMem, ...engineTransfers];
  const seenIds = new Set<string>();
  const unique = combined.filter((t) => {
    if (!t.id || seenIds.has(t.id)) return false;
    seenIds.add(t.id);
    return true;
  });

  return NextResponse.json(
    {
      success: true,
      total: unique.length,
      data: unique,
    },
    { headers },
  );
}

// POST /api/admin/transfers - Create and execute atomic dual-sided stock transfer
export async function POST(request: Request) {
  const headers = getSecurityHeaders();
  const staff =
    (await getAuthenticatedStaff()) || (await getAuthenticatedAdmin());

  if (
    !staff ||
    (staff.role !== "ADMIN" &&
      staff.role !== "SUPER_ADMIN" &&
      staff.role !== "REGIONAL_MANAGER")
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Forbidden. Only Super Admin or Regional Manager can initiate stock transfers.",
      },
      { status: 403, headers },
    );
  }

  try {
    const body = await request.json();
    const { sourceStoreId, destinationStoreId, items, notes } = body;

    if (
      !sourceStoreId ||
      !destinationStoreId ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing source, destination, or items array.",
        },
        { status: 400, headers },
      );
    }

    const src = sourceStoreId.toLowerCase() as StoreId;
    const dest = destinationStoreId.toLowerCase() as StoreId;

    if (!STORES[src] || !STORES[dest]) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid source or destination store identifier.",
        },
        { status: 400, headers },
      );
    }

    const result = await transferStockBetweenStores({
      sourceStoreId: src,
      destinationStoreId: dest,
      items: items.map((i: any) => ({
        productId: i.productId || i.id,
        quantity: parseInt(i.quantity, 10) || 1,
      })),
      userId: staff.id,
      notes,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400, headers },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: result.message,
        transfer: result.transfer,
      },
      { headers },
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to process stock transfer",
      },
      { status: 500, headers },
    );
  }
}

// PATCH /api/admin/transfers - Update transfer status (APPROVE, DISPATCH, RECEIVE, CANCEL)
export async function PATCH(request: Request) {
  const headers = getSecurityHeaders();
  const staff =
    (await getAuthenticatedStaff()) || (await getAuthenticatedAdmin());

  if (
    !staff ||
    (staff.role !== "ADMIN" &&
      staff.role !== "SUPER_ADMIN" &&
      staff.role !== "REGIONAL_MANAGER" &&
      staff.role !== "STORE_MANAGER")
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "Forbidden. Admin or Store Manager access required.",
      },
      { status: 403, headers },
    );
  }

  try {
    const body = await request.json();
    const { transferId, status, notes } = body;

    if (!transferId || !status) {
      return NextResponse.json(
        { success: false, message: "Missing transferId or status." },
        { status: 400, headers },
      );
    }

    const targetStatus = status.toUpperCase();
    const normalizedRawStatus =
      targetStatus === "IN_TRANSIT" || targetStatus === "DISPATCHED"
        ? "DISPATCHED"
        : targetStatus === "RECEIVED" || targetStatus === "COMPLETED"
          ? "RECEIVED"
          : targetStatus === "APPROVED"
            ? "APPROVED"
            : targetStatus === "CANCELLED" || targetStatus === "REJECTED"
              ? "CANCELLED"
              : targetStatus;

    // 1. Check & update in-memory transfer in globalThis
    const globalForTransfers = globalThis as unknown as {
      _PRAYOG_STORE_TRANSFERS: any[] | undefined;
    };
    let updatedInMem = false;
    if (globalForTransfers._PRAYOG_STORE_TRANSFERS) {
      const idx = globalForTransfers._PRAYOG_STORE_TRANSFERS.findIndex(
        (t) => t.id === transferId || t.transferNumber === transferId,
      );
      if (idx >= 0) {
        const tr = globalForTransfers._PRAYOG_STORE_TRANSFERS[idx];
        globalForTransfers._PRAYOG_STORE_TRANSFERS[idx] = {
          ...tr,
          status: normalizedRawStatus,
          approvedBy: staff.name,
          updatedAt: new Date().toISOString(),
          ...(normalizedRawStatus === "RECEIVED" ? { receivedAt: new Date().toISOString(), receivedBy: staff.name } : {}),
          notes: notes ? `${tr.notes || ""} | Admin note: ${notes}` : tr.notes,
        };
        updatedInMem = true;
      }
    }

    // 2. Also try updating in persistent DB engine if transfer exists in DB
    let engineSuccess = false;
    try {
      const result = await updateStockTransferStatus({
        transferId,
        status: normalizedRawStatus as TransferStatus,
        userId: staff.id,
        notes,
      });
      engineSuccess = result.success;
    } catch {}

    if (!updatedInMem && !engineSuccess) {
      return NextResponse.json(
        { success: false, message: "Transfer record not found or update failed." },
        { status: 404, headers },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Transfer ${transferId} updated to ${normalizedRawStatus} successfully.`,
      },
      { headers },
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update transfer status",
      },
      { status: 500, headers },
    );
  }
}
