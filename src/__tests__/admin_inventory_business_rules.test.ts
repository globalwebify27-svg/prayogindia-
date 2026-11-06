import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  deductStoreInventory,
  transferStockBetweenStores,
  validateCartForStore,
  updateStockTransferStatus,
  releaseOrderStockOnCancel,
} from "@/lib/inventoryEngine";

describe("Admin & Enterprise Inventory Business Rules", () => {
  describe("1. Channel Deduction Rules & Location Mapping", () => {
    it("deducts Website orders strictly from Ranchi Central Inventory", async () => {
      // Test deduction logic for ONLINE_WEB
      const deduction = await deductStoreInventory({
        productId: "prod-test-01",
        quantity: 2,
        orderSource: "ONLINE_WEB",
        orderId: "ORD-WEB-1001",
      });

      // Target store derived by engine should be ranchi
      expect(deduction.deductedFrom).toBe("ranchi");
    });

    it("deducts Mobile App orders strictly from Ranchi Central Inventory", async () => {
      const deduction = await deductStoreInventory({
        productId: "prod-test-02",
        quantity: 1,
        orderSource: "MOBILE_APP",
        orderId: "ORD-APP-2002",
      });

      expect(deduction.deductedFrom).toBe("ranchi");
    });

    it("deducts Ranchi Walk-in POS orders from Ranchi Store Inventory", async () => {
      const deduction = await deductStoreInventory({
        productId: "prod-test-03",
        quantity: 3,
        orderSource: "WALK_IN",
        storeId: "ranchi",
        orderId: "POS-RAN-3003",
      });

      expect(deduction.deductedFrom).toBe("ranchi");
    });

    it("deducts Patna Walk-in POS orders strictly from Patna Store Inventory", async () => {
      const deduction = await deductStoreInventory({
        productId: "prod-test-04",
        quantity: 1,
        orderSource: "WALK_IN",
        storeId: "patna",
        orderId: "POS-PAT-4004",
      });

      expect(deduction.deductedFrom).toBe("patna");
    });

    it("deducts Delhi Walk-in POS orders strictly from Delhi Store Inventory", async () => {
      const deduction = await deductStoreInventory({
        productId: "prod-test-05",
        quantity: 2,
        orderSource: "WALK_IN",
        storeId: "delhi",
        orderId: "POS-DEL-5005",
      });

      expect(deduction.deductedFrom).toBe("delhi");
    });

    it("deducts Mumbai Walk-in POS orders strictly from Mumbai Store Inventory", async () => {
      const deduction = await deductStoreInventory({
        productId: "prod-test-06",
        quantity: 1,
        orderSource: "WALK_IN",
        storeId: "mumbai",
        orderId: "POS-MUM-6006",
      });

      expect(deduction.deductedFrom).toBe("mumbai");
    });
  });

  describe("2. Inter-Store Stock Transfers & Multi-Stage State Machine", () => {
    it("rejects transfer when source and destination stores are identical", async () => {
      const result = await transferStockBetweenStores({
        sourceStoreId: "ranchi",
        destinationStoreId: "ranchi",
        items: [{ productId: "prod-01", quantity: 5 }],
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain("cannot be identical");
    });

    it("handles non-existent transfer gracefully when updating status", async () => {
      const result = await updateStockTransferStatus({
        transferId: "non-existent-transfer-id",
        status: "APPROVED",
      });

      expect(result.success).toBe(false);
      expect(result.message).toBeDefined();
    });
  });

  describe("3. Negative Stock Prevention & Cart Allocation", () => {
    it("validates cart against store inventory and detects insufficient stock", async () => {
      const validation = await validateCartForStore({
        storeId: "patna",
        items: [{ productId: "non-existent-sku-or-huge-qty", quantity: 999999 }],
      });

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors[0].message).toContain("Insufficient stock");
    });

    it("prevents over-allocation when requested quantity exceeds available stock", async () => {
      const validation = await validateCartForStore({
        storeId: "ranchi",
        items: [{ productId: "prod-test-oversell", quantity: 999999 }],
      });

      expect(validation.valid).toBe(false);
      expect(validation.errors[0].message).toContain("Requested: 999999");
    });
  });

  describe("4. Order Cancellation & Stock Release Safety", () => {
    it("safely handles non-existent or invalid orders without crashing", async () => {
      const result = await releaseOrderStockOnCancel("non-existent-order-id");
      expect(result.success).toBe(false);
      expect(result.message).toBeDefined();
    });
  });

  describe("5. Reports API Verification", () => {
    it("provides store-wise sales and inventory deduction structure", async () => {
      const { GET } = await import("@/app/api/admin/reports/route");
      const req = new Request("http://localhost:3000/api/admin/reports?dateRange=THIS_MONTH");
      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.storeSalesBreakdown).toBeDefined();
      expect(json.storeSalesBreakdown.RANCHI).toBeDefined();
      expect(json.storeSalesBreakdown.RANCHI.isCentralHub).toBe(true);
      expect(json.storeSalesBreakdown.PATNA).toBeDefined();
      expect(json.storeSalesBreakdown.DELHI).toBeDefined();
      expect(json.stockMovementDeductions).toBeDefined();
      expect(json.stockMovementDeductions.websiteOrders).toBeDefined();
      expect(json.stockMovementDeductions.mobileAppOrders).toBeDefined();
    });
  });
});

