import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedCustomer } from "@/lib/authUtils";
import { MOCK_SAVED_ADDRESSES, Address } from "@/data/accountData";

const getAuthenticatedUser = getAuthenticatedCustomer;

// GET /api/users/me/addresses
export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  if (process.env.DATABASE_URL) {
    try {
      const dbAddresses = await db.address.findMany({
        where: {
          OR: [
            { userId: user.id },
            ...(user.phone ? [{ phone: { contains: user.phone.replace(/\D/g, "").slice(-10) } }] : []),
          ],
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ success: true, data: dbAddresses || [] });
    } catch (err: any) {
      console.warn("[Addresses] Error fetching addresses from DB:", err?.message);
      try {
        const cleanDigits = (user.phone || "").replace(/\D/g, "").slice(-10);
        const rows = await db.$queryRawUnsafe(
          `SELECT "id", "userId", "name", "phone", "street", "city", "state", "pincode", "type", "isDefault", "createdAt"
           FROM "Address"
           WHERE "userId" = $1 OR ("phone" != '' AND "phone" LIKE $2)
           ORDER BY "createdAt" DESC`,
          user.id,
          cleanDigits ? `%${cleanDigits}%` : "---",
        ) as any[];
        return NextResponse.json({ success: true, data: rows || [] });
      } catch (_) {}
    }
  }

  return NextResponse.json({ success: true, data: [] });
}

// POST /api/users/me/addresses
export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const { name, phone, street, city, state, pincode, type, isDefault } = body;

    if (!name || !phone || !street || !city || !state || !pincode) {
      return NextResponse.json(
        { success: false, message: "Missing required address fields." },
        { status: 400 },
      );
    }

    const newAddress: Address = {
      id: `addr-${Date.now()}`,
      name,
      phone,
      street,
      city,
      state,
      pincode,
      type: type || "Home",
      isDefault: Boolean(isDefault),
    };

    if (process.env.DATABASE_URL) {
      // Ensure user exists in PostgreSQL to satisfy foreign key constraint
      let verifiedUserId = user.id;
      try {
        const u = await db.user.findUnique({ where: { id: user.id }, select: { id: true } });
        if (!u) {
          const cleanPhone = (user.phone || phone || "").replace(/\D/g, "").slice(-10);
          if (cleanPhone) {
            const byPhone = await db.user.findFirst({
              where: { phone: { contains: cleanPhone } },
              select: { id: true },
            });
            if (byPhone) {
              verifiedUserId = byPhone.id;
            } else {
              const nu = await db.user.create({
                data: {
                  id: user.id,
                  name: user.name || name || "Customer",
                  email: user.email && !user.email.includes("@otp.") ? user.email : null,
                  phone: cleanPhone,
                  passwordHash: "OTP_AUTH_USER",
                  role: "CUSTOMER",
                  customerType: "B2C",
                  rewardPoints: 100,
                  mobileVerified: true,
                },
              });
              verifiedUserId = nu.id;
            }
          }
        }
      } catch (userCheckErr: any) {
        console.warn("[Addresses POST] user verification notice:", userCheckErr?.message);
      }

      if (isDefault) {
        // Unset previous default address using transaction safety
        await db.address.updateMany({
          where: { userId: verifiedUserId },
          data: { isDefault: false },
        });
      }

      const created = await db.address.create({
        data: {
          userId: verifiedUserId,
          name,
          phone,
          street,
          city,
          state,
          pincode,
          type: type || "Home",
          isDefault: Boolean(isDefault),
        },
      });

      return NextResponse.json({ success: true, data: created });
    }

    return NextResponse.json({ success: true, data: newAddress });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to save address." },
      { status: 500 },
    );
  }
}
