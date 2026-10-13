export interface HeroBanner {
  id: string;
  badge: string;
  titlePrefix: string;
  titleHighlight: string;
  description: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  image: string;
  alt: string;
  noteLines?: string[];
  displayOrder: number;
  isActive: boolean;
  theme?: "blue-gradient" | "dark-slate" | "pure-light" | "vibrant-tech";
  createdAt?: string;
  updatedAt?: string;
}

export const DEFAULT_HERO_BANNERS: HeroBanner[] = [
  {
    id: "stem-robotics",
    badge: "🇮🇳 India's #1 Robotics & Electronics Platform",
    titlePrefix: "Build. Learn.",
    titleHighlight: "Innovate.",
    description:
      "Premium quality robotics kits, microcontrollers, sensors and electronic components for students, makers and professionals.",
    primaryButtonText: "Explore Products",
    primaryButtonLink: "/products",
    secondaryButtonText: "Explore Services",
    secondaryButtonLink: "/services",
    image: "/images/robot_banner_stem.jpg",
    alt: "STEM Robotics Smart Rover Chassis Kit with Arduino and Ultrasonic Sensor",
    noteLines: ["From", "Concept", "to Creation"],
    displayOrder: 1,
    isActive: true,
    theme: "blue-gradient",
    createdAt: "2026-10-01T10:00:00Z",
  },
  {
    id: "drone-technology",
    badge: "⚡ Advanced FPV & Drone Technology",
    titlePrefix: "Design. Fly.",
    titleHighlight: "Automate.",
    description:
      "High-performance carbon fiber frames, BLDC motors, Pixhawk flight controllers, and telemetry systems engineered for precision.",
    primaryButtonText: "Explore Drones",
    primaryButtonLink: "/categories/drone-technology",
    secondaryButtonText: "Explore Services",
    secondaryButtonLink: "/services",
    image: "/images/drone_banner_lab.jpg",
    alt: "Autonomous Drone UAV Lab Workbench with Telemetry Station",
    noteLines: ["Engineered", "for Flight", "Precision"],
    displayOrder: 2,
    isActive: true,
    theme: "blue-gradient",
    createdAt: "2026-10-02T10:00:00Z",
  },
  {
    id: "embedded-ai-iot",
    badge: "🤖 Embedded AI, IoT & Microcontrollers",
    titlePrefix: "Connect. Code.",
    titleHighlight: "Transform.",
    description:
      "Raspberry Pi 5, Jetson AI edge modules, microcontrollers & IoT sensors engineered for next-generation smart robotic systems.",
    primaryButtonText: "Explore AI & IoT",
    primaryButtonLink: "/categories/iot",
    secondaryButtonText: "Explore Services",
    secondaryButtonLink: "/services",
    image: "/images/stem_robot_banner.jpg",
    alt: "Microcontrollers and IoT Edge Robotics Lab Setup",
    noteLines: ["Powering", "Next-Gen", "Makers"],
    displayOrder: 3,
    isActive: true,
    theme: "blue-gradient",
    createdAt: "2026-10-03T10:00:00Z",
  },
];

export function sortHeroBanners(banners: HeroBanner[]): HeroBanner[] {
  return [...banners].sort((a, b) => a.displayOrder - b.displayOrder);
}
