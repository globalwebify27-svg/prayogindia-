export interface OfferItem {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  shortDescription: string;
  discountBadge: string;
  discountPercentage: number;
  image: string;
  badge: "FLASH DEAL" | "MEGA BUNDLE" | "B2B SPECIAL" | "STUDENT & LAB" | "FEATURED" | "UPCOMING";
  status: "Active" | "Upcoming" | "Expired";
  startDate: string;
  endDate: string;
  category: "all" | "flash" | "robotics" | "drones" | "arduino" | "bundles" | "b2b";
  couponCode?: string;
  minOrderValue?: number;
  claimedPercentage?: number;
  stockLeft?: number;
  customerEligibility?: string;
  productIds: string[];
  terms?: string[];
}

export interface CouponItem {
  code: string;
  title: string;
  description: string;
  discountText: string;
  minOrder: number;
  expiryDate: string;
  category: string;
  isPopular?: boolean;
  terms?: string;
}

export interface ComboBundle {
  id: string;
  title: string;
  tagline: string;
  badge: string;
  image: string;
  productIds: string[];
  originalPrice: number;
  bundlePrice: number;
  savings: number;
  items: {
    id: string;
    name: string;
    image: string;
    qty: number;
  }[];
}

export const COUPONS_DATA: CouponItem[] = [
  {
    code: "PRAYOG10",
    title: "Sitewide Robotics Special",
    description: "Instant 10% discount on all robotics kits, flight controllers & sensors",
    discountText: "10% OFF",
    minOrder: 1499,
    expiryDate: "31 Aug 2026",
    category: "Sitewide",
    isPopular: true,
    terms: "Applicable on all items. Maximum discount up to ₹1,500.",
  },
  {
    code: "MAKER500",
    title: "Mega Cart Savings",
    description: "Flat ₹500 instant discount on high-value orders & dev board bundles",
    discountText: "FLAT ₹500 OFF",
    minOrder: 4999,
    expiryDate: "15 Sep 2026",
    category: "Makers",
    isPopular: true,
    terms: "Valid on orders with subtotal ₹4,999 and above.",
  },
  {
    code: "DRONEFEST",
    title: "UAV & FPV Special Deal",
    description: "Flat 15% OFF on Pixhawk flight controllers, 4-in-1 ESCs & BLDC motors",
    discountText: "15% OFF",
    minOrder: 2999,
    expiryDate: "30 Sep 2026",
    category: "Drones",
    isPopular: false,
    terms: "Valid on Drones & UAV category products only.",
  },
  {
    code: "FREESHIP",
    title: "Zero Shipping Charges",
    description: "Free fast express courier delivery across all 28 Indian states",
    discountText: "FREE SHIPPING",
    minOrder: 999,
    expiryDate: "Ongoing",
    category: "Delivery",
    isPopular: true,
    terms: "Automatically applied when cart value exceeds ₹999.",
  },
  {
    code: "INSTITUTE20",
    title: "Institutional Lab Subsidy",
    description: "Special 20% institutional voucher for universities, schools & research labs",
    discountText: "20% OFF",
    minOrder: 14999,
    expiryDate: "31 Dec 2026",
    category: "Institutional",
    isPopular: false,
    terms: "Requires GST number or valid Educational Institution ID during checkout.",
  },
  {
    code: "ARDUINO100",
    title: "Microcontroller Kickstart",
    description: "Flat ₹100 off on genuine Arduino UNO R3, R4 WiFi, and Mega boards",
    discountText: "FLAT ₹100 OFF",
    minOrder: 1299,
    expiryDate: "15 Oct 2026",
    category: "Arduino",
    isPopular: false,
    terms: "Valid on Arduino & Microcontrollers category.",
  },
];

export const COMBO_BUNDLES_DATA: ComboBundle[] = [
  {
    id: "bundle-stem-rover-pro",
    title: "Ultimate Autonomous STEM Rover Combo",
    tagline: "Complete hardware bundle to build your first AI & obstacle-avoiding mobile robot.",
    badge: "SAVE ₹1,298",
    image: "/images/ecosystem/robotics.jpg",
    originalPrice: 4297,
    bundlePrice: 2999,
    savings: 1298,
    productIds: ["ard-uno-r3", "prayog-stem-robot-kit", "mg996r-servo-high-torque"],
    items: [
      {
        id: "ard-uno-r3",
        name: "Arduino UNO R3 Official Board",
        image: "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=800&q=80",
        qty: 1,
      },
      {
        id: "prayog-stem-robot-kit",
        name: "Prayog STEM 4WD Chassis + Ultrasonic Kit",
        image: "https://res.cloudinary.com/fyueflvh/image/upload/v1788595386/prayog/products/prod_catalog_template_4.jpg",
        qty: 1,
      },
      {
        id: "mg996r-servo-high-torque",
        name: "MG996R Metal Gear High-Torque Servo",
        image: "https://res.cloudinary.com/fyueflvh/image/upload/v1788595389/prayog/products/prod_catalog_template_8.jpg",
        qty: 2,
      },
    ],
  },
  {
    id: "bundle-uav-pixhawk-quad",
    title: "Pro UAV Quadcopter Flight Stack Bundle",
    tagline: "Full avionics & propulsion package for heavy-lift mapping & autonomous GPS missions.",
    badge: "SAVE ₹3,450",
    image: "/images/ecosystem/uavs-and-drones.jpg",
    originalPrice: 18449,
    bundlePrice: 14999,
    savings: 3450,
    productIds: ["pixhawk-fc", "holybro-m8n-gps", "bldc-motor-2212", "esc-30a-simonk", "gemfan-1045-props"],
    items: [
      {
        id: "pixhawk-fc",
        name: "Pixhawk 2.4.8 Autopilot Flight Controller",
        image: "https://res.cloudinary.com/fyueflvh/image/upload/v1788595385/prayog/products/prod_catalog_template_3.jpg",
        qty: 1,
      },
      {
        id: "holybro-m8n-gps",
        name: "Holybro M8N High-Precision Compass GPS",
        image: "https://res.cloudinary.com/fyueflvh/image/upload/v1788595387/prayog/products/prod_catalog_template_5.jpg",
        qty: 1,
      },
      {
        id: "bldc-motor-2212",
        name: "A2212 1000KV Brushless Motors (Set of 4)",
        image: "https://res.cloudinary.com/fyueflvh/image/upload/v1788595389/prayog/products/prod_catalog_template_8.jpg",
        qty: 4,
      },
    ],
  },
  {
    id: "bundle-iot-weather-station",
    title: "IoT Smart Environmental Telemetry Kit",
    tagline: "Cloud-connected WiFi & Bluetooth telemetry sensor node with OLED display.",
    badge: "SAVE ₹799",
    image: "/images/pi_hero.jpg",
    originalPrice: 2798,
    bundlePrice: 1999,
    savings: 799,
    productIds: ["esp32-devkit-v1", "hc05-bluetooth", "ard-uno-r4-wifi"],
    items: [
      {
        id: "esp32-devkit-v1",
        name: "ESP32 DevKit V1 Dual-Core Board",
        image: "https://res.cloudinary.com/fyueflvh/image/upload/v1788595384/prayog/products/prod_catalog_template_2.jpg",
        qty: 1,
      },
      {
        id: "ard-uno-r4-wifi",
        name: "Arduino UNO R4 WiFi Microcontroller",
        image: "https://res.cloudinary.com/fyueflvh/image/upload/v1788595383/prayog/products/prod_catalog_template_1.jpg",
        qty: 1,
      },
    ],
  },
];

export const OFFERS_DATA: OfferItem[] = [
  {
    id: "off-monsoon-stem-2026",
    slug: "monsoon-stem-lab-bundle-deal",
    title: "Monsoon STEM & Robotics Mega Sale",
    tagline: "Up to 35% OFF on genuine Arduino, Robot Arms, and High-Torque Servos.",
    shortDescription:
      "Get up to 35% catalogue discount on genuine Arduino UNO R3, 6-DOF robotic arms, ultrasonic sensors, and smart mobile robot chassis.",
    discountBadge: "UP TO 35% OFF",
    discountPercentage: 35,
    image: "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=1200&q=80",
    badge: "FEATURED",
    status: "Active",
    startDate: "01 Aug 2026",
    endDate: "31 Aug 2026",
    category: "robotics",
    couponCode: "PRAYOG10",
    minOrderValue: 1499,
    claimedPercentage: 78,
    stockLeft: 14,
    customerEligibility: "All Customers (B2C & B2B)",
    productIds: ["ard-uno-r3", "ard-mega-2560", "prayog-stem-robot-kit", "robotic-arm-4dof", "mg996r-servo-high-torque"],
    terms: [
      "Voucher code PRAYOG10 must be entered at checkout.",
      "Eligible for Free Delivery across India on orders > ₹999.",
      "Includes 1-Year Official Prayog India replacement warranty.",
      "Valid till stocks last or until promotional period expires.",
    ],
  },
  {
    id: "off-drone-flight-fest",
    slug: "drone-flight-controller-fest",
    title: "UAV Drone & Autopilot Hardware Fest",
    tagline: "Flat 15% OFF on Pixhawk 2.4.8, BLDC Motors, GPS, and Flight Stacks.",
    shortDescription:
      "Special promotional pricing for Pixhawk flight controllers, Holybro M8N GPS modules, SpeedyBee stacks, and carbon fiber propeller sets.",
    discountBadge: "FLAT 15% OFF",
    discountPercentage: 15,
    image: "/images/ecosystem/uavs-and-drones.jpg",
    badge: "FLASH DEAL",
    status: "Active",
    startDate: "10 Aug 2026",
    endDate: "10 Sep 2026",
    category: "drones",
    couponCode: "DRONEFEST",
    minOrderValue: 2999,
    claimedPercentage: 84,
    stockLeft: 9,
    customerEligibility: "All Registered Customers",
    productIds: ["pixhawk-fc", "holybro-m8n-gps", "bldc-motor-2212", "esc-30a-simonk", "speedybee-f405-stack", "f450-frame", "gemfan-1045-props"],
    terms: [
      "Enter coupon DRONEFEST to claim 15% discount.",
      "Valid on all quadcopter, hexacopter, and fixed-wing UAV components.",
      "Standard 48-Hour dispatch from Bengaluru & Delhi fulfillment centers.",
    ],
  },
  {
    id: "off-institutional-lab-setup",
    slug: "institutional-lab-invoicing-special",
    title: "Institutional B2B Lab Bulk Subsidy",
    tagline: "Flat ₹500 instant voucher + 20% institutional discount on lab 10-packs.",
    shortDescription:
      "Subsidized procurement pricing for university engineering labs, Atal Tinkering Labs (ATL), polytechnics, and robotics research incubators.",
    discountBadge: "B2B SUBSIDY",
    discountPercentage: 20,
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    badge: "B2B SPECIAL",
    status: "Active",
    startDate: "15 Aug 2026",
    endDate: "15 Sep 2026",
    category: "b2b",
    couponCode: "MAKER500",
    minOrderValue: 4999,
    claimedPercentage: 62,
    stockLeft: 25,
    customerEligibility: "Institutional & Registered Business Customers",
    productIds: ["ard-uno-r3", "ard-mega-2560", "esp32-devkit-v1", "prayog-stem-robot-kit", "arm-manipulator-6dof", "mecanum-4wd-car"],
    terms: [
      "Input Tax Credit (ITC) GST invoices provided automatically.",
      "Institutional purchase orders (PO) and Net-30 credit terms supported upon verification.",
      "Dedicated technical account manager assigned for lab deployment.",
    ],
  },
  {
    id: "off-microcontroller-rush",
    slug: "microcontroller-dev-board-rush",
    title: "Arduino & ESP32 Dev Board Rush",
    tagline: "Starting from ₹199! Exclusive developer prices on ESP32, STM32 & Nano.",
    shortDescription:
      "Upgrade your embedded prototyping lab with high-speed 32-bit ESP32-S3 boards, genuine Arduino UNO R4 WiFi, and STM32 BluePill boards.",
    discountBadge: "FROM ₹199",
    discountPercentage: 30,
    image: "/images/categories/arduino.jpg",
    badge: "FLASH DEAL",
    status: "Active",
    startDate: "05 Aug 2026",
    endDate: "25 Aug 2026",
    category: "arduino",
    couponCode: "ARDUINO100",
    minOrderValue: 1299,
    claimedPercentage: 91,
    stockLeft: 6,
    customerEligibility: "All Makers & Developers",
    productIds: ["ard-uno-r4-wifi", "ard-nano-v3", "esp32-devkit-v1", "esp32-s3-devkit", "stm32-bluepill", "node-mcu-v3"],
    terms: [
      "Use coupon code ARDUINO100 for flat ₹100 off on cart above ₹1,299.",
      "Original genuine chips with tested bootloaders.",
    ],
  },
  {
    id: "off-sensors-iot-fest",
    slug: "sensors-iot-telemetry-deal",
    title: "Sensors & Wireless IoT Discovery Deal",
    tagline: "Buy 3 Sensors, Get 10% Extra OFF automatically at checkout.",
    shortDescription:
      "Equip your autonomous robots with precision LiDAR, 9-DOF IMU gyroscopes, Bluetooth HC-05, and LoRa long-range wireless telemetry modules.",
    discountBadge: "BUY 3 GET 10% OFF",
    discountPercentage: 25,
    image: "/images/categories/sensors.jpg",
    badge: "STUDENT & LAB",
    status: "Active",
    startDate: "12 Aug 2026",
    endDate: "12 Sep 2026",
    category: "all",
    couponCode: "PRAYOG10",
    minOrderValue: 999,
    claimedPercentage: 70,
    stockLeft: 30,
    customerEligibility: "All Customers",
    productIds: ["hc05-bluetooth", "lora-ra02-module", "pan-tilt-servo-kit", "sg90-servos-10pack", "robot-claw-gripper"],
    terms: [
      "Applies automatically or via coupon PRAYOG10.",
      "Free datasheet and pinout PDF included with every sensor.",
    ],
  },
];
