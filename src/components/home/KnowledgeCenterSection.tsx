"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Clock, ArrowRight, Sparkles, Code, Cpu } from "lucide-react";

const BLOG_POSTS = [
  {
    id: "guide-1",
    slug: "raspberry-pi-5-ai-vision",
    title: "Building Real-time Object Detection with Raspberry Pi 5 & OpenCV",
    category: "Computer Vision & AI",
    readTime: "6 min read",
    image:
      "https://images.unsplash.com/photo-1608564697071-ddf911d81370?auto=format&fit=crop&w=600&q=80",
    summary:
      "Step-by-step setup for camera module 3, YOLOv8 inference, and GPIO hardware triggers.",
  },
  {
    id: "guide-2",
    slug: "pixhawk-6c-ardupilot-setup",
    title: "Complete Pixhawk 6C Autonomous Drone Calibration Guide",
    category: "Drone Autopilot & UAV",
    readTime: "8 min read",
    image:
      "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=600&q=80",
    summary:
      "Compass calibration, MavLink telemetry pairing, and fail-safe return-to-launch configurations.",
  },
  {
    id: "guide-3",
    slug: "esp32-lorawan-iot-gateway",
    title: "Long-Range Smart Farm Telemetry with ESP32 & SX1278 LoRa",
    category: "IoT & Wireless",
    readTime: "5 min read",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
    summary:
      "Transmit soil moisture & temperature sensor telemetry up to 10km with low power consumption.",
  },
];

export const KnowledgeCenterSection: React.FC = () => {
  return (
    <section className="py-12 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-[#00AEEF] flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> PRAYOG KNOWLEDGE CENTER & DIY
              GUIDES
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Developer Tutorials & Hardware Guides
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Learn how to wire, code, and deploy robotics, drone autopilots,
              and IoT systems.
            </p>
          </div>

          <Link
            href="/learning"
            className="text-xs sm:text-sm font-extrabold text-[#00AEEF] hover:underline flex items-center gap-1 group self-start sm:self-auto cursor-pointer"
          >
            <span>Explore All 50+ Guides</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Guides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {BLOG_POSTS.map((post) => (
            <Link
              key={post.id}
              href={`/learning`}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:border-[#00AEEF] hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Thumbnail */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-[#FFC20E] text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                    {post.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{post.readTime}</span>
                  </div>

                  <h3 className="text-sm font-black text-slate-900 group-hover:text-[#00AEEF] transition-colors leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    {post.summary}
                  </p>
                </div>
              </div>

              {/* Read Action */}
              <div className="p-5 pt-0 flex items-center gap-1 text-xs font-black text-[#00AEEF]">
                <span>Read Full Guide</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
