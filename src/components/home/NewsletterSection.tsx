'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, ArrowRight } from 'lucide-react';

export const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <section className="py-14 bg-slate-900 text-white relative border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-gradient-to-r from-[#0B1528] via-[#0F1C33] to-[#0A1128] rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* Left Text */}
          <div className="space-y-2 max-w-xl text-center lg:text-left">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#FFC20E]">
              Stay Ahead in Tech
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Subscribe to Prayog Hardware Digest
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Receive weekly tutorials, new product drops (Raspberry Pi, Jetson, Drones), and exclusive coupon codes.
            </p>
          </div>

          {/* Right Input Form */}
          <div className="w-full lg:w-auto shrink-0">
            {subscribed ? (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-6 py-4 rounded-2xl flex items-center gap-2 text-xs font-extrabold"
              >
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>Subscribed successfully! Welcome to Prayog India.</span>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
                <div className="relative w-full">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    className="w-full bg-slate-950 text-white text-xs pl-11 pr-4 py-3.5 rounded-xl border border-slate-700 focus:outline-none focus:border-[#00AEEF] transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto shrink-0 bg-[#00AEEF] hover:bg-[#0096D6] text-white font-extrabold px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#00AEEF]/25"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-4 h-4 text-[#FFC20E]" />
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
