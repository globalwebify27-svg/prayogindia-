"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { CategoryBreadcrumb } from "@/components/categories/CategoryBreadcrumb";
import { useStore } from "@/context/StoreContext";
import { Product } from "@/data/mockData";
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowRight,
  MessageSquare,
  Star,
  Zap,
  Share2,
  CheckCircle2,
  Grid3X3,
  List,
  X,
  Bell,
  Package,
  BadgePercent,
  Info,
  ShoppingBag,
  MoveRight,
  Copy,
  Check,
} from "lucide-react";

type SortMode = "default" | "price-asc" | "price-desc" | "name" | "discount";
type ViewMode = "grid" | "list";

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
          ? "border-[#00AEEF] ring-2 ring-[#00AEEF]/20 shadow-md"
          : "border-slate-200 hover:border-[#00AEEF]/50 hover:shadow-lg"
      }`}
    >
      {/* Selection checkbox */}
      <button
        onClick={onToggleSelect}
        className="absolute top-2.5 left-2.5 z-10 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer"
        style={{
          backgroundColor: isSelected ? "#00AEEF" : "rgba(255,255,255,0.9)",
          borderColor: isSelected ? "#00AEEF" : "#CBD5E1",
        }}
      >
        {isSelected && <Check className="w-3 h-3 text-white" />}
      </button>

      {/* Remove button */}
      <button
        onClick={onRemove}
        className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white/90 text-slate-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm cursor-pointer"
        title="Remove from Wishlist"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Discount badge */}
      {discount > 0 && (
        <div className="absolute top-2.5 right-10 z-10">
          <span className="bg-[#FF3B30] text-white text-[9px] font-black px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
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
            <span className="absolute bottom-2 left-2 bg-slate-900 text-[#00AEEF] text-[8px] font-black px-2 py-0.5 rounded-md uppercase">
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
              {product.rating}
            </span>
          </div>
        </div>

        <Link href={`/products/${product.slug || product.id}`}>
          <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug hover:text-[#00AEEF] transition-colors">
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
        <div className="pt-2 border-t border-slate-100 space-y-1.5">
          {product.inStock ? (
            <button
              onClick={onMoveToCart}
              className={`w-full py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                movedToCart
                  ? "bg-emerald-600 text-white"
                  : "bg-[#00AEEF] hover:bg-[#0096D6] text-white shadow-sm shadow-[#00AEEF]/20"
              }`}
            >
              {movedToCart ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5" /> Move to Cart
                </>
              )}
            </button>
          ) : (
            <a
              href={`https://wa.me/919876543210?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-[10px] font-extrabold flex items-center justify-center gap-1.5 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Notify Me
            </a>
          )}
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
      className={`bg-white border rounded-2xl flex items-center gap-4 p-3.5 transition-all hover:shadow-md ${
        isSelected
          ? "border-[#00AEEF] ring-2 ring-[#00AEEF]/20"
          : "border-slate-200 hover:border-[#00AEEF]/40"
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={onToggleSelect}
        className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 cursor-pointer transition-all"
        style={{
          backgroundColor: isSelected ? "#00AEEF" : "white",
          borderColor: isSelected ? "#00AEEF" : "#CBD5E1",
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
        <span className="text-[9px] font-mono text-slate-400">
          {product.sku}
        </span>
        <Link href={`/products/${product.slug || product.id}`}>
          <h3 className="text-xs font-bold text-slate-900 line-clamp-1 hover:text-[#00AEEF] transition-colors">
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
            onClick={onMoveToCart}
            className={`text-[10px] font-extrabold px-3 py-2 rounded-xl flex items-center gap-1 transition-all cursor-pointer ${
              movedToCart
                ? "bg-emerald-600 text-white"
                : "bg-[#00AEEF] hover:bg-[#0096D6] text-white"
            }`}
          >
            {movedToCart ? (
              <>
                <CheckCircle2 className="w-3 h-3" /> Added
              </>
            ) : (
              <>
                <ShoppingCart className="w-3 h-3" /> Move to Cart
              </>
            )}
          </button>
        ) : (
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-2 rounded-xl">
            Out of Stock
          </span>
        )}
        <button
          onClick={onRemove}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
          title="Remove"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ── MAIN WISHLIST VIEW ────────────────────────────────────────────
export const WishlistView: React.FC = () => {
  const { wishlist, toggleWishlist, addToCart, moveToCart } = useStore();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortMode, setSortMode] = useState<SortMode>("default");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filterStock, setFilterStock] = useState<
    "all" | "inStock" | "outOfStock"
  >("all");
  const [movedIds, setMovedIds] = useState<Set<string>>(new Set());
  const [shareUrl, setShareUrl] = useState("");
  const [shareCopied, setShareCopied] = useState(false);
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [bulkMovedFeedback, setBulkMovedFeedback] = useState(false);

  // ── Sorting + Filtering
  const processedWishlist = useMemo(() => {
    let items = [...wishlist];

    if (filterStock === "inStock") items = items.filter((p) => p.inStock);
    if (filterStock === "outOfStock") items = items.filter((p) => !p.inStock);

    switch (sortMode) {
      case "price-asc":
        return items.sort((a, b) => a.price - b.price);
      case "price-desc":
        return items.sort((a, b) => b.price - a.price);
      case "name":
        return items.sort((a, b) => a.name.localeCompare(b.name));
      case "discount":
        return items.sort((a, b) => getDiscount(b) - getDiscount(a));
      default:
        return items;
    }
  }, [wishlist, sortMode, filterStock]);

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
  const totalValue = processedWishlist.reduce((acc, p) => acc + p.price, 0);
  const totalSavings = processedWishlist.reduce(
    (acc, p) => acc + Math.max(0, p.mrp - p.price),
    0,
  );
  const inStockCount = processedWishlist.filter((p) => p.inStock).length;

  // ── Empty State
  if (wishlist.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 animate-in fade-in duration-300">
        <CategoryBreadcrumb items={[{ label: "My Wishlist" }]} />
        <div className="py-24 text-center bg-gradient-to-br from-slate-50 to-white rounded-3xl border border-slate-200 space-y-5 max-w-lg mx-auto">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-50 to-rose-50 text-[#FF3B30] flex items-center justify-center mx-auto border border-red-100 shadow-sm">
            <Heart className="w-10 h-10" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900">
              Your Wishlist is Empty
            </h1>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Save microcontrollers, sensors, drone parts, and robotics kits you
              love — and come back to buy them anytime.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-[#00AEEF] hover:bg-[#0096D6] text-white font-extrabold px-6 py-3 rounded-full text-xs uppercase tracking-wider transition-all shadow-md shadow-[#00AEEF]/20 active:scale-95"
          >
            Explore Products Catalogue <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-300">
      {/* Breadcrumb */}
      <CategoryBreadcrumb items={[{ label: "My Wishlist" }]} />

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#E0F7FC] px-3 py-1 rounded-full inline-block border border-[#00AEEF]/20">
              Saved Items
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1.5">
            My Wishlist
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {wishlist.length} saved item{wishlist.length !== 1 ? "s" : ""} ·{" "}
            {inStockCount} available to buy now
          </p>
        </div>

        {/* Share Wishlist */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-[#00AEEF] text-white text-[11px] font-extrabold px-4 py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5" /> Share Wishlist
          </button>
        </div>
      </div>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Saved Items",
            value: wishlist.length,
            icon: <Heart className="w-4 h-4 text-red-500" />,
            color: "text-slate-900",
          },
          {
            label: "In Stock",
            value: inStockCount,
            icon: <Package className="w-4 h-4 text-emerald-600" />,
            color: "text-emerald-700",
          },
          {
            label: "Total Value",
            value: `₹${totalValue.toLocaleString("en-IN")}`,
            icon: <ShoppingCart className="w-4 h-4 text-[#00AEEF]" />,
            color: "text-[#00AEEF]",
          },
          {
            label: "Total Savings",
            value: `₹${totalSavings.toLocaleString("en-IN")}`,
            icon: <BadgePercent className="w-4 h-4 text-amber-600" />,
            color: "text-amber-700",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
              {stat.icon}
            </div>
            <div>
              <div className={`text-base font-extrabold ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-[10px] text-slate-400 font-semibold">
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Share Panel ── */}
      {showSharePanel && (
        <div className="bg-[#E0F7FC] border border-[#00AEEF]/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 animate-in fade-in">
          <Info className="w-4 h-4 text-[#00AEEF] shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#00AEEF] mb-1">
              Share this link with friends or colleagues:
            </p>
            <div className="flex items-center gap-2 bg-white border border-[#00AEEF]/30 rounded-xl px-3 py-2 text-[10px] font-mono text-slate-600 break-all">
              <span className="flex-1 truncate">{shareUrl}</span>
              <button
                onClick={copyShareUrl}
                className="shrink-0 text-[#00AEEF] hover:text-[#0096D6] cursor-pointer"
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

      {/* ── Toolbar: Bulk Actions + Filters + Sort + View Mode ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
        {/* Left — select all + bulk actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            <div
              className="w-4 h-4 rounded border-2 flex items-center justify-center"
              style={{
                backgroundColor: allSelected ? "#00AEEF" : "white",
                borderColor: allSelected ? "#00AEEF" : "#CBD5E1",
              }}
            >
              {allSelected && <Check className="w-2.5 h-2.5 text-white" />}
            </div>
            {allSelected ? "Deselect All" : "Select All"}
          </button>

          {selectedIds.size > 0 && (
            <>
              <span className="text-[10px] text-slate-400 font-bold">
                {selectedIds.size} selected
              </span>

              <button
                onClick={handleBulkMoveToCart}
                className={`flex items-center gap-1 text-[10px] font-extrabold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  bulkMovedFeedback
                    ? "bg-emerald-600 text-white"
                    : "bg-[#00AEEF] hover:bg-[#0096D6] text-white"
                }`}
              >
                {bulkMovedFeedback ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" /> Done!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-3 h-3" /> Move to Cart
                  </>
                )}
              </button>

              <button
                onClick={handleBulkRemove}
                className="flex items-center gap-1 text-[10px] font-extrabold px-3 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all cursor-pointer border border-red-200"
              >
                <Trash2 className="w-3 h-3" /> Remove
              </button>
            </>
          )}
        </div>

        {/* Right — Filter + Sort + View */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Stock filter */}
          <select
            value={filterStock}
            onChange={(e) =>
              setFilterStock(e.target.value as "all" | "inStock" | "outOfStock")
            }
            className="text-[11px] font-bold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#00AEEF] cursor-pointer"
          >
            <option value="all">All Items</option>
            <option value="inStock">In Stock Only</option>
            <option value="outOfStock">Out of Stock</option>
          </select>

          {/* Sort */}
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="text-[11px] font-bold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#00AEEF] cursor-pointer"
          >
            <option value="default">Sort: Default</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="name">Name: A → Z</option>
            <option value="discount">Highest Discount</option>
          </select>

          {/* View Mode */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 gap-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg cursor-pointer transition-colors ${viewMode === "grid" ? "bg-[#00AEEF] text-white" : "text-slate-400 hover:text-slate-700"}`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg cursor-pointer transition-colors ${viewMode === "list" ? "bg-[#00AEEF] text-white" : "text-slate-400 hover:text-slate-700"}`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Products Grid or List ── */}
      {processedWishlist.length === 0 ? (
        <div className="py-12 text-center bg-slate-50 rounded-2xl border border-slate-200">
          <p className="text-sm font-bold text-slate-500">
            No items match the selected filter.
          </p>
          <button
            onClick={() => setFilterStock("all")}
            className="text-[#00AEEF] text-xs font-bold mt-2 hover:underline cursor-pointer"
          >
            Clear Filter
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
      ) : (
        <div className="space-y-2.5">
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
      )}

      {/* ── Quick Actions Footer ── */}
      <div className="bg-gradient-to-r from-slate-900 to-[#0F172A] text-white rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-700">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#00AEEF]" />
            <span className="text-xs font-extrabold text-white uppercase tracking-wider">
              Move All In-Stock Items to Cart
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">
            {inStockCount} item{inStockCount !== 1 ? "s" : ""} ready to buy now
            · Save ₹{totalSavings.toLocaleString("en-IN")} today
          </p>
        </div>
        <button
          onClick={() => {
            wishlist.filter((p) => p.inStock).forEach((p) => addToCart(p));
            setBulkMovedFeedback(true);
            setTimeout(() => setBulkMovedFeedback(false), 2500);
          }}
          className="flex items-center gap-2 bg-[#00AEEF] hover:bg-[#0096D6] text-white font-extrabold text-xs uppercase tracking-wider px-6 py-3 rounded-2xl transition-all active:scale-95 cursor-pointer shadow-md shadow-[#00AEEF]/30 whitespace-nowrap"
        >
          {bulkMovedFeedback ? (
            <>
              <CheckCircle2 className="w-4 h-4" /> All Added!
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" /> Add All {inStockCount} to Cart
              <MoveRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* ── Wishlist Insights Info Banner ── */}
      <div className="bg-[#E0F7FC]/50 border border-[#00AEEF]/20 rounded-2xl px-5 py-4 flex items-start gap-3">
        <Bell className="w-4 h-4 text-[#00AEEF] shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 space-y-1">
          <p className="font-extrabold text-slate-800">
            Price Drop Alerts & Wishlist Insights
          </p>
          <p className="font-medium leading-relaxed">
            We use your wishlist activity to send personalized price drop
            alerts, restock notifications, and curated product recommendations.
            Sign in to sync your wishlist across devices and enable
            notifications.
          </p>
          <Link
            href="/account"
            className="text-[#00AEEF] font-extrabold hover:underline inline-flex items-center gap-1 mt-1"
          >
            Sign in to sync wishlist <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};
