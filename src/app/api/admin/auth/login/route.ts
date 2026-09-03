import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalizeEmail, verifyPassword } from "@/lib/authUtils";
import {
  sanitizeAdminUser,
  AUTH_ADMIN_COOKIE_NAME,
  AdminSessionUser,
} from "@/lib/adminAuth";
import { Role } from "@prisma/client";
import { checkRateLimit, getSecurityHeaders } from "@/lib/security";

export async function POST(request: Request) {
  const headers = getSecurityHeaders();

  // Rate limit: Max 5 attempts / min per IP
  const clientIp = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const rateLimit = checkRateLimit(`admin_login:${clientIp}`, 5, 60 * 1000);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        message: `Too many admin login attempts. Please try again in ${rateLimit.resetInSeconds} seconds.`,
      },
      { status: 429, headers },
    );
  }

  try {
    const body = await request.json();
    const { email, password } = body;

    if (
      !email ||
      !password ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid admin credentials." },
        { status: 400, headers },
      );
    }

    const cleanEmail = normalizeEmail(email);

    // Mock Mode Fallback for Development
    let adminPayload: AdminSessionUser = {
      id: "usr-admin-demo",
      name: "System Admin",
      email: cleanEmail,
      phone: "+91 99999 88888",
      role: "ADMIN" as Role,
    };

    if (process.env.DATABASE_URL) {
      let dbUser = await db.user.findUnique({
        where: { email: cleanEmail },
      });

      // Auto-provision default admin if logging in with default email in dev
      if (!dbUser && cleanEmail === "admin@prayogindia.com") {
        const { hashPassword } = await import("@/lib/authUtils");
        const passHash = await hashPassword(password || "admin123");
        dbUser = await db.user.create({
          data: {
            name: "System Administrator",
            email: "admin@prayogindia.com",
            phone: "+91 99999 88888",
            passwordHash: passHash,
            role: "ADMIN" as Role,
          },
        });
      }

      const dbUserRole = String(dbUser?.role);
      if (!dbUser || (dbUserRole !== "ADMIN" && dbUserRole !== "SUPER_ADMIN")) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid admin credentials or account does not have admin privileges.",
          },
          { status: 401, headers },
        );
      }

      const isValidPassword = await verifyPassword(
        password,
        dbUser.passwordHash,
      );
      if (!isValidPassword) {
        return NextResponse.json(
          { success: false, message: "Invalid admin credentials." },
          { status: 401, headers },
        );
      }

      adminPayload = sanitizeAdminUser(dbUser as any);
    }

    const response = NextResponse.json({
      success: true,
      message: "Admin authentication successful.",
      user: adminPayload,
    });

    response.cookies.set({
      name: AUTH_ADMIN_COOKIE_NAME,
      value: JSON.stringify(adminPayload),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12, // 12 Hours
    });

    return response;
  } catch (error: any) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Admin login error." },
      { status: 500, headers },
    );
  }
}
