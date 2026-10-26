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
import { findMockProduct } from "@/lib/productResolver";
import { useStore } from "@/context/StoreContext";
import {
  ShoppingBag,
  ShoppingCart,
  ArrowLeft,
  PackageSearch,
  Check,
  Heart,
} from "lucide-react";
import { AddToCartIcon } from "@/components/icons/AddToCartIcon";
import { recordProductView } from "@/utils/recentProducts";

// Official WhatsApp Vector SVG Icon
const WhatsAppIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    role="img"
    aria-label="WhatsApp"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

interface ProductDetailViewProps {
  slug: string;
  initialProduct?: Product | null;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  slug,
  initialProduct,
}) => {
  const decodedSlug = decodeURIComponent(slug || "").trim();
  const slugLower = decodedSlug.toLowerCase();

  // ── Product lookup: check passed DB initialProduct first, enrich with mock catalog
  const matchingMock =
    findMockProduct(slug) ||
    PRODUCTS.find(
      (p) =>
        (p.slug && p.slug.toLowerCase() === slugLower) ||
        p.id.toLowerCase() === slugLower ||
        (p.sku && p.sku.toLowerCase() === slugLower) ||
        (initialProduct?.sku && p.sku && p.sku.toLowerCase() === initialProduct.sku.toLowerCase()) ||
        (initialProduct?.name && p.name.toLowerCase() === initialProduct.name.toLowerCase()) ||
        p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === slugLower ||
        p.name.toLowerCase() === slugLower,
    );

  const product = initialProduct
    ? {
        ...matchingMock,
        ...initialProduct,
        image:
          initialProduct.image && initialProduct.image.trim() !== ""
            ? initialProduct.image
            : matchingMock?.image || "/images/products/4wd-robot-chassis-kit.jpg",
        images:
          initialProduct.images && initialProduct.images.filter(Boolean).length > 0
            ? initialProduct.images.filter(Boolean)
            : matchingMock?.images && matchingMock.images.length > 0
            ? matchingMock.images
            : matchingMock?.image
            ? [matchingMock.image]
            : ["/images/products/4wd-robot-chassis-kit.jpg"],
        features:
          initialProduct.features && initialProduct.features.length > 0
            ? initialProduct.features
            : matchingMock?.features || [],
        specs: {
          ...(matchingMock?.specs || {}),
          ...(initialProduct.specs || {}),
        },
      }
    : matchingMock || null;

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
  const [stickyAdded, setStickyAdded] = useState(false);

  // Record customer product view in browsing history
  useEffect(() => {
    if (product?.id) {
      recordProductView(product);
    }
  }, [product]);

  // ── Derived data (Only show images provided for this product)
  const galleryImages = React.useMemo(() => {
    if (!product) return [];
    const validImgs = (product.images || []).filter(Boolean);
    if (validImgs.length > 0) {
      return validImgs;
    }
    if (product.image && product.image.trim() !== "") {
      return [product.image];
    }
    if (matchingMock?.images && matchingMock.images.length > 0) {
      return matchingMock.images;
    }
    if (matchingMock?.image) {
      return [matchingMock.image];
    }
    return ["/images/products/4wd-robot-chassis-kit.jpg"];
  }, [product, matchingMock]);

  if (isInvalidSlug || !product) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-20 text-center space-y-4">
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
          className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider transition-colors shadow-md shadow-blue-500/20"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </Link>
      </div>
    );
  }

  const currentPrice = selectedVariant?.price ?? product.price;
  const currentMrp = selectedVariant?.mrp ?? product.mrp;

  const cat = (product.category || "").toLowerCase();
  const relatedProducts = PRODUCTS.filter(
    (p) =>
      p.id !== product.id &&
      (p.category.toLowerCase() === cat ||
        (cat && p.category.toLowerCase().includes(cat)) ||
        (cat && cat.includes(p.category.toLowerCase())) ||
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
      (p.category.toLowerCase() === cat ||
        (cat && p.category.toLowerCase().includes(cat)) ||
        (cat && cat.includes(p.category.toLowerCase()))) &&
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

  const [stickyQuantity, setStickyQuantity] = useState(1);
  const handleStickyAddToCart = () => {
    handleAddToCart(product, stickyQuantity);
    setStickyAdded(true);
    setTimeout(() => setStickyAdded(false), 1800);
  };

  const isProductWishlisted = wishlist.some((p) => p.id === product.id);
  const isInStock = selectedVariant ? selectedVariant.inStock : product.inStock;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-2 sm:py-3 space-y-4 sm:space-y-5 animate-in fade-in duration-300 pb-4 sm:pb-6">
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

      {/* ── 2-Column Top Section: Gallery + Info ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
        {/* Left — Gallery (Ensures thumbnails are always fully visible) */}
        <div className="lg:col-span-5 flex flex-col">
          <ProductGallery
            images={galleryImages}
            productName={product.name}
            videoUrl={product.videoUrl}
            media360={product.media360}
          />
        </div>

        {/* Right — Product Information */}
        <div className="lg:col-span-7 flex flex-col justify-start">
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
          <ProductRecommendations groups={recoGroups} mainProduct={product} />
        </div>
      )}

      {/* ── Sticky Bottom Action Bar with Price, Add to Cart & Buy Now ── */}
      <aside
        aria-label="Sticky purchase action bar"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-8px_30px_rgba(15,23,42,0.12)] px-4 sm:px-6 lg:px-8 xl:px-12 py-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Product Thumbnail, Title & Live Price */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            {/* Thumbnail (Tablet & Desktop) */}
            <div className="hidden sm:flex relative w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0 items-center justify-center p-1">
              <img
                src={galleryImages[0] || product.image}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Title & Price Breakdown */}
            <div className="flex flex-col min-w-0">
              <div className="hidden md:flex items-center gap-2">
                <span className="text-xs font-extrabold text-slate-900 truncate max-w-xs xl:max-w-md">
                  {product.name}
                </span>
                {selectedVariant && (
                  <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                    {selectedVariant.name}
                  </span>
                )}
              </div>

              {/* Price Row */}
              <div className="flex items-baseline gap-2">
                <span className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                  ₹{currentPrice.toLocaleString("en-IN")}
                </span>
                {currentMrp > currentPrice && (
                  <>
                    <span className="text-xs sm:text-sm font-semibold text-slate-400 line-through">
                      ₹{currentMrp.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 hidden sm:inline-block">
                      {Math.round(((currentMrp - currentPrice) / currentMrp) * 100)}% OFF
                    </span>
                  </>
                )}
                <span className="text-[10px] font-bold text-slate-400 hidden lg:inline">
                  (Incl. GST)
                </span>
              </div>
            </div>
          </div>

          {/* Right: Quantity Selector, Add to Cart and Buy Now Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {isInStock ? (
              <>
                {/* Quantity Selector: [ - 1 + ] */}
                <div className="flex items-center border border-slate-200 rounded-xl h-10 sm:h-11 bg-white shrink-0 overflow-hidden shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setStickyQuantity((q) => Math.max(1, q - 1))}
                    disabled={stickyQuantity <= 1}
                    className="w-7 sm:w-9 h-full flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 font-bold text-sm cursor-pointer transition-colors"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-extrabold text-slate-900 select-none">
                    {stickyQuantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setStickyQuantity((q) => Math.min(50, q + 1))}
                    disabled={stickyQuantity >= 50}
                    className="w-7 sm:w-9 h-full flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 font-bold text-sm cursor-pointer transition-colors"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart Button — Prayog Brand Yellow #FFC20E */}
                <button
                  type="button"
                  onClick={handleStickyAddToCart}
                  className={`h-10 sm:h-11 px-3.5 sm:px-6 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 active:scale-95 transition-all cursor-pointer whitespace-nowrap shadow-xs ${
                    stickyAdded
                      ? "bg-emerald-600 text-white shadow-emerald-600/20"
                      : "bg-[#FFC20E] hover:bg-[#E5AC0D] text-slate-950 shadow-amber-500/20"
                  }`}
                >
                  {stickyAdded ? (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5] shrink-0" />
                      <span>ADDED!</span>
                    </>
                  ) : (
                    <>
                      <AddToCartIcon className="w-4 h-4 shrink-0" />
                      <span>ADD TO CART</span>
                    </>
                  )}
                </button>

                {/* Buy Now Button — Brand Primary Blue #2563EB */}
                <button
                  type="button"
                  onClick={() => handleBuyNow(product, stickyQuantity)}
                  className="h-10 sm:h-11 px-4 sm:px-7 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                >
                  <span>BUY NOW</span>
                </button>

                {/* Wishlist Button */}
                <button
                  type="button"
                  onClick={() => handleToggleWishlist(product)}
                  className={`h-10 sm:h-11 w-10 sm:w-11 rounded-xl border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                    isProductWishlisted
                      ? "bg-red-50 border-red-200 text-red-500"
                      : "bg-white border-slate-200 hover:border-slate-300 text-slate-400 hover:text-red-500"
                  }`}
                  title={isProductWishlisted ? "In Wishlist" : "Add to Wishlist"}
                  aria-label={isProductWishlisted ? "In Wishlist" : "Add to Wishlist"}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isProductWishlisted ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                </button>
              </>
            ) : (
              <a
                href={`https://wa.me/918709789641?text=${encodeURIComponent(
                  `Hello Prayog India Team, I want to inquire about ${product.name} (SKU: ${product.sku || product.id}) which is currently out of stock.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 sm:h-11 px-4 sm:px-6 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md shadow-[#25D366]/25 flex items-center justify-center gap-2 active:scale-95 cursor-pointer whitespace-nowrap"
              >
                <WhatsAppIcon className="w-4 h-4 fill-white shrink-0" />
                <span>Out of Stock — Inquire</span>
              </a>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};
