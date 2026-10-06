"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CategoryBreadcrumb } from "@/components/categories/CategoryBreadcrumb";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInformation } from "@/components/product/ProductInformation";
import { ProductTabsSection } from "@/components/product/ProductTabsSection";
import { ProductRecommendations } from "@/components/product/ProductRecommendations";
import { PRODUCTS, Product, ProductVariant } from "@/data/mockData";
import { useStore } from "@/context/StoreContext";
import {
  ShoppingBag,
  ArrowLeft,
  PackageSearch,
} from "lucide-react";

interface ProductDetailViewProps {
  slug: string;
  initialProduct?: Product | null;
}

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
  const [stickyBarVisible, setStickyBarVisible] = useState(false);

  // Sticky bar visibility on scroll
  useEffect(() => {
    const handleScroll = () => setStickyBarVisible(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Derived data (Ensure 4-5 images per product)
  const galleryImages = React.useMemo(() => {
    if (!product) return [];
    if (product.images && product.images.length >= 4) {
      return product.images;
    }
    
    const baseImages = product.images && product.images.length > 0
      ? [...product.images]
      : product.image
        ? [product.image]
        : ["/images/products/arduino-uno-r3.png"];

    const hardwareExtras = [
      "/images/products/arduino-uno-r3.png",
      "/images/products/ultrasonic-sensor-hcsr04.png",
      "/images/products/tt-gear-motor-wheel.png",
      "/images/products/l298n-motor-driver.jpg",
      "/images/products/4wd-robot-chassis-kit.jpg",
    ];

    for (const extra of hardwareExtras) {
      if (baseImages.length >= 5) break;
      if (!baseImages.includes(extra)) {
        baseImages.push(extra);
      }
    }

    return baseImages;
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
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-8 sm:space-y-10 animate-in fade-in duration-300 pb-32 sm:pb-24 lg:pb-6">
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

      {/* ── 2-Column Top Section: Gallery + Info (Matching Reference Layout) ── */}
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

      {/* ── Lower Section: Horizontal Tabs Container (Overview, Specs, Box, Compatibility, Reviews, FAQ) ── */}
      <ProductTabsSection product={product} />

      {/* ── Section: Recommendations & Related Products ── */}
      {recoGroups.length > 0 && (
        <div className="pt-4">
          <ProductRecommendations groups={recoGroups} />
        </div>
      )}

      {/* ── Mobile Sticky Bottom Action Bar ── */}
      {stickyBarVisible && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] animate-in slide-in-from-bottom-5 duration-200">
          <div className="shrink-0 min-w-[58px]">
            <span className="text-[10px] text-slate-400 font-bold block leading-none mb-0.5">
              Price
            </span>
            <span className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
              ₹{currentPrice.toLocaleString("en-IN")}
            </span>
          </div>

          <button
            onClick={() => handleAddToCart(product, 1)}
            className="flex-1 bg-[#00AEEF] hover:bg-[#0096D6] text-white py-2.5 px-2 rounded-xl font-extrabold text-[10px] sm:text-[11px] uppercase tracking-wider flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
            <span>Add to Cart</span>
          </button>

          <button
            onClick={() => handleBuyNow(product, 1)}
            className="flex-1 bg-[#0A1128] hover:bg-slate-800 text-white py-2.5 px-2 rounded-xl font-extrabold text-[10px] sm:text-[11px] uppercase tracking-wider flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            <span>Buy Now</span>
          </button>
        </div>
      )}
    </div>
  );
};
