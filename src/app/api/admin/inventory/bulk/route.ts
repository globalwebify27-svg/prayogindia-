import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedStaff, hasStoreAccess } from "@/lib/staffAuth";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { getSecurityHeaders } from "@/lib/security";
import { recordAuditLog } from "@/lib/auditLogger";
import { StoreId } from "@/data/storeConfig";
import { adjustStoreInventory } from "@/lib/inventoryEngine";

export interface BulkInventoryItemResult {
  productId: string;
  sku: string;
  name: string;
  success: boolean;
  previousQuantity: number;
  newQuantity: number;
  error?: string;
}

/**
 * POST /api/admin/inventory/bulk
 * Transactional Multi-Product Inventory Bulk Update
 *
 * Payload:
 * {
 *   storeId: "ranchi" | "patna" | "delhi" | "mumbai" | UUID,
 *   operation: "INCREMENT" | "SET" | "LOW_THRESHOLD",
 *   value: number,
 *   productIds: string[],
 *   reason?: string
 * }
 */
export async function POST(request: Request) {
  const headers = getSecurityHeaders();
  const staff =
    (await getAuthenticatedStaff()) || (await getAuthenticatedAdmin());

  if (!staff) {
    return NextResponse.json(
      { success: false, message: "Unauthorized. Staff session required." },
      { status: 401, headers },
    );
  }

  // Role validation
  const allowedRoles = [
    "SUPER_ADMIN",
    "REGIONAL_MANAGER",
    "STORE_MANAGER",
    "ADMIN",
  ];
  if (!allowedRoles.includes(staff.role as string)) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Forbidden. Admin or Manager role required to perform bulk inventory updates.",
      },
      { status: 403, headers },
    );
  }

  try {
    const body = await request.json();
    const {
      storeId: rawStoreId,
      operation = "INCREMENT",
      value,
      productIds,
      reason = "Bulk Inventory Update",
    } = body;

    if (!rawStoreId) {
      return NextResponse.json(
        { success: false, message: "Target storeId is required." },
        { status: 400, headers },
      );
    }

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "At least one productId must be selected." },
        { status: 400, headers },
      );
    }

    if (typeof value !== "number" || isNaN(value)) {
      return NextResponse.json(
        { success: false, message: "Valid numeric value is required." },
        { status: 400, headers },
      );
    }

    // 1. Resolve Store from Database
    const storeLookup = rawStoreId.toLowerCase();
    const store = await db.store.findFirst({
      where: {
        OR: [
          { id: rawStoreId },
          { code: rawStoreId.toUpperCase() },
          { code: storeLookup.toUpperCase() },
        ],
      },
    });

    if (!store) {
      return NextResponse.json(
        {
          success: false,
          message: `Store not found for identifier '${rawStoreId}'.`,
        },
        { status: 404, headers },
      );
    }

    // 2. Strict Store Authorization Guard
    if (!hasStoreAccess(staff as any, store.code)) {
      return NextResponse.json(
        {
          success: false,
          message: `Forbidden: You do not have permission to modify inventory for ${store.name} (${store.code}).`,
        },
        { status: 403, headers },
      );
    }

    // 3. Resolve Products
    const products = await db.product.findMany({
      where: {
        OR: [{ id: { in: productIds } }, { sku: { in: productIds } }],
      },
    });

    if (products.length === 0) {
      return NextResponse.json(
        { success: false, message: "No matching products found in catalog." },
        { status: 404, headers },
      );
    }

    // 4. Atomic PostgreSQL Transaction
    const itemResults: BulkInventoryItemResult[] = [];

    await db.$transaction(async (tx) => {
      for (const prod of products) {
        try {
          const existingInv = await tx.storeInventory.findUnique({
            where: {
              storeId_productId: {
                storeId: store.id,
                productId: prod.id,
              },
            },
          });

          const currentQty = existingInv ? existingInv.quantity : 0;
          let newQty = currentQty;
          let newLowThreshold = existingInv ? existingInv.lowStockThreshold : 5;

          if (operation === "INCREMENT") {
            newQty = Math.max(0, currentQty + Math.round(value));
          } else if (operation === "SET") {
            newQty = Math.max(0, Math.round(value));
          } else if (operation === "LOW_THRESHOLD") {
            newLowThreshold = Math.max(1, Math.round(value));
          }

          const newStatus =
            newQty === 0
              ? "OUT_OF_STOCK"
              : newQty <= newLowThreshold
                ? "LOW_STOCK"
                : "IN_STOCK";

          const qtyChange = newQty - currentQty;

          // Upsert StoreInventory record
          const updatedInv = await tx.storeInventory.upsert({
            where: {
              storeId_productId: {
                storeId: store.id,
                productId: prod.id,
              },
            },
            create: {
              storeId: store.id,
              productId: prod.id,
              quantity: newQty,
              availableQuantity: newQty,
              lowStockThreshold: newLowThreshold,
              status: newStatus,
            },
            update: {
              quantity: newQty,
              availableQuantity: Math.max(
                0,
                newQty - (existingInv?.reservedQuantity || 0),
              ),
              lowStockThreshold: newLowThreshold,
              status: newStatus,
            },
          });

          // Record InventoryTransaction if quantity actually changed
          if (qtyChange !== 0 || operation === "SET") {
            await tx.inventoryTransaction.create({
              data: {
                storeId: store.id,
                productId: prod.id,
                transactionType: qtyChange > 0 ? "RESTOCK" : "ADJUSTMENT",
                quantityBefore: currentQty,
                quantityChange: qtyChange,
                quantityAfter: newQty,
                userId: staff.id,
                referenceId: updatedInv.id,
                notes:
                  reason ||
                  `Bulk update: ${operation} (${qtyChange > 0 ? "+" : ""}${qtyChange})`,
              },
            });

            // Also keep in-memory engine sync
            try {
              adjustStoreInventory({
                storeId: store.code.toLowerCase() as StoreId,
                productId: prod.sku,
                quantityChange: qtyChange,
                transactionType: qtyChange > 0 ? "RESTOCK" : "ADJUSTMENT",
                reason,
                userId: staff.id,
              });
            } catch {}
          }

          itemResults.push({
            productId: prod.id,
            sku: prod.sku,
            name: prod.name,
            success: true,
            previousQuantity: currentQty,
            newQuantity: newQty,
          });
        } catch (itemErr: any) {
          itemResults.push({
            productId: prod.id,
            sku: prod.sku,
            name: prod.name,
            success: false,
            previousQuantity: 0,
            newQuantity: 0,
            error: itemErr.message || "Failed to update item",
          });
        }
      }
    });

    // 5. Unified System Audit Log
    const successfulItems = itemResults.filter((i) => i.success);
    await recordAuditLog({
      actionCategory: "INVENTORY",
      action: "INVENTORY_BULK_UPDATE",
      entityType: "ProductInventory",
      entityId: store.id,
      description: `Bulk inventory update (${operation}) applied to ${successfulItems.length} products in ${store.name} (${store.code}). Reason: ${reason}`,
      actor: staff,
      storeId: store.id,
      previousValue: null,
      newValue: {
        operation,
        value,
        storeCode: store.code,
        affectedProducts: successfulItems.map((s) => ({
          sku: s.sku,
          from: s.previousQuantity,
          to: s.newQuantity,
        })),
      },
      metadata: {
        totalRequested: productIds.length,
        totalUpdated: successfulItems.length,
        reason,
      },
      req: request,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Successfully applied bulk inventory update to ${successfulItems.length} items in ${store.name}.`,
        store: { id: store.id, name: store.name, code: store.code },
        operation,
        updatedCount: successfulItems.length,
        results: itemResults,
      },
      { headers },
    );
  } catch (error: any) {
    console.error("[Bulk Inventory Update Error]", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Bulk inventory update failed.",
      },
      { status: 500, headers },
    );
  }
}
