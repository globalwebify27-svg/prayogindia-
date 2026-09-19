"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  ShieldCheck,
  Headset,
  Globe,
  Share2,
  LogIn,
  UserPlus,
  Layers,
  Sparkles,
  Award,
  Flame,
  Tag,
  BookOpen,
  Briefcase,
  PhoneCall,
  Info,
  MapPin,
  Headphones,
  LogOut,
  LayoutGrid,
  Bot,
  Cpu,
  Plane,
  Activity,
  Wifi,
  CircuitBoard,
  GraduationCap,
  Zap,
} from "lucide-react";
import {
  RoboticsCategoryIcon,
  ArduinoCategoryIcon,
  SensorsCategoryIcon,
  DroneCategoryIcon,
  StemCategoryIcon,
  IoTCategoryIcon,
  DevBoardCategoryIcon,
  ComponentsCategoryIcon,
} from "@/components/icons/CategoryIcons";
import { PrayogLogo } from "./PrayogLogo";
import { PRODUCTS } from "@/data/mockData";
import { useStore } from "@/context/StoreContext";
import { searchProductsFuzzy } from "@/lib/fuzzySearch";
import {
  WebsiteNotification,
  DEFAULT_NOTIFICATIONS,
  sortNotifications,
  isNotificationLive,
} from "@/data/notificationSlider";

export type TabType =
  | "home"
  | "about"
  | "services"
  | "products"
  | "contact"
  | "careers"
  | "account"
  | "categories"
  | "learning-hub"
  | "offers"
  | string;

interface HeaderProps {
  activeTab?: TabType;
  onSelectTab?: (tab: TabType, subCategory?: string) => void;
  cartCount?: number;
  wishlistCount?: number;
  onOpenCart?: () => void;
  onOpenWishlist?: () => void;
  onOpenSearch?: () => void;
  onOpenB2BModal?: () => void;
}

const HEADER_CATEGORIES = [
  {
    name: "Arduino & Dev Boards",
    shortName: "Arduino",
    slug: "arduino-development-boards",
    href: "/categories/arduino-development-boards",
    icon: ArduinoCategoryIcon,
  },
  {
    name: "Raspberry Pi",
    shortName: "Raspberry Pi",
    slug: "raspberry-pi",
    href: "/categories/raspberry-pi",
    icon: CircuitBoard,
  },
  {
    name: "Robotics",
    shortName: "Robotics",
    slug: "robotics",
    href: "/categories/robotics",
    icon: RoboticsCategoryIcon,
  },
  {
    name: "Sensors & Modules",
    shortName: "Sensors",
    slug: "sensors-modules",
    href: "/categories/sensors-modules",
    icon: SensorsCategoryIcon,
  },
  {
    name: "Motors & Motor Drivers",
    shortName: "Motors",
    slug: "motors-drivers",
    href: "/categories/motors-drivers",
    icon: Zap,
  },
  {
    name: "Electronic Components",
    shortName: "Components",
    slug: "electronic-components",
    href: "/categories/electronic-components",
    icon: ComponentsCategoryIcon,
  },
  {
    name: "IoT & Wireless",
    shortName: "IoT & Wireless",
    slug: "iot-wireless",
    href: "/categories/iot-wireless",
    icon: IoTCategoryIcon,
  },
  {
    name: "Batteries & Power",
    shortName: "Power & Batt",
    slug: "batteries-power",
    href: "/categories/batteries-power",
    icon: Zap,
  },
  {
    name: "Cameras & Imaging",
    shortName: "Cameras",
    slug: "cameras-imaging",
    href: "/categories/cameras-imaging",
    icon: Activity,
  },
  {
    name: "Connectors & Cables",
    shortName: "Cables",
    slug: "cables-connectors",
    href: "/categories/cables-connectors",
    icon: Layers,
  },
  {
    name: "Mechanical Components",
    shortName: "Mechanical",
    slug: "mechanical-components",
    href: "/categories/mechanical-components",
    icon: LayoutGrid,
  },
  {
    name: "Drone Technology",
    shortName: "Drones",
    slug: "drone-technology",
    href: "/categories/drone-technology",
    icon: DroneCategoryIcon,
  },
  {
    name: "3D Printing & Accessories",
    shortName: "3D Printing",
    slug: "3d-printing",
    href: "/categories/3d-printing",
    icon: Layers,
  },
  {
    name: "Educational & STEM",
    shortName: "STEM Kits",
    slug: "educational-stem",
    href: "/categories/educational-stem",
    icon: StemCategoryIcon,
  },
  {
    name: "Project Kits",
    shortName: "Projects",
    slug: "project-kits",
    href: "/categories/project-kits",
    icon: DevBoardCategoryIcon,
  },
  {
    name: "Industrial Automation",
    shortName: "Automation",
    slug: "industrial-automation",
    href: "/categories/industrial-automation",
    icon: Briefcase,
  },
  {
    name: "Hardware & Tools",
    shortName: "Tools",
    slug: "hardware-tools",
    href: "/categories/hardware-tools",
    icon: Layers,
  },
  {
    name: "Displays & Input Devices",
    shortName: "Displays",
    slug: "displays-input-devices",
    href: "/categories/displays-input-devices",
    icon: LayoutGrid,
  },
  {
    name: "Communication & Network",
    shortName: "Networking",
    slug: "communication-networking",
    href: "/categories/communication-networking",
    icon: Globe,
  },
  {
    name: "Accessories & Misc",
    shortName: "Accessories",
    slug: "accessories-miscellaneous",
    href: "/categories/accessories-miscellaneous",
    icon: Layers,
  },
];

export const Header: React.FC<HeaderProps> = ({
  activeTab: activeTabProp,
  onSelectTab,
  cartCount = 0,
  wishlistCount = 0,
  onOpenCart,
  onOpenWishlist,
  onOpenSearch,
  onOpenB2BModal,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoggedIn, logoutUser } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  // Dropdown hover & mobile accordion states
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [mobileAccountOpen, setMobileAccountOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const mobileCategoryMenuRef = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (event: MouseEvent | TouchEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setSearchExpanded(false);
      }
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setAccountDropdownOpen(false);
      }
      const isInsideDesktop =
        categoryMenuRef.current &&
        categoryMenuRef.current.contains(event.target as Node);
      const isInsideMobile =
        mobileCategoryMenuRef.current &&
        mobileCategoryMenuRef.current.contains(event.target as Node);
      if (!isInsideDesktop && !isInsideMobile) {
        setCategoryDropdownOpen(false);
      }
    };
    const handleScroll = () => {
      setCategoryDropdownOpen(false);
      setSearchExpanded(false);
      setServicesDropdownOpen(false);
      setProductsDropdownOpen(false);
      setAccountDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("touchmove", handleScroll, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("touchmove", handleScroll);
    };
  }, []);

  const getComputedActiveTab = (): TabType => {
    if (!pathname || pathname === "/") return "home";
    if (pathname.startsWith("/about")) return "about";
    if (pathname.startsWith("/services")) return "services";
    if (
      pathname.startsWith("/products") ||
      pathname.startsWith("/categories") ||
      pathname.startsWith("/brands")
    )
      return "products";
    if (pathname.startsWith("/contact")) return "contact";
    if (pathname.startsWith("/careers")) return "careers";
    if (
      pathname.startsWith("/account") ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/register")
    )
      return "account";
    return activeTabProp || "home";
  };

  const activeTab = activeTabProp || getComputedActiveTab();

  const handleTabClick = (tab: TabType, subPath?: string) => {
    if (onSelectTab) {
      onSelectTab(tab, subPath);
    }

    setServicesDropdownOpen(false);
    setProductsDropdownOpen(false);
    setAccountDropdownOpen(false);
    setMobileMenuOpen(false);

    if (subPath) {
      router.push(subPath);
      return;
    }

    let href = "/";
    switch (tab) {
      case "home":
        href = "/";
        break;
      case "about":
        href = "/about";
        break;
      case "services":
        href = "/services";
        break;
      case "products":
        href = "/products";
        break;
      case "contact":
        href = "/contact";
        break;
      case "careers":
        href = "/careers";
        break;
      case "account":
        href = "/account";
        break;
      default:
        href = tab.startsWith("/") ? tab : `/${tab}`;
    }

    router.push(href);
  };

  const [notifications, setNotifications] = useState<WebsiteNotification[]>(
    DEFAULT_NOTIFICATIONS,
  );
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);

  useEffect(() => {
    // Fetch live announcements from API
    fetch("/api/announcements?liveOnly=true")
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.data) && data.data.length > 0) {
          setNotifications(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const liveAnnouncements = sortNotifications(
    notifications.filter((n) => isNotificationLive(n)),
  );

  useEffect(() => {
    if (liveAnnouncements.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentAnnouncementIndex(
        (prev) => (prev + 1) % liveAnnouncements.length,
      );
    }, 4500);
    return () => clearInterval(timer);
  }, [liveAnnouncements.length]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Header Announcement Bar Slider (Section 5 Spec) */}
      <div className="bg-[#0A1128] text-white text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-hidden w-full sm:w-auto justify-center sm:justify-start">
            {liveAnnouncements.length > 0 &&
              (() => {
                const activeItem =
                  liveAnnouncements[
                    currentAnnouncementIndex % liveAnnouncements.length
                  ];
                const isCritical = activeItem.priority === "CRITICAL";
                const isHigh = activeItem.priority === "HIGH";
                const isMedium = activeItem.priority === "MEDIUM";

                return (
                  <>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
                        isCritical
                          ? "bg-red-600 text-white animate-pulse"
                          : isHigh
                            ? "bg-emerald-500 text-white"
                            : isMedium
                              ? "bg-amber-400 text-slate-950 font-black"
                              : "bg-[#00AEEF] text-white"
                      }`}
                    >
                      {activeItem.badgeTag}
                    </span>

                    <div className="relative h-4 w-full sm:w-[540px] overflow-hidden flex items-center">
                      <Link
                        href={activeItem.link || "/products"}
                        className="hover:text-[#FFC20E] transition-colors truncate font-semibold text-[11px] flex items-center gap-1.5"
                      >
                        <span className="truncate">{activeItem.text}</span>
                        {activeItem.linkText && (
                          <span className="text-[#FFC20E] font-bold shrink-0 hidden sm:inline underline text-[10px]">
                            {activeItem.linkText} →
                          </span>
                        )}
                      </Link>
                    </div>
                  </>
                );
              })()}
          </div>

          <div className="hidden sm:flex items-center gap-4 text-[11px] text-slate-300 font-medium">
            <a
              href="tel:+919876543210"
              className="hover:text-white flex items-center gap-1"
            >
              <Headset className="w-3.5 h-3.5 text-[#FFC20E]" />
              <span>+91 98765 43210</span>
            </a>
            <span>•</span>
            <button
              onClick={onOpenB2BModal}
              className="text-[#00AEEF] hover:text-[#0096D6] font-bold cursor-pointer"
            >
              B2B Institutional Sales
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Container with Logo & Action Icons */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Logo */}
          <Link href="/" className="shrink-0 flex items-center min-w-0">
            <PrayogLogo size="md" />
          </Link>

          {/* Search Bar with All Categories Dropdown beside it */}
          <div
            ref={searchContainerRef}
            className="flex-1 max-w-2xl relative hidden sm:flex items-center gap-2"
          >
            {/* All Categories Dropdown Button Beside Search Bar */}
            <div
              ref={categoryMenuRef}
              className="relative shrink-0"
              onMouseEnter={() => setCategoryDropdownOpen(true)}
              onMouseLeave={() => setCategoryDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#00AEEF] hover:bg-[#0096D6] text-white rounded-full font-black text-xs shadow-xs cursor-pointer transition-all active:scale-95"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>All Categories</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${categoryDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown Menu */}
              {categoryDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-1 text-xs font-semibold text-slate-800 space-y-1 max-h-[440px] overflow-y-auto">
                  <div className="px-2.5 py-1.5 text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center justify-between border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-xs z-10">
                    <span>All 20 Hardware Categories</span>
                    <Link
                      href="/categories"
                      onClick={() => setCategoryDropdownOpen(false)}
                      className="text-[#00AEEF] hover:underline font-bold"
                    >
                      View All →
                    </Link>
                  </div>
                  {HEADER_CATEGORIES.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={cat.href}
                      onClick={() => setCategoryDropdownOpen(false)}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-[#E0F7FC] hover:text-[#00AEEF] transition-colors group"
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        <span className="w-7 h-7 rounded-lg bg-slate-50 group-hover:bg-white flex items-center justify-center shrink-0 border border-slate-100 text-[#00AEEF]">
                          <cat.icon className="w-4 h-4" />
                        </span>
                        <span className="truncate">{cat.name}</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#00AEEF] group-hover:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Search Input Box */}
            <div className="flex-1 relative flex items-center">
              <div className="flex items-center overflow-hidden border rounded-full bg-[#EEF2F6] shadow-inner w-full border-[#00AEEF]/60 focus-within:border-[#00AEEF] focus-within:ring-2 focus-within:ring-[#00AEEF]/20 pl-4 pr-1 py-1 transition-all">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchExpanded(true);
                  }}
                  onFocus={() => setSearchExpanded(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      router.push(
                        `/search?q=${encodeURIComponent(searchQuery.trim())}`,
                      );
                      setSearchExpanded(false);
                    }
                  }}
                  placeholder="Search components (e.g. Arduino UNO R4, Pixhawk 6C, Jetson, LiDAR)..."
                  className="w-full bg-transparent border-none outline-none text-xs text-slate-800 placeholder-slate-400 font-medium pr-2"
                />

                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="p-1 text-slate-400 hover:text-slate-600 mr-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={() => {
                    if (searchQuery.trim()) {
                      router.push(
                        `/search?q=${encodeURIComponent(searchQuery.trim())}`,
                      );
                      setSearchExpanded(false);
                    }
                  }}
                  className="bg-[#00AEEF] hover:bg-[#0096D6] text-white w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-2xs active:scale-95 cursor-pointer"
                  aria-label="Search"
                >
                  <Search className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Fuzzy Autocomplete Dropdown */}
            {searchExpanded &&
              searchQuery.trim().length > 0 &&
              (() => {
                const results = searchProductsFuzzy(
                  PRODUCTS,
                  searchQuery,
                ).slice(0, 5);

                return (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-2 py-1 flex justify-between">
                      <span>Hardware Matches</span>
                      <span>{results.length} found</span>
                    </div>

                    <div className="space-y-1 mt-1">
                      {results.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-500">
                          No hardware found matching &ldquo;
                          <strong>{searchQuery}</strong>&rdquo;.
                        </div>
                      ) : (
                        results.map((product) => (
                          <div
                            key={product.id}
                            onClick={() => {
                              router.push(`/products/${product.id}`);
                              setSearchExpanded(false);
                            }}
                            className="p-2 hover:bg-[#E0F7FC] rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                          >
                            <div>
                              <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                                {product.name}
                              </h4>
                              <span className="text-[10px] text-slate-500">
                                {product.category} • SKU: {product.sku}
                              </span>
                            </div>
                            <span className="text-xs font-extrabold text-slate-900">
                              ₹{product.price.toLocaleString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="pt-2 mt-1 border-t border-slate-100 text-center">
                      <button
                        onClick={() => {
                          router.push(
                            `/search?q=${encodeURIComponent(searchQuery.trim())}`,
                          );
                          setSearchExpanded(false);
                        }}
                        className="text-xs font-bold text-[#00AEEF] hover:underline cursor-pointer"
                      >
                        View all search results →
                      </button>
                    </div>
                  </div>
                );
              })()}
          </div>

          {/* Action Icons: Wishlist, Cart, Account Menu, Mobile Hamburger */}
          <div className="flex items-center gap-0.5 sm:gap-2 shrink-0">
            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative p-1.5 sm:p-2 text-slate-700 hover:text-[#00AEEF] transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-[#FFC20E] text-slate-900 font-black text-[10px] rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Drawer */}
            <button
              onClick={onOpenCart}
              className="relative p-1.5 sm:p-2 text-slate-700 hover:text-[#00AEEF] transition-colors flex items-center cursor-pointer"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 sm:w-5 sm:h-5 bg-[#00AEEF] text-white font-bold text-[10px] sm:text-xs rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Account Dropdown Trigger */}
            <div ref={accountMenuRef} className="relative">
              <button
                onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                className="p-1.5 sm:p-2 text-slate-700 hover:text-[#00AEEF] transition-colors flex items-center gap-1 cursor-pointer"
                aria-label="Account Menu"
              >
                <User className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* Section 20 & 3 Account Dropdown */}
              {accountDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-xs font-semibold text-slate-700 space-y-1">
                  {isLoggedIn && user ? (
                    <>
                      {/* Hello, User Header */}
                      <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/60 rounded-xl mb-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#00AEEF] block">
                          Customer Account
                        </span>
                        <div className="text-xs font-black text-slate-900 truncate">
                          Hello, {user.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium truncate">
                          {user.email}
                        </div>
                      </div>

                      {/* 1. My Profile */}
                      <Link
                        href="/account/profile"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="w-full text-left p-2 hover:bg-[#E0F7FC] hover:text-[#00AEEF] rounded-xl transition-colors flex items-center gap-2.5"
                      >
                        <User className="w-4 h-4 text-[#00AEEF]" />
                        <span>My Profile</span>
                      </Link>

                      {/* 2. My Orders */}
                      <Link
                        href="/account/orders"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="w-full text-left p-2 hover:bg-[#E0F7FC] hover:text-[#00AEEF] rounded-xl transition-colors flex items-center gap-2.5"
                      >
                        <ShoppingBag className="w-4 h-4 text-emerald-600" />
                        <span>My Orders</span>
                      </Link>

                      {/* 3. Wishlist */}
                      <Link
                        href="/wishlist"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="w-full text-left p-2 hover:bg-[#E0F7FC] hover:text-[#00AEEF] rounded-xl transition-colors flex items-center gap-2.5"
                      >
                        <Heart className="w-4 h-4 text-red-500" />
                        <span>Wishlist</span>
                      </Link>

                      {/* 4. Saved Address */}
                      <Link
                        href="/account/addresses"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="w-full text-left p-2 hover:bg-[#E0F7FC] hover:text-[#00AEEF] rounded-xl transition-colors flex items-center gap-2.5"
                      >
                        <MapPin className="w-4 h-4 text-purple-600" />
                        <span>Saved Address</span>
                      </Link>

                      {/* 5. Support Tickets */}
                      <Link
                        href="/account/support"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="w-full text-left p-2 hover:bg-[#E0F7FC] hover:text-[#00AEEF] rounded-xl transition-colors flex items-center gap-2.5"
                      >
                        <Headphones className="w-4 h-4 text-sky-600" />
                        <span>Support Tickets</span>
                      </Link>

                      {/* 6. Reward Points */}
                      <Link
                        href="/account/rewards"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="w-full text-left p-2 hover:bg-[#E0F7FC] hover:text-[#00AEEF] rounded-xl transition-colors flex items-center gap-2.5"
                      >
                        <Award className="w-4 h-4 text-amber-500" />
                        <div className="flex items-center justify-between flex-1">
                          <span>Reward Points</span>
                          <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded">
                            {user.rewardPoints} pts
                          </span>
                        </div>
                      </Link>

                      {/* 7. Logout */}
                      <div className="pt-2 border-t border-slate-100 mt-1">
                        <button
                          onClick={() => {
                            logoutUser();
                            setAccountDropdownOpen(false);
                            router.push("/login");
                          }}
                          className="w-full text-left p-2 hover:bg-red-50 text-red-600 rounded-xl transition-colors flex items-center gap-2.5 cursor-pointer font-bold"
                        >
                          <LogOut className="w-4 h-4 text-red-500" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="px-3 py-2 border-b border-slate-100">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                          Account Access
                        </span>
                        <span className="text-xs font-black text-slate-900">
                          Prayog India Portal
                        </span>
                      </div>

                      <Link
                        href="/login"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="w-full text-left p-2 hover:bg-[#E0F7FC] hover:text-[#00AEEF] rounded-xl transition-colors flex items-center gap-2.5"
                      >
                        <LogIn className="w-4 h-4 text-[#00AEEF]" />
                        <div>
                          <div className="font-bold">Sign In</div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            Registered customer access
                          </div>
                        </div>
                      </Link>

                      <Link
                        href="/register"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="w-full text-left p-2 hover:bg-[#E0F7FC] hover:text-[#00AEEF] rounded-xl transition-colors flex items-center gap-2.5"
                      >
                        <UserPlus className="w-4 h-4 text-emerald-600" />
                        <div>
                          <div className="font-bold">Register</div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            Create new verified account
                          </div>
                        </div>
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search & Categories Row */}
        <div className="sm:hidden mt-2.5 pb-0.5 flex items-center gap-2">
          {/* Mobile All Categories Dropdown Button Beside Search */}
          <div ref={mobileCategoryMenuRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              className="flex items-center gap-1.5 bg-[#00AEEF] hover:bg-[#0096D6] text-white px-3 py-2 rounded-full font-black text-xs shadow-xs cursor-pointer active:scale-95 transition-all"
              aria-label="All Categories"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Categories</span>
              <ChevronDown
                className={`w-3 h-3 transition-transform duration-200 ${categoryDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Mobile Dropdown Flyout with Backdrop */}
            {categoryDropdownOpen && (
              <>
                {/* Mobile Full Screen Touch Dismiss Backdrop */}
                <div
                  className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[1px]"
                  onClick={() => setCategoryDropdownOpen(false)}
                  onTouchStart={() => setCategoryDropdownOpen(false)}
                />

                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-1 text-xs font-semibold text-slate-800 space-y-1 max-h-[380px] overflow-y-auto">
                  <div className="px-2.5 py-1.5 text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center justify-between border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-xs z-10">
                    <span>All 20 Categories</span>
                    <Link
                      href="/categories"
                      onClick={() => setCategoryDropdownOpen(false)}
                      className="text-[#00AEEF] hover:underline font-bold"
                    >
                      View All →
                    </Link>
                  </div>
                  {HEADER_CATEGORIES.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={cat.href}
                      onClick={() => setCategoryDropdownOpen(false)}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-[#E0F7FC] hover:text-[#00AEEF] transition-colors"
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 text-[#00AEEF]">
                          <cat.icon className="w-3.5 h-3.5" />
                        </span>
                        <span className="truncate">{cat.name}</span>
                      </span>
                      <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Search Input Box */}
          <div className="flex-1 relative flex items-center">
            <div className="flex items-center overflow-hidden border rounded-full bg-[#EEF2F6] shadow-inner w-full border-[#00AEEF] pl-3.5 pr-1 py-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    router.push(
                      `/search?q=${encodeURIComponent(searchQuery.trim())}`,
                    );
                  }
                }}
                placeholder="Search Raspberry Pi, Arduino..."
                className="w-full bg-transparent border-none outline-none text-xs text-slate-800 placeholder-slate-400 font-medium pr-2"
              />
              <button
                onClick={() => {
                  if (searchQuery.trim())
                    router.push(
                      `/search?q=${encodeURIComponent(searchQuery.trim())}`,
                    );
                }}
                className="bg-[#00AEEF] text-white w-7.5 h-7.5 rounded-full flex items-center justify-center shrink-0 shadow-2xs"
              >
                <Search className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 3: Main Desktop Primary Navigation Bar */}
      {/* ======================================================== */}
      <div className="border-t border-slate-100 bg-white hidden lg:block relative shadow-2xs">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between text-[13px] font-bold text-slate-800 h-13">
          <div className="flex items-center gap-7">
            {/* 0. All Categories Direct Link */}
            <Link
              href="/categories"
              className="flex items-center gap-1.5 text-slate-800 hover:text-[#00AEEF] font-black py-3 transition-colors"
            >
              <LayoutGrid className="w-4 h-4 text-[#00AEEF]" />
              <span>All Categories</span>
            </Link>

            {/* 1. Home */}
            <button
              onClick={() => handleTabClick("home", "/")}
              className={`py-3 focus:outline-none transition-colors duration-150 cursor-pointer ${
                activeTab === "home"
                  ? "text-[#00AEEF] font-extrabold"
                  : "hover:text-[#00AEEF]"
              }`}
            >
              Home
            </button>

            {/* 2. About */}
            <button
              onClick={() => handleTabClick("about", "/about")}
              className={`py-3 focus:outline-none transition-colors duration-150 cursor-pointer ${
                activeTab === "about"
                  ? "text-[#00AEEF] font-extrabold"
                  : "hover:text-[#00AEEF]"
              }`}
            >
              About
            </button>

            {/* 3. Services Dropdown (Section 3 Architecture) */}
            <div
              className="relative group py-3"
              onMouseEnter={() => setServicesDropdownOpen(true)}
              onMouseLeave={() => setServicesDropdownOpen(false)}
            >
              <button
                onClick={() => handleTabClick("services", "/services")}
                className={`flex items-center gap-1 focus:outline-none transition-colors duration-150 cursor-pointer ${
                  activeTab === "services" || servicesDropdownOpen
                    ? "text-[#00AEEF]"
                    : "hover:text-[#00AEEF]"
                }`}
              >
                <span>Services</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${servicesDropdownOpen ? "rotate-180 text-[#00AEEF]" : "group-hover:text-[#00AEEF]"}`}
                />
              </button>

              {servicesDropdownOpen && (
                <div className="absolute top-full left-0 mt-0.5 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-xs font-semibold text-slate-700 space-y-1">
                  <div className="px-3 py-1.5 border-b border-slate-100 mb-1">
                    <span className="text-[10px] font-black uppercase text-[#00AEEF] tracking-wider block">
                      Institutional Services
                    </span>
                  </div>

                  <Link
                    href="/services/stem-lab-setup"
                    onClick={() => setServicesDropdownOpen(false)}
                    className="w-full text-left p-2 hover:bg-[#E0F7FC] hover:text-[#00AEEF] rounded-xl transition-colors flex items-center gap-2"
                  >
                    <span>STEM Lab Setup</span>
                  </Link>

                  <Link
                    href="/services/robotics-lab-setup"
                    onClick={() => setServicesDropdownOpen(false)}
                    className="w-full text-left p-2 hover:bg-[#E0F7FC] hover:text-[#00AEEF] rounded-xl transition-colors flex items-center gap-2"
                  >
                    <span>Robotics Lab Setup</span>
                  </Link>

                  <Link
                    href="/services/drone-lab-setup"
                    onClick={() => setServicesDropdownOpen(false)}
                    className="w-full text-left p-2 hover:bg-[#E0F7FC] hover:text-[#00AEEF] rounded-xl transition-colors flex items-center gap-2"
                  >
                    <span>Drone Lab Setup</span>
                  </Link>

                  <Link
                    href="/services/industrial-projects"
                    onClick={() => setServicesDropdownOpen(false)}
                    className="w-full text-left p-2 hover:bg-[#E0F7FC] hover:text-[#00AEEF] rounded-xl transition-colors flex items-center gap-2"
                  >
                    <span>Industrial Projects</span>
                  </Link>

                  <Link
                    href="/services/consultancy"
                    onClick={() => setServicesDropdownOpen(false)}
                    className="w-full text-left p-2 hover:bg-[#E0F7FC] hover:text-[#00AEEF] rounded-xl transition-colors flex items-center gap-2"
                  >
                    <span>Consultancy</span>
                  </Link>

                  <div className="pt-2 border-t border-slate-100 mt-1">
                    <Link
                      href="/services"
                      onClick={() => setServicesDropdownOpen(false)}
                      className="w-full bg-[#00AEEF] text-white text-center py-2 rounded-xl font-bold block transition-colors hover:bg-[#0096D6]"
                    >
                      All Services Overview →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Products / Shop Dropdown (Section 3 Architecture) */}
            <div
              className="relative group py-3"
              onMouseEnter={() => setProductsDropdownOpen(true)}
              onMouseLeave={() => setProductsDropdownOpen(false)}
            >
              <button
                onClick={() => handleTabClick("products", "/products")}
                className={`flex items-center gap-1 focus:outline-none transition-colors duration-150 cursor-pointer ${
                  activeTab === "products" || productsDropdownOpen
                    ? "text-[#00AEEF]"
                    : "hover:text-[#00AEEF]"
                }`}
              >
                <span>Products / Shop</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${productsDropdownOpen ? "rotate-180 text-[#00AEEF]" : "group-hover:text-[#00AEEF]"}`}
                />
              </button>

              {productsDropdownOpen && (
                <div className="absolute top-full left-0 mt-0.5 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-xs font-semibold text-slate-700 space-y-1">
                  <div className="px-3 py-1.5 border-b border-slate-100 mb-1 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-[#00AEEF] tracking-wider">
                      Hardware Shop
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">
                      80+ Products
                    </span>
                  </div>

                  <Link
                    href="/categories"
                    onClick={() => setProductsDropdownOpen(false)}
                    className="w-full text-left p-2 hover:bg-[#E0F7FC] hover:text-[#00AEEF] rounded-xl transition-colors flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-[#00AEEF]" /> Product
                      Categories
                    </span>
                    <span className="text-[10px] text-slate-400">
                      8 Shelves
                    </span>
                  </Link>

                  <Link
                    href="/brands"
                    onClick={() => setProductsDropdownOpen(false)}
                    className="w-full text-left p-2 hover:bg-[#E0F7FC] hover:text-[#00AEEF] rounded-xl transition-colors flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-[#FFC20E]" /> Brands
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Official OEM
                    </span>
                  </Link>

                  <Link
                    href="/products?filter=featured"
                    onClick={() => setProductsDropdownOpen(false)}
                    className="w-full text-left p-2 hover:bg-[#E0F7FC] hover:text-[#00AEEF] rounded-xl transition-colors flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>Featured Products</span>
                  </Link>

                  <Link
                    href="/products?filter=new-arrivals"
                    onClick={() => setProductsDropdownOpen(false)}
                    className="w-full text-left p-2 hover:bg-[#E0F7FC] hover:text-[#00AEEF] rounded-xl transition-colors flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>New Arrivals</span>
                  </Link>

                  <Link
                    href="/products?filter=best-sellers"
                    onClick={() => setProductsDropdownOpen(false)}
                    className="w-full text-left p-2 hover:bg-[#E0F7FC] hover:text-[#00AEEF] rounded-xl transition-colors flex items-center gap-2"
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    <span>Best Sellers</span>
                  </Link>

                  <Link
                    href="/offers"
                    onClick={() => setProductsDropdownOpen(false)}
                    className="w-full text-left p-2 hover:bg-[#E0F7FC] hover:text-[#FF3B30] rounded-xl transition-colors flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2 text-[#FF3B30]">
                      <Tag className="w-3.5 h-3.5" /> Deals &amp; Offers
                    </span>
                    <span className="bg-red-100 text-red-700 text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                      Active
                    </span>
                  </Link>

                  <Link
                    href="/learning"
                    onClick={() => setProductsDropdownOpen(false)}
                    className="w-full text-left p-2 hover:bg-[#E0F7FC] hover:text-[#00AEEF] rounded-xl transition-colors flex items-center gap-2"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    <span>Learning / Project Products</span>
                  </Link>

                  <div className="pt-2 border-t border-slate-100 mt-1">
                    <Link
                      href="/products"
                      onClick={() => setProductsDropdownOpen(false)}
                      className="w-full bg-slate-900 text-white text-center py-2 rounded-xl font-bold block transition-colors hover:bg-[#00AEEF]"
                    >
                      Browse Full Store Catalogue →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 5. Contact Us */}
            <button
              onClick={() => handleTabClick("contact", "/contact")}
              className={`py-3 focus:outline-none transition-colors duration-150 cursor-pointer ${
                activeTab === "contact"
                  ? "text-[#00AEEF] font-extrabold"
                  : "hover:text-[#00AEEF]"
              }`}
            >
              Contact Us
            </button>

            {/* 6. Careers */}
            <button
              onClick={() => handleTabClick("careers", "/careers")}
              className={`py-3 focus:outline-none transition-colors duration-150 cursor-pointer ${
                activeTab === "careers"
                  ? "text-[#00AEEF] font-extrabold"
                  : "hover:text-[#00AEEF]"
              }`}
            >
              Careers
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* Section 3 Mobile Responsive Menu Drawer */}
      {/* ======================================================== */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 p-4 space-y-3 max-h-[85vh] overflow-y-auto">
          <nav className="flex flex-col space-y-1 text-sm font-bold text-slate-800">
            {/* 1. Home */}
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 border-b border-slate-100 text-left font-extrabold flex justify-between items-center text-[#00AEEF]"
            >
              <span>Home</span>
            </Link>

            {/* 2. About */}
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 border-b border-slate-100 text-left"
            >
              <span>About</span>
            </Link>

            {/* 3. Services Accordion */}
            <div className="border-b border-slate-100">
              <button
                onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                className="w-full py-2.5 text-left flex justify-between items-center cursor-pointer"
              >
                <span>Services</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${mobileServicesOpen ? "rotate-180 text-[#00AEEF]" : ""}`}
                />
              </button>

              {mobileServicesOpen && (
                <div className="pl-3 pb-2 space-y-1.5 text-xs text-slate-600 font-semibold animate-in fade-in">
                  <Link
                    href="/services/stem-lab-setup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1 text-slate-700 hover:text-[#00AEEF]"
                  >
                    ├── STEM Lab Setup
                  </Link>
                  <Link
                    href="/services/robotics-lab-setup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1 text-slate-700 hover:text-[#00AEEF]"
                  >
                    ├── Robotics Lab Setup
                  </Link>
                  <Link
                    href="/services/drone-lab-setup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1 text-slate-700 hover:text-[#00AEEF]"
                  >
                    ├── Drone Lab Setup
                  </Link>
                  <Link
                    href="/services/industrial-projects"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1 text-slate-700 hover:text-[#00AEEF]"
                  >
                    ├── Industrial Projects
                  </Link>
                  <Link
                    href="/services/consultancy"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1 text-slate-700 hover:text-[#00AEEF]"
                  >
                    └── Consultancy
                  </Link>
                </div>
              )}
            </div>

            {/* 4. Products / Shop Accordion */}
            <div className="border-b border-slate-100">
              <button
                onClick={() => setMobileProductsOpen(!mobileProductsOpen)}
                className="w-full py-2.5 text-left flex justify-between items-center cursor-pointer"
              >
                <span>Products / Shop</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${mobileProductsOpen ? "rotate-180 text-[#00AEEF]" : ""}`}
                />
              </button>

              {mobileProductsOpen && (
                <div className="pl-3 pb-2 space-y-1.5 text-xs text-slate-600 font-semibold animate-in fade-in">
                  <Link
                    href="/categories"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1 text-slate-700 hover:text-[#00AEEF]"
                  >
                    ├── Product Categories
                  </Link>
                  <Link
                    href="/brands"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1 text-slate-700 hover:text-[#00AEEF]"
                  >
                    ├── Brands
                  </Link>
                  <Link
                    href="/products?filter=featured"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1 text-slate-700 hover:text-[#00AEEF]"
                  >
                    ├── Featured Products
                  </Link>
                  <Link
                    href="/products?filter=new-arrivals"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1 text-slate-700 hover:text-[#00AEEF]"
                  >
                    ├── New Arrivals
                  </Link>
                  <Link
                    href="/products?filter=best-sellers"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1 text-slate-700 hover:text-[#00AEEF]"
                  >
                    ├── Best Sellers
                  </Link>
                  <Link
                    href="/offers"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1 text-[#FF3B30]"
                  >
                    ├── Deals &amp; Offers
                  </Link>
                  <Link
                    href="/learning"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1 text-slate-700 hover:text-[#00AEEF]"
                  >
                    └── Learning / Project Products
                  </Link>
                </div>
              )}
            </div>

            {/* 5. Contact Us */}
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 border-b border-slate-100 text-left"
            >
              <span>Contact Us</span>
            </Link>

            {/* 6. Careers */}
            <Link
              href="/careers"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 border-b border-slate-100 text-left"
            >
              <span>Careers</span>
            </Link>

            {/* 7. Account Accordion (Section 3 Architecture) */}
            <div className="border-b border-slate-100">
              <button
                onClick={() => setMobileAccountOpen(!mobileAccountOpen)}
                className="w-full py-2.5 text-left flex justify-between items-center text-[#0A1128] font-extrabold cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#00AEEF]" /> Account
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${mobileAccountOpen ? "rotate-180 text-[#00AEEF]" : ""}`}
                />
              </button>

              {mobileAccountOpen && (
                <div className="pl-3 pb-2 space-y-1.5 text-xs text-slate-600 font-semibold animate-in fade-in">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1 text-slate-700 hover:text-[#00AEEF]"
                  >
                    ├── Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1 text-slate-700 hover:text-[#00AEEF]"
                  >
                    └── Register
                  </Link>
                </div>
              )}
            </div>

            {/* Wishlist & Cart Quick Triggers */}
            <div className="pt-3 flex justify-around text-xs text-slate-600 font-bold border-t border-slate-100">
              <button
                onClick={() => {
                  onOpenWishlist?.();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-1 cursor-pointer"
              >
                <Heart className="w-4 h-4 text-[#00AEEF]" /> Wishlist (
                {wishlistCount})
              </button>
              <button
                onClick={() => {
                  onOpenCart?.();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-1 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-[#00AEEF]" /> Cart (
                {cartCount})
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
