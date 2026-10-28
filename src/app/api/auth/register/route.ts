import { NextResponse } from "next/server";
import { db, isDatabaseAvailable } from "@/lib/db";
import { normalizeEmail, hashPassword, sanitizeUser } from "@/lib/authUtils";
import { UserDB } from "@/lib/userDB";
import { checkRateLimit, getSecurityHeaders } from "@/lib/security";
import { registerSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const headers = getSecurityHeaders();
  const clientIp = request.headers.get("x-forwarded-for") || "127.0.0.1";

  // Rate Limiting (5 registrations per minute per IP)
  const rateLimit = checkRateLimit(`reg:${clientIp}`, 5, 60 * 1000);
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

    const { name, email, phone, password, confirmPassword, b2b } = parseResult.data;
    const cleanEmail = normalizeEmail(email);
    const cleanPhone = phone ? phone.replace(/\D/g, "") : "";
    const displayName = (name && name.trim()) || cleanEmail.split("@")[0] || "Prayog Member";

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

    // 5. Check Duplicate Account (UserDB & PostgreSQL)
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

    // In production, require durable database availability
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
              { email: cleanEmail },
              ...(cleanPhone && cleanPhone.length >= 10
                ? [{ phone: { contains: cleanPhone.slice(-10) } }]
                : []),
            ],
          },
        });

        if (existingUser) {
          const isEmailMatch = existingUser.email.toLowerCase() === cleanEmail;
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
        if (process.env.NODE_ENV === "production") {
          return NextResponse.json(
            {
              success: false,
              message:
                "Database service is currently unavailable. Please try again later.",
            },
            { status: 503, headers },
          );
        }
      }
    }

    // 6. Securely Hash Password
    const passwordHash = await hashPassword(password);
    const isB2B = Boolean(b2b?.companyName?.trim());
    const companyName = b2b?.companyName?.trim() || null;
    const gstin = b2b?.gstNumber?.trim() || null;

    // Save to UserDB (Development / in-memory cache)
    const createdUser = UserDB.create({
      name: displayName,
      email: cleanEmail,
      phone: cleanPhone ? `+91 ${cleanPhone.slice(-10)}` : "",
      passwordHash,
      rewardPoints: 100, // 100 Welcome coins
      customerType: isB2B ? "B2B Customer" : "Registered Customer",
      companyName: companyName || undefined,
      gstin: gstin || undefined,
    });

    if (isDatabaseAvailable()) {
      try {
        const dbNewUser = await db.user.create({
          data: {
            name: displayName,
            email: cleanEmail,
            phone: cleanPhone ? `+91 ${cleanPhone.slice(-10)}` : "",
            passwordHash,
            role: "CUSTOMER",
            customerType: isB2B ? "B2B" : "B2C",
            companyName,
            gstin,
            rewardPoints: 100,
          },
        });

        // Award welcome bonus points via authoritative LoyaltyEngine
        const { LoyaltyEngine } = await import("@/lib/loyaltyEngine");
        await LoyaltyEngine.awardRegistrationBonus(
          dbNewUser.id,
          "Registered Customer",
          request,
        );
      } catch (dbErr) {
        console.warn("Prisma DB sync fallback:", dbErr);
        if (process.env.NODE_ENV === "production") {
          return NextResponse.json(
            {
              success: false,
              message:
                "Failed to durably register account in database. Please try again later.",
            },
            { status: 503, headers },
          );
        }
      }
    }

    // Return registration success without setting login session cookie
    return NextResponse.json(
      {
        success: true,
        message:
          "Account created successfully! Please sign in with your credentials.",
        email: cleanEmail,
        user: {
          id: createdUser.id,
          name: createdUser.name,
          email: createdUser.email,
          phone: createdUser.phone,
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
