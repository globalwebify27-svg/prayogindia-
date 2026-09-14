import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedStaff } from "@/lib/staffAuth";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import {
  getMultiStoreInventoryMatrix,
  getStoreInventory,
  adjustStoreInventory,
  getInventoryTransactions,
  TransactionType,
} from "@/lib/inventoryEngine";
import { StoreId, ALL_STORE_IDS } from "@/data/storeConfig";
import { getSecurityHeaders } from "@/lib/security";
import { recordAuditLog } from "@/lib/auditLogger";

// GET /api/admin/inventory - Multi-Store Matrix & Audit Trail
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

  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode"); // 'matrix' | 'store' | 'transactions'
  const storeIdParam = searchParams.get("storeId");
  const storeId = (storeIdParam?.toLowerCase() ||
    staff.storeCode?.toLowerCase() ||
    "ranchi") as StoreId;
  const q = searchParams.get("q")?.toLowerCase().trim() || "";

  // 1. Audit Trail Transactions Log
  if (mode === "transactions") {
    const transactions = getInventoryTransactions({
      storeId: storeIdParam
        ? (storeIdParam.toLowerCase() as StoreId)
        : undefined,
      transactionType:
        (searchParams.get("type") as TransactionType) || undefined,
      limit: parseInt(searchParams.get("limit") || "100", 10),
    });

    return NextResponse.json(
      {
        success: true,
        data: transactions,
        total: transactions.length,
      },
      { headers },
    );
  }

  // 2. Single Store View
  if (mode === "store") {
    let items = getStoreInventory(storeId);
    if (q) {
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.sku.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q),
      );
    }

    return NextResponse.json(
      {
        success: true,
        storeId,
        data: {
          items,
          totalUnits: items.reduce((sum, item) => sum + item.quantity, 0),
          lowStockCount: items.filter((i) => i.status === "LOW_STOCK").length,
          outOfStockCount: items.filter((i) => i.status === "OUT_OF_STOCK")
            .length,
        },
      },
      { headers },
    );
  }

  // 3. Multi-Store Matrix View (Default for Super Admin)
  let matrix = getMultiStoreInventoryMatrix();
  if (q) {
    matrix = matrix.filter(
      (m) =>
        (m?.name && m.name.toLowerCase().includes(q)) ||
        (m?.sku && m.sku.toLowerCase().includes(q)),
    );
  }

  return NextResponse.json(
    {
      success: true,
      availableStores: ALL_STORE_IDS,
      totalProducts: matrix.length,
      data: matrix,
    },
    { headers },
  );
}

// PATCH /api/admin/inventory - Store-Specific Stock Adjustment with Audit Trail
export async function PATCH(request: Request) {
  const headers = getSecurityHeaders();
  const staff =
    (await getAuthenticatedStaff()) || (await getAuthenticatedAdmin());

  if (
    !staff ||
    (staff.role !== "SUPER_ADMIN" &&
      staff.role !== "STORE_MANAGER" &&
      staff.role !== "REGIONAL_MANAGER")
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "Forbidden. Admin or Manager access required.",
      },
      { status: 403, headers },
    );
  }

  try {
    const body = await request.json();
    const {
      storeId: rawStoreId,
      productId,
      quantityChange,
      transactionType = "ADJUSTMENT",
      reason = "Manual Inventory Adjustment",
    } = body;

    const storeId = (
      rawStoreId ||
      staff.storeCode ||
      "ranchi"
    ).toLowerCase() as StoreId;

    if (!productId || typeof quantityChange !== "number") {
      return NextResponse.json(
        { success: false, message: "Invalid productId or quantityChange." },
        { status: 400, headers },
      );
    }

    const result = adjustStoreInventory({
      storeId,
      productId,
      quantityChange,
      transactionType,
      reason,
      userId: staff.id,
      deviceId: staff.deviceId || "ADMIN-CONSOLE",
    });

    // PostgreSQL Persistent Sync
    if (process.env.DATABASE_URL) {
      try {
        const dbStore = await db.store.findFirst({
          where: {
            OR: [
              { code: storeId.toUpperCase() },
              { id: storeId },
            ],
          },
        });

        const dbProduct = await db.product.findFirst({
          where: {
            OR: [
              { id: productId },
              { sku: productId },
            ],
          },
        });

        if (dbStore && dbProduct) {
          const invRecord = await db.storeInventory.upsert({
            where: {
              storeId_productId: {
                storeId: dbStore.id,
                productId: dbProduct.id,
              },
            },
            update: {
              quantity: result.newQuantity,
              availableQuantity: result.newQuantity,
              status:
                result.newQuantity === 0
                  ? "OUT_OF_STOCK"
                  : result.newQuantity <= 5
                    ? "LOW_STOCK"
                    : "IN_STOCK",
            },
            create: {
              storeId: dbStore.id,
              productId: dbProduct.id,
              quantity: result.newQuantity,
              availableQuantity: result.newQuantity,
              status:
                result.newQuantity === 0
                  ? "OUT_OF_STOCK"
                  : result.newQuantity <= 5
                    ? "LOW_STOCK"
                    : "IN_STOCK",
            },
          });

          await db.inventoryTransaction.create({
            data: {
              storeId: dbStore.id,
              productId: dbProduct.id,
              transactionType,
              quantityBefore: Math.max(0, result.newQuantity - quantityChange),
              quantityChange,
              quantityAfter: result.newQuantity,
              userId: staff.id,
              referenceId: invRecord.id,
              notes: reason || `Manual adjustment: ${transactionType}`,
            },
          });

          // Immutable Unified Audit Log
          await recordAuditLog({
            actionCategory: "INVENTORY",
            action: `INVENTORY_ADJUST_${transactionType}`,
            entityType: "ProductInventory",
            entityId: dbProduct.id,
            description: `Inventory adjusted by ${quantityChange > 0 ? "+" : ""}${quantityChange} for ${dbProduct.name} (${dbProduct.sku}) in ${dbStore.name}. Reason: ${reason || "Manual adjustment"}`,
            actor: staff,
            storeId: dbStore.id,
            previousValue: {
              productId: dbProduct.id,
              productName: dbProduct.name,
              sku: dbProduct.sku,
              quantity: Math.max(0, result.newQuantity - quantityChange),
            },
            newValue: {
              productId: dbProduct.id,
              productName: dbProduct.name,
              sku: dbProduct.sku,
              quantity: result.newQuantity,
            },
            metadata: {
              transactionType,
              quantityChange,
              reason: reason || null,
              deviceId: staff.deviceId || null,
            },
            req: request,
          });
        }
      } catch (dbErr) {
        console.warn("DB inventory sync skipped:", dbErr);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: result.message,
        data: result,
      },
      { headers },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to adjust inventory";
    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500, headers },
    );
  }
}
