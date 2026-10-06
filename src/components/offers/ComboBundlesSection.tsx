"use client";

import React, { useState } from "react";
import Image from "next/image";
import { COMBO_BUNDLES_DATA, ComboBundle } from "@/data/offersData";
import { PRODUCTS } from "@/data/mockData";
import { useStore } from "@/context/StoreContext";
import {
  Package,
  Plus,
  ArrowRight,
  Check,
  ShoppingBag,
  Sparkles,
  Zap,
  Tag,
  ShieldCheck,
} from "lucide-react";
import { haptic } from "@/utils/haptics";

export const ComboBundlesSection: React.FC = () => {
  const store = useStore();
  const [addedBundleId, setAddedBundleId] = useState<string | null>(null);

  const handleAddBundleToCart = (bundle: ComboBundle) => {
    haptic?.medium?.();

    // Find full product objects from PRODUCTS data
    bundle.productIds.forEach((pid) => {
      const fullProd = PRODUCTS.find((p) => p.id === pid);
      if (fullProd && store?.addToCart) {
        store.addToCart(fullProd);
      }
    });

    setAddedBundleId(bundle.id);
    setTimeout(() => {
      setAddedBundleId(null);
    }, 3000);
  };

  return (
    <div id="combo-bundles" className="space-y-6 pt-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-6 bg-emerald-500 rounded-full" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Curated Lab &amp; Maker Combo Bundles</span>
              <Package className="w-5 h-5 text-emerald-600" />
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Engineered hardware combos bundled together with instant package discounts. Add all parts to cart in 1-click.
          </p>
        </div>

        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full self-start sm:self-auto">
          ⚡ 1-Click Multi-Item Add
        </span>
      </div>

      {/* Bundles List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {COMBO_BUNDLES_DATA.map((bundle) => {
          const isAdded = addedBundleId === bundle.id;

          return (
            <div
              key={bundle.id}
              className="bg-white rounded-3xl border border-slate-200 hover:border-emerald-400/80 shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between space-y-6 group"
            >
              {/* Header & Badges */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-500 text-white shadow-xs flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {bundle.badge}
                  </span>
                  <span className="text-[11px] text-slate-400 font-bold">
                    {bundle.items.length} Products Combo
                  </span>
                </div>

                <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-600 transition-colors">
                  {bundle.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {bundle.tagline}
                </p>
              </div>

              {/* Interconnected Product Visuals */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-2">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  What's Inside This Bundle:
                </div>

                <div className="flex items-center justify-between gap-1 overflow-x-auto py-1">
                  {bundle.items.map((item, index) => (
                    <React.Fragment key={item.id}>
                      <div className="flex flex-col items-center text-center w-24 shrink-0 space-y-1">
                        <div className="relative w-16 h-16 rounded-xl bg-white border border-slate-200 p-1.5 flex items-center justify-center overflow-hidden shadow-2xs group-hover:border-emerald-200 transition-colors">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-contain p-1"
                          />
                          {item.qty > 1 && (
                            <span className="absolute bottom-1 right-1 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-md">
                              x{item.qty}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-semibold text-slate-700 line-clamp-2 leading-tight">
                          {item.name}
                        </span>
                      </div>

                      {index < bundle.items.length - 1 && (
                        <div className="w-5 h-5 rounded-full bg-slate-200/80 flex items-center justify-center text-slate-500 shrink-0">
                          <Plus className="w-3 h-3" />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Price & Action Strip */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">
                      Bundle Deal Price
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-slate-900">
                        ₹{bundle.bundlePrice.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs text-slate-400 line-through">
                        ₹{bundle.originalPrice.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-block">
                      Save ₹{bundle.savings.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* 1-Click Add to Cart Button */}
                <button
                  onClick={() => handleAddBundleToCart(bundle)}
                  className={`w-full py-3 px-4 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95 ${
                    isAdded
                      ? "bg-emerald-600 text-white shadow-emerald-500/20"
                      : "bg-slate-900 hover:bg-emerald-600 text-white shadow-slate-900/10"
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>Added All Items to Cart! 🎉</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-[#FFC20E]" />
                      <span>Add Complete Bundle to Cart</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
