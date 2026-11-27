import { NextResponse } from "next/server";
import { db, isDatabaseAvailable } from "@/lib/db";
import { getAuthenticatedCustomer } from "@/lib/authUtils";
import { signSessionToken } from "@/lib/jwt";

// In-memory OTP store for phone change verifications (keyed by userId:newPhone)
const CHANGE_PHONE_OTP_STORE = new Map<
  string,
  { code: string; expiresAt: number; attempts: number }
>();

const MAX_ATTEMPTS = 5;
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

function cleanPhone(raw: string): string {
  return (raw || "").replace(/\D/g, "").slice(-10);
}

/**
 * POST /api/users/me/change-phone
 *
 * action = "send"   → Send OTP to the new number
 * action = "verify" → Verify OTP and update the phone in DB + session
 */
export async function POST(request: Request) {
  const user = await getAuthenticatedCustomer();
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthenticated. Please sign in first." },
      { status: 401 },
    );
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request body." },
      { status: 400 },
    );
  }

  const { action, newPhone: rawNew, code } = body;
  const newPhone = cleanPhone(rawNew || "");
  const currentPhone = cleanPhone(user.phone || "");
  const storeKey = `${user.id}:${newPhone}`;

  // ── Validation ─────────────────────────────────────────────────────────────
  if (!newPhone || newPhone.length !== 10) {
    return NextResponse.json(
      { success: false, message: "Please provide a valid 10-digit mobile number." },
      { status: 400 },
    );
  }

  if (newPhone === currentPhone) {
    return NextResponse.json(
      { success: false, message: "The new number is the same as your current registered number." },
      { status: 400 },
    );
  }

  // ── ACTION: SEND OTP ───────────────────────────────────────────────────────
  if (action === "send") {
    // Check if number is already taken by another account
    if (isDatabaseAvailable()) {
      try {
        const conflict = await db.user.findFirst({
          where: { phone: { contains: newPhone } },
          select: { id: true },
        });
        if (conflict && conflict.id !== user.id) {
          return NextResponse.json(
            {
              success: false,
              message:
                "This mobile number is already registered to another account. Please use a different number.",
            },
            { status: 409 },
          );
        }
      } catch {}
    }

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    CHANGE_PHONE_OTP_STORE.set(storeKey, {
      code: generatedOtp,
      expiresAt: Date.now() + OTP_TTL_MS,
      attempts: 0,
    });

    // Send SMS (non-blocking — log if fails)
    try {
      const { sendSMS } = await import("@/lib/smsService");
      await sendSMS(
        newPhone,
        `Your Prayog India mobile verification code is: ${generatedOtp}. Valid for 10 minutes. Do not share with anyone.`,
      );
    } catch (smsErr) {
      console.warn("[ChangePhone] SMS dispatch failed:", smsErr);
    }

    console.log(`[ChangePhone] OTP for +91 ${newPhone}: ${generatedOtp}`); // dev log

    return NextResponse.json({
      success: true,
      message: `A 6-digit OTP has been sent to +91 ${newPhone}. Enter it below to verify.`,
    });
  }

  // ── ACTION: VERIFY OTP & UPDATE ────────────────────────────────────────────
  if (action === "verify") {
    const enteredCode = (code || "").toString().trim();

    if (!enteredCode) {
      return NextResponse.json(
        { success: false, message: "Please enter the OTP code." },
        { status: 400 },
      );
    }

    // Allow test OTP in dev
    const isTestOtp = process.env.NODE_ENV !== "production" &&
      (enteredCode === "1234" || enteredCode === "123456");

    if (!isTestOtp) {
      const stored = CHANGE_PHONE_OTP_STORE.get(storeKey);

      if (!stored) {
        return NextResponse.json(
          { success: false, message: "No OTP found. Please request a new OTP first." },
          { status: 400 },
        );
      }

      if (stored.expiresAt < Date.now()) {
        CHANGE_PHONE_OTP_STORE.delete(storeKey);
        return NextResponse.json(
          { success: false, message: "OTP has expired. Please request a fresh OTP." },
          { status: 401 },
        );
      }

      stored.attempts += 1;

      if (stored.attempts > MAX_ATTEMPTS) {
        CHANGE_PHONE_OTP_STORE.delete(storeKey);
        return NextResponse.json(
          {
            success: false,
            message:
              "Too many incorrect attempts. Please request a new OTP to continue.",
          },
          { status: 429 },
        );
      }

      if (stored.code !== enteredCode) {
        const remaining = MAX_ATTEMPTS - stored.attempts;
        return NextResponse.json(
          {
            success: false,
            message: `Incorrect OTP. ${remaining > 0 ? `${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.` : "No attempts remaining — request a new OTP."}`,
          },
          { status: 401 },
        );
      }
    }

    // OTP verified — consume it
    CHANGE_PHONE_OTP_STORE.delete(storeKey);

    const formattedPhone = `+91${newPhone}`;

    // Update DB
    if (isDatabaseAvailable()) {
      try {
        // Try Prisma first, fall back to raw SQL for stale-client safety
        try {
          await db.user.update({
            where: { id: user.id },
            data: { phone: formattedPhone },
          });
        } catch {
          await db.$executeRawUnsafe(
            `UPDATE "User" SET "phone"=$1, "updatedAt"=NOW() WHERE "id"=$2`,
            formattedPhone,
            user.id,
          );
        }
      } catch (dbErr: any) {
        console.error("[ChangePhone] DB update failed:", dbErr?.message);
        return NextResponse.json(
          {
            success: false,
            message:
              "Phone number verified but profile update failed. Please try again.",
          },
          { status: 500 },
        );
      }
    }

    // Re-issue session cookie with the updated phone
    const updatedPayload = { ...user, phone: formattedPhone };
    const sessionToken = await signSessionToken(updatedPayload, "7d");

    const response = NextResponse.json({
      success: true,
      message: "Mobile number verified and updated successfully.",
      newPhone: formattedPhone,
      user: updatedPayload,
    });

    response.cookies.set({
      name: "prayog_customer_session",
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  }

  return NextResponse.json(
    { success: false, message: "Invalid action. Use 'send' or 'verify'." },
    { status: 400 },
  );
}
