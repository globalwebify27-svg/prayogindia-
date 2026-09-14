import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { AuthSessionUser } from "@/lib/authUtils";
import { getSecurityHeaders } from "@/lib/security";

async function getCustomerSession(): Promise<AuthSessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("prayog_customer_session");
  if (!sessionCookie?.value) return null;
  try {
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

// Generate unique Quote Number: PRG-QT-YYYY-XXXX
async function generateQuoteNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `PRG-QT-${year}-${randomSuffix}`;
}

// POST /api/quotations/request — Customer or guest submits a B2B quote request
export async function POST(request: Request) {
  const headers = getSecurityHeaders();
  const user = await getCustomerSession();

  try {
    const body = await request.json();
    const {
      companyName,
      customerName,
      customerEmail,
      customerPhone,
      gstin,
      institutionType = "Corporate",
      billingAddress,
      shippingAddress,
      notes,
      preferredDeliveryDate,
      storeId: requestedStoreId,
      items = [], // Array of { productId?, productName, productSku?, quantity, unitPrice?, notes? }
    } = body;

    const finalCompanyName = companyName || body.institutionName;
    const finalCustomerName = customerName || user?.name || body.fullName;
    const finalEmail = customerEmail || user?.email;
    const finalPhone = customerPhone || user?.phone;

    if (!finalCompanyName || !finalCustomerName || !finalEmail || !finalPhone) {
      return NextResponse.json(
        { success: false, message: "Company name, contact name, email, and phone are required." },
        { status: 400, headers }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Please specify at least one product requirement." },
        { status: 400, headers }
      );
    }

    if (process.env.DATABASE_URL) {
      // 1. Resolve servicing store (requested storeId, or Ranchi Central Hub by default)
      let store = null;
      if (requestedStoreId) {
        store = await db.store.findFirst({
          where: { OR: [{ id: requestedStoreId }, { code: requestedStoreId.toUpperCase() }] },
        });
      }
      if (!store) {
        store = await db.store.findFirst({
          where: { OR: [{ isCentralHub: true }, { code: "RANCHI" }] },
        });
      }
      if (!store) {
        store = await db.store.findFirst();
      }

      if (!store) {
        return NextResponse.json(
          { success: false, message: "No operational store found to service this quote." },
          { status: 500, headers }
        );
      }

      const quoteNumber = await generateQuoteNumber();
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 30); // 30 days validity default

      // 2. Resolve items with current catalog pricing as baseline
      let computedSubtotal = 0;
      const quotationItemCreates = [];

      for (const itm of items) {
        let prodName = itm.productName || "Custom B2B Hardware Component";
        let sku = itm.productSku || "PRG-CUSTOM";
        let unitPrice = typeof itm.unitPrice === "number" && itm.unitPrice > 0 ? itm.unitPrice : 0;
        const qty = Math.max(1, parseInt(itm.quantity, 10) || 1);

        if (itm.productId) {
          const dbProd = await db.product.findUnique({ where: { id: itm.productId } });
          if (dbProd) {
            prodName = dbProd.name;
            sku = dbProd.sku;
            if (unitPrice === 0) unitPrice = dbProd.price;
          }
        }

        const lineTotal = unitPrice * qty;
        computedSubtotal += lineTotal;

        quotationItemCreates.push({
          productId: itm.productId || null,
          variantId: itm.variantId || null,
          productName: prodName,
          productSku: sku,
          quantity: qty,
          unitPrice,
          discountPct: 0,
          taxRate: 18,
          total: lineTotal,
        });
      }

      const taxAmount = Math.round(computedSubtotal * 0.18 * 100) / 100;
      const grandTotal = computedSubtotal + taxAmount;

      const quotation = await db.quotation.create({
        data: {
          quoteNumber,
          userId: user?.id || null,
          storeId: store.id,
          institutionType,
          companyName: finalCompanyName,
          customerName: finalCustomerName,
          customerEmail: finalEmail,
          customerPhone: finalPhone,
          gstin: gstin || null,
          billingAddress: billingAddress || null,
          shippingAddress: shippingAddress || null,
          status: "REQUESTED",
          validUntil,
          subtotal: computedSubtotal,
          taxRate: 18,
          taxAmount,
          discountAmount: 0,
          shippingCharge: 0,
          grandTotal,
          notes: notes ? `${notes}${preferredDeliveryDate ? ` (Preferred delivery: ${preferredDeliveryDate})` : ""}` : (preferredDeliveryDate ? `Preferred delivery: ${preferredDeliveryDate}` : null),
          terms: "1. Quotation valid for 30 days from date of issue.\n2. Official GST invoice provided upon dispatch.\n3. Standard Prayog India OEM replacement warranty applies.",
          items: {
            create: quotationItemCreates,
          },
          revisions: {
            create: {
              revisionNumber: 1,
              snapshotJson: JSON.stringify({
                status: "REQUESTED",
                companyName: finalCompanyName,
                items: quotationItemCreates,
                grandTotal,
              }),
              changedByRole: user ? "CUSTOMER" : "GUEST",
              changeNotes: "Initial quote request submitted by customer",
            },
          },
        },
        include: {
          items: true,
          store: { select: { id: true, name: true, code: true } },
        },
      });

      return NextResponse.json({
        success: true,
        message: "Quotation request submitted successfully. Our B2B desk will review and send formal pricing.",
        data: quotation,
      }, { status: 201, headers });
    }

    // Mock Mode fallback
    return NextResponse.json({
      success: true,
      message: "Quotation request received (Mock Mode).",
      data: {
        id: `qt-${Date.now()}`,
        quoteNumber: `PRG-QT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        companyName: finalCompanyName,
        status: "REQUESTED",
      },
    }, { status: 201, headers });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers });
  }
}
