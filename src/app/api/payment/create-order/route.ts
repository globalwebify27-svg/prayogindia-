import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { AuthSessionUser } from "@/lib/authUtils";
import { checkRateLimit, getSecurityHeaders } from "@/lib/security";

async function getAuthenticatedUser(): Promise<AuthSessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("prayog_customer_session");
  if (!sessionCookie?.value) return null;
  try {
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

/**
 * POST /api/payment/create-order
 * Creates a Razorpay order server-side with the authoritative order amount.
 * Frontend never determines the amount — backend fetches from DB order.
 */
export async function POST(request: Request) {
  const headers = getSecurityHeaders();
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthenticated" },
      { status: 401, headers },
    );
  }

  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const rateLimit = checkRateLimit(`pay-create:${user.id}:${ip}`, 10, 60000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, message: "Too many payment requests. Please wait." },
      { status: 429, headers },
    );
  }

  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json(
        { success: false, message: "orderId is required." },
        { status: 400, headers },
      );
    }

    if (!process.env.DATABASE_URL) {
      // Mock mode — return fake Razorpay order
      return NextResponse.json({
        success: true,
        data: {
          razorpayOrderId: `order_mock_${Date.now()}`,
          amount: 149900, // paise
          currency: "INR",
          orderId,
          keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
        },
      });
    }

    // 1. Fetch the authoritative order from DB (customer isolation enforced)
    const order = await db.order.findFirst({
      where: {
        OR: [{ id: orderId }, { orderNumber: orderId }],
        userId: user.id, // CRITICAL: only the owner can pay
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found." },
        { status: 404, headers },
      );
    }

    // 2. Block re-payment if already paid
    if (order.paymentStatus === "PAID") {
      return NextResponse.json(
        { success: false, message: "This order is already paid." },
        { status: 409, headers },
      );
    }

    // 3. Amount in paise (₹1 = 100 paise)
    const amountPaise = Math.round(order.totalAmount * 100);

    // 4. Create Razorpay order (if credentials configured)
    const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
    const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      // Credentials not configured — return mock gateway order for development
      return NextResponse.json({
        success: true,
        data: {
          razorpayOrderId: `order_dev_${Date.now()}`,
          amount: amountPaise,
          currency: "INR",
          orderId: order.id,
          orderNumber: order.orderNumber,
          keyId: "rzp_test_PLACEHOLDER_SET_ENV",
          note: "RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET not configured in .env",
        },
      });
    }

    // 5. Call Razorpay Orders API
    const credentials = Buffer.from(
      `${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`,
    ).toString("base64");

    const rzpResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: "INR",
        receipt: order.orderNumber,
        notes: {
          prayog_order_id: order.id,
          prayog_order_number: order.orderNumber,
          customer_id: user.id,
        },
      }),
    });

    if (!rzpResponse.ok) {
      const rzpError = await rzpResponse.json().catch(() => ({}));
      console.error("[Razorpay Create Order Error]", rzpError);
      return NextResponse.json(
        {
          success: false,
          message: "Payment gateway error. Please try again.",
        },
        { status: 502, headers },
      );
    }

    const rzpOrder = await rzpResponse.json();

    // 6. Store gateway order ID in our Payment record
    await db.payment.upsert({
      where: { orderId: order.id },
      create: {
        orderId: order.id,
        gatewayOrderId: rzpOrder.id,
        amount: order.totalAmount,
        currency: "INR",
        status: "PENDING",
      },
      update: {
        gatewayOrderId: rzpOrder.id,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        razorpayOrderId: rzpOrder.id,
        amount: amountPaise,
        currency: "INR",
        orderId: order.id,
        orderNumber: order.orderNumber,
        keyId: RAZORPAY_KEY_ID,
      },
    });
  } catch (error: any) {
    console.error("[Payment Create Order Error]", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create payment order.",
      },
      { status: 500, headers },
    );
  }
}
