export type CustomerTypeScope =
  | "All"
  | "B2B-only"
  | "B2C-only"
  | "Walk-in-only"
  | "Registered-customer"
  | "New-customer";

export type DiscountType = "percentage" | "flat";

export interface PromoCoupon {
  id: string;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number; // e.g. 15 for 15% or 500 for flat ₹500
  minOrderValue: number; // e.g. ₹1000
  maxDiscountAmount: number; // max discount cap in rupees
  customerTypeScope: CustomerTypeScope;
  applicableCategory?: string; // 'All' or specific category name (e.g. 'Microcontroller Boards')
  applicableSku?: string; // Optional SKU restriction
  usageLimitGlobal: number; // Total usages permitted
  usageCount: number; // Current usages consumed
  usageLimitPerUser: number; // Per customer usage limit
  restrictedUserEmails?: string[]; // Specific user whitelist (if any)
  expiryDate: string; // YYYY-MM-DD
  isActive: boolean;
}

export const INITIAL_PROMO_COUPONS: PromoCoupon[] = [
  {
    id: "coup-1",
    code: "B2BINSTITUTE20",
    description: "20% Off for University & Research Lab B2B Accounts",
    discountType: "percentage",
    discountValue: 20,
    minOrderValue: 5000,
    maxDiscountAmount: 3000,
    customerTypeScope: "B2B-only",
    applicableCategory: "All",
    usageLimitGlobal: 100,
    usageCount: 14,
    usageLimitPerUser: 2,
    expiryDate: "2027-12-31",
    isActive: true,
  },
  {
    id: "coup-2",
    code: "MAKERB2C10",
    description: "10% Off for Retail Hobbyists and DIY Builders",
    discountType: "percentage",
    discountValue: 10,
    minOrderValue: 1500,
    maxDiscountAmount: 500,
    customerTypeScope: "B2C-only",
    applicableCategory: "All",
    usageLimitGlobal: 500,
    usageCount: 82,
    usageLimitPerUser: 3,
    expiryDate: "2027-06-30",
    isActive: true,
  },
  {
    id: "coup-3",
    code: "STOREPOS500",
    description: "Flat ₹500 Off for Walk-in Store Terminal Invoicing",
    discountType: "flat",
    discountValue: 500,
    minOrderValue: 3000,
    maxDiscountAmount: 500,
    customerTypeScope: "Walk-in-only",
    applicableCategory: "All",
    usageLimitGlobal: 250,
    usageCount: 39,
    usageLimitPerUser: 1,
    expiryDate: "2026-12-31",
    isActive: true,
  },
  {
    id: "coup-4",
    code: "REGISTERED15",
    description: "15% Off Exclusive for Verified Registered Members",
    discountType: "percentage",
    discountValue: 15,
    minOrderValue: 2000,
    maxDiscountAmount: 1000,
    customerTypeScope: "Registered-customer",
    applicableCategory: "All",
    usageLimitGlobal: 1000,
    usageCount: 195,
    usageLimitPerUser: 5,
    expiryDate: "2027-12-31",
    isActive: true,
  },
  {
    id: "coup-5",
    code: "WELCOMEPRAYOG",
    description: "Flat ₹200 Welcome Gift on First Hardware Order",
    discountType: "flat",
    discountValue: 200,
    minOrderValue: 999,
    maxDiscountAmount: 200,
    customerTypeScope: "New-customer",
    applicableCategory: "All",
    usageLimitGlobal: 2000,
    usageCount: 412,
    usageLimitPerUser: 1,
    expiryDate: "2027-12-31",
    isActive: true,
  },
  {
    id: "coup-6",
    code: "ROBOTICS25",
    description:
      "25% Category Clearance on Robotics & Drone Flight Controllers",
    discountType: "percentage",
    discountValue: 25,
    minOrderValue: 4000,
    maxDiscountAmount: 2500,
    customerTypeScope: "All",
    applicableCategory: "Robotics & Drone Hardware",
    usageLimitGlobal: 150,
    usageCount: 28,
    usageLimitPerUser: 1,
    expiryDate: "2026-10-31",
    isActive: true,
  },
];

/**
 * Validate and calculate coupon discount
 */
export function evaluatePromoCoupon(
  coupon: PromoCoupon,
  cartTotal: number,
  customerType: string,
  userEmail?: string,
  hasPreviousOrders: boolean = false,
  isWalkInPos: boolean = false,
  cartItems?: {
    category?: string;
    sku?: string;
    price: number;
    quantity: number;
  }[],
): { valid: boolean; discountAmount: number; message: string } {
  if (!coupon.isActive) {
    return {
      valid: false,
      discountAmount: 0,
      message: "This promo code is currently inactive.",
    };
  }

  // Check Expiry Date
  const today = new Date().toISOString().split("T")[0];
  if (coupon.expiryDate < today) {
    return {
      valid: false,
      discountAmount: 0,
      message: `Promo code expired on ${coupon.expiryDate}.`,
    };
  }

  // Check Global Usage Limit
  if (coupon.usageCount >= coupon.usageLimitGlobal) {
    return {
      valid: false,
      discountAmount: 0,
      message: "Promo code global usage limit has been reached.",
    };
  }

  // Check Minimum Order Value
  if (cartTotal < coupon.minOrderValue) {
    return {
      valid: false,
      discountAmount: 0,
      message: `Minimum order value of ₹${coupon.minOrderValue.toLocaleString()} required for this coupon.`,
    };
  }

  // Check Customer-Type Scope
  if (
    coupon.customerTypeScope === "B2B-only" &&
    customerType !== "B2B Customer"
  ) {
    return {
      valid: false,
      discountAmount: 0,
      message:
        "This coupon is exclusive to verified B2B & Institutional accounts.",
    };
  }

  if (
    coupon.customerTypeScope === "B2C-only" &&
    customerType !== "B2C Customer"
  ) {
    return {
      valid: false,
      discountAmount: 0,
      message: "This coupon is exclusive to Retail B2C customers.",
    };
  }

  if (coupon.customerTypeScope === "Walk-in-only" && !isWalkInPos) {
    return {
      valid: false,
      discountAmount: 0,
      message: "This coupon is only valid for in-store Walk-in POS checkout.",
    };
  }

  if (coupon.customerTypeScope === "Registered-customer" && !userEmail) {
    return {
      valid: false,
      discountAmount: 0,
      message: "Please sign in to your registered account to use this coupon.",
    };
  }

  if (coupon.customerTypeScope === "New-customer" && hasPreviousOrders) {
    return {
      valid: false,
      discountAmount: 0,
      message: "This welcome coupon is only valid on your first order.",
    };
  }

  // Check Whitelist
  if (coupon.restrictedUserEmails && coupon.restrictedUserEmails.length > 0) {
    if (
      !userEmail ||
      !coupon.restrictedUserEmails
        .map((e) => e.toLowerCase())
        .includes(userEmail.toLowerCase())
    ) {
      return {
        valid: false,
        discountAmount: 0,
        message: "Your account is not eligible for this exclusive coupon code.",
      };
    }
  }

  // Check Category / SKU Applicability (if specified)
  let eligibleBaseAmount = cartTotal;
  if (cartItems && cartItems.length > 0) {
    if (coupon.applicableCategory && coupon.applicableCategory !== "All") {
      const categoryItems = cartItems.filter(
        (item) => item.category === coupon.applicableCategory,
      );
      if (categoryItems.length === 0) {
        return {
          valid: false,
          discountAmount: 0,
          message: `This coupon is only applicable on items from "${coupon.applicableCategory}".`,
        };
      }
      eligibleBaseAmount = categoryItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
    }

    if (coupon.applicableSku && coupon.applicableSku.trim() !== "") {
      const skuItems = cartItems.filter(
        (item) =>
          item.sku?.toUpperCase() === coupon.applicableSku?.toUpperCase(),
      );
      if (skuItems.length === 0) {
        return {
          valid: false,
          discountAmount: 0,
          message: `This coupon is only valid for product SKU: ${coupon.applicableSku}.`,
        };
      }
      eligibleBaseAmount = skuItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
    }
  }

  // Calculate Discount
  let rawDiscount = 0;
  if (coupon.discountType === "percentage") {
    rawDiscount = Math.round((eligibleBaseAmount * coupon.discountValue) / 100);
    rawDiscount = Math.min(rawDiscount, coupon.maxDiscountAmount);
  } else {
    rawDiscount = Math.min(
      coupon.discountValue,
      coupon.maxDiscountAmount,
      eligibleBaseAmount,
    );
  }

  return {
    valid: true,
    discountAmount: rawDiscount,
    message: `Coupon ${coupon.code} applied: -₹${rawDiscount.toLocaleString()} saved!`,
  };
}
