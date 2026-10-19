"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Truck,
  Search,
  Package,
  CheckCircle2,
  Clock,
  MapPin,
  Building2,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  Phone,
  ArrowRight,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { TruckLoader } from "@/components/TruckLoader";

export const TrackOrderView: React.FC = () => {
  const { user, isLoggedIn } = useStore();
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<{ query: string; message: string } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = query.trim();
    if (!clean) return;

    setLoading(true);
    setSearched(true);
    setTrackingResult(null);
    setErrorMessage(null);

    const startTime = Date.now();

    try {
      const res = await fetch(`/api/orders/track?q=${encodeURIComponent(clean)}`);
      const data = await res.json();

      // Ensure at least 1100ms so user can see the animated truck loader
      const elapsed = Date.now() - startTime;
      const remainingDelay = Math.max(0, 1100 - elapsed);

      setTimeout(() => {
        if (res.ok && data.success && data.data) {
          setTrackingResult(data.data);
          setErrorMessage(null);
        } else {
          setTrackingResult(null);
          setErrorMessage({
            query: clean,
            message:
              data.message ||
              `We couldn't find any active dispatch or courier record matching "${clean}".`,
          });
        }
        setLoading(false);
      }, remainingDelay);
    } catch {
      setTimeout(() => {
        setTrackingResult(null);
        setErrorMessage({
          query: clean,
          message: "Unable to connect to courier server. Please try again in a few moments.",
        });
        setLoading(false);
      }, 900);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-5 sm:py-8 px-4 sm:px-6 space-y-4 sm:space-y-6 text-slate-900">
      {/* Header Banner */}
      <div className="text-center pt-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Track Your Order
        </h1>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-3.5 sm:p-5 shadow-md">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Enter Order ID / AWB Number / Mobile No..."
              className="w-full pl-10 pr-3.5 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all text-slate-900 placeholder:text-slate-400"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-7 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-75 disabled:cursor-wait"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Tracking...</span>
              </>
            ) : (
              <>
                <Truck className="w-4 h-4" />
                <span>Track Shipment</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Animated Truck Loader during Search */}
      {loading && (
        <TruckLoader
          message={`Locating Order #${query.trim().toUpperCase() || "SHIPMENT"}...`}
        />
      )}

      {/* Initial Landing State with Animated Truck */}
      {!loading && !searched && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col items-center justify-center text-center space-y-3 animate-in fade-in duration-300">
          <TruckLoader bare={true} />
          <div className="space-y-1 max-w-md">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Live Express Courier & Dispatch Tracking
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Enter your Order ID (e.g. <span className="font-mono font-semibold text-slate-700">PRG-2026-4253</span>) or AWB number above to see real-time transit checkpoints.
            </p>
          </div>
        </div>
      )}

      {/* Invalid Order / Order Not Found View */}
      {!loading && searched && errorMessage && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-rose-200 p-4 sm:p-7 shadow-sm space-y-4 sm:space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 border-b border-rose-100 pb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200/60">
                Order Record Not Found
              </span>
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                No Shipment Found for &ldquo;<span className="text-rose-600">{errorMessage.query}</span>&rdquo;
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                {errorMessage.message}
              </p>
            </div>
          </div>

          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 space-y-2 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-[11px] text-amber-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              Please check the following suggestions:
            </h4>
            <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
              <li>
                <strong className="text-slate-800">Check Order ID format:</strong> Prayog Order IDs start with <span className="font-mono font-bold text-slate-800">ORD-</span> (e.g., <code className="bg-amber-100/70 px-1.5 py-0.5 rounded text-amber-900 font-mono font-semibold">ORD-9821-DEL</code>).
              </li>
              <li>
                <strong className="text-slate-800">Air Waybill (AWB):</strong> Courier tracking codes typically start with <span className="font-mono font-bold text-slate-800">DEL-</span> (Delhivery) or <span className="font-mono font-bold text-slate-800">SR-</span> (Shiprocket).
              </li>
              <li>
                <strong className="text-slate-800">Recent orders:</strong> If placed within the last 2–4 hours, dispatch data may still be synchronizing with the carrier linehaul network.
              </li>
            </ul>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setErrorMessage(null);
                setSearched(false);
              }}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Try Another Number</span>
            </button>
            <a
              href="tel:+918709789641"
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
            >
              <Phone className="w-3.5 h-3.5 text-slate-600" />
              <span>Contact Support: +91 87097 89641</span>
            </a>
          </div>
        </div>
      )}

      {/* Tracking Result View */}
      {!loading && searched && trackingResult && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-4 sm:p-7 shadow-sm space-y-5 sm:space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Top Status Strip */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 border-b border-slate-100 pb-4 sm:pb-5">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60">
                Shipment In Transit
              </span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                Order #{trackingResult.orderNumber}
              </div>
              <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                <span>AWB: <strong className="font-mono text-slate-800">{trackingResult.awb}</strong></span>
                <span>•</span>
                <span>Carrier: <strong className="text-slate-800">{trackingResult.courier}</strong></span>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col items-start md:items-end">
              <div className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                Estimated Delivery
              </div>
              <div className="text-base sm:text-lg font-black text-emerald-900">
                {trackingResult.estimatedDelivery}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold">
                To: {trackingResult.destination}
              </div>
            </div>
          </div>

          {/* Animated In-Transit Live Truck Banner */}
          <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-emerald-50/60 border border-blue-100 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 overflow-hidden relative shadow-2xs">
            <div className="space-y-1 text-center md:text-left z-10 max-w-md">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#2563EB]">
                  Live Shipment Movement
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900">
                Prayog Express Dispatch Linehaul In Progress
              </h4>
              <p className="text-xs text-slate-500">
                Carrier: {trackingResult.courier} • AWB: {trackingResult.awb} • Destination: {trackingResult.destination}
              </p>
            </div>

            <div className="shrink-0 scale-90 sm:scale-100 z-10">
              <TruckLoader bare={true} />
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="space-y-4 pt-2">
            <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
              Real-Time Tracking Events
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
              {trackingResult.checkpoints.map((cp: any, idx: number) => (
                <div key={idx} className="relative flex items-start gap-4">
                  {/* Pin Dot */}
                  <div
                    className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                      cp.current
                        ? "bg-[#2563EB] border-white ring-4 ring-[#2563EB]/20 text-white animate-pulse"
                        : cp.done
                        ? "bg-emerald-500 border-white text-white"
                        : "bg-slate-200 border-white text-slate-400"
                    }`}
                  >
                    {cp.done ? (
                      <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    )}
                  </div>

                  <div className="flex-1 bg-slate-50/70 hover:bg-slate-50 border border-slate-200/70 p-4 rounded-2xl transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h4
                        className={`text-xs font-bold ${
                          cp.current
                            ? "text-[#2563EB] font-black"
                            : cp.done
                            ? "text-slate-900"
                            : "text-slate-400"
                        }`}
                      >
                        {cp.title}
                      </h4>
                      <span className="text-[11px] font-medium text-slate-400 shrink-0">
                        {cp.time}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{cp.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Logged in Quick Link Banner */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#2563EB] shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900">
              {isLoggedIn ? "Want to view all your past orders?" : "Already have a customer account?"}
            </h4>
            <p className="text-[11px] text-slate-500">
              {isLoggedIn
                ? "View your full order history, download GST invoices, and reorder hardware."
                : "Sign in to automatically see live tracking for all your orders without typing AWB codes."}
            </p>
          </div>
        </div>
        <Link
          href={isLoggedIn ? "/account/orders" : "/login"}
          className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors shadow-2xs flex items-center gap-1.5"
        >
          <span>{isLoggedIn ? "Go to My Orders" : "Sign In to Account"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
