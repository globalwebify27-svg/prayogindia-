import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
  quotationRequestSchema,
  couponValidateSchema,
  cartItemSchema,
} from "../lib/validations";

describe("Zod API Input Validation Schemas", () => {
  it("should validate valid login payload and reject invalid ones", () => {
    const valid = loginSchema.safeParse({
      email: "user@example.com",
      password: "securePassword123",
    });
    expect(valid.success).toBe(true);

    const invalidShortPass = loginSchema.safeParse({
      email: "user@example.com",
      password: "123",
    });
    expect(invalidShortPass.success).toBe(false);
  });

  it("should validate registration payload requirements", () => {
    const valid = registerSchema.safeParse({
      name: "Rohan Verma",
      email: "rohan@prayog.in",
      phone: "9876543210",
      password: "StrongPassword@99",
    });
    expect(valid.success).toBe(true);

    const invalidEmail = registerSchema.safeParse({
      name: "Rohan Verma",
      email: "not-an-email",
      phone: "9876543210",
      password: "StrongPassword@99",
    });
    expect(invalidEmail.success).toBe(false);
  });

  it("should validate B2B quotation request payload", () => {
    const valid = quotationRequestSchema.safeParse({
      fullName: "Dr. A. Sharma",
      email: "asharma@iitd.ac.in",
      phone: "9123456780",
      organizationName: "IIT Delhi Robotics Lab",
      category: "Robotics & Microcontrollers",
      projectBrief: "Procuring 50 STM32 development boards for upcoming batch.",
    });
    expect(valid.success).toBe(true);
  });

  it("should validate coupon check schema", () => {
    const valid = couponValidateSchema.safeParse({
      code: "WELCOME10",
      subtotal: 1200,
      customerType: "B2C Customer",
    });
    expect(valid.success).toBe(true);

    const negativeTotal = couponValidateSchema.safeParse({
      code: "WELCOME10",
      subtotal: -50,
    });
    expect(negativeTotal.success).toBe(false);
  });

  it("should enforce strict Indian phone and email format validations on quotation desk", () => {
    const indianPhoneRegex = /^[6-9]\d{9}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Valid Indian phone numbers
    const validRawPhones = ["9876543210", "+91 9876543210", "+91-8709789641", "07987654321"];
    validRawPhones.forEach((raw) => {
      const cleaned = raw.replace(/[\s\-\(\)\+]/g, "").replace(/^(?:91|0)/, "");
      expect(indianPhoneRegex.test(cleaned)).toBe(true);
    });

    // Invalid phones (less than 10 digits, starts with invalid prefix, letters)
    const invalidPhones = ["1234567890", "5987654321", "98765", "abcdefghij"];
    invalidPhones.forEach((raw) => {
      const cleaned = raw.replace(/[\s\-\(\)\+]/g, "").replace(/^(?:91|0)/, "");
      expect(indianPhoneRegex.test(cleaned)).toBe(false);
    });

    // Valid emails
    expect(emailRegex.test("principal@school.edu")).toBe(true);
    expect(emailRegex.test("contact.officer@iitd.ac.in")).toBe(true);

    // Invalid emails
    expect(emailRegex.test("not-an-email")).toBe(false);
    expect(emailRegex.test("missing@domain")).toBe(false);
    expect(emailRegex.test("@no-local.com")).toBe(false);
  });
});
