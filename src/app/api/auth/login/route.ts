import { NextResponse } from "next/server";
import { db, isDatabaseAvailable } from "@/lib/db";
import { normalizeEmail, verifyPassword, sanitizeUser, AuthSessionUser } from "@/lib/authUtils";
import { UserDB } from "@/lib/userDB";
import { checkRateLimit, getSecurityHeaders } from "@/lib/security";
import { loginSchema } from "@/lib/validations";
import { signSessionToken } from "@/lib/jwt";

export async function POST(request: Request) {
  const headers = getSecurityHeaders();
  const clientIp = request.headers.get("x-forwarded-for") || "127.0.0.1";

  // Rate Limiting (5 attempts per minute per IP to mitigate brute force)
  const rateLimit = checkRateLimit(`login:${clientIp}`, 5, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        message: `Too many login attempts. Please try again in ${rateLimit.resetInSeconds} seconds.`,
      },
      { status: 429, headers },
    );
  }

  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: validation.error.issues[0]?.message || "Invalid input data.",
        },
        { status: 400, headers },
      );
    }

    const { email, password, rememberMe } = validation.data;
    const identifier = email.trim();
    const cleanEmail = normalizeEmail(identifier);
    const rawDigits = identifier.replace(/\D/g, "");
    const cleanPhone = rawDigits.length >= 10 ? rawDigits.slice(-10) : "";

    // 2. Lookup in UserDB (Email or Mobile)
    const userRecord = UserDB.findByEmailOrPhone(identifier);

    // 3. Fallback check Prisma Database if available
    let dbUser: any = null;
    if (!userRecord && isDatabaseAvailable()) {
      try {
        dbUser = await db.user.findFirst({
          where: {
            OR: [
              { email: cleanEmail },
              ...(cleanPhone ? [{ phone: { contains: cleanPhone } }] : []),
            ],
          },
        });
      } catch (dbErr) {
        console.warn("Prisma user lookup skipped during login:", dbErr);
      }
    }

    // 4. If user not found in any store -> Return safe authentication failure
    if (!userRecord && !dbUser) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid email/mobile or password. Please verify your credentials or register.",
        },
        { status: 401, headers },
      );
    }

    // 5. Verify Password Hash using bcrypt
    const targetHash: string = userRecord
      ? userRecord.passwordHash
      : dbUser?.passwordHash || "";
    const isValidPassword = await verifyPassword(password, targetHash);

    if (!isValidPassword) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Incorrect password. Please verify and try again or use "Forgot Password".',
        },
        { status: 401, headers },
      );
    }

    // 6. Construct Authenticated User Payload
    const userPayload: AuthSessionUser | null = userRecord
      ? {
          id: userRecord.id,
          name: userRecord.name,
          email: userRecord.email,
          phone: userRecord.phone,
          customerType: userRecord.customerType,
          companyName: userRecord.companyName ?? null,
          gstin: userRecord.gstin ?? null,
          rewardPoints: userRecord.rewardPoints,
          role: "CUSTOMER" as const,
        }
      : dbUser
        ? sanitizeUser({
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            phone: dbUser.phone,
            role: dbUser.role || "CUSTOMER",
            customerType:
              dbUser.customerType === "B2B"
                ? "B2B Customer"
                : "Registered Customer",
            companyName: dbUser.companyName,
            gstin: dbUser.gstin,
            rewardPoints: dbUser.rewardPoints ?? 100,
          })
        : null;

    if (!userPayload) {
      return NextResponse.json(
        { success: false, message: "Failed to process user session." },
        { status: 500, headers },
      );
    }

    // 7. Set Cryptographically Signed HttpOnly Customer Session Cookie
    const expiresIn = rememberMe ? "30d" : "7d";
    const maxAgeSeconds = rememberMe
      ? 60 * 60 * 24 * 30 // 30 Days
      : 60 * 60 * 24 * 7; // 7 Days

    const sessionToken = await signSessionToken(userPayload, expiresIn);

    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
      user: userPayload,
    });

    response.cookies.set({
      name: "prayog_customer_session",
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: maxAgeSeconds,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Authentication server error. Please try again.",
      },
      { status: 500, headers },
    );
  }
}
