"use client";

import React, { useState, useEffect } from "react";
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
    color: "bg-cyan-50 text-cyan-700 border-cyan-200",
  },
  {
    name: "Robotics",
    href: "/categories/robotics",
    icon: RoboticsCategoryIcon,
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    name: "Sensors",
    href: "/categories/sensors-modules",
    icon: SensorsCategoryIcon,
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    name: "Drones",
    href: "/categories/drone-technology",
    icon: DroneCategoryIcon,
    color: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    name: "STEM Kits",
    href: "/categories/stem-kits",
    icon: StemCategoryIcon,
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    name: "IoT Wireless",
    href: "/categories/iot-wireless",
    icon: IoTCategoryIcon,
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
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
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden overflow-hidden flex">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Drawer Sidebar */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="relative w-[88vw] max-w-sm h-full bg-white text-slate-900 shadow-2xl flex flex-col z-10 overflow-hidden"
          >
            {/* Header / Brand & Close */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white sticky top-0 z-20">
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
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close Mobile Navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick User Banner */}
            <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-100">
              {isLoggedIn && user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#00AEEF] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      {user.name ? user.name[0].toUpperCase() : "U"}
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900 line-clamp-1">
                        {user.name || "Member"}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        {user.email || user.phone || "Active Customer"}
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/account"
                    onClick={onClose}
                    className="text-[11px] font-bold text-[#00AEEF] hover:underline"
                  >
                    View &rarr;
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    onClick={onClose}
                    className="flex-1 text-center py-2 px-3 bg-[#00AEEF] hover:bg-[#0098d4] text-white rounded-xl text-xs font-black shadow-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    href="/register"
                    onClick={onClose}
                    className="flex-1 text-center py-2 px-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-slate-500" />
                    <span>Register</span>
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
                  className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-50 hover:bg-[#E0F7FC] border border-slate-100 text-slate-700 hover:text-[#00AEEF] transition-all cursor-pointer group"
                >
                  <div className="relative mb-1">
                    <ShoppingBag className="w-5 h-5 text-slate-600 group-hover:text-[#00AEEF] transition-colors" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1.5 -right-2 bg-[#FF3B30] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
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
                  className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-50 hover:bg-rose-50 border border-slate-100 text-slate-700 hover:text-rose-600 transition-all cursor-pointer group"
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
                  className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#0A1128] hover:bg-[#1E56A0] text-white transition-all cursor-pointer shadow-xs group"
                >
                  <Building2 className="w-5 h-5 text-[#D4AF37] mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold text-slate-100">
                    B2B Quote
                  </span>
                </button>
              </div>

              {/* Popular Categories Horizontal Chips */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Quick Hardware Hub
                  </span>
                  <Link
                    href="/categories"
                    onClick={onClose}
                    className="text-[11px] font-bold text-[#00AEEF] hover:underline"
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
                        className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-bold transition-all hover:shadow-xs ${cat.color}`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
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
                      <Cpu className="w-4 h-4 text-[#00AEEF]" />
                      <span>Shop &amp; Hardware</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        activeAccordion === "shop"
                          ? "rotate-180 text-[#00AEEF]"
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
                          className="flex items-center justify-between py-1.5 hover:text-[#00AEEF]"
                        >
                          <span>All Products</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            1,200+
                          </span>
                        </Link>
                        <Link
                          href="/categories"
                          onClick={onClose}
                          className="block py-1.5 hover:text-[#00AEEF]"
                        >
                          Browse Categories
                        </Link>
                        <Link
                          href="/brands"
                          onClick={onClose}
                          className="block py-1.5 hover:text-[#00AEEF]"
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
                      <Wrench className="w-4 h-4 text-[#00AEEF]" />
                      <span>Lab Setups &amp; Services</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        activeAccordion === "services"
                          ? "rotate-180 text-[#00AEEF]"
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
                          className="block py-1.5 hover:text-[#00AEEF]"
                        >
                          STEM &amp; Atal Tinkering Labs
                        </Link>
                        <Link
                          href="/services/robotics-lab-setup"
                          onClick={onClose}
                          className="block py-1.5 hover:text-[#00AEEF]"
                        >
                          Robotics &amp; AI Lab Setup
                        </Link>
                        <Link
                          href="/services/drone-lab-setup"
                          onClick={onClose}
                          className="block py-1.5 hover:text-[#00AEEF]"
                        >
                          Drone &amp; Avionics Lab Setup
                        </Link>
                        <Link
                          href="/services/industrial-projects"
                          onClick={onClose}
                          className="block py-1.5 hover:text-[#00AEEF]"
                        >
                          Industrial Projects &amp; R&amp;D
                        </Link>
                        <Link
                          href="/services/consultancy"
                          onClick={onClose}
                          className="block py-1.5 hover:text-[#00AEEF]"
                        >
                          Institutional Consultancy
                        </Link>
                        <Link
                          href="/services"
                          onClick={onClose}
                          className="block py-1.5 text-[#00AEEF] font-bold"
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
                        <User className="w-4 h-4 text-[#00AEEF]" />
                        <span>My Account &amp; Orders</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          activeAccordion === "account"
                            ? "rotate-180 text-[#00AEEF]"
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
                          className="pl-8 pr-3 py-1.5 space-y-2 text-xs font-semibold text-slate-600 bg-slate-50/60 rounded-xl mt-1"
                        >
                          <Link
                            href="/account/orders"
                            onClick={onClose}
                            className="block py-1.5 hover:text-[#00AEEF]"
                          >
                            My Orders &amp; Invoices
                          </Link>
                          <Link
                            href="/account/quotations"
                            onClick={onClose}
                            className="block py-1.5 hover:text-[#00AEEF]"
                          >
                            B2B Quotations
                          </Link>
                          <Link
                            href="/account/rewards"
                            onClick={onClose}
                            className="block py-1.5 hover:text-[#00AEEF]"
                          >
                            Rewards &amp; Coins
                          </Link>
                          <Link
                            href="/account/support"
                            onClick={onClose}
                            className="block py-1.5 hover:text-[#00AEEF]"
                          >
                            Support Tickets
                          </Link>
                          <Link
                            href="/account/addresses"
                            onClick={onClose}
                            className="block py-1.5 hover:text-[#00AEEF]"
                          >
                            Delivery Addresses
                          </Link>
                          <button
                            onClick={() => {
                              onLogout?.();
                              onClose();
                            }}
                            className="w-full text-left py-1.5 text-rose-600 hover:text-rose-700 flex items-center gap-1.5 cursor-pointer font-bold"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Sign Out</span>
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
                  href="tel:+919153988390"
                  className="font-bold text-[#00AEEF] flex items-center gap-1 hover:underline"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  +91 91539 88390
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
    </AnimatePresence>
  );
};
