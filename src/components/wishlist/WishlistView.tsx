"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { CategoryBreadcrumb } from "@/components/categories/CategoryBreadcrumb";
import { useStore } from "@/context/StoreContext";
import { Product, PRODUCTS } from "@/data/mockData";
import { AddToCartIcon } from "@/components/icons/AddToCartIcon";
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowRight,
  MessageSquare,
  Star,
  Share2,
  CheckCircle2,
  X,
  Info,
  Copy,
  Check,
} from "lucide-react";

// ── Utility ──────────────────────────────────────────────────────
function getDiscount(p: Product): number {
  return p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
}

// ── Wishlist Item Card (Grid) ─────────────────────────────────────
const WishlistCard: React.FC<{
  product: Product;
  isSelected: boolean;
  onToggleSelect: () => void;
  onRemove: () => void;
  onMoveToCart: () => void;
  movedToCart: boolean;
}> = ({
  product,
  isSelected,
  onToggleSelect,
  onRemove,
  onMoveToCart,
  movedToCart,
}) => {
  const discount = getDiscount(product);
  const whatsappMsg = encodeURIComponent(
    `Hi Prayog India, I want to inquire about: "${product.name}" (SKU: ${product.sku}). Is it available?`,
  );

  return (
    <div
      className={`group bg-white rounded-2xl border transition-all duration-300 flex flex-col relative overflow-hidden ${
        isSelected
          ? "border-[#2563EB] ring-2 ring-[#2563EB]/20 shadow-md"
          : "border-slate-200 hover:border-[#2563EB]/50 hover:shadow-lg"
      }`}
    >
      {/* Selection checkbox */}
      <button
        onClick={onToggleSelect}
        className="absolute top-2.5 left-2.5 z-10 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer"
        style={{
          backgroundColor: isSelected ? "#2563EB" : "rgba(255,255,255,0.9)",
          borderColor: isSelected ? "#2563EB" : "#CBD5E1",
        }}
      >
        {isSelected && <Check className="w-3 h-3 text-white" />}
      </button>

      {/* Remove button */}
      <button
        onClick={onRemove}
        className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white/95 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200/90 hover:border-rose-200 flex items-center justify-center transition-all shadow-xs cursor-pointer group/remove"
        title="Remove from Wishlist"
        aria-label="Remove from Wishlist"
      >
        <X className="w-3.5 h-3.5 group-hover/remove:scale-110 transition-transform" />
      </button>

      {/* Discount badge */}
      {discount > 0 && (
        <div className="absolute top-2.5 right-11 z-10">
          <span className="bg-[#FF3B30] text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
            {discount}% OFF
          </span>
        </div>
      )}

      {/* Product Image */}
      <Link href={`/products/${product.slug || product.id}`}>
        <div className="relative h-44 bg-slate-50 overflow-hidden rounded-t-2xl flex items-center justify-center">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
          />
          {product.badge && (
            <span className="absolute bottom-2 left-2 bg-slate-900 text-blue-400 text-[8px] font-black px-2 py-0.5 rounded-md uppercase">
              {product.badge}
            </span>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-3 flex-1 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">
            {product.sku}
          </span>
          <div className="flex items-center gap-0.5 text-amber-400">
            <Star className="w-2.5 h-2.5 fill-current" />
            <span className="text-[10px] font-bold text-slate-700">
              {Number(product.rating || 4.8).toFixed(1)}
            </span>
          </div>
        </div>

        <Link href={`/products/${product.slug || product.id}`}>
          <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug hover:text-[#2563EB] transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Price row */}
        <div className="flex items-baseline gap-2 mt-auto">
          <span className="text-sm font-extrabold text-slate-900">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
          {product.mrp > product.price && (
            <span className="text-[10px] text-slate-400 line-through">
              ₹{product.mrp.toLocaleString("en-IN")}
            </span>
          )}
          {discount > 0 && (
            <span className="text-[10px] font-black text-emerald-600">
              {discount}% off
            </span>
          )}
        </div>

        {/* Stock status */}
        <span
          className={`text-[9px] font-bold self-start px-2 py-0.5 rounded-md ${
            product.inStock
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {product.inStock ? "✓ In Stock" : "✗ Out of Stock"}
        </span>

        {/* Actions */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5">
          {product.inStock ? (
            <button
              onClick={onMoveToCart}
              className={`flex-1 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                movedToCart
                  ? "bg-emerald-600 text-white border border-emerald-600"
                  : "border border-[#2563EB] text-[#2563EB] hover:bg-[#2563EB] hover:text-white"
              }`}
            >
              {movedToCart ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Added!
                </>
              ) : (
                <>
                  <AddToCartIcon className="w-3.5 h-3.5" /> Add to Cart
                </>
              )}
            </button>
          ) : (
            <a
              href={`https://wa.me/918709789641?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-[10px] font-extrabold flex items-center justify-center gap-1.5 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Notify Me
            </a>
          )}

          <button
            onClick={onRemove}
            title="Remove from Wishlist"
            aria-label="Remove from Wishlist"
            className="p-2 rounded-xl border border-slate-200 hover:border-rose-300 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Wishlist Item Row (List View) ─────────────────────────────────
const WishlistRow: React.FC<{
  product: Product;
  isSelected: boolean;
  onToggleSelect: () => void;
  onRemove: () => void;
  onMoveToCart: () => void;
  movedToCart: boolean;
}> = ({
  product,
  isSelected,
  onToggleSelect,
  onRemove,
  onMoveToCart,
  movedToCart,
}) => {
  const discount = getDiscount(product);

  return (
    <div
      className={`bg-white border rounded-2xl p-3 sm:p-3.5 transition-all hover:shadow-md ${
        isSelected
          ? "border-[#2563EB] ring-2 ring-[#2563EB]/20"
          : "border-slate-200 hover:border-[#2563EB]/40"
      }`}
    >
      {/* ── MOBILE VIEW (< sm): Clean stacked layout with zero text/button collisions ── */}
      <div className="flex sm:hidden flex-col gap-2.5">
        <div className="flex items-start gap-2.5">
          {/* Checkbox */}
          <button
            type="button"
            onClick={onToggleSelect}
            aria-label={isSelected ? "Deselect item" : "Select item"}
            className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 cursor-pointer transition-all mt-0.5 active:scale-95"
            style={{
              backgroundColor: isSelected ? "#2563EB" : "white",
              borderColor: isSelected ? "#2563EB" : "#CBD5E1",
            }}
          >
            {isSelected && <Check className="w-3 h-3 text-white" />}
          </button>

          {/* Product Image */}
          <Link href={`/products/${product.slug || product.id}`} className="shrink-0">
            <div className="relative w-16 h-16 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 flex items-center justify-center">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="64px"
                className="object-contain p-1"
              />
            </div>
          </Link>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1.5">
              <Link href={`/products/${product.slug || product.id}`} className="flex-1 min-w-0">
                <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug hover:text-[#2563EB] transition-colors">
                  {product.name}
                </h3>
              </Link>
              <button
                type="button"
                onClick={onRemove}
                className="p-1 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer shrink-0 -mr-1"
                title="Remove from Wishlist"
                aria-label="Remove from Wishlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Price & Stock */}
            <div className="flex items-baseline gap-1.5 mt-1.5 flex-wrap">
              <span className="text-sm font-extrabold text-slate-900">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              {product.mrp > product.price && (
                <span className="text-[10px] text-slate-400 line-through">
                  ₹{product.mrp.toLocaleString("en-IN")}
                </span>
              )}
              {discount > 0 && (
                <span className="text-[10px] font-black text-[#FF3B30]">
                  {discount}% OFF
                </span>
              )}
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  product.inStock
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {product.inStock ? "✓ In Stock" : "✗ Out of Stock"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button Row */}
        <div className="pt-2 border-t border-slate-100">
          {product.inStock ? (
            <button
              type="button"
              onClick={onMoveToCart}
              className={`w-full py-2 px-3 rounded-xl text-[11px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                movedToCart
                  ? "bg-emerald-600 text-white border border-emerald-600 shadow-xs"
                  : "border border-[#2563EB] text-[#2563EB] hover:bg-[#2563EB] hover:text-white shadow-2xs"
              }`}
            >
              {movedToCart ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Added to Cart
                </>
              ) : (
                <>
                  <AddToCartIcon className="w-3.5 h-3.5" /> Add to Cart
                </>
              )}
            </button>
          ) : (
            <span className="w-full text-center text-[10px] font-bold text-slate-400 bg-slate-100 py-1.5 px-3 rounded-xl block">
              Out of Stock
            </span>
          )}
        </div>
      </div>

      {/* ── DESKTOP VIEW (>= sm): Horizontal Row ── */}
      <div className="hidden sm:flex items-center gap-4">
        {/* Checkbox */}
        <button
          type="button"
          onClick={onToggleSelect}
          className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 cursor-pointer transition-all"
          style={{
            backgroundColor: isSelected ? "#2563EB" : "white",
            borderColor: isSelected ? "#2563EB" : "#CBD5E1",
          }}
        >
          {isSelected && <Check className="w-3 h-3 text-white" />}
        </button>

        {/* Image */}
        <Link href={`/products/${product.slug || product.id}`}>
          <div className="relative w-16 h-16 shrink-0 bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain p-1"
            />
          </div>
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-0.5">
          {product.sku && (
            <span className="text-[9px] font-mono text-slate-400 block">
              {product.sku}
            </span>
          )}
          <Link href={`/products/${product.slug || product.id}`}>
            <h3 className="text-xs font-bold text-slate-900 line-clamp-1 hover:text-[#2563EB] transition-colors">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-extrabold text-slate-900">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            {product.mrp > product.price && (
              <span className="text-[10px] text-slate-400 line-through">
                ₹{product.mrp.toLocaleString("en-IN")}
              </span>
            )}
            {discount > 0 && (
              <span className="text-[10px] font-black text-[#FF3B30]">
                {discount}% OFF
              </span>
            )}
            <span
              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                product.inStock
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {product.inStock ? "✓ In Stock" : "✗ OOS"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {product.inStock ? (
            <button
              type="button"
              onClick={onMoveToCart}
              className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                movedToCart
                  ? "bg-emerald-600 text-white border border-emerald-600"
                  : "border border-[#2563EB] text-[#2563EB] hover:bg-[#2563EB] hover:text-white"
              }`}
            >
              {movedToCart ? (
                <>
                  <CheckCircle2 className="w-3 h-3" /> Added
                </>
              ) : (
                <>
                  <AddToCartIcon className="w-3.5 h-3.5" /> Add to Cart
                </>
              )}
            </button>
          ) : (
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-2 rounded-xl">
              Out of Stock
            </span>
          )}
          <button
            type="button"
            onClick={onRemove}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
            title="Remove"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ── MAIN WISHLIST VIEW ────────────────────────────────────────────
export interface WishlistViewProps {
  embedded?: boolean;
}

export const WishlistView: React.FC<WishlistViewProps> = ({
  embedded = false,
}) => {
  const { wishlist, toggleWishlist, addToCart, moveToCart } = useStore();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [movedIds, setMovedIds] = useState<Set<string>>(new Set());
  const [shareUrl, setShareUrl] = useState("");
  const [shareCopied, setShareCopied] = useState(false);
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [bulkMovedFeedback, setBulkMovedFeedback] = useState(false);

  const processedWishlist = wishlist;

  // ── Selection helpers
  const allSelected =
    selectedIds.size === processedWishlist.length &&
    processedWishlist.length > 0;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(processedWishlist.map((p) => p.id)));
  };

  // ── Move to cart with feedback flash
  const handleMoveToCart = (product: Product) => {
    addToCart(product);
    setMovedIds((prev) => new Set([...prev, product.id]));
    setTimeout(() => {
      setMovedIds((prev) => {
        const n = new Set(prev);
        n.delete(product.id);
        return n;
      });
    }, 2500);
  };

  // ── Bulk Move to Cart
  const handleBulkMoveToCart = () => {
    const selected = wishlist.filter((p) => selectedIds.has(p.id) && p.inStock);
    selected.forEach((p) => addToCart(p));
    setBulkMovedFeedback(true);
    setTimeout(() => {
      setBulkMovedFeedback(false);
      setSelectedIds(new Set());
    }, 2500);
  };

  // ── Bulk Remove
  const handleBulkRemove = () => {
    wishlist
      .filter((p) => selectedIds.has(p.id))
      .forEach((p) => toggleWishlist(p));
    setSelectedIds(new Set());
  };

  // ── Share Wishlist (generates a mock URL)
  const handleShare = () => {
    const ids = wishlist.map((p) => p.id).join(",");
    const url = `${window.location.origin}/wishlist/shared?items=${ids}`;
    setShareUrl(url);
    setShowSharePanel(true);
  };

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    });
  };

  // ── Stats
  const inStockCount = processedWishlist.filter((p) => p.inStock).length;

  // ── Empty State
  if (wishlist.length === 0) {
    const recommended = PRODUCTS.slice(0, 4);

    return (
      <div
        className={
          embedded
            ? "space-y-5 animate-in fade-in duration-300 w-full"
            : "w-full px-3.5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-3.5 sm:py-6 space-y-6 sm:space-y-8 animate-in fade-in duration-300 font-sans"
        }
      >
        {!embedded && <CategoryBreadcrumb items={[{ label: "My Wishlist" }]} />}

        {/* Clean, Simple & Beautiful Empty State (Matches Cart) */}
        <div className="py-4 sm:py-8 text-center max-w-md mx-auto space-y-3.5">
          <div className="relative w-36 h-28 sm:w-44 sm:h-34 mx-auto">
            <Image
              src="/images/empty-wishlist-robot.png"
              alt="Your Wishlist is Empty"
              fill
              className="object-contain mix-blend-multiply"
              priority
            />
          </div>

          <div className="max-w-xs mx-auto">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Your Wishlist is Empty
            </h1>
          </div>

          {/* Quick Popular Categories */}
          <div className="space-y-2 pt-1">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Popular Categories
            </p>
            <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-xs mx-auto">
              {[
                { label: "Robotics Kits", href: "/categories/robotics" },
                { label: "Arduino", href: "/categories/development-boards" },
                { label: "Sensors", href: "/categories/sensors-iot" },
                { label: "Drones & RC", href: "/categories/drone-technology" },
                { label: "Top Deals", href: "/#top-deals" },
              ].map((cat) => (
                <Link
                  key={cat.label}
                  href={cat.href}
                  className="px-2.5 py-1 rounded-lg border border-slate-200/80 bg-white hover:bg-blue-50 text-[11px] font-medium text-slate-600 hover:text-[#2563EB] hover:border-[#2563EB]/40 transition-colors shadow-2xs"
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Primary Action Button (Below Filter, matching Cart) */}
          <div className="pt-1.5">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Trending / Recommended Products Grid */}
        <div className="max-w-4xl mx-auto space-y-4 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Recommended Products
            </h2>
            <Link
              href="/products"
              className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {recommended.map((p) => (
              <div
                key={p.id}
                className="group bg-white rounded-xl border border-slate-200/80 p-3 flex flex-col justify-between hover:border-[#2563EB]/40 hover:shadow-xs transition-all"
              >
                <Link href={`/products/${p.slug || p.id}`} className="space-y-2 block">
                  <div className="relative aspect-square w-full rounded-lg bg-slate-50 overflow-hidden flex items-center justify-center p-2">
                    <Image
                      src={p.image}
                      alt={p.name}
                      width={120}
                      height={120}
                      className="object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-xs font-semibold text-slate-900 group-hover:text-[#2563EB] line-clamp-2 transition-colors">
                    {p.name}
                  </h3>
                  <div className="flex items-baseline gap-1.5 pt-0.5">
                    <span className="text-xs sm:text-sm font-bold text-slate-900">
                      ₹{p.price.toLocaleString("en-IN")}
                    </span>
                    {p.mrp > p.price && (
                      <span className="text-[10px] text-slate-400 line-through">
                        ₹{p.mrp.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                </Link>

                <div className="pt-2.5 mt-auto flex items-center gap-1.5">
                  <button
                    onClick={() => addToCart(p, undefined, 1)}
                    className="flex-1 bg-slate-900 hover:bg-[#2563EB] text-white py-1.5 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <ShoppingCart className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                  <button
                    onClick={() => toggleWishlist(p)}
                    className="p-1.5 rounded-lg border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                    title="Add to Wishlist"
                  >
                    <Heart className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        embedded
          ? "space-y-4 sm:space-y-6 animate-in fade-in duration-300 w-full"
          : "w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-3.5 sm:py-6 pb-28 sm:pb-12 space-y-4 sm:space-y-6 animate-in fade-in duration-300 font-sans"
      }
    >
      {/* Breadcrumb */}
      {!embedded && <CategoryBreadcrumb items={[{ label: "My Wishlist" }]} />}

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between gap-3 pt-0.5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            My Wishlist
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            {wishlist.length} saved item{wishlist.length !== 1 ? "s" : ""} ·{" "}
            <span className="text-emerald-600 font-bold">{inStockCount} in stock</span>
          </p>
        </div>

        {/* Share Wishlist */}
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-1.5 bg-slate-900 hover:bg-[#2563EB] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all active:scale-95 cursor-pointer shadow-xs shrink-0"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Share Wishlist</span>
          <span className="sm:hidden">Share</span>
        </button>
      </div>

      {/* ── Share Panel ── */}
      {showSharePanel && (
        <div className="bg-blue-50/70 border border-blue-200/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 animate-in fade-in">
          <Info className="w-4 h-4 text-[#2563EB] shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#2563EB] mb-1">
              Share this link with friends or colleagues:
            </p>
            <div className="flex items-center gap-2 bg-white border border-blue-200/60 rounded-xl px-3 py-2 text-[10px] font-mono text-slate-600 break-all">
              <span className="flex-1 truncate">{shareUrl}</span>
              <button
                onClick={copyShareUrl}
                className="shrink-0 text-[#2563EB] hover:text-[#1D4ED8] cursor-pointer"
              >
                {shareCopied ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowSharePanel(false)}
            className="text-slate-400 hover:text-slate-700 cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Selection Action Bar (appears only when items are checked) ── */}
      {selectedIds.size > 0 && (
        <div className="bg-white border border-[#2563EB]/40 rounded-2xl p-2.5 sm:px-4 sm:py-3 shadow-md flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-1 font-sans">
          {/* Left: Badge Counter + Selected / Clear */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-6 h-6 rounded-full bg-[#2563EB] text-white text-xs font-black flex items-center justify-center shrink-0 shadow-2xs">
              {selectedIds.size}
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 leading-tight">
              <span className="text-xs font-extrabold text-slate-900 whitespace-nowrap">
                Selected
              </span>
              <button
                type="button"
                onClick={toggleSelectAll}
                className="text-[11px] font-bold text-slate-500 hover:text-[#2563EB] cursor-pointer whitespace-nowrap text-left"
              >
                {allSelected ? "Clear All" : "Select All"}
              </button>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleBulkMoveToCart}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 whitespace-nowrap ${
                bulkMovedFeedback
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-xs"
              }`}
            >
              {bulkMovedFeedback ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Added
                </>
              ) : (
                <>
                  <AddToCartIcon className="w-3.5 h-3.5" />
                  <span>Move to Cart</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleBulkRemove}
              className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-colors cursor-pointer shrink-0 border border-rose-200/80 active:scale-95"
              title="Remove selected"
              aria-label="Remove selected"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Products Display: Mobile Rows (< sm) & Desktop Grid (>= sm) ── */}
      <div className="sm:hidden space-y-2.5">
        {processedWishlist.map((product) => (
          <WishlistRow
            key={product.id}
            product={product}
            isSelected={selectedIds.has(product.id)}
            onToggleSelect={() => toggleSelect(product.id)}
            onRemove={() => toggleWishlist(product)}
            onMoveToCart={() => handleMoveToCart(product)}
            movedToCart={movedIds.has(product.id)}
          />
        ))}
      </div>

      <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {processedWishlist.map((product) => (
          <WishlistCard
            key={product.id}
            product={product}
            isSelected={selectedIds.has(product.id)}
            onToggleSelect={() => toggleSelect(product.id)}
            onRemove={() => toggleWishlist(product)}
            onMoveToCart={() => handleMoveToCart(product)}
            movedToCart={movedIds.has(product.id)}
          />
        ))}
      </div>
    </div>
  );
};
