"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Printer,
  Send,
  CheckCircle2,
  Clock,
  Building2,
  Download,
  Trash2,
  Search,
  ArrowRight,
  ShieldCheck,
  Eye,
  CreditCard,
  Edit3,
  Save,
  RefreshCw,
  XCircle,
  AlertCircle,
  ShoppingBag,
} from "lucide-react";
import { PRODUCTS, Product } from "@/data/mockData";
import { STORES } from "@/data/storeConfig";

export type DocStage =
  | "DRAFT"
  | "REQUESTED"
  | "UNDER_REVIEW"
  | "SENT"
  | "VIEWED"
  | "NEGOTIATION"
  | "ACCEPTED"
  | "REJECTED"
  | "EXPIRED"
  | "CONVERTED"
  | "CANCELLED";

export interface QuotationItem {
  id?: string;
  productId?: string;
  productName: string;
  productSku: string;
  unitPrice: number;
  quantity: number;
  discountPct: number;
  taxRate?: number;
  total?: number;
}

export interface QuotationDoc {
  id: string;
  quoteNumber: string;
  storeId?: string;
  store?: { id: string; name: string; code: string; city: string };
  institutionType: string;
  companyName: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  gstin?: string;
  billingAddress?: string;
  shippingAddress?: string;
  status: DocStage;
  createdAt: string;
  validUntil: string;
  items: QuotationItem[];
  subtotal: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  shippingCharge: number;
  grandTotal: number;
  notes?: string;
  terms?: string;
  adminNotes?: string;
  customerFeedback?: string;
  convertedAt?: string;
  order?: {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
  };
  revisions?: any[];
}

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<QuotationDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<QuotationDoc | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [storeFilter, setStoreFilter] = useState("all");
  const [convertingLoading, setConvertingLoading] = useState(false);

  // Form State for creating new quotation
  const [instType, setInstType] = useState("Corporate");
  const [selectedStoreId, setSelectedStoreId] = useState("ranchi");
  const [compName, setCompName] = useState("");
  const [custName, setCustName] = useState("");
  const [custEmail, setCustEmail] = useState("");
  const [custMobile, setCustMobile] = useState("");
  const [gstinInput, setGstinInput] = useState("");
  const [billingAddr, setBillingAddr] = useState("");
  const [shippingAddr, setShippingAddr] = useState("");
  const [validDays, setValidDays] = useState(30);
  const [shippingFee, setShippingFee] = useState(0);
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState(
    "1. 100% Advance payment against Proforma Invoice.\n2. Delivery within 3-5 days via Surface / Air Express.\n3. Standard 1-Year OEM warranty with dedicated engineer support.",
  );
  const [gstRate, setGstRate] = useState(18);
  const [items, setItems] = useState<QuotationItem[]>([
    {
      productId: PRODUCTS[0]?.id,
      productName: PRODUCTS[0]?.name || "Component 1",
      productSku: PRODUCTS[0]?.sku || "PRG-001",
      unitPrice: PRODUCTS[0]?.price || 1000,
      quantity: 5,
      discountPct: 5,
    },
  ]);

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const url = `/api/admin/quotations?status=${statusFilter}&storeId=${storeFilter}&search=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.data?.items) {
        setQuotations(data.data.items);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [statusFilter, storeFilter]);

  const handleAddItem = (product: Product) => {
    setItems((prev) => [
      ...prev,
      {
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        unitPrice: product.price,
        quantity: 1,
        discountPct: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (
    index: number,
    field: keyof QuotationItem,
    val: any,
  ) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: selectedStoreId,
          institutionType: instType,
          companyName: compName,
          customerName: custName,
          customerEmail: custEmail,
          customerPhone: custMobile,
          gstin: gstinInput,
          billingAddress: billingAddr,
          shippingAddress: shippingAddr,
          validUntil: new Date(Date.now() + validDays * 86400000).toISOString(),
          taxRate: gstRate,
          shippingCharge: shippingFee,
          notes,
          terms,
          status: "DRAFT",
          items,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsCreatingNew(false);
        fetchQuotations();
      } else {
        alert(data.message || "Failed to create quotation");
      }
    } catch {
      alert("Error creating quotation");
    }
  };

  const handleStatusUpdate = async (
    id: string,
    newStatus: DocStage,
    revisionReason?: string,
  ) => {
    try {
      const res = await fetch(`/api/admin/quotations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, revisionReason }),
      });
      const data = await res.json();
      if (data.success) {
        if (selectedDoc?.id === id) {
          setSelectedDoc(data.data);
        }
        fetchQuotations();
      } else {
        alert(data.message || "Failed to update status");
      }
    } catch {
      alert("Error updating quotation");
    }
  };

  const handleConvertToOrder = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to convert this quotation into an active customer order?",
      )
    ) {
      return;
    }
    setConvertingLoading(true);
    try {
      const res = await fetch(`/api/admin/quotations/${id}/convert-to-order`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        alert(`Success! Order #${data.data?.order?.orderNumber} created.`);
        fetchQuotations();
        if (selectedDoc?.id === id) {
          setSelectedDoc({
            ...selectedDoc,
            status: "CONVERTED",
            order: data.data?.order,
          });
        }
      } else {
        alert(data.message || "Failed to convert to order");
      }
    } catch {
      alert("Network error converting to order");
    } finally {
      setConvertingLoading(false);
    }
  };

  const calcDocSubtotal = (docItems: QuotationItem[]) => {
    return (docItems || []).reduce((sum, item) => {
      const unit = item.unitPrice || 0;
      const discount = item.discountPct || 0;
      const discountedUnit = unit * (1 - discount / 100);
      return sum + discountedUnit * (item.quantity || 1);
    }, 0);
  };

  const formSubtotal = items.reduce((sum, item) => {
    const discountedUnit = item.unitPrice * (1 - item.discountPct / 100);
    return sum + discountedUnit * item.quantity;
  }, 0);
  const formTax = Math.round(formSubtotal * (gstRate / 100));
  const formGrandTotal = formSubtotal + formTax + Number(shippingFee);

  const filteredQuotes = quotations.filter((q) => {
    if (!searchQuery) return true;
    const s = searchQuery.toLowerCase();
    return (
      q.quoteNumber?.toLowerCase().includes(s) ||
      q.companyName?.toLowerCase().includes(s) ||
      q.customerName?.toLowerCase().includes(s) ||
      q.customerEmail?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="bg-[#0F172A] text-white p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="bg-[#00AEEF] text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
            B2B Quotations &amp; Institutional Proposals
          </span>
          <h1 className="text-2xl font-black text-white mt-1">
            B2B Quotations Management Desk
          </h1>
          <p className="text-xs text-slate-400">
            Lifecycle: Request Quote → B2B Pricing → Send Quote → Customer
            Negotiation / Acceptance → Convert to Order
          </p>
        </div>

        <button
          onClick={() => {
            setIsCreatingNew(true);
            setSelectedDoc(null);
          }}
          className="bg-[#00AEEF] hover:bg-[#0096D6] text-white text-xs font-extrabold px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Quotation</span>
        </button>
      </div>

      {/* Main Content Area */}
      {isCreatingNew ? (
        /* Create New Quotation Form */
        <form
          onSubmit={handleCreateQuotation}
          className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-8 shadow-xs"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Institutional Quotation Draft
              </h2>
              <p className="text-xs text-slate-500">
                Set negotiated B2B unit rates, institutional discounts, and
                select the servicing store.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCreatingNew(false)}
              className="text-xs text-slate-400 hover:text-slate-800 font-bold p-2 cursor-pointer"
            >
              ✕ Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">
                Institution / Organization Type
              </label>
              <select
                value={instType}
                onChange={(e) => setInstType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none"
              >
                <option value="School">School / ATL Lab</option>
                <option value="College">College / Polytechnic</option>
                <option value="University">University Research Lab</option>
                <option value="Corporate">Corporate / Enterprise</option>
                <option value="STEM Lab">STEM / Robotics Lab</option>
                <option value="Government / Tender">Government / Tender</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">
                Servicing Fulfillment Store
              </label>
              <select
                value={selectedStoreId}
                onChange={(e) => setSelectedStoreId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none"
              >
                <option value="ranchi">Ranchi Central Experience Hub</option>
                <option value="patna">Patna Branch</option>
                <option value="delhi">Delhi Experience Center</option>
                <option value="mumbai">Mumbai Hub</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">
                Company / Organization Name *
              </label>
              <input
                required
                type="text"
                value={compName}
                onChange={(e) => setCompName(e.target.value)}
                placeholder="e.g. IIT Delhi Robotics Lab"
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">
                Contact Person Name *
              </label>
              <input
                required
                type="text"
                value={custName}
                onChange={(e) => setCustName(e.target.value)}
                placeholder="Dr. Rajesh Vardhan"
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">
                Contact Mobile (+91) *
              </label>
              <input
                required
                type="tel"
                value={custMobile}
                onChange={(e) => setCustMobile(e.target.value)}
                placeholder="9876543210"
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">
                Official Email *
              </label>
              <input
                required
                type="email"
                value={custEmail}
                onChange={(e) => setCustEmail(e.target.value)}
                placeholder="procurement@iitd.ac.in"
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">
                GSTIN Number (Optional)
              </label>
              <input
                type="text"
                value={gstinInput}
                onChange={(e) => setGstinInput(e.target.value.toUpperCase())}
                placeholder="07AAAAI0000A1Z5"
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold text-slate-900 uppercase focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">
                Official Billing Address
              </label>
              <textarea
                rows={2}
                value={billingAddr}
                onChange={(e) => setBillingAddr(e.target.value)}
                placeholder="Accounts Dept, Admin Block, Main Campus..."
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">
                Shipping / Lab Delivery Address
              </label>
              <textarea
                rows={2}
                value={shippingAddr}
                onChange={(e) => setShippingAddr(e.target.value)}
                placeholder="Robotics Lab, Room 402, Dept of EE..."
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Line Items Table with Negotiated B2B Rates */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-slate-900">
                Quotation Line Items &amp; B2B Pricing
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">
                  Quick add catalogue item:
                </span>
                <select
                  onChange={(e) => {
                    const found = PRODUCTS.find((p) => p.id === e.target.value);
                    if (found) handleAddItem(found);
                  }}
                  defaultValue=""
                  className="bg-slate-100 border border-slate-200 text-xs font-bold p-1.5 rounded-xl text-slate-700"
                >
                  <option value="" disabled>
                    + Select Product...
                  </option>
                  {PRODUCTS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Base: ₹{p.price})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                  <tr>
                    <th className="p-3">Product Description</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3 w-32">B2B Unit Price (₹)</th>
                    <th className="p-3 w-20">Qty</th>
                    <th className="p-3 w-24">Discount %</th>
                    <th className="p-3 text-right">Line Total</th>
                    <th className="p-3 w-12 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {items.map((item, idx) => {
                    const discounted =
                      item.unitPrice * (1 - item.discountPct / 100);
                    const lineTot = Math.round(discounted * item.quantity);
                    return (
                      <tr key={idx}>
                        <td className="p-3">
                          <input
                            type="text"
                            value={item.productName}
                            onChange={(e) =>
                              handleUpdateItem(
                                idx,
                                "productName",
                                e.target.value,
                              )
                            }
                            className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded-lg text-xs font-bold"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={item.productSku}
                            onChange={(e) =>
                              handleUpdateItem(
                                idx,
                                "productSku",
                                e.target.value,
                              )
                            }
                            className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded-lg text-xs font-mono"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) =>
                              handleUpdateItem(
                                idx,
                                "unitPrice",
                                Number(e.target.value),
                              )
                            }
                            className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded-lg text-xs font-bold text-emerald-700"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdateItem(
                                idx,
                                "quantity",
                                Number(e.target.value),
                              )
                            }
                            className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded-lg text-xs font-bold text-center"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={item.discountPct}
                            onChange={(e) =>
                              handleUpdateItem(
                                idx,
                                "discountPct",
                                Number(e.target.value),
                              )
                            }
                            className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded-lg text-xs font-bold text-center"
                          />
                        </td>
                        <td className="p-3 text-right font-bold text-slate-900 font-mono">
                          ₹{lineTot.toLocaleString()}
                        </td>
                        <td className="p-3 text-center">
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quotation Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-200">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">
                  Special Notes / Scope
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Turnkey ATL lab setup with 1-year onsite technical workshop."
                  className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">
                  Commercial Terms
                </label>
                <textarea
                  rows={3}
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-700 self-end">
              <div className="flex justify-between font-medium">
                <span>Subtotal (Net of Item Discounts):</span>
                <span className="font-mono font-bold">
                  ₹{formSubtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>GST Tax Rate (%):</span>
                <input
                  type="number"
                  value={gstRate}
                  onChange={(e) => setGstRate(Number(e.target.value))}
                  className="w-20 bg-white border border-slate-200 p-1 text-center rounded-lg font-bold"
                />
              </div>
              <div className="flex justify-between font-medium">
                <span>GST Tax Amount:</span>
                <span className="font-mono font-bold">
                  ₹{formTax.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Insured Freight / Dispatch (₹):</span>
                <input
                  type="number"
                  value={shippingFee}
                  onChange={(e) => setShippingFee(Number(e.target.value))}
                  className="w-24 bg-white border border-slate-200 p-1 text-center rounded-lg font-bold"
                />
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-black text-slate-900">
                <span>Grand Total:</span>
                <span className="text-[#00AEEF] font-mono">
                  ₹{formGrandTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCreatingNew(false)}
              className="px-6 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#00AEEF] hover:bg-[#0096D6] text-white text-xs font-black shadow-md cursor-pointer"
            >
              Save Official Quotation Draft
            </button>
          </div>
        </form>
      ) : selectedDoc ? (
        /* Document Viewer & Printable Sheet */
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-xl bg-slate-100 cursor-pointer"
              >
                ← Back to List
              </button>
              <span className="font-mono font-bold text-sm text-slate-900">
                {selectedDoc.quoteNumber}
              </span>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-slate-100 uppercase">
                {selectedDoc.status}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Send Quote button if in DRAFT / REQUESTED / UNDER_REVIEW */}
              {["DRAFT", "REQUESTED", "UNDER_REVIEW", "NEGOTIATION"].includes(
                selectedDoc.status,
              ) && (
                <button
                  onClick={() =>
                    handleStatusUpdate(
                      selectedDoc.id,
                      "SENT",
                      "Sent official quote to customer",
                    )
                  }
                  className="bg-[#00AEEF] hover:bg-[#0096D6] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" /> Send to Customer
                </button>
              )}

              {/* Mark as Accepted button */}
              {["SENT", "VIEWED", "NEGOTIATION"].includes(
                selectedDoc.status,
              ) && (
                <button
                  onClick={() =>
                    handleStatusUpdate(
                      selectedDoc.id,
                      "ACCEPTED",
                      "Marked accepted by admin",
                    )
                  }
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Mark Accepted
                </button>
              )}

              {/* Convert to Order button */}
              {selectedDoc.status === "ACCEPTED" && (
                <button
                  onClick={() => handleConvertToOrder(selectedDoc.id)}
                  disabled={convertingLoading}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-black px-5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    {convertingLoading ? "Converting..." : "Convert to Order →"}
                  </span>
                </button>
              )}

              {selectedDoc.status === "CONVERTED" && selectedDoc.order && (
                <span className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Order: {selectedDoc.order.orderNumber}</span>
                </span>
              )}

              <button
                onClick={() => window.print()}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Export PDF
              </button>
            </div>
          </div>

          {/* Printable Letterhead */}
          <div
            id="quotation-print-sheet"
            className="p-8 border border-slate-200 rounded-3xl bg-white space-y-6 font-sans shadow-sm"
          >
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-wide">
                  PRAYOG INDIA
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Official Robotics, UAV &amp; STEM Institutional Solutions
                  Provider
                </p>
                <p className="text-[11px] text-slate-400 font-mono">
                  {selectedDoc.store?.name || "Ranchi Central Hub"} • GSTIN:
                  20AABCP1234F1Z9 • Email: b2b@prayogindia.in
                </p>
              </div>

              <div className="text-right text-xs font-mono">
                <span className="font-black text-slate-900 block text-base">
                  {selectedDoc.quoteNumber}
                </span>
                <span className="text-slate-500 block">
                  Date:{" "}
                  {new Date(selectedDoc.createdAt).toLocaleDateString("en-IN")}
                </span>
                <span className="text-rose-600 font-bold block">
                  Valid Until:{" "}
                  {new Date(selectedDoc.validUntil).toLocaleDateString("en-IN")}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                <span className="font-bold text-slate-400 uppercase text-[10px] block">
                  Customer / Institution
                </span>
                <h4 className="font-bold text-sm text-slate-900">
                  {selectedDoc.companyName}
                </h4>
                <p className="text-slate-600">
                  Attn: {selectedDoc.customerName} ({selectedDoc.customerPhone})
                </p>
                <p className="text-slate-600">{selectedDoc.customerEmail}</p>
                {selectedDoc.gstin && (
                  <p className="font-mono font-bold text-slate-700">
                    GSTIN: {selectedDoc.gstin}
                  </p>
                )}
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                <span className="font-bold text-slate-400 uppercase text-[10px] block">
                  Shipping &amp; Delivery
                </span>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {selectedDoc.shippingAddress ||
                    selectedDoc.billingAddress ||
                    "Campus Delivery via Surface Express"}
                </p>
                <p className="text-slate-500 text-[11px]">
                  Fulfilled by:{" "}
                  <strong>
                    {selectedDoc.store?.name || "Ranchi Central Hub"}
                  </strong>
                </p>
              </div>
            </div>

            {/* Product items table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Item Description</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3 text-right">Agreed Unit Rate</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-center">Discount</th>
                    <th className="p-3 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {selectedDoc.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-3 text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-900">
                        {item.productName}
                      </td>
                      <td className="p-3 font-mono text-slate-500">
                        {item.productSku}
                      </td>
                      <td className="p-3 text-right font-mono">
                        ₹{item.unitPrice?.toLocaleString("en-IN")}
                      </td>
                      <td className="p-3 text-center font-bold">
                        {item.quantity}
                      </td>
                      <td className="p-3 text-center text-emerald-600">
                        {item.discountPct}%
                      </td>
                      <td className="p-3 text-right font-mono font-bold">
                        ₹
                        {(
                          item.total || item.unitPrice * item.quantity
                        ).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations */}
            <div className="flex justify-end">
              <div className="w-80 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono font-bold text-slate-900">
                    ₹{selectedDoc.subtotal?.toLocaleString("en-IN")}
                  </span>
                </div>
                {selectedDoc.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount:</span>
                    <span className="font-mono font-bold">
                      -₹{selectedDoc.discountAmount?.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>GST ({selectedDoc.taxRate}%):</span>
                  <span className="font-mono font-bold text-slate-900">
                    ₹{selectedDoc.taxAmount?.toLocaleString("en-IN")}
                  </span>
                </div>
                {selectedDoc.shippingCharge > 0 && (
                  <div className="flex justify-between">
                    <span>Freight / Shipping:</span>
                    <span className="font-mono font-bold text-slate-900">
                      ₹{selectedDoc.shippingCharge?.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-black text-slate-900">
                  <span>Grand Total:</span>
                  <span className="font-mono text-[#00AEEF]">
                    ₹{selectedDoc.grandTotal?.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes & Terms */}
            <div className="border-t border-slate-200 pt-4 text-xs space-y-3">
              {selectedDoc.notes && (
                <div>
                  <span className="font-bold text-slate-800">
                    Scope / Notes:{" "}
                  </span>
                  <span className="text-slate-600">{selectedDoc.notes}</span>
                </div>
              )}
              {selectedDoc.terms && (
                <div>
                  <span className="font-bold text-slate-800 block mb-1">
                    Commercial Terms &amp; Conditions:
                  </span>
                  <p className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-600 whitespace-pre-line leading-relaxed font-sans">
                    {selectedDoc.terms}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Quotations List & Filters */
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search quote #, company, contact..."
                className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-bold text-slate-700"
              >
                <option value="all">All Statuses</option>
                <option value="REQUESTED">Requested (New)</option>
                <option value="DRAFT">Draft</option>
                <option value="SENT">Sent to Customer</option>
                <option value="NEGOTIATION">Changes Requested</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="CONVERTED">Converted to Order</option>
                <option value="REJECTED">Rejected</option>
              </select>

              <select
                value={storeFilter}
                onChange={(e) => setStoreFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-bold text-slate-700"
              >
                <option value="all">All Stores</option>
                <option value="ranchi">Ranchi Central Hub</option>
                <option value="patna">Patna Branch</option>
                <option value="delhi">Delhi Experience Center</option>
                <option value="mumbai">Mumbai Hub</option>
              </select>

              <button
                onClick={fetchQuotations}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xs font-black uppercase text-slate-900">
                B2B Quotations Pipeline
              </h2>
              <span className="text-xs text-slate-400 font-bold">
                {filteredQuotes.length} records
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs font-bold text-slate-400">
                Loading quotations...
              </div>
            ) : filteredQuotes.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                <div className="text-xs font-bold text-slate-500">
                  No quotations found
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredQuotes.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-slate-900 text-xs">
                          {doc.quoteNumber}
                        </span>
                        <span
                          className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                            doc.status === "ACCEPTED" ||
                            doc.status === "CONVERTED"
                              ? "bg-emerald-100 text-emerald-800"
                              : doc.status === "NEGOTIATION"
                                ? "bg-amber-100 text-amber-800"
                                : doc.status === "SENT"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {doc.status}
                        </span>
                        <span className="text-[9px] font-bold uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                          {doc.institutionType || "Corporate"}
                        </span>
                        {doc.store && (
                          <span className="text-[9px] font-bold text-slate-400">
                            • Store: {doc.store.name}
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-slate-900">
                        {doc.companyName}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {doc.items?.length || 0} hardware lines • Attn:{" "}
                        {doc.customerName} ({doc.customerPhone})
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-sm font-black text-slate-900 block font-mono">
                          ₹
                          {doc.grandTotal?.toLocaleString("en-IN") || "Pending"}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-medium">
                          Valid:{" "}
                          {new Date(doc.validUntil).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                      <button className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-[#00AEEF] hover:text-white flex items-center justify-center transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
