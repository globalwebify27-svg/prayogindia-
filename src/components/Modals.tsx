'use client';

import React, { useState } from 'react';
import { X, Search, Star, ShoppingBag, Eye, Heart } from 'lucide-react';
import { PRODUCTS, Product } from '@/data/mockData';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (p: Product) => void;
  onQuickView: (p: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onAddToCart,
  onQuickView,
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const results = query.trim() === ''
    ? []
    : PRODUCTS.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) || 
        p.category.toLowerCase().includes(query.toLowerCase()) ||
        p.sku.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-start justify-center pt-20 px-4">
      <div onClick={onClose} className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs animate-in fade-in" />
      
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 z-10 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3 w-full">
            <Search className="w-5 h-5 text-[#1E56A0]" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Arduino, ESP32, Drones, Sensors, Flight Controllers..."
              className="w-full text-base font-medium text-slate-900 placeholder-slate-400 focus:outline-none"
            />
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="mt-4 max-h-96 overflow-y-auto divide-y divide-slate-100">
          {query.trim() === '' ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Type to search 10,000+ technology products across all robotics categories.
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No products found matching &quot;{query}&quot;.
            </div>
          ) : (
            results.map((product) => (
              <div key={product.id} className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover border border-slate-200" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{product.name}</h4>
                    <span className="text-[10px] text-[#1E56A0] bg-blue-50 px-2 py-0.5 rounded font-semibold">{product.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs font-extrabold text-[#0A1128]">₹{product.price}</div>
                  <button
                    onClick={() => {
                      onAddToCart(product);
                      onClose();
                    }}
                    className="p-2 bg-[#0A1128] text-white rounded-lg text-xs font-semibold hover:bg-[#1E56A0]"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

interface QuickViewProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (p: Product) => void;
}

export const QuickViewModal: React.FC<QuickViewProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs animate-in fade-in" />
      
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 z-10 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-800">
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>

          <div className="space-y-4">
            <span className="bg-blue-50 text-[#1E56A0] text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full">
              {product.category}
            </span>
            <h2 className="text-xl font-extrabold text-[#0A1128] leading-tight">{product.name}</h2>
            <div className="text-xs text-slate-400">SKU: {product.sku}</div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-[#0A1128]">₹{product.price.toLocaleString()}</span>
              <span className="text-xs text-slate-400 line-through">₹{product.mrp.toLocaleString()}</span>
              <span className="text-xs font-bold text-emerald-600">Save {product.discount}</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{product.description}</p>

            <div className="pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 mb-2">Technical Specifications</h4>
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-100">
                {Object.entries(product.specs).map(([k, v]) => (
                  <div key={k}>
                    <span className="text-slate-400">{k}: </span>
                    <span className="font-semibold text-slate-800">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                onAddToCart(product);
                onClose();
              }}
              className="w-full bg-[#0A1128] hover:bg-[#1E56A0] text-white py-3.5 rounded-full text-xs font-bold flex items-center justify-center gap-2 shadow-lg"
            >
              <ShoppingBag className="w-4 h-4 text-[#D4AF37]" /> Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface B2BModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const B2BModal: React.FC<B2BModalProps> = ({ isOpen, onClose }) => {
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs animate-in fade-in" />
      
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 z-10 animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-800">
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              ✓
            </div>
            <h3 className="text-lg font-bold text-slate-900">Quotation Request Received</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Our B2B institutional procurement desk will send an official GST proforma quotation within 2 business hours.
            </p>
            <button onClick={onClose} className="bg-[#0A1128] text-white text-xs font-bold px-6 py-2.5 rounded-full">
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-4">
            <span className="bg-[#D4AF37] text-slate-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
              Institutional Order Desk
            </span>
            <h2 className="text-xl font-extrabold text-[#0A1128]">Request B2B Quotation</h2>
            <p className="text-xs text-slate-500">Provide institution or enterprise procurement details below.</p>

            <div className="space-y-3 text-xs">
              <input required type="text" placeholder="Full Name / Procurement Officer" className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 focus:outline-none" />
              <input required type="email" placeholder="Institutional Email (.edu / company)" className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 focus:outline-none" />
              <input required type="text" placeholder="Institution / Organization Name" className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 focus:outline-none" />
              <input type="text" placeholder="GST Number (Optional)" className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 focus:outline-none uppercase" />
              <textarea required rows={3} placeholder="List required products, components, or lab kit quantities..." className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 focus:outline-none"></textarea>
            </div>

            <button type="submit" className="w-full bg-[#0A1128] hover:bg-[#1E56A0] text-white py-3.5 rounded-full text-xs font-bold shadow-md">
              Submit Quotation Request
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
