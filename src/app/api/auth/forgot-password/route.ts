import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { UserDB } from "@/lib/userDB";
import { sendSMS } from "@/lib/smsService";
import { sendEmail } from "@/lib/email";
import { getSecurityHeaders } from "@/lib/security";

// Global singleton map for reset tokens across hot reloads
const globalForResetTokens = globalThis as unknown as {
  passwordResetTokens: Map<string, { code: string; userId: string; email?: string; phone?: string; expiresAt: number }> | undefined;
};

export const RESET_TOKENS =
  globalForResetTokens.passwordResetTokens ?? new Map<string, { code: string; userId: string; email?: string; phone?: string; expiresAt: number }>();

if (process.env.NODE_ENV !== "production") {
  globalForResetTokens.passwordResetTokens = RESET_TOKENS;
}

export async function POST(request: Request) {
  const headers = getSecurityHeaders();

  try {
    const body = await request.json();
    const { identifier } = body;

    if (!identifier || typeof identifier !== "string" || !identifier.trim()) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid email or mobile number." },
        { status: 400, headers }
      );
    }

    const clean = identifier.trim().toLowerCase();
    const rawDigits = clean.replace(/\D/g, "");
    const cleanPhone = rawDigits.length >= 10 ? rawDigits.slice(-10) : "";
    const isEmail = clean.includes("@");

    let userId: string | null = null;
    let targetEmail: string | null = null;
    let targetPhone: string | null = null;

    if (process.env.DATABASE_URL) {
      try {
        const user = await db.user.findFirst({
          where: {
            OR: [
              ...(isEmail ? [{ email: { equals: clean, mode: "insensitive" as const } }] : []),
              ...(cleanPhone ? [{ phone: { contains: cleanPhone } }] : []),
            ],
          },
        });

        if (user) {
          userId = user.id;
          targetEmail = user.email;
          targetPhone = user.phone;
        }
      } catch (err) {
        console.error("[ForgotPassword] DB lookup error:", err);
      }
    }

    // Fallback to in-memory UserDB
    if (!userId) {
      const fallbackUser = UserDB.findByEmailOrPhone(clean);
      if (fallbackUser) {
        userId = fallbackUser.id;
        targetEmail = fallbackUser.email;
        targetPhone = fallbackUser.phone;
      }
    }

    if (userId) {
      // Generate secure 6-digit numeric reset code (100000 - 999999)
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes validity

      // Store by user ID and by identifier
      const tokenPayload = {
        code: resetCode,
        userId,
        email: targetEmail || undefined,
        phone: targetPhone || undefined,
        expiresAt,
      };

      RESET_TOKENS.set(userId, tokenPayload);
      if (cleanPhone) RESET_TOKENS.set(cleanPhone, tokenPayload);
      if (isEmail) RESET_TOKENS.set(clean, tokenPayload);

      // Dispatch SMS if phone available
      if (targetPhone) {
        const digits = targetPhone.replace(/\D/g, "").slice(-10);
        if (digits.length === 10) {
          await sendSMS(digits, `Your Prayog India password reset code is: ${resetCode}. Valid for 15 minutes.`);
        }
      }

      // Dispatch Email if email available
      if (targetEmail && isEmail) {
        await sendEmail({
          to: targetEmail,
          subject: "Prayog India - Password Reset Code",
          html: `<p>Hello,</p><p>You requested a password reset for your Prayog India account. Your verification code is:</p><h2>${resetCode}</h2><p>This code will expire in 15 minutes.</p>`,
        }).catch(() => {});
      }
    }

    // Always return success to prevent user enumeration
    return NextResponse.json(
      {
        success: true,
        message: "If an account matches your details, a 6-digit password reset code has been sent.",
        identifier: cleanPhone || clean,
      },
      { headers }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to process password reset request." },
      { status: 500, headers }
    );
  }
}
