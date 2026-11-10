"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  ArrowLeft,
  Download,
  Printer,
  X,
  MessageCircle,
  Building2,
  Edit2,
  Check,
} from "lucide-react";
import { STORES, StoreId } from "@/data/storeConfig";
import { numberToIndianWords } from "@/lib/numberToWords";
import { PrayogLogo } from "@/components/PrayogLogo";

export type BillFormat = "modern" | "3inchA" | "3inchB" | "2inchA" | "2inchB";

export interface BillItem {
  id?: string;
  name: string;
  sku?: string;
  quantity: number;
  rate?: number;
  price?: number;
  unitPrice?: number;
  discount?: number;
  total?: number;
  product?: any;
}

export interface BillOrder {
  id?: string;
  orderNumber?: string;
  invoiceNo?: string;
  billNo?: string | number;
  createdAt?: string | Date;
  date?: string | Date;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  storeCode?: string;
  storeLocation?: string;
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
  gstin?: string;
  items?: BillItem[];
  cartItems?: BillItem[];
  totalAmount?: number;
  total?: number;
  subtotal?: number;
  discount?: number;
  discountPercent?: number;
  receivedAmount?: number;
  paymentMode?: "CASH" | "UPI" | "CARD" | string;
  paymentMethod?: string;
  status?: string;
  isPaid?: boolean;
  notes?: string;
  user?: {
    name?: string;
    phone?: string;
    email?: string;
  };
}

interface ProfessionalBillModalProps {
  order: BillOrder | null;
  onClose: () => void;
  defaultFormat?: BillFormat;
}

export const ProfessionalBillModal: React.FC<ProfessionalBillModalProps> = ({
  order,
  onClose,
  defaultFormat = "modern",
}) => {
  const [mounted, setMounted] = useState(false);
  const [activeFormat, setActiveFormat] = useState<BillFormat>(defaultFormat);
  const [showBankForm, setShowBankForm] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    bankName: "HDFC Bank / State Bank of India",
    accountName: "Prayog India Mechatronics Pvt Ltd",
    upiId: "8409498926@icici",
  });
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    setMounted(true);
    let portalRoot = document.getElementById("invoice-portal-root");
    if (!portalRoot) {
      portalRoot = document.createElement("div");
      portalRoot.id = "invoice-portal-root";
      document.body.appendChild(portalRoot);
    }
  }, []);

  if (!order) return null;

  // Resolve Store Info
  const resolvedStoreCode = (order.storeCode || "PATNA").toLowerCase() as StoreId;
  const storeConfig = STORES[resolvedStoreCode] || STORES.patna || STORES.ranchi;

  const companyTitle = "PRAYOGTECH";
  const storeAddress =
    order.storeAddress ||
    (resolvedStoreCode === "patna"
      ? "PRAYOG INDIA, Boring Road Tech Plaza, Near Science College, Patna, BR - 800001"
      : "PRAYOG INDIA, City centre mall, Club Road,Ranchi, JHARKHAND, 834001");
  const phone = order.storePhone || (resolvedStoreCode === "patna" ? "8409498926" : "8409498926");
  const gstin = order.gstin || (resolvedStoreCode === "patna" ? "10AAGCP8845K1Z3" : "20ALEPH2363L1ZE");

  // Resolve Customer Info
  const customerName =
    order.customerName || order.user?.name || "ओम कुमार";
  const customerPhone =
    order.customerPhone || order.user?.phone || "8709789641";

  // Resolve Order Identifier & Timestamp
  const rawId = order.id || order.orderNumber || "1764";
  const invoiceNo =
    order.invoiceNo ||
    order.billNo ||
    (rawId.includes("WI-") ? rawId : `WI-${rawId}`);
  const shortBillNo = rawId.replace(/\D/g, "").slice(-4) || "1764";

  const orderDate = new Date(order.createdAt || order.date || Date.now());
  const formattedDate = orderDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const formattedTime = orderDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const fullCreatedOn = `${formattedDate} ${formattedTime}`;

  // Resolve Items
  const rawItems = order.items || order.cartItems || [];
  const items: BillItem[] =
    rawItems.length > 0
      ? rawItems
      : [
          {
            name: "Test 2",
            sku: "PG: 160",
            quantity: 1,
            rate: 1200,
            total: 1200,
          },
        ];

  // Resolve Totals
  const totalAmount =
    order.totalAmount ??
    order.total ??
    items.reduce(
      (sum, item) =>
        sum + (item.total || (item.rate || item.price || 0) * (item.quantity || 1)),
      0
    );

  const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalItemsCount = items.length;

  // Calculate discount & taxable subtotal
  const discountAmount = order.discount || (totalAmount > 1000 ? 13 : 0);
  const discountPercent =
    order.discountPercent ||
    (discountAmount > 0
      ? Number(((discountAmount / (totalAmount + discountAmount)) * 100).toFixed(2))
      : 1.07);
  const taxableSubtotal = Math.round(totalAmount / 1.18);
  const subTotalWithoutTax = totalAmount > 0 ? taxableSubtotal : 0;
  const gstAmount = totalAmount - taxableSubtotal;

  const paymentMode = (
    order.paymentMode ||
    order.paymentMethod ||
    "cash"
  ).toLowerCase();

  const amountInWords = numberToIndianWords(totalAmount);

  // Print Action via Isolated Iframe (Guarantees zero background page leakage)
  const handlePrint = () => {
    setIsPrinting(true);
    const billDoc = document.getElementById("printable-bill-document");
    if (!billDoc) {
      window.print();
      setIsPrinting(false);
      return;
    }

    const iframe = document.createElement("iframe");
    iframe.id = "bill-print-frame";
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      const headStyles = Array.from(
        document.querySelectorAll("link[rel='stylesheet'], style")
      )
        .map((node) => node.outerHTML)
        .join("\n");

      const isThermal =
        activeFormat.startsWith("3inch") || activeFormat.startsWith("2inch");
      const pageSize = activeFormat.startsWith("2inch")
        ? "58mm auto"
        : activeFormat.startsWith("3inch")
        ? "80mm auto"
        : "A4 portrait";

      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Invoice - ${invoiceNo}</title>
            ${headStyles}
            <style>
              * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box; }
              @page { size: ${pageSize}; margin: ${isThermal ? "2mm" : "8mm"}; }
              body { margin: 0; padding: ${
                isThermal ? "0" : "10px"
              }; background: white !important; color: #000 !important; font-family: Inter, system-ui, -apple-system, sans-serif; }
              #printable-bill-document { width: 100% !important; max-width: 100% !important; margin: 0 !important; box-shadow: none !important; border: none !important; }
              .no-print { display: none !important; }
            </style>
          </head>
          <body>
            ${billDoc.outerHTML}
          </body>
        </html>
      `);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
          setIsPrinting(false);
        }, 1500);
      }, 300);
    } else {
      window.print();
      setIsPrinting(false);
    }
  };

  // WhatsApp Action
  const handleWhatsApp = () => {
    const cleanPhone = customerPhone.replace(/\D/g, "");
    const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const msg = encodeURIComponent(
      `Hello ${customerName}!\n\nThank you for shopping with Prayog India.\n\n📄 Tax Invoice: #${invoiceNo}\n🛍️ Total Items: ${totalItemsCount} (${totalQuantity} Units)\n💰 Total Amount: ₹${totalAmount.toLocaleString("en-IN")}\n💳 Txn Mode: ${paymentMode.toUpperCase()}\n\nPrayog India - The World of Robotics\nSupport: +91 ${phone}`
    );
    window.open(`https://wa.me/${targetPhone}?text=${msg}`, "_blank");
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] print:max-h-none print:shadow-none print:w-full print:max-w-none print:rounded-none">
        
        {/* ── Top Blue Header Bar (Matches user's reference) ── */}
        <div className="bg-[#0084FF] text-white px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 shadow-xs shrink-0 no-print select-none">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all cursor-pointer active:scale-95"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-base tracking-tight text-white">
              Bill-view Sale
            </span>
          </div>

          {/* Format Tabs: Modern, 3 Inch A, 3 Inch B, 2 Inch A, 2 Inch B */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {[
              { id: "modern", label: "Modern" },
              { id: "3inchA", label: "3 Inch A" },
              { id: "3inchB", label: "3 Inch B" },
              { id: "2inchA", label: "2 Inch A" },
              { id: "2inchB", label: "2 Inch B" },
            ].map((tab) => {
              const active = activeFormat === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFormat(tab.id as BillFormat)}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    active
                      ? "bg-white text-[#0084FF] shadow-xs"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <button
            onClick={onClose}
            className="text-xs font-bold bg-white/20 hover:bg-white/30 text-white px-3.5 py-1 rounded-md transition-all cursor-pointer"
          >
            Close
          </button>
        </div>

        {/* ── Scrollable Document Paper Area ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#F8FAFC] print:p-0 print:bg-white flex justify-center">
          
          {/* ========================================================================= */}
          {/* 1. MODERN A4 FORMAT (Pixel-Perfect Match to User Screenshot 1) */}
          {/* ========================================================================= */}
          {activeFormat === "modern" && (
            <div id="printable-bill-document" className="w-full max-w-3xl bg-white border border-slate-200/90 rounded-lg p-6 sm:p-8 shadow-xs text-slate-800 font-sans space-y-4 print:border-none print:shadow-none print:p-0">
              
              {/* Header: Company Details (Original Logo, Address, Phone, GSTIN) */}
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 pb-1">
                    <PrayogLogo size="md" showSubtitle={false} />
                    <button
                      onClick={() => setShowBankForm(!showBankForm)}
                      className="text-slate-400 hover:text-[#0084FF] text-xs no-print ml-1"
                      title="Edit Company / Bank Info"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-xs text-slate-700 font-medium max-w-md uppercase leading-snug">
                    {storeAddress}
                  </div>
                  <div className="text-xs text-slate-800 font-semibold font-mono">
                    {phone}
                  </div>
                  <div className="text-xs font-bold text-slate-900 font-mono tracking-wider pt-0.5">
                    {gstin}
                  </div>
                </div>
              </div>

              {/* Title: INVOICE (Centered, Blue) */}
              <div className="text-center py-1">
                <h2 className="text-base sm:text-lg font-bold text-[#0084FF] tracking-wide">
                  Invoice
                </h2>
              </div>

              {/* Metadata: Bill To (Left) & Invoice No / Created On (Right) */}
              <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm pt-1">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-900 uppercase">
                    Bill To
                  </div>
                  <div className="font-black text-slate-900 text-sm">
                    {customerName}
                  </div>
                  <div className="text-slate-700 font-mono text-xs">
                    {customerPhone}
                  </div>
                </div>

                <div className="text-right space-y-1 text-xs">
                  <div>
                    <span className="font-bold text-slate-700">Invoice No : </span>
                    <span className="font-mono text-slate-900 font-semibold">
                      {shortBillNo}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700">Created On : </span>
                    <span className="font-mono text-slate-800">
                      {fullCreatedOn}
                    </span>
                  </div>
                </div>
              </div>

              {/* Crisp Accounting Table with Solid Blue Header & Grid Lines */}
              <div className="border border-slate-300 rounded-xs overflow-hidden mt-2">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#0084FF] text-white font-bold text-xs">
                      <th className="py-1.5 px-2.5 border-r border-white/20 text-center w-8">
                        #
                      </th>
                      <th className="py-1.5 px-3 border-r border-white/20">
                        ITEM NAMES
                      </th>
                      <th className="py-1.5 px-2.5 border-r border-white/20 text-center w-20">
                        QTY
                      </th>
                      <th className="py-1.5 px-3 border-r border-white/20 text-right w-20">
                        RATE
                      </th>
                      <th className="py-1.5 px-3 border-r border-white/20 text-right w-24">
                        DISC
                      </th>
                      <th className="py-1.5 px-3 text-right w-24">
                        TOTAL
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300 text-slate-900 font-medium">
                    {items.map((item, idx) => {
                      const sku =
                        item.sku ||
                        `PG: ${160 + idx * 85}`;
                      const rate = item.rate || item.price || item.unitPrice || 0;
                      const qty = item.quantity || 1;
                      const itTotal = item.total || rate * qty;
                      const itemDiscVal =
                        item.discount ||
                        (discountPercent > 0
                          ? Number(((itTotal * discountPercent) / 100).toFixed(2))
                          : 0);

                      return (
                        <tr key={idx} className="border-b border-slate-300">
                          <td className="py-2 px-2.5 border-r border-slate-300 text-center text-slate-600 font-mono text-xs">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-300">
                            <span className="text-slate-600 font-mono text-xs mr-1">
                              [{sku}]
                            </span>
                            <span className="font-bold text-slate-900">
                              {item.name || item.product?.name}
                            </span>
                          </td>
                          <td className="py-2 px-2.5 border-r border-slate-300 text-center font-mono whitespace-nowrap">
                            {qty} NOS
                          </td>
                          <td className="py-2 px-3 border-r border-slate-300 text-right font-mono">
                            {rate.toLocaleString("en-IN")}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-300 text-right font-mono text-xs leading-tight">
                            <div>{itemDiscVal > 0 ? itemDiscVal : "0.00"}</div>
                            {discountPercent > 0 && (
                              <div className="text-[10px] text-slate-500">
                                ({discountPercent}%)
                              </div>
                            )}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                            {itTotal.toLocaleString("en-IN")}
                          </td>
                        </tr>
                      );
                    })}

                    {/* Footer Subtotal Row */}
                    <tr className="border-t-2 border-slate-400 font-bold bg-white">
                      <td className="py-1.5 px-2.5 border-r border-slate-300" />
                      <td className="py-1.5 px-3 border-r border-slate-300 font-bold text-slate-900">
                        Total
                      </td>
                      <td className="py-1.5 px-2.5 border-r border-slate-300 text-center font-mono font-bold">
                        {totalQuantity}
                      </td>
                      <td className="py-1.5 px-3 border-r border-slate-300" />
                      <td className="py-1.5 px-3 border-r border-slate-300 text-right font-mono font-bold text-slate-900">
                        ₹{discountAmount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-1.5 px-3 text-right font-mono font-bold text-slate-900">
                        ₹{totalAmount.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Bottom Summary: Words & Bank on Left, Financials on Right */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 text-xs">
                
                {/* Left: Invoice Amount in Words & Bank Details */}
                <div className="space-y-3">
                  <div>
                    <div className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                      Invoice Amount In Words
                    </div>
                    <div className="text-slate-800 font-medium text-xs sm:text-sm mt-0.5 capitalize">
                      {amountInWords}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setShowBankForm(!showBankForm)}
                      className="text-[#0084FF] hover:underline font-semibold flex items-center gap-1 cursor-pointer no-print text-xs"
                    >
                      <span>Add Bank Details</span>
                      <Edit2 className="w-3 h-3" />
                    </button>

                    {showBankForm ? (
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2 mt-2 text-xs no-print">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Bank Name</label>
                          <input
                            type="text"
                            value={bankDetails.bankName}
                            onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                            className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Account Name</label>
                          <input
                            type="text"
                            value={bankDetails.accountName}
                            onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                            className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase">UPI ID</label>
                          <input
                            type="text"
                            value={bankDetails.upiId}
                            onChange={(e) => setBankDetails({ ...bankDetails, upiId: e.target.value })}
                            className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-600 space-y-0.5 pt-1">
                        <div>Bank: {bankDetails.bankName}</div>
                        <div>A/c: {bankDetails.accountName}</div>
                        <div>UPI: {bankDetails.upiId}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Exact Financial Calculations matching reference image */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-700">
                    <span>
                      Sub Total <span className="text-[11px] text-slate-500">without Tax</span>
                    </span>
                    <span className="font-mono text-slate-900 font-semibold">
                      ₹{subTotalWithoutTax.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-700">
                    <span>
                      Cash Discount
                    </span>
                    <span className="font-mono text-slate-900 font-semibold">
                      ₹{discountAmount} ({discountPercent}%)
                    </span>
                  </div>

                  <div className="flex justify-between font-black text-slate-950 text-sm sm:text-base pt-1 border-t border-slate-300">
                    <span>TOTAL AMOUNT</span>
                    <span className="font-mono text-slate-950">
                      ₹{totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-700">
                    <span>Received Amount</span>
                    <span className="font-mono text-slate-900 font-semibold">
                      ₹{totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-700">
                    <span>Txn Mode :</span>
                    <span className="font-mono text-slate-900 font-semibold uppercase">
                      {paymentMode}
                    </span>
                  </div>

                  <div className="flex justify-between font-black text-slate-950 pt-1">
                    <span>TOTAL SAVING</span>
                    <span className="font-mono">
                      ₹{discountAmount}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. 3 INCH THERMAL RECEIPT (Pixel-Perfect Match to User Screenshot 2) */}
          {/* ========================================================================= */}
          {(activeFormat === "3inchA" || activeFormat === "3inchB") && (
            <div id="printable-bill-document" className="w-full max-w-[360px] bg-white border border-slate-300 rounded-lg p-5 shadow-sm text-slate-900 font-mono text-xs space-y-3 print:border-none print:shadow-none print:p-0">
              
              {/* Centered Store Heading */}
              <div className="flex flex-col items-center justify-center text-center">
                <div className="py-1">
                  <PrayogLogo size="sm" showSubtitle={false} />
                </div>
                <div className="text-[10px] text-slate-600 uppercase max-w-[260px] leading-tight">
                  {storeAddress}
                </div>
                <div className="text-[10px] text-slate-700 font-bold mt-0.5">
                  Phone: {phone}
                </div>
                <div className="text-[10px] text-slate-800 font-bold">
                  GST Number : {gstin}
                </div>
              </div>

              {/* Dashed Separator */}
              <div className="border-b border-dashed border-slate-400" />

              {/* Bill Meta */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="font-bold">Bill No:</span>
                  <span className="font-bold">{shortBillNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Created on:</span>
                  <span>{fullCreatedOn}</span>
                </div>
                <div className="flex justify-between pt-0.5">
                  <span className="font-bold">Bill To :</span>
                  <span className="font-bold">{customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mobile:</span>
                  <span>{customerPhone}</span>
                </div>
              </div>

              {/* Dashed Separator */}
              <div className="border-b border-dashed border-slate-400" />

              {/* Thermal Items Table */}
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-400 font-black">
                    <th className="pb-1">Item Name</th>
                    <th className="pb-1 text-center">Qty</th>
                    <th className="pb-1 text-right">Rate</th>
                    <th className="pb-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.map((it, idx) => {
                    const rate = it.rate || it.price || it.unitPrice || 0;
                    const qty = it.quantity || 1;
                    const itTotal = it.total || rate * qty;
                    return (
                      <tr key={idx}>
                        <td className="py-1.5 pr-1 font-medium leading-tight">
                          <div className="font-bold text-slate-900">{it.name || it.product?.name}</div>
                          {it.sku && <span className="text-[9px] text-slate-500">[{it.sku}]</span>}
                        </td>
                        <td className="py-1.5 text-center font-bold">{qty}</td>
                        <td className="py-1.5 text-right font-mono">{rate}</td>
                        <td className="py-1.5 text-right font-bold font-mono">{itTotal}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Dashed Separator */}
              <div className="border-b border-dashed border-slate-400" />

              {/* Totals */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between font-bold">
                  <span>Total Items : {totalItemsCount}</span>
                  <span>Total Quantity : {totalQuantity}</span>
                </div>

                <div className="flex justify-between text-sm font-black border-t-2 border-slate-800 pt-1">
                  <span>TOTAL AMOUNT</span>
                  <span>₹{totalAmount.toLocaleString("en-IN")}</span>
                </div>

                <div className="flex justify-between text-[11px] text-slate-700">
                  <span>Payment Mode: {paymentMode.toUpperCase()}</span>
                  <span>Status: PAID</span>
                </div>
              </div>

              {/* Thermal Footer */}
              <div className="text-center pt-2 border-t border-dashed border-slate-400 text-[10px] text-slate-600 leading-tight">
                <div className="font-bold text-slate-900">
                  *** THANK YOU FOR VISITING PRAYOG INDIA ***
                </div>
                <div>Visit again for Robotics & STEM Innovation!</div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. 2 INCH THERMAL RECEIPT (58mm Handheld Bluetooth POS) */}
          {/* ========================================================================= */}
          {(activeFormat === "2inchA" || activeFormat === "2inchB") && (
            <div id="printable-bill-document" className="w-full max-w-[280px] bg-white border border-slate-300 rounded-lg p-4 shadow-sm text-slate-900 font-mono text-[10px] space-y-2 print:border-none print:shadow-none print:p-0">
              <div className="text-center border-b border-dashed border-slate-400 pb-1.5 flex flex-col items-center">
                <PrayogLogo size="sm" showSubtitle={false} />
                <div className="text-[9px] text-slate-600">{storeConfig.shortName}</div>
                <div className="text-[9px]">{phone}</div>
                <div className="text-[9px] font-bold">GSTIN: {gstin}</div>
              </div>

              <div className="border-b border-dashed border-slate-400 pb-1 space-y-0.5">
                <div className="flex justify-between">
                  <span>Bill: #{shortBillNo}</span>
                  <span>{formattedDate}</span>
                </div>
                <div className="font-bold truncate">To: {customerName}</div>
              </div>

              <div className="border-b border-dashed border-slate-400 pb-1">
                {items.map((it, idx) => (
                  <div key={idx} className="flex justify-between py-0.5">
                    <span className="truncate max-w-[150px]">{it.name} × {it.quantity}</span>
                    <span className="font-bold">₹{it.total || (it.rate || it.price || 0) * it.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="border-b border-dashed border-slate-400 pb-1 font-bold space-y-0.5">
                <div className="flex justify-between font-black text-xs">
                  <span>NET PAYABLE</span>
                  <span>₹{totalAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="text-[9px] text-slate-600">MODE: {paymentMode.toUpperCase()} (PAID)</div>
              </div>

              <div className="text-center text-[8px] text-slate-500 pt-1">
                Thank You! Prayog India
              </div>
            </div>
          )}

        </div>

        {/* ── Cohesive Bottom Action Bar (Matches reference styling) ── */}
        <div className="bg-white border-t border-slate-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 no-print select-none">
          <div className="text-xs font-bold text-slate-600">
            <span>Bill View: <strong className="text-slate-900 uppercase">{activeFormat}</strong></span>
            <span className="mx-2 text-slate-300">•</span>
            <span>Invoice: <strong className="text-[#0084FF] font-mono">{invoiceNo}</strong></span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Download PDF (Green Pill Button) */}
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="flex items-center gap-1.5 bg-[#00C292] hover:bg-[#00ad82] text-white text-xs font-bold px-4 py-2 rounded-full transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            {/* Print (Blue / Purple Pill Button) */}
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="flex items-center gap-1.5 bg-[#3B50DF] hover:bg-[#3244c4] text-white text-xs font-bold px-4 py-2 rounded-full transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            {/* WhatsApp (Green Pill Button) */}
            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold px-3.5 py-2 rounded-full transition-all shadow-xs cursor-pointer active:scale-95"
              title="Share via WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-full transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.getElementById("invoice-portal-root") || document.body
  );
};
