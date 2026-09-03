"use client";

import React, { useRef } from "react";
import Image from "next/image";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Gift,
  Tag,
  Award,
  Sparkles,
} from "lucide-react";

interface OfferCardData {
  id: string;
  tag: string;
  badge: string;
  badgeBg: string;
  title: string;
  subtitle: string;
  bgGradient: string;
  borderColor: string;
  accentColor: string;
  type: "single" | "quad" | "wheel";
  mainImage?: string;
  statLabel?: string;
  statSub?: string;
  quadItems?: Array<{
    name: string;
    discount: string;
    image: string;
  }>;
  bankLogoIcon?: string;
  bankOfferTitle: string;
  bankOfferSub: string;
}

const CARDS: OfferCardData[] = [
  {
    id: "1",
    tag: "BUDGET HARDWARE DEALS",
    badge: "Flat 50% Off",
    badgeBg: "bg-[#00AEEF] text-white",
    title: "Under ₹699 Store",
    subtitle: "Sensors, Modules & Breadboards",
    bgGradient: "from-[#0B2545] via-[#134074] to-[#0B1D3A]",
    borderColor: "border-[#00AEEF]/40 hover:border-[#00AEEF]",
    accentColor: "#00AEEF",
    type: "single",
    mainImage:
      "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80",
    statLabel: "Starting at ₹199",
    statSub: "50+ Products",
    bankOfferTitle: "5% Unlimited Cashback",
    bankOfferSub: "with HDFC & ICICI Cards",
  },
  {
    id: "2",
    tag: "HOTTEST SELLING KITS",
    badge: "Up to 50% Off",
    badgeBg: "bg-emerald-500 text-white",
    title: "Shop Popular Robotics Deals",
    subtitle: "Complete robotics platforms & dev boards",
    bgGradient: "from-[#0B3C26] via-[#145C3A] to-[#0A2E1D]",
    borderColor: "border-emerald-500/40 hover:border-emerald-400",
    accentColor: "#10B981",
    type: "quad",
    quadItems: [
      {
        name: "Arduino UNO R4",
        discount: "30% Off",
        image:
          "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=300&q=80",
      },
      {
        name: "Servo Arms",
        discount: "33% Off",
        image:
          "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=300&q=80",
      },
      {
        name: "Sensor Pack",
        discount: "25% Off",
        image:
          "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80",
      },
      {
        name: "ESP32 WiFi",
        discount: "22% Off",
        image:
          "https://images.unsplash.com/photo-1608564697071-ddf911d81370?auto=format&fit=crop&w=300&q=80",
      },
    ],
    bankOfferTitle: "Extra ₹150 OFF",
    bankOfferSub: "on UPI Transactions",
  },
  {
    id: "3",
    tag: "FLIGHT CONTROLLERS",
    badge: "Up to 80% Off",
    badgeBg: "bg-indigo-600 text-white",
    title: "Up to 80% Off",
    subtitle: "Drone ESCs, Motors & Carbon Frames",
    bgGradient: "from-[#1E1B4B] via-[#312E81] to-[#111827]",
    borderColor: "border-indigo-500/40 hover:border-indigo-400",
    accentColor: "#6366F1",
    type: "single",
    mainImage:
      "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=600&q=80",
    bankOfferTitle: "Up to 10% Instant Discount",
    bankOfferSub: "on SBI & PNB Cards",
  },
  {
    id: "4",
    tag: "MAKER FUN ZONE",
    badge: "Win Exciting Prizes",
    badgeBg: "bg-amber-500 text-slate-950 font-black",
    title: "Win Up to ₹5000*",
    subtitle: "Spin the Wheel & Claim Coupons",
    bgGradient: "from-[#451A03] via-[#78350F] to-[#291002]",
    borderColor: "border-amber-500/40 hover:border-amber-400",
    accentColor: "#F59E0B",
    type: "wheel",
    bankOfferTitle: "Instant Wallet Rewards",
    bankOfferSub: "on Every Spin",
  },
];

interface Props {
  onShopDeals?: () => void;
}

export const TrendingOfferBanners: React.FC<Props> = ({ onShopDeals }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollManual = (dir: "left" | "right") => {
    if (scrollRef.current) {
      const amount = dir === "left" ? -340 : 340;
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  return (
    <section className="py-14 bg-[#F8FAFC] border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Clean Light-Themed Section Header - Responsive Mobile Stack */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#00AEEF] block">
              EXCLUSIVE MAKER OFFERS
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Popular Deals &amp; Bank Offers
            </h2>
            <p className="text-xs text-slate-500 font-semibold">
              Grab the best deals on top robotics &amp; electronics products
            </p>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollManual("left")}
                className="w-9 h-9 rounded-full border border-slate-200 bg-white hover:bg-[#00AEEF] text-slate-600 hover:text-white flex items-center justify-center transition-colors shadow-xs cursor-pointer active:scale-95"
                aria-label="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollManual("right")}
                className="w-9 h-9 rounded-full border border-slate-200 bg-white hover:bg-[#00AEEF] text-slate-600 hover:text-white flex items-center justify-center transition-colors shadow-xs cursor-pointer active:scale-95"
                aria-label="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={onShopDeals}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-black px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-95 shrink-0"
            >
              <span>View All Deals</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Crisp Cards Slider Grid */}
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scrollbar-none pb-4 pt-1 scroll-smooth"
          style={{ scrollbarWidth: "none" }}
        >
          {CARDS.map((card) => (
            <div
              key={card.id}
              onClick={onShopDeals}
              className={`w-[290px] sm:w-[320px] shrink-0 bg-gradient-to-b ${card.bgGradient} border ${card.borderColor} rounded-3xl p-5 cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-300 group flex flex-col justify-between relative overflow-hidden`}
            >
              {/* Header Badges */}
              <div className="space-y-3 z-10">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-[9px] font-black uppercase tracking-wider text-white/75 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                    {card.tag}
                  </span>
                  <span
                    className={`text-[9px] font-extrabold px-2.5 py-1 rounded-full shadow-md ${card.badgeBg}`}
                  >
                    {card.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-black text-white leading-tight group-hover:text-[#00AEEF] transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-300/80 font-medium mt-1">
                    {card.subtitle}
                  </p>
                </div>
              </div>

              {/* CENTER CARD CONTENT TYPES */}

              {/* TYPE 1: SINGLE HERO IMAGE + STAT BAR */}
              {card.type === "single" && (
                <div className="my-4 space-y-3 z-10">
                  <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-white/10 shadow-inner">
                    <Image
                      src={card.mainImage!}
                      alt={card.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  </div>

                  {card.statLabel && (
                    <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-2.5 flex justify-between items-center text-white text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-[#00AEEF] flex items-center justify-center font-black text-[10px]">
                          ₹
                        </div>
                        <div>
                          <span className="block text-[11px] font-black">
                            {card.statLabel}
                          </span>
                          <span className="block text-[9px] text-slate-300 font-semibold">
                            {card.statSub}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </div>
              )}

              {/* TYPE 2: 2x2 QUAD GRID OF PRODUCTS */}
              {card.type === "quad" && card.quadItems && (
                <div className="grid grid-cols-2 gap-2.5 my-4 z-10">
                  {card.quadItems.map((q, idx) => (
                    <div
                      key={idx}
                      className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-2.5 flex flex-col items-center text-center space-y-1.5 hover:border-emerald-400/50 transition-colors"
                    >
                      <div className="relative w-full h-16 rounded-xl overflow-hidden bg-slate-950/50">
                        <Image
                          src={q.image}
                          alt={q.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <span className="text-[11px] font-bold text-white truncate w-full">
                        {q.name}
                      </span>
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-black px-2 py-0.5 rounded-full">
                        {q.discount}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* TYPE 3: SPINNING WHEEL GAME CARD */}
              {card.type === "wheel" && (
                <div className="my-4 flex flex-col items-center justify-center text-center py-2 z-10">
                  <div className="relative w-36 h-36 rounded-full border-4 border-amber-400/50 bg-gradient-to-tr from-amber-600 via-yellow-500 to-orange-600 p-2 shadow-2xl flex items-center justify-center group-hover:rotate-45 transition-transform duration-700">
                    <div className="w-full h-full rounded-full border-2 border-dashed border-white/60 flex items-center justify-center bg-amber-950/40">
                      <div className="w-12 h-12 rounded-full bg-white text-slate-950 font-black text-xs flex items-center justify-center shadow-lg uppercase">
                        SPIN
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* FOOTER BANK OFFER BAR */}
              <div className="bg-white/95 text-slate-900 p-3 rounded-2xl flex items-center justify-between shadow-md z-10 transition-transform group-hover:translate-y-[-2px]">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4 text-[#00AEEF]" />
                  </div>
                  <div>
                    <span className="text-[11px] font-extrabold block leading-tight text-slate-900">
                      {card.bankOfferTitle}
                    </span>
                    <span className="text-[9px] text-slate-500 font-semibold block leading-tight">
                      {card.bankOfferSub}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-700 group-hover:translate-x-1 transition-transform shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
