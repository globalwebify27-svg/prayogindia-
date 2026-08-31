'use client';

import React, { useState } from 'react';
import { 
  Layers, 
  Search, 
  Filter, 
  CheckCircle2, 
  Percent, 
  DollarSign, 
  Tag, 
  Hash, 
  Boxes, 
  RefreshCw, 
  Sparkles, 
  Save, 
  AlertTriangle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { PRODUCTS, Product } from '@/data/mockData';

export default function AdminBulkEditPage() {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Bulk Operation Drawer / Modal State
  const [bulkActionType, setBulkActionType] = useState<
    'PRICE_PERCENT' | 'PRICE_FLAT' | 'MRP_UPDATE' | 'DISCOUNT_PERCENT' | 'GST_RATE' | 'SKU_PREFIX' | 'STOCK_INCREMENT'
  >('PRICE_PERCENT');
  const [bulkActionValue, setBulkActionValue] = useState('10');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Categories extraction
  const categories = ['All', ...Array.from(new Set(PRODUCTS.map(p => p.category)))];

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedProductIds(filteredProducts.map(p => p.id));
    } else {
      setSelectedProductIds([]);
    }
  };

  const handleToggleProduct = (id: string) => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handleApplyBulkUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProductIds.length === 0) {
      alert('Please select at least one product to apply bulk update.');
      return;
    }

    const val = parseFloat(bulkActionValue);

    setProducts(prev => prev.map(prod => {
      if (!selectedProductIds.includes(prod.id)) return prod;

      let updated = { ...prod };

      switch (bulkActionType) {
        case 'PRICE_PERCENT':
          // e.g. +10% price increase
          const newPrice = Math.round(prod.price * (1 + val / 100));
          updated.price = Math.max(1, newPrice);
          break;
        case 'PRICE_FLAT':
          // e.g. +₹50
          updated.price = Math.max(1, prod.price + val);
          break;
        case 'MRP_UPDATE':
          // Set MRP as multiplier or flat
          updated.mrp = Math.round(prod.price * (1 + val / 100));
          break;
        case 'DISCOUNT_PERCENT':
          updated.discount = `${Math.round(val)}% OFF`;
          break;
        case 'GST_RATE':
          // @ts-ignore
          updated.gstPercent = Math.round(val);
          break;
        case 'SKU_PREFIX':
          if (!prod.sku.startsWith(bulkActionValue)) {
            updated.sku = `${bulkActionValue}-${prod.sku}`;
          }
          break;
        case 'STOCK_INCREMENT':
          // @ts-ignore
          updated.stock = Math.max(0, (prod.stock || 20) + val);
          break;
      }

      return updated;
    }));

    setShowApplyModal(false);
    setSuccessNotice(`Successfully applied ${bulkActionType} to ${selectedProductIds.length} products!`);
    setTimeout(() => setSuccessNotice(null), 5000);
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#E0F7FC] px-3.5 py-1 rounded-full border border-[#00AEEF]/20">
              Section 47 · Bulk Product Catalogue Management
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Bulk Catalogue Operations &amp; Price Updates
          </h1>
          <p className="text-xs text-slate-500">
            Apply 1-click batch updates across categories for Selling Prices, MRP, Discount %, GST rates (18%, 12%, 5%), and SKU standardizers.
          </p>
        </div>

        <button
          onClick={() => {
            if (selectedProductIds.length === 0) {
              alert('Select products using checkboxes first.');
              return;
            }
            setShowApplyModal(true);
          }}
          disabled={selectedProductIds.length === 0}
          className={`px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all ${
            selectedProductIds.length > 0
              ? 'bg-[#00AEEF] hover:bg-[#0096D6] text-white active:scale-95 cursor-pointer'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#FFC20E]" />
          <span>Apply Bulk Action ({selectedProductIds.length})</span>
        </button>
      </div>

      {/* Success Alert */}
      {successNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* 2. Bulk Action Quick Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Filter Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00AEEF]"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Search SKU or Name */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products in view..."
              className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-1.5 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
            />
          </div>

          {/* Selection Counter */}
          <div className="text-xs font-bold text-slate-600">
            Selected <strong className="text-[#00AEEF]">{selectedProductIds.length}</strong> of {filteredProducts.length} items
          </div>
        </div>
      </div>

      {/* 3. Products Batch Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                <th className="pb-3 w-8">
                  <input
                    type="checkbox"
                    checked={selectedProductIds.length > 0 && selectedProductIds.length === filteredProducts.length}
                    onChange={handleSelectAll}
                    className="rounded text-[#00AEEF] accent-[#00AEEF]"
                  />
                </th>
                <th className="pb-3 font-black">Product Name &amp; SKU</th>
                <th className="pb-3 font-black">Category</th>
                <th className="pb-3 font-black text-right">Selling Price</th>
                <th className="pb-3 font-black text-right">MRP</th>
                <th className="pb-3 font-black text-right">Discount</th>
                <th className="pb-3 font-black text-center">GST %</th>
                <th className="pb-3 font-black text-center">Freight Modes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredProducts.map((p) => {
                const isSelected = selectedProductIds.includes(p.id);
                return (
                  <tr
                    key={p.id}
                    className={`transition-colors ${
                      isSelected ? 'bg-blue-50/40' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-3.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleProduct(p.id)}
                        className="rounded text-[#00AEEF] accent-[#00AEEF]"
                      />
                    </td>

                    <td className="py-3.5">
                      <div className="font-extrabold text-slate-900">{p.name}</div>
                      <div className="font-mono text-[10px] text-slate-400 font-bold">{p.sku}</div>
                    </td>

                    <td className="py-3.5 font-semibold text-slate-600">
                      {p.category}
                    </td>

                    <td className="py-3.5 text-right font-black text-slate-900 text-sm">
                      ₹{p.price.toLocaleString()}
                    </td>

                    <td className="py-3.5 text-right font-mono text-slate-400 line-through">
                      ₹{p.mrp.toLocaleString()}
                    </td>

                    <td className="py-3.5 text-right">
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                        {p.discount || '20% OFF'}
                      </span>
                    </td>

                    <td className="py-3.5 text-center font-bold text-slate-800">
                      {/* @ts-ignore */}
                      {p.gstPercent || 18}%
                    </td>

                    <td className="py-3.5 text-center">
                      <span className="text-[9px] font-black uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                        {p.shippingTag || 'Standard'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Bulk Edit Configuration Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div onClick={() => setShowApplyModal(false)} className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs animate-in fade-in" />
          <div className="relative max-w-md w-full bg-white rounded-3xl p-6 sm:p-7 shadow-2xl z-10 space-y-4 text-xs animate-in zoom-in-95">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF]">
                  Section 47 Batch Action
                </span>
                <h3 className="text-base font-black text-slate-900 uppercase">
                  Execute Bulk Operation
                </h3>
              </div>
              <button onClick={() => setShowApplyModal(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleApplyBulkUpdate} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Operation Type *</label>
                <select
                  value={bulkActionType}
                  onChange={(e) => setBulkActionType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900"
                >
                  <option value="PRICE_PERCENT">Bulk Selling Price Adjustment (+ / - %)</option>
                  <option value="PRICE_FLAT">Bulk Selling Price Adjustment (+ / - Flat ₹)</option>
                  <option value="MRP_UPDATE">Bulk MRP Multiplier (% above selling price)</option>
                  <option value="DISCOUNT_PERCENT">Bulk Discount Tag Update (%)</option>
                  <option value="GST_RATE">Bulk GST Rate Update (18%, 12%, 5%, 28%)</option>
                  <option value="SKU_PREFIX">Bulk SKU Code Standardization (Add Prefix)</option>
                  <option value="STOCK_INCREMENT">Bulk Location Stock Increment</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {bulkActionType === 'SKU_PREFIX' ? 'SKU Prefix String' : 'Adjustment Value'} *
                </label>
                <input
                  type={bulkActionType === 'SKU_PREFIX' ? 'text' : 'number'}
                  required
                  value={bulkActionValue}
                  onChange={(e) => setBulkActionValue(e.target.value)}
                  placeholder={bulkActionType === 'SKU_PREFIX' ? 'PRG-2026' : '10'}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 p-3 rounded-2xl text-blue-900 text-[11px] font-medium space-y-1">
                <span className="font-bold block">Summary of Action:</span>
                <p>
                  Will apply to <strong>{selectedProductIds.length}</strong> selected hardware products matching category "{selectedCategory}".
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 font-bold text-slate-500 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#00AEEF] hover:bg-[#0096D6] text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-wider shadow-md active:scale-95"
                >
                  Commit Batch Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
