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
  LogIn,
  UserPlus,
  LogOut,
  PhoneCall,
  Building2,
  Truck,
  ShieldCheck,
  BookOpen,
  Package,
  MapPin,
  CreditCard,
  Gift,
  Home,
  Bot,
  Sparkles,
  Plane,
  Store,
  Info,
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
        <div className="fixed inset-0 z-[100] lg:hidden overflow-hidden flex justify-start">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
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
            className="relative w-[85vw] max-w-sm h-full max-h-[100dvh] h-[100dvh] bg-white text-slate-900 shadow-2xl flex flex-col z-10 overflow-hidden border-r border-slate-200"
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
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {activeTab === "menu" ? (
                /* ── MENU TAB CONTENT ── */
                <div className="divide-y divide-slate-100 py-1">
                  {/* Home */}
                  <Link
                    href="/"
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:text-[#2563EB] hover:bg-slate-50/80 transition-colors group"
                  >
                    <Home className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB] transition-colors" />
                    <span>Home</span>
                  </Link>

                  {/* Store */}
                  <Link
                    href="/products"
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:text-[#2563EB] hover:bg-slate-50/80 transition-colors group"
                  >
                    <Store className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB] transition-colors" />
                    <span>Store</span>
                  </Link>

                  {/* AI Robots */}
                  <Link
                    href="/categories/robotics"
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:text-[#2563EB] hover:bg-slate-50/80 transition-colors group"
                  >
                    <Bot className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB] transition-colors" />
                    <span>AI Robots</span>
                  </Link>

                  {/* Popular Services (Clean Accordion, Zero Dark Navy Box) */}
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleAccordion("services")}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 hover:text-[#2563EB] hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB] transition-colors" />
                        <span>Popular Services</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
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
                          className="divide-y divide-slate-100 bg-slate-50/60 pl-11 pr-4 py-1 border-t border-slate-100"
                        >
                          <Link
                            href="/services/drone-lab-setup"
                            onClick={onClose}
                            className="block py-2.5 text-xs text-slate-600 font-medium hover:text-[#2563EB] transition-colors"
                          >
                            Drone Repair &amp; Maintenance
                          </Link>
                          <Link
                            href="/services/drone-lab-setup"
                            onClick={onClose}
                            className="block py-2.5 text-xs text-slate-600 font-medium hover:text-[#2563EB] transition-colors"
                          >
                            Drone Pilot Training &amp; Certification
                          </Link>
                          <Link
                            href="/services/consultancy"
                            onClick={onClose}
                            className="block py-2.5 text-xs text-slate-600 font-medium hover:text-[#2563EB] transition-colors"
                          >
                            Drone Insurance &amp; Compliance
                          </Link>
                          <Link
                            href="/services/stem-lab-setup"
                            onClick={onClose}
                            className="block py-2.5 text-xs text-slate-600 font-medium hover:text-[#2563EB] transition-colors"
                          >
                            STEM &amp; Atal Tinkering Labs
                          </Link>
                          <Link
                            href="/services/robotics-lab-setup"
                            onClick={onClose}
                            className="block py-2.5 text-xs text-slate-600 font-medium hover:text-[#2563EB] transition-colors"
                          >
                            Robotics &amp; AI Lab Setup
                          </Link>
                          <Link
                            href="/services/industrial-projects"
                            onClick={onClose}
                            className="block py-2.5 text-xs text-slate-600 font-medium hover:text-[#2563EB] transition-colors"
                          >
                            Industrial Projects &amp; R&amp;D
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Drone Services */}
                  <Link
                    href="/services/drone-lab-setup"
                    onClick={onClose}
                    className="flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 hover:text-[#2563EB] hover:bg-slate-50/80 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Plane className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB] transition-colors" />
                      <span>Drone Services</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                  </Link>

                  {/* Learning Hub */}
                  <Link
                    href="/learning"
                    onClick={onClose}
                    className="flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 hover:text-[#2563EB] hover:bg-slate-50/80 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB] transition-colors" />
                      <span>Learning Hub</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-bold px-1.5 py-0.5 rounded-md">
                        Free
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                    </div>
                  </Link>

                  {/* Contact */}
                  <Link
                    href="/contact"
                    onClick={onClose}
                    className="flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 hover:text-[#2563EB] hover:bg-slate-50/80 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <PhoneCall className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB] transition-colors" />
                      <span>Contact</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                  </Link>

                  {/* About */}
                  <Link
                    href="/about"
                    onClick={onClose}
                    className="flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 hover:text-[#2563EB] hover:bg-slate-50/80 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Info className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB] transition-colors" />
                      <span>About Us</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
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
                          ) : (
                            <div className="px-4 text-slate-300">
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          )}
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
