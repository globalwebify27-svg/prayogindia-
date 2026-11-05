import { describe, it, expect, vi } from "vitest";
import { POST } from "../app/api/admin/products/bulk/route";

vi.mock("@/lib/adminAuth", () => ({
  getAuthenticatedAdmin: vi.fn().mockResolvedValue({
    id: "admin-test-id",
    username: "admin@prayogindia.com",
    role: "SUPER_ADMIN",
  }),
}));

describe("Bulk Product CSV Import API", () => {
  it("rejects request if products array is empty or missing", async () => {
    const req = new Request("http://localhost:3000/api/admin/products/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ products: [] }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it("successfully parses and registers products from CSV rows", async () => {
    const sampleCsvProducts = [
      {
        Name: "Test Bulk Sensor Module",
        SKU: "TEST-BULK-001",
        Brand: "Prayog India",
        Category: "Sensors & Modules",
        "Price (INR)": "299",
        "MRP (INR)": "499",
        Stock: "50",
        "Primary Image URL": "https://images.unsplash.com/photo-1553406830-ef2513450d76",
        "Meta Title": "Test Bulk Sensor Module | Buy Online",
        "Meta Description": "High precision STEM sensor module",
        "Key Features": "High sensitivity | 3.3V-5V logic",
        "Shipping Tag": "Standard Product",
      },
    ];

    const req = new Request("http://localhost:3000/api/admin/products/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        products: sampleCsvProducts,
        updateExisting: true,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.createdCount + json.updatedCount).toBe(1);
    expect(json.data.items.length).toBe(1);
    expect(json.data.items[0].sku).toBe("TEST-BULK-001");
  });

  it("handles rows with missing names gracefully by adding to errors list", async () => {
    const req = new Request("http://localhost:3000/api/admin/products/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        products: [
          {
            Name: "",
            SKU: "INVALID-NO-NAME",
          },
        ],
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.errors.length).toBe(1);
    expect(json.errors[0].error).toContain("Product Name is required");
  });
});
