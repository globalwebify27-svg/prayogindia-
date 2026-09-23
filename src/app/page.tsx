"use client";

import React, { useState } from "react";
import { Header, TabType } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { StatsSection } from "@/components/StatsSection";

// Phase 1 Component Imports
import { ShopByCategory } from "@/components/home/ShopByCategory";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { ProductGridSection } from "@/components/ProductGridSection";
import { DealsAndOffersSection } from "@/components/home/DealsAndOffersSection";
import { RoboticsCollectionShowcase } from "@/components/home/RoboticsCollectionShowcase";
import { WhyChoosePrayog } from "@/components/home/WhyChoosePrayog";
import { BrandPartners } from "@/components/home/BrandPartners";
import { KnowledgeCenterSection } from "@/components/home/KnowledgeCenterSection";

import {
  IndustriesSection,
  LearningHubSection,
  B2BSection,
  TestimonialsSection,
} from "@/components/AdditionalSections";
import {
  AboutSection,
  ServicesSection,
  ContactSection,
  CareersSection,
} from "@/components/CompanySections";
import { FooterSection } from "@/components/FooterSection";
import { QuickViewModal, B2BModal } from "@/components/Modals";
import { PRODUCTS, Product } from "@/data/mockData";
import { useStore } from "@/context/StoreContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<
    string | null
  >(null);

  // State for Modals
  const {
    cart,
    wishlist,
    addToCart: storeAddToCart,
    toggleWishlist: storeToggleWishlist,
  } = useStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [b2bOpen, setB2bOpen] = useState(false);
  const [selectedQuickView, setSelectedQuickView] = useState<Product | null>(
    null,
  );

  // Cart Management Handlers
  const handleAddToCart = (product: Product) => {
    storeAddToCart(product);
  };

  // Wishlist Handler
  const handleToggleWishlist = (product: Product) => {
    storeToggleWishlist(product);
  };

  // Canonical Slug Mapping Helper
  const getCategorySlug = (catName: string): string => {
    const lower = catName.toLowerCase().trim();
    if (lower === "all" || lower === "") return "/products";
    if (lower.includes("drone") || lower.includes("uav"))
      return "/categories/drone-technology";
    if (lower.includes("robot")) return "/categories/robotics";
    if (
      lower.includes("arduino") ||
      lower.includes("devboard") ||
      lower.includes("development") ||
      lower.includes("single board")
    )
      return "/categories/arduino-development-boards";
    if (lower.includes("stem") || lower.includes("education"))
      return "/categories/stem-kits";
    if (lower.includes("sensor")) return "/categories/sensors-modules";
    if (lower.includes("iot") || lower.includes("wireless"))
      return "/categories/iot";
    if (
      lower.includes("component") ||
      lower.includes("motor") ||
      lower.includes("stepper")
    )
      return "/categories/electronic-components";
    return `/categories/robotics`;
  };

  const handleCategoryNavigation = (catName: string) => {
    const targetSlugUrl = getCategorySlug(catName);
    router.push(targetSlugUrl);
  };

  const handleTabChange = (tab: TabType, subCategory?: string) => {
    if (subCategory) {
      router.push(getCategorySlug(subCategory));
      return;
    }
    switch (tab) {
      case "products":
        router.push("/products");
        break;
      case "categories":
        router.push("/categories");
        break;
      case "services":
        router.push("/services");
        break;
      case "learning-hub":
        router.push("/learning");
        break;
      case "offers":
        router.push("/offers");
        break;
      case "about":
        router.push("/about");
        break;
      case "contact-careers":
      case "contact":
        router.push("/contact");
        break;
      case "careers":
        router.push("/careers");
        break;
      case "drone-technology":
        router.push("/categories/drone-technology");
        break;
      case "robotics-kits":
        router.push("/categories/robotics");
        break;
      case "arduino-iot":
        router.push("/categories/arduino-development-boards");
        break;
      case "stem-kits":
        router.push("/categories/stem-kits");
        break;
      default:
        setActiveTab(tab);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const wishlistIds = wishlist.map((p) => p.id);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-[#1E56A0] selection:text-white">
      <main className="min-h-[70vh]">
        {/* Tab 1: Home View - Phase 1 Sequential Layout Below Locked Hero */}
        {activeTab === "home" && (
          <>
            {/* LOCKED HERO SECTION */}
            <HeroSection
              onExploreProducts={() => handleTabChange("products")}
              onExploreSolutions={() => handleTabChange("services")}
            />

            {/* 1. Shop by Category */}
            <ShopByCategory onSelectCategory={handleCategoryNavigation} />

            {/* 2. Featured Products */}
            <FeaturedCategories
              onSelectCategory={handleCategoryNavigation}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
              wishlistIds={wishlistIds}
            />

            {/* 3. Trending Products / Category Sliders */}
            <ProductGridSection
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
              onQuickView={(prod) => setSelectedQuickView(prod)}
              wishlistIds={wishlistIds}
              onSeeAll={handleCategoryNavigation}
            />

            {/* 6. Deals & Offers */}
            <DealsAndOffersSection
              onShopDeals={() => handleTabChange("offers")}
            />

            {/* 7. Robotics Collection Showcase */}
            <RoboticsCollectionShowcase
              onExploreCollection={handleCategoryNavigation}
            />

            {/* 9. Services Preview */}
            <ServicesSection onOpenB2BModal={() => setB2bOpen(true)} />

            {/* 10. Why Choose Prayog India */}
            <WhyChoosePrayog />

            {/* 11. Brand Partners */}
            <BrandPartners />

            {/* 12. Customer Reviews & Verified Builds */}
            <TestimonialsSection />

            {/* 13. Knowledge Center & Blog Guides */}
            <KnowledgeCenterSection />

            <B2BSection onOpenB2BModal={() => setB2bOpen(true)} />

            {/* 14. Trust Stats & Capabilities */}
            <StatsSection />
          </>
        )}

        {/* Tab 2: Categories View */}
        {activeTab === "categories" && (
          <div className="py-10 animate-in fade-in duration-300">
            <ShopByCategory
              onSelectCategory={(catName) =>
                handleTabChange("products", catName)
              }
            />
            <FeaturedCategories
              onSelectCategory={(catName) =>
                handleTabChange("products", catName)
              }
            />
            <ProductGridSection
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
              onQuickView={(prod) => setSelectedQuickView(prod)}
              wishlistIds={wishlistIds}
              onSeeAll={(catName) => handleTabChange("products", catName)}
            />
          </div>
        )}

        {/* Tab 3: Dedicated Products View */}
        {activeTab === "products" && (
          <div className="py-10 animate-in fade-in duration-300">
            <div className="max-w-7xl mx-auto px-6 mb-6">
              <div className="bg-[#00AEEF] text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <span className="bg-[#FFC20E] text-slate-950 text-[10px] font-black uppercase px-3 py-1 rounded-full">
                    Official Prayog Store
                  </span>
                  <h1 className="text-3xl font-extrabold mt-2">
                    {activeCategoryFilter
                      ? `Filtered: ${activeCategoryFilter}`
                      : "Complete STEM Hardware Catalogue"}
                  </h1>
                  <p className="text-xs text-white/90 mt-1">
                    100% Genuine Certified Microcontrollers, Drone Sensors, and
                    DIY Kits.
                  </p>
                </div>
                {activeCategoryFilter && (
                  <button
                    onClick={() => setActiveCategoryFilter(null)}
                    className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-4 py-2 rounded-full backdrop-blur-md"
                  >
                    Clear Filter ✕
                  </button>
                )}
              </div>
            </div>

            <ProductGridSection
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
              onQuickView={(prod) => setSelectedQuickView(prod)}
              wishlistIds={wishlistIds}
              onSeeAll={(catName) => handleTabChange("products", catName)}
            />
          </div>
        )}

        {/* Tab 4: Drone Technology & Sub-tabs */}
        {activeTab === "drone-technology" && (
          <div className="py-10 max-w-7xl mx-auto px-6 space-y-8 animate-in fade-in duration-300">
            <div className="bg-gradient-to-r from-[#0A1128] via-[#0F172A] to-[#1E56A0] text-white p-8 rounded-3xl border border-[#D4AF37]/30 shadow-2xl space-y-3">
              <span className="bg-[#FFC20E] text-slate-950 text-xs font-black px-3.5 py-1 rounded-full uppercase">
                Subcategory View
              </span>
              <h1 className="text-3xl sm:text-4xl font-black">
                Drone Technology & Aerial UAV Sub-hardware
              </h1>
              {activeCategoryFilter && (
                <p className="text-sm font-extrabold text-[#FFC20E]">
                  Showing sub-parts matching: {activeCategoryFilter}
                </p>
              )}
              <p className="text-xs text-slate-300 max-w-2xl">
                Flight controllers, ESCs, BLDC Motors, MavLink GPS receivers,
                LiPo battery packs, and carbon propellers.
              </p>
            </div>

            <ProductGridSection
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
              onQuickView={(prod) => setSelectedQuickView(prod)}
              wishlistIds={wishlistIds}
              onSeeAll={(catName) => handleTabChange("products", catName)}
            />
          </div>
        )}

        {/* Tab 5: Subcategory Pages (Robotics Kits, Arduino & IoT, STEM Kits) */}
        {(activeTab === "robotics-kits" ||
          activeTab === "arduino-iot" ||
          activeTab === "stem-kits") && (
          <div className="py-10 max-w-7xl mx-auto px-6 space-y-8 animate-in fade-in duration-300">
            <div className="bg-[#00AEEF] text-white p-8 rounded-3xl shadow-xl space-y-2">
              <span className="bg-[#FFC20E] text-slate-950 text-xs font-black px-3.5 py-1 rounded-full uppercase">
                Hardware Category View
              </span>
              <h1 className="text-3xl font-extrabold capitalize">
                {activeTab.replace("-", " ")}
              </h1>
              <p className="text-xs text-white/90">
                Verified hardware modules, official dev boards, and complete
                assembly manuals.
              </p>
            </div>

            <ProductGridSection
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
              onQuickView={(prod) => setSelectedQuickView(prod)}
              wishlistIds={wishlistIds}
              onSeeAll={(catName) => handleTabChange("products", catName)}
            />
          </div>
        )}

        {/* Tab 6: Learning Hub Dedicated Tab */}
        {activeTab === "learning-hub" && (
          <div className="py-10 animate-in fade-in duration-300">
            <LearningHubSection />
          </div>
        )}

        {/* Tab 7: Services Dedicated Tab */}
        {activeTab === "services" && (
          <div className="py-10 animate-in fade-in duration-300">
            <ServicesSection onOpenB2BModal={() => setB2bOpen(true)} />
          </div>
        )}

        {/* Tab 8: Offers & Deals Dedicated Tab */}
        {activeTab === "offers" && (
          <div className="py-10 max-w-7xl mx-auto px-6 space-y-8 animate-in fade-in duration-300">
            <DealsAndOffersSection
              onShopDeals={() => handleTabChange("products")}
            />
            <ProductGridSection
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
              onQuickView={(prod) => setSelectedQuickView(prod)}
              wishlistIds={wishlistIds}
              onSeeAll={(catName) => handleTabChange("products", catName)}
            />
          </div>
        )}

        {/* Tab 9: About Dedicated Tab */}
        {activeTab === "about" && (
          <div className="py-10 animate-in fade-in duration-300">
            <AboutSection />
            <WhyChoosePrayog />
          </div>
        )}

        {/* Tab 10: Contact & Careers Dedicated Tab */}
        {activeTab === "contact-careers" && (
          <div className="py-10 space-y-12 animate-in fade-in duration-300">
            <ContactSection />
            <CareersSection />
          </div>
        )}
      </main>

      <QuickViewModal
        product={selectedQuickView}
        onClose={() => setSelectedQuickView(null)}
        onAddToCart={handleAddToCart}
      />

      <B2BModal isOpen={b2bOpen} onClose={() => setB2bOpen(false)} />
    </div>
  );
}
