import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedStaff } from "@/lib/staffAuth";
import { getSecurityHeaders } from "@/lib/security";

// GET /api/admin/crm/companies/[id] — Full CRM profile: metadata, multiple contacts, activities, quotes, orders, follow-ups
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const headers = getSecurityHeaders();
  const staff = await getAuthenticatedStaff();

  if (
    !staff ||
    (staff.role !== "SUPER_ADMIN" &&
      staff.role !== "REGIONAL_MANAGER" &&
      staff.role !== "STORE_MANAGER")
  ) {
    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403, headers },
    );
  }

  const { id } = await params;

  if (process.env.DATABASE_URL) {
    try {
      const company = await db.b2BCompany.findUnique({
        where: { id },
        include: {
          store: true,
          assignedStaff: {
            select: { id: true, name: true, role: true, email: true },
          },
          contacts: {
            orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
          },
          activities: {
            orderBy: { createdAt: "desc" },
            take: 50,
          },
          followUps: {
            orderBy: [{ status: "asc" }, { dueDate: "asc" }],
          },
        },
      });

      if (!company) {
        return NextResponse.json(
          { success: false, message: "Company not found" },
          { status: 404, headers },
        );
      }

      // Store scoping
      if (
        staff.role === "STORE_MANAGER" &&
        staff.storeId &&
        company.assignedStoreId !== staff.storeId
      ) {
        return NextResponse.json(
          { success: false, message: "Unauthorized for this store's accounts" },
          { status: 403, headers },
        );
      }

      // Fetch linked Quotations & Orders
      const [quotations, orders] = await Promise.all([
        db.quotation.findMany({
          where: {
            OR: [
              { companyName: { equals: company.name, mode: "insensitive" } },
              {
                customerEmail: company.email
                  ? { equals: company.email, mode: "insensitive" }
                  : undefined,
              },
            ],
          },
          include: {
            items: true,
            order: { select: { id: true, orderNumber: true } },
          },
          orderBy: { createdAt: "desc" },
        }),
        db.order.findMany({
          where: {
            user: {
              OR: [
                { companyName: { equals: company.name, mode: "insensitive" } },
                {
                  email: company.email
                    ? { equals: company.email, mode: "insensitive" }
                    : undefined,
                },
              ],
            },
          },
          include: {
            items: true,
            invoice: true,
          },
          orderBy: { createdAt: "desc" },
        }),
      ]);

      const totalBusiness = orders.reduce((sum, o) => sum + o.totalAmount, 0);
      const outstanding = orders
        .filter((o) => o.paymentStatus === "PENDING")
        .reduce((sum, o) => sum + o.totalAmount, 0);
      const acceptedQuotes = quotations.filter(
        (q) => q.status === "ACCEPTED" || q.status === "CONVERTED",
      ).length;

      const profile = {
        ...company,
        metrics: {
          totalBusiness: Math.max(company.totalBusiness, totalBusiness),
          outstanding,
          totalOrders: orders.length,
          totalQuotes: quotations.length,
          acceptedQuotes,
          quoteConversionRate:
            quotations.length > 0
              ? Math.round((acceptedQuotes / quotations.length) * 100)
              : 0,
          lastOrderDate: orders[0]?.createdAt || null,
        },
        quotations,
        orders,
      };

      return NextResponse.json({ success: true, data: profile }, { headers });
    } catch (error: any) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500, headers },
      );
    }
  }

  return NextResponse.json(
    { success: false, message: "Database not configured" },
    { status: 500, headers },
  );
}

// PATCH /api/admin/crm/companies/[id] — Update company profile, relationship status, store assignment, or notes
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const headers = getSecurityHeaders();
  const staff = await getAuthenticatedStaff();

  if (
    !staff ||
    (staff.role !== "SUPER_ADMIN" &&
      staff.role !== "REGIONAL_MANAGER" &&
      staff.role !== "STORE_MANAGER")
  ) {
    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403, headers },
    );
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const {
      name,
      companyType,
      industry,
      gstin,
      website,
      email,
      phone,
      billingAddress,
      shippingAddress,
      city,
      state,
      pincode,
      status,
      assignedStoreId,
      assignedStaffId,
      notes,
      rating,
      activityNote,
    } = body;

    if (process.env.DATABASE_URL) {
      const existing = await db.b2BCompany.findUnique({ where: { id } });
      if (!existing) {
        return NextResponse.json(
          { success: false, message: "Company not found" },
          { status: 404, headers },
        );
      }

      // Store scoping
      if (
        staff.role === "STORE_MANAGER" &&
        staff.storeId &&
        existing.assignedStoreId !== staff.storeId
      ) {
        return NextResponse.json(
          { success: false, message: "Unauthorized for this store" },
          { status: 403, headers },
        );
      }

      // Resolve staff user ID if exists in DB
      let dbStaffId: string | null = null;
      if (staff?.id) {
        const foundStaff = await db.staffUser.findFirst({
          where: {
            OR: [
              { id: staff.id },
              { username: staff.username },
              ...(staff.email ? [{ email: staff.email }] : []),
            ],
          },
        });
        dbStaffId = foundStaff ? foundStaff.id : null;
      }

      const updateData: any = {};
      if (name) updateData.name = name.trim();
      if (companyType) updateData.companyType = companyType;
      if (industry !== undefined) updateData.industry = industry;
      if (gstin !== undefined)
        updateData.gstin = gstin ? gstin.toUpperCase() : null;
      if (website !== undefined) updateData.website = website;
      if (email !== undefined)
        updateData.email = email ? email.toLowerCase() : null;
      if (phone !== undefined) updateData.phone = phone;
      if (billingAddress !== undefined)
        updateData.billingAddress = billingAddress;
      if (shippingAddress !== undefined)
        updateData.shippingAddress = shippingAddress;
      if (city !== undefined) updateData.city = city;
      if (state !== undefined) updateData.state = state;
      if (pincode !== undefined) updateData.pincode = pincode;
      if (status) {
        const validStatuses = [
          "LEAD",
          "PROSPECT",
          "NEGOTIATION",
          "ACTIVE_CUSTOMER",
          "INACTIVE",
          "LOST",
          "BLOCKED",
        ];
        if (validStatuses.includes(status)) updateData.status = status;
      }
      if (assignedStoreId !== undefined) {
        let dbStoreId: string | null = null;
        if (assignedStoreId) {
          const foundStore = await db.store.findFirst({
            where: {
              OR: [
                { id: assignedStoreId },
                {
                  code: {
                    equals: assignedStoreId.toUpperCase(),
                    mode: "insensitive",
                  },
                },
                { name: { contains: assignedStoreId, mode: "insensitive" } },
              ],
            },
          });
          dbStoreId = foundStore ? foundStore.id : null;
        }
        updateData.assignedStoreId = dbStoreId;
      }
      if (assignedStaffId !== undefined) updateData.assignedStaffId = dbStaffId;
      if (notes !== undefined) updateData.notes = notes;
      if (rating !== undefined) updateData.rating = Number(rating);

      let activityCreate = undefined;
      if (status && status !== existing.status) {
        activityCreate = {
          activityType: "NOTE",
          title: `Status Changed: ${existing.status} → ${status}`,
          description:
            activityNote ||
            `Relationship status updated by ${staff.name} (${staff.role}).`,
          performedByStaffId: dbStaffId,
        };
      } else if (activityNote) {
        activityCreate = {
          activityType: "NOTE",
          title: "Account Details Updated",
          description: activityNote,
          performedByStaffId: dbStaffId,
        };
      }

      const updated = await db.b2BCompany.update({
        where: { id },
        data: {
          ...updateData,
          activities: activityCreate ? { create: activityCreate } : undefined,
        },
        include: {
          store: true,
          assignedStaff: true,
        },
      });

      return NextResponse.json(
        {
          success: true,
          message: "Company profile updated successfully.",
          data: updated,
        },
        { headers },
      );
    }

    return NextResponse.json(
      { success: true, message: "Company updated (Mock Mode)" },
      { headers },
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers },
    );
  }
}
