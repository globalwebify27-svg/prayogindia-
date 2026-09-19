import { NextResponse } from "next/server";
import { getAuthenticatedStaff, hasStoreAccess } from "@/lib/staffAuth";
import { MOCK_CUSTOMER_ORDERS } from "@/data/accountData";
import { getSecurityHeaders } from "@/lib/security";
import {
  validateCartForStore,
  deductStoreInventory,
  getProductPriceForStore,
} from "@/lib/inventoryEngine";
import { StoreId, STORES } from "@/data/storeConfig";

// In-memory persistent order record store
const STORE_ORDERS_LOG: any[] = [];

// GET /api/store/orders - Store-scoped Orders Endpoint
export async function GET(request: Request) {
  const headers = getSecurityHeaders();
  const staff = await getAuthenticatedStaff();

  if (!staff) {
    return NextResponse.json(
      { success: false, message: "Unauthorized. Staff session required." },
      { status: 401, headers },
    );
  }

  const { searchParams } = new URL(request.url);
  const requestedStore =
    searchParams.get("storeId") || staff.storeCode || staff.storeId;

  // Enforce Backend Store Authorization Check
  if (!hasStoreAccess(staff, requestedStore)) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Forbidden: You do not have permission to view data from other stores.",
      },
      { status: 403, headers },
    );
  }

  const activeStoreCode = (
    staff.role === "SUPER_ADMIN"
      ? requestedStore || "RANCHI"
      : staff.storeCode || "RANCHI"
  ).toUpperCase();
  const storeId = activeStoreCode.toLowerCase() as StoreId;

  // Strictly filter only local in-store walk-in POS orders for this branch
  // Website and Mobile App orders are isolated to Super Admin only.
  const dynamicOrders = STORE_ORDERS_LOG.filter(
    (o) =>
      o.storeCode?.toUpperCase() === activeStoreCode &&
      o.orderSource === "WALK_IN",
  );

  return NextResponse.json(
    {
      success: true,
      store: activeStoreCode,
      data: {
        items: dynamicOrders,
        total: dynamicOrders.length,
      },
    },
    { headers },
  );
}

// POST /api/store/orders - Authoritative Walk-in POS Order Creation
export async function POST(request: Request) {
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

  try {
    const body = await request.json();
    const {
      storeId: rawStoreId,
      items,
      customerName = "Walk-in Customer",
      customerPhone = "",
      customerEmail = "",
      paymentMethod = "CASH",
      discount = 0,
      notes = "",
    } = body;

    // Backend derives and validates store authorization
    const targetStore = (
      staff.role === "SUPER_ADMIN"
        ? rawStoreId || staff.storeCode || "ranchi"
        : staff.storeCode || staff.storeId || "ranchi"
    ).toLowerCase() as StoreId;

    if (!hasStoreAccess(staff, targetStore)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Forbidden. You do not have authority to place orders for this store.",
        },
        { status: 403, headers },
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Cart items cannot be empty." },
        { status: 400, headers },
      );
    }

    // 1. Authoritative Backend Cart Stock Validation
    const validation = await validateCartForStore({
      storeId: targetStore,
      items: items.map((i: any) => ({
        productId: i.productId || i.id,
        quantity: i.quantity,
      })),
    });

    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Order validation failed: One or more products have insufficient stock.",
          errors: validation.errors,
        },
        { status: 400, headers },
      );
    }

    const orderId = `ORD-${targetStore.toUpperCase()}-${Date.now().toString().slice(-6)}`;
    const invoiceNo = `POS-${targetStore.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;

    let subtotal = 0;
    const processedItems = [];

    // 2. Atomic Stock Deduction per Item with Audit Logging
    for (const item of items) {
      const pid = item.productId || item.id;
      const qty = item.quantity || 1;
      const unitPrice = await getProductPriceForStore(pid, targetStore);

      const deductionResult = await deductStoreInventory({
        productId: pid,
        quantity: qty,
        orderSource: "WALK_IN",
        storeId: targetStore,
        orderId,
        userId: staff.id,
        deviceId: staff.deviceId || "POS-DEFAULT",
      });

      if (!deductionResult.success) {
        return NextResponse.json(
          { success: false, message: deductionResult.message },
          { status: 400, headers },
        );
      }

      const itemTotal = unitPrice * qty;
      subtotal += itemTotal;

      processedItems.push({
        productId: pid,
        name: item.name,
        sku: item.sku,
        quantity: qty,
        unitPrice,
        total: itemTotal,
      });
    }

    const gstAmount = Math.round(subtotal * 0.18 * 100) / 100;
    const grandTotal = Math.max(0, subtotal + gstAmount - discount);

    const orderRecord = {
      id: orderId,
      invoiceNo,
      orderNumber: orderId,
      storeId: targetStore,
      storeCode: targetStore.toUpperCase(),
      storeLocation: STORES[targetStore]?.name || `${targetStore} Store`,
      deviceId: staff.deviceId || "POS-01",
      cashierId: staff.id,
      cashierName: staff.name,
      customerName,
      customerPhone,
      customerEmail,
      customerType: "WALK_IN",
      orderSource: "WALK_IN",
      items: processedItems,
      subtotal,
      discount,
      gstAmount,
      totalAmount: grandTotal,
      grandTotal,
      paymentMethod,
      paymentStatus: "PAID",
      orderStatus: "DELIVERED",
      notes,
      createdAt: new Date().toISOString(),
    };

    STORE_ORDERS_LOG.unshift(orderRecord);

    return NextResponse.json(
      {
        success: true,
        message: `Walk-in order ${orderId} placed and inventory successfully deducted from ${STORES[targetStore]?.name}.`,
        order: orderRecord,
      },
      { headers },
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to process POS walk-in order",
      },
      { status: 500, headers },
    );
  }
}
