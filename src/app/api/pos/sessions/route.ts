// src/app/api/pos/sessions/route.ts
// Walk-in POS session persistence API
// Used by manager POS to poll for sessions from other devices

import { NextResponse } from "next/server";
import { getSecurityHeaders } from "@/lib/security";

// In-memory session store (resets on server restart, but that's acceptable for in-store use)
// In production this could be replaced with Redis or a DB table
const memoryStore: Record<string, object[]> = {};

export async function GET(request: Request) {
  const headers = getSecurityHeaders();
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get("storeId");

  if (!storeId) {
    return NextResponse.json(
      { success: false, message: "Missing storeId param" },
      { status: 400, headers },
    );
  }

  const sessions = memoryStore[storeId] || [];
  return NextResponse.json({ success: true, sessions }, { headers });
}

export async function POST(request: Request) {
  const headers = getSecurityHeaders();
  try {
    const body = await request.json();
    const { storeId, session } = body;

    if (!storeId || !session) {
      return NextResponse.json(
        { success: false, message: "Missing storeId or session" },
        { status: 400, headers },
      );
    }

    if (!memoryStore[storeId]) {
      memoryStore[storeId] = [];
    }

    // Upsert: replace existing session with same ID
    const existing = memoryStore[storeId].findIndex(
      (s: any) => s.id === session.id,
    );
    if (existing >= 0) {
      memoryStore[storeId][existing] = session;
    } else {
      memoryStore[storeId].unshift(session);
    }

    // Keep at most 100 sessions per store
    if (memoryStore[storeId].length > 100) {
      memoryStore[storeId] = memoryStore[storeId].slice(0, 100);
    }

    // Sync to persistent store orders log so it immediately shows in the store's Branch Orders page
    try {
      const globalForOrders = globalThis as unknown as {
        _PRAYOG_STORE_ORDERS_LOG: any[] | undefined;
      };
      if (globalForOrders._PRAYOG_STORE_ORDERS_LOG) {
        const orderRecord = {
          id: session.id,
          orderNumber: session.id,
          invoiceNo: session.invoiceNo || session.id,
          storeId: storeId.toLowerCase(),
          storeCode: storeId.toUpperCase(),
          storeLocation: `${storeId.toUpperCase()} Branch`,
          customerName: session.customerName || "Walk-in Guest",
          customerPhone: session.customerPhone || "",
          customerEmail: session.customerEmail || "",
          customerType: "WALK_IN",
          orderSource: "WALK_IN",
          channelName: "🏬 Store Walk-in POS",
          paymentMethod: session.paymentMethod || "CASH",
          paymentStatus: session.status === "PAID" ? "PAID" : "PENDING",
          isPaid: session.status === "PAID",
          orderStatus: session.status === "PAID" ? "DELIVERED" : "PENDING",
          status:
            session.status === "PAID" ? "PAID & BILLED" : "NEW KIOSK ORDER",
          subtotal: session.subtotal || session.total,
          discount: 0,
          gstAmount: session.gstAmount || 0,
          totalAmount: session.total,
          grandTotal: session.total,
          items:
            session.items?.map((it: any) => ({
              name: it.name || it.productName,
              quantity: it.quantity,
              unitPrice: it.price || it.unitPrice,
              total: (it.price || it.unitPrice || 0) * (it.quantity || 1),
            })) || [],
          createdAt: session.createdAt || new Date().toISOString(),
        };

        const existingIdx = globalForOrders._PRAYOG_STORE_ORDERS_LOG.findIndex(
          (o: any) => o.id === session.id || o.orderNumber === session.id,
        );
        if (existingIdx >= 0) {
          globalForOrders._PRAYOG_STORE_ORDERS_LOG[existingIdx] = orderRecord;
        } else {
          globalForOrders._PRAYOG_STORE_ORDERS_LOG.unshift(orderRecord);
        }
      }
    } catch (syncErr) {
      console.warn("Notice: Order log sync warning in pos/sessions:", syncErr);
    }

    return NextResponse.json({ success: true, session }, { headers });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers },
    );
  }
}

export async function PATCH(request: Request) {
  const headers = getSecurityHeaders();
  try {
    const body = await request.json();
    const { storeId, sessionId, updates } = body;

    if (!storeId || !sessionId || !updates) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400, headers },
      );
    }

    if (!memoryStore[storeId]) {
      return NextResponse.json(
        { success: false, message: "No sessions for store" },
        { status: 404, headers },
      );
    }

    const idx = memoryStore[storeId].findIndex((s: any) => s.id === sessionId);
    if (idx < 0) {
      return NextResponse.json(
        { success: false, message: "Session not found" },
        { status: 404, headers },
      );
    }

    memoryStore[storeId][idx] = {
      ...(memoryStore[storeId][idx] as object),
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Also update persistent store orders log
    try {
      const globalForOrders = globalThis as unknown as {
        _PRAYOG_STORE_ORDERS_LOG: any[] | undefined;
      };
      if (globalForOrders._PRAYOG_STORE_ORDERS_LOG) {
        const order = globalForOrders._PRAYOG_STORE_ORDERS_LOG.find(
          (o: any) => o.id === sessionId || o.orderNumber === sessionId,
        );
        if (order) {
          if (updates.status === "PAID") {
            order.status = "PAID & BILLED";
            order.isPaid = true;
            order.paymentStatus = "PAID";
            order.orderStatus = "DELIVERED";
          }
          if (updates.invoiceNo) {
            order.invoiceNo = updates.invoiceNo;
          }
        }
      }
    } catch {}

    return NextResponse.json(
      { success: true, session: memoryStore[storeId][idx] },
      { headers },
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers },
    );
  }
}
