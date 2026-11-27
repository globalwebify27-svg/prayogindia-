import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedCustomer } from "@/lib/authUtils";
import { getSecurityHeaders, checkRateLimit } from "@/lib/security";
import { INITIAL_PROMO_COUPONS, evaluatePromoCoupon } from "@/data/promoData";
import { couponValidateSchema } from "@/lib/validations";

/**
 * POST /api/coupons/validate
 * Server-authoritative coupon validation.
 * Checks expiry, usage limits, customer type, category eligibility.
 * NEVER trusts discount amounts from the client.
 */
export async function POST(request: Request) {
  const headers = getSecurityHeaders();
  const user = await getAuthenticatedCustomer();
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";

  const rateLimitKey = user ? `coupon:${user.id}:${ip}` : `coupon:guest:${ip}`;
  const rateLimit = checkRateLimit(rateLimitKey, 15, 60000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, message: "Too many coupon attempts. Wait a moment." },
      { status: 429, headers },
    );
  }

  try {
    const body = await request.json();
    const parseResult = couponValidateSchema.safeParse({
      code: body.couponCode || body.code,
      subtotal: body.cartTotal ?? body.subtotal,
      customerType: body.customerType,
    });

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: parseResult.error.issues[0]?.message || "Invalid coupon request parameters.",
        },
        { status: 400, headers },
      );
    }

    const { code, subtotal, customerType } = parseResult.data;
    const { cartItems, customerEmail } = body;
    const normalizedCode = code.toUpperCase().trim();
    const cartTotal = subtotal;

    // 1. Find the coupon in data store
    const coupon = INITIAL_PROMO_COUPONS.find(
      (c) => c.code.toUpperCase() === normalizedCode,
    );

    if (!coupon) {
      return NextResponse.json(
        {
          success: false,
          message: `Coupon "${normalizedCode}" is invalid or does not exist.`,
        },
        { status: 404, headers },
      );
    }

    // 2. Check per-user usage and guest restrictions
    let userOrderCount = 0;
    let perUserUsageCount = 0;
    const effectiveEmail = user?.email || (customerEmail ? String(customerEmail).trim().toLowerCase() : "");

    // Customer-type eligibility check
    const resolvedCustomerType = user
      ? (customerType || "B2C Customer")
      : (customerType || "Guest Customer");

    if (coupon.customerTypeScope === "B2B-only" && resolvedCustomerType !== "B2B Customer") {
      return NextResponse.json(
        {
          success: false,
          message: `Coupon "${normalizedCode}" is exclusive to verified B2B accounts.`,
        },
        { status: 422, headers },
      );
    }

    if (coupon.customerTypeScope === "Walk-in-only") {
      return NextResponse.json(
        {
          success: false,
          message: `Coupon "${normalizedCode}" is only valid for in-store Walk-in POS checkout.`,
        },
        { status: 422, headers },
      );
    }

    if (coupon.customerTypeScope === "Registered-customer" && !user) {
      return NextResponse.json(
        {
          success: false,
          message: "Please sign in to your registered account to use this coupon.",
        },
        { status: 422, headers },
      );
    }

    // User-specific coupon check
    if (coupon.restrictedUserEmails && coupon.restrictedUserEmails.length > 0) {
      const isAllowedEmail = coupon.restrictedUserEmails.some(
        (em) => em.toLowerCase() === effectiveEmail.toLowerCase()
      );
      if (!isAllowedEmail) {
        return NextResponse.json(
          {
            success: false,
            message: user
              ? "This coupon code is not valid for your email account."
              : "This exclusive coupon requires signing in with the designated email address.",
          },
          { status: 422, headers },
        );
      }
    }

    if (process.env.DATABASE_URL) {
      if (user) {
        // Check how many times user has used this coupon
        perUserUsageCount = await db.couponUsage.count({
          where: {
            couponCode: normalizedCode,
            userId: user.id,
          },
        });

        if (perUserUsageCount >= coupon.usageLimitPerUser) {
          return NextResponse.json(
            {
              success: false,
              message: `You have already used this coupon the maximum allowed ${coupon.usageLimitPerUser} time(s).`,
            },
            { status: 422, headers },
          );
        }

        // Check if new customer
        userOrderCount = await db.order.count({
          where: {
            userId: user.id,
            paymentStatus: "PAID",
          },
        });
      } else if (effectiveEmail) {
        // Guest customer checking prior orders by email
        userOrderCount = await db.order.count({
          where: {
            user: { email: effectiveEmail },
            paymentStatus: "PAID",
          },
        });
      }
    }

    const hasPreviousOrders = userOrderCount > 0;

    // 3. Evaluate coupon via business rules engine
    const evaluation = evaluatePromoCoupon(
      coupon,
      cartTotal,
      resolvedCustomerType,
      effectiveEmail,
      hasPreviousOrders,
      false, // Not walk-in POS
      cartItems || [],
    );

    if (!evaluation.valid) {
      return NextResponse.json(
        { success: false, message: evaluation.message },
        { status: 422, headers },
      );
    }

    return NextResponse.json({
      success: true,
      message: evaluation.message,
      data: {
        couponCode: normalizedCode,
        discountAmount: evaluation.discountAmount,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        description: coupon.description,
        maxDiscountAmount: coupon.maxDiscountAmount,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to validate coupon.",
      },
      { status: 500, headers },
    );
  }
}
