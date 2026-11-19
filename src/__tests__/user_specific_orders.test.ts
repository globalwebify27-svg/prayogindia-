import { describe, it, expect } from "vitest";

describe("User-Specific Order Filtering & Isolation", () => {
  it("should isolate orders strictly by user_id and email", () => {
    const mockTuxUser = {
      id: "usr_tux_123",
      email: "tuxgaming003@gmail.com",
      name: "Tux",
    };

    const mockBahubaliUser = {
      id: "usr_bahubali_456",
      email: "sultansusu09@gmail.com",
      name: "Bahubali",
    };

    const ordersInDbOrStorage = [
      {
        id: "ord-1",
        orderNumber: "PRG-2026-1001",
        userId: "usr_tux_123",
        customerEmail: "tuxgaming003@gmail.com",
        status: "DELIVERED",
        totalAmount: 6499,
        items: [{ productName: "ATL Official Starter Kit" }],
      },
      {
        id: "ord-2",
        orderNumber: "PRG-2026-1002",
        userId: "usr_tux_123",
        customerEmail: "tuxgaming003@gmail.com",
        status: "DELIVERED",
        totalAmount: 1200,
        items: [{ productName: "Test 2" }],
      },
      {
        id: "ord-3",
        orderNumber: "PRG-2026-6864",
        userId: "usr_bahubali_456",
        customerEmail: "sultansusu09@gmail.com",
        status: "PROCESSING",
        totalAmount: 2430,
        items: [{ productName: "Test 2" }],
      },
    ];

    // Filter for Bahubali
    const bahubaliOrders = ordersInDbOrStorage.filter(
      (o) =>
        o.userId === mockBahubaliUser.id ||
        o.customerEmail.toLowerCase() === mockBahubaliUser.email.toLowerCase()
    );

    expect(bahubaliOrders.length).toBe(1);
    expect(bahubaliOrders[0].orderNumber).toBe("PRG-2026-6864");
    expect(bahubaliOrders[0].totalAmount).toBe(2430);

    // Filter for Tux
    const tuxOrders = ordersInDbOrStorage.filter(
      (o) =>
        o.userId === mockTuxUser.id ||
        o.customerEmail.toLowerCase() === mockTuxUser.email.toLowerCase()
    );

    expect(tuxOrders.length).toBe(2);
    expect(tuxOrders.map((o) => o.orderNumber)).toContain("PRG-2026-1001");
    expect(tuxOrders.map((o) => o.orderNumber)).toContain("PRG-2026-1002");
    expect(tuxOrders.map((o) => o.orderNumber)).not.toContain("PRG-2026-6864");
  });

  it("should categorize user orders into the 6 standard order tabs correctly", () => {
    const userOrders = [
      { orderNumber: "ORD-P1", status: "ORDER_PLACED" },
      { orderNumber: "ORD-P2", status: "PAYMENT_CONFIRMED" },
      { orderNumber: "ORD-PR1", status: "PROCESSING" },
      { orderNumber: "ORD-PR2", status: "PACKED" },
      { orderNumber: "ORD-S1", status: "SHIPPED" },
      { orderNumber: "ORD-S2", status: "OUT_FOR_DELIVERY" },
      { orderNumber: "ORD-D1", status: "DELIVERED" },
      { orderNumber: "ORD-C1", status: "CANCELLED" },
    ];

    const isPending = (s: string) =>
      s.includes("PLACED") || s.includes("CONFIRMED") || s.includes("PENDING");
    const isProcessing = (s: string) =>
      s.includes("PROCESSING") || s.includes("PACKED");
    const isShipped = (s: string) =>
      s.includes("SHIPPED") || s.includes("OUT_FOR_DELIVERY");
    const isDelivered = (s: string) => s.includes("DELIVERED");
    const isCancelled = (s: string) => s.includes("CANCELLED");

    expect(userOrders.filter((o) => isPending(o.status)).length).toBe(2);
    expect(userOrders.filter((o) => isProcessing(o.status)).length).toBe(2);
    expect(userOrders.filter((o) => isShipped(o.status)).length).toBe(2);
    expect(userOrders.filter((o) => isDelivered(o.status)).length).toBe(1);
    expect(userOrders.filter((o) => isCancelled(o.status)).length).toBe(1);
  });

  it("should deny access when a user attempts to access another user's order details", () => {
    const authenticatedUser = {
      id: "usr_bahubali_456",
      email: "sultansusu09@gmail.com",
    };

    const targetOrder = {
      id: "ord-tux-1",
      orderNumber: "PRG-2026-1001",
      userId: "usr_tux_123",
      user: {
        email: "tuxgaming003@gmail.com",
      },
    };

    const isAuthorized =
      targetOrder.userId === authenticatedUser.id ||
      (targetOrder.user?.email &&
        targetOrder.user.email.toLowerCase() === authenticatedUser.email.toLowerCase());

    expect(isAuthorized).toBe(false);
  });

  it("should accurately filter orders when searching by order number (e.g. PRG-2026-7068)", () => {
    function matchesOrder(ord: any, rawQuery: string): boolean {
      if (!rawQuery || !rawQuery.trim()) return true;
      const q = rawQuery.toLowerCase().trim();
      const qClean = q.replace(/^#/, "");

      const orderNum = String(ord.orderNumber || "").toLowerCase();
      const orderId = String(ord.id || "").toLowerCase();
      if (
        orderNum.includes(q) ||
        orderNum.replace(/^#/, "").includes(qClean) ||
        orderId.includes(q) ||
        orderId.replace(/^#/, "").includes(qClean)
      ) {
        return true;
      }

      if (ord.customerName && String(ord.customerName).toLowerCase().includes(q)) return true;
      if (ord.customerEmail && String(ord.customerEmail).toLowerCase().includes(q)) return true;

      const rawPhone = String(ord.customerPhone || ord.user?.phone || "").replace(/\D/g, "");
      const qDigits = q.replace(/\D/g, "");
      if (qDigits.length >= 3 && rawPhone.includes(qDigits)) return true;

      if (Array.isArray(ord.items)) {
        for (const item of ord.items) {
          if (!item) continue;
          const itemName = String(item.productName || item.name || "").toLowerCase();
          const itemSku = String(item.productSku || item.sku || "").toLowerCase();
          if (itemName.includes(q) || itemSku.includes(q) || itemSku.includes(qClean)) {
            return true;
          }
        }
      }

      return false;
    }

    const testOrders = [
      {
        orderNumber: "WI-PAT-1794316722518",
        customerName: "Om Kumar",
        customerPhone: "8709789641",
        items: [{ productName: "Atal Tinkering Lab Kit", productSku: "PRG-ATL-001" }],
      },
      {
        orderNumber: "WI-PAT-1794307736187",
        customerName: "ओम कुमार",
        customerPhone: "8709789641",
        items: [{ productName: "Test 2", productSku: "PRG-ARD-001" }],
      },
      {
        orderNumber: "PRG-2026-7068",
        customerName: "Bahubali",
        customerPhone: "+91 9988776655",
        items: [{ productName: "Raspberry Pi 5", productSku: "PRG-RPI5-001" }],
      },
    ];

    // Search by exact order number PRG-2026-7068
    const exactResults = testOrders.filter((o) => matchesOrder(o, "PRG-2026-7068"));
    expect(exactResults.length).toBe(1);
    expect(exactResults[0].orderNumber).toBe("PRG-2026-7068");

    // Search with hashtag #PRG-2026-7068
    const hashResults = testOrders.filter((o) => matchesOrder(o, "#PRG-2026-7068"));
    expect(hashResults.length).toBe(1);
    expect(hashResults[0].orderNumber).toBe("PRG-2026-7068");

    // Search by partial suffix 7068
    const suffixResults = testOrders.filter((o) => matchesOrder(o, "7068"));
    expect(suffixResults.length).toBe(1);
    expect(suffixResults[0].orderNumber).toBe("PRG-2026-7068");

    // Search for walk-in order
    const walkinResults = testOrders.filter((o) => matchesOrder(o, "1794316722518"));
    expect(walkinResults.length).toBe(1);
    expect(walkinResults[0].orderNumber).toBe("WI-PAT-1794316722518");

    // Search non-existent query
    const noResults = testOrders.filter((o) => matchesOrder(o, "NON-EXISTENT-ORDER"));
    expect(noResults.length).toBe(0);
  });
});
