"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Search,
  ChevronRight,
  ChevronDown,
  ShoppingBag,
  Heart,
  User,
  LogOut,
  PhoneCall,
  Building2,
  BookOpen,
  MapPin,
  Home,
  Info,
  Flame,
  Wrench,
} from "lucide-react";
import { PrayogLogo } from "./PrayogLogo";
import { CATEGORIES_DATA } from "@/data/categories";

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
  const [activeTab, setActiveTab] = useState<"menu" | "categories">("menu");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when drawer is open (prevents background content and cards from moving)
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalBodyPosition = document.body.style.position;
      const originalBodyTop = document.body.style.top;
      const originalBodyWidth = document.body.style.width;

      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";

      return () => {
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.overflow = originalBodyOverflow;
        document.body.style.position = originalBodyPosition;
        document.body.style.top = originalBodyTop;
        document.body.style.width = originalBodyWidth;
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  const toggleAccordion = (id: string) => {
    setActiveAccordion((prev) => (prev === id ? null : id));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    onClose();
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden overflow-hidden flex justify-start overscroll-contain">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs touch-none"
            aria-hidden="true"
          />

          {/* Drawer Sidebar (Slides from LEFT) */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{
              type: "tween",
              duration: 0.35,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative w-[85vw] max-w-sm h-full max-h-[100dvh] h-[100dvh] bg-white text-slate-900 shadow-2xl flex flex-col z-10 overflow-hidden overscroll-contain border-r border-slate-200 transform-gpu will-change-transform"
          >
            {/* Top Bar with Brand & Clean Round Close Button */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100 shrink-0">
              <Link href="/" onClick={onClose} className="flex items-center">
                <PrayogLogo size="sm" showSubtitle={false} />
              </Link>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-4 h-4 stroke-[2]" />
              </button>
            </div>

            {/* Search Input Bar */}
            <div className="px-4 py-2.5 border-b border-slate-100 bg-white shrink-0">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products, kits, sensors..."
                  className="w-full bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#2563EB] rounded-xl pl-3.5 pr-10 py-2 text-xs font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="absolute right-0 top-0 bottom-0 px-3 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Segmented Top Tabs: Menu | Categories */}
            <div className="px-4 py-2 border-b border-slate-100 bg-white shrink-0">
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab("menu")}
                  className={`py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                    activeTab === "menu"
                      ? "bg-white text-slate-900 shadow-2xs font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Menu
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("categories")}
                  className={`py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                    activeTab === "categories"
                      ? "bg-white text-slate-900 shadow-2xs font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Categories
                </button>
              </div>
            </div>

            {/* Scrollable Navigation Body */}
            <div className="flex-1 overflow-y-auto overscroll-contain overscroll-y-contain scrollbar-thin">
              {activeTab === "menu" ? (
                /* ── MENU TAB CONTENT ── */
                <div className="divide-y divide-slate-100 pt-1 pb-2">
                  {/* 1. Home (No Submenu -> No Arrow) */}
                  <Link
                    href="/"
                    onClick={onClose}
                    className="flex items-center px-4 py-3 text-sm font-medium text-slate-700 hover:text-[#2563EB] hover:bg-slate-50/80 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Home className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB] transition-colors shrink-0" />
                      <span>Home</span>
                    </div>
                  </Link>

                  {/* 2. Products & Hardware (with Desktop Submenu) */}
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleAccordion("products")}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 hover:text-[#2563EB] hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <ShoppingBag className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB] transition-colors" />
                        <span>Products &amp; Hardware</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          activeAccordion === "products" ? "rotate-180 text-[#2563EB]" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {activeAccordion === "products" && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="divide-y divide-slate-100 bg-slate-50/70 pl-11 pr-4 py-1 border-t border-slate-100 overflow-hidden"
                        >
                          <Link
                            href="/categories/arduino-boards"
                            onClick={onClose}
                            className="flex items-center justify-between py-2.5 text-xs text-slate-600 font-medium hover:text-[#2563EB] transition-colors"
                          >
                            <span>Arduino &amp; Dev Boards</span>
                            <ChevronRight className="w-3 h-3 text-slate-300" />
                          </Link>
                          <Link
                            href="/categories/raspberry-pi"
                            onClick={onClose}
                            className="flex items-center justify-between py-2.5 text-xs text-slate-600 font-medium hover:text-[#2563EB] transition-colors"
                          >
                            <span>Raspberry Pi &amp; SBCs</span>
                            <ChevronRight className="w-3 h-3 text-slate-300" />
                          </Link>
                          <Link
                            href="/categories/robotics"
                            onClick={onClose}
                            className="flex items-center justify-between py-2.5 text-xs text-slate-600 font-medium hover:text-[#2563EB] transition-colors"
                          >
                            <span>Robotics &amp; DIY Kits</span>
                            <ChevronRight className="w-3 h-3 text-slate-300" />
                          </Link>
                          <Link
                            href="/categories/sensors-modules"
                            onClick={onClose}
                            className="flex items-center justify-between py-2.5 text-xs text-slate-600 font-medium hover:text-[#2563EB] transition-colors"
                          >
                            <span>Sensors &amp; Modules</span>
                            <ChevronRight className="w-3 h-3 text-slate-300" />
                          </Link>
                          <Link
                            href="/categories/motors-drivers"
                            onClick={onClose}
                            className="flex items-center justify-between py-2.5 text-xs text-slate-600 font-medium hover:text-[#2563EB] transition-colors"
                          >
                            <span>Motors &amp; Motor Drivers</span>
                            <ChevronRight className="w-3 h-3 text-slate-300" />
                          </Link>
                          <Link
                            href="/categories/drone-technology"
                            onClick={onClose}
                            className="flex items-center justify-between py-2.5 text-xs text-slate-600 font-medium hover:text-[#2563EB] transition-colors"
                          >
                            <span>Drones &amp; UAV Parts</span>
                            <ChevronRight className="w-3 h-3 text-slate-300" />
                          </Link>
                          <Link
                            href="/categories/batteries-power"
                            onClick={onClose}
                            className="flex items-center justify-between py-2.5 text-xs text-slate-600 font-medium hover:text-[#2563EB] transition-colors"
                          >
                            <span>Batteries &amp; Power Hubs</span>
                            <ChevronRight className="w-3 h-3 text-slate-300" />
                          </Link>
                          <Link
                            href="/categories/electronic-components"
                            onClick={onClose}
                            className="flex items-center justify-between py-2.5 text-xs text-slate-600 font-medium hover:text-[#2563EB] transition-colors"
                          >
                            <span>Electronic Components</span>
                            <ChevronRight className="w-3 h-3 text-slate-300" />
                          </Link>
                          <Link
                            href="/products"
                            onClick={onClose}
                            className="flex items-center justify-between py-2.5 text-xs text-[#2563EB] font-bold hover:underline transition-colors"
                          >
                            <span>View All Products →</span>
                            <ChevronRight className="w-3.5 h-3.5 text-[#2563EB]" />
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 3. Top Deals (with Desktop Submenu) */}
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleAccordion("deals")}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 hover:text-red-600 hover:bg-red-50/50 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Flame className="w-4 h-4 text-red-500 group-hover:text-red-600 transition-colors shrink-0" />
                        <span className="font-medium">Top Deals</span>
                        <span className="px-1.5 py-0.5 rounded-full font-black text-[9px] bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white uppercase tracking-wider shadow-2xs shrink-0">
                          Hot
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                          activeAccordion === "deals" ? "rotate-180 text-red-600" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {activeAccordion === "deals" && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="divide-y divide-slate-100 bg-red-50/40 pl-11 pr-4 py-1 border-t border-red-100/60 overflow-hidden"
                        >
                          <Link
                            href="/offers"
                            onClick={onClose}
                            className="flex items-center justify-between py-2.5 text-xs text-slate-600 font-medium hover:text-red-600 transition-colors"
                          >
                            <span>Lightning Deals</span>
                            <ChevronRight className="w-3 h-3 text-slate-300" />
                          </Link>
                          <Link
                            href="/offers"
                            onClick={onClose}
                            className="flex items-center justify-between py-2.5 text-xs text-slate-600 font-medium hover:text-red-600 transition-colors"
                          >
                            <span>Robotics Kit Bundles</span>
                            <ChevronRight className="w-3 h-3 text-slate-300" />
                          </Link>
                          <Link
                            href="/offers"
                            onClick={onClose}
                            className="flex items-center justify-between py-2.5 text-xs text-slate-600 font-medium hover:text-red-600 transition-colors"
                          >
                            <span>Drone Parts Offers</span>
                            <ChevronRight className="w-3 h-3 text-slate-300" />
                          </Link>
                          <Link
                            href="/offers"
                            onClick={onClose}
                            className="flex items-center justify-between py-2.5 text-xs text-slate-600 font-medium hover:text-red-600 transition-colors"
                          >
                            <span>Clearance Sale</span>
                            <ChevronRight className="w-3 h-3 text-slate-300" />
                          </Link>
                          <Link
                            href="/offers"
                            onClick={onClose}
                            className="flex items-center justify-between py-2.5 text-xs text-red-600 font-bold hover:underline transition-colors"
                          >
                            <span>View All Deals →</span>
                            <ChevronRight className="w-3.5 h-3.5 text-red-600" />
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 4. Lab Setup & Services (with Desktop Submenu) */}
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleAccordion("services")}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 hover:text-[#2563EB] hover:bg-blue-50/40 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Wrench className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB] transition-colors shrink-0" />
                        <span className="truncate">Lab Setup &amp; Services</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                          activeAccordion === "services" ? "rotate-180 text-[#2563EB]" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {activeAccordion === "services" && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="divide-y divide-slate-100 bg-blue-50/40 pl-11 pr-4 py-1 border-t border-blue-100/60 overflow-hidden"
                        >
                          <Link
                            href="/services/stem-lab-setup"
                            onClick={onClose}
                            className="flex items-center justify-between py-2.5 text-xs text-slate-600 font-medium hover:text-[#2563EB] transition-colors"
                          >
                            <span>STEM &amp; ATL Lab Setup</span>
                            <ChevronRight className="w-3 h-3 text-slate-300" />
                          </Link>
                          <Link
                            href="/services/robotics-lab-setup"
                            onClick={onClose}
                            className="flex items-center justify-between py-2.5 text-xs text-slate-600 font-medium hover:text-[#2563EB] transition-colors"
                          >
                            <span>Robotics &amp; AI Research Lab</span>
                            <ChevronRight className="w-3 h-3 text-slate-300" />
                          </Link>
                          <Link
                            href="/services/drone-lab-setup"
                            onClick={onClose}
                            className="flex items-center justify-between py-2.5 text-xs text-slate-600 font-medium hover:text-[#2563EB] transition-colors"
                          >
                            <span>Drone &amp; Avionics Center</span>
                            <ChevronRight className="w-3 h-3 text-slate-300" />
                          </Link>
                          <Link
                            href="/services/industrial-projects"
                            onClick={onClose}
                            className="flex items-center justify-between py-2.5 text-xs text-slate-600 font-medium hover:text-[#2563EB] transition-colors"
                          >
                            <span>Industrial Prototyping &amp; R&amp;D</span>
                            <ChevronRight className="w-3 h-3 text-slate-300" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onOpenB2BModal?.();
                            }}
                            className="w-full flex items-center justify-between py-2.5 text-xs text-[#2563EB] font-bold hover:underline transition-colors text-left cursor-pointer"
                          >
                            <span>B2B Institutional Sales →</span>
                            <ChevronRight className="w-3.5 h-3.5 text-[#2563EB]" />
                          </button>
                          <Link
                            href="/services"
                            onClick={onClose}
                            className="flex items-center justify-between py-2.5 text-xs text-slate-700 font-bold hover:text-[#2563EB] transition-colors"
                          >
                            <span>View All Services →</span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 5. Learning Hub (with Desktop Submenu) */}
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleAccordion("learning")}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 hover:text-[#2563EB] hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB] transition-colors" />
                        <span>Learning Hub</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          activeAccordion === "learning" ? "rotate-180 text-[#2563EB]" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {activeAccordion === "learning" && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="divide-y divide-slate-100 bg-slate-50/70 pl-11 pr-4 py-1 border-t border-slate-100 overflow-hidden"
                        >
                          <Link
                            href="/learning?tab=internship"
                            onClick={onClose}
                            className="flex items-center justify-between py-2.5 text-xs text-slate-600 font-medium hover:text-[#2563EB] transition-colors"
                          >
                            <span>Internship Program</span>
                            <ChevronRight className="w-3 h-3 text-slate-300" />
                          </Link>
                          <Link
                            href="/learning?tab=workshops"
                            onClick={onClose}
                            className="flex items-center justify-between py-2.5 text-xs text-slate-600 font-medium hover:text-[#2563EB] transition-colors"
                          >
                            <span>Workshops</span>
                            <ChevronRight className="w-3 h-3 text-slate-300" />
                          </Link>
                          <Link
                            href="/learning?tab=certifications"
                            onClick={onClose}
                            className="flex items-center justify-between py-2.5 text-xs text-slate-600 font-medium hover:text-[#2563EB] transition-colors"
                          >
                            <span>Certifications</span>
                            <ChevronRight className="w-3 h-3 text-slate-300" />
                          </Link>
                          <Link
                            href="/learning"
                            onClick={onClose}
                            className="flex items-center justify-between py-2.5 text-xs text-[#2563EB] font-bold hover:underline transition-colors"
                          >
                            <span>View Learning Hub →</span>
                            <ChevronRight className="w-3.5 h-3.5 text-[#2563EB]" />
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 6. About (with Desktop Submenu) */}
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleAccordion("about")}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 hover:text-[#2563EB] hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <Info className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB] transition-colors" />
                        <span>About</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          activeAccordion === "about" ? "rotate-180 text-[#2563EB]" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {activeAccordion === "about" && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="divide-y divide-slate-100 bg-slate-50/70 pl-11 pr-4 py-1 border-t border-slate-100 overflow-hidden"
                        >
                          <Link
                            href="/about"
                            onClick={onClose}
                            className="flex items-center justify-between py-2.5 text-xs text-slate-600 font-medium hover:text-[#2563EB] transition-colors"
                          >
                            <span>About Our Mission</span>
                            <ChevronRight className="w-3 h-3 text-slate-300" />
                          </Link>
                          <Link
                            href="/careers"
                            onClick={onClose}
                            className="flex items-center justify-between py-2.5 text-xs text-slate-600 font-medium hover:text-[#2563EB] transition-colors"
                          >
                            <span>Careers &amp; Culture</span>
                            <ChevronRight className="w-3 h-3 text-slate-300" />
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 7. Contact (with Desktop Submenu) */}
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleAccordion("contact")}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 hover:text-[#2563EB] hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <PhoneCall className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB] transition-colors" />
                        <span>Contact</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          activeAccordion === "contact" ? "rotate-180 text-[#2563EB]" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {activeAccordion === "contact" && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="divide-y divide-slate-100 bg-slate-50/70 pl-11 pr-4 py-1 border-t border-slate-100 overflow-hidden"
                        >
                          <Link
                            href="/contact"
                            onClick={onClose}
                            className="flex items-center justify-between py-2.5 text-xs text-slate-600 font-medium hover:text-[#2563EB] transition-colors"
                          >
                            <span>Customer Support Desk</span>
                            <ChevronRight className="w-3 h-3 text-slate-300" />
                          </Link>
                          <a
                            href="https://wa.me/918709789641"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={onClose}
                            className="flex items-center justify-between py-2.5 text-xs text-emerald-600 font-medium hover:text-emerald-700 transition-colors"
                          >
                            <span>WhatsApp Support</span>
                            <ChevronRight className="w-3 h-3 text-emerald-500" />
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onOpenB2BModal?.();
                            }}
                            className="w-full flex items-center justify-between py-2.5 text-xs text-amber-700 font-medium hover:text-amber-800 transition-colors text-left cursor-pointer"
                          >
                            <span>B2B &amp; Bulk Orders</span>
                            <ChevronRight className="w-3 h-3 text-amber-600" />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 8. Store Location (No Submenu -> No Arrow) */}
                  <Link
                    href="/walk-in"
                    onClick={onClose}
                    className="flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-800 hover:bg-amber-50/60 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <MapPin className="w-4 h-4 text-amber-500 group-hover:text-amber-600 transition-colors shrink-0" />
                      <span className="truncate">Store Location</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full font-bold text-[11px] bg-[#FFC20E] text-slate-900 shadow-2xs shrink-0">
                      Visit
                    </span>
                  </Link>

                  {/* My Account (Clean Profile Accordion, No Navy Box) */}
                  {isLoggedIn && user ? (
                    <div>
                      <button
                        type="button"
                        onClick={() => toggleAccordion("account")}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-[#2563EB] hover:bg-blue-50/40 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-xs shrink-0">
                            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div className="text-left min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {user.name || "My Account"}
                            </p>
                            <p className="text-[10px] text-slate-400">View account</p>
                          </div>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                            activeAccordion === "account" ? "rotate-180 text-[#2563EB]" : ""
                          }`}
                        />
                      </button>

                      <AnimatePresence>
                        {activeAccordion === "account" && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="divide-y divide-slate-100 bg-slate-50/60 pl-11 pr-4 py-1 border-t border-slate-100"
                          >
                            <Link
                              href="/account/orders"
                              onClick={onClose}
                              className="flex items-center justify-between py-2.5 text-xs text-slate-700 font-medium hover:text-[#2563EB]"
                            >
                              <span>My Orders</span>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                            </Link>
                            <Link
                              href="/wishlist"
                              onClick={onClose}
                              className="flex items-center justify-between py-2.5 text-xs text-slate-700 font-medium hover:text-[#2563EB]"
                            >
                              <span>Wishlist ({wishlistCount})</span>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                            </Link>
                            <Link
                              href="/account/addresses"
                              onClick={onClose}
                              className="flex items-center justify-between py-2.5 text-xs text-slate-700 font-medium hover:text-[#2563EB]"
                            >
                              <span>Saved Addresses</span>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => {
                                onLogout?.();
                                onClose();
                              }}
                              className="w-full text-left py-2.5 text-xs text-rose-600 font-semibold hover:text-rose-700 flex items-center gap-1.5 cursor-pointer"
                            >
                              <LogOut className="w-3.5 h-3.5" />
                              <span>Sign Out</span>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      onClick={onClose}
                      className="flex items-center justify-between px-4 py-3 text-sm font-semibold text-[#2563EB] hover:bg-blue-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-[#2563EB]" />
                        <span>Sign In / Register</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#2563EB]/60" />
                    </Link>
                  )}
                </div>
              ) : (
                /* ── CATEGORIES TAB CONTENT (Clean Accordions, No Navy Boxes) ── */
                <div className="divide-y divide-slate-100 py-1">
                  {CATEGORIES_DATA.map((cat) => {
                    const hasSubs = cat.subcategories && cat.subcategories.length > 0;
                    const isOpen = activeAccordion === cat.id;

                    return (
                      <div key={cat.id}>
                        <div className="flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                          <Link
                            href={`/categories/${cat.slug}`}
                            onClick={onClose}
                            className="flex-1 px-4 py-3 text-xs sm:text-sm font-medium text-slate-800 hover:text-[#2563EB] transition-colors"
                          >
                            <span>{cat.name}</span>
                          </Link>

                          {hasSubs ? (
                            <button
                              type="button"
                              onClick={() => toggleAccordion(cat.id)}
                              className="p-3 text-slate-400 hover:text-[#2563EB] transition-colors cursor-pointer"
                              aria-label={`Toggle ${cat.name}`}
                            >
                              <ChevronDown
                                className={`w-4 h-4 transition-transform duration-200 ${
                                  isOpen ? "rotate-180 text-[#2563EB]" : ""
                                }`}
                              />
                            </button>
                          ) : null}
                        </div>

                        {hasSubs && (
                          <AnimatePresence>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="divide-y divide-slate-100 bg-slate-50/60 pl-8 pr-4 py-1 border-t border-slate-100"
                              >
                                {cat.subcategories.map((sub) => (
                                  <Link
                                    key={sub.id}
                                    href={`/categories/${cat.slug}/${sub.slug}`}
                                    onClick={onClose}
                                    className="block py-2.5 text-xs text-slate-600 font-medium hover:text-[#2563EB] transition-colors"
                                  >
                                    {sub.name}
                                  </Link>
                                ))}
                                <Link
                                  href={`/categories/${cat.slug}`}
                                  onClick={onClose}
                                  className="block py-2 text-xs text-[#2563EB] font-semibold hover:underline"
                                >
                                  View All {cat.name} &rarr;
                                </Link>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        )}
                      </div>
                    );
                  })}

                  <Link
                    href="/categories"
                    onClick={onClose}
                    className="flex items-center justify-between px-4 py-3 text-xs font-bold text-[#2563EB] hover:bg-slate-50 transition-colors"
                  >
                    <span>Browse All Categories</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Actions Bar (Cart, Wishlist, B2B RFQ) */}
            <div className="grid grid-cols-3 gap-2 px-3.5 py-2.5 border-t border-slate-100 bg-slate-50/60 shrink-0">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCart?.();
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-white border border-slate-200/80 hover:border-slate-300 text-slate-700 hover:text-[#2563EB] text-xs font-semibold transition-all shadow-2xs active:scale-95 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />
                <span>Cart ({cartCount})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenWishlist?.();
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-white border border-slate-200/80 hover:border-slate-300 text-slate-700 hover:text-rose-600 text-xs font-semibold transition-all shadow-2xs active:scale-95 cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span>Wishlist</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenB2BModal?.();
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-white border border-slate-200/80 hover:border-slate-300 text-slate-700 hover:text-[#2563EB] text-xs font-semibold transition-all shadow-2xs active:scale-95 cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>B2B</span>
              </button>
            </div>

            {/* Footer / Helpline */}
            <div className="px-4 py-2.5 border-t border-slate-100 bg-white shrink-0 flex items-center justify-between text-xs text-slate-600">
              <span className="font-medium text-slate-400">Helpline:</span>
              <a
                href="tel:+918709789641"
                className="font-bold text-[#2563EB] flex items-center gap-1.5 hover:underline"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>+91 87097 89641</span>
              </a>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
