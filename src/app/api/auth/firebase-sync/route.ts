import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalizeEmail, sanitizeUser } from "@/lib/authUtils";
import { UserDB } from "@/lib/userDB";
import { getSecurityHeaders } from "@/lib/security";

export async function POST(request: Request) {
  const headers = getSecurityHeaders();

  try {
    const body = await request.json();
    const { uid, email, displayName, phoneNumber, photoURL } = body;

    if (!uid) {
      return NextResponse.json(
        { success: false, message: "Invalid Firebase UID." },
        { status: 400, headers },
      );
    }

    const cleanEmail = email
      ? normalizeEmail(email)
      : `user_${uid.slice(0, 8)}@prayogindia.com`;
    const cleanPhone = phoneNumber || "";
    const name =
      displayName ||
      (cleanEmail ? cleanEmail.split("@")[0] : "Prayog Customer");

    let userPayload: any = null;

    // 1. Check or upsert in PostgreSQL if DATABASE_URL is available
    if (process.env.DATABASE_URL) {
      try {
        let existing = await db.user.findFirst({
          where: {
            OR: [
              { email: cleanEmail },
              ...(cleanPhone ? [{ phone: cleanPhone }] : []),
            ],
          },
        });

        if (!existing) {
          existing = await db.user.create({
            data: {
              name,
              email: cleanEmail,
              phone: cleanPhone || "",
              passwordHash: `firebase_${uid}`,
              role: "CUSTOMER",
              customerType: "B2C",
              rewardPoints: 100,
            },
          });
        }

        userPayload = {
          id: existing.id,
          name: existing.name || name,
          email: existing.email,
          phone: existing.phone || cleanPhone || "+91 98765 43210",
          customerType: "Registered Customer",
          rewardPoints: 100,
          role: "CUSTOMER",
          avatarUrl: photoURL || undefined,
        };
      } catch (dbErr) {
        console.warn("PostgreSQL user sync notice:", dbErr);
      }
    }

    // 2. Fallback / Sync in-memory UserDB
    if (!userPayload) {
      let existing =
        UserDB.findByEmailOrPhone(cleanEmail) ||
        (cleanPhone ? UserDB.findByEmailOrPhone(cleanPhone) : null);
      if (!existing) {
        existing = UserDB.create({
          name,
          email: cleanEmail,
          phone: cleanPhone || "+91 98765 43210",
          passwordHash: `firebase_${uid}`,
          customerType: "Registered Customer",
          rewardPoints: 100,
        });
      }

      userPayload = {
        id: existing.id,
        name: existing.name,
        email: existing.email,
        phone: existing.phone,
        customerType: existing.customerType,
        rewardPoints: existing.rewardPoints,
        role: "CUSTOMER",
        avatarUrl: photoURL || undefined,
      };
    }

    const response = NextResponse.json({
      success: true,
      message: "Firebase authentication synced successfully.",
      user: userPayload,
    });

    // Set standard session cookie
    response.cookies.set({
      name: "prayog_customer_session",
      value: JSON.stringify(userPayload),
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
        message: error.message || "Failed to sync Firebase user session.",
      },
      { status: 500, headers },
    );
  }
}
