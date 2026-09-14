import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { AuthSessionUser, normalizeEmail, hashPassword } from "@/lib/authUtils";
import { getSecurityHeaders, checkRateLimit } from "@/lib/security";

async function getAuthenticatedUser(): Promise<AuthSessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("prayog_customer_session");
  if (!sessionCookie?.value) return null;
  try {
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

/**
 * GET /api/users/me
 * Returns the authenticated customer's profile.
 */
export async function GET() {
  const headers = getSecurityHeaders();
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthenticated" },
      { status: 401, headers },
    );
  }

  if (!process.env.DATABASE_URL) {
    // Mock mode
    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        customerType: "B2C",
        rewardPoints: 0,
        companyName: null,
        gstin: null,
      },
    });
  }

  try {
    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        customerType: true,
        companyName: true,
        gstin: true,
        rewardPoints: true,
        createdAt: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404, headers },
      );
    }

    return NextResponse.json({ success: true, data: dbUser });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch profile." },
      { status: 500, headers },
    );
  }
}

/**
 * PATCH /api/users/me
 * Updates the authenticated customer's profile.
 * Customers can update: name, phone, companyName, gstin, customerType.
 * Customers CANNOT change: email (requires separate verification flow), role, rewardPoints.
 */
export async function PATCH(request: Request) {
  const headers = getSecurityHeaders();
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthenticated" },
      { status: 401, headers },
    );
  }

  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const rateLimit = checkRateLimit(`profile-update:${user.id}:${ip}`, 10, 60000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, message: "Too many update requests." },
      { status: 429, headers },
    );
  }

  try {
    const body = await request.json();

    // Whitelist updatable fields — NEVER allow email, role, rewardPoints from client
    const { name, phone, companyName, gstin, customerType } = body;

    const updateData: Record<string, any> = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length < 2) {
        return NextResponse.json(
          { success: false, message: "Name must be at least 2 characters." },
          { status: 400, headers },
        );
      }
      updateData.name = name.trim();
    }

    if (phone !== undefined) {
      const cleanPhone = String(phone).replace(/\D/g, "");
      if (cleanPhone.length < 10) {
        return NextResponse.json(
          { success: false, message: "Enter a valid 10-digit phone number." },
          { status: 400, headers },
        );
      }
      updateData.phone = `+91${cleanPhone.slice(-10)}`;
    }

    if (companyName !== undefined) {
      updateData.companyName = companyName ? String(companyName).trim() : null;
    }

    if (gstin !== undefined) {
      if (gstin) {
        const gstinPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        if (!gstinPattern.test(gstin.toUpperCase().trim())) {
          return NextResponse.json(
            { success: false, message: "Invalid GSTIN format." },
            { status: 400, headers },
          );
        }
        updateData.gstin = gstin.toUpperCase().trim();
        updateData.customerType = "B2B"; // Auto-upgrade to B2B if GSTIN provided
      } else {
        updateData.gstin = null;
      }
    }

    // Allow customerType update within allowed enum values
    if (customerType !== undefined) {
      const allowedTypes = ["B2C", "B2B", "REGISTERED"];
      if (!allowedTypes.includes(customerType)) {
        return NextResponse.json(
          { success: false, message: "Invalid customer type." },
          { status: 400, headers },
        );
      }
      updateData.customerType = customerType;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields to update." },
        { status: 400, headers },
      );
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        success: true,
        message: "Profile updated (Mock Mode).",
        data: { ...updateData, id: user.id },
      });
    }

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        customerType: true,
        companyName: true,
        gstin: true,
        rewardPoints: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      data: updatedUser,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update profile." },
      { status: 500, headers },
    );
  }
}
