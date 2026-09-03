"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Truck,
  Headphones,
  GraduationCap,
  Lock,
  Users,
} from "lucide-react";

interface FeatureCard {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FEATURES: FeatureCard[] = [
  {
    id: "1",
    icon: <ShieldCheck className="w-6 h-6 text-[#FFC20E]" />,
    title: "100% Genuine Products",
    description:
      "Directly sourced components from official microchip manufacturers with full GST invoice compliance.",
  },
  {
    id: "2",
    icon: <Truck className="w-6 h-6 text-[#00AEEF]" />,
    title: "Fast Dispatch Across India",
    description:
      "Express courier shipping with real-time tracking for schools, colleges, and DIY makers.",
  },
  {
    id: "3",
    icon: <Headphones className="w-6 h-6 text-[#FFC20E]" />,
    title: "Dedicated Technical Support",
    description:
      "In-house robotics engineers available to solve pinout queries, driver issues, and code troubleshooting.",
  },
  {
    id: "4",
    icon: <GraduationCap className="w-6 h-6 text-[#00AEEF]" />,
    title: "STEM & Institutional Experts",
    description:
      "Over 500+ school and university STEM labs designed and commissioned across India.",
  },
  {
    id: "5",
    icon: <Lock className="w-6 h-6 text-[#FFC20E]" />,
    title: "Secure Shopping Guarantee",
    description:
      "256-bit encrypted checkout with UPI, Net Banking, Credit Cards, and GST Purchase orders.",
  },
  {
    id: "6",
    icon: <Users className="w-6 h-6 text-[#00AEEF]" />,
    title: "Vibrant Learning Community",
    description:
      "Free access to build tutorials, open-source code repositories, and flight tuning workshops.",
  },
];

export const WhyChoosePrayog: React.FC = () => {
  return (
    <section className="py-14 bg-slate-50 border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[11px] font-black uppercase tracking-widest text-[#00AEEF]">
            The Prayog Advantage
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Why Choose Prayog India
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            India’s trusted ecosystem for authentic robotics hardware,
            institutional lab setups & technical support.
          </p>
        </div>

        {/* 6 Reusable Premium Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feat, idx) => (
            <motion.div
              key={feat.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              viewport={{ once: true }}
              className="bg-white border border-slate-200/90 rounded-3xl p-6 hover:shadow-xl hover:border-[#00AEEF]/40 transition-all duration-300 space-y-3 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                {feat.icon}
              </div>
              <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#00AEEF] transition-colors">
                {feat.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {feat.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
