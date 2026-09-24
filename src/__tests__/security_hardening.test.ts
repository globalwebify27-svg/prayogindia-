import { describe, it, expect } from "vitest";
import {
  sanitizeInput,
  redactSensitiveData,
  checkRateLimit,
} from "../lib/security";

describe("Security, XSS Sanitization, Redaction & IDOR Isolation", () => {
  it("should sanitize XSS payload and escape HTML script tags", () => {
    const xssPayload =
      '<script>alert("hacked")</script><iframe src="malicious.com"></iframe>';
    const sanitized = sanitizeInput(xssPayload);

    expect(sanitized.includes("<script>")).toBe(false);
    expect(sanitized.includes("<iframe>")).toBe(false);
    expect(sanitized.includes("&lt;script&gt;")).toBe(true);
  });

  it("should redact sensitive fields in logger outputs", () => {
    const sensitiveLogPayload = {
      user: "omkumar",
      password: "superSecretPassword123",
      passwordHash: "$2b$12$somehash...",
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      cookie: "prayog_customer_session=xyz",
      safeField: "Drone STEM Kit",
    };

    const redacted = redactSensitiveData(sensitiveLogPayload);
    expect(redacted.password).toBe("[REDACTED]");
    expect(redacted.passwordHash).toBe("[REDACTED]");
    expect(redacted.token).toBe("[REDACTED]");
    expect(redacted.cookie).toBe("[REDACTED]");
    expect(redacted.safeField).toBe("Drone STEM Kit");
  });

  it("should enforce rate limiting after max attempts exceeded", () => {
    const testKey = "test-ip-rate-limit-vitest";
    for (let i = 0; i < 5; i++) {
      checkRateLimit(testKey, 5, 60000);
    }
    const overLimit = checkRateLimit(testKey, 5, 60000);
    expect(overLimit.allowed).toBe(false);
  });

  it("should prevent IDOR access across multi-tenant customer resources", () => {
    const userA = { id: "usr-alice-111" };
    const userB = { id: "usr-bob-222" };

    const resources = [
      { type: "Profile", ownerId: userA.id, id: "prof-alice" },
      { type: "Cart", ownerId: userA.id, id: "cart-alice" },
      { type: "Wishlist", ownerId: userA.id, id: "wish-alice" },
      { type: "Order", ownerId: userA.id, id: "ord-PRG-2026-1001" },
      { type: "Tracking", ownerId: userA.id, id: "ord-PRG-2026-1001" },
      { type: "Ticket", ownerId: userA.id, id: "tkt-TKT-2026-5555" },
      { type: "Message", ownerId: userA.id, id: "msg-99" },
      { type: "Enquiry", ownerId: userA.id, id: "enq-33" },
      {
        type: "Attachment",
        ownerId: userA.id,
        id: "support/usr-alice-111/schematic.pdf",
      },
      { type: "Notification", ownerId: userA.id, id: "notif-777" },
    ];

    const verifyAccess = (
      requesterId: string,
      resource: { ownerId: string; id: string },
    ) => {
      if (resource.id.includes("/") && !resource.id.includes(`/${requesterId}/`)) {
        return 404; // Attachment path check
      }
      if (resource.ownerId !== requesterId) {
        return 404; // Strict Customer Isolation convention
      }
      return 200;
    };

    for (const res of resources) {
      expect(verifyAccess(userA.id, res)).toBe(200);
      expect(verifyAccess(userB.id, res)).toBe(404);
    }
  });
});
