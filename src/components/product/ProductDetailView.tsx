"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CategoryBreadcrumb } from "@/components/categories/CategoryBreadcrumb";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInformation } from "@/components/product/ProductInformation";
import { ProductDetailsAccordion } from "@/components/product/ProductDetailsAccordion";
import { ProductDocuments } from "@/components/product/ProductDocuments";
import { ProductReviewsSection } from "@/components/product/ProductReviewsSection";
import { ProductRecommendations } from "@/components/product/ProductRecommendations";
import { PRODUCTS, Product, ProductVariant } from "@/data/mockData";
import { useStore } from "@/context/StoreContext";
import {
  ShoppingBag,
  ArrowLeft,
  PackageSearch,
  BookOpen,
  List,
  Star,
  Package,
  Boxes,
  Link2,
} from "lucide-react";

interface ProductDetailViewProps {
  slug: string;
  initialProduct?: Product | null;
}

// ── Section anchor tab types
type SectionTab = "overview" | "specs" | "documents" | "reviews" | "related";

const SECTION_TABS: { id: SectionTab; label: string; icon: React.ReactNode }[] =
  [
    {
      id: "overview",
      label: "Overview",
      icon: <BookOpen className="w-3.5 h-3.5" />,
    },
    { id: "specs", label: "Specs", icon: <List className="w-3.5 h-3.5" /> },
    {
      id: "documents",
      label: "Downloads",
      icon: <Package className="w-3.5 h-3.5" />,
    },
    { id: "reviews", label: "Reviews", icon: <Star className="w-3.5 h-3.5" /> },
    {
      id: "related",
      label: "Related",
      icon: <Link2 className="w-3.5 h-3.5" />,
    },
  ];

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  slug,
  initialProduct,
}) => {
  // ── Product lookup: check passed DB initialProduct first
  const product =
    initialProduct ||
    PRODUCTS.find(
      (p) =>
        (p.slug && p.slug === slug) ||
        p.id === slug ||
        p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === slug,
    ) ||
    null;

  const isInvalidSlug = !product;

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product?.variants && product.variants.length > 0
      ? product.variants[0]
      : null,
  );
  const {
    wishlist,
    addToCart: storeAddToCart,
    toggleWishlist: storeToggleWishlist,
  } = useStore();
  const [activeSection, setActiveSection] = useState<SectionTab>("overview");
  const [stickyBarVisible, setStickyBarVisible] = useState(false);

  // Refs for each section scroll target
  const overviewRef = useRef<HTMLDivElement>(null);
  const specsRef = useRef<HTMLDivElement>(null);
  const documentsRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);
  const relatedRef = useRef<HTMLDivElement>(null);

  // Sticky bar visibility on scroll
  useEffect(() => {
    const handleScroll = () => setStickyBarVisible(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Derived data
  const galleryImages = React.useMemo(() => {
    if (!product) return [];
    if (product.images && product.images.length > 0) {
      return product.images;
    }
    if (product.image) {
      return [product.image];
    }
    return [
      "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=800&q=80",
    ];
  }, [product]);

  if (isInvalidSlug || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-[#FF3B30] flex items-center justify-center mx-auto border border-red-200">
          <PackageSearch className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">
          Product Not Found
        </h1>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          The requested hardware component could not be located in our
          catalogue.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-[#00AEEF] text-white px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </Link>
      </div>
    );
  }

  const currentPrice = selectedVariant?.price ?? product.price;

  const relatedProducts = PRODUCTS.filter(
    (p) =>
      p.id !== product.id &&
      (p.category === product.category ||
        product.relatedProductIds?.includes(p.id)),
  ).slice(0, 6);

  const frequentlyBoughtTogether = PRODUCTS.filter((p) =>
    product.frequentlyBoughtTogetherIds?.includes(p.id),
  ).slice(0, 4);

  const recommendedAccessories = PRODUCTS.filter((p) =>
    product.recommendedAccessoryIds?.includes(p.id),
  ).slice(0, 4);

  const similarProducts = PRODUCTS.filter(
    (p) =>
      p.id !== product.id &&
      p.category === product.category &&
      !relatedProducts.find((r) => r.id === p.id),
  ).slice(0, 4);

  const recoGroups = [
    ...(frequentlyBoughtTogether.length > 0
      ? [
          {
            id: "fbt",
            label: "Frequently Bought Together",
            subtitle: "Pair these for your build.",
            products: frequentlyBoughtTogether,
          },
        ]
      : []),
    ...(relatedProducts.length > 0
      ? [
          {
            id: "related",
            label: "Related Products",
            subtitle: "From the same category.",
            products: relatedProducts,
          },
        ]
      : []),
    ...(similarProducts.length > 0
      ? [
          {
            id: "similar",
            label: "Similar Products",
            subtitle: "Comparable hardware alternatives.",
            products: similarProducts,
          },
        ]
      : []),
    ...(recommendedAccessories.length > 0
      ? [
          {
            id: "accessories",
            label: "Recommended Accessories",
            subtitle: "Essential add-ons for this product.",
            products: recommendedAccessories,
          },
        ]
      : []),
  ];

  const scrollToSection = (section: SectionTab) => {
    setActiveSection(section);
    const refMap: Record<SectionTab, React.RefObject<HTMLDivElement | null>> = {
      overview: overviewRef,
      specs: specsRef,
      documents: documentsRef,
      reviews: reviewsRef,
      related: relatedRef,
    };
    const ref = refMap[section];
    if (ref.current) {
      const offset = 100;
      const top =
        ref.current.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const router = useRouter();
  const handleToggleWishlist = (prod: Product) => {
    storeToggleWishlist(prod);
  };

  const handleAddToCart = (prod: Product, qty: number = 1) => {
    storeAddToCart(prod, selectedVariant || undefined, qty);
  };

  const handleBuyNow = (prod: Product, qty: number = 1) => {
    storeAddToCart(prod, selectedVariant || undefined, qty);
    router.push("/checkout");
  };

  const isProductWishlisted = wishlist.some((p) => p.id === product.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10 animate-in fade-in duration-300 pb-24 lg:pb-6">
      {/* ── Breadcrumb ── */}
      <CategoryBreadcrumb
        items={[
          { label: "Products", href: "/products" },
          {
            label: product.category,
            href: `/products?category=${encodeURIComponent(product.category)}`,
          },
          ...(product.subcategory
            ? [
                {
                  label: product.subcategory,
                  href: `/products?category=${encodeURIComponent(product.subcategory)}`,
                },
              ]
            : []),
          { label: product.name },
        ]}
      />

      {/* ── Sticky Section Tab Bar ── */}
      <div
        className={`sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all duration-300 rounded-xl px-2 sm:px-4 ${
          stickyBarVisible ? "shadow-md" : ""
        }`}
      >
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-2">
          {SECTION_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => scrollToSection(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                activeSection === tab.id
                  ? "bg-[#00AEEF] text-white shadow-sm shadow-[#00AEEF]/20"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 2-Column Top Section: Gallery + Info ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-start">
        {/* Left — Gallery (sticky on desktop) */}
        <div className="lg:col-span-6 lg:sticky lg:top-28">
          <ProductGallery
            images={galleryImages}
            productName={product.name}
            videoUrl={product.videoUrl}
            media360={product.media360}
          />
        </div>

        {/* Right — Product Information */}
        <div className="lg:col-span-6">
          <ProductInformation
            product={product}
            selectedVariant={selectedVariant}
            onSelectVariant={setSelectedVariant}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onToggleWishlist={handleToggleWishlist}
            isWishlisted={isProductWishlisted}
          />
        </div>
      </div>

      {/* ── Section: Overview (Description, Features, Applications, What's Included) ── */}
      <div ref={overviewRef}>
        <ProductDetailsAccordion
          description={product.description}
          features={product.features}
          applications={product.applications}
          whatsIncluded={product.whatsIncluded}
          specs={product.specs}
          specsRef={specsRef}
        />
      </div>

      {/* ── Section: Downloads / Documents ── */}
      <div ref={documentsRef}>
        <ProductDocuments documents={product.documents} />
      </div>

      {/* ── Section: Customer Reviews ── */}
      <div ref={reviewsRef}>
        <ProductReviewsSection
          rating={product.rating}
          reviewsCount={product.reviews}
          reviewItems={product.reviewItems}
        />
      </div>

      {/* ── Section: All Recommendation Groups (tabbed) ── */}
      <div ref={relatedRef}>
        {recoGroups.length > 0 && (
          <ProductRecommendations groups={recoGroups} />
        )}
      </div>

      {/* ── Mobile Sticky Bottom Action Bar (Only shows when user scrolls past top buttons) ── */}
      {stickyBarVisible && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 flex items-center gap-3 shadow-2xl animate-in slide-in-from-bottom-5 duration-200">
          <div className="shrink-0">
            <span className="text-[10px] text-slate-400 font-bold block leading-none mb-0.5">
              Price
            </span>
            <span className="text-sm font-black text-slate-900 leading-tight">
              ₹{currentPrice.toLocaleString("en-IN")}
            </span>
          </div>

          <button
            onClick={() => handleAddToCart(product, 1)}
            className="flex-1 bg-[#00AEEF] hover:bg-[#0096D6] text-white py-2.5 rounded-xl font-extrabold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add to Cart</span>
          </button>

          <button
            onClick={() => handleBuyNow(product, 1)}
            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl font-extrabold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <span>Buy Now</span>
          </button>
        </div>
      )}
    </div>
  );
};
