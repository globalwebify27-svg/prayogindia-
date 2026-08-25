'use client';

import React from 'react';
import Image from 'next/image';
import { Star, Heart, Eye } from 'lucide-react';
import { PRODUCTS, Product } from '@/data/mockData';

interface ProductSectionProps {
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  onQuickView: (product: Product) => void;
  wishlistIds: string[];
}

export const ProductGridSection: React.FC<ProductSectionProps> = ({
  onAddToCart,
  onToggleWishlist,
  onQuickView,
  wishlistIds,
}) => {
  return (
    <section id="featured-products" className="py-6 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Robocraze Style SHOP OUR BESTSELLERS Divider */}
        <div className="relative flex items-center justify-center mb-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-300"></div>
          </div>
          <div className="relative bg-white px-6">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest">
              SHOP OUR BESTSELLERS
            </h2>
          </div>
        </div>

        {/* Robocraze Clean White Bordered Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {PRODUCTS.map((product) => {
            const isWishlisted = wishlistIds.includes(product.id);

            return (
              <div
                key={product.id}
                className="group bg-white rounded-lg border border-slate-200 p-4 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300 relative"
              >
                
                {/* Badges Top Left & Right */}
                <div className="flex items-center justify-between z-10 mb-2">
                  <span className="bg-[#FF3B30] text-white text-[10px] font-black px-2 py-0.5 rounded-sm uppercase tracking-wider">
                    {product.discount}
                  </span>
                  
                  <button
                    onClick={() => onQuickView(product)}
                    className="text-slate-400 hover:text-slate-800 p-1"
                    title="Quick Spec View"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                {/* Product Image */}
                <div className="relative h-56 w-full mb-4 flex items-center justify-center overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug mb-3 group-hover:text-[#00AEEF] transition-colors">
                      {product.name}
                    </h3>
                  </div>

                  <div className="space-y-3 pt-2">
                    {/* Price Line matching Robocraze (Blue current price, strike through MRP) */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-extrabold text-[#00AEEF]">
                        Rs {product.price.toLocaleString()}/-
                      </span>
                      <span className="text-xs text-slate-400 line-through">
                        Rs {product.mrp.toLocaleString()}
                      </span>
                    </div>

                    {/* Green Save Pill */}
                    <div>
                      <span className="bg-[#E8F8F5] text-[#00A86B] text-[11px] font-bold px-2 py-1 rounded-sm inline-block">
                        Save Rs {(product.mrp - product.price).toLocaleString()}/-
                      </span>
                    </div>

                    {/* Bright Blue Full-Width ADD TO CART Button */}
                    <button
                      onClick={() => onAddToCart(product)}
                      className="w-full bg-[#00AEEF] hover:bg-[#0096D6] text-white py-3 rounded-sm text-xs font-black uppercase tracking-wider transition-colors shadow-xs"
                    >
                      ADD TO CART
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
