import { NextResponse } from "next/server";
import { getAuthenticatedCustomer, AuthSessionUser } from "@/lib/authUtils";
import { db, isDatabaseAvailable } from "@/lib/db";

function cleanDisplayEmail(email?: string | null): string {
  if (!email) return "";
  const lower = email.toLowerCase().trim();
  if (
    lower.includes("@otp.") ||
    lower.includes("@prayogindia.local") ||
    lower.startsWith("user.")
  ) {
    return "";
  }
  return email.trim();
}

export async function GET() {
  const user = await getAuthenticatedCustomer();

  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthenticated." },
      {
        status: 401,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      },
    );
  }

  let freshUser: AuthSessionUser = {
    ...user,
    email: cleanDisplayEmail(user.email),
  };

  if (isDatabaseAvailable() && user.id) {
    try {
      const dbPromise = db.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          customerType: true,
          companyName: true,
          gstin: true,
          rewardPoints: true,
        },
      });

      // Guard against database lag or cold-start timeouts by racing with a 3-second fallback
      const timeoutPromise = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), 3000),
      );

      const dbRecord = await Promise.race([dbPromise, timeoutPromise]);

      if (dbRecord) {
        freshUser = {
          id: dbRecord.id,
          name: dbRecord.name,
          email: cleanDisplayEmail(dbRecord.email),
          phone: dbRecord.phone,
          role: (dbRecord.role as any) === "ADMIN" ? "ADMIN" : "CUSTOMER",
          customerType:
            dbRecord.customerType === "B2B"
              ? "B2B Customer"
              : "Registered Customer",
          companyName: dbRecord.companyName,
          gstin: dbRecord.gstin,
          rewardPoints: dbRecord.rewardPoints,
        };
      }
    } catch (err) {
      console.warn("DB user sync during /api/auth/me skipped:", err);
    }
  }

  return NextResponse.json(
    {
      success: true,
      user: freshUser,
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    },
  );
}
