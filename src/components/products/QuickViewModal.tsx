'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  X,
  Star,
  ShoppingCart,
  Zap,
  Heart,
  CheckCircle,
  XCircle,
  Download,
  Play,
  Image as ImageIcon,
  ExternalLink,
  Package,
  Info,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  BadgePercent,
} from 'lucide-react';
import { Product } from '@/data/mockData';

interface QuickViewModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart?: (product: Product, variantId?: string) => void;
  onToggleWishlist?: (product: Product) => void;
  isWishlisted?: boolean;
}

type MediaTab = 'images' | 'video' | '360';

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false,
}) => {
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    product.variants?.[0]?.id
  );
  const [activeMediaTab, setActiveMediaTab] = useState<MediaTab>('images');
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [addedFeedback, setAddedFeedback] = useState(false);

  const activeVariant = product.variants?.find(v => v.id === selectedVariantId);
  const displayPrice = activeVariant?.price ?? product.price;
  const displayMrp = activeVariant?.mrp ?? product.mrp;
  const isInStock = activeVariant ? activeVariant.inStock : product.inStock;

  const discountPct = displayMrp > displayPrice
    ? Math.round(((displayMrp - displayPrice) / displayMrp) * 100)
    : null;

  const allImages = product.images?.length
    ? product.images
    : [product.image];

  const media360 = product.media360 ?? [];
  const hasVideo = !!product.videoUrl;
  const has360 = media360.length > 0;

  const handleAddToCart = () => {
    onAddToCart?.(product, selectedVariantId);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  const specEntries = Object.entries(product.specs ?? {});

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col animate-in zoom-in-95 duration-200">

        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10 rounded-t-3xl">
          <div>
            <span className="text-[9px] font-mono font-black uppercase tracking-widest text-slate-400">
              {product.sku} · {product.category}
            </span>
            <h2 className="text-sm font-black text-slate-900 line-clamp-1 mt-0.5">
              {product.name}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {onToggleWishlist && (
              <button
                onClick={() => onToggleWishlist(product)}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  isWishlisted ? 'text-red-500 bg-red-50' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'
                }`}
                title="Wishlist"
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Modal Body ── */}
        <div className="flex flex-col lg:flex-row gap-0 flex-1">

          {/* Left — Media Panel */}
          <div className="lg:w-5/12 bg-slate-50 p-5 space-y-4 rounded-bl-3xl">

            {/* Media Tab Switcher */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
              <button
                onClick={() => setActiveMediaTab('images')}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                  activeMediaTab === 'images' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ImageIcon className="w-3 h-3" /> Photos
              </button>
              {hasVideo && (
                <button
                  onClick={() => setActiveMediaTab('video')}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                    activeMediaTab === 'video' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Play className="w-3 h-3" /> Video
                </button>
              )}
              {has360 && (
                <button
                  onClick={() => setActiveMediaTab('360')}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                    activeMediaTab === '360' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <RotateCcw className="w-3 h-3" /> 360°
                </button>
              )}
            </div>

            {/* Media Viewer */}
            <div className="relative h-64 rounded-2xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center">
              {activeMediaTab === 'images' && (
                <>
                  <Image
                    src={allImages[activeImageIdx]}
                    alt={product.name}
                    fill
                    className="object-contain p-4"
                  />
                  {/* Image nav arrows */}
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={() => setActiveImageIdx(prev => (prev - 1 + allImages.length) % allImages.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 shadow rounded-full flex items-center justify-center text-slate-700 hover:text-[#00AEEF] cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setActiveImageIdx(prev => (prev + 1) % allImages.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 shadow rounded-full flex items-center justify-center text-slate-700 hover:text-[#00AEEF] cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </>
              )}
              {activeMediaTab === 'video' && hasVideo && (
                <video
                  src={product.videoUrl}
                  controls
                  className="w-full h-full object-contain rounded-xl"
                />
              )}
              {activeMediaTab === '360' && has360 && (
                <div className="flex flex-col items-center gap-2 text-slate-500 text-xs font-bold">
                  <RotateCcw className="w-10 h-10 text-slate-300" />
                  <span>Drag to rotate 360° view</span>
                  <img
                    src={media360[0]}
                    alt="360 view"
                    className="w-full h-full object-contain absolute inset-0"
                  />
                </div>
              )}
            </div>

            {/* Image Thumbnails */}
            {activeMediaTab === 'images' && allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-12 h-12 shrink-0 rounded-xl overflow-hidden border-2 transition-colors cursor-pointer ${
                      activeImageIdx === idx ? 'border-[#00AEEF]' : 'border-slate-200'
                    }`}
                  >
                    <img src={img} alt={`view ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Downloadable Docs */}
            {product.documents && product.documents.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Downloads</span>
                {product.documents.map((doc, i) => (
                  <a
                    key={i}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-bold text-slate-700 hover:border-[#00AEEF] hover:text-[#00AEEF] transition-all group"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#00AEEF]" />
                    <span className="flex-1 truncate">{doc.title}</span>
                    <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">{doc.type}</span>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Right — Product Info Panel */}
          <div className="lg:w-7/12 p-6 space-y-4 overflow-y-auto">

            {/* Badges */}
            <div className="flex flex-wrap gap-1.5">
              {discountPct && (
                <span className="bg-[#FF3B30] text-white text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wide">
                  {discountPct}% OFF
                </span>
              )}
              {product.badge && (
                <span className="bg-slate-900 text-[#00AEEF] text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wide">
                  {product.badge}
                </span>
              )}
              {product.brand && (
                <span className="bg-blue-50 text-blue-700 text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wide">
                  {product.brand}
                </span>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${s <= Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-700">{product.rating}</span>
              <span className="text-xs text-slate-400">({product.reviews} reviews)</span>
            </div>

            {/* Pricing Block */}
            <div className="bg-slate-50 rounded-2xl p-4 space-y-1 border border-slate-200">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-black text-slate-900">
                  ₹{displayPrice.toLocaleString('en-IN')}
                </span>
                {displayMrp > displayPrice && (
                  <span className="text-sm text-slate-400 line-through">
                    ₹{displayMrp.toLocaleString('en-IN')}
                  </span>
                )}
                {discountPct && (
                  <span className="text-sm font-black text-emerald-600">
                    Save {discountPct}%
                  </span>
                )}
              </div>
              {product.gstInclusive && (
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Info className="w-3 h-3" /> Price inclusive of all taxes (GST)
                </p>
              )}
              <div className="flex items-center gap-1 pt-1">
                {isInStock ? (
                  <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> In Stock — Ready to Ship
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Currently Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Variant Selector */}
            {product.variants && product.variants.length > 1 && (
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                  Select Variant
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map(v => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        selectedVariantId === v.id
                          ? 'bg-[#00AEEF] text-white border-[#00AEEF] shadow-sm shadow-[#00AEEF]/20'
                          : v.inStock
                          ? 'bg-white text-slate-700 border-slate-200 hover:border-[#00AEEF]'
                          : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                      }`}
                      disabled={!v.inStock && selectedVariantId !== v.id}
                      title={!v.inStock ? 'Out of Stock' : v.name}
                    >
                      {v.name}
                      {!v.inStock && <span className="ml-1 text-[8px]">(OOS)</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                id={`quickview-add-cart-${product.id}`}
                onClick={handleAddToCart}
                disabled={!isInStock}
                className={`flex items-center justify-center gap-1.5 py-3 rounded-2xl text-xs font-extrabold transition-all active:scale-95 cursor-pointer ${
                  addedFeedback
                    ? 'bg-emerald-600 text-white'
                    : 'border-2 border-[#00AEEF] text-[#00AEEF] hover:bg-[#E0F7FC]'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                {addedFeedback ? 'Added to Cart!' : 'Add to Cart'}
              </button>
              <button
                id={`quickview-buy-now-${product.id}`}
                onClick={handleAddToCart}
                disabled={!isInStock}
                className="flex items-center justify-center gap-1.5 bg-[#00AEEF] hover:bg-[#0096D6] text-white py-3 rounded-2xl text-xs font-extrabold shadow-md shadow-[#00AEEF]/20 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                Buy Now
              </button>
            </div>

            {/* Tech Specs Table */}
            {specEntries.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                  Technical Specifications
                </span>
                <div className="rounded-2xl border border-slate-200 overflow-hidden text-xs">
                  <table className="w-full">
                    <tbody>
                      {specEntries.map(([key, val], idx) => (
                        <tr
                          key={key}
                          className={idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}
                        >
                          <td className="px-3.5 py-2 font-bold text-slate-600 w-2/5">{key}</td>
                          <td className="px-3.5 py-2 font-semibold text-slate-900">{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* View Full Product Page */}
            <Link
              href={`/products/${product.slug || product.id}`}
              className="flex items-center gap-1.5 text-xs font-bold text-[#00AEEF] hover:underline"
              onClick={onClose}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Full Product Page with Reviews & All Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
