"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronRight,
  ChevronDown,
  ShoppingBag,
  Heart,
  User,
  LogIn,
  UserPlus,
  LogOut,
  Sparkles,
  Layers,
  Wrench,
  BookOpen,
  Tag,
  PhoneCall,
  MessageCircle,
  Briefcase,
  ShieldCheck,
  PackageCheck,
  Building2,
  Cpu,
  Bot,
  Plane,
  Flame,
  Award,
  ExternalLink,
  Truck,
  CreditCard,
  Package,
  MapPin,
  Gift,
} from "lucide-react";
import { PrayogLogo } from "./PrayogLogo";
import {
  ArduinoCategoryIcon,
  RoboticsCategoryIcon,
  SensorsCategoryIcon,
  DroneCategoryIcon,
  StemCategoryIcon,
  IoTCategoryIcon,
} from "@/components/icons/CategoryIcons";

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartCount?: number;
  wishlistCount?: number;
  onOpenCart?: () => void;
  onOpenWishlist?: () => void;
  onOpenB2BModal?: () => void;
  user?: any;
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

const QUICK_CATEGORIES = [
  {
    name: "Arduino",
    href: "/categories/arduino-development-boards",
    icon: ArduinoCategoryIcon,
  },
  {
    name: "Robotics",
    href: "/categories/robotics",
    icon: RoboticsCategoryIcon,
  },
  {
    name: "Sensors",
    href: "/categories/sensors-modules",
    icon: SensorsCategoryIcon,
  },
  {
    name: "Drones",
    href: "/categories/drone-technology",
    icon: DroneCategoryIcon,
  },
  {
    name: "STEM Kits",
    href: "/categories/stem-kits",
    icon: StemCategoryIcon,
  },
  {
    name: "IoT Wireless",
    href: "/categories/iot-wireless",
    icon: IoTCategoryIcon,
  },
];

export const MobileMenuDrawer: React.FC<MobileMenuDrawerProps> = ({
  isOpen,
  onClose,
  cartCount = 0,
  wishlistCount = 0,
  onOpenCart,
  onOpenWishlist,
  onOpenB2BModal,
  user,
  isLoggedIn = false,
  onLogout,
}) => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const toggleAccordion = (id: string) => {
    setActiveAccordion((prev) => (prev === id ? null : id));
  };

  const handleNavigate = (path: string) => {
    onClose();
    router.push(path);
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden overflow-hidden flex justify-start">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Drawer Sidebar (Slides from LEFT) */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="relative w-[85vw] max-w-sm h-full max-h-[100dvh] h-[100dvh] bg-white text-slate-900 shadow-2xl flex flex-col z-10 overflow-hidden border-r border-slate-200/80"
          >
            {/* Header / Brand & Close */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 bg-white sticky top-0 z-20">
              <Link
                href="/"
                onClick={onClose}
                className="flex items-center gap-2 group"
              >
                <PrayogLogo
                  size="sm"
                  showSubtitle={false}
                  className="transition-transform group-hover:scale-105"
                />
              </Link>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center cursor-pointer active:scale-95"
                aria-label="Close Mobile Navigation"
              >
                <X className="w-4 h-4 stroke-[2.2]" />
              </button>
            </div>

            {/* Quick User / Account Banner */}
            <div className="p-3.5 border-b border-slate-100 bg-white">
              {isLoggedIn && user ? (
                <div className="bg-gradient-to-br from-blue-50/70 to-slate-50 border border-blue-100/80 rounded-2xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#2563EB]">
                      ACCOUNT
                    </span>
                    <Link
                      href="/account"
                      onClick={onClose}
                      className="text-[11px] font-bold text-[#2563EB] hover:underline"
                    >
                      Dashboard &rarr;
                    </Link>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#2563EB] text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0 ring-2 ring-white">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span>
                          {user.name
                            ? user.name
                                .trim()
                                .split(/\s+/)
                                .map((n: string) => n[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase()
                            : "OK"}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 truncate leading-tight">
                        {user.name || "Customer Account"}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                        {user.email || user.phone || "customer@prayog.in"}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#2563EB]">
                      ACCOUNT ACCESS
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      Prayog India
                    </span>
                  </div>

                  {/* Sign In & Create Account side by side */}
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/login"
                      onClick={onClose}
                      className="h-9 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-98"
                    >
                      <LogIn className="w-3.5 h-3.5 shrink-0" />
                      <span className="whitespace-nowrap">Sign In</span>
                    </Link>
                    <Link
                      href="/register"
                      onClick={onClose}
                      className="h-9 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-98 shadow-2xs"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="whitespace-nowrap">Register</span>
                    </Link>
                  </div>

                  {/* Track Order Link */}
                  <Link
                    href="/track-order"
                    onClick={onClose}
                    className="w-full bg-white hover:bg-[#EFF6FF] border border-slate-200/80 rounded-xl py-2 px-3 flex items-center justify-between text-xs font-bold text-slate-700 shadow-2xs transition-all group"
                  >
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-[#2563EB]" />
                      <span>Track Order &amp; Shipments</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB] group-hover:translate-x-0.5 transition-all" />
                  </Link>
                </div>
              )}
            </div>

            {/* Scrollable Navigation Body */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 scrollbar-none">
              {/* Quick Actions (Cart, Wishlist, B2B RFQ) */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenCart?.();
                  }}
                  className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-50 hover:bg-[#EFF6FF] border border-slate-200/60 text-slate-700 hover:text-[#2563EB] transition-all cursor-pointer group"
                >
                  <div className="relative mb-1">
                    <ShoppingBag className="w-5 h-5 text-slate-600 group-hover:text-[#2563EB] transition-colors" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1.5 -right-2 bg-[#2563EB] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                        {cartCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold">Cart</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenWishlist?.();
                  }}
                  className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-50 hover:bg-rose-50 border border-slate-200/60 text-slate-700 hover:text-rose-600 transition-all cursor-pointer group"
                >
                  <div className="relative mb-1">
                    <Heart className="w-5 h-5 text-slate-600 group-hover:text-rose-600 transition-colors" />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                        {wishlistCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold">Wishlist</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenB2BModal?.();
                  }}
                  className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-50 hover:bg-amber-50 border border-slate-200/60 text-slate-700 hover:text-amber-700 transition-all cursor-pointer group"
                >
                  <Building2 className="w-5 h-5 text-slate-600 group-hover:text-amber-600 mb-1 transition-colors" />
                  <span className="text-[10px] font-bold">B2B Quote</span>
                </button>
              </div>

              {/* Popular Categories Clean Chips */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Quick Hardware Hub
                  </span>
                  <Link
                    href="/categories"
                    onClick={onClose}
                    className="text-[11px] font-bold text-[#2563EB] hover:underline"
                  >
                    All Categories &rarr;
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <Link
                        key={cat.name}
                        href={cat.href}
                        onClick={onClose}
                        className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 hover:bg-[#EFF6FF] active:bg-[#EFF6FF] border border-slate-200/60 hover:border-[#2563EB]/40 text-xs font-bold text-slate-800 hover:text-[#2563EB] transition-all group"
                      >
                        <span className="w-6 h-6 rounded-lg bg-white border border-slate-200/60 flex items-center justify-center shrink-0 text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white transition-colors shadow-2xs">
                          <Icon className="w-3.5 h-3.5" />
                        </span>
                        <span className="truncate">{cat.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Accordions & Links */}
              <div className="space-y-1 font-bold text-slate-800 text-sm">
                {/* 1. Home */}
                <Link
                  href="/"
                  onClick={onClose}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <span>Home</span>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </Link>

                {/* 2. Shop Hardware Accordion */}
                <div className="rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleAccordion("shop")}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Cpu className="w-4 h-4 text-[#2563EB]" />
                      <span>Shop &amp; Hardware</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        activeAccordion === "shop"
                          ? "rotate-180 text-[#2563EB]"
                          : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {activeAccordion === "shop" && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="pl-8 pr-3 py-1.5 space-y-2 text-xs font-semibold text-slate-600 bg-slate-50/60 rounded-xl mt-1"
                      >
                        <Link
                          href="/products"
                          onClick={onClose}
                          className="flex items-center justify-between py-1.5 hover:text-[#2563EB]"
                        >
                          <span>All Products</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            1,200+
                          </span>
                        </Link>
                        <Link
                          href="/categories"
                          onClick={onClose}
                          className="block py-1.5 hover:text-[#2563EB]"
                        >
                          Browse Categories
                        </Link>
                        <Link
                          href="/brands"
                          onClick={onClose}
                          className="block py-1.5 hover:text-[#2563EB]"
                        >
                          Official Brands
                        </Link>
                        <Link
                          href="/offers"
                          onClick={onClose}
                          className="flex items-center justify-between py-1.5 text-rose-600 hover:text-rose-700"
                        >
                          <span className="flex items-center gap-1.5">
                            <Flame className="w-3.5 h-3.5" />
                            Deals &amp; Offers
                          </span>
                          <span className="bg-rose-100 text-rose-700 text-[9px] font-black px-1.5 py-0.5 rounded-md">
                            UP TO 40% OFF
                          </span>
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 3. Services & Lab Setup Accordion */}
                <div className="rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleAccordion("services")}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Wrench className="w-4 h-4 text-[#2563EB]" />
                      <span>Lab Setups &amp; Services</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        activeAccordion === "services"
                          ? "rotate-180 text-[#2563EB]"
                          : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {activeAccordion === "services" && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="pl-8 pr-3 py-1.5 space-y-2 text-xs font-semibold text-slate-600 bg-slate-50/60 rounded-xl mt-1"
                      >
                        <Link
                          href="/services/stem-lab-setup"
                          onClick={onClose}
                          className="block py-1.5 hover:text-[#2563EB]"
                        >
                          STEM &amp; Atal Tinkering Labs
                        </Link>
                        <Link
                          href="/services/robotics-lab-setup"
                          onClick={onClose}
                          className="block py-1.5 hover:text-[#2563EB]"
                        >
                          Robotics &amp; AI Lab Setup
                        </Link>
                        <Link
                          href="/services/drone-lab-setup"
                          onClick={onClose}
                          className="block py-1.5 hover:text-[#2563EB]"
                        >
                          Drone &amp; Avionics Lab Setup
                        </Link>
                        <Link
                          href="/services/industrial-projects"
                          onClick={onClose}
                          className="block py-1.5 hover:text-[#2563EB]"
                        >
                          Industrial Projects &amp; R&amp;D
                        </Link>
                        <Link
                          href="/services/consultancy"
                          onClick={onClose}
                          className="block py-1.5 hover:text-[#2563EB]"
                        >
                          Institutional Consultancy
                        </Link>
                        <Link
                          href="/services"
                          onClick={onClose}
                          className="block py-1.5 text-[#2563EB] font-bold"
                        >
                          View All Services &rarr;
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 4. Learning Hub */}
                <Link
                  href="/learning"
                  onClick={onClose}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span>Learning Hub</span>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                    Free
                  </span>
                </Link>

                {/* 5. About Us */}
                <Link
                  href="/about"
                  onClick={onClose}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-slate-500" />
                    <span>About Prayog India</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </Link>

                {/* 6. Contact Us */}
                <Link
                  href="/contact"
                  onClick={onClose}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <PhoneCall className="w-4 h-4 text-slate-500" />
                    <span>Contact Support</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </Link>

                {/* 7. Careers */}
                <Link
                  href="/careers"
                  onClick={onClose}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Briefcase className="w-4 h-4 text-slate-500" />
                    <span>Careers</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </Link>

                {/* 8. My Account / Orders (If Logged In) */}
                {isLoggedIn && (
                  <div className="rounded-xl overflow-hidden pt-2 border-t border-slate-100">
                    <button
                      onClick={() => toggleAccordion("account")}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <User className="w-4 h-4 text-[#2563EB]" />
                        <span>My Account &amp; Orders</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          activeAccordion === "account"
                            ? "rotate-180 text-[#2563EB]"
                            : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {activeAccordion === "account" && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-2 py-2 space-y-1 text-xs font-semibold text-slate-700 bg-slate-50/80 rounded-2xl mt-1 border border-slate-100"
                        >
                          <Link
                            href="/account/profile"
                            onClick={onClose}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-white hover:text-[#2563EB] transition-all"
                          >
                            <div className="flex items-center gap-2.5">
                              <User className="w-4 h-4 text-[#2563EB]" />
                              <span>My Account</span>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                          </Link>

                          <Link
                            href="/account/orders"
                            onClick={onClose}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-white hover:text-[#2563EB] transition-all"
                          >
                            <div className="flex items-center gap-2.5">
                              <Package className="w-4 h-4 text-emerald-600" />
                              <span>My Orders</span>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                          </Link>

                          <Link
                            href="/wishlist"
                            onClick={onClose}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-white hover:text-rose-600 transition-all"
                          >
                            <div className="flex items-center gap-2.5">
                              <Heart className="w-4 h-4 text-rose-500" />
                              <span>Wishlist</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {wishlistCount > 0 && (
                                <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded-full">
                                  {wishlistCount}
                                </span>
                              )}
                              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                            </div>
                          </Link>

                          <Link
                            href="/account/addresses"
                            onClick={onClose}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-white hover:text-[#2563EB] transition-all"
                          >
                            <div className="flex items-center gap-2.5">
                              <MapPin className="w-4 h-4 text-purple-600" />
                              <span>Saved Addresses</span>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                          </Link>

                          <Link
                            href="/account/payments"
                            onClick={onClose}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-white hover:text-[#2563EB] transition-all"
                          >
                            <div className="flex items-center gap-2.5">
                              <CreditCard className="w-4 h-4 text-indigo-600" />
                              <span>Payment Methods</span>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                          </Link>

                          <Link
                            href="/account/rewards"
                            onClick={onClose}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-white hover:text-amber-700 transition-all"
                          >
                            <div className="flex items-center gap-2.5">
                              <Gift className="w-4 h-4 text-amber-500" />
                              <span>Rewards / Credits</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded-md">
                                {user?.rewardPoints || 0} pts
                              </span>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                            </div>
                          </Link>

                          <div className="my-1 border-t border-slate-200/80" />

                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onOpenB2BModal?.();
                            }}
                            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white hover:text-[#1E56A0] transition-all text-left cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5">
                              <Building2 className="w-4 h-4 text-[#1E56A0]" />
                              <span>B2B / Institutional Sales</span>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                          </button>

                          <div className="my-1 border-t border-slate-200/80" />

                          <button
                            type="button"
                            onClick={() => {
                              onLogout?.();
                              onClose();
                            }}
                            className="w-full text-left p-2 text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2.5 cursor-pointer font-bold transition-all"
                          >
                            <LogOut className="w-4 h-4 text-red-500" />
                            <span>Logout</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>

            {/* Footer / Helpline & Support Contact */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="font-semibold">Need Assistance?</span>
                <a
                  href="tel:+918709789641"
                  className="font-bold text-[#2563EB] flex items-center gap-1 hover:underline"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  +91 87097 89641
                </a>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Pan-India Hardware Dispatch</span>
                <Link
                  href="/login-staff"
                  onClick={onClose}
                  className="hover:text-slate-600 font-medium"
                >
                  Staff Portal
                </Link>
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
