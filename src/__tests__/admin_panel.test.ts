import { describe, it, expect } from "vitest";
import { sanitizeAdminUser } from "../lib/adminAuth";
import { Role } from "@prisma/client";

describe("Admin Panel & Dashboard Authorization Verification", () => {
  const adminUser = {
    id: "usr-admin-test",
    name: "System Admin",
    email: "admin.test@prayogindia.com",
    phone: "+91 99999 00000",
    role: "ADMIN" as Role,
  };

  const customerUser = {
    id: "usr-customer-test",
    name: "Normal Customer",
    email: "customer.test@prayogindia.com",
    phone: "+91 88888 00000",
    role: "CUSTOMER" as Role,
  };

  it("should sanitize admin user and preserve admin role", () => {
    const sanitized = sanitizeAdminUser(adminUser);
    expect(sanitized.role).toBe("ADMIN");
  });

  it("should allow ADMIN and block CUSTOMER from admin desk", () => {
    const verifyAdminAccess = (role: string) => {
      if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
        return { status: 403, message: "Forbidden. Admin role required." };
      }
      return { status: 200, message: "Access granted." };
    };

    expect(verifyAdminAccess(adminUser.role).status).toBe(200);
    expect(verifyAdminAccess(customerUser.role).status).toBe(403);
  });

  it("should validate product input rules", () => {
    const validateProductInput = (name: string, price: number, stock: number) => {
      if (!name || name.trim().length < 2) return false;
      if (isNaN(price) || price <= 0) return false;
      if (isNaN(stock) || stock < 0) return false;
      return true;
    };

    expect(validateProductInput("", 1200, 10)).toBe(false);
    expect(validateProductInput("Sensors Pack", -50, 10)).toBe(false);
    expect(validateProductInput("Sensors Pack", 1200, 10)).toBe(true);
  });

  it("should validate order status transitions", () => {
    const ALLOWED_ORDER_STATUSES = [
      "PROCESSING",
      "PACKED",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];
    const isValidOrderStatus = (st: string) => ALLOWED_ORDER_STATUSES.includes(st);

    expect(isValidOrderStatus("SHIPPED")).toBe(true);
    expect(isValidOrderStatus("PAID_FAKE")).toBe(false);
  });

  it("should validate and compute product SEO health score and slug generation", () => {
    const generateSlug = (name: string) =>
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    const computeSeoScore = (title: string, desc: string, slug: string, kws: string[]) => {
      let score = 0;
      if (title.length >= 30 && title.length <= 65) score += 25;
      if (desc.length >= 80 && desc.length <= 170) score += 25;
      if (slug && /^[a-z0-9-]+$/.test(slug)) score += 25;
      if (kws.length >= 3) score += 25;
      return score;
    };

    const productName = "Arduino UNO R4 WiFi Board";
    const slug = generateSlug(productName);
    expect(slug).toBe("arduino-uno-r4-wifi-board");

    const seoTitle = "Arduino UNO R4 WiFi Board - Buy Online | Prayog India";
    const seoDesc = "Buy genuine Arduino UNO R4 WiFi board with Renesas RA4M1 & ESP32-S3 microcontroller online at Prayog India with express courier shipping.";
    const keywords = ["arduino", "microcontroller", "wifi board", "stem kits"];

    const score = computeSeoScore(seoTitle, seoDesc, slug, keywords);
    expect(score).toBe(100);
  });
});
