import { NextResponse } from "next/server";
import { UserDB } from "@/lib/userDB";
import { sendSMS } from "@/lib/smsService";
import { db, isDatabaseAvailable } from "@/lib/db";
import { signSessionToken } from "@/lib/jwt";
import { AuthSessionUser } from "@/lib/authUtils";

// Server-side in-memory OTP storage for validation
const OTP_STORE = new Map<string, { code: string; expiresAt: number }>();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, phone, code } = body;

    const rawDigits = (phone || "").replace(/\D/g, "");
    const cleanPhone =
      rawDigits.length >= 10 ? rawDigits.slice(-10) : rawDigits;

    if (!cleanPhone || cleanPhone.length < 10) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide a valid 10-digit mobile number.",
        },
        { status: 400 },
      );
    }

    if (action === "send" || action === "get-otp") {
      // Check if existing valid OTP exists, or generate new one
      const existing = OTP_STORE.get(cleanPhone);
      let generatedOtp =
        action === "get-otp" && existing && existing.expiresAt > Date.now()
          ? existing.code
          : Math.floor(100000 + Math.random() * 900000).toString();

      OTP_STORE.set(cleanPhone, {
        code: generatedOtp,
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes validity
      });

      if (action === "send") {
        // Dispatch SMS to customer phone
        await sendSMS(cleanPhone, generatedOtp);
      }

      return NextResponse.json({
        success: true,
        message: `OTP sent successfully to +91 ${cleanPhone}.`,
        otp: process.env.NODE_ENV !== "production" ? generatedOtp : undefined,
      });
    }

    if (action === "verify") {
      const enteredCode = (code || "").toString().trim();
      if (!enteredCode || enteredCode.length !== 6) {
        return NextResponse.json(
          {
            success: false,
            message: "Please enter the 6-digit OTP code sent to your phone.",
          },
          { status: 400 },
        );
      }

      const stored = OTP_STORE.get(cleanPhone);
      if (!stored || stored.expiresAt < Date.now()) {
        return NextResponse.json(
          {
            success: false,
            message: "OTP has expired. Please request a new OTP.",
          },
          { status: 401 },
        );
      }

      if (stored.code !== enteredCode) {
        return NextResponse.json(
          {
            success: false,
            message: "Incorrect OTP code. Please check your SMS and re-enter.",
          },
          { status: 401 },
        );
      }

      // Clear consumed OTP
      OTP_STORE.delete(cleanPhone);

      // Lookup or register in DB & UserDB
      let existingDbUser: any = null;
      if (isDatabaseAvailable()) {
        try {
          existingDbUser = await db.user.findFirst({
            where: {
              phone: { contains: cleanPhone },
            },
          });
        } catch (dbErr) {
          console.warn("DB lookup during OTP login skipped:", dbErr);
        }
      }

      let existing = UserDB.findByEmailOrPhone(cleanPhone);

      if (!existing && !existingDbUser) {
        const dummyEmail = `user.${cleanPhone}@prayogindia.com`;
        const displayName = `Customer ${cleanPhone.slice(-4)}`;

        existing = UserDB.create({
          name: displayName,
          email: dummyEmail,
          phone: `+91 ${cleanPhone}`,
          passwordHash: "",
          customerType: "Registered Customer",
          rewardPoints: 100,
        });

        if (isDatabaseAvailable()) {
          try {
            existingDbUser = await db.user.create({
              data: {
                name: displayName,
                email: dummyEmail,
                phone: `+91 ${cleanPhone}`,
                passwordHash: "",
                role: "CUSTOMER",
                customerType: "B2C",
                rewardPoints: 100,
              },
            });
          } catch (dbErr) {
            console.warn("DB user create during OTP login fallback:", dbErr);
          }
        }
      }

      const userPayload: AuthSessionUser = {
        id: existingDbUser?.id || existing?.id || `usr-otp-${cleanPhone}`,
        name: existingDbUser?.name || existing?.name || `Customer ${cleanPhone.slice(-4)}`,
        email: existingDbUser?.email || existing?.email || `user.${cleanPhone}@prayogindia.com`,
        phone: existingDbUser?.phone || existing?.phone || `+91 ${cleanPhone}`,
        customerType:
          existing?.customerType ||
          (existingDbUser?.customerType === "B2B" ? "B2B Customer" : "Registered Customer"),
        companyName: existing?.companyName || existingDbUser?.companyName || null,
        gstin: existing?.gstin || existingDbUser?.gstin || null,
        rewardPoints: existing?.rewardPoints ?? existingDbUser?.rewardPoints ?? 100,
        role: "CUSTOMER",
      };

      const sessionToken = await signSessionToken(userPayload, "7d");

      const response = NextResponse.json({
        success: true,
        message: "OTP verified successfully.",
        user: userPayload,
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
      { success: false, message: "Invalid action." },
      { status: 400 },
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "OTP processing failed." },
      { status: 500 },
    );
  }
}
