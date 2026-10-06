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
  ArrowRight,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";

export const TrackOrderView: React.FC = () => {
  const { user, isLoggedIn } = useStore();
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [trackingResult, setTrackingResult] = useState<any>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);

    setTimeout(() => {
      // Mock lookup simulation or dynamic response
      const clean = query.trim().toUpperCase();
      setTrackingResult({
        orderNumber: clean.startsWith("ORD-") ? clean : `ORD-${clean.slice(0, 8)}`,
        awb: clean.startsWith("DEL-") || clean.startsWith("SR-") ? clean : `DEL-${Math.floor(100000000 + Math.random() * 900000000)}`,
        courier: "Delhivery Surface Express",
        courierCode: "delhivery",
        estimatedDelivery: "In 2 Business Days",
        destination: "Bengaluru, Karnataka (560103)",
        status: "In Transit - Out for Local Hub Transfer",
        currentLocation: "Bengaluru Central Air Cargo Hub",
        checkpoints: [
          {
            title: "Order Placed & Confirmed",
            time: "Yesterday, 04:30 PM",
            location: "Prayog Hardware Dispatch Hub, Delhi",
            done: true,
          },
          {
            title: "Quality Tested & Packed in Anti-Static Enclosure",
            time: "Yesterday, 07:15 PM",
            location: "Prayog STEM Fulfilment Centre",
            done: true,
          },
          {
            title: "Handed over to Delhivery Logistics",
            time: "Today, 02:40 AM",
            location: "Delhi Linehaul Sorting Facility",
            done: true,
          },
          {
            title: "Arrived at Destination Hub (In Transit)",
            time: "Today, 11:20 AM",
            location: "Bengaluru Cargo Hub, Karnataka",
            done: true,
            current: true,
          },
          {
            title: "Out for Final Lab Delivery",
            time: "Expected Tomorrow, 10:00 AM",
            location: "Local Express Delivery Courier Desk",
            done: false,
          },
          {
            title: "Delivered to Customer / Institution",
            time: "Estimated by 2:00 PM",
            location: "Designated Delivery Address",
            done: false,
          },
        ],
      });
      setLoading(false);
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 space-y-8 text-slate-900">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-[#E0F7FC] text-[#00AEEF] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
          <Truck className="w-4 h-4" /> Live Courier Logistics Tracker
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Track Your Order
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Enter your Prayog Order ID (e.g. <span className="font-mono font-bold text-slate-700">ORD-9821</span>), AWB Air Waybill tracking number, or registered phone number.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xl">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Order ID / AWB Number / Mobile No..."
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/10 transition-all text-slate-900 placeholder:text-slate-400"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-[#00AEEF] hover:bg-[#0098d4] text-white px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
          >
            {loading ? (
              <span>Tracking...</span>
            ) : (
              <>
                <Truck className="w-4 h-4" />
                <span>Track Shipment</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Sample Queries */}
        <div className="flex flex-wrap items-center gap-2 mt-4 text-[11px] text-slate-500 pt-3 border-t border-slate-100">
          <span className="font-bold">Try example:</span>
          {["ORD-9821-DEL", "DEL-849201948", "SR-77391024"].map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => {
                setQuery(sample);
              }}
              className="bg-slate-100 hover:bg-[#E0F7FC] hover:text-[#00AEEF] px-2.5 py-1 rounded-lg font-mono font-bold text-slate-700 transition-colors"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      {/* Tracking Result View */}
      {searched && trackingResult && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Top Status Strip */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#E0F7FC] px-3 py-1 rounded-full">
                Shipment In Transit
              </span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                Order #{trackingResult.orderNumber}
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span>AWB: <strong className="font-mono text-slate-800">{trackingResult.awb}</strong></span>
                <span>•</span>
                <span>Carrier: <strong className="text-slate-800">{trackingResult.courier}</strong></span>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col items-start md:items-end">
              <div className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                Estimated Delivery
              </div>
              <div className="text-lg font-black text-emerald-900">
                {trackingResult.estimatedDelivery}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold">
                To: {trackingResult.destination}
              </div>
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
                        ? "bg-[#00AEEF] border-white ring-4 ring-[#00AEEF]/20 text-white animate-pulse"
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
                            ? "text-[#00AEEF] font-black"
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
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#00AEEF] shrink-0">
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
