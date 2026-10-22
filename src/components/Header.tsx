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
  Eye,
  EyeOff,
  AlertCircle,
  Layers,
  Sparkles,
  Award,
  Coins,
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
  Building2,
  CreditCard,
  Package,
  Truck,
  Gift,
  CircuitBoard,
  Zap,
  Flame,
  MessageSquare,
  GraduationCap,
  Code2,
  FileText,
  ArrowRight,
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
import { AddToCartIcon } from "@/components/icons/AddToCartIcon";
import { PrayogLogo } from "./PrayogLogo";
import { MobileMenuDrawer } from "./MobileMenuDrawer";
import { PRODUCTS } from "@/data/mockData";
import { CATEGORIES_DATA } from "@/data/categories";
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

const POPUP_CATEGORIES = HEADER_CATEGORIES.map((cat) => {
  const matched = CATEGORIES_DATA.find(
    (c) => c.slug === cat.slug || c.id === `cat-${cat.slug}`
  );
  return {
    ...cat,
    subcategories: matched?.subcategories || [],
  };
});

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
  const { user, isLoggedIn, loginUser, logoutUser, cart } = useStore();

  // Quick Sign In Dropdown state & hover handlers
  const accountCloseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [quickLoginEmail, setQuickLoginEmail] = useState("");
  const [quickLoginPassword, setQuickLoginPassword] = useState("");
  const [quickShowPassword, setQuickShowPassword] = useState(false);
  const [quickRememberMe, setQuickRememberMe] = useState(false);
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [quickLoginLoading, setQuickLoginLoading] = useState(false);
  const [quickLoginError, setQuickLoginError] = useState<string | null>(null);

  const isAuthPage =
    Boolean(pathname?.startsWith("/login")) ||
    Boolean(pathname?.startsWith("/register"));

  useEffect(() => {
    setAccountDropdownOpen(false);
  }, [pathname]);

  const handleAccountMouseEnter = () => {
    // If the user is already on the login or register page, do not open dropdown on hover
    if (isAuthPage && !isLoggedIn) return;

    if (accountCloseTimerRef.current) {
      clearTimeout(accountCloseTimerRef.current);
      accountCloseTimerRef.current = null;
    }
    setAccountDropdownOpen(true);
  };

  const handleAccountMouseLeave = () => {
    if (accountCloseTimerRef.current) {
      clearTimeout(accountCloseTimerRef.current);
    }
    accountCloseTimerRef.current = setTimeout(() => {
      setAccountDropdownOpen(false);
    }, 250);
  };

  const handleQuickLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuickLoginError(null);

    const clean = quickLoginEmail.trim();
    if (!clean) {
      setQuickLoginError("Please enter your email or username");
      return;
    }
    if (!quickLoginPassword) {
      setQuickLoginError("Please enter your password");
      return;
    }

    setQuickLoginLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: clean, password: quickLoginPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setQuickLoginError(data.message || "Invalid credentials");
        setQuickLoginLoading(false);
        return;
      }

      if (data?.user) {
        loginUser({
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone || "+91 98765 43210",
          customerType: "Registered Customer",
          rewardPoints: 1250,
        });
        setAccountDropdownOpen(false);
        setQuickLoginPassword("");
        setQuickLoginError(null);
      }
    } catch {
      setQuickLoginError("Authentication error. Please try again.");
    } finally {
      setQuickLoginLoading(false);
    }
  };

  const cartTotal =
    cart && cart.length > 0
      ? cart.reduce(
          (sum, item) => sum + (item.product.price || 0) * item.quantity,
          0,
        )
      : 0;

  const totalCartCount =
    cart && cart.length > 0
      ? cart.reduce((sum, item) => sum + item.quantity, 0)
      : cartCount;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [hoveredCategorySlug, setHoveredCategorySlug] = useState<string | null>(null);
  const [flyoutTopOffset, setFlyoutTopOffset] = useState<number>(0);
  const activeCategory = POPUP_CATEGORIES.find((c) => c.slug === hoveredCategorySlug);

  // Dropdown hover & mobile accordion states
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [mobileAccountOpen, setMobileAccountOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const leftCategoryListRef = useRef<HTMLDivElement>(null);
  const mobileCategoryMenuRef = useRef<HTMLDivElement>(null);
  const mobileCategoryDropdownRef = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  const categoryCloseTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleCategoryMouseEnter = () => {
    if (categoryCloseTimerRef.current) {
      clearTimeout(categoryCloseTimerRef.current);
      categoryCloseTimerRef.current = null;
    }
    setCategoryDropdownOpen(true);
  };

  const handleCategoryMouseLeave = () => {
    if (categoryCloseTimerRef.current) {
      clearTimeout(categoryCloseTimerRef.current);
    }
    categoryCloseTimerRef.current = setTimeout(() => {
      setCategoryDropdownOpen(false);
      setHoveredCategorySlug(null);
    }, 150);
  };

  const handleRowMouseEnter = (
    slug: string,
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    setHoveredCategorySlug(slug);
    if (leftCategoryListRef.current) {
      const listRect = leftCategoryListRef.current.getBoundingClientRect();
      const rowRect = e.currentTarget.getBoundingClientRect();
      const relativeTop = rowRect.top - listRect.top;
      const maxOffset = Math.max(0, leftCategoryListRef.current.clientHeight - 200);
      setFlyoutTopOffset(Math.max(0, Math.min(relativeTop, maxOffset)));
    }
  };

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
      const isInsideMobileDropdown =
        mobileCategoryDropdownRef.current &&
        mobileCategoryDropdownRef.current.contains(event.target as Node);
      if (!isInsideDesktop && !isInsideMobile && !isInsideMobileDropdown) {
        if (categoryCloseTimerRef.current) clearTimeout(categoryCloseTimerRef.current);
        setCategoryDropdownOpen(false);
        setHoveredCategorySlug(null);
      }
    };
    const handleScroll = () => {
      setCategoryDropdownOpen(false);
      setHoveredCategorySlug(null);
      setSearchExpanded(false);
      setServicesDropdownOpen(false);
      setProductsDropdownOpen(false);
      setAccountDropdownOpen(false);
      setIsScrolled(window.scrollY > 10);
    };
    handleScroll();
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
      pathname.startsWith("/categories")
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
    <>
      {/* Top Header Announcement Bar Slider (Scrolls off naturally without jitter) */}
      <div className="bg-[#0A1128] text-white text-xs border-b border-slate-800 py-1.5 sm:py-2 px-3 sm:px-4 font-inter site-header">
        <div className="w-full px-1 sm:px-4 lg:px-6 xl:px-8 2xl:px-10 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-hidden w-full sm:w-auto justify-center sm:justify-start flex-1 min-w-0">
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
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shrink-0 ${
                        activeItem.badgeTag === "DELIVERY TIMELINES"
                          ? "bg-[#FFC20E] text-slate-950 font-black shadow-xs"
                          : isCritical
                            ? "bg-red-600 text-white animate-pulse"
                            : isHigh
                              ? "bg-emerald-500 text-white"
                              : isMedium
                                ? "bg-[#FFC20E] text-slate-950 font-black"
                                : "bg-[#FFC20E] text-slate-950 font-black"
                      }`}
                    >
                      {activeItem.badgeTag}
                    </span>

                    <div className="relative h-4 flex-1 min-w-0 max-w-3xl lg:max-w-4xl overflow-hidden flex items-center">
                      <Link
                        href={activeItem.link || "/offers"}
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

          <div className="hidden sm:flex items-center gap-4 text-[11px] text-slate-300 font-medium shrink-0">
            <a
              href="tel:+918709789641"
              className="hover:text-white flex items-center gap-1.5"
            >
              <Headset className="w-3.5 h-3.5 text-[#FFC20E]" />
              <span>+91 87097 89641</span>
            </a>
            <span className="text-slate-600">•</span>
            <button
              onClick={onOpenB2BModal}
              className="text-[#FFC20E] hover:text-amber-300 hover:underline font-bold transition-colors cursor-pointer"
            >
              B2B Institutional Sales
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TIER 1: Main Brand & Navigation Tier (White Bar) */}
      {/* Scrolls away on desktop so only the action bar sticks */}
      {/* ======================================================== */}
      <div
        className="w-full bg-white border-b border-slate-200/90 relative z-30 lg:z-50 sticky top-0 lg:relative font-inter site-header"
      >
        <div className="w-full px-3.5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-1.5 sm:py-3">
          {/* Mobile Top Header: [ Circular Hamburger ☰ ] [ Centered Logo ] [ Circular Cart with Badge 🛒 ] */}
          <div className="flex sm:hidden items-center justify-between">
            {/* Left: Circular Hamburger Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="w-9 h-9 rounded-full border border-slate-200/90 bg-white flex items-center justify-center text-slate-800 shadow-2xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-4.5 h-4.5 stroke-[2]" />
            </button>

            {/* Center: Brand Logo */}
            <Link href="/" className="shrink-0 flex items-center justify-center">
              <PrayogLogo size="sm" />
            </Link>

            {/* Right: Circular Cart Button with Floating Badge */}
            <button
              type="button"
              onClick={onOpenCart}
              className="relative w-9 h-9 rounded-full border border-slate-200/90 bg-white flex items-center justify-center text-slate-800 shadow-2xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
              aria-label="Shopping Cart"
            >
              <AddToCartIcon className="w-4.5 h-4.5 text-slate-800" />
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FFC20E] text-slate-950 text-[10px] font-black flex items-center justify-center shadow-xs">
                {totalCartCount}
              </span>
            </button>
          </div>

          {/* Tablet Header Row (hidden sm:flex lg:hidden) */}
          <div className="hidden sm:flex lg:hidden items-center justify-between gap-3 py-1">
            <Link href="/" className="shrink-0 flex items-center">
              <PrayogLogo size="sm" />
            </Link>

            {/* Tablet Search */}
            <div className="flex-1 max-w-sm relative flex items-center">
              <div className="flex items-center overflow-hidden border rounded-full bg-slate-50 w-full border-slate-300 pl-3 pr-1 py-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                    }
                  }}
                  placeholder="Search products..."
                  className="w-full bg-transparent border-none outline-none text-xs text-slate-800 placeholder-slate-400 font-medium pr-1"
                />
                <button
                  onClick={() => {
                    if (searchQuery.trim()) {
                      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                    }
                  }}
                  className="bg-[#FFC20E] hover:bg-[#E5AC0D] text-slate-950 w-7 h-7 rounded-full flex items-center justify-center shrink-0 cursor-pointer shadow-xs transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/walk-in"
                className="bg-[#FFC20E] hover:bg-[#E5AC0D] text-slate-950 text-[10px] font-black uppercase px-2.5 py-1.5 rounded-full flex items-center gap-1 shrink-0 shadow-xs transition-colors"
              >
                <MapPin className="w-3 h-3 stroke-[2.5]" />
                <span>Stores</span>
              </Link>

              <Link
                href="/wishlist"
                className="relative p-1.5 text-slate-700 hover:text-[#2563EB]"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5 stroke-[1.8]" />
                {wishlistCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-[#FFC20E] text-slate-900 font-black text-[10px] rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <button
                onClick={onOpenCart}
                className="relative p-1.5 text-slate-700 hover:text-[#2563EB] cursor-pointer"
                aria-label="Cart"
              >
                <AddToCartIcon className="w-5 h-5 text-slate-700 hover:text-[#2563EB]" />
                {totalCartCount > 0 && (
                  <span className="absolute top-0 right-0 w-4.5 h-4.5 bg-[#FFC20E] text-slate-950 font-black text-[10px] rounded-full flex items-center justify-center shadow-xs">
                    {totalCartCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-1.5 text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                aria-label="Toggle Menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Desktop Top Header Tier 1 (hidden lg:flex) */}
          <div className="hidden lg:flex items-center justify-between gap-1.5 xl:gap-3 py-1.5 xl:py-2 w-full max-w-full">
            {/* 1. Left: Brand Logo */}
            <Link href="/" className="shrink-0 flex items-center min-w-0">
              <PrayogLogo size="md" />
            </Link>

            {/* 2. Center: Primary Horizontal Navigation Links */}
            <nav className="flex items-center gap-0.5 xl:gap-1 2xl:gap-1.5 text-[10px] xl:text-[11.5px] 2xl:text-[12.5px] text-slate-700 tracking-wide font-bold whitespace-nowrap uppercase min-w-0">
              {/* 1. Home */}
              <Link
                href="/"
                className={`px-2 xl:px-3 py-1 xl:py-1.5 rounded-full transition-all ${
                  pathname === "/"
                    ? "bg-[#FFC20E] text-slate-950 font-black shadow-xs"
                    : "text-slate-700 hover:text-slate-950 hover:bg-slate-100"
                }`}
              >
                HOME
              </Link>

              {/* 2. Products & Hardware */}
              <div className="relative group py-1.5">
                <Link
                  href="/products"
                  className={`px-1 xl:px-1.5 2xl:px-2 py-1 xl:py-1.5 rounded-lg transition-colors inline-block ${
                    pathname?.startsWith("/products")
                      ? "text-[#2563EB] font-black bg-[#EFF6FF]"
                      : "text-slate-700 hover:text-[#2563EB] hover:bg-slate-50"
                  }`}
                >
                  <span>PRODUCTS &amp; HARDWARE</span>
                </Link>

                {/* Dropdown */}
                <div className="absolute top-full left-0 pt-1.5 opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-150 ease-out z-50">
                  <div className="w-64 bg-white rounded-xl shadow-xl border border-slate-200/90 p-1.5 space-y-0.5 text-xs font-semibold text-slate-700 normal-case">
                    <Link
                      href="/categories/arduino-development-boards"
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors group/sub"
                    >
                      <span>Arduino &amp; Dev Boards</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover/sub:text-[#2563EB] group-hover/sub:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                    <Link
                      href="/categories/raspberry-pi"
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors group/sub"
                    >
                      <span>Raspberry Pi &amp; SBCs</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover/sub:text-[#2563EB] group-hover/sub:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                    <Link
                      href="/categories/robotics"
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors group/sub"
                    >
                      <span>Robotics &amp; DIY Kits</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover/sub:text-[#2563EB] group-hover/sub:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                    <Link
                      href="/categories/sensors-modules"
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors group/sub"
                    >
                      <span>Sensors &amp; Modules</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover/sub:text-[#2563EB] group-hover/sub:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                    <Link
                      href="/categories/motors-drivers"
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors group/sub"
                    >
                      <span>Motors &amp; Motor Drivers</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover/sub:text-[#2563EB] group-hover/sub:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                    <Link
                      href="/categories/drone-technology"
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors group/sub"
                    >
                      <span>Drones &amp; UAV Parts</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover/sub:text-[#2563EB] group-hover/sub:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                    <Link
                      href="/categories/batteries-power"
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors group/sub"
                    >
                      <span>Batteries &amp; Power Hubs</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover/sub:text-[#2563EB] group-hover/sub:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                    <Link
                      href="/categories/electronic-components"
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors group/sub"
                    >
                      <span>Electronic Components</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover/sub:text-[#2563EB] group-hover/sub:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                    <div className="border-t border-slate-100 my-1 pt-0.5" />
                    <Link
                      href="/products"
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-[#2563EB] hover:bg-[#EFF6FF] font-bold transition-colors"
                    >
                      <span>View All Products →</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* 3. Categories */}
              <div className="relative group py-1.5">
                <Link
                  href="/categories"
                  className={`px-1 xl:px-1.5 2xl:px-2 py-1 xl:py-1.5 rounded-lg transition-colors inline-block ${
                    pathname?.startsWith("/categories")
                      ? "text-[#2563EB] font-black bg-[#EFF6FF]"
                      : "text-slate-700 hover:text-[#2563EB] hover:bg-slate-50"
                  }`}
                >
                  <span>CATEGORIES</span>
                </Link>

                {/* Dropdown */}
                <div className="absolute top-full left-0 pt-1.5 opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-150 ease-out z-50">
                  <div className="w-64 bg-white rounded-xl shadow-xl border border-slate-200/90 p-1.5 space-y-0.5 text-xs font-semibold text-slate-700 normal-case">
                    <Link
                      href="/categories/arduino-development-boards"
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors group/sub"
                    >
                      <span>Arduino &amp; Dev Boards</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover/sub:text-[#2563EB] group-hover/sub:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                    <Link
                      href="/categories/raspberry-pi"
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors group/sub"
                    >
                      <span>Raspberry Pi</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover/sub:text-[#2563EB] group-hover/sub:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                    <Link
                      href="/categories/robotics"
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors group/sub"
                    >
                      <span>Robotics</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover/sub:text-[#2563EB] group-hover/sub:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                    <Link
                      href="/categories/sensors-modules"
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors group/sub"
                    >
                      <span>Sensors &amp; Modules</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover/sub:text-[#2563EB] group-hover/sub:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                    <Link
                      href="/categories/motors-drivers"
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors group/sub"
                    >
                      <span>Motors &amp; Motor Drivers</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover/sub:text-[#2563EB] group-hover/sub:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                    <Link
                      href="/categories/electronic-components"
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors group/sub"
                    >
                      <span>Electronic Components</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover/sub:text-[#2563EB] group-hover/sub:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                    <Link
                      href="/categories/iot-wireless"
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors group/sub"
                    >
                      <span>IoT &amp; Wireless</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover/sub:text-[#2563EB] group-hover/sub:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                    <Link
                      href="/categories/batteries-power"
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors group/sub"
                    >
                      <span>Batteries &amp; Power</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover/sub:text-[#2563EB] group-hover/sub:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                    <div className="border-t border-slate-100 my-1 pt-0.5" />
                    <Link
                      href="/categories"
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-[#2563EB] hover:bg-[#EFF6FF] font-bold transition-colors"
                    >
                      <span>View All 20 Categories →</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* 5. Top Deals (Yellow highlighted as in reference design) */}
              <div className="relative group py-1.5">
                <Link
                  href="/offers"
                  className={`px-1 xl:px-1.5 2xl:px-2 py-1 xl:py-1.5 rounded-lg transition-colors font-black inline-block text-[#FFC20E] hover:text-amber-500 hover:bg-amber-50/70 ${
                    pathname?.startsWith("/offers")
                      ? "bg-amber-50 text-amber-600"
                      : ""
                  }`}
                >
                  <span>TOP DEALS</span>
                </Link>

                {/* Dropdown */}
                <div className="absolute top-full left-0 pt-1.5 opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-150 ease-out z-50">
                  <div className="w-56 bg-white rounded-xl shadow-xl border border-red-100 p-1.5 space-y-0.5 text-xs font-semibold text-slate-700 normal-case">
                    <Link
                      href="/offers"
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-red-50 hover:text-[#FF3B30] transition-colors group/sub"
                    >
                      <span>Lightning Deals (&lt; ₹999)</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover/sub:text-[#FF3B30] group-hover/sub:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                    <Link
                      href="/offers"
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-red-50 hover:text-[#FF3B30] transition-colors group/sub"
                    >
                      <span>Robotics Kit Bundles</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover/sub:text-[#FF3B30] group-hover/sub:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                    <Link
                      href="/offers"
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-red-50 hover:text-[#FF3B30] transition-colors group/sub"
                    >
                      <span>Drone Parts Offers</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover/sub:text-[#FF3B30] group-hover/sub:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                    <Link
                      href="/offers"
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-red-50 hover:text-[#FF3B30] transition-colors group/sub"
                    >
                      <span>Clearance Sale</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover/sub:text-[#FF3B30] group-hover/sub:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                    <div className="border-t border-slate-100 my-1 pt-0.5" />
                    <Link
                      href="/offers"
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-[#FF3B30] hover:bg-red-50 font-bold transition-colors"
                    >
                      <span>View All Deals →</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* 6. Lab Setups & Services */}
              <div className="relative group py-1.5">
                <Link
                  href="/services"
                  className={`px-1 xl:px-1.5 2xl:px-2 py-1 xl:py-1.5 rounded-lg transition-colors inline-block ${
                    pathname?.startsWith("/services")
                      ? "text-[#2563EB] font-black bg-[#EFF6FF]"
                      : "text-slate-700 hover:text-[#2563EB] hover:bg-slate-50"
                  }`}
                >
                  <span>LAB SETUPS &amp; SERVICES</span>
                </Link>

                {/* Dropdown */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-1.5 opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-150 ease-out z-50">
                  <div className="w-64 bg-white rounded-xl shadow-xl border border-slate-200/90 p-1.5 space-y-0.5 text-xs font-semibold text-slate-700 normal-case">
                    <Link
                      href="/services/stem-lab-setup"
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors group/sub"
                    >
                      <span>STEM &amp; ATL Lab Setup</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover/sub:text-[#2563EB] group-hover/sub:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                    <Link
                      href="/services/robotics-lab-setup"
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors group/sub"
                    >
                      <span>Robotics &amp; AI Research Lab</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover/sub:text-[#2563EB] group-hover/sub:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                    <Link
                      href="/services/drone-lab-setup"
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors group/sub"
                    >
                      <span>Drone &amp; Avionics Center</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover/sub:text-[#2563EB] group-hover/sub:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                    <Link
                      href="/services/industrial-projects"
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors group/sub"
                    >
                      <span>Industrial Prototyping &amp; R&amp;D</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover/sub:text-[#2563EB] group-hover/sub:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                    <div className="border-t border-slate-100 my-1 pt-0.5" />
                    <button
                      type="button"
                      onClick={() => onOpenB2BModal?.()}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[#2563EB] hover:bg-[#EFF6FF] font-bold transition-colors cursor-pointer text-left"
                    >
                      <span>B2B Institutional Sales →</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 7. Learning Hub */}
              <div className="relative group py-1.5">
                <Link
                  href="/learning"
                  className={`px-1 xl:px-1.5 2xl:px-2 py-1 xl:py-1.5 rounded-lg transition-colors inline-block ${
                    pathname?.startsWith("/learning")
                      ? "text-[#2563EB] font-black bg-[#EFF6FF]"
                      : "text-slate-700 hover:text-[#2563EB] hover:bg-slate-50"
                  }`}
                >
                  <span>LEARNING HUB</span>
                </Link>

                {/* Dropdown */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-1.5 opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-150 ease-out z-50">
                  <div className="w-60 bg-white rounded-xl shadow-xl border border-slate-200/90 p-1.5 space-y-0.5 text-xs font-semibold text-slate-700 normal-case">
                    <Link
                      href="/learning"
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors group/sub"
                    >
                      <span>Step-by-Step Tutorials</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover/sub:text-[#2563EB] group-hover/sub:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                    <Link
                      href="/learning"
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors group/sub"
                    >
                      <span>Project Codes &amp; Sketches</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover/sub:text-[#2563EB] group-hover/sub:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                    <Link
                      href="/learning"
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors group/sub"
                    >
                      <span>Robotics Masterclasses</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover/sub:text-[#2563EB] group-hover/sub:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* 8. About */}
              <div className="relative group py-1.5">
                <Link
                  href="/about"
                  className={`px-1 xl:px-1.5 2xl:px-2 py-1 xl:py-1.5 rounded-lg transition-colors inline-block ${
                    pathname?.startsWith("/about") || pathname?.startsWith("/careers")
                      ? "text-[#2563EB] font-black bg-[#EFF6FF]"
                      : "text-slate-700 hover:text-[#2563EB] hover:bg-slate-50"
                  }`}
                >
                  <span>ABOUT</span>
                </Link>

                {/* Dropdown */}
                <div className="absolute top-full right-0 pt-1.5 opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-150 ease-out z-50">
                  <div className="w-52 bg-white rounded-xl shadow-xl border border-slate-200/90 p-1.5 space-y-0.5 text-xs font-semibold text-slate-700 normal-case">
                    <Link
                      href="/about"
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors group/sub"
                    >
                      <span>About Our Mission</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover/sub:text-[#2563EB] group-hover/sub:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                    <Link
                      href="/careers"
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors group/sub"
                    >
                      <span>Careers &amp; Culture</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover/sub:text-[#2563EB] group-hover/sub:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* 9. Contact */}
              <div className="relative group py-1.5">
                <Link
                  href="/contact"
                  className={`px-1 xl:px-1.5 2xl:px-2 py-1 xl:py-1.5 rounded-lg transition-colors inline-block ${
                    pathname?.startsWith("/contact")
                      ? "text-[#2563EB] font-black bg-[#EFF6FF]"
                      : "text-slate-700 hover:text-[#2563EB] hover:bg-slate-50"
                  }`}
                >
                  <span>CONTACT</span>
                </Link>

                {/* Dropdown */}
                <div className="absolute top-full right-0 pt-1.5 opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-150 ease-out z-50">
                  <div className="w-56 bg-white rounded-xl shadow-xl border border-slate-200/90 p-1.5 space-y-0.5 text-xs font-semibold text-slate-700 normal-case">
                    <Link
                      href="/contact"
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors group/sub"
                    >
                      <span>Customer Support Desk</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover/sub:text-[#2563EB] group-hover/sub:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                    <a
                      href="https://wa.me/918709789641"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-colors group/sub"
                    >
                      <span>WhatsApp Support</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover/sub:text-emerald-600 group-hover/sub:translate-x-0.5 transition-all shrink-0" />
                    </a>
                    <button
                      type="button"
                      onClick={() => onOpenB2BModal?.()}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-amber-50 hover:text-amber-700 transition-colors group/sub text-left cursor-pointer"
                    >
                      <span>B2B &amp; Bulk Orders</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover/sub:text-amber-600 group-hover/sub:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  </div>
                </div>
              </div>
            </nav>

            {/* 3. Right: Store Location Button + Wishlist + User Avatar */}
            <div className="flex items-center gap-1.5 xl:gap-2.5 shrink-0">
              {/* Store Location Button */}
              <Link
                href="/walk-in"
                className="bg-[#FFC20E] hover:bg-[#E5AC0D] text-slate-950 text-[10px] xl:text-[11px] font-black uppercase tracking-wider px-3 xl:px-4 py-1.5 xl:py-2 rounded-full flex items-center gap-1 shadow-sm hover:shadow-md transition-all active:scale-95 whitespace-nowrap"
              >
                <MapPin className="w-3 h-3 xl:w-3.5 xl:h-3.5 text-slate-950 stroke-[2.5]" />
                <span className="hidden sm:inline">STORE LOCATION</span>
                <span className="sm:hidden">STORES</span>
              </Link>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="relative p-1.5 xl:p-2 text-slate-700 hover:text-[#2563EB] transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="w-4 h-4 xl:w-5 xl:h-5 stroke-[1.8]" />
                {wishlistCount > 0 && (
                  <span className="absolute top-0 right-0 min-w-[15px] h-3.5 xl:h-4 bg-[#FFC20E] text-slate-950 font-black text-[9px] xl:text-[10px] rounded-full flex items-center justify-center px-1">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* User Avatar Circle Button with Hover Dropdown */}
              <div
                ref={accountMenuRef}
                onMouseEnter={isAuthPage && !isLoggedIn ? undefined : handleAccountMouseEnter}
                onMouseLeave={isAuthPage && !isLoggedIn ? undefined : handleAccountMouseLeave}
                className="relative z-50 py-1"
              >
                <button
                  onClick={() => {
                    setAccountDropdownOpen(false);
                    router.push(isLoggedIn ? "/account" : "/login");
                  }}
                  className="w-8 h-8 xl:w-9 xl:h-9 rounded-full bg-[#0A233F] hover:bg-[#12365D] text-white flex items-center justify-center cursor-pointer transition-colors shadow-xs"
                  aria-label="Account Menu"
                >
                  {isLoggedIn && user ? (
                    user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-black">
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
                    )
                  ) : (
                    <User className="w-4 h-4 xl:w-5 xl:h-5 stroke-[2]" />
                  )}
                </button>

                {/* Account Dropdown Menu */}
                {accountDropdownOpen && !(isAuthPage && !isLoggedIn) && (
                  <div
                    onMouseEnter={handleAccountMouseEnter}
                    onMouseLeave={handleAccountMouseLeave}
                    className="absolute right-0 top-full pt-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs text-slate-700"
                  >
                    <div className="w-[330px] sm:w-[350px] bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-4 sm:p-5 text-slate-900">
                      {isLoggedIn && user ? (
                        <div className="space-y-1">
                          <div className="px-2 py-2 flex items-center gap-3 border-b border-slate-100 pb-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-[#0A233F] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
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
                              <div className="text-sm font-bold text-slate-900 truncate">
                                {user.name || "Om Kumar"}
                              </div>
                              <div className="text-[11px] text-slate-400 truncate">
                                {user.email || "user@prayogindia.com"}
                              </div>
                              <div className="mt-1 inline-flex items-center gap-1.5 text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded-md border border-amber-200/80">
                                <Coins className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>{user.rewardPoints || 0} Reward Points</span>
                              </div>
                            </div>
                          </div>

                          <Link
                            href="/account/profile"
                            onClick={() => setAccountDropdownOpen(false)}
                            className="w-full text-left px-3 py-2 hover:bg-slate-50 hover:text-[#2563EB] rounded-xl transition-colors flex items-center gap-2.5 font-medium text-slate-700 group"
                          >
                            <User className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB]" />
                            <span>My Account</span>
                          </Link>

                          <Link
                            href="/account/orders"
                            onClick={() => setAccountDropdownOpen(false)}
                            className="w-full text-left px-3 py-2 hover:bg-slate-50 hover:text-[#2563EB] rounded-xl transition-colors flex items-center gap-2.5 font-medium text-slate-700 group"
                          >
                            <Package className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB]" />
                            <span>My Orders</span>
                          </Link>

                          <Link
                            href="/wishlist"
                            onClick={() => setAccountDropdownOpen(false)}
                            className="w-full text-left px-3 py-2 hover:bg-slate-50 hover:text-[#2563EB] rounded-xl transition-colors flex items-center justify-between font-medium text-slate-700 group"
                          >
                            <div className="flex items-center gap-2.5">
                              <Heart className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB]" />
                              <span>Wishlist</span>
                            </div>
                            {wishlistCount > 0 && (
                              <span className="text-[10px] bg-rose-50 text-rose-600 font-bold px-1.5 py-0.5 rounded-full">
                                {wishlistCount}
                              </span>
                            )}
                          </Link>

                          <Link
                            href="/track-order"
                            onClick={() => setAccountDropdownOpen(false)}
                            className="w-full text-left px-3 py-2 hover:bg-slate-50 hover:text-[#2563EB] rounded-xl transition-colors flex items-center gap-2.5 font-medium text-slate-700 group"
                          >
                            <Truck className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB]" />
                            <span>Track Order</span>
                          </Link>

                          <button
                            type="button"
                            onClick={() => {
                              setAccountDropdownOpen(false);
                              if (onOpenB2BModal) {
                                onOpenB2BModal();
                              } else {
                                router.push("/account/quotations");
                              }
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-slate-50 hover:text-[#2563EB] rounded-xl transition-colors flex items-center gap-2.5 font-medium text-slate-700 cursor-pointer group"
                          >
                            <Building2 className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB]" />
                            <span>B2B / Institutional Sales</span>
                          </button>

                          <div className="border-t border-slate-100 my-1 pt-1" />

                          <button
                            type="button"
                            onClick={() => {
                              logoutUser();
                              setAccountDropdownOpen(false);
                              router.push("/login");
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 rounded-xl transition-colors flex items-center gap-2.5 font-semibold cursor-pointer group"
                          >
                            <LogOut className="w-4 h-4 text-red-500" />
                            <span>Logout</span>
                          </button>
                        </div>
                      ) : (
                        /* ── Guest Quick Sign In Form (Matches Reference Screenshot) ── */
                        <div className="space-y-4">
                          {/* Header: Sign in on Left, Create an Account on Right */}
                          <div className="flex items-baseline justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                              Sign in
                            </h3>
                            <Link
                              href="/register"
                              onClick={() => setAccountDropdownOpen(false)}
                              className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] hover:underline transition-colors"
                            >
                              Create an Account
                            </Link>
                          </div>

                          {quickLoginError && (
                            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-1.5 animate-in fade-in">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                              <span>{quickLoginError}</span>
                            </div>
                          )}

                          <form onSubmit={handleQuickLogin} className="space-y-3.5">
                            {/* Username or Email Address */}
                            <div className="space-y-1.5 text-left">
                              <label className="block text-xs font-medium text-slate-800">
                                Username or email address <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                value={quickLoginEmail}
                                onChange={(e) => setQuickLoginEmail(e.target.value)}
                                placeholder="Enter your email or username"
                                className="w-full bg-white text-slate-900 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 hover:border-slate-300 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all font-medium placeholder:text-slate-400"
                              />
                            </div>

                            {/* Password with Eye Toggle */}
                            <div className="space-y-1.5 text-left">
                              <label className="block text-xs font-medium text-slate-800">
                                Password <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <input
                                  type={quickShowPassword ? "text" : "password"}
                                  required
                                  value={quickLoginPassword}
                                  onChange={(e) => setQuickLoginPassword(e.target.value)}
                                  placeholder="Enter your password"
                                  className="w-full bg-white text-slate-900 pl-3.5 pr-10 py-2.5 text-xs rounded-xl border border-slate-200 hover:border-slate-300 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all font-medium placeholder:text-slate-400"
                                />
                                <button
                                  type="button"
                                  onClick={() => setQuickShowPassword(!quickShowPassword)}
                                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                                  aria-label="Toggle password visibility"
                                >
                                  {quickShowPassword ? (
                                    <EyeOff className="w-4 h-4" />
                                  ) : (
                                    <Eye className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* reCAPTCHA Box (Matches Reference Screenshot) */}
                            <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-700 text-xs">
                              <label className="flex items-center gap-2.5 cursor-pointer select-none font-medium">
                                <input
                                  type="checkbox"
                                  checked={captchaChecked}
                                  onChange={(e) => setCaptchaChecked(e.target.checked)}
                                  className="w-4 h-4 rounded border-slate-300 text-[#0A1128] focus:ring-0 cursor-pointer"
                                />
                                <span className="text-xs">I&apos;m not a robot</span>
                              </label>
                              <div className="flex flex-col items-center leading-none text-[8px] text-slate-400 select-none">
                                <svg className="w-5 h-5 text-blue-500 mb-0.5" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-4a1 1 0 0 1-2 0V7a1 1 0 0 1 2 0z"/>
                                </svg>
                                <span>reCAPTCHA</span>
                              </div>
                            </div>

                            {/* LOG IN Button (Styled in Prayog Deep Navy #0A1128 theme) */}
                            <button
                              type="submit"
                              disabled={quickLoginLoading}
                              className="w-full bg-[#0A1128] hover:bg-slate-900 active:scale-[0.98] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-slate-950/20 flex items-center justify-center cursor-pointer disabled:opacity-50"
                            >
                              {quickLoginLoading ? "Signing In..." : "LOG IN"}
                            </button>

                            {/* Remember me + Lost your password? */}
                            <div className="flex items-center justify-between pt-0.5 text-xs text-slate-600">
                              <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={quickRememberMe}
                                  onChange={(e) => setQuickRememberMe(e.target.checked)}
                                  className="w-3.5 h-3.5 rounded border-slate-300 text-[#0A1128] focus:ring-0 cursor-pointer"
                                />
                                <span>Remember me</span>
                              </label>

                              <Link
                                href="/forgot-password"
                                onClick={() => setAccountDropdownOpen(false)}
                                className="font-medium text-[#2563EB] hover:text-[#1D4ED8] hover:underline transition-colors"
                              >
                                Lost your password?
                              </Link>
                            </div>
                          </form>

                          {/* Secondary Links: Track Order & B2B / Institutional Sales */}
                          <div className="border-t border-slate-100 pt-2 space-y-1 text-left">
                            <Link
                              href="/track-order"
                              onClick={() => setAccountDropdownOpen(false)}
                              className="w-full px-3 py-2.5 hover:bg-slate-50 hover:text-[#2563EB] rounded-xl transition-colors flex items-center gap-2.5 font-medium text-slate-700"
                            >
                              <Truck className="w-4 h-4 text-slate-500" />
                              <span>Track Order</span>
                            </Link>

                            <button
                              type="button"
                              onClick={() => {
                                setAccountDropdownOpen(false);
                                if (onOpenB2BModal) {
                                  onOpenB2BModal();
                                } else {
                                  router.push("/services");
                                }
                              }}
                              className="w-full text-left px-3 py-2.5 hover:bg-slate-50 hover:text-[#2563EB] rounded-xl transition-colors flex items-center gap-2.5 font-medium text-slate-700 cursor-pointer"
                            >
                              <Building2 className="w-4 h-4 text-slate-500" />
                              <span>B2B / Institutional Sales</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ======================================================== */}
      {/* TIER 2: Sticky Action Header (Sky Blue Banner with Category Tab, Search & Cart) */}
      {/* Only this bar sticks to the top head when scrolling down */}
      {/* ======================================================== */}
      <header
        style={{ position: "sticky", top: 0 }}
        className={`sticky top-0 z-40 bg-[#D4E4F7] border-b border-slate-300/80 transition-shadow duration-200 font-inter site-header ${
          isScrolled ? "shadow-md shadow-slate-900/10" : "border-t border-slate-200/60"
        } w-full`}
      >
        {/* SECTION 1.5: Mobile Search Tier (Sky Blue Banner: Profile + Search Bar) */}
        <div className="bg-[#D4E4F7] block sm:hidden relative z-20 w-full px-3.5 py-1.5">
        <div className="flex items-center gap-2 w-full">
          {/* Circular Navy Profile Button */}
          <Link
            href={isLoggedIn ? "/account" : "/login"}
            className="w-9 h-9 rounded-full bg-[#0A233F] hover:bg-[#12365D] text-white flex items-center justify-center shrink-0 shadow-xs active:scale-95 transition-all cursor-pointer"
            aria-label="User Account"
          >
            <User className="w-4.5 h-4.5 stroke-[2]" />
          </Link>

          {/* Full-Width White Pill Search Bar with Navy Search Button */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
              }
            }}
            className="flex-1 flex items-center bg-white rounded-full shadow-xs border border-slate-200/50 overflow-hidden pl-3.5 pr-0 h-9"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products"
              className="w-full bg-transparent border-none outline-none text-xs text-slate-800 placeholder-slate-400 font-medium pr-1.5"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="p-1 text-slate-400 hover:text-slate-600 mr-1 cursor-pointer"
                aria-label="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              className="h-9 px-3.5 bg-[#FFC20E] hover:bg-[#E5AC0D] text-slate-950 flex items-center justify-center shrink-0 rounded-r-full active:scale-95 transition-all cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 2: Desktop Bottom Tier (Sky Blue Banner with Category Tab, Search & Cart) */}
      {/* ======================================================== */}
      <div className="hidden lg:block relative z-30 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-2 flex items-center justify-between gap-4">
          {/* 1. Left: BROWSE CATEGORIES Tab Button */}
          <div
            ref={categoryMenuRef}
            className="relative shrink-0"
            onMouseEnter={handleCategoryMouseEnter}
            onMouseLeave={handleCategoryMouseLeave}
          >
            <button
              type="button"
              onClick={() => {
                if (categoryDropdownOpen) {
                  setCategoryDropdownOpen(false);
                  setHoveredCategorySlug(null);
                } else {
                  setCategoryDropdownOpen(true);
                }
              }}
              className="flex items-center gap-2.5 px-5 py-2.5 bg-[#0A233F] hover:bg-[#12365D] text-white rounded-full font-bold text-xs uppercase tracking-wider shadow-xs cursor-pointer transition-all active:scale-95"
            >
              <Menu className="w-4 h-4" />
              <span>BROWSE CATEGORIES</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  categoryDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Cascading Categories Flyout Mega-Menu */}
            {categoryDropdownOpen && (
              <div className="absolute top-full left-0 pt-2 z-50 flex items-start select-none">
                {/* 1. Left Categories List Column */}
                <div
                  ref={leftCategoryListRef}
                  className="w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 divide-y divide-slate-100 max-h-[500px] overflow-y-auto"
                >
                  {POPUP_CATEGORIES.map((cat) => {
                    const isHovered = hoveredCategorySlug === cat.slug;
                    const hasSubs = cat.subcategories && cat.subcategories.length > 0;
                    return (
                      <div
                        key={cat.slug}
                        onMouseEnter={(e) => handleRowMouseEnter(cat.slug, e)}
                        className={`group transition-colors ${
                          isHovered ? "bg-slate-50" : "hover:bg-slate-50"
                        }`}
                      >
                        <Link
                          href={cat.href}
                          onClick={() => {
                            setCategoryDropdownOpen(false);
                            setHoveredCategorySlug(null);
                          }}
                          className="flex items-center justify-between px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors"
                        >
                          <span
                            className={`truncate ${
                              isHovered
                                ? "text-[#0A233F]"
                                : "text-slate-800 group-hover:text-[#0A233F]"
                            }`}
                          >
                            {cat.name}
                          </span>
                          {hasSubs && (
                            <ChevronRight
                              className={`w-3.5 h-3.5 shrink-0 transition-all ${
                                isHovered
                                  ? "text-[#0A233F] translate-x-0.5"
                                  : "text-slate-400 group-hover:text-[#0A233F]"
                              }`}
                            />
                          )}
                        </Link>
                      </div>
                    );
                  })}

                  {/* Bottom View All Link */}
                  <div className="p-3 bg-slate-50/80 border-t border-slate-100 text-center sticky bottom-0 backdrop-blur-xs">
                    <Link
                      href="/categories"
                      onClick={() => {
                        setCategoryDropdownOpen(false);
                        setHoveredCategorySlug(null);
                      }}
                      className="text-[11px] font-black uppercase tracking-wider text-[#2563EB] hover:text-[#0A233F] transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>VIEW ALL 20 CATEGORIES</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* 2. Right Subcategories Flyout Popup Panel */}
                {hoveredCategorySlug && activeCategory && activeCategory.subcategories && activeCategory.subcategories.length > 0 && (
                  <div
                    style={{ top: `${flyoutTopOffset}px` }}
                    className="absolute left-full ml-1 w-64 sm:w-72 bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-2.5 z-50 animate-in fade-in slide-in-from-left-1 duration-150 before:absolute before:-left-3 before:top-0 before:w-4 before:h-full before:content-['']"
                  >
                    <div className="space-y-0.5">
                      {activeCategory.subcategories.map((sub) => (
                        <Link
                          key={sub.slug}
                          href={`/categories/${activeCategory.slug}/${sub.slug}`}
                          onClick={() => {
                            setCategoryDropdownOpen(false);
                            setHoveredCategorySlug(null);
                          }}
                          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide text-slate-700 hover:text-[#0A233F] hover:bg-slate-100 transition-colors group/sub"
                        >
                          <span className="truncate">{sub.name}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover/sub:text-[#0A233F] group-hover/sub:translate-x-0.5 transition-all shrink-0" />
                        </Link>
                      ))}
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100">
                      <Link
                        href={activeCategory.href}
                        onClick={() => {
                          setCategoryDropdownOpen(false);
                          setHoveredCategorySlug(null);
                        }}
                        className="flex items-center justify-between px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider text-[#2563EB] hover:text-[#0A233F] hover:bg-blue-50/60 transition-colors group/all"
                      >
                        <span>VIEW ALL {activeCategory.shortName || activeCategory.name}</span>
                        <ArrowRight className="w-3 h-3 group-hover/all:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. Center: Wide Pill Search Bar */}
          <div
            ref={searchContainerRef}
            className="flex-1 max-w-2xl relative flex items-center"
          >
            <div className="flex items-center overflow-hidden rounded-full bg-white shadow-xs w-full pl-5 pr-1 py-1 border border-slate-200/50 focus-within:ring-2 focus-within:ring-[#0A233F]/20 transition-all">
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
                placeholder="Search for products"
                className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-slate-800 placeholder-slate-400 font-medium pr-2"
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
                className="bg-[#FFC20E] hover:bg-[#E5AC0D] text-slate-950 w-8.5 h-8.5 rounded-full flex items-center justify-center shrink-0 shadow-xs active:scale-95 cursor-pointer transition-all"
                aria-label="Search"
              >
                <Search className="w-4 h-4 stroke-[2.5]" />
              </button>
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
                            className="p-2 hover:bg-[#EFF6FF] rounded-xl flex items-center justify-between cursor-pointer transition-colors"
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
                        className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
                      >
                        View all search results →
                      </button>
                    </div>
                  </div>
                );
              })()}
          </div>

          {/* 3. Right: Helpline & Cart */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Helpline Link */}
            <a
              href="tel:+918709789641"
              className="flex items-center gap-2 text-slate-700 hover:text-[#2563EB] transition-colors"
            >
              <Headset className="w-4 h-4 text-[#0A233F] shrink-0" />
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">
                  Helpline:
                </span>
                <span className="text-xs sm:text-[13px] font-black text-[#0A233F] tracking-tight">
                  +91 87097 89641
                </span>
              </div>
            </a>

            {/* Cart Button Pill */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2.5 px-4 py-2 bg-[#0A233F] hover:bg-[#12365D] text-white rounded-full font-black text-xs shadow-xs cursor-pointer active:scale-95 transition-all shrink-0"
              aria-label="Shopping Cart"
            >
              <AddToCartIcon className="w-4.5 h-4.5 text-white shrink-0" />
              <span className="text-white text-xs font-extrabold tracking-wide">
                ₹{cartTotal.toFixed(2)}
              </span>
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 bg-[#FFC20E] text-slate-950 font-black text-[11px] rounded-full flex items-center justify-center px-1 shadow-xs">
                {totalCartCount}
              </span>
            </button>
          </div>
        </div>
      </div>




    </header>

    {/* ======================================================== */}
    {/* Section 3 Modern Mobile Responsive Navigation Drawer */}
    {/* ======================================================== */}
    <MobileMenuDrawer
      isOpen={mobileMenuOpen}
      onClose={() => setMobileMenuOpen(false)}
      cartCount={cartCount}
      wishlistCount={wishlistCount}
      onOpenCart={onOpenCart}
      onOpenWishlist={onOpenWishlist}
      onOpenB2BModal={onOpenB2BModal}
      user={user}
      isLoggedIn={isLoggedIn}
      onLogout={logoutUser}
    />
    </>
  );
};
