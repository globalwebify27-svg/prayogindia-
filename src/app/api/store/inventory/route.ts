import { NextResponse } from "next/server";
import { getAuthenticatedStaff, hasStoreAccess } from "@/lib/staffAuth";
import { db } from "@/lib/db";
import { getSecurityHeaders } from "@/lib/security";
import { StoreId } from "@/data/storeConfig";

// GET /api/store/inventory - Store-scoped Inventory Data
export async function GET(request: Request) {
  const headers = getSecurityHeaders();
  const staff = await getAuthenticatedStaff();

  if (
    !staff ||
    (staff.role !== "STORE_MANAGER" && staff.role !== "SUPER_ADMIN")
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "Forbidden. Store Manager or Admin access required.",
      },
      { status: 403, headers },
    );
  }

  const { searchParams } = new URL(request.url);
  const targetStore =
    searchParams.get("storeId") || staff.storeCode || staff.storeId;

  // Enforce server-side store authorization
  if (staff.role === "STORE_MANAGER" && !hasStoreAccess(staff, targetStore)) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Forbidden: Store Manager cannot access other stores inventory.",
      },
      { status: 403, headers },
    );
  }

  const rawStore =
    staff.role === "STORE_MANAGER"
      ? staff.storeCode || "RANCHI"
      : targetStore || "RANCHI";
  const activeStoreCode = (
    rawStore ? rawStore.toLowerCase() : "ranchi"
  ) as StoreId;
  const isCentral = activeStoreCode === "ranchi";

  // Resolve store DB id
  const dbStore = await db.store.findFirst({
    where: {
      OR: [{ code: activeStoreCode.toUpperCase() }, { id: activeStoreCode }],
    },
  });

  if (!dbStore) {
    return NextResponse.json(
      { success: false, message: "Store not found." },
      { status: 404, headers },
    );
  }

  const invRows = await db.storeInventory.findMany({
    where: { storeId: dbStore.id },
    include: {
      product: {
        include: {
          category: { select: { name: true } },
          images: {
            select: { imageUrl: true },
            orderBy: { sortOrder: "asc" },
            take: 1,
          },
        },
      },
    },
  });

  const storeInventory = invRows.map((inv) => ({
    id: inv.product.id,
    name: inv.product.name,
    sku: inv.product.sku,
    category: inv.product.category?.name ?? "",
    price: inv.product.price,
    image:
      (inv.product.images as Array<{ imageUrl: string }>)?.[0]?.imageUrl ?? "",
    storeCode: activeStoreCode.toUpperCase(),
    isCentralInventory: isCentral,
    localStock: inv.availableQuantity,
    quantity: inv.quantity,
    reservedQuantity: inv.reservedQuantity,
    reorderThreshold: inv.reorderLevel,
    lowStockThreshold: inv.lowStockThreshold,
    status:
      inv.availableQuantity === 0
        ? "Out of Stock"
        : inv.availableQuantity <= inv.lowStockThreshold
          ? "Low Stock"
          : "Optimal",
    dbStatus: inv.status,
    updatedAt: inv.updatedAt.toISOString(),
  }));

  return NextResponse.json(
    {
      success: true,
      store: activeStoreCode.toUpperCase(),
      isCentralInventory: isCentral,
      data: {
        items: storeInventory,
        totalUnits: storeInventory.reduce(
          (acc, curr) => acc + curr.quantity,
          0,
        ),
        lowStockCount: storeInventory.filter((i) => i.status === "Low Stock")
          .length,
        outOfStockCount: storeInventory.filter(
          (i) => i.status === "Out of Stock",
        ).length,
      },
    },
    { headers },
  );
}
