'use client';

import React from 'react';
import { 
  Star, 
  ShieldCheck, 
  Truck, 
  Headphones, 
  MessageSquare, 
  ShoppingBag, 
  Heart, 
  Plane, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Boxes
} from 'lucide-react';
import { Product, ProductVariant } from '@/data/mockData';

interface ProductInfoProps {
  product: Product;
  selectedVariant: ProductVariant | null;
  onSelectVariant: (variant: ProductVariant) => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
}

export const ProductInformation: React.FC<ProductInfoProps> = ({
  product,
  selectedVariant,
  onSelectVariant,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
}) => {
  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentMrp = selectedVariant ? selectedVariant.mrp : product.mrp;
  const currentSku = selectedVariant ? selectedVariant.sku : product.sku;
  const currentStock = selectedVariant ? selectedVariant.inStock : product.inStock;

  const discountPercentage = Math.round(((currentMrp - currentPrice) / currentMrp) * 100);

  const whatsappMessage = encodeURIComponent(
    `Hi Prayog India, I am interested in ordering the product: "${product.name}" (SKU: ${currentSku}). Please confirm current stock availability and dispatch time.`
  );

  return (
    <div className="space-y-6 text-slate-900">
      
      {/* Brand, Badges & Title */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          {product.brand && (
            <span className="bg-slate-100 text-slate-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-md border border-slate-200">
              {product.brand}
            </span>
          )}
          {product.badge && (
            <span className="bg-[#00AEEF] text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-md">
              {product.badge}
            </span>
          )}
          <span className="text-[11px] font-mono font-bold text-slate-400">SKU: {currentSku}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
          {product.name}
        </h1>

        {/* Rating Row */}
        <div className="flex items-center gap-3 pt-1">
          <div className="flex items-center text-amber-400 gap-1 text-xs font-black">
            <Star className="w-4 h-4 fill-current" />
            <span>{product.rating}</span>
          </div>
          <span className="text-slate-300">•</span>
          <span className="text-xs font-bold text-slate-500">{product.reviews} Verified Customer Reviews</span>
        </div>
      </div>

      {/* Price & GST Hierarchy */}
      <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-1">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-black text-slate-900">
            ₹{currentPrice.toLocaleString()}
          </span>
          <span className="text-sm text-slate-400 line-through font-bold">
            ₹{currentMrp.toLocaleString()}
          </span>
          <span className="bg-[#FF3B30] text-white text-xs font-black px-2 py-0.5 rounded-md uppercase">
            {discountPercentage}% OFF
          </span>
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <span className="text-emerald-600 font-extrabold flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" /> Price Inclusive of 18% GST (Tax Invoice Included)
          </span>
          <span className="font-bold text-slate-500">Save ₹{(currentMrp - currentPrice).toLocaleString()}</span>
        </div>
      </div>

      {/* Stock Availability Indicator & Freight Tag */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
        <span className="text-slate-500">Availability:</span>
        {currentStock ? (
          <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1 rounded-full font-black">
            ✓ In Stock (Ready for Dispatch)
          </span>
        ) : (
          <span className="bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded-full font-black">
            ✕ Out of Stock
          </span>
        )}

        {/* Section 5.1 Freight Mode & Shipping Tag Badge */}
        {(() => {
          const tag = product.shippingTag || (product.name.toLowerCase().includes('battery') || product.name.toLowerCase().includes('lipo') ? 'Battery Item' : 'Standard');
          const isAirAllowed = product.airFreightAllowed !== false && tag !== 'Battery Item';

          return (
            <div className="flex items-center gap-1.5 ml-auto">
              <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                tag === 'Battery Item'
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : tag === 'Fragile'
                  ? 'bg-purple-50 text-purple-800 border-purple-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                {tag}
              </span>

              {isAirAllowed ? (
                <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  ✈️ Air Freight OK
                </span>
              ) : (
                <span className="text-[10px] font-extrabold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  ⚠️ Surface Freight Only
                </span>
              )}
            </div>
          );
        })()}
      </div>

      {/* Variant Selector (if product variants exist) */}
      {product.variants && product.variants.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block">
            Select Product Variant:
          </label>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => onSelectVariant(variant)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                  selectedVariant?.id === variant.id
                    ? 'border-[#00AEEF] bg-[#E0F7FC] text-[#00AEEF] ring-2 ring-[#00AEEF]/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                {variant.name} — ₹{variant.price}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Section 27: Air & Surface Freight Shipping Rules Card */}
      {(() => {
        const isBattery = product.shippingTag === 'Battery Item' || product.shippingTag === 'Hazardous' || product.name.toLowerCase().includes('battery') || product.name.toLowerCase().includes('lipo');
        const weight = product.weightGrams || (isBattery ? 250 : 50);
        const airAllowed = !isBattery && product.airFreightAllowed !== false;
        const surfaceAllowed = true;

        return (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-slate-900 flex items-center gap-1.5">
                <Boxes className="w-3.5 h-3.5 text-[#00AEEF]" /> Section 27 · Freight Shipping Rules
              </span>
              <span className="text-xs font-mono font-bold text-slate-600">Weight: {weight} gm</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Air Freight Indicator */}
              <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                airAllowed 
                  ? 'bg-blue-50/60 border-blue-200 text-blue-900' 
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                <div className="flex items-center gap-1.5 font-extrabold">
                  <Plane className="w-3.5 h-3.5" />
                  <span>Air Freight:</span>
                </div>
                <div className="flex items-center gap-1 font-black">
                  {airAllowed ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Allowed</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5 text-red-600" />
                      <span className="text-red-700">Not Allowed</span>
                    </>
                  )}
                </div>
              </div>

              {/* Surface Freight Indicator */}
              <div className="p-2.5 rounded-xl border bg-emerald-50/60 border-emerald-200 text-emerald-900 flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-extrabold">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Surface Freight:</span>
                </div>
                <div className="flex items-center gap-1 font-black">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Allowed</span>
                </div>
              </div>
            </div>

            {!airAllowed && (
              <p className="text-[10px] text-amber-800 bg-amber-100/70 p-2 rounded-lg font-medium flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                <span>DGCA Safety Regulation: Lithium/Battery hardware cannot be transported via air freight. Automatically dispatched via surface logistics.</span>
              </p>
            )}
          </div>
        );
      })()}

      {/* Customer Purchase Action Buttons */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        {currentStock ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => onAddToCart(product)}
              className="w-full bg-[#00AEEF] hover:bg-[#0096D6] text-white py-3.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#00AEEF]/25 flex items-center justify-center gap-2 active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Cart</span>
            </button>

            <button
              onClick={() => onAddToCart(product)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Buy Now</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-red-50 text-red-700 text-xs font-extrabold p-3 rounded-xl border border-red-200">
              This product variant is currently sold out in inventory.
            </div>
            
            <a
              href={`https://wa.me/919876543210?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>Ask Availability on WhatsApp</span>
            </a>
          </div>
        )}

        {/* Wishlist Trigger */}
        <button
          onClick={() => onToggleWishlist(product)}
          className={`w-full py-2.5 rounded-xl text-xs font-extrabold transition-colors border flex items-center justify-center gap-2 ${
            isWishlisted
              ? 'bg-red-50 text-[#FF3B30] border-red-200'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          <span>{isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
        </button>
      </div>

      {/* Trust Highlights */}
      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-center text-[10px] font-bold text-slate-500">
        <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
          <Truck className="w-4 h-4 text-[#00AEEF] mx-auto" />
          <span>Pan-India Dispatch</span>
        </div>
        <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
          <ShieldCheck className="w-4 h-4 text-[#FFC20E] mx-auto" />
          <span>100% Genuine</span>
        </div>
        <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
          <Headphones className="w-4 h-4 text-[#00AEEF] mx-auto" />
          <span>Tech Support</span>
        </div>
      </div>

    </div>
  );
};
