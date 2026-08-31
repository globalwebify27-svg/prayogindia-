'use client';

import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  FilterX, 
  Cpu, 
  Zap, 
  Gauge, 
  Code, 
  Boxes, 
  ShieldCheck 
} from 'lucide-react';
import { CATEGORIES_DATA } from '@/data/categories';
import { BRANDS_DATA } from '@/data/brands';

export interface TechnicalSpecFilters {
  voltage?: string | null;
  currentPower?: string | null;
  rpmKv?: string | null;
  compatibility?: string | null;
  material?: string | null;
  minRating?: number | null;
  minDiscount?: number | null;
  application?: string | null;
}

interface ProductFiltersProps {
  selectedCategory: string | null;
  onSelectCategory: (catName: string | null) => void;
  selectedBrand: string | null;
  onSelectBrand: (brandName: string | null) => void;
  inStockOnly: boolean;
  onToggleStockOnly: (val: boolean) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  techSpecs?: TechnicalSpecFilters;
  onTechSpecChange?: (specKey: keyof TechnicalSpecFilters, value: string | number | null) => void;
  onClearAll: () => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedBrand,
  onSelectBrand,
  inStockOnly,
  onToggleStockOnly,
  priceRange,
  onPriceRangeChange,
  techSpecs = {},
  onTechSpecChange,
  onClearAll,
}) => {
  const [catOpen, setCatOpen] = useState(true);
  const [brandOpen, setBrandOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);
  const [stockOpen, setStockOpen] = useState(true);
  const [techSpecsOpen, setTechSpecsOpen] = useState(true);
  
  const [brandSearch, setBrandSearch] = useState('');

  const filteredBrands = BRANDS_DATA.filter(b => 
    b.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  return (
    <aside className="space-y-6 text-xs text-slate-800">
      
      {/* Header & Reset */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
          <span>Filters</span>
        </h3>
        <button
          onClick={onClearAll}
          className="text-xs font-extrabold text-[#00AEEF] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <FilterX className="w-3.5 h-3.5" />
          <span>Reset All</span>
        </button>
      </div>

      {/* 1. Category Filter */}
      <div className="border-b border-slate-100 pb-4 space-y-3">
        <button
          onClick={() => setCatOpen(!catOpen)}
          className="flex items-center justify-between w-full font-extrabold text-slate-900 text-xs text-left cursor-pointer"
        >
          <span>CATEGORIES</span>
          {catOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {catOpen && (
          <div className="space-y-1.5 pl-1 max-h-48 overflow-y-auto scrollbar-none">
            <button
              onClick={() => onSelectCategory(null)}
              className={`w-full text-left py-1.5 px-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                !selectedCategory ? 'bg-[#E0F7FC] text-[#00AEEF]' : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              All Categories
            </button>

            {CATEGORIES_DATA.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.name)}
                className={`w-full text-left py-1.5 px-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-between cursor-pointer ${
                  selectedCategory === cat.name ? 'bg-[#E0F7FC] text-[#00AEEF]' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="truncate">{cat.name}</span>
                <span className="text-[10px] text-slate-400 font-semibold">{cat.productCount}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Price Range Slider */}
      <div className="border-b border-slate-100 pb-4 space-y-3">
        <button
          onClick={() => setPriceOpen(!priceOpen)}
          className="flex items-center justify-between w-full font-extrabold text-slate-900 text-xs text-left cursor-pointer"
        >
          <span>PRICE RANGE (₹)</span>
          {priceOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {priceOpen && (
          <div className="space-y-3 pl-1 pr-1">
            <div className="flex items-center justify-between font-extrabold text-slate-900 text-xs">
              <span className="bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 font-mono">₹{priceRange[0]}</span>
              <span className="text-slate-400">to</span>
              <span className="bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 font-mono">₹{priceRange[1].toLocaleString()}</span>
            </div>

            <input
              type="range"
              min="0"
              max="50000"
              step="500"
              value={priceRange[1]}
              onChange={(e) => onPriceRangeChange([priceRange[0], parseInt(e.target.value)])}
              className="w-full accent-[#00AEEF] cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* 3. Technical Specs Accordion */}
      <div className="border-b border-slate-100 pb-4 space-y-3">
        <button
          onClick={() => setTechSpecsOpen(!techSpecsOpen)}
          className="flex items-center justify-between w-full font-extrabold text-slate-900 text-xs text-left cursor-pointer"
        >
          <span className="flex items-center gap-1.5 text-[#00AEEF]">
            <Cpu className="w-3.5 h-3.5" /> TECHNICAL SPECS
          </span>
          {techSpecsOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {techSpecsOpen && (
          <div className="space-y-4 pl-1">
            
            {/* Voltage */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Operating Voltage</span>
              <div className="flex flex-wrap gap-1.5">
                {['3.3V', '5V', '12V', '24V', '4S LiPo (14.8V)'].map((v) => (
                  <button
                    key={v}
                    onClick={() => onTechSpecChange?.('voltage', techSpecs.voltage === v ? null : v)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                      techSpecs.voltage === v
                        ? 'bg-[#00AEEF] text-white border-[#00AEEF]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Motor RPM / KV Rating */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase text-slate-500 block">RPM / KV Rating</span>
              <div className="flex flex-wrap gap-1.5">
                {['1000 KV', '1400 KV', '2300 KV', '300 RPM', '600 RPM'].map((rpm) => (
                  <button
                    key={rpm}
                    onClick={() => onTechSpecChange?.('rpmKv', techSpecs.rpmKv === rpm ? null : rpm)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                      techSpecs.rpmKv === rpm
                        ? 'bg-[#00AEEF] text-white border-[#00AEEF]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {rpm}
                  </button>
                ))}
              </div>
            </div>

            {/* Compatibility & Framework */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Framework & Toolchain</span>
              <div className="flex flex-wrap gap-1.5">
                {['Arduino IDE', 'ROS 2', 'Python / Linux', 'Betaflight', 'ArduPilot'].map((comp) => (
                  <button
                    key={comp}
                    onClick={() => onTechSpecChange?.('compatibility', techSpecs.compatibility === comp ? null : comp)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                      techSpecs.compatibility === comp
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {comp}
                  </button>
                ))}
              </div>
            </div>

            {/* Material & Construction */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Material & Chassis</span>
              <div className="flex flex-wrap gap-1.5">
                {['3K Carbon Fiber', 'CNC Aluminum', 'FR4 PCB', 'ABS Plastic'].map((mat) => (
                  <button
                    key={mat}
                    onClick={() => onTechSpecChange?.('material', techSpecs.material === mat ? null : mat)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                      techSpecs.material === mat
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {mat}
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* 3b. Rating Filter */}
      <div className="border-b border-slate-100 pb-4 space-y-3">
        <span className="text-[10px] font-black uppercase text-slate-900 block flex items-center gap-1">
          Minimum Rating
        </span>
        <div className="flex flex-wrap gap-1.5 pl-1">
          {[4, 4.5, 5].map((rating) => (
            <button
              key={rating}
              onClick={() => onTechSpecChange?.('minRating', techSpecs.minRating === rating ? null : rating)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                techSpecs.minRating === rating
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              ★ {rating}+
            </button>
          ))}
        </div>
      </div>

      {/* 3c. Discount Filter */}
      <div className="border-b border-slate-100 pb-4 space-y-3">
        <span className="text-[10px] font-black uppercase text-slate-900 block">
          Minimum Discount
        </span>
        <div className="flex flex-wrap gap-1.5 pl-1">
          {[10, 20, 30, 40, 50].map((pct) => (
            <button
              key={pct}
              onClick={() => onTechSpecChange?.('minDiscount', techSpecs.minDiscount === pct ? null : pct)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                techSpecs.minDiscount === pct
                  ? 'bg-[#FF3B30] text-white border-[#FF3B30]'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {pct}%+ OFF
            </button>
          ))}
        </div>
      </div>

      {/* 4. Brand Filter */}
      <div className="border-b border-slate-100 pb-4 space-y-3">
        <button
          onClick={() => setBrandOpen(!brandOpen)}
          className="flex items-center justify-between w-full font-extrabold text-slate-900 text-xs text-left cursor-pointer"
        >
          <span>BRANDS</span>
          {brandOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {brandOpen && (
          <div className="space-y-2 pl-1">
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                placeholder="Search brands..."
                className="w-full bg-slate-50 text-[11px] pl-8 pr-2 py-1.5 rounded-lg border border-slate-200 focus:outline-none"
              />
            </div>

            <div className="space-y-1 max-h-40 overflow-y-auto scrollbar-none">
              {filteredBrands.map((b) => (
                <label key={b.id} className="flex items-center gap-2 cursor-pointer py-1 px-1 hover:bg-slate-50 rounded">
                  <input
                    type="checkbox"
                    checked={selectedBrand === b.name}
                    onChange={() => onSelectBrand(selectedBrand === b.name ? null : b.name)}
                    className="rounded border-slate-300 text-[#00AEEF] focus:ring-[#00AEEF]"
                  />
                  <span className="text-xs font-semibold text-slate-700 flex-1">{b.name}</span>
                  <span className="text-[10px] text-slate-400 font-bold">({b.count})</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 5. Availability Filter */}
      <div className="pb-2 space-y-3">
        <button
          onClick={() => setStockOpen(!stockOpen)}
          className="flex items-center justify-between w-full font-extrabold text-slate-900 text-xs text-left cursor-pointer"
        >
          <span>AVAILABILITY</span>
          {stockOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {stockOpen && (
          <div className="space-y-2 pl-1">
            <label className="flex items-center gap-2 cursor-pointer py-1">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => onToggleStockOnly(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs font-bold text-slate-800">In Stock Only</span>
            </label>
          </div>
        )}
      </div>

    </aside>
  );
};
