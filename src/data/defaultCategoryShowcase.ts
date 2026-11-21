export interface CategoryCardItem {
  id: string;
  name: string;
  line1?: string;
  line2?: string;
  slug: string;
  href: string;
  image: string;
  imageAlt: string;
  tagline?: string;
  productCount?: string;
  badgeIcon?: "robot" | "cpu" | "radio" | "drone" | "graduation" | "wifi" | "code" | "chip" | "zap" | "wrench";
  themeColor?: "blue" | "teal" | "purple" | "amber" | "indigo" | "emerald" | "rose" | "cyan";
  isFeatured?: boolean;
  sortOrder?: number;
  isActive?: boolean;
  showOverlay?: boolean;
}

export const DEFAULT_CATEGORY_SHOWCASE: CategoryCardItem[] = [
  {
    id: "robotics",
    name: "Robotics",
    slug: "robotics",
    href: "/categories/robotics",
    tagline: "Build. Learn. Create.",
    productCount: "120+ Products",
    badgeIcon: "robot",
    themeColor: "blue",
    isFeatured: true,
    image: "https://res.cloudinary.com/fyueflvh/image/upload/v1795239049/category_cutouts/category_cutouts/exploded_white_android_assembly_1795239045823.webp",
    imageAlt: "Robotics Kits & Autonomous Systems",
    sortOrder: 1,
    isActive: true,
    showOverlay: true,
  },
  {
    id: "devboards",
    name: "Development Boards",
    slug: "development-boards",
    href: "/categories/development-boards",
    tagline: "Power your ideas.",
    productCount: "95+ Products",
    badgeIcon: "code",
    themeColor: "teal",
    isFeatured: false,
    image: "/products/arduino_cutout.png",
    imageAlt: "Embedded Microcontrollers & Development Boards",
    sortOrder: 2,
    isActive: true,
    showOverlay: true,
  },
  {
    id: "sensors-iot",
    name: "Sensors & IoT",
    slug: "sensors-iot",
    href: "/categories/sensors-iot",
    tagline: "Sense the real world.",
    productCount: "80+ Products",
    badgeIcon: "radio",
    themeColor: "purple",
    isFeatured: false,
    image: "/products/sensors_cutout.png",
    imageAlt: "Sensors, Modules & Wireless IoT Hardware",
    sortOrder: 3,
    isActive: true,
    showOverlay: true,
  },
  {
    id: "drones",
    name: "Drone Technology",
    slug: "drone-technology",
    href: "/categories/drone-technology",
    tagline: "Fly higher. Capture more.",
    productCount: "45+ Products",
    badgeIcon: "drone",
    themeColor: "amber",
    isFeatured: false,
    image: "https://res.cloudinary.com/fyueflvh/image/upload/v1795239546/category_cutouts/category_cutouts/aerovox_skycruise_4_drone_render_1795239543969.webp",
    imageAlt: "UAV Aerial Drone Technology & Components",
    sortOrder: 4,
    isActive: true,
    showOverlay: true,
  },
  {
    id: "stem",
    name: "Educational & STEM Kits",
    slug: "educational-stem-kits",
    href: "/categories/educational-stem-kits",
    tagline: "Learn by doing.",
    productCount: "70+ Products",
    badgeIcon: "graduation",
    themeColor: "indigo",
    isFeatured: false,
    image: "/products/robot_chassis_cutout.png",
    imageAlt: "STEM Educational & DIY Maker Kits",
    sortOrder: 5,
    isActive: true,
    showOverlay: true,
  },
  {
    id: "batteries-power",
    name: "Batteries & Power",
    slug: "batteries-power",
    href: "/categories/batteries-power",
    tagline: "Reliable power solutions.",
    productCount: "60+ Products",
    badgeIcon: "zap",
    themeColor: "emerald",
    isFeatured: false,
    image: "/products/esp32_devkit_cutout.png",
    imageAlt: "LiPo, Li-Ion, BMS & Power Management",
    sortOrder: 6,
    isActive: true,
    showOverlay: true,
  },
  {
    id: "mechanical-hardware",
    name: "Mechanical & Hardware",
    slug: "mechanical-hardware",
    href: "/categories/mechanical-hardware",
    tagline: "Precision structural parts.",
    productCount: "110+ Products",
    badgeIcon: "wrench",
    themeColor: "rose",
    isFeatured: false,
    image: "https://res.cloudinary.com/fyueflvh/image/upload/v1795239575/category_cutouts/category_cutouts/futuristic_lunar_robots_and_rovers_collection_1795239572612.webp",
    imageAlt: "Mechanical Hardware, Chassis, Gears & Screws",
    sortOrder: 7,
    isActive: true,
    showOverlay: true,
  },
  {
    id: "components",
    name: "Electronic Components",
    slug: "electronic-components",
    href: "/categories/electronic-components",
    tagline: "Small parts. Big possibilities.",
    productCount: "150+ Products",
    badgeIcon: "chip",
    themeColor: "cyan",
    isFeatured: false,
    image: "/products/jumper_wires.png",
    imageAlt: "Electronic Components & Circuit Hardware",
    sortOrder: 8,
    isActive: true,
    showOverlay: true,
  },
];
