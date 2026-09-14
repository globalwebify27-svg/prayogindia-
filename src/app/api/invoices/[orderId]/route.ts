import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { AuthSessionUser } from "@/lib/authUtils";
import { getSecurityHeaders } from "@/lib/security";

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
 * GET /api/invoices/[orderId]
 * Retrieve invoice data for a specific order.
 * Customer isolation enforced — only the order owner can access.
 * Returns structured invoice data ready for display or PDF generation.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const headers = getSecurityHeaders();
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthenticated" },
      { status: 401, headers },
    );
  }

  const resolvedParams = await params;
  const orderId = resolvedParams.orderId;

  if (!orderId) {
    return NextResponse.json(
      { success: false, message: "Order ID is required." },
      { status: 400, headers },
    );
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { success: false, message: "Invoice not found." },
      { status: 404, headers },
    );
  }

  try {
    // Fetch invoice with customer isolation
    const invoice = await db.invoice.findFirst({
      where: {
        OR: [
          { orderId },
          { order: { orderNumber: orderId } },
        ],
        userId: user.id, // STRICT: only own invoice
      },
    });

    let invoiceData: any;

    if (!invoice) {
      // Invoice might not exist yet — try to generate from order data
      const order = await db.order.findFirst({
        where: {
          OR: [{ id: orderId }, { orderNumber: orderId }],
          userId: user.id,
        },
        include: {
          items: { include: { product: { include: { images: true } }, variant: true } },
          user: true,
          payment: true,
        },
      });

      if (!order) {
        return NextResponse.json(
          { success: false, message: "Order not found." },
          { status: 404, headers },
        );
      }

      // Generate invoice on the fly
      const year = new Date().getFullYear();
      const count = await db.invoice.count();
      const invoiceNumber = `INV-${year}-${String(count + 1).padStart(5, "0")}`;

      const invoiceItems = order.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        sku: item.productSku,
        quantity: item.quantity,
        unitPrice: item.price,
        lineTotal: item.price * item.quantity,
        imageUrl: item.product.images[0]?.imageUrl || null,
      }));

      const createdInvoice = await db.invoice.create({
        data: {
          invoiceNumber,
          orderId: order.id,
          userId: user.id,
          customerName: order.user.name,
          customerEmail: order.user.email,
          customerPhone: order.user.phone,
          customerGstin: order.user.gstin || null,
          companyName: order.user.companyName || null,
          billingAddress: order.shippingAddress,
          shippingAddress: order.shippingAddress,
          items: invoiceItems,
          subtotal: order.subtotal,
          discountAmount: order.discountAmount,
          couponCode: order.couponCode || null,
          couponDiscount: order.couponDiscount,
          gstBreakup: { igst: order.gstAmount, cgst: 0, sgst: 0 },
          gstAmount: order.gstAmount,
          shippingCost: order.shippingCost,
          totalAmount: order.totalAmount,
          paymentMethod: order.paymentMethod || "cod",
          paymentRef: order.payment?.gatewayPaymentId || "PENDING",
        },
      });

      invoiceData = createdInvoice;
    } else {
      invoiceData = invoice;
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format");

    if (format === "html" || format === "print") {
      const itemsList = Array.isArray(invoiceData.items)
        ? (invoiceData.items as any[])
        : [];
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Tax Invoice - ${invoiceData.invoiceNumber}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; color: #1e293b; line-height: 1.4; font-size: 13px; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #00AEEF; padding-bottom: 20px; }
    .logo-title { font-size: 24px; font-weight: 900; color: #00AEEF; }
    .badge { display: inline-block; background: #e0f2fe; color: #0369a1; padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; text-transform: uppercase; margin-top: 5px; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 25px 0; }
    .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; }
    .meta-box h4 { margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; }
    table { width: 100%; border-collapse: collapse; margin: 25px 0; }
    th { background: #f1f5f9; text-align: left; padding: 10px; border-bottom: 2px solid #cbd5e1; font-size: 11px; text-transform: uppercase; }
    td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
    .totals { margin-left: auto; width: 300px; }
    .totals-row { display: flex; justify-content: space-between; padding: 6px 0; }
    .totals-row.grand { font-size: 16px; font-weight: 900; border-top: 2px solid #0f172a; padding-top: 10px; color: #0f172a; }
    .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 11px; color: #64748b; text-align: center; }
    @media print { .no-print { display: none; } body { margin: 0; } }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 20px;">
    <button onclick="window.print()" style="background: #00AEEF; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">Print / Save as PDF</button>
  </div>
  <div class="header">
    <div>
      <div class="logo-title">PRAYOG INDIA</div>
      <div style="font-size: 11px; color: #64748b; margin-top: 4px;">EdTech Hardware &amp; Robotics Research Hub</div>
      <div style="font-size: 11px; color: #64748b;">GSTIN: 20AAECP1234F1Z5 | HEC Complex, Ranchi, Jharkhand - 834004</div>
    </div>
    <div style="text-align: right;">
      <h2 style="margin: 0; color: #0f172a;">TAX INVOICE</h2>
      <div class="badge">Original for Recipient</div>
      <div style="margin-top: 8px;"><strong>Invoice #:</strong> ${invoiceData.invoiceNumber}</div>
      <div><strong>Date:</strong> ${new Date(invoiceData.invoiceDate).toLocaleDateString("en-IN")}</div>
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-box">
      <h4>Billed &amp; Shipped To</h4>
      <div style="font-weight: bold; font-size: 14px;">${invoiceData.customerName}</div>
      <div>${invoiceData.shippingAddress}</div>
      <div>Phone: ${invoiceData.customerPhone} | Email: ${invoiceData.customerEmail}</div>
      ${invoiceData.customerGstin ? `<div><strong>Customer GSTIN:</strong> ${invoiceData.customerGstin}</div>` : ""}
      ${invoiceData.companyName ? `<div><strong>Organization:</strong> ${invoiceData.companyName}</div>` : ""}
    </div>
    <div class="meta-box">
      <h4>Order &amp; Payment Details</h4>
      <div><strong>Payment Method:</strong> ${(invoiceData.paymentMethod || "Online").toUpperCase()}</div>
      <div><strong>Payment Reference:</strong> ${invoiceData.paymentRef || "N/A"}</div>
      <div><strong>Place of Supply:</strong> Jharkhand (State Code 20)</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Item &amp; Description</th>
        <th>SKU</th>
        <th style="text-align: center;">Qty</th>
        <th style="text-align: right;">Unit Price</th>
        <th style="text-align: right;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemsList
        .map(
          (item, idx) => `<tr>
        <td>${idx + 1}</td>
        <td><strong>${item.productName}</strong></td>
        <td><code>${item.sku}</code></td>
        <td style="text-align: center;">${item.quantity}</td>
        <td style="text-align: right;">₹${item.unitPrice.toLocaleString("en-IN")}</td>
        <td style="text-align: right;">₹${item.lineTotal.toLocaleString("en-IN")}</td>
      </tr>`,
        )
        .join("")}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row"><span>Subtotal:</span><span>₹${invoiceData.subtotal.toLocaleString("en-IN")}</span></div>
    ${invoiceData.discountAmount > 0 ? `<div class="totals-row" style="color: #16a34a;"><span>Discount:</span><span>-₹${invoiceData.discountAmount.toLocaleString("en-IN")}</span></div>` : ""}
    <div class="totals-row"><span>Integrated GST (18%):</span><span>₹${invoiceData.gstAmount.toLocaleString("en-IN")}</span></div>
    <div class="totals-row"><span>Shipping Charges:</span><span>${invoiceData.shippingCost === 0 ? "FREE" : "₹" + invoiceData.shippingCost}</span></div>
    <div class="totals-row grand"><span>Total Amount:</span><span>₹${invoiceData.totalAmount.toLocaleString("en-IN")}</span></div>
  </div>

  <div class="footer">
    <p>This is a computer-generated tax invoice issued in accordance with the Central Goods and Services Tax Act, 2017.</p>
    <p>Prayog India · support@prayogindia.com · +91 87097 89641 · www.prayogindia.com</p>
  </div>
  <script>
    if (window.location.search.includes('print=true')) {
      window.onload = () => window.print();
    }
  </script>
</body>
</html>`;
      return new Response(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    return NextResponse.json({ success: true, data: invoiceData });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch invoice." },
      { status: 500, headers },
    );
  }
}
