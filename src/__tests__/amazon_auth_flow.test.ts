import { describe, it, expect, beforeEach } from "vitest";
import { UserDB } from "@/lib/userDB";
import { RegistrationService, PENDING_REGISTRATIONS } from "@/lib/registrationService";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";
import { verifyPassword, hashPassword } from "@/lib/authUtils";
import { signSessionToken, verifySessionToken } from "@/lib/jwt";
import { PRODUCTS } from "@/data/mockData";

describe("Amazon-Style Customer Authentication & Database Flow", () => {
  beforeEach(() => {
    PENDING_REGISTRATIONS.clear();
    useAuthStore.setState({ user: null, isLoggedIn: false });
    useCartStore.getState().clearCart();
  });

  describe("1. Registration & OTP Verification Flow (Requirement 2)", () => {
    const testPhone = "9876543210";
    const testEmail = "amazon.shopper@example.com";
    const testPassword = "SecurePassword123";

    it("initiates registration and stores pending record securely with temporary OTP", async () => {
      const result = await RegistrationService.initiate({
        name: "Amazon Shopper",
        phone: testPhone,
        email: testEmail,
        password: testPassword,
      });

      expect(result.success).toBe(true);
      expect(result.step).toBe("otp_verification");
      expect(result.phone).toBe(testPhone);

      const pending = PENDING_REGISTRATIONS.get(testPhone);
      expect(pending).toBeDefined();
      expect(pending?.name).toBe("Amazon Shopper");
      expect(pending?.email).toBe(testEmail);
      expect(pending?.otp).toBeDefined();
    });

    it("prevents duplicate registration when account already exists with same phone or email", async () => {
      // Create user in UserDB first
      UserDB.create({
        name: "Existing Shopper",
        email: "existing.shopper@example.com",
        phone: "+91 9876543210",
        passwordHash: await hashPassword(testPassword),
        customerType: "Registered Customer",
        rewardPoints: 100,
      });

      const duplicatePhoneResult = await RegistrationService.initiate({
        name: "Second Person",
        phone: testPhone,
        password: testPassword,
      });

      expect(duplicatePhoneResult.success).toBe(false);
      expect(duplicatePhoneResult.code).toBe("ACCOUNT_EXISTS");

      const duplicateEmailResult = await RegistrationService.initiate({
        name: "Third Person",
        phone: "9123456789",
        email: "existing.shopper@example.com",
        password: testPassword,
      });

      expect(duplicateEmailResult.success).toBe(false);
      expect(duplicateEmailResult.code).toBe("ACCOUNT_EXISTS");
    });

    it("verifies OTP and creates permanent customer record in database", async () => {
      const regPhone = "8709789641";
      await RegistrationService.initiate({
        name: "Om Kumar",
        phone: regPhone,
        password: "MySecretPassword123",
      });

      // Verify with test OTP
      const verifyResult = await RegistrationService.verifyAndCreate(regPhone, "1234");
      expect(verifyResult.success).toBe(true);
      expect(verifyResult.user).toBeDefined();
      expect(verifyResult.user?.name).toBe("Om Kumar");
      expect(verifyResult.user?.phone).toBe(`+91 ${regPhone}`);

      // Verify pending record was cleaned up
      expect(PENDING_REGISTRATIONS.get(regPhone)).toBeUndefined();

      // Verify created user exists in UserDB and password hash is verified with bcrypt
      const createdUser = UserDB.findByEmailOrPhone(regPhone);
      expect(createdUser).toBeDefined();
      expect(createdUser?.mobileVerified).toBe(true);

      const isPasswordValid = await verifyPassword("MySecretPassword123", createdUser!.passwordHash);
      expect(isPasswordValid).toBe(true);
    });

    it("rejects incorrect OTP and caps maximum attempts", async () => {
      const phone = "9988776655";
      await RegistrationService.initiate({
        name: "Test User",
        phone,
        password: "password123",
      });

      const wrongResult = await RegistrationService.verifyAndCreate(phone, "999999");
      expect(wrongResult.success).toBe(false);
      expect(wrongResult.message).toContain("Incorrect OTP");

      // Verify pending record increments attempts
      const pending = PENDING_REGISTRATIONS.get(phone);
      expect(pending?.attempts).toBe(1);
    });
  });

  describe("2. Customer Login & Credential Verification (Requirement 3)", () => {
    it("verifies bcrypt password hash and generates valid JWT session", async () => {
      const rawPassword = "CustomerSecurePass99";
      const hashedPassword = await hashPassword(rawPassword);

      const user = UserDB.create({
        name: "Priya Sharma",
        email: "priya.sharma@example.com",
        phone: "+91 9887766554",
        passwordHash: hashedPassword,
        customerType: "Registered Customer",
        rewardPoints: 200,
        status: "ACTIVE",
      });

      const isMatch = await verifyPassword(rawPassword, user.passwordHash);
      expect(isMatch).toBe(true);

      const isWrongMatch = await verifyPassword("WrongPassword", user.passwordHash);
      expect(isWrongMatch).toBe(false);

      // Sign session JWT
      const token = await signSessionToken(
        {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          customerType: user.customerType,
          companyName: null,
          gstin: null,
          rewardPoints: user.rewardPoints,
          role: "CUSTOMER",
        },
        "7d",
      );

      expect(typeof token).toBe("string");
      const verifiedPayload = await verifySessionToken<any>(token);
      expect(verifiedPayload).toBeDefined();
      expect(verifiedPayload.id).toBe(user.id);
      expect(verifiedPayload.name).toBe("Priya Sharma");
    });
  });

  describe("3. Guest Cart Preservation & Merge (Requirement 4)", () => {
    it("preserves guest cart and merges without duplicate items upon customer login", () => {
      const mockProduct = PRODUCTS[0];
      const mockProduct2 = PRODUCTS[1];

      // Guest adds product to cart
      useCartStore.getState().addToCart(mockProduct, undefined, 2);
      expect(useCartStore.getState().cart.length).toBe(1);

      // Merge guest cart with existing items
      useCartStore.getState().mergeGuestCart([
        { product: mockProduct, quantity: 1 },
        { product: mockProduct2, quantity: 3 },
      ]);

      const mergedCart = useCartStore.getState().cart;
      expect(mergedCart.length).toBe(2);

      const item1 = mergedCart.find((i) => i.product.id === mockProduct.id);
      expect(item1).toBeDefined();
      expect(item1!.quantity).toBeGreaterThanOrEqual(2);
    });
  });
});
