import { describe, it, expect, beforeEach } from "vitest";
import { POST as sendMobileOtpPOST } from "@/app/api/auth/mobile/send-otp/route";
import { POST as verifyMobileOtpPOST } from "@/app/api/auth/mobile/verify-otp/route";
import { POST as completeProfilePOST } from "@/app/api/auth/complete-profile/route";
import { POST as sendEmailOtpPOST } from "@/app/api/auth/email/send-otp/route";
import { POST as verifyEmailOtpPOST } from "@/app/api/auth/email/verify-otp/route";
import { POST as googleAuthPOST } from "@/app/api/auth/google/route";
import { POST as linkIdentityPOST } from "@/app/api/auth/link-identity/route";
import { GET as getAddressesGET, POST as postAddressPOST } from "@/app/api/customers/me/addresses/route";
import { PATCH as patchAddressPATCH, DELETE as deleteAddressDELETE } from "@/app/api/customers/me/addresses/[id]/route";
import { GET as getSessionsGET, DELETE as deleteSessionsDELETE } from "@/app/api/customers/me/sessions/route";
import { DELETE as deleteSingleSessionDELETE } from "@/app/api/customers/me/sessions/[id]/route";
import { UserDB } from "@/lib/userDB";
import { signSessionToken } from "@/lib/jwt";
import { AuthSessionUser } from "@/lib/authUtils";

describe("Prayog India Unified Customer Authentication & Account Management", () => {
  const testPhone = "9876500001";
  const testEmail = "testuser001@example.com";
  let testUserId = "";

  beforeEach(() => {
    // Clear in-memory maps for fresh test state
    UserDB.revokeAllSessions(testUserId);
  });

  describe("1. Mobile Number + OTP Primary Authentication Flow", () => {
    it("sends mobile OTP to valid 10-digit number and enforces format validation", async () => {
      // Invalid number
      const invalidReq = new Request("http://localhost:3000/api/auth/mobile/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: "123" }),
      });
      const invalidRes = await sendMobileOtpPOST(invalidReq);
      expect(invalidRes.status).toBe(400);

      // Valid number
      const validReq = new Request("http://localhost:3000/api/auth/mobile/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: testPhone }),
      });
      const validRes = await sendMobileOtpPOST(validReq);
      expect(validRes.status).toBe(200);
      const data = await validRes.json();
      expect(data.success).toBe(true);
      expect(data.testOtp).toBeDefined();
    });

    it("rejects incorrect OTP", async () => {
      const verifyReq = new Request("http://localhost:3000/api/auth/mobile/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: testPhone, code: "999999" }),
      });
      const verifyRes = await verifyMobileOtpPOST(verifyReq);
      expect(verifyRes.status).toBe(400);
      const data = await verifyRes.json();
      expect(data.success).toBe(false);
    });

    it("verifies OTP for a new customer and flags isNewUser for profile completion", async () => {
      const verifyReq = new Request("http://localhost:3000/api/auth/mobile/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: testPhone, code: "1234" }),
      });
      const verifyRes = await verifyMobileOtpPOST(verifyReq);
      expect(verifyRes.status).toBe(200);
      const data = await verifyRes.json();
      expect(data.success).toBe(true);
      expect(data.isNewUser).toBe(true);
      expect(data.verifiedMobile).toBe(testPhone);
    });

    it("completes customer profile, creates default address, and links mobile identity", async () => {
      const profileReq = new Request("http://localhost:3000/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verifiedMobile: testPhone,
          fullName: "Rohan Verma",
          email: testEmail,
          houseFlatBuilding: "Flat 402, Royal Residency",
          streetArea: "Circular Road, Lalpur",
          landmark: "Near Peace Hospital",
          city: "Ranchi",
          state: "Jharkhand",
          pincode: "834001",
          addressType: "Home",
        }),
      });
      const profileRes = await completeProfilePOST(profileReq);
      expect(profileRes.status).toBe(201);
      const data = await profileRes.json();
      expect(data.success).toBe(true);
      expect(data.user.name).toBe("Rohan Verma");
      expect(data.user.phone).toContain(testPhone);
      testUserId = data.user.id;

      // Verify linked mobile identity in UserDB
      const foundUser = UserDB.findUserByIdentity("mobile", testPhone);
      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(testUserId);
      expect(foundUser?.mobileVerified).toBe(true);

      // Verify created delivery address
      const addresses = UserDB.getAddresses(testUserId);
      expect(addresses.length).toBeGreaterThanOrEqual(1);
      expect(addresses[0].city).toBe("Ranchi");
      expect(addresses[0].pincode).toBe("834001");
      expect(addresses[0].isDefault).toBe(true);
    });

    it("logs in existing customer directly with mobile OTP without asking for profile again", async () => {
      // Send OTP
      await sendMobileOtpPOST(new Request("http://localhost:3000/api/auth/mobile/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: testPhone }),
      }));

      // Verify OTP
      const verifyReq = new Request("http://localhost:3000/api/auth/mobile/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: testPhone, code: "1234" }),
      });
      const verifyRes = await verifyMobileOtpPOST(verifyReq);
      expect(verifyRes.status).toBe(200);
      const data = await verifyRes.json();
      expect(data.success).toBe(true);
      expect(data.isNewUser).toBe(false);
      expect(data.user.name).toBe("Rohan Verma");
    });
  });

  describe("2. Google OAuth and Account Linking", () => {
    const testGoogleSub = "google_sub_987654321_unique";

    it("returns isLinked: false when a Google identity is not yet connected", async () => {
      const googleReq = new Request("http://localhost:3000/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sub: testGoogleSub,
          email: "rohan.google@example.com",
          name: "Rohan Google",
        }),
      });
      const googleRes = await googleAuthPOST(googleReq);
      expect(googleRes.status).toBe(200);
      const data = await googleRes.json();
      expect(data.isLinked).toBe(false);
      expect(data.pendingGoogleSub).toBe(testGoogleSub);
    });

    it("links Google identity to verified customer account", async () => {
      const linkReq = new Request("http://localhost:3000/api/auth/link-identity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: testUserId,
          provider: "google",
          providerUserId: testGoogleSub,
        }),
      });
      const linkRes = await linkIdentityPOST(linkReq);
      expect(linkRes.status).toBe(200);
      const data = await linkRes.json();
      expect(data.success).toBe(true);

      // Verify identity resolution
      const linkedUser = UserDB.findUserByIdentity("google", testGoogleSub);
      expect(linkedUser?.id).toBe(testUserId);
    });

    it("authenticates linked customer directly on subsequent Google login", async () => {
      const googleReq = new Request("http://localhost:3000/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sub: testGoogleSub,
          email: "rohan.google@example.com",
        }),
      });
      const googleRes = await googleAuthPOST(googleReq);
      expect(googleRes.status).toBe(200);
      const data = await googleRes.json();
      expect(data.isLinked).toBe(true);
      expect(data.user.id).toBe(testUserId);
      expect(data.user.name).toBe("Rohan Verma");
    });

    it("prevents linking the same Google identity to a different customer", async () => {
      const otherUser = UserDB.create({
        name: "Other User",
        email: "other@example.com",
        phone: "+91 9999988888",
        passwordHash: "hash",
        customerType: "Registered Customer",
        rewardPoints: 100,
      });

      expect(() => {
        UserDB.linkIdentity(otherUser.id, "google", testGoogleSub);
      }).toThrow();
    });
  });

  describe("3. Email Authentication & OTP", () => {
    it("sends email OTP", async () => {
      const emailReq = new Request("http://localhost:3000/api/auth/email/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail }),
      });
      const emailRes = await sendEmailOtpPOST(emailReq);
      expect(emailRes.status).toBe(200);
      const data = await emailRes.json();
      expect(data.success).toBe(true);
    });

    it("verifies email OTP and resolves existing customer account", async () => {
      const verifyReq = new Request("http://localhost:3000/api/auth/email/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail, code: "1234" }),
      });
      const verifyRes = await verifyEmailOtpPOST(verifyReq);
      expect(verifyRes.status).toBe(200);
      const data = await verifyRes.json();
      expect(data.success).toBe(true);
      expect(data.user?.id).toBe(testUserId);
    });
  });

  describe("4. Multi-Device Active Sessions & Revocation", () => {
    it("creates, retrieves and revokes device sessions", async () => {
      const session1 = UserDB.createSession(testUserId, "hash_device_1", "Chrome MacOS");
      const session2 = UserDB.createSession(testUserId, "hash_device_2", "Android App");

      const sessions = UserDB.getSessions(testUserId);
      expect(sessions.length).toBeGreaterThanOrEqual(2);
      expect(sessions.some((s) => s.deviceInfo === "Android App")).toBe(true);

      // Revoke single session
      const revoked = UserDB.revokeSession(testUserId, session1.id);
      expect(revoked).toBe(true);
      const remaining = UserDB.getSessions(testUserId);
      expect(remaining.some((s) => s.id === session1.id)).toBe(false);

      // Revoke all sessions
      UserDB.revokeAllSessions(testUserId);
      expect(UserDB.getSessions(testUserId).length).toBe(0);
    });
  });

  describe("5. Address Management (IDOR Protected)", () => {
    it("adds a second address and manages default status properly", () => {
      const addr2 = UserDB.addAddress(testUserId, {
        name: "Rohan Verma Office",
        phone: "+91 9876500001",
        street: "Tech Park, HEC Colony",
        city: "Ranchi",
        state: "Jharkhand",
        pincode: "834004",
        type: "Office",
        isDefault: true,
      });

      expect(addr2.isDefault).toBe(true);
      const addresses = UserDB.getAddresses(testUserId);
      expect(addresses.length).toBe(2);

      // Previous address should no longer be default
      const prevAddr = addresses.find((a) => a.id !== addr2.id);
      expect(prevAddr?.isDefault).toBe(false);

      // Delete address
      const deleted = UserDB.deleteAddress(testUserId, addr2.id);
      expect(deleted).toBe(true);
      expect(UserDB.getAddresses(testUserId).length).toBe(1);
    });
  });
});
