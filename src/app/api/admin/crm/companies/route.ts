import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedStaff } from "@/lib/staffAuth";
import { getSecurityHeaders } from "@/lib/security";
import { recordAuditLog } from "@/lib/auditLogger";

// GET /api/admin/crm/companies — List all B2B companies with search, filters & aggregated metrics
export async function GET(request: Request) {
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

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "all";
  const storeFilter = searchParams.get("storeId") || "all";
  const industry = searchParams.get("industry") || "all";

  if (process.env.DATABASE_URL) {
    try {
      const where: any = {};

      // Role-based store scoping
      if (staff.role === "STORE_MANAGER" && staff.storeId) {
        where.assignedStoreId = staff.storeId;
      } else if (
        staff.role === "REGIONAL_MANAGER" &&
        staff.allowedStoreCodes?.length
      ) {
        const regionalStores = await db.store.findMany({
          where: { code: { in: staff.allowedStoreCodes } },
          select: { id: true },
        });
        where.assignedStoreId = { in: regionalStores.map((s) => s.id) };
      } else if (storeFilter !== "all") {
        where.assignedStoreId = storeFilter;
      }

      if (status !== "all") {
        where.status = status;
      }
      if (industry !== "all") {
        where.industry = industry;
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { phone: { contains: search } },
          { gstin: { contains: search, mode: "insensitive" } },
          { city: { contains: search, mode: "insensitive" } },
          {
            contacts: {
              some: { name: { contains: search, mode: "insensitive" } },
            },
          },
        ];
      }

      const companies = await db.b2BCompany.findMany({
        where,
        include: {
          store: { select: { id: true, name: true, code: true, city: true } },
          assignedStaff: { select: { id: true, name: true, role: true } },
          contacts: {
            where: { isPrimary: true },
            take: 1,
          },
          followUps: {
            where: { status: "PENDING" },
            orderBy: { dueDate: "asc" },
            take: 1,
          },
          _count: {
            select: {
              contacts: true,
              activities: true,
              followUps: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      });

      // Enrich with live quote & order counts matching company name
      const enriched = await Promise.all(
        companies.map(async (comp) => {
          const [quoteCount, orderList] = await Promise.all([
            db.quotation.count({
              where: {
                OR: [
                  { companyName: { equals: comp.name, mode: "insensitive" } },
                  {
                    customerEmail: comp.email
                      ? { equals: comp.email, mode: "insensitive" }
                      : undefined,
                  },
                ],
              },
            }),
            db.order.findMany({
              where: {
                user: {
                  OR: [
                    { companyName: { equals: comp.name, mode: "insensitive" } },
                    {
                      email: comp.email
                        ? { equals: comp.email, mode: "insensitive" }
                        : undefined,
                    },
                  ],
                },
              },
              select: {
                totalAmount: true,
                status: true,
                paymentStatus: true,
                createdAt: true,
              },
              orderBy: { createdAt: "desc" },
            }),
          ]);

          const totalBusiness = orderList.reduce(
            (sum, o) => sum + o.totalAmount,
            0,
          );
          const outstanding = orderList
            .filter((o) => o.paymentStatus === "PENDING")
            .reduce((sum, o) => sum + o.totalAmount, 0);

          return {
            ...comp,
            quoteCount,
            orderCount: orderList.length,
            totalBusiness: Math.max(comp.totalBusiness, totalBusiness),
            outstanding,
            lastOrderDate: orderList[0]?.createdAt || null,
          };
        }),
      );

      return NextResponse.json({ success: true, data: enriched }, { headers });
    } catch (error: any) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500, headers },
      );
    }
  }

  return NextResponse.json({ success: true, data: [] }, { headers });
}

// POST /api/admin/crm/companies — Create a new B2B Company with initial contact and optional follow-up
export async function POST(request: Request) {
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

  try {
    const body = await request.json();
    const {
      name,
      companyType = "Corporate",
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
      assignedStoreId,
      status = "LEAD",
      notes,
      rating = 3,
      primaryContact, // { name, designation, phone, email, contactType }
      initialFollowUp, // { dueDate, reason, notes }
    } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Company name is required." },
        { status: 400, headers },
      );
    }

    if (process.env.DATABASE_URL) {
      // 1. Resolve valid store DB ID
      let dbStoreId: string | null = null;
      let targetStoreLookup = assignedStoreId;
      if (staff.role === "STORE_MANAGER" && staff.storeId) {
        targetStoreLookup = staff.storeId;
      }
      if (targetStoreLookup) {
        const foundStore = await db.store.findFirst({
          where: {
            OR: [
              { id: targetStoreLookup },
              {
                code: {
                  equals: targetStoreLookup.toUpperCase(),
                  mode: "insensitive",
                },
              },
              { name: { contains: targetStoreLookup, mode: "insensitive" } },
            ],
          },
        });
        dbStoreId = foundStore ? foundStore.id : null;
      }
      if (!dbStoreId) {
        const defaultStore = await db.store.findFirst({
          where: { OR: [{ isCentralHub: true }, { code: "RANCHI" }] },
        });
        dbStoreId = defaultStore?.id || null;
      }

      // 2. Resolve valid staff user DB ID
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

      // 3. Ensure valid status enum
      const validStatuses = [
        "LEAD",
        "PROSPECT",
        "NEGOTIATION",
        "ACTIVE_CUSTOMER",
        "INACTIVE",
        "LOST",
        "BLOCKED",
      ];
      const finalStatus = validStatuses.includes(status)
        ? (status as any)
        : "LEAD";

      // Check for duplicate company
      const existing = await db.b2BCompany.findFirst({
        where: { name: { equals: name.trim(), mode: "insensitive" } },
      });

      if (existing) {
        return NextResponse.json(
          {
            success: false,
            message: `Company "${name}" already exists in CRM.`,
          },
          { status: 400, headers },
        );
      }

      const company = await db.b2BCompany.create({
        data: {
          name: name.trim(),
          companyType: companyType || "Corporate",
          industry: industry || null,
          gstin: gstin ? gstin.toUpperCase() : null,
          website: website || null,
          email: email ? email.toLowerCase() : null,
          phone: phone || null,
          billingAddress: billingAddress || null,
          shippingAddress: shippingAddress || null,
          city: city || null,
          state: state || null,
          pincode: pincode || null,
          assignedStoreId: dbStoreId,
          assignedStaffId: dbStaffId,
          status: finalStatus,
          notes: notes || null,
          rating: Number(rating) || 3,
          contacts: primaryContact?.name
            ? {
                create: {
                  name: primaryContact.name,
                  designation: primaryContact.designation || "Primary Contact",
                  phone: primaryContact.phone || phone || "+91 98000 00000",
                  email: primaryContact.email || email || null,
                  contactType: primaryContact.contactType || "PURCHASE",
                  isPrimary: true,
                  notes: primaryContact.notes || null,
                },
              }
            : undefined,
          activities: {
            create: {
              activityType: "NOTE",
              title: "Account Created in B2B CRM",
              description: `B2B Account created with status: ${finalStatus} by ${staff.name} (${staff.role}).`,
              performedByStaffId: dbStaffId,
            },
          },
          followUps: initialFollowUp?.dueDate
            ? {
                create: {
                  dueDate: new Date(initialFollowUp.dueDate),
                  reason:
                    initialFollowUp.reason ||
                    "Introductory relationship call & product discovery",
                  notes: initialFollowUp.notes || null,
                  assignedStaffId: dbStaffId,
                  status: "PENDING",
                },
              }
            : undefined,
        },
        include: {
          contacts: true,
          store: true,
          followUps: true,
        },
      });

      // Immutable Unified Audit Log
      await recordAuditLog({
        actionCategory: "CRM_RELATIONSHIPS",
        action: "CRM_COMPANY_CREATE",
        entityType: "B2BCompany",
        entityId: company.id,
        description: `B2B Account "${company.name}" created (${company.companyType || "Company"}${company.industry ? ` - ${company.industry}` : ""}) with initial status ${company.status}.`,
        actor: staff,
        storeId: company.assignedStoreId,
        previousValue: null,
        newValue: {
          id: company.id,
          name: company.name,
          companyType: company.companyType,
          status: company.status,
          city: company.city,
          state: company.state,
        },
        metadata: {
          gstin: company.gstin,
          primaryContact: primaryContact?.name || null,
          storeName: company.store?.name || null,
        },
        req: request,
      });

      return NextResponse.json(
        {
          success: true,
          message: "B2B Account successfully created.",
          data: company,
        },
        { status: 201, headers },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Company created (Mock Mode)",
        data: { id: `crm-${Date.now()}`, name },
      },
      { status: 201, headers },
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers },
    );
  }
}
