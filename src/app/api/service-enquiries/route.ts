import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedCustomer } from "@/lib/authUtils";
import { checkRateLimit } from "@/lib/security";
import {
  saveStoredServiceEnquiry,
  getStoredServiceEnquiries,
} from "@/lib/serviceEnquiriesStore";
import { saveStoredQuotation } from "@/data/quotationsStore";

/**
 * POST /api/service-enquiries
 * Submit service enquiry with rate limiting, server validation, and persistent offline store fallback.
 */
export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedCustomer();
    const body = await request.json().catch(() => ({}));

    const { serviceId, serviceName, name, email, phone, message, notes } =
      body;

    // 1. Rate Limiting Check
    const ipIdentifier = user?.id || email || "anonymous-ip";
    const rateLimit = checkRateLimit(`enquiry:${ipIdentifier}`, 15, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Too many enquiry requests. Please wait a minute before trying again.",
        },
        { status: 429 },
      );
    }

    // 2. Strict Input Validation
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: "Valid contact person name is required." },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, message: "Valid email address is required." },
        { status: 400 },
      );
    }

    const phoneDigits = String(phone || "").replace(/\D/g, "");
    if (!phone || phoneDigits.length < 10 || phoneDigits.length > 15) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid 10-digit mobile phone number is required.",
        },
        { status: 400 },
      );
    }

    if (!message || typeof message !== "string" || message.trim().length < 5) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter details about your requirement (at least 5 characters).",
        },
        { status: 400 },
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        {
          success: false,
          message: "Enquiry message is too long (maximum 2000 characters).",
        },
        { status: 400 },
      );
    }

    // Always persist to local JSON store first to guarantee enquiry is never lost
    const storedEnquiry = saveStoredServiceEnquiry({
      serviceId,
      serviceName,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      message: message.trim(),
      notes: typeof notes === "string" ? notes.trim() : message.trim(),
      user: user
        ? {
            id: user.id,
            name: user.name || name.trim(),
            email: user.email || email.trim(),
          }
        : null,
    });

    // Also persist directly into Central Quotations Store so it appears in /admin/quotations in one place
    try {
      const fallbackQuoteNumber = `PRG-QT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const validUntilDate = new Date();
      validUntilDate.setDate(validUntilDate.getDate() + 30);
      saveStoredQuotation({
        id: `qt-${Date.now()}`,
        quoteNumber: fallbackQuoteNumber,
        userId: user?.id || null,
        storeId: "str-ranchi-01",
        store: {
          id: "str-ranchi-01",
          name: "Prayog India Ranchi Main Branch & Central Hub",
          code: "RANCHI",
          city: "Ranchi",
        },
        institutionType: "Institutional Service",
        companyName: name.trim(),
        customerName: name.trim(),
        customerEmail: email.trim().toLowerCase(),
        customerPhone: phone.trim(),
        status: "REQUESTED",
        createdAt: new Date().toISOString(),
        validUntil: validUntilDate.toISOString(),
        items: [
          {
            id: `itm-${Date.now()}-0`,
            productName: serviceName || "Technical / STEM Service Requirement",
            productSku: "PRG-SVC",
            unitPrice: 0,
            quantity: 1,
            discountPct: 0,
            taxRate: 18,
            total: 0,
          },
        ],
        subtotal: 0,
        discountAmount: 0,
        taxRate: 18,
        taxAmount: 0,
        shippingCharge: 0,
        grandTotal: 0,
        notes: message.trim(),
      });
    } catch (storeErr) {
      console.warn("Failed to mirror service enquiry to quotations store:", storeErr);
    }

    // If Database is accessible, also persist to Prisma
    if (process.env.DATABASE_URL) {
      try {
        let matchedService = null;
        if (serviceId) {
          matchedService = await db.service.findFirst({
            where: { OR: [{ id: serviceId }, { slug: serviceId as any }] },
          });
        } else if (serviceName) {
          matchedService = await db.service.findFirst({
            where: { name: { contains: serviceName, mode: "insensitive" } },
          });
        }

        if (!matchedService) {
          matchedService = await db.service.findFirst();
        }

        if (matchedService) {
          const enquiryRecord = await db.serviceEnquiry.create({
            data: {
              serviceId: matchedService.id,
              userId: user?.id || null,
              name: name.trim(),
              email: email.trim().toLowerCase(),
              phone: phone.trim(),
              message: message.trim(),
            },
            include: {
              service: true,
            },
          });

          return NextResponse.json({
            success: true,
            message: "Service enquiry submitted successfully.",
            data: enquiryRecord,
          });
        }
      } catch (dbErr) {
        console.warn(
          "Database write failed or server unreachable, using persistent store:",
          dbErr,
        );
      }
    }

    // Persistent store response
    return NextResponse.json({
      success: true,
      message: "Service enquiry submitted successfully.",
      data: storedEnquiry,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to submit service enquiry.",
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/service-enquiries
 * Retrieve authenticated customer's own service enquiries with Customer Isolation.
 */
export async function GET() {
  const user = await getAuthenticatedCustomer();
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthenticated" },
      { status: 401 },
    );
  }

  if (process.env.DATABASE_URL) {
    try {
      const enquiries = await db.serviceEnquiry.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        include: {
          service: true,
        },
      });

      if (enquiries && enquiries.length > 0) {
        return NextResponse.json({
          success: true,
          data: enquiries,
        });
      }
    } catch (error: any) {
      console.warn("Database read failed in GET /api/service-enquiries:", error);
    }
  }

  // Fallback to stored enquiries
  const stored = getStoredServiceEnquiries();
  const userEnquiries = stored.filter(
    (e) =>
      (e.user?.id && e.user.id === user.id) ||
      (e.email && e.email.toLowerCase() === (user.email || "").toLowerCase()),
  );

  return NextResponse.json({
    success: true,
    data: userEnquiries,
  });
}
