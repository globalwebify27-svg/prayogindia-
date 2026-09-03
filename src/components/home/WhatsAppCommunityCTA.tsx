"use client";

import React from "react";
import { motion } from "framer-motion";
import { MessageSquare, ArrowRight } from "lucide-react";

export const WhatsAppCommunityCTA: React.FC = () => {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white rounded-3xl p-8 sm:p-10 border border-emerald-500/30 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left Text */}
          <div className="space-y-3 max-w-xl z-10 text-center md:text-left">
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-widest inline-block">
              JOIN 25,000+ ROBOTICS MAKERS
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              Join the Prayog WhatsApp Community
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Get instant project building guides, exclusive discount coupons,
              firmware updates, and direct support from fellow robotics
              engineers.
            </p>
          </div>

          {/* Right Action */}
          <motion.div whileHover={{ scale: 1.03 }} className="shrink-0 z-10">
            <a
              href="https://wa.me/919876543210?text=Hi%20Prayog%20India,%20I%20want%20to%20join%20the%20Robotics%20Community!"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-black px-8 py-4 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-xl shadow-emerald-500/30 flex items-center gap-2.5"
            >
              <MessageSquare className="w-5 h-5 fill-white" />
              <span>Join WhatsApp Group</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>

          {/* Glow Effect */}
          <div className="absolute -left-20 -top-20 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        </div>
      </div>
    </section>
  );
};
