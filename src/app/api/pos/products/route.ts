import { NextResponse } from "next/server";
import { getAuthenticatedStaff, hasStoreAccess } from "@/lib/staffAuth";
import { getSecurityHeaders } from "@/lib/security";
import { searchStoreProducts, getStoreInventory } from "@/lib/inventoryEngine";
import { StoreId } from "@/data/storeConfig";

// GET /api/pos/products
// Returns Global Products joined with the Authenticated Store's Inventory
export async function GET(request: Request) {
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

  const { searchParams } = new URL(request.url);
  const requestedStore =
    searchParams.get("storeId") || staff.storeCode || staff.storeId || "ranchi";
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "all";
  const inStockOnly = searchParams.get("inStockOnly") === "true";

  // Strict store permission guard
  if (!hasStoreAccess(staff, requestedStore)) {
    return NextResponse.json(
      {
        success: false,
        message: "Forbidden. You do not have access to this store.",
      },
      { status: 403, headers },
    );
  }

  const storeId = (requestedStore.toLowerCase() || "ranchi") as StoreId;
  const products = await searchStoreProducts({
    storeId,
    query,
    category,
    inStockOnly,
  });

  return NextResponse.json(
    {
      success: true,
      storeId,
      totalCount: products.length,
      data: products,
    },
    { headers },
  );
}
