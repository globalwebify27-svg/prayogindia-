"use client";

import React from "react";
import { motion } from "framer-motion";

const BRANDS = [
  {
    name: "Raspberry Pi",
    logo: "https://images.unsplash.com/photo-1608564697071-ddf911d81370?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Arduino",
    logo: "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "NVIDIA Jetson",
    logo: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Pixhawk UAV",
    logo: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "ESP32 Expressif",
    logo: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "STMicroelectronics",
    logo: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=200&q=80",
  },
];

export const BrandPartners: React.FC = () => {
  return (
    <section className="py-10 bg-slate-900 border-y border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          OFFICIAL HARDWARE & COMPONENT PARTNERS
        </span>

        {/* Grayscale Logo Cloud with Hover FX */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 items-center">
          {BRANDS.map((b, idx) => (
            <motion.div
              key={b.name}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              viewport={{ once: true }}
              className="bg-slate-800/40 border border-slate-800 hover:border-[#00AEEF]/40 rounded-2xl p-4 flex flex-col items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 group cursor-pointer"
            >
              <span className="text-xs font-black text-slate-400 group-hover:text-[#00AEEF] transition-colors">
                {b.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
