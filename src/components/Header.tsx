import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  User, 
  Heart, 
  ShoppingBag, 
  ChevronDown, 
  Menu, 
  X, 
  ShieldCheck, 
  Headset,
  Globe,
  Share2
} from 'lucide-react';
import { PrayogLogo } from './PrayogLogo';

interface HeaderProps {
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenSearch: () => void;
  onOpenB2BModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onOpenSearch,
  onOpenB2BModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
      
      {/* Top Header Bar matching Brand Cyan & Yellow Accent */}
      <div className="bg-[#00AEEF] text-white text-xs py-2 px-4 shadow-2xs">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-2 sm:px-6">
          
          {/* Left Social Links */}
          <div className="flex items-center gap-3 text-white/90">
            <a href="#" className="hover:text-white flex items-center gap-1 text-[11px] font-bold"><Globe className="w-3.5 h-3.5" /> India</a>
            <a href="#" className="hover:text-white flex items-center gap-1 text-[11px]"><Share2 className="w-3.5 h-3.5" /> Community</a>
          </div>

          {/* Center Announcement with Gold Highlight */}
          <div className="hidden md:flex items-center gap-2 font-bold text-[12px] tracking-wide text-white">
            <span className="bg-[#FFC20E] text-slate-900 px-2 py-0.5 rounded-full text-[10px] uppercase font-black">Fast Dispatch</span>
            Dedicated Technical Support Team & Pan-India Delivery
          </div>

          {/* Right Utility Links */}
          <div className="flex items-center gap-3 text-[11px] font-semibold text-white/95">
            <button onClick={onOpenB2BModal} className="hover:underline flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#FFC20E]" /> Track Order
            </button>
            <span>|</span>
            <button onClick={onOpenB2BModal} className="hover:underline flex items-center gap-1">
              <Headset className="w-3.5 h-3.5" /> Support
            </button>
            <span className="hidden sm:inline">|</span>
            <a href="#why-prayog" className="hidden sm:inline hover:underline">Careers</a>
          </div>

        </div>
      </div>

      {/* Main Header Container with Logo & Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-6">
          
          {/* Logo Section - Uses PrayogLogo SVG */}
          <Link href="/" className="shrink-0 flex items-center">
            <PrayogLogo size="md" showSubtitle={true} />
          </Link>

          {/* Center Search Input Box with Cyan Action Button */}
          <div className="hidden md:flex flex-1 max-w-2xl relative items-center">
            <input
              type="text"
              onClick={onOpenSearch}
              readOnly
              placeholder="Search Raspberry Pi, Arduino, Drones, Sensors, Flight Controllers..."
              className="w-full bg-[#F5F7FA] text-sm text-slate-800 placeholder-slate-400 pl-4 pr-12 py-3 rounded-l-md border border-r-0 border-slate-300 focus:border-[#00AEEF] focus:outline-none cursor-pointer"
            />
            <button 
              onClick={onOpenSearch} 
              className="bg-[#00AEEF] hover:bg-[#0096D6] text-white px-6 py-3.5 rounded-r-md transition-colors font-bold text-sm flex items-center justify-center shadow-xs"
            >
              <Search className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Action Icons: Cart, Wishlist, User */}
          <div className="flex items-center gap-4 shrink-0">
            <button 
              onClick={onOpenWishlist}
              className="relative p-2 text-slate-700 hover:text-[#00AEEF] transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-6 h-6 stroke-[1.8]" />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-[#FFC20E] text-slate-900 font-black text-[10px] rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button 
              onClick={onOpenCart}
              className="relative p-2 text-slate-700 hover:text-[#00AEEF] transition-colors flex items-center"
              aria-label="Cart"
            >
              <ShoppingBag className="w-6 h-6 stroke-[1.8]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#00AEEF] text-white font-bold text-xs rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            <button 
              className="hidden sm:flex p-2 text-slate-700 hover:text-[#00AEEF] transition-colors"
              aria-label="Account"
            >
              <User className="w-6 h-6 stroke-[1.8]" />
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Category Bar */}
      <div className="border-t border-slate-200 bg-white hidden lg:block">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-8 text-sm font-bold text-slate-800 h-12">
          
          <Link href="#categories" className="hover:text-[#00AEEF] transition-colors flex items-center gap-1.5 py-3">
            Shop By Category <ChevronDown className="w-4 h-4 text-slate-400" />
          </Link>

          <Link href="#categories" className="hover:text-[#00AEEF] transition-colors py-3">
            Shop By Brand
          </Link>

          <button onClick={onOpenB2BModal} className="hover:text-[#00AEEF] transition-colors py-3">
            B2B Orders
          </button>

          <Link href="#solutions" className="hover:text-[#00AEEF] transition-colors py-3">
            Lab Setup
          </Link>

          <Link href="#learning-hub" className="hover:text-[#00AEEF] transition-colors py-3">
            Knowledge Hub
          </Link>

          <Link href="#featured-products" className="hover:text-[#00AEEF] transition-colors py-3">
            Top Deals
          </Link>

          <span className="bg-[#FFC20E] text-slate-900 px-3.5 py-1 rounded-md text-xs font-black uppercase tracking-wider ml-auto shadow-2xs border border-[#E5AD0D]">
            Dilay Studio
          </span>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 p-4 space-y-3">
          <input
            type="text"
            onClick={onOpenSearch}
            readOnly
            placeholder="Search Raspberry Pi, Arduino..."
            className="w-full bg-[#F5F7FA] text-xs p-3 rounded-md border border-slate-300"
          />
          <nav className="flex flex-col space-y-2 text-sm font-bold text-slate-800 pt-2">
            <Link href="#categories" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-slate-100">Shop By Category</Link>
            <Link href="#featured-products" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-slate-100">Bestseller Products</Link>
            <button onClick={() => { setMobileMenuOpen(false); onOpenB2BModal(); }} className="py-2 text-left text-[#00AEEF] border-b border-slate-100 font-extrabold">B2B & Institutional Quote</button>
            <Link href="#learning-hub" onClick={() => setMobileMenuOpen(false)} className="py-2">Learning Hub</Link>
          </nav>
        </div>
      )}
    </header>
  );
};
