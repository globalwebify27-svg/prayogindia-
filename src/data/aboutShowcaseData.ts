// src/data/aboutShowcaseData.ts

export type ShowcaseIconType =
  | "users"
  | "plane"
  | "shield"
  | "award"
  | "bot"
  | "cpu"
  | "wrench";

export type ShowcaseBubbleColor =
  | "amber"
  | "blue"
  | "emerald"
  | "purple"
  | "rose";

export interface AboutShowcaseItem {
  id: string;
  title: string;
  badge: string;
  iconType: ShowcaseIconType;
  bubbleColor: ShowcaseBubbleColor;
  description: string;
  image: string;
  alt: string;
  displayOrder: number;
  isActive: boolean;
}

export const DEFAULT_ABOUT_SHOWCASE: AboutShowcaseItem[] = [
  {
    id: "showcase-1",
    title: "Robotics Mentorship & ATL Certification",
    badge: "Hands-On Mentorship",
    iconType: "users",
    bubbleColor: "amber",
    description:
      "Equipping educators, student researchers, and innovation centers with certified mechatronics curricula.",
    image: "/images/about/aim-mentorship.jpg",
    alt: "Prayog India Robotics Training & Laboratory Certification",
    displayOrder: 1,
    isActive: true,
  },
  {
    id: "showcase-2",
    title: "Autonomous Flight & Arena Demonstrations",
    badge: "Live Flight Testing",
    iconType: "plane",
    bubbleColor: "blue",
    description:
      "Pixhawk avionics, PX4 telemetry, and high-performance UAV flight demonstrations in field arenas.",
    image: "/images/about/aim-field-demonstration.jpg",
    alt: "Autonomous Drone Flight Demonstration & Arena Testing",
    displayOrder: 2,
    isActive: true,
  },
  {
    id: "showcase-3",
    title: "On-Ground Hardware Verification & Turnkey Deployment",
    badge: "Field QC Verification",
    iconType: "shield",
    bubbleColor: "emerald",
    description:
      "Direct field deployment, turnkey equipment setup, and testing across India.",
    image: "/images/about/aim-flight-testing.jpg",
    alt: "On-Ground Hardware Field Testing & Lab Engineering",
    displayOrder: 3,
    isActive: true,
  },
];

export function sortShowcaseItems(items: AboutShowcaseItem[]): AboutShowcaseItem[] {
  return [...items].sort((a, b) => a.displayOrder - b.displayOrder);
}

export const BUBBLE_COLOR_MAP: Record<ShowcaseBubbleColor, string> = {
  amber: "bg-[#FFC20E] text-slate-900",
  blue: "bg-[#2563EB] text-white",
  emerald: "bg-emerald-600 text-white",
  purple: "bg-purple-600 text-white",
  rose: "bg-rose-600 text-white",
};
