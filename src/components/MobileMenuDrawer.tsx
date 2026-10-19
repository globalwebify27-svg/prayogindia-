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
            {/* Top Bar with Brand & Close Button */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100 shrink-0">
              <Link href="/" onClick={onClose} className="flex items-center">
                <PrayogLogo size="sm" showSubtitle={false} />
              </Link>

              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-900 hover:text-[#2563EB] transition-colors cursor-pointer py-1 px-1.5"
                aria-label="Close menu"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
                <span>Close</span>
              </button>
            </div>

            {/* Search Input Bar */}
            <div className="px-4 py-3 border-b border-slate-100 bg-white shrink-0">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products"
                  className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-800 rounded-lg pl-3.5 pr-10 py-2.5 text-xs font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="absolute right-0 top-0 bottom-0 px-3 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Segmented Top Tabs: MENU | CATEGORIES */}
            <div className="grid grid-cols-2 border-b border-slate-200 bg-[#F1F3F5] shrink-0 text-xs sm:text-sm font-extrabold uppercase tracking-wider">
              <button
                type="button"
                onClick={() => setActiveTab("menu")}
                className={`py-3 text-center transition-all relative cursor-pointer ${
                  activeTab === "menu"
                    ? "bg-white text-slate-900 border-b-2 border-[#002B49] font-black"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Menu
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("categories")}
                className={`py-3 text-center transition-all relative cursor-pointer ${
                  activeTab === "categories"
                    ? "bg-white text-slate-900 border-b-2 border-[#002B49] font-black"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Categories
              </button>
            </div>

            {/* Scrollable Navigation Body */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {activeTab === "menu" ? (
                /* ── MENU TAB CONTENT ── */
                <div className="divide-y divide-slate-100">
                  {/* HOME */}
                  <Link
                    href="/"
                    onClick={onClose}
                    className="flex items-center justify-between px-4 py-3.5 text-xs font-extrabold uppercase tracking-wider text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    <span>Home</span>
                  </Link>

                  {/* STORE */}
                  <Link
                    href="/products"
                    onClick={onClose}
                    className="flex items-center justify-between px-4 py-3.5 text-xs font-extrabold uppercase tracking-wider text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    <span>Store</span>
                  </Link>

                  {/* AI ROBOTS */}
                  <Link
                    href="/categories/robotics"
                    onClick={onClose}
                    className="flex items-center justify-between px-4 py-3.5 text-xs font-extrabold uppercase tracking-wider text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    <span>AI Robots</span>
                  </Link>

                  {/* POPULAR SERVICES (with dark navy dropdown box toggle) */}
                  <div>
                    <div className="flex items-stretch justify-between">
                      <Link
                        href="/services"
                        onClick={onClose}
                        className="flex-1 px-4 py-3.5 text-xs font-extrabold uppercase tracking-wider text-slate-900 hover:bg-slate-50 transition-colors flex items-center"
                      >
                        <span>Popular Services</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => toggleAccordion("services")}
                        className="w-13 bg-[#002B49] hover:bg-[#001D33] text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                        aria-label="Toggle Popular Services"
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            activeAccordion === "services" ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </div>

                    <AnimatePresence>
                      {activeAccordion === "services" && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="divide-y divide-slate-100 bg-slate-50/70 border-t border-slate-100"
                        >
                          <Link
                            href="/services/drone-lab-setup"
                            onClick={onClose}
                            className="block pl-6 pr-4 py-3 text-xs text-slate-600 font-medium hover:text-[#2563EB] transition-colors"
                          >
                            Drone Repair &amp; Maintenance
                          </Link>
                          <Link
                            href="/services/drone-lab-setup"
                            onClick={onClose}
                            className="block pl-6 pr-4 py-3 text-xs text-slate-600 font-medium hover:text-[#2563EB] transition-colors"
                          >
                            Drone Pilot Training &amp; Certification Program
                          </Link>
                          <Link
                            href="/services/consultancy"
                            onClick={onClose}
                            className="block pl-6 pr-4 py-3 text-xs text-slate-600 font-medium hover:text-[#2563EB] transition-colors"
                          >
                            Drone Insurance
                          </Link>
                          <Link
                            href="/services/stem-lab-setup"
                            onClick={onClose}
                            className="block pl-6 pr-4 py-3 text-xs text-slate-600 font-medium hover:text-[#2563EB] transition-colors"
                          >
                            STEM &amp; Atal Tinkering Labs
                          </Link>
                          <Link
                            href="/services/robotics-lab-setup"
                            onClick={onClose}
                            className="block pl-6 pr-4 py-3 text-xs text-slate-600 font-medium hover:text-[#2563EB] transition-colors"
                          >
                            Robotics &amp; AI Lab Setup
                          </Link>
                          <Link
                            href="/services/industrial-projects"
                            onClick={onClose}
                            className="block pl-6 pr-4 py-3 text-xs text-slate-600 font-medium hover:text-[#2563EB] transition-colors"
                          >
                            Industrial Projects &amp; R&amp;D
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* DRONE SERVICES */}
                  <Link
                    href="/services/drone-lab-setup"
                    onClick={onClose}
                    className="flex items-center justify-between px-4 py-3.5 text-xs font-extrabold uppercase tracking-wider text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    <span>Drone Services</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>

                  {/* LEARNING HUB */}
                  <Link
                    href="/learning"
                    onClick={onClose}
                    className="flex items-center justify-between px-4 py-3.5 text-xs font-extrabold uppercase tracking-wider text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span>Learning Hub</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                        Free
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>

                  {/* CONTACT */}
                  <Link
                    href="/contact"
                    onClick={onClose}
                    className="flex items-center justify-between px-4 py-3.5 text-xs font-extrabold uppercase tracking-wider text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    <span>Contact</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>

                  {/* ABOUT */}
                  <Link
                    href="/about"
                    onClick={onClose}
                    className="flex items-center justify-between px-4 py-3.5 text-xs font-extrabold uppercase tracking-wider text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    <span>About</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>

                  {/* MY ACCOUNT / LOGIN OPTION */}
                  {isLoggedIn && user ? (
                    <div>
                      <div className="flex items-stretch justify-between">
                        <Link
                          href="/account"
                          onClick={onClose}
                          className="flex-1 px-4 py-3.5 text-xs font-extrabold uppercase tracking-wider text-[#2563EB] hover:bg-slate-50 transition-colors flex items-center gap-2"
                        >
                          <User className="w-3.5 h-3.5 text-[#2563EB]" />
                          <span>My Account ({user.name || "Customer"})</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => toggleAccordion("account")}
                          className="w-13 bg-[#002B49] hover:bg-[#001D33] text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                          aria-label="Toggle Account Links"
                        >
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${
                              activeAccordion === "account" ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      </div>

                      <AnimatePresence>
                        {activeAccordion === "account" && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="divide-y divide-slate-100 bg-slate-50/70 border-t border-slate-100"
                          >
                            <Link
                              href="/account/orders"
                              onClick={onClose}
                              className="flex items-center justify-between pl-6 pr-4 py-2.5 text-xs text-slate-700 font-semibold hover:text-[#2563EB]"
                            >
                              <span>My Orders</span>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                            </Link>
                            <Link
                              href="/wishlist"
                              onClick={onClose}
                              className="flex items-center justify-between pl-6 pr-4 py-2.5 text-xs text-slate-700 font-semibold hover:text-[#2563EB]"
                            >
                              <span>Wishlist ({wishlistCount})</span>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                            </Link>
                            <Link
                              href="/account/addresses"
                              onClick={onClose}
                              className="flex items-center justify-between pl-6 pr-4 py-2.5 text-xs text-slate-700 font-semibold hover:text-[#2563EB]"
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
                              className="w-full text-left pl-6 pr-4 py-2.5 text-xs text-red-600 font-bold hover:bg-red-50 flex items-center gap-1.5 cursor-pointer"
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
                      className="flex items-center justify-between px-4 py-3.5 text-xs font-extrabold uppercase tracking-wider text-[#2563EB] hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <LogIn className="w-4 h-4 text-[#2563EB]" />
                        <span>Sign In / Register</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </Link>
                  )}
                </div>
              ) : (
                /* ── CATEGORIES TAB CONTENT ── */
                <div className="divide-y divide-slate-100">
                  {CATEGORIES_DATA.map((cat) => {
                    const hasSubs = cat.subcategories && cat.subcategories.length > 0;
                    const isOpen = activeAccordion === cat.id;

                    return (
                      <div key={cat.id}>
                        <div className="flex items-stretch justify-between">
                          <Link
                            href={`/categories/${cat.slug}`}
                            onClick={onClose}
                            className="flex-1 px-4 py-3.5 text-xs font-extrabold uppercase tracking-wider text-slate-900 hover:bg-slate-50 transition-colors flex items-center"
                          >
                            <span>{cat.name}</span>
                          </Link>

                          {hasSubs ? (
                            <button
                              type="button"
                              onClick={() => toggleAccordion(cat.id)}
                              className="w-13 bg-[#002B49] hover:bg-[#001D33] text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                              aria-label={`Toggle ${cat.name}`}
                            >
                              <ChevronDown
                                className={`w-4 h-4 transition-transform duration-200 ${
                                  isOpen ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                          ) : (
                            <div className="px-4 flex items-center justify-center text-slate-400">
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
                                className="divide-y divide-slate-100 bg-slate-50/70 border-t border-slate-100"
                              >
                                {cat.subcategories.map((sub) => (
                                  <Link
                                    key={sub.id}
                                    href={`/categories/${cat.slug}/${sub.slug}`}
                                    onClick={onClose}
                                    className="block pl-6 pr-4 py-3 text-xs text-slate-600 font-medium hover:text-[#2563EB] transition-colors"
                                  >
                                    {sub.name}
                                  </Link>
                                ))}
                                <Link
                                  href={`/categories/${cat.slug}`}
                                  onClick={onClose}
                                  className="block pl-6 pr-4 py-2.5 text-xs text-[#2563EB] font-bold hover:underline"
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
                    className="flex items-center justify-between px-4 py-3.5 text-xs font-black uppercase tracking-wider text-[#2563EB] hover:bg-slate-50 transition-colors"
                  >
                    <span>Browse All Categories</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Actions Bar (Cart, Wishlist, B2B RFQ) */}
            <div className="grid grid-cols-3 gap-2 px-3 py-2.5 border-t border-slate-200 bg-slate-50/80 shrink-0">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCart?.();
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-[#2563EB] text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Cart ({cartCount})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenWishlist?.();
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-rose-600 text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
              >
                <Heart className="w-4 h-4" />
                <span>Wishlist</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenB2BModal?.();
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-amber-700 text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
              >
                <Building2 className="w-4 h-4" />
                <span>B2B</span>
              </button>
            </div>

            {/* Footer / Helpline & Support Contact */}
            <div className="px-4 py-3 border-t border-slate-200 bg-white shrink-0 flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold text-slate-500">Helpline:</span>
              <a
                href="tel:+918709789641"
                className="font-bold text-[#002B49] flex items-center gap-1 hover:underline"
              >
                <PhoneCall className="w-3.5 h-3.5 text-[#2563EB]" />
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
