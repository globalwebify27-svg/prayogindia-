import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedStaff } from "@/lib/staffAuth";
import { getSecurityHeaders } from "@/lib/security";
import { adjustStoreInventory } from "@/lib/inventoryEngine";
import { StoreId } from "@/data/storeConfig";
import { recordAuditLog } from "@/lib/auditLogger";

// POST /api/admin/purchases/[id]/receive — Record goods receipt & update inventory
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const headers = getSecurityHeaders();
  const staff = await getAuthenticatedStaff();
  const { id: purchaseOrderId } = await params;

  if (
    !staff ||
    (staff.role !== "SUPER_ADMIN" &&
      staff.role !== "REGIONAL_MANAGER" &&
      staff.role !== "STORE_MANAGER")
  ) {
    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403, headers },
    );
  }

  try {
    const body = await request.json();
    // items: Array<{ purchaseOrderItemId: string, receivedQty: number }>
    const { items, notes } = body;

    if (!items?.length) {
      return NextResponse.json(
        { success: false, message: "No items provided for receiving" },
        { status: 400, headers },
      );
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { success: false, message: "Database not configured" },
        { status: 503, headers },
      );
    }

    // Load the PO
    const po = await db.purchaseOrder.findUnique({
      where: { id: purchaseOrderId },
      include: {
        store: true,
        items: { include: { product: true } },
      },
    });

    if (!po)
      return NextResponse.json(
        { success: false, message: "Purchase order not found" },
        { status: 404, headers },
      );

    // Store Manager scope check
    if (
      staff.role === "STORE_MANAGER" &&
      staff.storeId &&
      po.storeId !== staff.storeId
    ) {
      return NextResponse.json(
        { success: false, message: "Forbidden — not your store" },
        { status: 403, headers },
      );
    }

    if (po.status === "CANCELLED") {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot receive stock for a cancelled purchase order",
        },
        { status: 409, headers },
      );
    }

    // Generate receipt number
    const receiptCount = await db.goodsReceipt.count();
    const receiptNumber = `GR-${new Date().getFullYear()}-${String(receiptCount + 1).padStart(4, "0")}`;

    // Resolve store code for inventory engine
    const storeCode = (po.store.code || "RANCHI").toLowerCase() as StoreId;

    // Validate and prepare receipt items
    const receiptItems: any[] = [];
    const inventoryUpdates: Array<{
      productId: string;
      productDbId: string;
      receivedQty: number;
      productName: string;
    }> = [];

    for (const incoming of items) {
      const poItem = po.items.find(
        (i) => i.id === incoming.purchaseOrderItemId,
      );
      if (!poItem) continue;

      const maxReceivable = poItem.orderedQty - poItem.receivedQty;
      const actualReceived = Math.min(incoming.receivedQty, maxReceivable);
      if (actualReceived <= 0) continue;

      receiptItems.push({
        purchaseOrderItemId: poItem.id,
        receivedQty: actualReceived,
      });
      inventoryUpdates.push({
        productId: poItem.product.sku, // inventoryEngine uses SKU or ID
        productDbId: poItem.productId,
        receivedQty: actualReceived,
        productName: poItem.productName,
      });
    }

    if (!receiptItems.length) {
      return NextResponse.json(
        { success: false, message: "No valid quantities to receive" },
        { status: 400, headers },
      );
    }

    // Create goods receipt record
    const receipt = await db.goodsReceipt.create({
      data: {
        receiptNumber,
        purchaseOrderId,
        receivedByStaffId: staff.id,
        notes: notes || null,
        items: { create: receiptItems },
      },
    });

    // Update each PurchaseOrderItem's receivedQty and pendingQty
    for (const item of receiptItems) {
      const poItem = po.items.find((i) => i.id === item.purchaseOrderItemId)!;
      const newReceived = poItem.receivedQty + item.receivedQty;
      const newPending = poItem.orderedQty - newReceived;

      await db.purchaseOrderItem.update({
        where: { id: item.purchaseOrderItemId },
        data: { receivedQty: newReceived, pendingQty: newPending },
      });
    }

    // Update store inventory for each received product
    for (const inv of inventoryUpdates) {
      // Use the in-memory inventory engine
      try {
        adjustStoreInventory({
          storeId: storeCode,
          productId: inv.productId,
          quantityChange: inv.receivedQty,
          transactionType: "RESTOCK",
          reason: `PO ${po.poNumber} — GR ${receiptNumber}`,
          userId: staff.id,
          deviceId: staff.deviceId || "ADMIN-CONSOLE",
        });
      } catch (engErr) {
        console.warn("Inventory engine update skipped:", engErr);
      }

      // Persist to DB StoreInventory
      try {
        const dbProduct = await db.product.findFirst({
          where: { OR: [{ id: inv.productDbId }, { sku: inv.productId }] },
        });

        if (dbProduct) {
          await db.storeInventory.upsert({
            where: {
              storeId_productId: {
                storeId: po.storeId,
                productId: dbProduct.id,
              },
            },
            update: {
              quantity: { increment: inv.receivedQty },
              availableQuantity: { increment: inv.receivedQty },
            },
            create: {
              storeId: po.storeId,
              productId: dbProduct.id,
              quantity: inv.receivedQty,
              availableQuantity: inv.receivedQty,
              status: "IN_STOCK",
            },
          });

          // Write audit trail entry
          const inv_record = await db.storeInventory.findUnique({
            where: {
              storeId_productId: {
                storeId: po.storeId,
                productId: dbProduct.id,
              },
            },
          });

          await db.inventoryTransaction.create({
            data: {
              storeId: po.storeId,
              productId: dbProduct.id,
              transactionType: "RESTOCK",
              quantityBefore: (inv_record?.quantity ?? 0) - inv.receivedQty,
              quantityChange: inv.receivedQty,
              quantityAfter: inv_record?.quantity ?? inv.receivedQty,
              userId: staff.id,
              referenceId: receipt.id,
              notes: `Goods Receipt ${receiptNumber} — PO ${po.poNumber}`,
            },
          });
        }
      } catch (dbErr) {
        console.warn("DB inventory sync skipped:", dbErr);
      }
    }

    // Determine new PO status: all items received → RECEIVED, else PARTIALLY_RECEIVED
    const updatedItems = await db.purchaseOrderItem.findMany({
      where: { purchaseOrderId },
    });
    const allReceived = updatedItems.every((i) => i.pendingQty <= 0);
    const newPoStatus = allReceived ? "RECEIVED" : "PARTIALLY_RECEIVED";

    await db.purchaseOrder.update({
      where: { id: purchaseOrderId },
      data: { status: newPoStatus },
    });

    // Record Immutable Audit Log for Goods Receipt
    await recordAuditLog({
      actionCategory: "SUPPLIER_PROCUREMENT",
      action: "PURCHASE_RECEIVE_STOCK",
      entityType: "PurchaseOrder",
      entityId: purchaseOrderId,
      description: `Goods Receipt ${receiptNumber} logged for PO #${po.poNumber}. Total items received: ${receiptItems.reduce((s, i) => s + i.receivedQty, 0)}. PO Status: ${newPoStatus}`,
      actor: staff,
      storeId: po.storeId,
      previousValue: {
        status: po.status,
      },
      newValue: {
        status: newPoStatus,
        receiptNumber,
        receivedItemsCount: receiptItems.length,
      },
      metadata: {
        poNumber: po.poNumber,
        storeName: po.store.name,
        notes: notes || null,
      },
      req: request,
    });

    return NextResponse.json(
      {
        success: true,
        message: `${receiptItems.reduce((s, i) => s + i.receivedQty, 0)} units received. Inventory updated. PO status: ${newPoStatus}.`,
        receiptNumber,
        data: { receiptId: receipt.id, newPoStatus },
      },
      { headers },
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers },
    );
  }
}

// GET /api/admin/purchases/[id]/receive — List all goods receipts for a PO
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const headers = getSecurityHeaders();
  const staff = await getAuthenticatedStaff();
  const { id: purchaseOrderId } = await params;

  if (!staff)
    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403, headers },
    );

  if (process.env.DATABASE_URL) {
    try {
      const receipts = await db.goodsReceipt.findMany({
        where: { purchaseOrderId },
        include: {
          items: {
            include: {
              purchaseOrderItem: {
                include: {
                  product: { select: { id: true, name: true, sku: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ success: true, data: receipts }, { headers });
    } catch (error: any) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500, headers },
      );
    }
  }

  return NextResponse.json({ success: true, data: [] }, { headers });
}
