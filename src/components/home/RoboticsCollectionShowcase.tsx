"use client";

import React from "react";
import { motion } from "framer-motion";
import { Palette, Plane, Bot, Layers, ArrowRight } from "lucide-react";

interface Props {
  onExploreCollection?: (collection: string) => void;
}

interface EcosystemCard {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ECOSYSTEM_CARDS: EcosystemCard[] = [
  {
    id: "arts-design",
    title: "Arts & Design",
    category: "Rapid Prototyping",
    description: "3D prototyping and computational design tools.",
    image:
      "https://res.cloudinary.com/fyueflvh/image/upload/v1788595369/prayog/ecosystem/arts-and-design.jpg",
    icon: Palette,
  },
  {
    id: "uavs-drones",
    title: "UAVs & Drones",
    category: "Drone Technology",
    description: "Flight controllers, telemetry, and aerial kits.",
    image:
      "https://res.cloudinary.com/fyueflvh/image/upload/v1788595374/prayog/ecosystem/uavs-and-drones.jpg",
    icon: Plane,
  },
  {
    id: "robotics",
    title: "Robotics",
    category: "Robotics Kits",
    description: "Manipulators, metal servos, and AGV components.",
    image:
      "https://res.cloudinary.com/fyueflvh/image/upload/v1788595373/prayog/ecosystem/robotics.jpg",
    icon: Bot,
  },
  {
    id: "rapid-prototyping",
    title: "Rapid Prototyping",
    category: "Electronic Components",
    description: "CNC tooling, mechatronic joints, and hardware.",
    image:
      "https://res.cloudinary.com/fyueflvh/image/upload/v1788595372/prayog/ecosystem/rapid-prototyping.jpg",
    icon: Layers,
  },
];

export const RoboticsCollectionShowcase: React.FC<Props> = ({
  onExploreCollection,
}) => {
  return (
    <section className="pt-2 pb-10 sm:pt-4 sm:pb-12 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-1.5 mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
            Robotics &amp; UAV Ecosystem
          </h2>
          <p className="text-sm text-slate-500 max-w-lg mx-auto leading-relaxed font-normal">
            Engineered hardware for researchers, makers, and automation labs.
          </p>
        </div>

        {/* Horizontal Expanding Feature Cards on Hover */}
        <div className="expanding-cards-track overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 scrollbar-none snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
          {ECOSYSTEM_CARDS.map((card, idx) => {
            const Icon = card.icon;

            return (
              <motion.article
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                viewport={{ once: true }}
                onClick={() => onExploreCollection?.(card.category)}
                className="feature-card-zoom group shrink-0 sm:shrink snap-center select-none border border-slate-200/70 shadow-lg hover:shadow-2xl bg-slate-950"
              >
                {/* 1. Background Image with Smooth CSS Zoom */}
                <img
                  src={card.image}
                  alt={card.title}
                  className="card-zoom-img"
                  loading={idx < 2 ? "eager" : "lazy"}
                />

                {/* 2. Subtle Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/25 to-black/90 pointer-events-none group-hover:opacity-90 transition-opacity duration-500" />

                {/* 3. Card Content */}
                <div className="relative z-10 h-full flex flex-col justify-between items-start p-5 sm:p-7 pointer-events-none">
                  {/* Top-Left Heading & Reveal Subtitle */}
                  <div className="space-y-2 max-w-full">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#00AEEF] bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 inline-flex items-center gap-1.5 shadow-sm whitespace-nowrap">
                      <Icon className="w-3 h-3 shrink-0" />
                      {card.category}
                    </span>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white leading-tight tracking-tight group-hover:text-[#00AEEF] transition-colors duration-300">
                      {card.title}
                    </h3>
                    {/* Expandable description on hover */}
                    <p className="text-xs text-slate-300 line-clamp-2 max-w-xs opacity-0 sm:group-hover:opacity-100 transition-opacity duration-500 delay-100 leading-relaxed hidden sm:block">
                      {card.description}
                    </p>
                  </div>

                  {/* Bottom-Left Semi-Transparent Button */}
                  <div className="inline-flex items-center gap-3 pl-4 pr-1.5 py-1.5 rounded-full bg-white/15 group-hover:bg-white/25 backdrop-blur-md border border-white/30 text-xs font-bold text-white transition-all duration-300 shadow-md whitespace-nowrap">
                    <span>Learn More</span>
                    <span className="w-7 h-7 rounded-full bg-white text-slate-950 flex items-center justify-center group-hover:bg-[#00AEEF] group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300 shadow-xs shrink-0">
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </span>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
