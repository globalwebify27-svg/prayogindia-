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
  Building2,
  FileText,
  Cpu,
  Headphones,
  Sparkles,
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
        <div className="bg-gradient-to-br from-[#F0F9FF] via-white to-[#F8FAFC] rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm relative overflow-hidden border border-sky-100">
          {/* Subtle Ambient Decorative Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-sky-100/50 rounded-full blur-3xl pointer-events-none -z-0" />
          <div className="absolute -bottom-10 left-1/3 w-80 h-80 bg-amber-50/60 rounded-full blur-3xl pointer-events-none -z-0" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Column (Span 7): Core Messaging & Actions */}
            <div className="lg:col-span-7 space-y-4">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#E0F7FC] border border-[#00AEEF]/20 px-3.5 py-1 rounded-full shadow-2xs">
                <Building2 className="w-3.5 h-3.5 text-[#00AEEF]" /> Institutional &amp; B2B Desk
              </span>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Technology Solutions for{" "}
                <span className="text-[#00AEEF]">Institutions &amp; Labs</span>
              </h2>

              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-xl font-medium">
                Access specialized institutional procurement, volume discounts, official GST tax invoicing, and turnkey robotics &amp; STEM hardware packages tailored for schools, universities, and research labs.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={onOpenB2BModal}
                  className="bg-[#00AEEF] hover:bg-[#0096D6] text-white font-bold px-6 py-3.5 rounded-xl text-xs sm:text-sm shadow-md shadow-[#00AEEF]/20 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <span>Request Institutional Quote</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onOpenB2BModal}
                  className="bg-white hover:bg-slate-50 text-slate-800 font-bold px-5 py-3.5 rounded-xl text-xs sm:text-sm border border-slate-200 transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
                >
                  <Headphones className="w-4 h-4 text-[#00AEEF]" />
                  <span>Talk to an Expert</span>
                </button>
              </div>

              {/* Verified Client Sectors */}
              <div className="pt-4 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px] font-bold text-slate-600">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00AEEF] shrink-0" />
                  <span>Schools &amp; Colleges</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00AEEF] shrink-0" />
                  <span>STEM &amp; ATL Labs</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00AEEF] shrink-0" />
                  <span>Corporate R&amp;D</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00AEEF] shrink-0" />
                  <span>GeM &amp; Tenders</span>
                </div>
              </div>
            </div>

            {/* Right Column (Span 5): Sleek Feature & Benefit Cards */}
            <div className="lg:col-span-5 space-y-3">
              {/* Feature Card 1: Bulk Discounts & Invoicing */}
              <div className="bg-white/90 backdrop-blur-xs p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-3.5 hover:border-[#00AEEF]/50 transition-all">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#00AEEF] flex items-center justify-center shrink-0 border border-sky-100">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
                    Tiered Institutional Pricing
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">
                    Official GST proforma tax invoices with volume discounts up to 35% on batch orders.
                  </p>
                </div>
              </div>

              {/* Feature Card 2: Turnkey Lab Packages */}
              <div className="bg-white/90 backdrop-blur-xs p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-3.5 hover:border-[#00AEEF]/50 transition-all">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
                    Turnkey Lab &amp; Curriculum Kits
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">
                    Complete setups for robotics, IoT sensors, drone flight controllers, and microcontrollers.
                  </p>
                </div>
              </div>

              {/* Feature Card 3: Priority Regional Dispatch */}
              <div className="bg-white/90 backdrop-blur-xs p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-3.5 hover:border-[#00AEEF]/50 transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
                    Priority Regional Dispatch
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">
                    Same-day and 24h dispatch from Ranchi &amp; Patna hubs with dedicated technical support.
                  </p>
                </div>
              </div>
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
        "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=600&q=80",
      verified: true,
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
        "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80",
      verified: true,
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
        "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
      verified: true,
    },
    {
      id: "rev-4",
      name: "Dr. Meera Nambiar",
      role: "AI & Robotics Scientist",
      institution: "IISc Bangalore",
      rating: 5,
      comment:
        "Procured Jetson Orin Nano modules for our SLAM LiDAR rover project. Hardware performance and GPIO pinout reliability are impeccable. Excellent institutional support.",
      product: "Jetson Orin Nano Kit",
      buildImage:
        "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80",
      verified: true,
    },
    {
      id: "rev-5",
      name: "Amitav Sanyal",
      role: "Drone Systems Lead",
      institution: "AeroTech Innovations",
      rating: 5,
      comment:
        "The brushless A2212 motors and 30A ESCs balanced perfectly during payload drop testing. Zero jitter and solid telemetry communication up to 4km range.",
      product: "Carbon Quad Frame",
      buildImage:
        "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80",
      verified: true,
    },
    {
      id: "rev-6",
      name: "Vikramjit Singh",
      role: "Embedded Club Mentor",
      institution: "DTU Delhi",
      rating: 5,
      comment:
        "High-torque MG996R metal gear servos handled multi-axis inverse kinematics smoothly during our annual inter-college robotics symposium.",
      product: "6-DOF Robot Arm Kit",
      buildImage:
        "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80",
      verified: true,
    },
    {
      id: "rev-7",
      name: "Pooja Agarwal",
      role: "Electronics Dept",
      institution: "NIT Patna",
      rating: 5,
      comment:
        "Local Patna hub delivered our batch order within 18 hours. The LED matrix on the UNO R4 WiFi is great for teaching embedded C to undergraduate engineering students.",
      product: "Arduino UNO R4 WiFi",
      buildImage:
        "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=600&q=80",
      verified: true,
    },
    {
      id: "rev-8",
      name: "Kunal Mukherjee",
      role: "Automation Engineer",
      institution: "Kolkata AgriTech",
      rating: 5,
      comment:
        "Industrial grade capacitive soil moisture probes and LoRa SX1278 transceivers deployed across 20 greenhouse zones with flawless telemetry packet reception.",
      product: "Smart Agri LoRa Kit",
      buildImage:
        "https://images.unsplash.com/photo-1608564697071-ddf911d81370?auto=format&fit=crop&w=600&q=80",
      verified: true,
    },
  ];

  // Circular linked list array: duplicated items for seamless infinite wrap
  const circularReviews = [...VERIFIED_REVIEWS, ...VERIFIED_REVIEWS];

  return (
    <section className="py-12 bg-slate-50/70 border-t border-slate-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2.5">
          <div className="inline-flex items-center gap-1.5 bg-[#E0F7FC] text-[#00AEEF] text-[11px] font-black tracking-widest uppercase px-3.5 py-1 rounded-full border border-[#00AEEF]/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED CUSTOMER REVIEWS &amp; BUILDS
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            Trusted by 5,000+ Innovators, Labs &amp; Schools
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Real customer hardware setups, verified ratings, and project builds across India.
          </p>
        </div>

        {/* Circular Linked-List Infinite Marquee Track */}
        <div className="circular-loop-wrapper py-2">
          <div className="circular-loop-track">
            {circularReviews.map((t, idx) => (
              <div
                key={`${t.id}-${idx}`}
                className="w-[300px] sm:w-[350px] shrink-0 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-[#00AEEF]/50 transition-all duration-300 flex flex-col justify-between space-y-3.5 group select-none cursor-pointer"
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
                  <p className="text-xs text-slate-700 leading-relaxed font-medium line-clamp-3">
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
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-black text-slate-900 truncate">
                      {t.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold truncate">
                      {t.role} • {t.institution}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg shrink-0 max-w-[130px] truncate">
                    {t.product}
                  </span>
                </div>
              </div>
            ))}
          </div>
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
