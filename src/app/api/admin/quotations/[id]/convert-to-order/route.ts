import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedStaff } from "@/lib/staffAuth";
import { getSecurityHeaders } from "@/lib/security";

function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `PRG-${year}-${randomDigits}`;
}

async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await db.invoice.count();
  const seq = String(count + 1).padStart(5, "0");
  return `INV-${year}-${seq}`;
}

// POST /api/admin/quotations/[id]/convert-to-order — Converts an ACCEPTED quotation into an Order atomically
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const headers = getSecurityHeaders();
  const staff = await getAuthenticatedStaff();

  if (!staff || (staff.role !== "SUPER_ADMIN" && staff.role !== "REGIONAL_MANAGER" && staff.role !== "STORE_MANAGER")) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403, headers });
  }

  const { id } = await params;

  if (process.env.DATABASE_URL) {
    try {
      const quotation = await db.quotation.findUnique({
        where: { id },
        include: {
          items: true,
          store: true,
          order: true,
          user: true,
        },
      });

      if (!quotation) {
        return NextResponse.json({ success: false, message: "Quotation not found" }, { status: 404, headers });
      }

      // Prevent duplicate order conversions
      if (quotation.status === "CONVERTED" || quotation.order) {
        return NextResponse.json(
          {
            success: false,
            message: `Quotation is already converted to order #${quotation.order?.orderNumber || "EXISTING"}.`,
          },
          { status: 400, headers }
        );
      }

      // Security: Store manager scoping
      if (staff.role === "STORE_MANAGER" && staff.storeId && quotation.storeId !== staff.storeId) {
        return NextResponse.json({ success: false, message: "Unauthorized for this store's quotations" }, { status: 403, headers });
      }

      // Resolve or create user account for this B2B customer
      let customerUser = quotation.user;
      if (!customerUser && quotation.customerEmail) {
        customerUser = await db.user.findUnique({ where: { email: quotation.customerEmail.toLowerCase() } });
      }
      if (!customerUser) {
        customerUser = await db.user.create({
          data: {
            name: quotation.customerName,
            email: quotation.customerEmail.toLowerCase(),
            phone: quotation.customerPhone,
            passwordHash: "B2B_GENERATED_ACCOUNT",
            customerType: "B2B",
            companyName: quotation.companyName,
            gstin: quotation.gstin,
            role: "CUSTOMER",
          },
        });
      }

      const orderNumber = generateOrderNumber();
      const invoiceNumber = await generateInvoiceNumber();

      // Transaction: Create Order, OrderItems, Invoice, update Quotation to CONVERTED
      const result = await db.$transaction(async (tx) => {
        const order = await tx.order.create({
          data: {
            orderNumber,
            userId: customerUser.id,
            customerType: "B2B",
            status: "PROCESSING",
            paymentStatus: "PENDING",
            paymentMethod: "bank_transfer",
            subtotal: quotation.subtotal,
            gstAmount: quotation.taxAmount,
            discountAmount: quotation.discountAmount,
            shippingCost: quotation.shippingCharge,
            totalAmount: quotation.grandTotal,
            shippingAddress: quotation.shippingAddress || quotation.billingAddress || `${quotation.companyName}, ${quotation.store.city}`,
            quotationId: quotation.id,
            items: {
              create: quotation.items.map((item) => ({
                productId: item.productId || "prg-generic-hardware",
                variantId: item.variantId || null,
                productName: item.productName,
                productSku: item.productSku,
                price: item.unitPrice,
                quantity: item.quantity,
              })),
            },
          },
          include: {
            items: true,
          },
        });

        // Create official Tax Invoice record
        await tx.invoice.create({
          data: {
            invoiceNumber,
            orderId: order.id,
            userId: customerUser.id,
            customerName: quotation.customerName,
            customerEmail: quotation.customerEmail,
            customerPhone: quotation.customerPhone,
            customerGstin: quotation.gstin,
            companyName: quotation.companyName,
            billingAddress: quotation.billingAddress || order.shippingAddress,
            shippingAddress: order.shippingAddress,
            items: JSON.stringify(quotation.items),
            subtotal: quotation.subtotal,
            discountAmount: quotation.discountAmount,
            gstAmount: quotation.taxAmount,
            shippingCost: quotation.shippingCharge,
            totalAmount: quotation.grandTotal,
          },
        });

        // Update quotation status and convertedAt
        const updatedQuotation = await tx.quotation.update({
          where: { id: quotation.id },
          data: {
            status: "CONVERTED",
            convertedAt: new Date(),
            revisions: {
              create: {
                revisionNumber: 99,
                snapshotJson: JSON.stringify({ orderId: order.id, orderNumber }),
                changedByRole: staff.role,
                changeNotes: `Quotation converted to Order ${orderNumber} by ${staff.name}`,
              },
            },
          },
        });

        return { order, quotation: updatedQuotation };
      });

      return NextResponse.json({
        success: true,
        message: `Quotation successfully converted to Order ${result.order.orderNumber}.`,
        data: result,
      }, { status: 201, headers });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500, headers });
    }
  }

  return NextResponse.json({
    success: true,
    message: "Quotation converted (Mock Mode).",
    data: { orderNumber: generateOrderNumber() },
  }, { headers });
}
