import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock customer & admin authentication for test environment
vi.mock("@/lib/authUtils", () => ({
  getAuthenticatedCustomer: vi.fn().mockResolvedValue({
    id: "usr-test-1",
    email: "test.customer@prayogindia.com",
    name: "Om Kumar",
    role: "CUSTOMER",
  }),
}));

vi.mock("@/lib/adminAuth", () => ({
  getAuthenticatedAdmin: vi.fn().mockResolvedValue({
    id: "admin-1",
    name: "Admin User",
    email: "admin@prayogindia.com",
    role: "SUPER_ADMIN",
  }),
}));

import { POST as cancelOrderRoute } from "@/app/api/orders/[id]/cancel/route";
import { CANCELLATION_REASONS } from "@/lib/cancellationConstants";
import { GET as getAdminCancellations } from "@/app/api/admin/cancellations/route";
import { GET as getAdminCancellationDetail, PATCH as patchAdminCancellation } from "@/app/api/admin/cancellations/[id]/route";
import { GET as exportCancellationsCSV } from "@/app/api/admin/cancellations/export/route";

describe("Production Order Cancellation System (Section 12 Test Matrix)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Scenario 1: Customer cancels newly placed COD order
  it("Scenario 1: Customer cancels a newly placed COD order - succeeds with Not Applicable refund", async () => {
    const req = new Request("http://localhost:3000/api/orders/ord-test-cod-1/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reason: "Ordered by mistake",
        orderNumber: "PRG-2026-COD-1",
        totalAmount: 1499,
        paymentMethod: "Cash on Delivery",
        status: "ORDER_PLACED",
      }),
    });

    const res = await cancelOrderRoute(req, { params: Promise.resolve({ id: "ord-test-cod-1" }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.orderStatus).toBe("CANCELLED");
    expect(json.data.refundStatus).toBe("Not Applicable");
    expect(json.data.refundAmount).toBe(0);
    expect(json.data.cancellationReferenceId).toMatch(/^CAN-\d{4}-[A-Z0-9]+$/);
  });

  // Scenario 2: Customer cancels a processing prepaid order
  it("Scenario 2: Customer cancels a processing prepaid order - initiates full refund to source", async () => {
    const req = new Request("http://localhost:3000/api/orders/ord-test-prepaid-1/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reason: "Delivery is taking too long",
        orderNumber: "PRG-2026-PRE-1",
        totalAmount: 14500,
        paymentMethod: "UPI",
        status: "PROCESSING",
      }),
    });

    const res = await cancelOrderRoute(req, { params: Promise.resolve({ id: "ord-test-prepaid-1" }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.orderStatus).toBe("CANCELLED");
    expect(json.data.refundStatus).toBe("Refund Initiated");
    expect(json.data.refundAmount).toBe(14500);
    expect(json.data.refundTransactionId).toMatch(/^RFD-/);
  });

  // Scenario 3: Customer selects each cancellation reason
  it("Scenario 3: Accepts all 6 required cancellation reasons", () => {
    const requiredReasons = [
      "Ordered by mistake",
      "Found a better price elsewhere",
      "Delivery is taking too long",
      "Want to change the product or quantity",
      "No longer need this product",
      "Other",
    ];

    requiredReasons.forEach((reason) => {
      expect(CANCELLATION_REASONS).toContain(reason);
    });
  });

  // Scenario 4: Customer selects Other without comment - rejects as comment is mandatory
  it("Scenario 4: Rejects 'Other' reason if customer comment is omitted", async () => {
    const req = new Request("http://localhost:3000/api/orders/ord-test-other/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reason: "Other",
        comment: "", // Empty comment
      }),
    });

    const res = await cancelOrderRoute(req, { params: Promise.resolve({ id: "ord-test-other" }) });
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.message).toContain("Please provide a reason or comment");
  });

  // Scenario 5: Customer tries to cancel a shipped or delivered order
  it("Scenario 5: Prevents cancellation when order is SHIPPED or DELIVERED", async () => {
    const req = new Request("http://localhost:3000/api/orders/ord-test-shipped/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reason: "Ordered by mistake",
        status: "SHIPPED",
      }),
    });

    const res = await cancelOrderRoute(req, { params: Promise.resolve({ id: "ord-test-shipped" }) });
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.message).toContain("Orders that are shipped, out for delivery, or delivered cannot be cancelled");
  });

  // Scenario 6: Customer submits invalid or missing reason
  it("Scenario 6: Rejects request if reason is omitted or invalid", async () => {
    const req = new Request("http://localhost:3000/api/orders/ord-invalid/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reason: "NonExistentReason",
      }),
    });

    const res = await cancelOrderRoute(req, { params: Promise.resolve({ id: "ord-invalid" }) });
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.message).toContain("Please select a valid cancellation reason");
  });

  // Scenario 7: Admin cancellation list and analytics metrics
  it("Scenario 7: Admin can list cancellations and retrieve aggregated KPIs", async () => {
    const req = new Request("http://localhost:3000/api/admin/cancellations");
    const res = await getAdminCancellations(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.items).toBeDefined();
    expect(json.data.metrics).toBeDefined();
    expect(json.data.metrics.totalCancelledOrders).toBeGreaterThanOrEqual(0);
    expect(json.data.metrics.cancellationRate).toBeGreaterThanOrEqual(0);
  });

  // Scenario 8: Admin views cancellation dossier
  it("Scenario 8: Admin views complete cancellation details and 6-stage timeline", async () => {
    const req = new Request("http://localhost:3000/api/admin/cancellations/PRG-2026-3101");
    const res = await getAdminCancellationDetail(req, { params: Promise.resolve({ id: "PRG-2026-3101" }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.orderInfo).toBeDefined();
    expect(json.data.customerInfo).toBeDefined();
    expect(json.data.cancellationInfo).toBeDefined();
    expect(json.data.paymentInfo).toBeDefined();
    expect(json.data.inventoryInfo).toBeDefined();
    expect(json.data.activityTimeline).toBeDefined();
  });

  // Scenario 9: Admin updates refund status & remarks
  it("Scenario 9: Admin can update refund status and append audit remarks", async () => {
    const req = new Request("http://localhost:3000/api/admin/cancellations/PRG-2026-3101", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        refundStatus: "Refund Completed",
        adminRemarks: "Verified via HDFC payment gateway console. UTR credited.",
      }),
    });

    const res = await patchAdminCancellation(req, { params: Promise.resolve({ id: "PRG-2026-3101" }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.refundStatus).toBe("Refund Completed");
    expect(json.data.adminRemarks).toContain("HDFC payment gateway");
  });

  // Scenario 10: Export CSV report
  it("Scenario 10: Admin can export cancellations as formatted CSV file", async () => {
    const req = new Request("http://localhost:3000/api/admin/cancellations/export");
    const res = await exportCancellationsCSV(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/csv");
    expect(res.headers.get("Content-Disposition")).toContain("Order_Cancellations_");

    const text = await res.text();
    expect(text).toContain("Order ID");
    expect(text).toContain("Cancellation Reference ID");
    expect(text).toContain("Refund Status");
  });
});
