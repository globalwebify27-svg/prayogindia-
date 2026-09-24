import { describe, it, expect } from "vitest";
import { normalizeEmail, sanitizeUser } from "../lib/authUtils";
import {
  generateStorageKey,
  ALLOWED_ATTACHMENT_MIME_TYPES,
} from "../lib/storage";
import { renderEmailTemplate } from "../lib/email";
import {
  sanitizeInput,
  redactSensitiveData,
  checkRateLimit,
} from "../lib/security";
import { PRODUCTS } from "../data/mockData";

describe("Prayog India Master End-to-End Integration Suite", () => {
  const masterTestUser = {
    id: "usr-e2e-master",
    name: "Master Test Customer",
    email: "master.e2e@prayogindia.com",
    role: "CUSTOMER" as const,
  };

  it("should normalize email and sanitize user objects without password leaks", () => {
    const cleanEmail = normalizeEmail("  Master.E2E@PrayogIndia.com  ");
    expect(cleanEmail).toBe("master.e2e@prayogindia.com");

    const sanitizedUser = sanitizeUser({
      ...masterTestUser,
      passwordHash: "$2b$12$secretHash...",
    } as any);
    expect((sanitizedUser as any).passwordHash).toBeUndefined();
  });

  it("should find matching products in catalog search", () => {
    const matches = PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes("drone") ||
        p.category.toLowerCase().includes("drone"),
    );
    expect(matches.length).toBeGreaterThan(0);
  });

  it("should generate secure storage keys and validate MIME types", () => {
    const safeStorageKey = generateStorageKey(
      "SUPPORT_ATTACHMENT",
      masterTestUser.id,
      "sensor_data.pdf",
    );
    expect(safeStorageKey.startsWith("support_attachment/usr-e2e-master/")).toBe(true);
    expect(safeStorageKey.endsWith(".pdf")).toBe(true);
    expect(ALLOWED_ATTACHMENT_MIME_TYPES.includes("application/pdf")).toBe(true);
  });

  it("should render transactional email templates properly", () => {
    const renderedEmail = renderEmailTemplate("ORDER_PLACED", {
      orderNumber: "PRG-2026-8888",
      totalAmount: 12999,
      shippingAddress: "Prayog Tech Park, Bengaluru - 560100",
    });

    expect(renderedEmail.subject).toContain("PRG-2026-8888");
    expect(renderedEmail.html).toContain("₹12,999");
  });

  it("should sanitize XSS and redact credentials in logs", () => {
    const xssPayload = "<script>alert(1)</script>";
    expect(sanitizeInput(xssPayload).includes("<script>")).toBe(false);

    const redactedLogs = redactSensitiveData({
      password: "secretPassword",
      token: "jwtToken",
    });
    expect(redactedLogs.password).toBe("[REDACTED]");
    expect(redactedLogs.token).toBe("[REDACTED]");
  });
});
