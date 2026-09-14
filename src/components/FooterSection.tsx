"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Send, CheckCircle2, Phone, MapPin, Globe } from "lucide-react";
import { PrayogLogo } from "./PrayogLogo";

export const FooterSection: React.FC = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <>
      {/* Classic E-Commerce Newsletter Pre-Footer */}
      <section id="community" className="bg-slate-50 border-t border-b border-slate-200/90 py-10 text-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left: Classic Brand & Newsletter Headline */}
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E0F7FC] text-[#00AEEF] flex items-center justify-center shrink-0 border border-[#00AEEF]/20 shadow-xs">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#00AEEF] bg-[#00AEEF]/10 px-2.5 py-0.5 rounded-full mb-1">
                  Prayog India Community
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                  Subscribe to our Newsletter
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-xl mt-0.5 font-medium leading-relaxed">
                  Get updates about new robotics hardware, student workshops, STEM kits, and member-only discounts.
                </p>
              </div>
            </div>

            {/* Right: Clean, Classic High-Usability Form */}
            <div className="w-full lg:max-w-md">
              {subscribed ? (
                <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs font-bold px-4 py-3 rounded-xl border border-emerald-200 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Thank you for subscribing! Check your inbox for your welcome coupon.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-2">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        required
                        className="w-full bg-white text-slate-900 placeholder:text-slate-400 px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] shadow-xs transition-all font-medium"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-[#00AEEF] hover:bg-[#0096D6] active:scale-[0.98] text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-md shadow-[#00AEEF]/20 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                    >
                      <span>Subscribe</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">
                    We respect your privacy. Unsubscribe at any time. Zero spam.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Multi-Column Footer */}
      <footer className="bg-[#050B14] text-white pt-14 pb-10 border-t border-slate-800">

      {/* Main Multi-Column Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800 text-xs">
          {/* Column 1: Brand Info */}
          <div className="lg:col-span-1 space-y-4">
            <Link href="/" className="inline-block">
              <PrayogLogo size="md" dark={true} />
            </Link>
            <p className="text-slate-400 leading-relaxed text-xs">
              India&apos;s premier e-commerce ecosystem for robotics components,
              STEM learning kits, drone electronics, and research development
              boards.
            </p>
            <div className="space-y-1.5 text-slate-300 text-[11px]">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#FFC20E]" /> Ranchi Main
                Hub, Patna &amp; Delhi NCR
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#00AEEF]" /> +91 94311 02931
                / +91 98765 43210
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-[#FFC20E]" />{" "}
                www.prayogindia.com
              </div>
            </div>
          </div>

          {/* Column 2: Products */}
          <div>
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-[#FFC20E] mb-4">
              Products
            </h4>
            <ul className="space-y-2.5 text-slate-400 font-medium">
              <li>
                <Link
                  href="#categories"
                  className="hover:text-white transition-colors"
                >
                  Robotics Kits & Manipulators
                </Link>
              </li>
              <li>
                <Link
                  href="#categories"
                  className="hover:text-white transition-colors"
                >
                  Arduino & Shields
                </Link>
              </li>
              <li>
                <Link
                  href="#categories"
                  className="hover:text-white transition-colors"
                >
                  Drone & Autopilot Gear
                </Link>
              </li>
              <li>
                <Link
                  href="#categories"
                  className="hover:text-white transition-colors"
                >
                  IoT & LoRa Modules
                </Link>
              </li>
              <li>
                <Link
                  href="#categories"
                  className="hover:text-white transition-colors"
                >
                  STEM DIY Hardware
                </Link>
              </li>
              <li>
                <Link
                  href="#categories"
                  className="hover:text-white transition-colors"
                >
                  Raspberry Pi & Jetson
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Solutions */}
          <div>
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-[#FFC20E] mb-4">
              Solutions
            </h4>
            <ul className="space-y-2.5 text-slate-400 font-medium">
              <li>
                <Link
                  href="#solutions"
                  className="hover:text-white transition-colors"
                >
                  Educational STEM Labs
                </Link>
              </li>
              <li>
                <Link
                  href="#solutions"
                  className="hover:text-white transition-colors"
                >
                  Industrial Arm Automation
                </Link>
              </li>
              <li>
                <Link
                  href="#solutions"
                  className="hover:text-white transition-colors"
                >
                  Custom UAV Aerial Platforms
                </Link>
              </li>
              <li>
                <Link
                  href="#solutions"
                  className="hover:text-white transition-colors"
                >
                  AI Machine Vision Systems
                </Link>
              </li>
              <li>
                <Link
                  href="#solutions"
                  className="hover:text-white transition-colors"
                >
                  B2B Hardware Procurement
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Resources */}
          <div>
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-[#FFC20E] mb-4">
              Resources
            </h4>
            <ul className="space-y-2.5 text-slate-400 font-medium">
              <li>
                <Link
                  href="#learning-hub"
                  className="hover:text-white transition-colors"
                >
                  Learning Hub & Blogs
                </Link>
              </li>
              <li>
                <Link
                  href="#learning-hub"
                  className="hover:text-white transition-colors"
                >
                  Robotics Workshops
                </Link>
              </li>
              <li>
                <Link
                  href="#learning-hub"
                  className="hover:text-white transition-colors"
                >
                  Circuit Schematics
                </Link>
              </li>
              <li>
                <Link
                  href="#learning-hub"
                  className="hover:text-white transition-colors"
                >
                  Careers at Dilay Robotics
                </Link>
              </li>
              <li>
                <Link
                  href="#learning-hub"
                  className="hover:text-white transition-colors"
                >
                  Customer Technical Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Company */}
          <div>
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-[#FFC20E] mb-4">
              Company
            </h4>
            <ul className="space-y-2.5 text-slate-400 font-medium">
              <li>
                <Link
                  href="#why-prayog"
                  className="hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="#why-prayog"
                  className="hover:text-white transition-colors"
                >
                  Contact Support
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Shipping & Refund Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  GST Compliance
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-slate-400 text-xs gap-4">
          <div>
            © {new Date().getFullYear()}{" "}
            <span className="font-bold text-white">PRAYOG INDIA</span> — By
            Dilay ROBOTICS. All Rights Reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>Designed for Robotics & Tech Innovation</span>
            <span>Pan-India Fulfillment</span>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
};
