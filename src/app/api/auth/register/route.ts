import { NextResponse } from "next/server";
import { db, isDatabaseAvailable } from "@/lib/db";
import { normalizeEmail, hashPassword, sanitizeUser, AuthSessionUser } from "@/lib/authUtils";
import { UserDB } from "@/lib/userDB";
import { checkRateLimit, getSecurityHeaders } from "@/lib/security";
import { registerSchema } from "@/lib/validations";
import { RegistrationService } from "@/lib/registrationService";
import { signSessionToken } from "@/lib/jwt";

export async function POST(request: Request) {
  const headers = getSecurityHeaders();
  const clientIp = request.headers.get("x-forwarded-for") || "127.0.0.1";

  // Rate Limiting (5 registrations per minute per IP)
  const rateLimit = checkRateLimit(`reg:${clientIp}`, 10, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        message: `Too many registration attempts. Please wait ${rateLimit.resetInSeconds} seconds.`,
      },
      { status: 429, headers },
    );
  }

  try {
    const body = await request.json();

    // ── 1. Action: Resend Registration OTP ──
    if (body.action === "resend") {
      const resendResult = await RegistrationService.resend(body.phone || "");
      return NextResponse.json(resendResult, {
        status: resendResult.success ? 200 : 400,
        headers,
      });
    }

    // ── 2. Action: Verify Registration OTP & Complete Account Creation ──
    if (body.action === "verify" || body.code || body.otp) {
      const code = body.code || body.otp;
      const verifyResult = await RegistrationService.verifyAndCreate(body.phone || "", code);

      if (!verifyResult.success || !verifyResult.user) {
        return NextResponse.json(
          { success: false, message: verifyResult.message },
          { status: 400, headers },
        );
      }

      // Generate authenticated session token
      const sessionToken = await signSessionToken(verifyResult.user as AuthSessionUser, "7d");

      const response = NextResponse.json(
        {
          success: true,
          message: "Registration verified and account created successfully.",
          user: verifyResult.user,
        },
        { headers },
      );

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

    // ── 3. Validate Input Data ──
    const parseResult = registerSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: parseResult.error.issues[0]?.message || "Invalid registration data.",
          errors: parseResult.error.issues,
        },
        { status: 400, headers },
      );
    }

    const { name, email, phone, password, confirmPassword, b2b, action, requireOtp } = parseResult.data;
    const cleanEmail = email ? normalizeEmail(email) : "";
    const cleanPhone = phone ? phone.replace(/\D/g, "") : "";
    const displayName = (name && name.trim()) || (cleanEmail ? cleanEmail.split("@")[0] : "");

    // 4. Confirm Password Verification
    if (confirmPassword && password !== confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Passwords do not match. Please verify your confirm password.",
        },
        { status: 400, headers },
      );
    }

    // 5. Amazon-style OTP Registration: When action is "initiate" or useOtp/requireOtp is explicitly requested
    const shouldUseOtp = action === "initiate" || body.useOtp === true || body.requireOtp === true;

    if (shouldUseOtp) {
      const initiateResult = await RegistrationService.initiate({
        name: displayName,
        phone: cleanPhone,
        email: cleanEmail,
        password,
        b2b,
      });

      return NextResponse.json(initiateResult, {
        status: initiateResult.success ? 200 : initiateResult.code === "ACCOUNT_EXISTS" ? 409 : 400,
        headers,
      });
    }

    // ── 6. Direct Registration Mode (Backwards compatibility / API tests) ──
    if (UserDB.exists(cleanEmail, cleanPhone)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "An account with this email address or mobile number already exists. Please Sign In.",
        },
        { status: 409, headers },
      );
    }

    if (process.env.NODE_ENV === "production" && !isDatabaseAvailable()) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Database service is currently unavailable. Registration cannot be completed.",
        },
        { status: 503, headers },
      );
    }

    if (isDatabaseAvailable()) {
      try {
        const existingUser = await db.user.findFirst({
          where: {
            OR: [
              ...(cleanEmail ? [{ email: cleanEmail }] : []),
              ...(cleanPhone && cleanPhone.length >= 10
                ? [{ phone: { contains: cleanPhone.slice(-10) } }]
                : []),
            ],
          },
        });

        if (existingUser) {
          const isGuestAccount =
            existingUser.passwordHash === "GUEST_ACCOUNT_NO_PASSWORD" ||
            existingUser.customerType === "GUEST";

          if (isGuestAccount) {
            const newPasswordHash = await hashPassword(password);
            const isB2B = Boolean(b2b?.companyName?.trim());
            const companyName = b2b?.companyName?.trim() || existingUser.companyName;
            const gstin = b2b?.gstNumber?.trim() || existingUser.gstin;

            const updatedUser = await db.user.update({
              where: { id: existingUser.id },
              data: {
                name: displayName,
                email: cleanEmail || existingUser.email,
                phone: cleanPhone ? `+91 ${cleanPhone.slice(-10)}` : existingUser.phone,
                passwordHash: newPasswordHash,
                customerType: isB2B ? "B2B" : "B2C",
                companyName,
                gstin,
                status: "ACTIVE",
                mobileVerified: true,
              },
            });

            return NextResponse.json(
              {
                success: true,
                message: "Guest account converted to registered account successfully.",
                user: sanitizeUser(updatedUser),
              },
              { headers },
            );
          }

          const isEmailMatch = (existingUser.email?.toLowerCase() || "") === cleanEmail;
          return NextResponse.json(
            {
              success: false,
              message: isEmailMatch
                ? "An account with this email address already exists. Please Sign In."
                : "An account with this mobile number already exists. Please Sign In.",
            },
            { status: 409, headers },
          );
        }
      } catch (dbErr) {
        console.warn("Prisma user duplicate check skipped:", dbErr);
      }
    }

    // Hash Password & Save User
    const passwordHash = await hashPassword(password);
    const isB2B = Boolean(b2b?.companyName?.trim());
    const companyName = b2b?.companyName?.trim() || null;
    const gstin = b2b?.gstNumber?.trim() || null;

    const createdUser = UserDB.create({
      name: displayName,
      email: cleanEmail,
      phone: cleanPhone ? `+91 ${cleanPhone.slice(-10)}` : "",
      passwordHash,
      rewardPoints: 100,
      customerType: isB2B ? "B2B Customer" : "Registered Customer",
      companyName: companyName || undefined,
      gstin: gstin || undefined,
      mobileVerified: Boolean(cleanPhone),
      emailVerified: Boolean(cleanEmail),
      status: "ACTIVE",
    });

    let dbNewUser: any = null;
    if (isDatabaseAvailable()) {
      try {
        dbNewUser = await db.user.create({
          data: {
            name: displayName,
            email: cleanEmail || null,
            phone: cleanPhone ? `+91 ${cleanPhone.slice(-10)}` : "",
            passwordHash,
            role: "CUSTOMER",
            customerType: isB2B ? "B2B" : "B2C",
            companyName,
            gstin,
            rewardPoints: 100,
            status: "ACTIVE",
            mobileVerified: Boolean(cleanPhone),
          },
        });
      } catch (dbErr) {
        console.warn("Prisma DB sync fallback:", dbErr);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Account created successfully! Please sign in with your credentials.",
        email: cleanEmail,
        user: {
          id: dbNewUser?.id || createdUser.id,
          name: dbNewUser?.name || createdUser.name,
          email: cleanEmail,
          phone: dbNewUser?.phone || createdUser.phone,
          customerType: createdUser.customerType,
          rewardPoints: createdUser.rewardPoints,
        },
      },
      { headers },
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Registration failed." },
      { status: 500, headers },
    );
  }
}
