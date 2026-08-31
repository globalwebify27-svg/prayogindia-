'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Bot, Plane, Cpu, ShieldCheck, ArrowRight } from 'lucide-react';

interface Props {
  onExploreCollection?: (collection: string) => void;
}

export const RoboticsCollectionShowcase: React.FC<Props> = ({ onExploreCollection }) => {
  return (
    <section className="py-14 bg-gradient-to-b from-slate-900 to-[#0A1128] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="bg-[#00AEEF]/20 text-[#00AEEF] border border-[#00AEEF]/40 text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-widest inline-block">
            Engineering Excellence
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Robotics & UAV Ecosystem
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Engineered hardware ecosystems for universities, AI researchers, drone pilots, and industrial automation labs.
          </p>
        </div>

        {/* 3 Showcase Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Pillar 1: Robotics Arm & Mobility */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            viewport={{ once: true }}
            className="bg-slate-800/60 rounded-3xl p-6 border border-slate-700/80 hover:border-[#00AEEF] transition-all duration-300 flex flex-col justify-between space-y-5 shadow-xl"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#00AEEF]/20 text-[#00AEEF] flex items-center justify-center border border-[#00AEEF]/40">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-white">Robotics & Manipulators</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                High torque metal servos, 6-DOF robotic arm kits, Omni-wheel AGV platforms & ROS 2 controller boards.
              </p>
            </div>

            <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-700">
              <Image 
                src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80"
                alt="Robotics"
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>

            <button 
              onClick={() => onExploreCollection?.('Robotics Kits')}
              className="w-full bg-[#00AEEF] hover:bg-[#0096D6] text-white font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
            >
              <span>Explore Robotics</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Pillar 2: Drone Technology */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-slate-800/60 rounded-3xl p-6 border border-slate-700/80 hover:border-[#00AEEF] transition-all duration-300 flex flex-col justify-between space-y-5 shadow-xl"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FFC20E]/20 text-[#FFC20E] flex items-center justify-center border border-[#FFC20E]/40">
                <Plane className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-white">Drone Aerial Hardware</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Pixhawk 6C autopilot flight controllers, SimonK 30A ESCs, BLDC outrunner motors & MavLink GPS telemetry.
              </p>
            </div>

            <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-700">
              <Image 
                src="https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=600&q=80"
                alt="Drone Hardware"
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>

            <button 
              onClick={() => onExploreCollection?.('Drone Technology')}
              className="w-full bg-[#FFC20E] hover:bg-amber-400 text-slate-950 font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
            >
              <span>Explore UAV Tech</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Pillar 3: Arduino & Edge AI */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            viewport={{ once: true }}
            className="bg-slate-800/60 rounded-3xl p-6 border border-slate-700/80 hover:border-[#00AEEF] transition-all duration-300 flex flex-col justify-between space-y-5 shadow-xl"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-white">Arduino & Edge AI</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Official Arduino UNO R3, ESP32 dual-core Wi-Fi, Raspberry Pi 5 8GB & NVIDIA Jetson Orin Nano AI boards.
              </p>
            </div>

            <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-700">
              <Image 
                src="https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80"
                alt="Arduino & Microcontrollers"
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>

            <button 
              onClick={() => onExploreCollection?.('Arduino')}
              className="w-full border border-slate-600 hover:border-white text-white font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
            >
              <span>Explore Dev Boards</span>
              <ArrowRight className="w-4 h-4 text-[#00AEEF]" />
            </button>
          </motion.div>

        </div>

      </div>
    </section>
  );
};
