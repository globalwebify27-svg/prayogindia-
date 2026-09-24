"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Landmark,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  Copy,
  Check,
  Eye,
  RefreshCw,
  Building2,
  ArrowUpRight,
  ShieldCheck,
  User,
  Phone,
  Mail,
  Calendar,
  Layers,
  ChevronRight,
} from "lucide-react";

export interface PaymentItem {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  method: string;
  status:
    | "PENDING"
    | "PENDING_VERIFICATION"
    | "VERIFIED"
    | "PAID"
    | "REJECTED"
    | "FAILED";
  utrNumber?: string | null;
  transactionDate?: string | null;
  submittedAt?: string | null;
  verifiedAt?: string | null;
  verifiedByStaffName?: string | null;
  customerRemarks?: string | null;
  rejectionReason?: string | null;
  adminRemarks?: string | null;
  proofUrl?: string | null;
  createdAt: string;
  order?: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    subtotal: number;
    gstAmount: number;
    discountAmount: number;
    status: string;
    paymentStatus: string;
    shippingAddress: string;
    user?: {
      id: string;
      name: string;
      email: string;
      phone: string;
      companyName?: string | null;
      gstin?: string | null;
      customerType?: string;
    };
    items?: Array<{
      id?: string;
      productName: string;
      productSku?: string;
      quantity: number;
      price: number;
    }>;
    invoice?: {
      id: string;
      invoiceNumber: string;
    } | null;
  };
}

export default function AdminPaymentVerificationPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("PENDING_VERIFICATION");
  const [methodFilter, setMethodFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedUtr, setCopiedUtr] = useState<string | null>(null);

  // Summary statistics
  const [summary, setSummary] = useState({
    pendingVerificationCount: 0,
    totalVerifiedAmount: 0,
  });

  // Action Modals
  const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(
    null,
  );
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [adminRemarks, setAdminRemarks] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/payments?status=${statusFilter}&method=${methodFilter}&search=${encodeURIComponent(
          searchQuery,
        )}`,
      );
      const data = await res.json();
      if (data.success && data.data?.items) {
        setPayments(data.data.items);
        if (data.data.summary) {
          setSummary(data.data.summary);
        }
      } else {
        setPayments([]);
      }
    } catch (err) {
      console.error("Failed to fetch payments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [statusFilter, methodFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPayments();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUtr(text);
    setTimeout(() => setCopiedUtr(null), 2000);
  };

  const handleApprovePayment = async () => {
    if (!selectedPayment) return;
    setActionLoading(true);
    setFeedbackMessage(null);

    try {
      const res = await fetch(
        `/api/admin/payments/${selectedPayment.id}/verify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ remarks: adminRemarks }),
        },
      );
      const data = await res.json();

      if (data.success) {
        setFeedbackMessage({
          type: "success",
          text: `Payment for Order #${selectedPayment.order?.orderNumber} successfully verified!`,
        });
        setIsVerifyModalOpen(false);
        setAdminRemarks("");
        fetchPayments();
      } else {
        setFeedbackMessage({
          type: "error",
          text: data.message || "Failed to verify payment.",
        });
      }
    } catch (err: any) {
      setFeedbackMessage({
        type: "error",
        text: err.message || "Network error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectPayment = async () => {
    if (!selectedPayment) return;
    if (!rejectionReason.trim() || rejectionReason.trim().length < 5) {
      alert(
        "Please provide a specific rejection reason (minimum 5 characters).",
      );
      return;
    }
    setActionLoading(true);
    setFeedbackMessage(null);

    try {
      const res = await fetch(
        `/api/admin/payments/${selectedPayment.id}/reject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rejectionReason: rejectionReason.trim(),
            adminRemarks: adminRemarks.trim(),
          }),
        },
      );
      const data = await res.json();

      if (data.success) {
        setFeedbackMessage({
          type: "success",
          text: `Payment marked as REJECTED. Customer has been notified.`,
        });
        setIsRejectModalOpen(false);
        setRejectionReason("");
        setAdminRemarks("");
        fetchPayments();
      } else {
        setFeedbackMessage({
          type: "error",
          text: data.message || "Failed to reject payment.",
        });
      }
    } catch (err: any) {
      setFeedbackMessage({
        type: "error",
        text: err.message || "Network error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING_VERIFICATION":
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Pending Verification
          </span>
        );
      case "PAID":
      case "VERIFIED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Verified &amp; Paid
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const getMethodBadge = (method: string) => {
    const isNeft = method?.toUpperCase().includes("NEFT");
    const isRtgs = method?.toUpperCase().includes("RTGS");
    const isWire = method?.toLowerCase().includes("bank");

    if (isNeft) {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-black tracking-wider uppercase bg-blue-50 text-blue-700 border border-blue-200">
          NEFT Wire
        </span>
      );
    }
    if (isRtgs) {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-black tracking-wider uppercase bg-purple-50 text-purple-700 border border-purple-200">
          RTGS Wire
        </span>
      );
    }
    if (isWire) {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-black tracking-wider uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
          Bank Wire
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-slate-100 text-slate-600">
        {method || "Online"}
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-300">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/90 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#E0F7FC] px-3 py-0.5 rounded-full border border-[#00AEEF]/20">
              Finance &amp; Accounts Control Desk
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Landmark className="w-8 h-8 text-[#005CA9]" />
            NEFT / RTGS Bank Transfer Verifications
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Audit and verify customer UTR submissions against the official
            Prayog India bank account statements before dispatching orders.
          </p>
        </div>

        <button
          onClick={fetchPayments}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#005CA9]" : ""}`}
          />
          Refresh Feed
        </button>
      </div>

      {/* Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between border ${
            feedbackMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <span>{feedbackMessage.text}</span>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-xs underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Pending Verification Queue
            </p>
            <p className="text-2xl font-black text-amber-600 mt-0.5">
              {summary.pendingVerificationCount}{" "}
              <span className="text-xs font-semibold text-slate-500">
                Transfers
              </span>
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Verified Revenue
            </p>
            <p className="text-2xl font-black text-emerald-700 mt-0.5">
              ₹{summary.totalVerifiedAmount?.toLocaleString("en-IN") || 0}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-blue-200/80 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 text-[#005CA9]" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active Deposit Account
            </p>
            <p className="text-sm font-black text-slate-900 mt-0.5">
              SBI Current · 40892301982739
            </p>
            <p className="text-[10px] text-slate-500 font-mono">
              IFSC: SBIN0000167 · Ranchi
            </p>
          </div>
        </div>
      </div>

      {/* 3. Filters & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "PENDING_VERIFICATION", label: "Pending Verification" },
            { id: "VERIFIED", label: "Verified & Paid" },
            { id: "REJECTED", label: "Rejected" },
            { id: "all", label: "All Payments" },
          ].map((tab) => {
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? "bg-[#005CA9] text-white shadow-md shadow-[#005CA9]/20"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Method selector & Search */}
        <div className="flex items-center gap-2">
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#005CA9]"
          >
            <option value="all">All Methods</option>
            <option value="NEFT">NEFT Only</option>
            <option value="RTGS">RTGS Only</option>
            <option value="WIRE">All Bank Wires</option>
          </select>

          <form
            onSubmit={handleSearchSubmit}
            className="relative flex-1 sm:w-64"
          >
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search UTR, Order #, Customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#005CA9]"
            />
          </form>
        </div>
      </div>

      {/* 4. Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-[#005CA9]" />
            <p className="text-xs font-bold">Loading payment records...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Landmark className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-600">
              No payment records found
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search criteria or switching status tabs.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-black uppercase text-slate-500 tracking-wider">
                  <th className="py-3 px-4">Order &amp; Date</th>
                  <th className="py-3 px-4">Customer &amp; Institution</th>
                  <th className="py-3 px-4">Method &amp; UTR Number</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {payments.map((pay) => {
                  const isPending =
                    pay.status === "PENDING_VERIFICATION" ||
                    pay.status === "PENDING";
                  return (
                    <tr
                      key={pay.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Order & Date */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900">
                          #{pay.order?.orderNumber || pay.orderId}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {new Date(pay.createdAt).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        {pay.order?.invoice && (
                          <span className="inline-block mt-1 text-[10px] font-bold text-[#005CA9] bg-blue-50 px-1.5 py-0.5 rounded">
                            {pay.order.invoice.invoiceNumber}
                          </span>
                        )}
                      </td>

                      {/* Customer Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">
                          {pay.order?.user?.name || "Customer"}
                        </div>
                        {pay.order?.user?.companyName && (
                          <div className="text-[11px] font-semibold text-[#005CA9] flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3" />
                            {pay.order.user.companyName}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400">
                          {pay.order?.user?.phone || pay.order?.user?.email}
                        </div>
                      </td>

                      {/* Method & UTR */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 mb-1">
                          {getMethodBadge(pay.method)}
                        </div>
                        {pay.utrNumber ? (
                          <div className="flex items-center gap-1 font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded w-fit">
                            <span>{pay.utrNumber}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(pay.utrNumber!)}
                              className="text-slate-400 hover:text-slate-700 cursor-pointer"
                              title="Copy UTR"
                            >
                              {copiedUtr === pay.utrNumber ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] italic text-slate-400 font-normal">
                            No UTR submitted yet
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4">
                        <div className="text-sm font-black text-slate-900">
                          ₹{pay.amount.toLocaleString("en-IN")}
                        </div>
                        {pay.order?.gstAmount ? (
                          <div className="text-[10px] text-slate-400 font-mono">
                            Incl. ₹{pay.order.gstAmount.toLocaleString("en-IN")}{" "}
                            GST
                          </div>
                        ) : null}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(pay.status)}
                        {pay.verifiedByStaffName && (
                          <div className="text-[10px] text-slate-400 mt-1">
                            By {pay.verifiedByStaffName}
                          </div>
                        )}
                        {pay.rejectionReason && (
                          <div
                            className="text-[10px] text-rose-600 font-bold max-w-xs truncate mt-0.5"
                            title={pay.rejectionReason}
                          >
                            Reason: {pay.rejectionReason}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedPayment(pay)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-all cursor-pointer"
                            title="View Full Breakdown"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {isPending && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedPayment(pay);
                                  setIsVerifyModalOpen(true);
                                }}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Verify
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedPayment(pay);
                                  setIsRejectModalOpen(true);
                                }}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Payment Details Modal */}
      {selectedPayment && !isVerifyModalOpen && !isRejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Payment Verification Audit · #
                  {selectedPayment.order?.orderNumber ||
                    selectedPayment.orderId}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Review customer wire details, UTR reference, and order items.
                </p>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Status & Method Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Payment Method
                </span>
                <p className="text-xs font-black text-slate-900 mt-0.5">
                  {selectedPayment.method || "NEFT"}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Amount
                </span>
                <p className="text-xs font-black text-[#005CA9] mt-0.5">
                  ₹{selectedPayment.amount.toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Current Status
                </span>
                <div className="mt-0.5">
                  {getStatusBadge(selectedPayment.status)}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  UTR Reference
                </span>
                <p className="text-xs font-mono font-bold text-slate-900 mt-0.5">
                  {selectedPayment.utrNumber || "N/A"}
                </p>
              </div>
            </div>

            {/* Customer Details */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Customer &amp; Institution
              </h4>
              <div className="bg-white border border-slate-200 p-3.5 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer Name:</span>
                  <span className="font-bold text-slate-900">
                    {selectedPayment.order?.user?.name}
                  </span>
                </div>
                {selectedPayment.order?.user?.companyName && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Institution / Company:
                    </span>
                    <span className="font-bold text-[#005CA9]">
                      {selectedPayment.order.user.companyName}
                    </span>
                  </div>
                )}
                {selectedPayment.order?.user?.gstin && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">GSTIN:</span>
                    <span className="font-mono font-bold">
                      {selectedPayment.order.user.gstin}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Contact:</span>
                  <span>
                    {selectedPayment.order?.user?.phone} ·{" "}
                    {selectedPayment.order?.user?.email}
                  </span>
                </div>
                {selectedPayment.customerRemarks && (
                  <div className="pt-2 border-t border-slate-100 text-slate-700 italic">
                    <strong>Customer Remarks:</strong>{" "}
                    {selectedPayment.customerRemarks}
                  </div>
                )}
              </div>
            </div>

            {/* Ordered Items Breakdown */}
            {selectedPayment.order?.items &&
              selectedPayment.order.items.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Ordered Items Snapshot
                  </h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                    {selectedPayment.order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 flex justify-between items-center"
                      >
                        <div>
                          <div className="font-bold text-slate-900">
                            {item.productName}
                          </div>
                          {item.productSku && (
                            <div className="text-[10px] text-slate-400">
                              SKU: {item.productSku}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-bold">
                            Qty: {item.quantity} × ₹{item.price}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            ₹
                            {(item.quantity * item.price).toLocaleString(
                              "en-IN",
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
                className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer text-slate-700"
              >
                Close
              </button>
              {(selectedPayment.status === "PENDING_VERIFICATION" ||
                selectedPayment.status === "PENDING") && (
                <>
                  <button
                    type="button"
                    onClick={() => setIsRejectModalOpen(true)}
                    className="px-4 py-2 text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl cursor-pointer"
                  >
                    Reject Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsVerifyModalOpen(true)}
                    className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md cursor-pointer"
                  >
                    Approve &amp; Confirm Order
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. Approve / Verify Modal */}
      {isVerifyModalOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Approve Bank Transfer
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Confirm that ₹{selectedPayment.amount.toLocaleString("en-IN")}{" "}
                  has been credited.
                </p>
              </div>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200 p-3.5 rounded-xl space-y-1 text-xs text-emerald-900">
              <p>
                <strong>Order #:</strong> {selectedPayment.order?.orderNumber}
              </p>
              <p>
                <strong>UTR Reference:</strong>{" "}
                {selectedPayment.utrNumber || "N/A"}
              </p>
              <p>
                <strong>Total Amount:</strong> ₹
                {selectedPayment.amount.toLocaleString("en-IN")}
              </p>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                Internal Verification Remarks (Optional)
              </label>
              <textarea
                value={adminRemarks}
                onChange={(e) => setAdminRemarks(e.target.value)}
                placeholder="e.g. Verified in SBI Main Branch statement on 21-Sept-2026."
                rows={3}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsVerifyModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApprovePayment}
                disabled={actionLoading}
                className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
              >
                {actionLoading && (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                )}
                Confirm Bank Credit &amp; Mark Paid
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Reject Modal */}
      {isRejectModalOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Reject Payment Submission
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Customer will be notified with the reason to resubmit a valid
                  UTR.
                </p>
              </div>
            </div>

            <div className="bg-rose-50/70 border border-rose-200 p-3.5 rounded-xl space-y-1 text-xs text-rose-900">
              <p>
                <strong>Order #:</strong> {selectedPayment.order?.orderNumber}
              </p>
              <p>
                <strong>Submitted UTR:</strong>{" "}
                {selectedPayment.utrNumber || "N/A"}
              </p>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-slate-700 block mb-1">
                Rejection Reason (Sent to Customer) *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. UTR number not found in SBI bank account statement. Please verify and resubmit."
                rows={3}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                Internal Accounts Notes (Optional)
              </label>
              <input
                type="text"
                value={adminRemarks}
                onChange={(e) => setAdminRemarks(e.target.value)}
                placeholder="e.g. Checked with Accounts Officer on 21-Sept."
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectPayment}
                disabled={actionLoading}
                className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
              >
                {actionLoading && (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                )}
                Reject &amp; Notify Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
