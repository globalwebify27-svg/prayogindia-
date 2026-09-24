import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalizeEmail, verifyPassword, sanitizeUser } from "@/lib/authUtils";
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

    const { email, password } = validation.data;

    const identifier = email.trim();

    // 2. Lookup in UserDB (Email or Mobile)
    const userRecord = UserDB.findByEmailOrPhone(identifier);

    // 3. Fallback check Prisma Database if available
    let dbUser: any = null;
    if (!userRecord && process.env.DATABASE_URL) {
      const cleanEmail = normalizeEmail(identifier);
      dbUser = await db.user.findUnique({
        where: { email: cleanEmail },
      });
    }

    // 4. If user not found in any store -> Return generic authentication failure
    if (!userRecord && !dbUser) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No account found with this email/mobile. Please check your credentials or register.",
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
    const userPayload = userRecord
      ? {
          id: userRecord.id,
          name: userRecord.name,
          email: userRecord.email,
          phone: userRecord.phone,
          customerType: userRecord.customerType,
          companyName: userRecord.companyName,
          gstin: userRecord.gstin,
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
          })
        : null;

    if (!userPayload) {
      return NextResponse.json(
        { success: false, message: "Failed to process user session." },
        { status: 500, headers },
      );
    }

    // 7. Set Cryptographically Signed HttpOnly Customer Session Cookie
    const sessionToken = await signSessionToken(userPayload, "7d");

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
      maxAge: 60 * 60 * 24 * 7, // 7 Days
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
