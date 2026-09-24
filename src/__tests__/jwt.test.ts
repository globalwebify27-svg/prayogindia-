import { describe, it, expect } from "vitest";
import { signSessionToken, verifySessionToken } from "../lib/jwt";

describe("Cryptographic JWT Session Token Hardening", () => {
  it("should successfully sign and verify a valid user session token", async () => {
    const payload = {
      id: "usr_admin_test_123",
      email: "admin@prayogindia.in",
      name: "Admin User",
      role: "ADMIN",
    };

    const token = await signSessionToken(payload, "1h");
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3); // Header.Payload.Signature

    const verified = await verifySessionToken<typeof payload>(token);
    expect(verified).not.toBeNull();
    expect(verified?.id).toBe(payload.id);
    expect(verified?.email).toBe(payload.email);
    expect(verified?.role).toBe(payload.role);
  });

  it("should reject tampered or forged JWT tokens", async () => {
    const payload = { id: "usr_attacker", role: "CUSTOMER" };
    const token = await signSessionToken(payload, "1h");

    // Tamper with the signature portion
    const parts = token.split(".");
    const forgedToken = `${parts[0]}.${parts[1]}.tampered_signature_payload_xyz`;

    const verified = await verifySessionToken(forgedToken);
    expect(verified).toBeNull();
  });

  it("should reject invalid and empty token inputs", async () => {
    expect(await verifySessionToken("")).toBeNull();
    expect(await verifySessionToken(null as any)).toBeNull();
    expect(await verifySessionToken(undefined as any)).toBeNull();
    expect(await verifySessionToken("not-a-valid-jwt-token")).toBeNull();
  });
});
