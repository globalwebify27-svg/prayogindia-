'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { StatsSection } from '@/components/StatsSection';
import { CategorySection } from '@/components/CategorySection';
import { ProductGridSection } from '@/components/ProductGridSection';
import { PromoBanner } from '@/components/PromoBanner';
import { SolutionsSection } from '@/components/SolutionsSection';
import { 
  IndustriesSection, 
  LearningHubSection, 
  WhyPrayogSection, 
  B2BSection, 
  TestimonialsSection 
} from '@/components/AdditionalSections';
import { FooterSection } from '@/components/FooterSection';
import { CartDrawer, CartItem } from '@/components/CartDrawer';
import { SearchModal, QuickViewModal, B2BModal } from '@/components/Modals';
import { PRODUCTS, Product } from '@/data/mockData';

export default function Home() {
  // State for Cart, Wishlist, Modals
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { product: PRODUCTS[0], quantity: 1 },
    { product: PRODUCTS[5], quantity: 1 }
  ]);
  const [wishlist, setWishlist] = useState<Product[]>([PRODUCTS[2]]);

  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [b2bOpen, setB2bOpen] = useState(false);
  const [selectedQuickView, setSelectedQuickView] = useState<Product | null>(null);

  // Cart Management Handlers
  const handleAddToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartItems(prev =>
      prev
        .map(item => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  // Wishlist Handler
  const handleToggleWishlist = (product: Product) => {
    setWishlist(prev => {
      const exists = prev.some(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const wishlistIds = wishlist.map(p => p.id);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-[#1E56A0] selection:text-white">
      
      {/* Header */}
      <Header
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        wishlistCount={wishlist.length}
        onOpenCart={() => setCartOpen(true)}
        onOpenWishlist={() => setCartOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenB2BModal={() => setB2bOpen(true)}
      />

      <main>
        {/* Hero Section */}
        <HeroSection
          onExploreProducts={() => {
            const el = document.getElementById('featured-products');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          onExploreSolutions={() => {
            const el = document.getElementById('solutions');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Overlapping Hero Statistics Bar */}
        <StatsSection />

        {/* Product Categories Section */}
        <CategorySection
          onSelectCategory={(catName) => {
            const el = document.getElementById('featured-products');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Featured Products Section */}
        <ProductGridSection
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
          onQuickView={(prod) => setSelectedQuickView(prod)}
          wishlistIds={wishlistIds}
        />

        {/* Promotional Banner */}
        <PromoBanner
          onShopNow={() => {
            const el = document.getElementById('featured-products');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Solutions Section */}
        <SolutionsSection
          onSelectSolution={(solutionTitle) => {
            setB2bOpen(true);
          }}
        />

        {/* Industry Sectors */}
        <IndustriesSection />

        {/* Learning Hub & Educational Resources */}
        <LearningHubSection />

        {/* Why Prayog India Feature Grid */}
        <WhyPrayogSection />

        {/* Institutional & B2B Procurement Section */}
        <B2BSection onOpenB2BModal={() => setB2bOpen(true)} />

        {/* Customer Reviews & Testimonials */}
        <TestimonialsSection />
      </main>

      {/* Footer Section & Newsletter */}
      <FooterSection />

      {/* Interactivity Modals & Slideouts */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onOpenB2BModal={() => {
          setCartOpen(false);
          setB2bOpen(true);
        }}
      />

      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onAddToCart={handleAddToCart}
        onQuickView={(prod) => setSelectedQuickView(prod)}
      />

      <QuickViewModal
        product={selectedQuickView}
        onClose={() => setSelectedQuickView(null)}
        onAddToCart={handleAddToCart}
      />

      <B2BModal
        isOpen={b2bOpen}
        onClose={() => setB2bOpen(false)}
      />

    </div>
  );
}
