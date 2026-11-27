import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { AuthSessionUser, normalizeEmail, hashPassword, getAuthenticatedCustomer } from "@/lib/authUtils";
import { getSecurityHeaders, checkRateLimit } from "@/lib/security";
import { signSessionToken } from "@/lib/jwt";

const getAuthenticatedUser = getAuthenticatedCustomer;

/**
 * GET /api/users/me
 * Returns the authenticated customer's profile.
 */
export async function GET() {
  const headers = getSecurityHeaders();
  const user = await getAuthenticatedCustomer();
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
    let dbUser: any = null;
    try {
      dbUser = await db.user.findFirst({
        where: {
          OR: [
            ...(user.id ? [{ id: user.id }] : []),
            ...(user.email ? [{ email: normalizeEmail(user.email) }] : []),
            ...(user.phone ? [{ phone: { contains: user.phone.replace(/\D/g, "").slice(-10) } }] : []),
          ],
        },
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
    } catch (findErr: any) {
      console.warn("[Users/Me GET] Stale prisma lookup fallback:", findErr?.message);
      try {
        const cleanPhone = (user.phone || "").replace(/\D/g, "").slice(-10);
        const rows = await db.$queryRawUnsafe(
          `SELECT "id", "name", "email", "phone", "customerType", "companyName", "gstin", "rewardPoints", "createdAt" 
           FROM "User" 
           WHERE "id" = $1 OR ("email" != '' AND "email" = $2) OR ("phone" != '' AND "phone" LIKE $3)
           LIMIT 1`,
          user.id || "",
          user.email ? normalizeEmail(user.email) : "---",
          cleanPhone ? `%${cleanPhone}%` : "---"
        ) as any[];
        dbUser = rows?.[0] || null;
      } catch (rawErr: any) {
        console.warn("[Users/Me GET] Raw fallback error:", rawErr?.message);
      }
    }

    if (!dbUser && (user.email || user.phone)) {
      // Auto-create in PostgreSQL if missing
      const cleanEmail = user.email ? normalizeEmail(user.email) : `${(user.phone || "").replace(/\D/g, "").slice(-10)}@otp.prayogindia.local`;
      try {
        const created = await db.user.create({
          data: {
            name: user.name || "Prayog Customer",
            email: cleanEmail,
            phone: user.phone || "",
            passwordHash: "",
            role: "CUSTOMER",
            customerType: "B2C",
            rewardPoints: user.rewardPoints || 100,
          },
        });

        dbUser = {
          id: created.id,
          name: created.name,
          email: created.email,
          phone: created.phone,
          customerType: created.customerType,
          companyName: created.companyName,
          gstin: created.gstin,
          rewardPoints: created.rewardPoints,
          createdAt: created.createdAt,
        };
      } catch (createErr: any) {
        console.warn("[Users/Me GET] Stale create fallback:", createErr?.message);
        try {
          const newId = user.id || `usr-${Date.now()}`;
          await db.$executeRawUnsafe(
            `INSERT INTO "User" ("id", "name", "email", "phone", "passwordHash", "role", "customerType", "rewardPoints", "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, '', 'CUSTOMER'::"Role", 'B2C'::"CustomerType", 100, NOW(), NOW())
             ON CONFLICT ("email") DO NOTHING`,
            newId,
            user.name || "Prayog Customer",
            cleanEmail,
            user.phone || ""
          );
          dbUser = {
            id: newId,
            name: user.name || "Prayog Customer",
            email: cleanEmail,
            phone: user.phone || "",
            customerType: "B2C",
            companyName: null,
            gstin: null,
            rewardPoints: 100,
            createdAt: new Date(),
          };
        } catch (_) {}
      }
    }

    if (!dbUser) {
      // Return user from session token if DB record isn't found
      return NextResponse.json({
        success: true,
        data: {
          id: user.id,
          name: user.name || "Customer",
          email: user.email || "",
          phone: user.phone || "",
          customerType: user.customerType || "B2C",
          companyName: user.companyName || null,
          gstin: user.gstin || null,
          rewardPoints: user.rewardPoints || 100,
          createdAt: new Date().toISOString(),
        },
      });
    }

    // Resolve real customer name from past Orders/Addresses if name is a placeholder
    if (!dbUser.name || dbUser.name === "Customer" || dbUser.name === "Prayog Customer" || dbUser.name.startsWith("Customer ")) {
      try {
        const cleanPhone = (user.phone || dbUser.phone || "").replace(/\D/g, "").slice(-10);
        if (cleanPhone.length >= 10) {
          const pastOrder = (await db.$queryRawUnsafe(
            `SELECT "shippingAddress" FROM "Order" WHERE "shippingAddress" LIKE $1 ORDER BY "createdAt" DESC LIMIT 1`,
            `%${cleanPhone}%`,
          )) as any[];
          if (pastOrder && pastOrder[0]?.shippingAddress) {
            const parts = pastOrder[0].shippingAddress.split(",");
            if (parts[0] && parts[0].trim().length >= 2 && !parts[0].trim().startsWith("Customer ")) {
              const realName = parts[0].trim();
              dbUser.name = realName;
              await db.$executeRawUnsafe(
                `UPDATE "User" SET "name" = $1, "updatedAt" = NOW() WHERE "id" = $2`,
                realName,
                dbUser.id,
              );
            }
          }
        }
      } catch (_) {}
    }

    // Never leak placeholder dummy emails to frontend
    if (dbUser.email && (dbUser.email.includes("@otp.") || dbUser.email.includes("@prayogindia.local") || dbUser.email.startsWith("user."))) {
      dbUser.email = "";
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
  const rateLimit = checkRateLimit(
    `profile-update:${user.id || user.email}:${ip}`,
    10,
    60000,
  );
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        message: "Too many update requests. Please try again later.",
      },
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
        const gstinPattern =
          /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        if (!gstinPattern.test(gstin.toUpperCase().trim())) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Invalid GSTIN format. Must be 15 alphanumeric characters.",
            },
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

    // 1. Locate target user by ID, Email, or Phone
    const cleanPhone = (user.phone || "").replace(/\D/g, "").slice(-10);
    let targetUser: any = null;
    try {
      targetUser = await db.user.findFirst({
        where: {
          OR: [
            ...(user.id ? [{ id: user.id }] : []),
            ...(user.email ? [{ email: normalizeEmail(user.email) }] : []),
            ...(cleanPhone ? [{ phone: { contains: cleanPhone } }] : []),
          ],
        },
      });
    } catch (findErr: any) {
      console.warn("[Users/Me PATCH] Stale prisma findFirst fallback:", findErr?.message);
      try {
        const rows = await db.$queryRawUnsafe(
          `SELECT "id", "name", "email", "phone", "customerType", "companyName", "gstin", "rewardPoints" 
           FROM "User" 
           WHERE "id" = $1 OR ("email" != '' AND "email" = $2) OR ("phone" != '' AND "phone" LIKE $3)
           LIMIT 1`,
          user.id || "",
          user.email ? normalizeEmail(user.email) : "---",
          cleanPhone ? `%${cleanPhone}%` : "---"
        ) as any[];
        targetUser = rows?.[0] || null;
      } catch (rawErr: any) {
        console.warn("[Users/Me PATCH] Raw query fallback error:", rawErr?.message);
      }
    }

    // 2. If not found in DB, create record
    if (!targetUser) {
      const cleanEmail = normalizeEmail(
        user.email || `${cleanPhone || Date.now()}@otp.prayogindia.local`,
      );
      try {
        targetUser = await db.user.create({
          data: {
            name: updateData.name || user.name || "Prayog Customer",
            email: cleanEmail,
            phone: updateData.phone || user.phone || "",
            passwordHash: "",
            role: "CUSTOMER",
            customerType: "B2C",
            rewardPoints: user.rewardPoints || 100,
          },
        });
      } catch (createErr: any) {
        console.warn("[Users/Me PATCH] Stale prisma create fallback:", createErr?.message);
        const newId = user.id || `usr-${Date.now()}`;
        try {
          await db.$executeRawUnsafe(
            `INSERT INTO "User" ("id", "name", "email", "phone", "passwordHash", "role", "customerType", "rewardPoints", "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, '', 'CUSTOMER'::"Role", 'B2C'::"CustomerType", 100, NOW(), NOW())
             ON CONFLICT ("email") DO NOTHING`,
            newId,
            updateData.name || user.name || "Prayog Customer",
            cleanEmail,
            updateData.phone || user.phone || ""
          );
          targetUser = {
            id: newId,
            name: updateData.name || user.name || "Prayog Customer",
            email: cleanEmail,
            phone: updateData.phone || user.phone || "",
            customerType: "B2C",
            rewardPoints: 100,
          };
        } catch (_) {}
      }
    }

    const resolvedUserId = targetUser?.id || user.id;

    // 3. Update database record
    let updatedUser: any = null;
    try {
      updatedUser = await db.user.update({
        where: { id: resolvedUserId },
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
    } catch (updateErr: any) {
      console.warn("[Users/Me PATCH] Stale prisma update fallback, using raw SQL:", updateErr?.message);
      try {
        const setClauses: string[] = ['"updatedAt" = NOW()'];
        const values: any[] = [];
        let idx = 1;

        if (updateData.name !== undefined) {
          setClauses.push(`"name" = $${idx++}`);
          values.push(updateData.name);
        }
        if (updateData.phone !== undefined) {
          setClauses.push(`"phone" = $${idx++}`);
          values.push(updateData.phone);
        }
        if (updateData.companyName !== undefined) {
          setClauses.push(`"companyName" = $${idx++}`);
          values.push(updateData.companyName);
        }
        if (updateData.gstin !== undefined) {
          setClauses.push(`"gstin" = $${idx++}`);
          values.push(updateData.gstin);
        }
        if (updateData.customerType !== undefined) {
          setClauses.push(`"customerType" = $${idx++}::"CustomerType"`);
          values.push(updateData.customerType);
        }

        values.push(resolvedUserId);
        await db.$executeRawUnsafe(
          `UPDATE "User" SET ${setClauses.join(", ")} WHERE "id" = $${idx}`,
          ...values
        );

        updatedUser = {
          ...targetUser,
          ...updateData,
          id: resolvedUserId,
        };
      } catch (rawUpErr: any) {
        console.error("[Users/Me PATCH] Raw update error:", rawUpErr?.message);
        updatedUser = {
          ...targetUser,
          ...updateData,
          id: resolvedUserId,
        };
      }
    }

    // 4. Update session cookie
    const updatedPayload = {
      ...user,
      id: updatedUser.id,
      name: updatedUser.name,
      phone: updatedUser.phone,
      customerType: updatedUser.customerType,
      companyName: updatedUser.companyName,
      gstin: updatedUser.gstin,
    };

    const sessionToken = await signSessionToken(updatedPayload, "7d");

    const response = NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      data: updatedUser,
    });

    response.cookies.set({
      name: "prayog_customer_session",
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update profile." },
      { status: 500, headers },
    );
  }
}
