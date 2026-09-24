import { NextResponse } from "next/server";
import { db } from "@/lib/db";
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

    const { name, email, phone, password } = parseResult.data;
    const cleanEmail = normalizeEmail(email);
    const cleanPhone = phone.replace(/\D/g, "");

    // 4. Password Complexity Validation
    // Requires min 6 characters
    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters long.",
        },
        { status: 400, headers },
      );
    }

    // 5. Check Duplicate Account
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

    if (process.env.DATABASE_URL) {
      const existingUser = await db.user.findUnique({
        where: { email: cleanEmail },
      });

      if (existingUser) {
        return NextResponse.json(
          {
            success: false,
            message:
              "An account with this email address already exists. Please Sign In.",
          },
          { status: 409, headers },
        );
      }
    }

    // 6. Securely Hash Password
    const passwordHash = await hashPassword(password);

    // Save to UserDB
    const createdUser = UserDB.create({
      name: name.trim(),
      email: cleanEmail,
      phone: `+91 ${cleanPhone.slice(-10)}`,
      passwordHash,
      rewardPoints: 100, // 100 Welcome coins
      customerType: "Registered Customer",
    });

    if (process.env.DATABASE_URL) {
      try {
        const dbNewUser = await db.user.create({
          data: {
            name: name.trim(),
            email: cleanEmail,
            phone: `+91 ${cleanPhone.slice(-10)}`,
            passwordHash,
            role: "CUSTOMER",
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
      }
    }

    const newUserPayload = sanitizeUser({
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      phone: createdUser.phone,
      role: "CUSTOMER",
    });

    // Return registration success without setting login session cookie
    return NextResponse.json({
      success: true,
      message:
        "Account created successfully! Please sign in with your credentials.",
      email: cleanEmail,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Registration failed." },
      { status: 500, headers },
    );
  }
}
