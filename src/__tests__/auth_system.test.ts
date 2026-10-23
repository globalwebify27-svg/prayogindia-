import { describe, it, expect, beforeEach } from "vitest";
import { loginSchema, registerSchema } from "@/lib/validations";
import { hashPassword, verifyPassword, sanitizeUser } from "@/lib/authUtils";
import { signSessionToken, verifySessionToken } from "@/lib/jwt";
import { UserDB } from "@/lib/userDB";
import { hasRequiredRole, hasStoreAccess, StaffSessionUser } from "@/lib/staffAuth";
import { POST as registerHandler } from "@/app/api/auth/register/route";
import { POST as loginHandler } from "@/app/api/auth/login/route";
import { POST as logoutHandler } from "@/app/api/auth/logout/route";

describe("Prayog India Authentication System Audit & Validation", () => {
  const testEmail = `test.audit.${Date.now()}@prayogindia.com`;
  const testPhone = "9876543210";
  const testPass = "SecurePass@2026";

  describe("1. Registration Audit & Validation", () => {
    it("should validate a valid registration payload with all PDF required fields", () => {
      const payload = {
        name: "Enamul Haque",
        phone: "9876543210",
        email: "enamul@prayogindia.com",
        password: "StrongPassword123",
        confirmPassword: "StrongPassword123",
      };

      const result = registerSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it("should reject registration when confirmPassword does not match password", () => {
      const payload = {
        name: "Enamul Haque",
        phone: "9876543210",
        email: "enamul@prayogindia.com",
        password: "StrongPassword123",
        confirmPassword: "DifferentPassword456",
      };

      const result = registerSchema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Passwords do not match.");
      }
    });

    it("should reject registration with invalid email", () => {
      const payload = {
        name: "Test User",
        email: "not-a-valid-email",
        password: "Password123",
      };

      const result = registerSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });

    it("should reject registration with password under 6 characters", () => {
      const payload = {
        name: "Test User",
        email: "valid@email.com",
        password: "123",
      };

      const result = registerSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });

    it("should securely hash password using bcrypt and never store plaintext", async () => {
      const plainPassword = "MySecretPassword@2026";
      const hash = await hashPassword(plainPassword);

      expect(hash).not.toBe(plainPassword);
      expect(hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$")).toBe(true);

      const isMatch = await verifyPassword(plainPassword, hash);
      expect(isMatch).toBe(true);

      const isWrong = await verifyPassword("WrongPassword", hash);
      expect(isWrong).toBe(false);
    });

    it("should safely register a new user and prevent duplicate accounts", async () => {
      const uniqueEmail = `audit.user.${Date.now()}@prayog.in`;
      const uniquePhone = `91${Math.floor(10000000 + Math.random() * 90000000)}`;

      // 1. First registration attempt
      const req1 = new Request("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test Customer",
          email: uniqueEmail,
          phone: uniquePhone,
          password: "ValidPassword123",
          confirmPassword: "ValidPassword123",
        }),
      });

      const res1 = await registerHandler(req1);
      const data1 = await res1.json();

      expect(res1.status).toBe(200);
      expect(data1.success).toBe(true);
      expect(data1.user.name).toBe("Test Customer");
      expect(data1.user.passwordHash).toBeUndefined(); // Password hash must never be returned!

      // 2. Duplicate registration attempt with same email
      const req2 = new Request("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Another Name",
          email: uniqueEmail,
          phone: "9999999999",
          password: "ValidPassword123",
          confirmPassword: "ValidPassword123",
        }),
      });

      const res2 = await registerHandler(req2);
      expect(res2.status).toBe(409);
      const data2 = await res2.json();
      expect(data2.success).toBe(false);
      expect(data2.message).toContain("already exists");
    });
  });

  describe("2. Login & Credential Authentication Audit", () => {
    const userEmail = `login.test.${Date.now()}@prayog.in`;
    const userPhone = "9812345678";
    const userPassword = "LoginPassword@2026";

    beforeEach(async () => {
      // Ensure user is registered in UserDB
      const hash = await hashPassword(userPassword);
      UserDB.create({
        name: "Login Test User",
        email: userEmail,
        phone: `+91 ${userPhone}`,
        passwordHash: hash,
        customerType: "Registered Customer",
        rewardPoints: 250,
      });
    });

    it("should successfully log in with registered email and password", async () => {
      const req = new Request("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          password: userPassword,
        }),
      });

      const res = await loginHandler(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.email).toBe(userEmail);
      expect(data.user.passwordHash).toBeUndefined();

      // Check session cookie is set
      const setCookie = res.headers.get("set-cookie") || "";
      expect(setCookie).toContain("prayog_customer_session=");
      expect(setCookie).toContain("HttpOnly");
      expect(setCookie).toContain("Path=/");
    });

    it("should successfully log in with 10-digit mobile number and password", async () => {
      const req = new Request("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userPhone, // User enters mobile number in the identifier field
          password: userPassword,
        }),
      });

      const res = await loginHandler(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.name).toBe("Login Test User");
    });

    it("should reject login with wrong password", async () => {
      const req = new Request("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          password: "IncorrectPassword999",
        }),
      });

      const res = await loginHandler(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.message).toContain("Incorrect password");
    });

    it("should reject login for non-existent account without sensitive info leakage", async () => {
      const req = new Request("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "nonexistent.account.xyz999@domain.com",
          password: "AnyPassword123",
        }),
      });

      const res = await loginHandler(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.success).toBe(false);
    });
  });

  describe("3. Cryptographic JWT Token & Session Security", () => {
    it("should correctly sign and verify customer session JWT", async () => {
      const payload = {
        id: "usr-12345",
        name: "Dr. Ramesh Patel",
        email: "ramesh@iitb.ac.in",
        phone: "+91 98765 00000",
        customerType: "B2B Customer",
        rewardPoints: 500,
        role: "CUSTOMER" as const,
      };

      const token = await signSessionToken(payload, "7d");
      expect(typeof token).toBe("string");
      expect(token.split(".").length).toBe(3);

      const verified = await verifySessionToken<typeof payload>(token);
      expect(verified).not.toBeNull();
      expect(verified?.id).toBe(payload.id);
      expect(verified?.name).toBe(payload.name);
      expect(verified?.customerType).toBe("B2B Customer");
      expect(verified?.rewardPoints).toBe(500);
    });

    it("should reject altered or forged JWT tokens", async () => {
      const payload = { id: "usr-legit", role: "CUSTOMER" };
      const token = await signSessionToken(payload, "1h");
      const parts = token.split(".");

      // Modify payload part
      const forged = `${parts[0]}.${Buffer.from('{"id":"usr-attacker","role":"ADMIN"}').toString("base64url")}.${parts[2]}`;
      const verified = await verifySessionToken(forged);
      expect(verified).toBeNull();
    });
  });

  describe("4. Logout Mechanism Audit", () => {
    it("should invalidate and expire the session cookie upon logout", async () => {
      const res = await logoutHandler();
      expect(res.status).toBe(200);

      const setCookie = res.headers.get("set-cookie") || "";
      expect(setCookie).toContain("prayog_customer_session=");
      expect(setCookie).toContain("Max-Age=0");
      expect(setCookie).toContain("Expires=Thu, 01 Jan 1970");

      const cacheControl = res.headers.get("cache-control") || "";
      expect(cacheControl).toContain("no-store");
    });
  });

  describe("5. Role-Based Access Control (RBAC) Audit", () => {
    const customerUser: StaffSessionUser = {
      id: "usr-cust-1",
      name: "Normal Customer",
      email: "cust@gmail.com",
      username: "cust",
      role: "CUSTOMER" as any,
      storeId: null,
      status: "ACTIVE" as any,
    };

    const storeManager: StaffSessionUser = {
      id: "usr-mgr-1",
      name: "Ranchi Store Manager",
      email: "mgr@prayog.in",
      username: "ranchi_mgr",
      role: "STORE_MANAGER",
      storeId: "str-ranchi-01",
      storeCode: "RANCHI",
      status: "ACTIVE",
    };

    const superAdmin: StaffSessionUser = {
      id: "usr-admin-1",
      name: "Super Administrator",
      email: "admin@prayog.in",
      username: "superadmin",
      role: "SUPER_ADMIN",
      storeId: null,
      status: "ACTIVE",
    };

    it("should prevent normal customer from accessing store manager roles", () => {
      expect(hasRequiredRole(customerUser, "STORE_MANAGER", "SUPER_ADMIN")).toBe(false);
    });

    it("should allow STORE_MANAGER to access store-level functions for their store only", () => {
      expect(hasRequiredRole(storeManager, "STORE_MANAGER")).toBe(true);
      expect(hasStoreAccess(storeManager, "str-ranchi-01")).toBe(true);
      expect(hasStoreAccess(storeManager, "str-patna-02")).toBe(false); // Cannot access Patna store!
    });

    it("should allow SUPER_ADMIN full universal access across all stores", () => {
      expect(hasRequiredRole(superAdmin, "SUPER_ADMIN")).toBe(true);
      expect(hasStoreAccess(superAdmin, "str-ranchi-01")).toBe(true);
      expect(hasStoreAccess(superAdmin, "str-patna-02")).toBe(true);
      expect(hasStoreAccess(superAdmin, "str-delhi-03")).toBe(true);
    });
  });
});
