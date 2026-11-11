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
  ArrowRight,
  Star,
} from "lucide-react";

// ═══════════════ PURE 3D VECTOR SVG ILLUSTRATIONS FOR ALL 6 CARDS ═══════════════

// 1. 3D Genuine Microchip with Gold Certified Seal (100% Genuine Hardware & Boards)
const GenuineHardware3D = ({ className = "w-32 sm:w-38 h-28 sm:h-34" }: { className?: string }) => (
  <svg viewBox="0 0 180 160" fill="none" className={className}>
    <defs>
      <linearGradient id="chipBody" x1="20" y1="20" x2="140" y2="140" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F59E0B" />
        <stop offset="0.5" stopColor="#D97706" />
        <stop offset="1" stopColor="#B45309" />
      </linearGradient>
      <linearGradient id="coreGrad" x1="45" y1="45" x2="115" y2="115" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1E293B" />
        <stop offset="1" stopColor="#0F172A" />
      </linearGradient>
      <linearGradient id="goldRibbon" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#FEF08A" />
        <stop offset="0.5" stopColor="#F59E0B" />
        <stop offset="1" stopColor="#D97706" />
      </linearGradient>
      <filter id="chipGlow" x="-15%" y="-15%" width="130%" height="130%">
        <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#D97706" floodOpacity="0.28" />
      </filter>
    </defs>

    {/* Circuit board traces */}
    <path d="M15 45 H35 M15 80 H35 M15 115 H35" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
    <path d="M125 45 H145 M125 80 H145 M125 115 H145" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
    <path d="M45 15 V35 M80 15 V35 M115 15 V35" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
    <path d="M45 125 V145 M80 125 V145 M115 125 V145" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />

    {/* Chip Base */}
    <g filter="url(#chipGlow)">
      <rect x="30" y="30" width="100" height="100" rx="18" fill="url(#chipBody)" />
      {/* Inner Silicon Core */}
      <rect x="44" y="44" width="72" height="72" rx="12" fill="url(#coreGrad)" stroke="#FDE047" strokeWidth="2.5" />
      
      {/* Microcontroller circuits */}
      <rect x="52" y="52" width="56" height="56" rx="8" fill="#1E293B" opacity="0.6" />
      <path d="M60 62 H100 M60 74 H100 M60 86 H100 M60 98 H100" stroke="#F59E0B" strokeWidth="1.5" opacity="0.4" />
      
      {/* Genuine Golden Verified Shield Stamp */}
      <circle cx="80" cy="80" r="22" fill="url(#goldRibbon)" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.25))" />
      <path d="M72 80 L77 85 L89 73" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>

    {/* "100% OEM" Badge Banner */}
    <g transform="translate(92, 16)">
      <rect x="0" y="0" width="66" height="22" rx="11" fill="#10B981" filter="drop-shadow(0 3px 6px rgba(16,185,129,0.35))" />
      <text x="33" y="15" fill="#FFFFFF" fontSize="9" fontWeight="900" textAnchor="middle" letterSpacing="0.8">100% OEM</text>
    </g>
  </svg>
);

// 2. 3D Delivery Van for "Fast Dispatch Across India"
const DeliveryTruck3D = ({ className = "w-32 sm:w-38 h-28 sm:h-34" }: { className?: string }) => (
  <svg viewBox="0 0 200 160" fill="none" className={className}>
    <defs>
      <linearGradient id="truckBody" x1="20" y1="30" x2="160" y2="130" gradientUnits="userSpaceOnUse">
        <stop stopColor="#005CA9" />
        <stop offset="0.6" stopColor="#0078D7" />
        <stop offset="1" stopColor="#00AEEF" />
      </linearGradient>
      <linearGradient id="truckCabin" x1="120" y1="40" x2="185" y2="120" gradientUnits="userSpaceOnUse">
        <stop stopColor="#004885" />
        <stop offset="1" stopColor="#005CA9" />
      </linearGradient>
      <linearGradient id="windshield" x1="140" y1="45" x2="175" y2="85" gradientUnits="userSpaceOnUse">
        <stop stopColor="#BAE6FD" />
        <stop offset="1" stopColor="#38BDF8" />
      </linearGradient>
      <linearGradient id="wheelRim" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#CBD5E1" />
        <stop offset="1" stopColor="#64748B" />
      </linearGradient>
      <filter id="truckShadow" x="-10%" y="-10%" width="125%" height="135%">
        <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#005CA9" floodOpacity="0.25" />
      </filter>
    </defs>

    {/* Motion Speed Trails */}
    <path d="M8 52 H32" stroke="#93C5FD" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="4 6" opacity="0.8" />
    <path d="M4 76 H26" stroke="#60A5FA" strokeWidth="4" strokeLinecap="round" opacity="0.85" />
    <path d="M12 100 H38" stroke="#38BDF8" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="5 7" opacity="0.75" />

    {/* Main Cargo Container */}
    <g filter="url(#truckShadow)">
      <rect x="34" y="38" width="96" height="74" rx="12" fill="url(#truckBody)" />
      {/* Gold Express Banner */}
      <rect x="34" y="70" width="96" height="13" fill="#FFC20E" />
      <text x="82" y="80" fill="#0F172A" fontSize="7.5" fontWeight="900" textAnchor="middle" letterSpacing="0.8">EXPRESS DISPATCH</text>

      {/* Front Cabin */}
      <path
        d="M130 52 H158 C168 52 176 60 179 70 L185 88 C187 93 187 98 187 102 V112 H130 V52 Z"
        fill="url(#truckCabin)"
      />

      {/* Windshield Glass */}
      <path
        d="M136 58 H154 C161 58 167 63 169 70 L174 84 H136 V58 Z"
        fill="url(#windshield)"
        opacity="0.9"
      />

      {/* Headlight */}
      <rect x="183" y="94" width="5" height="10" rx="2.5" fill="#FEF08A" filter="drop-shadow(2px 0 6px #FDE047)" />
      
      {/* Front Bumper */}
      <rect x="180" y="106" width="10" height="7" rx="3" fill="#334155" />
    </g>

    {/* Back Wheel */}
    <circle cx="64" cy="116" r="17" fill="#1E293B" />
    <circle cx="64" cy="116" r="9" fill="url(#wheelRim)" />
    <circle cx="64" cy="116" r="4" fill="#0F172A" />

    {/* Front Wheel */}
    <circle cx="155" cy="116" r="17" fill="#1E293B" />
    <circle cx="155" cy="116" r="9" fill="url(#wheelRim)" />
    <circle cx="155" cy="116" r="4" fill="#0F172A" />

    {/* Floating Parcel Package */}
    <g transform="translate(15, 22)">
      <rect x="0" y="0" width="19" height="17" rx="3" fill="#D97706" />
      <path d="M0 8.5 H19 M9.5 0 V17" stroke="#FEF3C7" strokeWidth="2.2" />
    </g>
  </svg>
);

// 3. 3D Support Headset for "Dedicated Technical Support"
const TechSupportHeadset3D = ({ className = "w-30 sm:w-36 h-30 sm:h-36" }: { className?: string }) => (
  <svg viewBox="0 0 180 180" fill="none" className={className}>
    <defs>
      <linearGradient id="headbandGrad" x1="30" y1="20" x2="150" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4F46E5" />
        <stop offset="0.5" stopColor="#6366F1" />
        <stop offset="1" stopColor="#818CF8" />
      </linearGradient>
      <linearGradient id="earpadGrad" x1="20" y1="80" x2="55" y2="135" gradientUnits="userSpaceOnUse">
        <stop stopColor="#312E81" />
        <stop offset="0.6" stopColor="#4338CA" />
        <stop offset="1" stopColor="#4F46E5" />
      </linearGradient>
      <filter id="headsetGlow" x="-15%" y="-15%" width="130%" height="130%">
        <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#6366F1" floodOpacity="0.35" />
      </filter>
    </defs>

    {/* Audio Soundwaves */}
    <path d="M152 75 C162 85 162 105 152 115" stroke="#818CF8" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
    <path d="M162 65 C176 80 176 110 162 125" stroke="#A5B4FC" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="4 6" opacity="0.8" />

    <g filter="url(#headsetGlow)">
      {/* Headband Arc */}
      <path
        d="M38 100 C38 48 62 25 90 25 C118 25 142 48 142 100"
        stroke="url(#headbandGrad)"
        strokeWidth="11"
        strokeLinecap="round"
      />
      {/* Inner Cushion */}
      <path
        d="M54 75 C58 50 72 37 90 37 C108 37 122 50 126 75"
        stroke="#1E1B4B"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Left Earpad */}
      <rect x="25" y="85" width="26" height="42" rx="13" fill="url(#earpadGrad)" />
      <rect x="31" y="93" width="14" height="26" rx="7" fill="#1E1B4B" opacity="0.9" />

      {/* Right Earpad */}
      <rect x="129" y="85" width="26" height="42" rx="13" fill="url(#earpadGrad)" />
      <rect x="135" y="93" width="14" height="26" rx="7" fill="#1E1B4B" opacity="0.9" />

      {/* Microphone Boom */}
      <path
        d="M40 120 C40 148 65 156 95 156 H112"
        stroke="#64748B"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Mic Capsule with Live Green LED */}
      <rect x="110" y="148" width="18" height="16" rx="5" fill="#1E293B" />
      <circle cx="123" cy="156" r="3" fill="#10B981" filter="drop-shadow(0 0 5px #10B981)" />
    </g>

    {/* 24/7 Center Badge */}
    <g transform="translate(80, 68)">
      <circle cx="10" cy="10" r="15" fill="#EEF2FF" stroke="#C7D2FE" strokeWidth="2" />
      <text x="10" y="14" fill="#4F46E5" fontSize="11" fontWeight="900" textAnchor="middle">24/7</text>
    </g>
  </svg>
);

// 4. 3D STEM Robotics Rover Car (STEM & Institutional Experts)
const RobotCar3D = ({ className = "w-32 sm:w-40 h-28 sm:h-34" }: { className?: string }) => (
  <svg viewBox="0 0 190 150" fill="none" className={className}>
    <defs>
      <linearGradient id="chassisGrad" x1="30" y1="40" x2="160" y2="120" gradientUnits="userSpaceOnUse">
        <stop stopColor="#005CA9" />
        <stop offset="0.6" stopColor="#0078D7" />
        <stop offset="1" stopColor="#38BDF8" />
      </linearGradient>
      <linearGradient id="yellowWheel" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#FDE047" />
        <stop offset="0.6" stopColor="#EAB308" />
        <stop offset="1" stopColor="#CA8A04" />
      </linearGradient>
      <filter id="robotShadow" x="-10%" y="-10%" width="125%" height="135%">
        <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#7C3AED" floodOpacity="0.22" />
      </filter>
    </defs>

    {/* Back Left Wheel */}
    <rect x="36" y="24" width="22" height="38" rx="7" fill="#1E293B" />
    <rect x="40" y="30" width="14" height="26" rx="4" fill="url(#yellowWheel)" />

    {/* Back Right Wheel */}
    <rect x="132" y="24" width="22" height="38" rx="7" fill="#1E293B" />
    <rect x="136" y="30" width="14" height="26" rx="4" fill="url(#yellowWheel)" />

    {/* Main Chassis Body */}
    <g filter="url(#robotShadow)">
      <rect x="48" y="40" width="94" height="74" rx="16" fill="url(#chassisGrad)" />
      
      {/* Electronic Circuit Controller */}
      <rect x="60" y="52" width="70" height="42" rx="8" fill="#0F172A" />
      <circle cx="72" cy="62" r="3" fill="#10B981" />
      <circle cx="82" cy="62" r="3" fill="#38BDF8" />
      <circle cx="92" cy="62" r="3" fill="#F59E0B" />
      
      {/* Ultrasonic Sensor Eyes ("HC-SR04") */}
      <g transform="translate(67, 102)">
        <rect x="0" y="0" width="56" height="22" rx="6" fill="#0284C7" />
        {/* Left Sensor Transducer */}
        <circle cx="16" cy="11" r="9" fill="#E2E8F0" stroke="#0F172A" strokeWidth="2.5" />
        <circle cx="16" cy="11" r="5" fill="#334155" />
        <circle cx="16" cy="11" r="2" fill="#F8FAFC" />
        {/* Right Sensor Transducer */}
        <circle cx="40" cy="11" r="9" fill="#E2E8F0" stroke="#0F172A" strokeWidth="2.5" />
        <circle cx="40" cy="11" r="5" fill="#334155" />
        <circle cx="40" cy="11" r="2" fill="#F8FAFC" />
      </g>
    </g>

    {/* Front Left Yellow Wheel */}
    <rect x="28" y="80" width="24" height="42" rx="8" fill="#0F172A" />
    <rect x="33" y="87" width="14" height="28" rx="5" fill="url(#yellowWheel)" />

    {/* Front Right Yellow Wheel */}
    <rect x="138" y="80" width="24" height="42" rx="8" fill="#0F172A" />
    <rect x="143" y="87" width="14" height="28" rx="5" fill="url(#yellowWheel)" />

    {/* Antenna / Jumper wires */}
    <path d="M75 52 Q65 30 55 25" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <path d="M85 52 Q80 25 72 20" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <path d="M95 52 Q105 28 115 22" stroke="#EAB308" strokeWidth="2.5" strokeLinecap="round" fill="none" />
  </svg>
);

// 5. 3D Gold & Blue Shield (Secure Shopping Guarantee)
const Shield3D = ({ className = "w-32 sm:w-40 h-32 sm:h-40" }: { className?: string }) => (
  <svg viewBox="0 0 200 200" fill="none" className={className}>
    <defs>
      <linearGradient id="shieldGrad" x1="40" y1="20" x2="160" y2="180" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38BDF8" />
        <stop offset="0.45" stopColor="#2563EB" />
        <stop offset="1" stopColor="#1E3A8A" />
      </linearGradient>
      <linearGradient id="shieldBorder" x1="100" y1="20" x2="100" y2="175" gradientUnits="userSpaceOnUse">
        <stop stopColor="#BAE6FD" />
        <stop offset="0.6" stopColor="#60A5FA" />
        <stop offset="1" stopColor="#1D4ED8" />
      </linearGradient>
      <linearGradient id="goldRing" x1="20" y1="80" x2="180" y2="120" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FEF08A" />
        <stop offset="0.3" stopColor="#FDE047" />
        <stop offset="0.7" stopColor="#F59E0B" />
        <stop offset="1" stopColor="#D97706" />
      </linearGradient>
      <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    {/* Back orbital rings */}
    <ellipse
      cx="100"
      cy="110"
      rx="78"
      ry="23"
      transform="rotate(-20 100 110)"
      stroke="url(#goldRing)"
      strokeWidth="5.5"
      strokeDasharray="130 190"
      opacity="0.85"
    />
    <ellipse
      cx="100"
      cy="114"
      rx="72"
      ry="19"
      transform="rotate(-14 100 114)"
      stroke="url(#goldRing)"
      strokeWidth="4"
      strokeDasharray="110 170"
      opacity="0.75"
    />

    {/* 3D Curved Blue Shield Body */}
    <path
      d="M100 24 C132 34 158 40 166 46 C166 102 146 148 100 176 C54 148 34 102 34 46 C42 40 68 34 100 24 Z"
      fill="url(#shieldGrad)"
      stroke="url(#shieldBorder)"
      strokeWidth="4.5"
      filter="drop-shadow(0 14px 22px rgba(37,99,235,0.38))"
    />

    {/* Glossy Reflection Highlight */}
    <path
      d="M100 32 C124 40 146 44 154 50 C154 94 138 136 100 162 C62 136 46 94 46 50 C54 44 76 40 100 32 Z"
      fill="none"
      stroke="rgba(255,255,255,0.45)"
      strokeWidth="2"
    />

    {/* Front 3D Padlock */}
    <rect
      x="84"
      y="92"
      width="32"
      height="26"
      rx="6"
      fill="#FFFFFF"
      filter="drop-shadow(0 4px 6px rgba(0,0,0,0.18))"
    />
    <path
      d="M91 92 V82 C91 77 95 73 100 73 C105 73 109 77 109 82 V92"
      stroke="#FFFFFF"
      strokeWidth="4.5"
      strokeLinecap="round"
      fill="none"
    />
    <circle cx="100" cy="103" r="2.5" fill="#1E3A8A" />
    <path d="M100 105.5 V110" stroke="#1E3A8A" strokeWidth="2.5" strokeLinecap="round" />

    {/* Front orbital rings crossing in front */}
    <ellipse
      cx="100"
      cy="110"
      rx="78"
      ry="23"
      transform="rotate(-20 100 110)"
      stroke="url(#goldRing)"
      strokeWidth="6"
      strokeDasharray="180 140"
      strokeDashoffset="150"
      filter="url(#goldGlow)"
    />
  </svg>
);

// 6. 3D Quadcopter Drone (Vibrant Learning Community)
const Drone3D = ({ className = "w-32 sm:w-40 h-28 sm:h-34" }: { className?: string }) => (
  <svg viewBox="0 0 190 150" fill="none" className={className}>
    <defs>
      <linearGradient id="droneBody" x1="40" y1="40" x2="150" y2="120" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFFFFF" />
        <stop offset="0.6" stopColor="#E2E8F0" />
        <stop offset="1" stopColor="#94A3B8" />
      </linearGradient>
      <linearGradient id="propellerGrad" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#0F172A" />
        <stop offset="1" stopColor="#334155" />
      </linearGradient>
      <linearGradient id="tealAccent" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#2DD4BF" />
        <stop offset="1" stopColor="#0D9488" />
      </linearGradient>
      <filter id="droneShadow" x="-10%" y="-10%" width="125%" height="135%">
        <feDropShadow dx="0" dy="12" stdDeviation="12" floodColor="#0D9488" floodOpacity="0.25" />
      </filter>
    </defs>

    {/* Quadcopter Carbon Fiber Arms */}
    <path d="M50 45 L95 75 L140 45" stroke="#475569" strokeWidth="7" strokeLinecap="round" />
    <path d="M50 105 L95 75 L140 105" stroke="#475569" strokeWidth="7" strokeLinecap="round" />

    {/* 4 Motor Mounts */}
    <circle cx="50" cy="45" r="9" fill="#1E293B" />
    <circle cx="140" cy="45" r="9" fill="#1E293B" />
    <circle cx="50" cy="105" r="9" fill="#1E293B" />
    <circle cx="140" cy="105" r="9" fill="#1E293B" />

    {/* 4 Rotating Propellers */}
    <ellipse cx="50" cy="45" rx="32" ry="7" transform="rotate(-25 50 45)" fill="url(#propellerGrad)" opacity="0.85" />
    <circle cx="50" cy="45" r="4" fill="#0D9488" />

    <ellipse cx="140" cy="45" rx="32" ry="7" transform="rotate(25 140 45)" fill="url(#propellerGrad)" opacity="0.85" />
    <circle cx="140" cy="45" r="4" fill="#0D9488" />

    <ellipse cx="50" cy="105" rx="32" ry="7" transform="rotate(25 50 105)" fill="url(#propellerGrad)" opacity="0.85" />
    <circle cx="50" cy="105" r="4" fill="#0D9488" />

    <ellipse cx="140" cy="105" rx="32" ry="7" transform="rotate(-25 140 105)" fill="url(#propellerGrad)" opacity="0.85" />
    <circle cx="140" cy="105" r="4" fill="#0D9488" />

    {/* Center Drone Fuselage with 4K Camera Gimbal */}
    <g filter="url(#droneShadow)">
      {/* Aerodynamic Body */}
      <path
        d="M75 58 C75 52 82 48 95 48 C108 48 115 52 115 58 L118 84 C118 92 108 96 95 96 C82 96 72 92 72 84 Z"
        fill="url(#droneBody)"
        stroke="#CBD5E1"
        strokeWidth="2"
      />

      {/* Top Teal Accent Canopy */}
      <path
        d="M82 54 C82 50 88 49 95 49 C102 49 108 50 108 54 L110 70 H80 Z"
        fill="url(#tealAccent)"
      />

      {/* 4K Camera Gimbal */}
      <circle cx="95" cy="98" r="8" fill="#0F172A" />
      <circle cx="95" cy="98" r="4.5" fill="#38BDF8" />
      <circle cx="96" cy="97" r="1.5" fill="#FFFFFF" />

      {/* LED Flight Lights */}
      <circle cx="50" cy="45" r="2.5" fill="#EF4444" filter="drop-shadow(0 0 4px #EF4444)" />
      <circle cx="140" cy="45" r="2.5" fill="#10B981" filter="drop-shadow(0 0 4px #10B981)" />
      <circle cx="50" cy="105" r="2.5" fill="#10B981" filter="drop-shadow(0 0 4px #10B981)" />
      <circle cx="140" cy="105" r="2.5" fill="#10B981" filter="drop-shadow(0 0 4px #10B981)" />
    </g>

    {/* Landing Skids */}
    <path d="M74 88 L68 112 M116 88 L122 112" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

interface FeatureItem {
  id: string;
  badge: {
    icon: (cls: string) => React.ReactNode;
    text: string;
    pillBg: string;
    textColor: string;
    border: string;
  };
  titleLine1: string;
  titleLine2: string;
  titleLine2Color: string;
  description: string;
  linkText: string;
  linkTheme: {
    circleBg: string;
    hoverText: string;
    dotColor: string;
  };
  cardBorder: string;
  cardBg: string;
  glowColor: string;
  isPopular?: boolean;
  Illustration: React.ComponentType<{ className?: string }>;
}

export const WhyChoosePrayog: React.FC = () => {
  const FEATURES: FeatureItem[] = [
    {
      id: "1",
      badge: {
        icon: (cls) => <ShieldCheck className={cls} />,
        text: "Authentic",
        pillBg: "bg-amber-50/90",
        textColor: "text-amber-800",
        border: "border-amber-200/90",
      },
      titleLine1: "100% Genuine",
      titleLine2: "Hardware & Boards",
      titleLine2Color: "text-amber-600",
      description: "Directly sourced from certified microchip manufacturers with full GST invoice & serial verification.",
      linkText: "OEM Direct Sourced",
      linkTheme: {
        circleBg: "bg-amber-600 group-hover:bg-amber-700",
        hoverText: "group-hover:text-amber-600",
        dotColor: "bg-amber-500",
      },
      cardBorder: "border-amber-200/80 hover:border-amber-400 hover:shadow-amber-500/10",
      cardBg: "bg-gradient-to-br from-white via-white to-amber-50/60",
      glowColor: "bg-amber-200/50",
      Illustration: GenuineHardware3D,
    },
    {
      id: "2",
      badge: {
        icon: (cls) => <Truck className={cls} />,
        text: "Express",
        pillBg: "bg-blue-50/90",
        textColor: "text-[#005CA9]",
        border: "border-blue-200/90",
      },
      titleLine1: "Fast Dispatch",
      titleLine2: "Across India",
      titleLine2Color: "text-[#005CA9]",
      description: "Express courier shipping with real-time tracking for schools, universities, and maker labs.",
      linkText: "Pan-India Dispatch",
      linkTheme: {
        circleBg: "bg-[#005CA9] group-hover:bg-[#004885]",
        hoverText: "group-hover:text-[#005CA9]",
        dotColor: "bg-[#005CA9]",
      },
      cardBorder: "border-blue-200/80 hover:border-blue-400 hover:shadow-blue-500/10",
      cardBg: "bg-gradient-to-br from-white via-white to-sky-50/60",
      glowColor: "bg-sky-200/50",
      Illustration: DeliveryTruck3D,
    },
    {
      id: "3",
      badge: {
        icon: (cls) => <Headphones className={cls} />,
        text: "24/7 Support",
        pillBg: "bg-indigo-50/90",
        textColor: "text-indigo-800",
        border: "border-indigo-200/90",
      },
      titleLine1: "Dedicated",
      titleLine2: "Technical Support",
      titleLine2Color: "text-indigo-600",
      description: "In-house electronics & robotics engineers available for pinouts, driver issues, and code help.",
      linkText: "In-House Engineers",
      linkTheme: {
        circleBg: "bg-indigo-600 group-hover:bg-indigo-700",
        hoverText: "group-hover:text-indigo-600",
        dotColor: "bg-indigo-500",
      },
      cardBorder: "border-indigo-200/80 hover:border-indigo-400 hover:shadow-indigo-500/10",
      cardBg: "bg-gradient-to-br from-white via-white to-indigo-50/60",
      glowColor: "bg-indigo-200/50",
      Illustration: TechSupportHeadset3D,
    },
    {
      id: "4",
      badge: {
        icon: (cls) => <GraduationCap className={cls} />,
        text: "500+ Labs",
        pillBg: "bg-purple-50",
        textColor: "text-purple-700",
        border: "border-purple-200/90",
      },
      titleLine1: "STEM &",
      titleLine2: "Institutional Experts",
      titleLine2Color: "text-purple-600",
      description: "Over 500+ school and university STEM labs designed and commissioned across India.",
      linkText: "Institutional STEM",
      linkTheme: {
        circleBg: "bg-purple-600 group-hover:bg-purple-700",
        hoverText: "group-hover:text-purple-600",
        dotColor: "bg-purple-500",
      },
      cardBorder: "border-purple-200/90 hover:border-purple-300 hover:shadow-purple-500/10",
      cardBg: "bg-gradient-to-br from-white via-white to-purple-50/80",
      glowColor: "bg-purple-200/50",
      Illustration: RobotCar3D,
    },
    {
      id: "5",
      badge: {
        icon: (cls) => <Lock className={cls} />,
        text: "Encrypted",
        pillBg: "bg-amber-100",
        textColor: "text-amber-950",
        border: "border-amber-300",
      },
      titleLine1: "Secure Shopping",
      titleLine2: "Guarantee",
      titleLine2Color: "text-[#EA580C]",
      description: "256-bit encrypted checkout with UPI, Net Banking, Credit Cards, and GST Purchase orders.",
      linkText: "Safe Payment Gateways",
      linkTheme: {
        circleBg: "bg-orange-500 group-hover:bg-orange-600",
        hoverText: "group-hover:text-orange-600",
        dotColor: "bg-orange-500",
      },
      cardBorder: "border-2 border-amber-400 shadow-md shadow-amber-500/10 hover:border-amber-500 hover:shadow-xl",
      cardBg: "bg-gradient-to-br from-white via-amber-50/30 to-orange-50/85",
      glowColor: "bg-amber-300/45",
      isPopular: true,
      Illustration: Shield3D,
    },
    {
      id: "6",
      badge: {
        icon: (cls) => <Users className={cls} />,
        text: "Community",
        pillBg: "bg-teal-50",
        textColor: "text-teal-700",
        border: "border-teal-200/90",
      },
      titleLine1: "Vibrant Learning",
      titleLine2: "Community",
      titleLine2Color: "text-teal-600",
      description: "Free access to build tutorials, open-source code repositories, and flight tuning workshops.",
      linkText: "Open Hardware Hub",
      linkTheme: {
        circleBg: "bg-teal-600 group-hover:bg-teal-700",
        hoverText: "group-hover:text-teal-600",
        dotColor: "bg-teal-500",
      },
      cardBorder: "border-teal-200/90 hover:border-teal-300 hover:shadow-teal-500/10",
      cardBg: "bg-gradient-to-br from-white via-white to-teal-50/80",
      glowColor: "bg-teal-200/50",
      Illustration: Drone3D,
    },
  ];

  return (
    <section id="why-choose-prayog" className="relative py-8 sm:py-16 bg-gradient-to-b from-slate-50/60 via-white to-slate-50/60 border-y border-slate-200/80 overflow-hidden">
      {/* Subtle Ambient Section Highlights */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-blue-100/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-amber-100/25 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full px-3.5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 space-y-5 sm:space-y-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="flex flex-col items-center gap-1.5 sm:gap-2">
            <span className="bg-blue-50 text-[#005CA9] border border-blue-200 text-[11px] sm:text-[13px] font-bold px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full uppercase tracking-wider inline-flex items-center justify-center shadow-2xs">
              Why Prayog India
            </span>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Engineered for Innovation, Built on Trust
            </h2>
          </div>

          <p className="text-[11px] sm:text-sm text-slate-500 font-normal max-w-xl mx-auto leading-relaxed">
            Trusted by makers, robotics innovators, and 500+ academic institutions across India with certified hardware and expert guidance.
          </p>
        </div>

        {/* Dynamic Cards Grid: Mobile Bento Arrangement (Hero 1 + 2x2 Core + Feature 6) & Desktop 3-Col Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 lg:gap-6">
          {FEATURES.map((feat, idx) => {
            const isFullWidthMobile = idx === 0 || idx === 5;
            const IllustrationComp = feat.Illustration;

            return (
              <motion.div
                key={feat.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: idx * 0.04 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                className={`relative ${feat.cardBg} rounded-2xl sm:rounded-[28px] p-3.5 sm:p-6 lg:p-7 border shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between overflow-hidden cursor-default min-h-[170px] sm:min-h-[220px] ${
                  isFullWidthMobile ? "col-span-2 md:col-span-1" : "col-span-1 md:col-span-1"
                } ${feat.cardBorder}`}
              >
                {/* Optional Most Popular Top-Right Ribbon */}
                {feat.isPopular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] sm:text-[11px] font-extrabold uppercase px-2 py-1 sm:px-3 sm:py-1.5 rounded-bl-xl sm:rounded-bl-2xl rounded-tr-xl sm:rounded-tr-[26px] shadow-sm flex items-center gap-1 z-20">
                    <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-white" />
                    <span>Popular</span>
                  </div>
                )}

                {/* Decorative Subtle Corner Aura */}
                <div
                  className={`absolute -bottom-8 -right-8 w-44 h-44 rounded-full ${feat.glowColor} blur-2xl opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none`}
                />

                {/* Card Content */}
                <div className="relative z-10">
                  {/* Full-width mobile layout (Hero cards #1 and #6) */}
                  {isFullWidthMobile ? (
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Pill Badge */}
                        <div
                          className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg sm:rounded-xl border text-[10px] sm:text-[11px] font-bold shadow-2xs mb-2 sm:mb-3 ${feat.badge.pillBg} ${feat.badge.border} ${feat.badge.textColor}`}
                        >
                          {feat.badge.icon("w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.3]")}
                          <span>{feat.badge.text}</span>
                        </div>

                        {/* Two-Tone Bold Title */}
                        <h3 className="text-base sm:text-xl lg:text-[22px] font-black tracking-tight leading-snug">
                          <span className="text-slate-900 block sm:inline">{feat.titleLine1} </span>
                          <span className={`${feat.titleLine2Color} block sm:inline`}>{feat.titleLine2}</span>
                        </h3>

                        {/* Description */}
                        <p className="text-[11px] sm:text-[13px] text-slate-600 mt-1 sm:mt-2 leading-relaxed">
                          {feat.description}
                        </p>
                      </div>

                      {/* Right-aligned 3D illustration badge for mobile featured hero cards */}
                      <div className="shrink-0 w-16 h-16 sm:w-24 sm:h-24 md:hidden flex items-center justify-center -mr-1">
                        <IllustrationComp className="w-full h-full object-contain drop-shadow-sm" />
                      </div>
                    </div>
                  ) : (
                    /* 2-column mobile layout for middle cards #2, #3, #4, #5 */
                    <div>
                      {/* Pill Badge */}
                      <div
                        className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg sm:rounded-xl border text-[9.5px] sm:text-[11px] font-bold shadow-2xs mb-2 sm:mb-3.5 ${feat.badge.pillBg} ${feat.badge.border} ${feat.badge.textColor}`}
                      >
                        {feat.badge.icon("w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.3]")}
                        <span>{feat.badge.text}</span>
                      </div>

                      {/* Two-Tone Bold Title */}
                      <h3 className="text-[13px] sm:text-base lg:text-[22px] font-black tracking-tight leading-tight sm:leading-snug">
                        <span className="text-slate-900 block truncate">{feat.titleLine1}</span>
                        <span className={`${feat.titleLine2Color} block truncate`}>{feat.titleLine2}</span>
                      </h3>

                      {/* Description */}
                      <p className="text-[10.5px] sm:text-xs lg:text-[13px] text-slate-600 mt-1 sm:mt-2 line-clamp-2 md:line-clamp-none leading-snug sm:leading-relaxed">
                        {feat.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom Feature Link with Indicator Dot and Circular Action Button */}
                <div className="relative z-10 mt-3 sm:mt-6 pt-2.5 sm:pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold text-slate-700 transition-colors min-w-0 pr-1">
                    <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 ${feat.linkTheme.dotColor}`} />
                    <span className={`${feat.linkTheme.hoverText} truncate`}>{feat.linkText}</span>
                  </div>
                  <div
                    className={`w-5 h-5 sm:w-7 sm:h-7 rounded-full text-white flex items-center justify-center shadow-xs shrink-0 transition-transform duration-200 group-hover:scale-110 group-hover:translate-x-0.5 ${feat.linkTheme.circleBg}`}
                  >
                    <ArrowRight className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
