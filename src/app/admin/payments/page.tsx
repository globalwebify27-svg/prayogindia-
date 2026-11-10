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
  X,
  ExternalLink,
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

  // Action Modals State
  const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(
    null,
  );
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [adminRemarks, setAdminRemarks] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Verification Form State
  const [inputUtr, setInputUtr] = useState("");
  const [selectedBankAccount, setSelectedBankAccount] = useState(
    "SBI Current A/C (40892301982739) - Ranchi Hub",
  );
  const [settlementDate, setSettlementDate] = useState(() =>
    new Date().toISOString().split("T")[0],
  );
  const [isAuditConfirmed, setIsAuditConfirmed] = useState(false);

  const openDetailsModal = (pay: PaymentItem) => {
    setSelectedPayment(pay);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedPayment(null);
  };

  const openVerifyModal = (pay: PaymentItem) => {
    setSelectedPayment(pay);
    setIsDetailsModalOpen(false);
    setInputUtr(pay.utrNumber || "");
    setSelectedBankAccount(
      "SBI Current A/C (40892301982739) - Ranchi Hub",
    );
    setSettlementDate(new Date().toISOString().split("T")[0]);
    setAdminRemarks("");
    setIsAuditConfirmed(false);
    setIsVerifyModalOpen(true);
  };

  const openRejectModal = (pay: PaymentItem) => {
    setSelectedPayment(pay);
    setIsDetailsModalOpen(false);
    setRejectionReason("");
    setAdminRemarks("");
    setIsRejectModalOpen(true);
  };

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
    const cleanUtr = inputUtr.trim();
    if (!cleanUtr) {
      alert(
        "Please enter the Bank UTR / Transaction Reference number before approving.",
      );
      return;
    }
    if (!isAuditConfirmed) {
      alert(
        "Please certify fund settlement by ticking the audit confirmation checkbox.",
      );
      return;
    }

    setActionLoading(true);
    setFeedbackMessage(null);

    try {
      const res = await fetch(
        `/api/admin/payments/${selectedPayment.id}/verify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            utrNumber: cleanUtr,
            bankAccount: selectedBankAccount,
            settlementDate: settlementDate,
            remarks: adminRemarks.trim(),
          }),
        },
      );
      const data = await res.json();

      if (data.success) {
        setFeedbackMessage({
          type: "success",
          text: `Payment for Order #${selectedPayment.order?.orderNumber} successfully verified & marked as PAID. Tax Invoice generated!`,
        });
        setIsVerifyModalOpen(false);
        setIsDetailsModalOpen(false);
        setSelectedPayment(null);
        setAdminRemarks("");
        setInputUtr("");
        setIsAuditConfirmed(false);
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
        setIsDetailsModalOpen(false);
        setSelectedPayment(null);
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
                            onClick={() => openDetailsModal(pay)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-all cursor-pointer"
                            title="View Full Breakdown"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {isPending && (
                            <>
                              <button
                                type="button"
                                onClick={() => openVerifyModal(pay)}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Verify
                              </button>
                              <button
                                type="button"
                                onClick={() => openRejectModal(pay)}
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
      {isDetailsModalOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 my-8 animate-in zoom-in-95 duration-150">
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
                type="button"
                onClick={closeDetailsModal}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
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
                onClick={closeDetailsModal}
                className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer text-slate-700 transition-colors"
              >
                Close
              </button>
              {(selectedPayment.status === "PENDING_VERIFICATION" ||
                selectedPayment.status === "PENDING") && (
                <>
                  <button
                    type="button"
                    onClick={() => openRejectModal(selectedPayment)}
                    className="px-4 py-2 text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl cursor-pointer"
                  >
                    Reject Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => openVerifyModal(selectedPayment)}
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
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-100 my-8 animate-in zoom-in-95 duration-150 relative">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center shrink-0 shadow-2xs">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                      Approve Bank Transfer
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100/70 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                      Finance Desk
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Confirm NEFT / RTGS credit in Prayog India bank statement before releasing order.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsVerifyModalOpen(false);
                  setSelectedPayment(null);
                }}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-xl transition-all cursor-pointer"
                disabled={actionLoading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Financial Overview Card */}
            <div className="bg-gradient-to-br from-slate-50 via-slate-50/80 to-emerald-50/40 border border-slate-200/80 rounded-2xl p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Order Ref:
                  </span>
                  <span className="font-mono font-black text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-slate-200 text-xs">
                    #{selectedPayment.order?.orderNumber || selectedPayment.orderId}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    {selectedPayment.order?.user?.companyName ||
                      selectedPayment.order?.user?.name ||
                      "Direct Customer"}
                  </span>
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Verified Credit Amount
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
                    ₹{selectedPayment.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/60 border border-emerald-200 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    100% Full Order Value
                  </span>
                  {selectedPayment.order?.gstAmount ? (
                    <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                      Incl. ₹{selectedPayment.order.gstAmount.toLocaleString("en-IN")} GST
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Customer proof link if uploaded */}
              {selectedPayment.proofUrl && (
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Customer Uploaded Deposit Slip:</span>
                  <a
                    href={selectedPayment.proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
                  >
                    <span>View Counterfoil</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Verification Inputs */}
            <div className="space-y-4">
              {/* UTR Reference Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <span>Bank UTR / Transaction Reference</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  {selectedPayment.utrNumber && (
                    <button
                      type="button"
                      onClick={() => setInputUtr(selectedPayment.utrNumber!)}
                      className="text-[11px] font-bold text-[#005CA9] hover:underline cursor-pointer"
                    >
                      Use Customer UTR ({selectedPayment.utrNumber})
                    </button>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={inputUtr}
                    onChange={(e) => setInputUtr(e.target.value.toUpperCase())}
                    placeholder="Enter 16 or 22 character UTR (e.g. SBIN202609214481)"
                    className="w-full text-xs font-mono font-bold tracking-wider uppercase p-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs text-slate-900 placeholder:normal-case placeholder:font-sans placeholder:font-normal placeholder:text-slate-400"
                  />
                </div>

                {!selectedPayment.utrNumber && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200/80 rounded-lg px-2.5 py-1 flex items-center gap-1.5 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                    <span>Customer did not submit a UTR. Check your SBI statement and enter the matching UTR number.</span>
                  </p>
                )}
              </div>

              {/* Receiving Bank Account & Settlement Date (2 cols) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 block mb-1">
                    Credited Bank Account
                  </label>
                  <select
                    value={selectedBankAccount}
                    onChange={(e) => setSelectedBankAccount(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 cursor-pointer"
                  >
                    <option value="SBI Current A/C (40892301982739) - Ranchi Hub">
                      SBI Current ···2739 (Ranchi Hub)
                    </option>
                    <option value="HDFC Bank Current A/C (50200088192019) - Corporate">
                      HDFC Current ···2019 (Corporate)
                    </option>
                    <option value="ICICI Bank Current A/C (004505012398) - B2B Wire">
                      ICICI Current ···2398 (B2B Wire)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 block mb-1">
                    Settlement / Value Date
                  </label>
                  <input
                    type="date"
                    value={settlementDate}
                    onChange={(e) => setSettlementDate(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                  />
                </div>
              </div>

              {/* Internal Verification Remarks */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">
                    Internal Verification Remarks (Optional)
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">Logged in Audit Trail</span>
                </div>

                {/* Quick Chips */}
                <div className="flex flex-wrap gap-1.5 pb-1">
                  {[
                    "Verified in SBI NetBanking",
                    "Matched in Corporate Statement",
                    "UTR Confirmed with Branch",
                    "100% Advance Received",
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() =>
                        setAdminRemarks((prev) =>
                          prev ? `${prev}. ${preset}` : preset,
                        )
                      }
                      className="text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>

                <textarea
                  value={adminRemarks}
                  onChange={(e) => setAdminRemarks(e.target.value)}
                  placeholder="e.g. Verified in SBI NetBanking statement. Amount matches invoice total."
                  rows={2}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 placeholder:text-slate-400"
                />
              </div>

              {/* Compliance & Safety Confirmation Checkbox */}
              <div
                onClick={() => setIsAuditConfirmed(!isAuditConfirmed)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                  isAuditConfirmed
                    ? "bg-emerald-50/80 border-emerald-300 text-emerald-950"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/80"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isAuditConfirmed}
                  onChange={(e) => setIsAuditConfirmed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                />
                <label className="text-xs font-semibold leading-relaxed cursor-pointer">
                  I certify that ₹{selectedPayment.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })} has cleared and settled into Prayog India&apos;s bank account. Authorize tax invoice generation &amp; order dispatch.
                </label>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsVerifyModalOpen(false);
                  setSelectedPayment(null);
                }}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApprovePayment}
                disabled={actionLoading || !inputUtr.trim() || !isAuditConfirmed}
                className={`px-6 py-2.5 text-xs font-black rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer ${
                  actionLoading || !inputUtr.trim() || !isAuditConfirmed
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25 hover:shadow-lg hover:-translate-y-0.5"
                }`}
              >
                {actionLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying with Bank...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Bank Credit &amp; Mark Paid</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Reject Modal */}
      {isRejectModalOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-100 my-8 animate-in zoom-in-95 duration-150 relative">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-center justify-center shrink-0 shadow-2xs">
                  <AlertTriangle className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    Reject Payment Submission
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Customer will be notified with instructions to resubmit a valid UTR.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setSelectedPayment(null);
                }}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-xl transition-all cursor-pointer"
                disabled={actionLoading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Summary Box */}
            <div className="bg-rose-50/60 border border-rose-200/80 p-3.5 rounded-2xl space-y-1.5 text-xs text-slate-800">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Order Reference:</span>
                <span className="font-mono font-bold text-slate-900">
                  #{selectedPayment.order?.orderNumber || selectedPayment.orderId}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Expected Amount:</span>
                <span className="font-bold text-slate-900">
                  ₹{selectedPayment.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Submitted UTR:</span>
                <span className="font-mono font-bold text-rose-700">
                  {selectedPayment.utrNumber || "N/A (Missing)"}
                </span>
              </div>
            </div>

            {/* Rejection Reason Form */}
            <div className="space-y-3.5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">
                    Rejection Reason (Sent to Customer) *
                  </label>
                  <span className="text-[10px] text-rose-600 font-semibold">Required</span>
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-1.5 pb-2">
                  {[
                    "UTR not found in SBI bank statement",
                    "Transferred amount does not match invoice total",
                    "Invalid or incomplete reference number",
                    "Transfer bounced or reversed by remitting bank",
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setRejectionReason(chip)}
                      className="text-[10px] font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md transition-colors cursor-pointer text-left"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>

                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. UTR number not found in our SBI bank statement. Please verify the 16-digit reference number and resubmit."
                  rows={3}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-800"
                />
              </div>

              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Internal Accounts Audit Notes (Optional)
                </label>
                <input
                  type="text"
                  value={adminRemarks}
                  onChange={(e) => setAdminRemarks(e.target.value)}
                  placeholder="e.g. Rechecked with Branch Accounts Manager at 2:30 PM."
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 text-slate-800"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setSelectedPayment(null);
                }}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectPayment}
                disabled={actionLoading || rejectionReason.trim().length < 5}
                className={`px-5 py-2.5 text-xs font-black rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer ${
                  actionLoading || rejectionReason.trim().length < 5
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                    : "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/25 hover:shadow-lg hover:-translate-y-0.5"
                }`}
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
