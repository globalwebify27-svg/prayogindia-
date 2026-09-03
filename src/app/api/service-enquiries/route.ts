import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { AuthSessionUser } from "@/lib/authUtils";

// Simple In-Memory Rate Limiting Tracker to prevent spam abuse
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_MAX = 5; // max 5 enquiries per minute per IP/Session
const RATE_LIMIT_WINDOW = 60 * 1000;

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now - entry.lastReset > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(identifier, { count: 1, lastReset: now });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count += 1;
  return true;
}

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
 * POST /api/service-enquiries
 * Submit service enquiry with rate limiting and server validation.
 */
export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    const body = await request.json().catch(() => ({}));

    const { serviceId, serviceName, name, email, phone, message } = body;

    // 1. Rate Limiting Check
    const ipIdentifier = user?.id || email || "anonymous-ip";
    if (!checkRateLimit(ipIdentifier)) {
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

    if (process.env.DATABASE_URL) {
      // Find matching Service record if serviceId or serviceName supplied
      let matchedService = null;
      if (serviceId) {
        matchedService = await db.service.findFirst({
          where: { OR: [{ id: serviceId }, { slug: serviceId }] },
        });
      } else if (serviceName) {
        matchedService = await db.service.findFirst({
          where: { name: { contains: serviceName, mode: "insensitive" } },
        });
      }

      if (!matchedService) {
        // Fallback to first available Service in DB
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
        });

        return NextResponse.json({
          success: true,
          message: "Service enquiry submitted successfully.",
          data: enquiryRecord,
        });
      }
    }

    // Mock Mode Fallback Response
    return NextResponse.json({
      success: true,
      message: "Service enquiry submitted successfully (Mock Mode).",
      data: {
        id: `enq-${Date.now()}`,
        serviceName: serviceName || "Turnkey STEM Service",
        name,
        email,
        phone,
        message,
        createdAt: new Date().toISOString(),
      },
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
  const user = await getAuthenticatedUser();
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

      return NextResponse.json({
        success: true,
        data: enquiries,
      });
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          message: error.message || "Failed to fetch enquiries.",
        },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({
    success: true,
    data: [],
    source: "mock",
  });
}
