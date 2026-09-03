import { NextResponse } from "next/server";
import { getAuthenticatedStaff } from "@/lib/staffAuth";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import {
  getStockTransfers,
  transferStockBetweenStores,
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
    (staff.role !== "SUPER_ADMIN" &&
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

  const transfers = getStockTransfers();

  return NextResponse.json(
    {
      success: true,
      total: transfers.length,
      data: transfers,
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
    (staff.role !== "SUPER_ADMIN" && staff.role !== "REGIONAL_MANAGER")
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

    const result = transferStockBetweenStores({
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
