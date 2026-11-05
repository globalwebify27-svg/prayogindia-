"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CategoryBreadcrumb } from "@/components/categories/CategoryBreadcrumb";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInformation } from "@/components/product/ProductInformation";
import { ProductTabsSection } from "@/components/product/ProductTabsSection";
import { ProductRecommendations } from "@/components/product/ProductRecommendations";
import { PRODUCTS, Product, ProductVariant, getProductStock } from "@/data/mockData";
import { findMockProduct } from "@/lib/productResolver";
import { useCartStore, useWishlistStore, useUIStore } from "@/store";
import { B2BModal } from "@/components/Modals";
import {
  ShoppingBag,
  ShoppingCart,
  ArrowLeft,
  PackageSearch,
  Check,
  Heart,
  ExternalLink,
} from "lucide-react";
import { AddToCartIcon } from "@/components/icons/AddToCartIcon";
import { recordProductView } from "@/utils/recentProducts";
import {
  ProductPromoBanner,
  DEFAULT_PRODUCT_PROMO_BANNER,
} from "@/data/productPromoBannerData";

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
  const storeAddToCart = useCartStore((s) => s.addToCart);
  const storeToggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const isProductWishlisted = useWishlistStore((s) =>
    s.wishlist.some((p) => p.id === product?.id)
  );
  const [stickyAdded, setStickyAdded] = useState(false);
  const [b2bOpen, setB2bOpen] = useState(false);
  const [promoBanner, setPromoBanner] = useState<ProductPromoBanner>(
    DEFAULT_PRODUCT_PROMO_BANNER
  );

  // Fetch admin configured product promo banner
  useEffect(() => {
    let isMounted = true;
    const fetchPromoBanner = async () => {
      try {
        const res = await fetch(`/api/banners/promo?_t=${Date.now()}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (data?.success && data?.data && isMounted) {
          setPromoBanner(data.data);
        }
      } catch (err) {
        console.error("Failed to load promo banner:", err);
      }
    };
    fetchPromoBanner();
    return () => {
      isMounted = false;
    };
  }, []);

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
    const maxStock = getProductStock(prod, selectedVariant);
    if (qty > maxStock) {
      useUIStore.getState().showToast({
        title: `Only ${maxStock} units available.`,
        type: "error",
        iconType: "stock-limit",
        duration: 3000,
      });
      return;
    }
    storeAddToCart(prod, selectedVariant || undefined, qty);
    router.push("/checkout");
  };

  const [stickyQuantity, setStickyQuantity] = useState(1);
  const [isMainCtaVisible, setIsMainCtaVisible] = useState(true);

  useEffect(() => {
    const target = document.getElementById("main-product-cta");
    if (!target) return;

    const checkVisibility = () => {
      const rect = target.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      setIsMainCtaVisible(isVisible);
    };

    checkVisibility();

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsMainCtaVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1,
      }
    );

    observer.observe(target);
    window.addEventListener("scroll", checkVisibility, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", checkVisibility);
    };
  }, [product.id]);

  const handleStickyAddToCart = () => {
    const maxStock = getProductStock(product, selectedVariant);
    if (stickyQuantity > maxStock) {
      useUIStore.getState().showToast({
        title: `Only ${maxStock} units available.`,
        type: "error",
        iconType: "stock-limit",
        duration: 3000,
      });
      return;
    }
    handleAddToCart(product, stickyQuantity);
    setStickyAdded(true);
    setTimeout(() => setStickyAdded(false), 1800);
  };

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
            quantity={stickyQuantity}
            onQuantityChange={setStickyQuantity}
            onOpenB2BModal={() => setB2bOpen(true)}
          />
        </div>
      </div>



      {/* ── Side-by-Side Promotional Cards: Bulk Order + Prayog App Download ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-1">
        {/* Card 1: Bulk Order Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Bulk Order?
            </h3>
            <p className="text-sm font-semibold text-slate-600 leading-relaxed">
              For Best Price Contact on{" "}
              <a
                href={`https://wa.me/918709789641?text=${encodeURIComponent(
                  `Hello Prayog India, I want a bulk price quotation for ${product.name} (SKU: ${product.sku}).`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-black text-[#25D366] hover:underline inline-flex items-center gap-1 align-baseline"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 fill-[#25D366] shrink-0" />
                <span>WhatsApp</span>
              </a>{" "}
              for bulk discounts!
            </p>
            <p className="text-xs text-slate-500 font-medium">
              Or Fill the Form Below
            </p>
          </div>

          <button
            type="button"
            onClick={() => setB2bOpen(true)}
            className="w-full py-3.5 px-5 bg-[#005CA9] hover:bg-[#004a88] text-white rounded-2xl font-extrabold text-xs sm:text-sm shadow-md shadow-blue-900/15 transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01]"
          >
            Submit your Bulk Enquiry Here
          </button>
        </div>

        {/* Card 2: Promotional Banner (Configured from Admin with Redirect Link) */}
        {promoBanner.isActive && (
          promoBanner.useCustomImage && promoBanner.bannerImageUrl ? (
            /* Mode 1: Custom Artwork Banner Uploaded by Admin */
            <a
              href={promoBanner.redirectUrl || "/download"}
              target={promoBanner.redirectUrl?.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-md transition-all group block relative bg-[#0A1128] min-h-[170px]"
            >
              <img
                src={promoBanner.bannerImageUrl}
                alt={promoBanner.title || "Special Promotion - Prayog India"}
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
              />
              <span className="absolute bottom-3 right-3 bg-[#0A1128]/80 hover:bg-black text-white text-[10px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/20 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Open Link</span>
                <ExternalLink className="w-3 h-3" />
              </span>
            </a>
          ) : (
            /* Mode 2: Dynamic Interactive Offer / App Banner Card */
            <div className="bg-gradient-to-br from-[#0A1128] via-[#005CA9] to-[#00AEEF] rounded-3xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 group border border-cyan-500/20">
              {/* Subtle grid pattern background */}
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#00F0FF_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

              {/* Left Phone Mockup Graphic - Clickable to redirect */}
              <a
                href={promoBanner.redirectUrl || "/download"}
                target={promoBanner.redirectUrl?.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="relative w-28 h-40 sm:w-32 sm:h-44 shrink-0 rounded-2xl bg-[#061128]/85 backdrop-blur-md border border-cyan-400/30 p-2 shadow-xl flex flex-col items-center justify-between overflow-hidden transition-transform group-hover:scale-105 cursor-pointer"
                title={`Redirect to ${promoBanner.redirectUrl || "/download"}`}
              >
                <div className="w-12 h-1 bg-white/40 rounded-full" />
                <div className="w-full flex-1 flex flex-col items-center justify-center text-center p-1">
                  <span className="text-[10px] font-black tracking-widest uppercase text-[#00AEEF]">
                    PRAYOG
                  </span>
                  <span className="text-xs font-black text-white mt-0.5">
                    {promoBanner.phoneTitle || "APP 2.0"}
                  </span>
                  <span className="text-[9px] bg-[#FFC20E] text-slate-950 font-black px-2 py-0.5 rounded-full mt-2 shadow-2xs">
                    {promoBanner.phoneBadgeText || "5% OFF"}
                  </span>
                </div>
                <div className="w-8 h-1 bg-white/30 rounded-full" />
              </a>

              {/* Right Text Content & Download Badges */}
              <div className="flex-1 text-center sm:text-left space-y-3 z-10">
                <div>
                  <a
                    href={promoBanner.redirectUrl || "/download"}
                    target={promoBanner.redirectUrl?.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    <h3 className="text-lg sm:text-xl font-black uppercase tracking-wider text-white leading-tight">
                      {promoBanner.title || "ORDER ON PRAYOG APP"}
                    </h3>
                  </a>
                  <p className="text-[11px] font-bold tracking-widest text-[#00F0FF] uppercase mt-0.5">
                    {promoBanner.subtitle || "ROBOTICS AT YOUR FINGERTIPS"}
                  </p>
                </div>

                {/* Discount Coupon Tag */}
                <div className="inline-flex items-center gap-1.5 p-1 bg-black/40 rounded-xl border border-cyan-400/30">
                  <span className="bg-[#FFC20E] text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-lg uppercase shadow-2xs">
                    {promoBanner.tagText || "GET FLAT 5% OFF"}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-cyan-200 px-1.5">
                    CODE: {promoBanner.couponCode || "PRGAPP"}
                  </span>
                </div>

                {/* App Store / Play Store Links / Redirection */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <a
                    href={promoBanner.googlePlayUrl || promoBanner.redirectUrl || "/download"}
                    target={promoBanner.googlePlayUrl?.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-[#061128] hover:bg-[#0A1A3E] text-white px-3 py-1.5 rounded-xl text-[10px] font-bold border border-cyan-400/30 transition-transform hover:scale-105 cursor-pointer"
                  >
                    <span>Google Play</span>
                  </a>
                  <a
                    href={promoBanner.appStoreUrl || promoBanner.redirectUrl || "/download"}
                    target={promoBanner.appStoreUrl?.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-[#061128] hover:bg-[#0A1A3E] text-white px-3 py-1.5 rounded-xl text-[10px] font-bold border border-cyan-400/30 transition-transform hover:scale-105 cursor-pointer"
                  >
                    <span>App Store</span>
                  </a>
                  {promoBanner.redirectUrl && (
                    <a
                      href={promoBanner.redirectUrl}
                      target={promoBanner.redirectUrl?.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 bg-[#FFC20E] hover:bg-[#E5AC0D] text-slate-950 font-black px-3 py-1.5 rounded-xl text-[10px] transition-transform hover:scale-105 cursor-pointer shadow-xs"
                    >
                      <span>Explore</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* ── Lower Section: Horizontal Tabs Container (Description, Specs, Resources, Reviews, FAQ) ── */}
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
        className={`fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-8px_30px_rgba(15,23,42,0.12)] px-2.5 sm:px-6 lg:px-8 xl:px-12 py-2 sm:py-2.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] transition-all duration-300 ease-in-out ${
          isMainCtaVisible
            ? "translate-y-full opacity-0 pointer-events-none"
            : "translate-y-0 opacity-100 pointer-events-auto"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Product Thumbnail, Title & Live Price */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0 min-w-0">
            {/* Thumbnail (Tablet & Desktop) */}
            <div className="hidden sm:flex relative w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0 items-center justify-center p-1">
              <img
                src={galleryImages[0] || product.image}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Title & Price Breakdown */}
            <div className="flex flex-col shrink-0 min-w-0">
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
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2 leading-tight">
                <div className="flex items-baseline gap-1 sm:gap-2">
                  <span className="text-base sm:text-2xl font-black text-slate-900 tracking-tight whitespace-nowrap">
                    ₹{currentPrice.toLocaleString("en-IN")}
                  </span>
                  {currentMrp > currentPrice && (
                    <span className="text-[11px] sm:text-sm font-semibold text-slate-400 line-through whitespace-nowrap">
                      ₹{currentMrp.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 whitespace-nowrap">
                    (Incl. GST)
                  </span>
                  {currentMrp > currentPrice && (
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200 hidden sm:inline-block">
                      {Math.round(((currentMrp - currentPrice) / currentMrp) * 100)}% OFF
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Quantity Selector, Add to Cart and Buy Now Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-1 sm:flex-initial justify-end min-w-0">
            {isInStock ? (
              <>
                {/* Quantity Selector: [ - 1 + ] (Tablet & Desktop) */}
                <div className="hidden sm:flex items-center border border-slate-200 rounded-xl h-10 sm:h-11 bg-white shrink-0 overflow-hidden shadow-2xs">
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
                    onClick={() => {
                      const maxStock = getProductStock(product, selectedVariant);
                      if (stickyQuantity >= maxStock) {
                        useUIStore.getState().showToast({
                          title: `Only ${maxStock} units available.`,
                          type: "error",
                          iconType: "stock-limit",
                          duration: 3000,
                        });
                        return;
                      }
                      setStickyQuantity((q) => q + 1);
                    }}
                    className="w-7 sm:w-9 h-full flex items-center justify-center text-slate-500 hover:bg-slate-50 font-bold text-sm cursor-pointer transition-colors"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart Button (Secondary CTA) */}
                <button
                  type="button"
                  onClick={handleStickyAddToCart}
                  className={`h-10 sm:h-11 px-3 sm:px-6 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center active:scale-95 transition-all cursor-pointer whitespace-nowrap shadow-2xs flex-1 sm:flex-initial min-w-0 ${
                    stickyAdded
                      ? "bg-emerald-600 text-white shadow-emerald-600/20"
                      : "bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 shadow-2xs"
                  }`}
                >
                  <span className="truncate">{stickyAdded ? "ADDED!" : "ADD TO CART"}</span>
                </button>

                {/* Buy Now Button — Brand Primary Blue #2563EB */}
                <button
                  type="button"
                  onClick={() => handleBuyNow(product, stickyQuantity)}
                  className="h-10 sm:h-11 px-2.5 sm:px-7 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white font-black text-xs sm:text-sm uppercase tracking-normal sm:tracking-wider flex items-center justify-center gap-1 sm:gap-1.5 shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap flex-1 sm:flex-initial min-w-0"
                >
                  <span className="truncate">BUY NOW</span>
                </button>

                {/* Wishlist Button (Tablet & Desktop) */}
                <button
                  type="button"
                  onClick={() => handleToggleWishlist(product)}
                  className={`hidden sm:flex h-10 sm:h-11 w-10 sm:w-11 rounded-xl border items-center justify-center shrink-0 transition-all cursor-pointer ${
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
                className="h-10 sm:h-11 px-3 sm:px-6 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md shadow-[#25D366]/25 flex items-center justify-center gap-1.5 sm:gap-2 active:scale-95 cursor-pointer whitespace-nowrap flex-1 sm:flex-initial min-w-0"
              >
                <WhatsAppIcon className="w-4 h-4 fill-white shrink-0" />
                <span>Out of Stock — Inquire</span>
              </a>
            )}
          </div>
        </div>
      </aside>

      {/* ── B2B Institutional & Bulk Order Enquiry Modal ── */}
      <B2BModal isOpen={b2bOpen} onClose={() => setB2bOpen(false)} />
    </div>
  );
};
