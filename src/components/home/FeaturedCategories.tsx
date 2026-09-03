"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  ShoppingBag,
  Star,
} from "lucide-react";
import { PRODUCTS, Product } from "@/data/mockData";

interface Props {
  onSelectCategory?: (category: string) => void;
  onAddToCart?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  wishlistIds?: string[];
}

export const FeaturedCategories: React.FC<Props> = ({
  onSelectCategory,
  onAddToCart,
  onToggleWishlist,
  wishlistIds = [],
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Repeat items for seamless infinite smooth scrolling
  const featuredProducts = [...PRODUCTS.slice(0, 10), ...PRODUCTS.slice(0, 10)];

  // Continuous buttery smooth auto-scrolling
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const smoothScroll = (currentTime: number) => {
      const delta = currentTime - lastTime;
      lastTime = currentTime;

      if (!isPaused && scrollContainerRef.current) {
        // Smooth continuous 0.5px/frame drift
        const pixelsToScroll = 0.06 * delta;
        scrollContainerRef.current.scrollLeft += pixelsToScroll;

        // When half the duplicate items have scrolled through, seamlessly reset to start
        const maxScroll = scrollContainerRef.current.scrollWidth / 2;
        if (scrollContainerRef.current.scrollLeft >= maxScroll) {
          scrollContainerRef.current.scrollLeft -= maxScroll;
        }
      }

      animationFrameId = requestAnimationFrame(smoothScroll);
    };

    animationFrameId = requestAnimationFrame(smoothScroll);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPaused]);

  const handleManualScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-6 sm:py-8 lg:py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-5">
        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-black text-[#1E1B4B] tracking-tight">
              Featured Products
            </h2>
            <div className="h-1 w-12 bg-[#3B82F6] rounded-full hidden sm:block" />
          </div>

          <Link
            href="/products?filter=featured"
            className="text-xs font-bold text-[#4338CA] hover:text-[#3730A3] border border-[#C7D2FE] hover:border-[#818CF8] px-4 py-1.5 rounded-xl transition-all shadow-xs"
          >
            View All
          </Link>
        </div>

        {/* Main Grid: Left Banner + Right Product Slider */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch relative">
          {/* Left Promo Card */}
          <div className="lg:col-span-3 bg-gradient-to-b from-[#F8FAFC] to-[#EEF2F6] border border-slate-200/90 rounded-2xl p-6 flex flex-col justify-between overflow-hidden relative shadow-xs min-h-[380px]">
            <div className="relative z-10 space-y-2">
              <h3 className="text-xl font-extrabold text-[#1E293B] leading-snug">
                Welcome to Our Store
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Big Screen in incredibly Slim Designs...
              </p>
              <div className="pt-2">
                <Link
                  href="/products"
                  className="inline-block bg-[#00AEEF] hover:bg-[#0098D4] text-white text-xs font-black px-5 py-2.5 rounded-xl shadow-md shadow-[#00AEEF]/20 hover:shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                  Shop Now
                </Link>
              </div>
            </div>

            {/* Banner Bottom Hardware Illustration / Image */}
            <div className="relative w-full h-44 mt-4">
              <Image
                src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80"
                alt="Electronics and Multimeter Hardware Tools"
                fill
                className="object-contain object-bottom drop-shadow-md"
              />
            </div>
          </div>

          {/* Right Product Slider Container */}
          <div
            className="lg:col-span-9 relative group overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Scroll Navigation Arrows */}
            <button
              onClick={() => handleManualScroll("left")}
              aria-label="Previous Products"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/95 border border-slate-200 shadow-lg text-slate-700 hover:text-slate-950 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleManualScroll("right")}
              aria-label="Next Products"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/95 border border-slate-200 shadow-lg text-slate-700 hover:text-slate-950 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Continuous Smooth Scrollable Track */}
            <div
              ref={scrollContainerRef}
              className="flex gap-4 overflow-x-hidden py-1 select-none"
            >
              {featuredProducts.map((product, idx) => {
                const isWishlisted = wishlistIds.includes(product.id);

                return (
                  <div
                    key={`${product.id}-${idx}`}
                    className="w-[240px] sm:w-[260px] shrink-0 bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:border-[#00AEEF]/50 hover:shadow-md transition-all duration-300 relative group/card"
                  >
                    {/* Card Header: Category & Wishlist Button */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-slate-600 truncate">
                        {product.category}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          onToggleWishlist?.(product);
                        }}
                        aria-label="Toggle Wishlist"
                        className={`w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center transition-all ${
                          isWishlisted
                            ? "bg-rose-50 border-rose-300 text-rose-600"
                            : "bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-700"
                        }`}
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${isWishlisted ? "fill-current" : ""}`}
                        />
                      </button>
                    </div>

                    {/* Product Image */}
                    <Link
                      href={`/products/${product.slug || product.id}`}
                      className="relative h-36 w-full my-3 flex items-center justify-center overflow-hidden"
                    >
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain p-2 group-hover/card:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    {/* Product Info */}
                    <div className="space-y-1.5">
                      <Link
                        href={`/products/${product.slug || product.id}`}
                        className="block font-bold text-xs text-slate-900 truncate hover:text-[#00AEEF] transition-colors"
                        title={product.name}
                      >
                        {product.name}
                      </Link>

                      <div className="text-[10px] font-bold text-slate-500 font-mono">
                        SKU: {product.sku}
                      </div>

                      {/* 5-Star Rating */}
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <div className="flex text-slate-300">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < Math.floor(product.rating || 4)
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-slate-200 fill-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-medium text-slate-400">
                          ({product.reviews || 0})
                        </span>
                      </div>

                      {/* Price Tag with GST */}
                      <div className="pt-1 flex items-baseline gap-1">
                        <span className="text-sm font-black text-slate-900">
                          ₹{product.price.toLocaleString("en-IN")}.00
                        </span>
                        <span className="text-[9px] font-semibold text-slate-400">
                          (Incl. GST)
                        </span>
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      type="button"
                      onClick={() => onAddToCart?.(product)}
                      className="mt-3 w-full py-2 px-3 rounded-xl border border-[#00AEEF] hover:bg-[#00AEEF] text-[#00AEEF] hover:text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-xs cursor-pointer"
                    >
                      <span>Add to Cart</span>
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
