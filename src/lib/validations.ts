import { z } from "zod";

// 1. User Authentication Schemas
export const loginSchema = z.object({
  email: z.string().min(1, "Email or mobile number is required").max(100),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    name: z.string().max(70).optional(),
    email: z.string().email("Invalid email address").max(100),
    phone: z.string().max(20).optional(),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(128),
    confirmPassword: z.string().optional(),
    b2b: z
      .object({
        companyName: z.string().min(2).max(120),
        gstNumber: z.string().max(15).optional(),
      })
      .optional(),
  })
  .refine(
    (data) => {
      if (data.confirmPassword && data.password !== data.confirmPassword) {
        return false;
      }
      return true;
    },
    {
      message: "Passwords do not match.",
      path: ["confirmPassword"],
    },
  );

// 2. Quotation Request Schema
export const quotationRequestSchema = z.object({
  fullName: z.string().min(2, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  organizationName: z.string().min(2, "Organization name is required").max(150),
  gstin: z.string().max(15).optional(),
  category: z.string().min(1, "Category is required"),
  estimatedQuantity: z.number().int().positive().optional(),
  targetBudget: z.string().max(50).optional(),
  projectBrief: z.string().min(10, "Project brief must be at least 10 characters").max(3000),
  urgency: z.enum(["Standard (3-5 Days)", "Urgent (24-48 Hours)", "Immediate"]).optional(),
});

// 3. Coupon Validation Schema
export const couponValidateSchema = z.object({
  code: z.string().min(2, "Coupon code is required").max(30),
  subtotal: z.number().nonnegative(),
  customerType: z.string().optional(),
});

// 4. Cart Mutation Schema
export const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
  variantId: z.string().optional(),
});
