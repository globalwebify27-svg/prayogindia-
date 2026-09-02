'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Box, ShieldCheck, Headphones, Cpu, Zap, Radio, Layers } from 'lucide-react';

interface HeroProps {
  onExploreProducts: () => void;
  onExploreSolutions: () => void;
}

const HERO_VIDEOS = [
  '/videos/hero_background.mp4',
  '/videos/hero_video_2.mp4',
];

export const HeroSection: React.FC<HeroProps> = ({
  onExploreProducts,
  onExploreSolutions,
}) => {
  const [currentVideoIndex, setCurrentVideoIndex] = React.useState(0);
  const videoRefs = React.useRef<(HTMLVideoElement | null)[]>([]);

  // Function to handle video end and switch to the next video in loop
  const handleVideoEnded = (index: number) => {
    if (index === currentVideoIndex) {
      const nextIndex = (currentVideoIndex + 1) % HERO_VIDEOS.length;
      setCurrentVideoIndex(nextIndex);
      if (videoRefs.current[nextIndex]) {
        videoRefs.current[nextIndex]!.currentTime = 0;
        videoRefs.current[nextIndex]!.play().catch(() => {});
      }
    }
  };

  // Ensure active video is playing
  React.useEffect(() => {
    const activeVideo = videoRefs.current[currentVideoIndex];
    if (activeVideo) {
      activeVideo.play().catch(() => {});
    }
  }, [currentVideoIndex]);

  return (
    <section className="bg-[#0B1528] text-white pt-8 pb-14 sm:pt-12 sm:pb-18 lg:pt-14 lg:pb-20 relative border-b border-slate-800 overflow-hidden min-h-[460px] sm:min-h-[500px] lg:min-h-[520px] flex items-center">
      
      {/* Background Video Layer - Disabled on Mobile (hidden lg:block), Active on Desktop */}
      <div className="hidden lg:block absolute inset-y-0 right-0 w-[65%] h-full z-0 pointer-events-none overflow-hidden">
        {HERO_VIDEOS.map((videoSrc, idx) => (
          <video
            key={videoSrc}
            ref={(el) => { videoRefs.current[idx] = el; }}
            src={videoSrc}
            autoPlay={idx === 0}
            muted
            playsInline
            onEnded={() => handleVideoEnded(idx)}
            className={`absolute inset-0 w-full h-full object-cover object-center brightness-110 contrast-105 transition-opacity duration-1000 ${
              idx === currentVideoIndex ? 'opacity-95 z-10' : 'opacity-0 z-0'
            }`}
          />
        ))}

        {/* Desktop View Edge Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B1528] via-[#0B1528]/50 to-transparent z-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528]/70 via-transparent to-transparent z-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1528]/40 via-transparent to-[#0B1528]/60 z-20" />
      </div>

      {/* Mobile-Only Robot Background Layer (Behind the text) */}
      <div className="block lg:hidden absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Robot Background Image positioned to the right/center behind text */}
        <div className="absolute right-[-15%] top-4 w-[85%] max-w-[360px] h-[95%] opacity-35 sm:opacity-40 select-none">
          <img
            src="/images/robot_mobile_hero.jpg"
            alt="Robotics Prayog India"
            className="w-full h-full object-contain object-top"
          />
        </div>
        {/* Dark & Cyan Gradient Overlays to preserve text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B1528] via-[#0B1528]/85 to-[#0B1528]/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528] via-transparent to-[#0B1528]/70" />
        <div className="absolute top-1/4 right-0 w-64 h-64 bg-[#00AEEF]/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Content Container (Layered on top of background video/robot) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Column Content & Headline - Positioned directly over landscape background video */}
          <div className="lg:col-span-6 space-y-5 sm:space-y-6 text-left">
            


            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-white drop-shadow-md">
              Saw It Online? <br />
              <span className="text-[#00AEEF]">Now Build Your Own</span> <br />
              <span className="text-[#FFC20E]">with Prayog India</span>
            </h1>

            <p className="text-slate-200 text-sm sm:text-base max-w-lg font-normal leading-relaxed drop-shadow-sm">
              Explore 10,000+ authentic robotics components, Raspberry Pi 5, drones, STEM lab kits, and microcontrollers built for students, makers & industries.
            </p>

            {/* Clean Solid CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1">
              <button
                onClick={onExploreProducts}
                className="bg-[#00AEEF] hover:bg-[#0096D6] text-white font-bold px-7 sm:px-8 py-3.5 rounded-lg text-xs sm:text-sm transition-all flex items-center gap-2 shadow-lg shadow-[#00AEEF]/25"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-4 h-4 text-[#FFC20E]" />
              </button>

              <button
                onClick={onExploreSolutions}
                className="bg-slate-900/60 hover:bg-slate-900/80 text-white font-semibold px-6 sm:px-7 py-3.5 rounded-lg text-xs sm:text-sm border border-slate-700 transition-all flex items-center gap-2 hover:border-[#00AEEF] backdrop-blur-md"
              >
                <Layers className="w-4 h-4 text-[#00AEEF]" />
                <span>Explore Lab Setups</span>
              </button>
            </div>

            {/* Minimal Stat Badges Strip */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-5 border-t border-slate-800/80 max-w-md">
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-[#00AEEF] shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">10,000+</div>
                  <div className="text-[10px] text-slate-400">Products</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#FFC20E] shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">100%</div>
                  <div className="text-[10px] text-slate-400">Authentic</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-[#00AEEF] shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">Dedicated</div>
                  <div className="text-[10px] text-slate-400">Tech Support</div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column Overlay Container for Floating Info Badges (Desktop) */}
          <div className="hidden lg:flex lg:col-span-6 relative items-center justify-end h-full min-h-[420px]">
            
            {/* Clean Dark Stacked Info Badges Floating over full-height video */}
            <div className="flex flex-col gap-2.5 z-20">
              
              <motion.div 
                whileHover={{ x: -4 }}
                className="bg-[#0F1C33]/80 backdrop-blur-md p-3 rounded-xl border border-slate-700/60 flex items-center gap-3 w-44 shadow-xl"
              >
                <div className="w-7 h-7 rounded-lg bg-[#00AEEF]/15 text-[#00AEEF] flex items-center justify-center shrink-0">
                  <Cpu className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-medium text-slate-200 leading-tight">Latest Tech Components</span>
              </motion.div>

              <motion.div 
                whileHover={{ x: -4 }}
                className="bg-[#0F1C33]/80 backdrop-blur-md p-3 rounded-xl border border-slate-700/60 flex items-center gap-3 w-44 shadow-xl"
              >
                <div className="w-7 h-7 rounded-lg bg-[#FFC20E]/15 text-[#FFC20E] flex items-center justify-center shrink-0">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-medium text-slate-200 leading-tight">Pan-India Fast Delivery</span>
              </motion.div>

              <motion.div 
                whileHover={{ x: -4 }}
                className="bg-[#0F1C33]/80 backdrop-blur-md p-3 rounded-xl border border-slate-700/60 flex items-center gap-3 w-44 shadow-xl"
              >
                <div className="w-7 h-7 rounded-lg bg-[#00AEEF]/15 text-[#00AEEF] flex items-center justify-center shrink-0">
                  <Headphones className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-medium text-slate-200 leading-tight">Expert Support & Guidance</span>
              </motion.div>

              <motion.div 
                whileHover={{ x: -4 }}
                className="bg-[#0F1C33]/80 backdrop-blur-md p-3 rounded-xl border border-slate-700/60 flex items-center gap-3 w-44 shadow-xl"
              >
                <div className="w-7 h-7 rounded-lg bg-[#FFC20E]/15 text-[#FFC20E] flex items-center justify-center shrink-0">
                  <Radio className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-medium text-slate-200 leading-tight">For Students & Makers</span>
              </motion.div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
};
