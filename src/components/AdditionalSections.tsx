"use client";

import React from "react";
import Image from "next/image";
import { INDUSTRIES, LEARNING_HUB, TESTIMONIALS } from "@/data/mockData";
import {
  ArrowRight,
  Star,
  GraduationCap,
  CheckCircle2,
  Shield,
  Truck,
  Headset,
  Award,
  Layers,
} from "lucide-react";

interface AdditionalSectionsProps {
  onOpenB2BModal: () => void;
}

export const IndustriesSection: React.FC = () => {
  return (
    <section
      id="industries"
      className="py-8 bg-slate-50/60 border-t border-slate-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-block bg-blue-50 text-[#1E56A0] text-xs font-extrabold tracking-widest uppercase px-3.5 py-1 rounded-full mb-3">
            SECTORS SERVED
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A1128] tracking-tight">
            Technology Across Industries
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {INDUSTRIES.map((ind) => (
            <div
              key={ind.id}
              className="group relative rounded-3xl overflow-hidden h-64 border border-slate-200 shadow-card-premium hover:shadow-card-hover transition-all duration-300 cursor-pointer"
            >
              <Image
                src={ind.image}
                alt={ind.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A1128]/90 via-[#0A1128]/40 to-transparent"></div>

              <div className="absolute bottom-5 left-5 right-5 text-white">
                <h3 className="text-lg font-bold group-hover:text-[#D4AF37] transition-colors mb-1">
                  {ind.title}
                </h3>
                <p className="text-xs text-slate-300 line-clamp-2">
                  {ind.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const LearningHubSection: React.FC = () => {
  return (
    <section id="learning-hub" className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-block bg-amber-50 text-[#D4AF37] text-xs font-extrabold tracking-widest uppercase px-3.5 py-1 rounded-full mb-3 border border-amber-200/60">
              LEARNING HUB
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A1128] tracking-tight">
              Learn. Build. Experiment.
            </h2>
          </div>
          <LinkButton href="#community" label="Explore All Tutorials" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {LEARNING_HUB.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-card-premium hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-[#0A1128] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {item.category}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 text-[11px] font-semibold text-[#1E56A0] mb-2">
                    <span>{item.level}</span>
                    <span>•</span>
                    <span>{item.duration}</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#0A1128] group-hover:text-[#1E56A0] transition-colors line-clamp-2 mb-2 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                    {item.description}
                  </p>
                </div>
                <div className="flex items-center text-xs font-bold text-[#1E56A0] group-hover:underline">
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const WhyPrayogSection: React.FC = () => {
  const features = [
    {
      title: "Authentic Technology Products",
      desc: "Direct sourcing from certified manufacturers with 100% component verification.",
      icon: Shield,
    },
    {
      title: "Expert Engineering Support",
      desc: "Dedicated technical support engineers for circuit debugging & UAV setup.",
      icon: Headset,
    },
    {
      title: "STEM & Robotics Learning",
      desc: "Step-by-step schematics, sample codes, and instructional video guides.",
      icon: GraduationCap,
    },
    {
      title: "Fast & Reliable Delivery",
      desc: "Express Pan-India courier dispatch with real-time tracking.",
      icon: Truck,
    },
    {
      title: "B2B & Institutional Support",
      desc: "GST invoice compliance, bulk quotation desk & educational discounts.",
      icon: Award,
    },
    {
      title: "Professional Tech Solutions",
      desc: "Custom robotics hardware design and drone payload customization.",
      icon: Layers,
    },
  ];

  return (
    <section
      id="why-prayog"
      className="py-8 bg-slate-50/70 border-y border-slate-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A1128] tracking-tight">
            More Than a Store. A Technology Ecosystem.
          </h2>
          <p className="text-slate-600 text-base mt-3">
            Prayog India by Dilay Robotics provides complete end-to-end hardware
            procurement, STEM learning resources, and technical support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card-premium flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1E56A0] flex items-center justify-center shrink-0">
                <f.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0A1128] mb-1">
                  {f.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const B2BSection: React.FC<AdditionalSectionsProps> = ({
  onOpenB2BModal,
}) => {
  return (
    <section className="py-10 sm:py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#0A1128] via-[#0F172A] to-[#1E56A0] rounded-3xl p-6 sm:p-10 lg:p-12 text-white shadow-xl relative overflow-hidden border border-slate-700/60">
          <div className="max-w-2xl relative z-10 space-y-3 sm:space-y-4">
            <span className="bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#FFC20E] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider inline-block">
              INSTITUTIONAL & B2B DESK
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Technology Solutions for Institutions & Businesses
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl">
              Access customized technology procurement, bulk institution pricing,
              and turnkey STEM & robotics lab solutions.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenB2BModal}
                className="bg-[#D4AF37] hover:bg-amber-400 text-slate-950 font-black px-6 py-3 rounded-xl text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <span>Request Quotation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenB2BModal}
                className="bg-white/10 hover:bg-white/15 text-white font-bold px-5 py-3 rounded-xl text-xs border border-white/20 transition-all cursor-pointer"
              >
                Talk to an Expert
              </button>
            </div>
            <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] font-medium text-slate-300">
              <div className="flex items-center gap-1.5"><span className="text-[#00AEEF]">✓</span> Schools & Colleges</div>
              <div className="flex items-center gap-1.5"><span className="text-[#00AEEF]">✓</span> STEM & Robotics Labs</div>
              <div className="flex items-center gap-1.5"><span className="text-[#00AEEF]">✓</span> Corporate R&D</div>
              <div className="flex items-center gap-1.5"><span className="text-[#00AEEF]">✓</span> Government Tenders</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const TestimonialsSection: React.FC = () => {
  const VERIFIED_REVIEWS = [
    {
      id: "rev-1",
      name: "Dr. Arindam Bose",
      role: "Robotics Lab Lead",
      institution: "IIT Kharagpur",
      rating: 5,
      comment:
        "Ordered 15 sets of Pixhawk 6C and SimonK ESCs for our UAV swarm testing. Ranchi dispatch arrived within 24 hours with authentic GST tax invoice. Outstanding build quality.",
      product: "Pixhawk 6C Autopilot",
      buildImage:
        "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=400&q=80",
      verified: true,
      mediaType: "photo",
    },
    {
      id: "rev-2",
      name: "Sneha Kulkarni",
      role: "STEM Coordinator",
      institution: "St. Xavier High School",
      rating: 5,
      comment:
        "The Dilay-Bot 4WD Robotics starter kits made our ATL lab workshop an absolute success. Students assembled obstacle avoiders in under 3 hours using the included manuals.",
      product: "PRAYOG Dilay-Bot Kit",
      buildImage:
        "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=400&q=80",
      verified: true,
      mediaType: "photo",
    },
    {
      id: "rev-3",
      name: "Rohan Deshmukh",
      role: "IoT Embedded Developer",
      institution: "Apex IoT Labs",
      rating: 5,
      comment:
        "Best supplier for genuine Raspberry Pi 5 8GB and dual-core ESP32 boards. Flashed firmware instantly without driver errors. Will definitely reorder for industrial projects.",
      product: "Raspberry Pi 5 (8GB)",
      buildImage:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80",
      verified: true,
      mediaType: "video",
    },
  ];

  return (
    <section className="py-12 bg-slate-50/70 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1 bg-[#E0F7FC] text-[#00AEEF] text-[11px] font-black tracking-widest uppercase px-3.5 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED CUSTOMER REVIEWS &
            BUILDS
          </div>
          <h2 className="text-3xl font-black text-slate-900">
            Trusted by 5,000+ Innovators, Labs & Schools
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Real customer hardware setups, verified ratings, and project builds
            across India.
          </p>
        </div>

        {/* Reviews Grid with Build Photo Media */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {VERIFIED_REVIEWS.map((t) => (
            <div
              key={t.id}
              className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-[#00AEEF]/40 transition-all duration-300 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                {/* Rating & Verified Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-400 gap-0.5">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>

                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> Verified Buyer
                  </span>
                </div>

                {/* Comment Text */}
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  &quot;{t.comment}&quot;
                </p>

                {/* Customer Build Media Thumbnail */}
                <div className="relative h-36 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
                  <Image
                    src={t.buildImage}
                    alt={t.product}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-md">
                    Customer Project Build
                  </span>
                </div>
              </div>

              {/* Author & Product Info */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-black text-slate-900">
                    {t.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold">
                    {t.role} • {t.institution}
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                  {t.product}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const LinkButton: React.FC<{ href: string; label: string }> = ({ label }) => (
  <button className="text-xs font-bold text-[#1E56A0] hover:text-[#0A1128] flex items-center gap-1">
    <span>{label}</span>
    <ArrowRight className="w-4 h-4" />
  </button>
);
