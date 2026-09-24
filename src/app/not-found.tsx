import React from "react";
import Link from "next/link";
import {
  Search,
  Home,
  ShoppingBag,
  ArrowRight,
  Bot,
  Cpu,
  Plane,
  Layers,
  PhoneCall,
  Sparkles,
  HelpCircle,
  RotateCcw,
} from "lucide-react";
import { PrayogLogo } from "@/components/PrayogLogo";

export const metadata = {
  title: "404 - Page Not Found | Prayog India",
  description:
    "The hardware component or page you are looking for does not exist.",
};

const POPULAR_CATEGORIES = [
  {
    name: "Arduino & Dev Boards",
    href: "/categories/arduino-development-boards",
    icon: Cpu,
    color: "text-cyan-600 bg-cyan-50 border-cyan-200",
  },
  {
    name: "Robotics Kits",
    href: "/categories/robotics",
    icon: Bot,
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },
  {
    name: "Drone & Avionics",
    href: "/categories/drone-technology",
    icon: Plane,
    color: "text-purple-600 bg-purple-50 border-purple-200",
  },
  {
    name: "STEM Kits",
    href: "/categories/stem-kits",
    icon: Layers,
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
];

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-16 text-center bg-radial from-slate-50 via-white to-white animate-in fade-in duration-300">
      <div className="max-w-3xl w-full mx-auto space-y-8">
        {/* Animated 404 Chip & Hero Icon */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-[#0A1128] via-[#1E56A0] to-[#00AEEF] text-white flex items-center justify-center shadow-xl shadow-[#00AEEF]/20 relative overflow-hidden">
            {/* Background Circuit Grid Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px] opacity-20" />
            <Bot className="w-14 h-14 sm:w-16 sm:h-16 text-white drop-shadow-md animate-pulse" />
          </div>

          <div className="absolute -bottom-3 -right-2 bg-gradient-to-r from-[#FF3B30] to-rose-600 text-white text-[11px] font-black px-3 py-1 rounded-full shadow-md border-2 border-white uppercase tracking-wider">
            Error 404
          </div>
        </div>

        {/* Headline & Explanation */}
        <div className="space-y-3 max-w-lg mx-auto">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Signal Lost in Transmission
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            The robotics module, sensor component, or page you requested could
            not be located in our active hardware inventory.
          </p>
        </div>

        {/* Embedded Quick Search Form */}
        <div className="max-w-md mx-auto w-full">
          <form
            action="/search"
            method="GET"
            className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50 focus-within:border-[#00AEEF] focus-within:ring-2 focus-within:ring-[#00AEEF]/20 transition-all"
          >
            <div className="relative flex-1">
              <input
                type="text"
                name="q"
                placeholder="Search microcontrollers, sensors, motors..."
                className="w-full bg-transparent px-3 pl-9 py-2 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
            <button
              type="submit"
              className="bg-[#00AEEF] hover:bg-[#0096D6] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <span>Search</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Hardware Quick Jump Cards */}
        <div className="pt-2">
          <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-3">
            Popular Hardware Categories
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
            {POPULAR_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.name}
                  href={cat.href}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all hover:scale-[1.03] hover:shadow-md ${cat.color} group`}
                >
                  <Icon className="w-6 h-6 mb-1.5 transition-transform group-hover:scale-110" />
                  <span className="text-xs font-black truncate max-w-full text-slate-800">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-100 max-w-md mx-auto">
          <Link
            href="/"
            className="flex-1 min-w-[140px] bg-[#0A1128] hover:bg-slate-800 text-white px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4 text-[#FFC20E]" />
            <span>Store Home</span>
          </Link>

          <Link
            href="/products"
            className="flex-1 min-w-[140px] bg-[#00AEEF] hover:bg-[#0098d4] text-white px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-[#00AEEF]/20 flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>All Products</span>
          </Link>

          <Link
            href="/contact"
            className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <PhoneCall className="w-3.5 h-3.5 text-slate-500" />
            <span>Contact Support</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
