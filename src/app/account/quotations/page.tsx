"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Eye,
  Building2,
  Calendar,
  RefreshCw,
  Plus,
  X,
  Loader2,
  Send,
} from "lucide-react";

export default function CustomerQuotationsPage() {
  const { user } = useStore();
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedQuote, setSelectedQuote] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [actionModal, setActionModal] = useState<
    "ACCEPT" | "REJECT" | "REQUEST_CHANGES" | null
  >(null);

  // New Quotation Request Modal State
  const [showNewQuoteModal, setShowNewQuoteModal] = useState(false);
  const [submittingQuote, setSubmittingQuote] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState(user?.companyName || "");
  const [newCustomerName, setNewCustomerName] = useState(user?.name || "");
  const [newCustomerEmail, setNewCustomerEmail] = useState(user?.email || "");
  const [newCustomerPhone, setNewCustomerPhone] = useState(
    user?.phone?.replace(/\D/g, "").slice(-10) || "",
  );
  const [newInstitutionType, setNewInstitutionType] = useState("ATL School");
  const [newProductName, setNewProductName] = useState("");
  const [newQuantity, setNewQuantity] = useState("10");
  const [newTargetPrice, setNewTargetPrice] = useState("");
  const [newNotes, setNewNotes] = useState("");

  useEffect(() => {
    if (user) {
      if (user.name) setNewCustomerName(user.name);
      if (user.email) setNewCustomerEmail(user.email);
      if (user.phone)
        setNewCustomerPhone(user.phone.replace(/\D/g, "").slice(-10));
      if (user.companyName) setNewCompanyName(user.companyName);
    }
  }, [user]);

  const fetchQuotations = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/quotations");
      const data = await res.json();
      if (data.success) {
        setQuotations(data.data || []);
      } else {
        setError(data.message || "Failed to load quotations");
      }
    } catch {
      setError("Unable to connect to service.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const res = await fetch("/api/quotations");
        const data = await res.json();
        if (!isMounted) return;
        if (data.success) {
          setQuotations(data.data || []);
        } else {
          setError(data.message || "Failed to load quotations");
        }
      } catch {
        if (isMounted) setError("Unable to connect to service.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim() || !newCustomerName.trim() || !newProductName.trim()) {
      alert("Please fill in company name, contact name, and requirement.");
      return;
    }

    setSubmittingQuote(true);
    try {
      const res = await fetch("/api/quotations/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: newCompanyName.trim(),
          customerName: newCustomerName.trim(),
          customerEmail: newCustomerEmail.trim() || user?.email || "customer@prayog.in",
          customerPhone: newCustomerPhone.trim() || "9876543210",
          institutionType: newInstitutionType,
          notes: newNotes.trim() || undefined,
          items: [
            {
              productName: newProductName.trim(),
              quantity: Number(newQuantity) || 1,
              unitPrice: newTargetPrice ? Number(newTargetPrice) : undefined,
            },
          ],
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowNewQuoteModal(false);
        setNewProductName("");
        setNewNotes("");
        fetchQuotations();
      } else {
        alert(data.message || "Failed to submit quotation request.");
      }
    } catch {
      alert("Error submitting quotation. Please try again.");
    } finally {
      setSubmittingQuote(false);
    }
  };

  const openQuoteDetail = async (id: string) => {
    try {
      const res = await fetch(`/api/quotations/${id}`);
      const data = await res.json();
      if (data.success) {
        setSelectedQuote(data.data);
      }
    } catch {
      // fallback to find in state
      const found = quotations.find((q) => q.id === id);
      if (found) setSelectedQuote(found);
    }
  };

  const handleQuoteAction = async (
    action: "ACCEPT" | "REJECT" | "REQUEST_CHANGES",
  ) => {
    if (!selectedQuote) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/quotations/${selectedQuote.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, feedback: feedbackText }),
      });
      const data = await res.json();
      if (data.success) {
        setActionModal(null);
        setFeedbackText("");
        setSelectedQuote(data.data);
        fetchQuotations();
      } else {
        alert(data.message || "Action failed");
      }
    } catch {
      alert("Network error processing request.");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return (
          <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
          </span>
        );
      case "CONVERTED":
        return (
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Converted to Order
          </span>
        );
      case "REJECTED":
        return (
          <span className="bg-rose-100 text-rose-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      case "NEGOTIATION":
        return (
          <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" /> Changes Requested
          </span>
        );
      case "SENT":
      case "VIEWED":
        return (
          <span className="bg-[#E0F7FC] text-[#00AEEF] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Quote Ready
          </span>
        );
      case "REQUESTED":
      case "UNDER_REVIEW":
      default:
        return (
          <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Under Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            My Quotations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track and manage your bulk or institutional price quotes.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchQuotations}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            onClick={() => setShowNewQuoteModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#00AEEF] hover:bg-[#0096D6] text-white cursor-pointer transition-all active:scale-95 shadow-2xs"
          >
            <Plus className="w-4 h-4" /> Request a Quotation
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 text-xs font-medium">
          Loading quotations...
        </div>
      ) : quotations.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            No quotations found
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Your requested institutional quotes will appear here.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setShowNewQuoteModal(true)}
              className="inline-flex items-center gap-1.5 bg-[#00AEEF] hover:bg-[#0096D6] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Request a Quotation</span>
            </button>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <span>Explore Products</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {quotations.map((quote) => (
            <div
              key={quote.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs hover:border-[#00AEEF]/40 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-extrabold text-sm text-slate-900">
                      {quote.quoteNumber}
                    </span>
                    {getStatusBadge(quote.status)}
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{quote.companyName}</span>
                    <span>•</span>
                    <span>
                      Store:{" "}
                      <strong>
                        {quote.store?.name || "Ranchi Central Hub"}
                      </strong>
                    </span>
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
                    Grand Total (Inc. GST)
                  </span>
                  <span className="text-lg font-black text-slate-900">
                    ₹
                    {quote.grandTotal
                      ? quote.grandTotal.toLocaleString("en-IN")
                      : "Pending Review"}
                  </span>
                </div>
              </div>

              {/* Items overview */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Requested Line Items
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {quote.items?.map((item: any) => (
                    <div
                      key={item.id}
                      className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs"
                    >
                      <div className="font-bold text-slate-800 truncate">
                        {item.productName}
                      </div>
                      <div className="flex justify-between text-slate-500 text-[11px] mt-1">
                        <span>
                          Qty: <strong>{item.quantity}</strong>
                        </span>
                        <span>
                          Unit:{" "}
                          <strong>
                            ₹{item.unitPrice?.toLocaleString("en-IN")}
                          </strong>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    Valid Until:{" "}
                    <strong>
                      {new Date(quote.validUntil).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openQuoteDetail(quote.id)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-[#00AEEF] text-white flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Proposal
                  </button>

                  {quote.order && (
                    <Link
                      href={`/account/orders`}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center gap-1.5"
                    >
                      <span>Order #{quote.order.orderNumber}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Quotation Request Modal */}
      {showNewQuoteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4">
          <div
            onClick={() => setShowNewQuoteModal(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
          />

          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-slate-100 flex items-start justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  Request a Quotation
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Submit your bulk or institutional hardware requirement.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewQuoteModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateQuotation} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-4 text-xs">
                {/* Institution Type Chips */}
                <div>
                  <label className="block font-bold text-slate-700 mb-2">
                    Institution Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "ATL School",
                      "University / College",
                      "Corporate / R&D",
                      "Research Lab",
                      "Maker / Bulk",
                    ].map((type) => {
                      const isSelected = newInstitutionType === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setNewInstitutionType(type)}
                          className={`px-3.5 py-1.5 rounded-full font-bold text-xs transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#00AEEF] text-white shadow-2xs"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Organization / Lab Name */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Organization / School / Lab Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DPS Robotics Lab, IIT Bombay ATL Lab"
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/15 rounded-xl font-medium text-slate-900 outline-none transition-all"
                  />
                </div>

                {/* Contact Person & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Contact Person Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={newCustomerName}
                      onChange={(e) => setNewCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/15 rounded-xl font-medium text-slate-900 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex rounded-xl border border-slate-200 overflow-hidden focus-within:border-[#00AEEF] focus-within:ring-2 focus-within:ring-[#00AEEF]/15 transition-all">
                      <span className="bg-slate-100 text-slate-500 font-bold px-3 py-2.5 border-r border-slate-200 flex items-center select-none text-xs">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        required
                        placeholder="9876543210"
                        value={newCustomerPhone}
                        onChange={(e) => setNewCustomerPhone(e.target.value.replace(/\D/g, ""))}
                        className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white font-medium text-slate-900 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="contact@example.com"
                    value={newCustomerEmail}
                    onChange={(e) => setNewCustomerEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/15 rounded-xl font-medium text-slate-900 outline-none transition-all"
                  />
                </div>

                {/* Product / Requirement */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Product / Component Requirement <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. 50x Arduino Uno R3, 20x Raspberry Pi 5 8GB, 100x Ultrasonic Sensors..."
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    className="w-full p-3 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/15 rounded-xl font-medium text-slate-900 outline-none transition-all resize-none"
                  />
                </div>

                {/* Quantity & Target Unit Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Quantity <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="10"
                      value={newQuantity}
                      onChange={(e) => setNewQuantity(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/15 rounded-xl font-medium text-slate-900 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Target Unit Price (Optional ₹)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 450"
                      value={newTargetPrice}
                      onChange={(e) => setNewTargetPrice(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/15 rounded-xl font-medium text-slate-900 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Additional Notes / Specifications (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Specific delivery timelines, GST invoicing details, or brand preferences..."
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full p-3 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/15 rounded-xl font-medium text-slate-900 outline-none transition-all resize-none"
                  />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="px-6 sm:px-8 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => setShowNewQuoteModal(false)}
                  className="px-4 py-2 font-bold text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingQuote}
                  className="bg-[#00AEEF] hover:bg-[#0096D6] text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-2xs active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer transition-all"
                >
                  {submittingQuote && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  <span>Submit Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Slide-over / Modal Detail View */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedQuote(null)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
          />

          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-bold">
                  {selectedQuote.institutionType}
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">
                  Quotation #{selectedQuote.quoteNumber}
                </h2>
                <p className="text-xs text-slate-500">
                  {selectedQuote.companyName} • Attn:{" "}
                  {selectedQuote.customerName}
                </p>
              </div>

              <button
                onClick={() => setSelectedQuote(null)}
                className="text-slate-400 hover:text-slate-800 p-2 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Pricing breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                Line Items &amp; Negotiated B2B Rates
              </h4>
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                    <tr>
                      <th className="p-3">Product Description</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Agreed Unit Rate</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {selectedQuote.items?.map((item: any) => (
                      <tr key={item.id}>
                        <td className="p-3">
                          <div className="font-bold">{item.productName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {item.productSku}
                          </div>
                        </td>
                        <td className="p-3 text-center font-bold">
                          {item.quantity}
                        </td>
                        <td className="p-3 text-right">
                          ₹{item.unitPrice?.toLocaleString("en-IN")}
                        </td>
                        <td className="p-3 text-right font-bold">
                          ₹{item.total?.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-bold">
                    ₹{selectedQuote.subtotal?.toLocaleString("en-IN")}
                  </span>
                </div>
                {selectedQuote.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Negotiated Volume Discount:</span>
                    <span className="font-bold">
                      -₹{selectedQuote.discountAmount?.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>GST ({selectedQuote.taxRate}%):</span>
                  <span className="font-bold">
                    ₹{selectedQuote.taxAmount?.toLocaleString("en-IN")}
                  </span>
                </div>
                {selectedQuote.shippingCharge > 0 && (
                  <div className="flex justify-between">
                    <span>Insured Freight / Delivery:</span>
                    <span className="font-bold">
                      ₹{selectedQuote.shippingCharge?.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-black text-slate-900">
                  <span>Grand Total:</span>
                  <span className="text-[#00AEEF]">
                    ₹{selectedQuote.grandTotal?.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Terms & Notes */}
            {selectedQuote.terms && (
              <div className="space-y-1 text-xs">
                <span className="font-bold text-slate-700">
                  Commercial Terms &amp; Conditions:
                </span>
                <p className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-slate-600 whitespace-pre-line leading-relaxed">
                  {selectedQuote.terms}
                </p>
              </div>
            )}

            {/* Customer Negotiation Actions */}
            {["SENT", "VIEWED", "NEGOTIATION"].includes(
              selectedQuote.status,
            ) && (
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      setActionModal("ACCEPT");
                      setFeedbackText(
                        "We agree to the proposed pricing and terms. Please proceed to fulfillment.",
                      );
                    }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Accept Quotation
                  </button>

                  <button
                    onClick={() => {
                      setActionModal("REQUEST_CHANGES");
                      setFeedbackText("");
                    }}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-4 h-4" /> Request Changes
                  </button>

                  <button
                    onClick={() => {
                      setActionModal("REJECT");
                      setFeedbackText("");
                    }}
                    className="px-4 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 py-3 rounded-xl text-xs font-bold border border-slate-200 cursor-pointer transition-all"
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}

            {selectedQuote.status === "ACCEPTED" && (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  You have accepted this quotation. Prayog India operations desk
                  is preparing your dispatch order.
                </span>
              </div>
            )}

            {selectedQuote.status === "CONVERTED" && selectedQuote.order && (
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 text-blue-800 text-xs font-medium flex items-center justify-between">
                <span>
                  Converted to active order{" "}
                  <strong>#{selectedQuote.order.orderNumber}</strong>
                </span>
                <Link href="/account/orders" className="underline font-bold">
                  View Order
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action confirmation dialog */}
      {actionModal && (
        <div className="fixed inset-0 z-60 overflow-y-auto flex items-center justify-center p-4">
          <div
            onClick={() => setActionModal(null)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
          />

          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 z-10 space-y-4">
            <h3 className="text-base font-black text-slate-900">
              {actionModal === "ACCEPT" && "Accept B2B Quotation"}
              {actionModal === "REQUEST_CHANGES" &&
                "Request Price / Quantity Revision"}
              {actionModal === "REJECT" && "Decline Quotation Proposal"}
            </h3>

            <p className="text-xs text-slate-500">
              {actionModal === "ACCEPT" &&
                "Confirming acceptance authorizes our sales and fulfillment team to convert this proposal into an active purchase dispatch."}
              {actionModal === "REQUEST_CHANGES" &&
                "State your proposed quantities or target unit prices. Our procurement manager will review and issue a revised quote."}
              {actionModal === "REJECT" &&
                "Please provide a reason to help us improve future quotes."}
            </p>

            <textarea
              rows={3}
              placeholder={
                actionModal === "REQUEST_CHANGES"
                  ? "e.g. Can we get ₹7,500/unit for Raspberry Pi if we increase quantity to 15 units?"
                  : "Optional notes or instructions..."
              }
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs focus:bg-white focus:outline-none"
            />

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActionModal(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleQuoteAction(actionModal)}
                disabled={actionLoading}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white cursor-pointer ${
                  actionModal === "ACCEPT"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : actionModal === "REQUEST_CHANGES"
                      ? "bg-amber-500 hover:bg-amber-600"
                      : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {actionLoading ? "Processing..." : "Confirm Action"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
