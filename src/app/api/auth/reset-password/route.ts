import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { UserDB } from "@/lib/userDB";
import { RESET_TOKENS } from "../forgot-password/route";
import { getSecurityHeaders } from "@/lib/security";

export async function POST(request: Request) {
  const headers = getSecurityHeaders();

  try {
    const body = await request.json();
    const { identifier, code, newPassword } = body;

    if (!identifier || !code || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields (identifier, code, new password).",
        },
        { status: 400, headers },
      );
    }

    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters long.",
        },
        { status: 400, headers },
      );
    }

    const clean = identifier.trim().toLowerCase();
    const rawDigits = clean.replace(/\D/g, "");
    const cleanPhone = rawDigits.length >= 10 ? rawDigits.slice(-10) : "";
    const cleanCode = code.toString().trim();

    // Lookup token by identifier, phone, or direct key
    let token =
      RESET_TOKENS.get(clean) ||
      (cleanPhone ? RESET_TOKENS.get(cleanPhone) : undefined);

    if (!token) {
      // Scan tokens for matching email or phone
      for (const t of RESET_TOKENS.values()) {
        if (
          (t.email && t.email.toLowerCase() === clean) ||
          (t.phone && t.phone.replace(/\D/g, "").slice(-10) === cleanPhone)
        ) {
          token = t;
          break;
        }
      }
    }

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired reset code. Please request a new one.",
        },
        { status: 400, headers },
      );
    }

    if (Date.now() > token.expiresAt) {
      RESET_TOKENS.delete(token.userId);
      if (cleanPhone) RESET_TOKENS.delete(cleanPhone);
      if (clean) RESET_TOKENS.delete(clean);
      return NextResponse.json(
        {
          success: false,
          message: "Reset code has expired. Please request a new one.",
        },
        { status: 400, headers },
      );
    }

    if (token.code !== cleanCode) {
      return NextResponse.json(
        {
          success: false,
          message: "Incorrect reset code. Please check your SMS/email.",
        },
        { status: 400, headers },
      );
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update in database if configured
    if (process.env.DATABASE_URL) {
      try {
        await db.user.update({
          where: { id: token.userId },
          data: { passwordHash },
        });
      } catch (err) {
        console.error("[ResetPassword] DB update error:", err);
      }
    }

    // Update in memory fallback
    const memUser =
      UserDB.findByEmailOrPhone(clean) ||
      (cleanPhone ? UserDB.findByEmailOrPhone(cleanPhone) : undefined);
    if (memUser) {
      memUser.passwordHash = passwordHash;
    }

    // Invalidate token
    RESET_TOKENS.delete(token.userId);
    if (cleanPhone) RESET_TOKENS.delete(cleanPhone);
    if (clean) RESET_TOKENS.delete(clean);

    return NextResponse.json(
      {
        success: true,
        message: "Password has been successfully updated. You can now log in.",
      },
      { headers },
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to reset password." },
      { status: 500, headers },
    );
  }
}
