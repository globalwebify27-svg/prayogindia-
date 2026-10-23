// =====================================================================
// PRAYOG INDIA — CANONICAL 9-DOMAIN CATEGORIES HIERARCHY
// =====================================================================

export interface DynamicFilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface CategoryDynamicFilters {
  voltage?: string[];
  interface?: string[];
  protocol?: string[];
  compatibility?: string[];
  mountingType?: string[];
  range?: string[];
  packageType?: string[];
  pinCount?: string[];
  connectivity?: string[];
  application?: string[];
}

export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  level: 0 | 1 | 2; // 0 = parent, 1 = subcategory, 2 = nested
  description: string;
  seoTitle?: string;
  seoDescription?: string;
  bannerUrl?: string;
  iconName?: string;
  productCount?: number;
  sortOrder?: number;
  dynamicFilters?: CategoryDynamicFilters;
  children?: CategoryNode[];
}

// =====================================================================
// CATEGORY HIERARCHY TREE (9 TARGET DOMAINS, 32 SUBCATEGORIES)
// =====================================================================

export const CATEGORIES_HIERARCHY: CategoryNode[] = [
  // ============================================================
  // 1. ELECTRONIC COMPONENTS
  // ============================================================
  {
    id: "electronic-components",
    name: "Electronic Components",
    slug: "electronic-components",
    parentId: null,
    level: 0,
    description:
      "Active and passive electronic components: resistors, capacitors, ICs, LEDs, relays, and connectors.",
    seoTitle: "Electronic Components | Buy Resistors, Capacitors, ICs, Relays India",
    seoDescription:
      "Authentic electronic components for hardware development, engineering labs, and PCB assembly in India.",
    bannerUrl:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80",
    iconName: "Cpu",
    productCount: 4200,
    sortOrder: 1,
    children: [
      {
        id: "resistors",
        name: "Resistors",
        slug: "resistors",
        parentId: "electronic-components",
        level: 1,
        description: "Through-hole, SMD metal film resistors, power wirewound & potentiometers.",
        iconName: "Activity",
        productCount: 1100,
        sortOrder: 1,
      },
      {
        id: "capacitors",
        name: "Capacitors",
        slug: "capacitors",
        parentId: "electronic-components",
        level: 1,
        description: "Electrolytic, ceramic multilayer, tantalum, and supercapacitors.",
        iconName: "Layers",
        productCount: 950,
        sortOrder: 2,
      },
      {
        id: "ics",
        name: "ICs",
        slug: "ics",
        parentId: "electronic-components",
        level: 1,
        description: "Linear regulators, operational amplifiers, 555 timers, logic gates, and driver ICs.",
        iconName: "Cpu",
        productCount: 820,
        sortOrder: 3,
      },
      {
        id: "leds",
        name: "LEDs",
        slug: "leds",
        parentId: "electronic-components",
        level: 1,
        description: "Standard 3mm/5mm through-hole LEDs, RGB Neopixels, SMD diodes, and high-power emitters.",
        iconName: "Sun",
        productCount: 480,
        sortOrder: 4,
      },
      {
        id: "relays",
        name: "Relays",
        slug: "relays",
        parentId: "electronic-components",
        level: 1,
        description: "Electromechanical 5V/12V relays, solid state relays (SSR), and multi-channel relay modules.",
        iconName: "Zap",
        productCount: 390,
        sortOrder: 5,
      },
      {
        id: "connectors",
        name: "Connectors",
        slug: "connectors",
        parentId: "electronic-components",
        level: 1,
        description: "JST, Dupont headers, screw terminals, USB connectors, DC barrel jacks, and wire assemblies.",
        iconName: "Plug",
        productCount: 460,
        sortOrder: 6,
      },
    ],
  },

  // ============================================================
  // 2. ROBOTICS
  // ============================================================
  {
    id: "robotics",
    name: "Robotics",
    slug: "robotics",
    parentId: null,
    level: 0,
    description:
      "Autonomous chassis kits, robotic arms, precision motors, motor drivers, wheels, and motion controllers.",
    seoTitle: "Robotics Kits & Parts | Buy Robot Kits, Motors & Chassis in India",
    seoDescription:
      "Shop 4WD chassis, 6-DOF robotic arms, stepper motors, servo controllers, and mecanum wheels at Prayog India.",
    bannerUrl:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1600&q=80",
    iconName: "Bot",
    productCount: 3600,
    sortOrder: 2,
    children: [
      {
        id: "robot-kits",
        name: "Robot Kits",
        slug: "robot-kits",
        parentId: "robotics",
        level: 1,
        description: "2WD/4WD obstacle avoiding rovers, 6-DOF robotic arms, bipedal walkers, and SLAM kits.",
        iconName: "Bot",
        productCount: 680,
        sortOrder: 1,
      },
      {
        id: "robotics-accessories",
        name: "Robotics Accessories",
        slug: "robotics-accessories",
        parentId: "robotics",
        level: 1,
        description: "Metal brackets, servo horns, ball casters, pan-tilt mounts, and chassis hardware.",
        iconName: "Tool",
        productCount: 750,
        sortOrder: 2,
      },
      {
        id: "motors-drivers",
        name: "Motors & Drivers",
        slug: "motors-drivers",
        parentId: "robotics",
        level: 1,
        description: "NEMA steppers, DC gear motors, coreless servos, L298N, TB6600, and Cytron motor drivers.",
        iconName: "Zap",
        productCount: 1100,
        sortOrder: 3,
      },
      {
        id: "wheels",
        name: "Wheels",
        slug: "wheels",
        parentId: "robotics",
        level: 1,
        description: "Mecanum wheels, omnidirectional rollers, high-grip rubber tires, and brass motor couplings.",
        iconName: "CircleDot",
        productCount: 520,
        sortOrder: 4,
      },
      {
        id: "controllers",
        name: "Controllers",
        slug: "controllers",
        parentId: "robotics",
        level: 1,
        description: "Robotics motion control boards, 16-channel PWM servo drivers, and wireless RC joysticks.",
        iconName: "Sliders",
        productCount: 550,
        sortOrder: 5,
      },
    ],
  },

  // ============================================================
  // 3. DEVELOPMENT BOARDS
  // ============================================================
  {
    id: "development-boards",
    name: "Development Boards",
    slug: "development-boards",
    parentId: null,
    level: 0,
    description:
      "Official Arduino boards, Raspberry Pi computers, ESP32, STM32, and advanced embedded computing platforms.",
    seoTitle: "Development Boards | Arduino, Raspberry Pi, ESP32, Jetson in India",
    seoDescription:
      "Buy Arduino UNO R3, Mega, Nano, Raspberry Pi 5, Compute Module 4, ESP32, STM32, and Jetson boards.",
    bannerUrl:
      "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=1600&q=80",
    iconName: "CircuitBoard",
    productCount: 2900,
    sortOrder: 3,
    children: [
      {
        id: "arduino",
        name: "Arduino",
        slug: "arduino",
        parentId: "development-boards",
        level: 1,
        description: "Official Arduino UNO, Mega, Leonardo, Nano, and expansion shield accessories.",
        iconName: "Cpu",
        productCount: 1200,
        sortOrder: 1,
      },
      {
        id: "raspberry-pi",
        name: "Raspberry Pi",
        slug: "raspberry-pi",
        parentId: "development-boards",
        level: 1,
        description: "Raspberry Pi 5, 4B, Compute Module 4, Pi Pico W, and official cooling HATs.",
        iconName: "Server",
        productCount: 850,
        sortOrder: 2,
      },
      {
        id: "other-development-boards",
        name: "Other Development Boards",
        slug: "other-development-boards",
        parentId: "development-boards",
        level: 1,
        description: "ESP32, ESP8266, STM32 Blue Pill, NVIDIA Jetson Orin Nano, BeagleBone, and FPGA platforms.",
        iconName: "CircuitBoard",
        productCount: 850,
        sortOrder: 3,
      },
    ],
  },

  // ============================================================
  // 4. DRONE TECHNOLOGY
  // ============================================================
  {
    id: "drone-technology",
    name: "Drone Technology",
    slug: "drone-technology",
    parentId: null,
    level: 0,
    description:
      "Flight controllers, BLDC motors, ESC speed controllers, GPS modules, propellers, batteries, and FPV cameras.",
    seoTitle: "Drone Technology & UAV Parts | Motors, Flight Controllers, ESC India",
    seoDescription:
      "Professional drone components, Pixhawk autopilots, BLDC brushless motors, DShot ESCs, and GPS compass modules.",
    bannerUrl:
      "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=1600&q=80",
    iconName: "Plane",
    productCount: 2200,
    sortOrder: 4,
    children: [
      {
        id: "flight-controllers",
        name: "Flight Controllers",
        slug: "flight-controllers",
        parentId: "drone-technology",
        level: 1,
        description: "Pixhawk 6C/2.4.8, Betaflight F4/F7/H7 flight controllers, and APM autopilot systems.",
        iconName: "Compass",
        productCount: 380,
        sortOrder: 1,
      },
      {
        id: "drone-motors",
        name: "Motors",
        slug: "motors",
        parentId: "drone-technology",
        level: 1,
        description: "High-thrust BLDC motors: 2205, 2212, 2306, 2814, and heavy-lift agricultural drone motors.",
        iconName: "Zap",
        productCount: 420,
        sortOrder: 2,
      },
      {
        id: "esc",
        name: "ESC",
        slug: "esc",
        parentId: "drone-technology",
        level: 1,
        description: "Electronic Speed Controllers: SimonK 30A, BLHeli_S, BLHeli_32 4-in-1, and 60A high-voltage ESCs.",
        iconName: "Sliders",
        productCount: 310,
        sortOrder: 3,
      },
      {
        id: "gps-modules",
        name: "GPS Modules",
        slug: "gps-modules",
        parentId: "drone-technology",
        level: 1,
        description: "NEO-6M, NEO-M8N, M9N high-precision GPS antennas, RTK positioning, and compass modules.",
        iconName: "Navigation",
        productCount: 240,
        sortOrder: 4,
      },
      {
        id: "propellers",
        name: "Propellers",
        slug: "propellers",
        parentId: "drone-technology",
        level: 1,
        description: "Carbon fiber, poly-carbonate 5040, 1045, 1245 props, and folding agricultural propellers.",
        iconName: "Disc",
        productCount: 320,
        sortOrder: 5,
      },
      {
        id: "drone-batteries",
        name: "Batteries",
        slug: "drone-batteries",
        parentId: "drone-technology",
        level: 1,
        description: "High discharge rate LiPo battery packs: 3S 2200mAh, 4S 1500mAh, 6S 4500mAh, and 12S drone power.",
        iconName: "BatteryCharging",
        productCount: 280,
        sortOrder: 6,
      },
      {
        id: "drone-cameras",
        name: "Cameras",
        slug: "cameras",
        parentId: "drone-technology",
        level: 1,
        description: "FPV analog 1200TVL cameras, Caddx digital HD units, and 3-axis brushless camera gimbals.",
        iconName: "Camera",
        productCount: 250,
        sortOrder: 7,
      },
    ],
  },

  // ============================================================
  // 5. SENSORS & IOT
  // ============================================================
  {
    id: "sensors-iot",
    name: "Sensors & IoT",
    slug: "sensors-iot",
    parentId: null,
    level: 0,
    description:
      "Environmental, motion, optical sensors and smart IoT wireless connectivity hardware.",
    seoTitle: "Sensors & IoT Modules | Temperature, Motion, LoRa, ESP32 India",
    seoDescription:
      "Buy ultrasonic HC-SR04, IMU gyro, LiDAR, gas sensors, LoRaWAN modems, and Wi-Fi modules at Prayog India.",
    bannerUrl:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80",
    iconName: "Activity",
    productCount: 3100,
    sortOrder: 5,
    children: [
      {
        id: "sensors-modules",
        name: "Sensors & Modules",
        slug: "sensors-modules",
        parentId: "sensors-iot",
        level: 1,
        description: "HC-SR04 ultrasonic, MPU-6050 gyro, DHT11/22, LiDAR, PIR motion, and optical gas sensors.",
        iconName: "Activity",
        productCount: 1850,
        sortOrder: 1,
      },
      {
        id: "iot-products",
        name: "IoT Products",
        slug: "iot-products",
        parentId: "sensors-iot",
        level: 1,
        description: "ESP8266 NodeMCU, LoRa SX1278 transceivers, NRF24L01, GSM/GPRS shields, and cloud IoT gateways.",
        iconName: "Wifi",
        productCount: 1250,
        sortOrder: 2,
      },
    ],
  },

  // ============================================================
  // 6. BATTERIES & POWER
  // ============================================================
  {
    id: "batteries-power",
    name: "Batteries & Power",
    slug: "batteries-power",
    parentId: null,
    level: 0,
    description:
      "Lithium-ion cells, LiPo battery packs, step-down converters, and smart battery chargers.",
    seoTitle: "Batteries & Power Supplies | 18650, LiPo, SMPS, Buck Converters India",
    seoDescription:
      "Shop 18650 cells, LiPo batteries, BMS protection boards, voltage regulators, and industrial power supplies.",
    bannerUrl:
      "https://images.unsplash.com/photo-1619641253018-095a2542a22c?auto=format&fit=crop&w=1600&q=80",
    iconName: "BatteryCharging",
    productCount: 1200,
    sortOrder: 6,
    children: [
      {
        id: "batteries",
        name: "Batteries",
        slug: "batteries",
        parentId: "batteries-power",
        level: 1,
        description: "18650 Li-ion cells, LiFePO4 packs, 9V rechargeable batteries, BMS protection boards, and smart balance chargers.",
        iconName: "Battery",
        productCount: 1200,
        sortOrder: 1,
      },
    ],
  },

  // ============================================================
  // 7. MECHANICAL & HARDWARE
  // ============================================================
  {
    id: "mechanical-hardware",
    name: "Mechanical & Hardware",
    slug: "mechanical-hardware",
    parentId: null,
    level: 0,
    description:
      "Mechanical products, structural fasteners, chassis hardware, and 3D printing accessories.",
    seoTitle: "Mechanical Parts & Hardware | Extrusions, Screws, 3D Accessories India",
    seoDescription:
      "Aluminum profiles, bearings, GT2 pulleys, hex screw kits, standoffs, nozzles, and 3D printer parts.",
    bannerUrl:
      "https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=1600&q=80",
    iconName: "Package",
    productCount: 2100,
    sortOrder: 7,
    children: [
      {
        id: "mechanical-products",
        name: "Mechanical Products",
        slug: "mechanical-products",
        parentId: "mechanical-hardware",
        level: 1,
        description: "Linear motion shafts, lead screws, GT2 timing pulleys, spur gears, and structural brackets.",
        iconName: "Layers",
        productCount: 850,
        sortOrder: 1,
      },
      {
        id: "hardware",
        name: "Hardware",
        slug: "hardware",
        parentId: "mechanical-hardware",
        level: 1,
        description: "M2/M3/M4 hex screws, nylon standoffs, T-nuts, washers, heat-set inserts, and prototyping enclosures.",
        iconName: "Tool",
        productCount: 780,
        sortOrder: 2,
      },
      {
        id: "3d-accessories",
        name: "3D Accessories",
        slug: "3d-accessories",
        parentId: "mechanical-hardware",
        level: 1,
        description: "Brass nozzles, PTFE Capricorn tubes, magnetic build plates, thermistors, and PLA/PETG filaments.",
        iconName: "Layers",
        productCount: 470,
        sortOrder: 3,
      },
    ],
  },

  // ============================================================
  // 8. EDUCATIONAL & STEM KITS
  // ============================================================
  {
    id: "educational-stem-kits",
    name: "Educational & STEM Kits",
    slug: "educational-stem-kits",
    parentId: null,
    level: 0,
    description:
      "Hands-on STEM learning kits, educational robotics, electronic science toys, and college project kits.",
    seoTitle: "Educational & STEM Kits | Atal Tinkering Labs, School Robotics India",
    seoDescription:
      "Complete educational kits for school students, ATL labs, engineering college projects, and DIY makers.",
    bannerUrl:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1600&q=80",
    iconName: "GraduationCap",
    productCount: 1650,
    sortOrder: 8,
    children: [
      {
        id: "stem-kits",
        name: "STEM Kits",
        slug: "stem-kits",
        parentId: "educational-stem-kits",
        level: 1,
        description: "Hands-on robotics, electronics foundation, solar power, and Atal Tinkering Lab curriculum kits.",
        iconName: "GraduationCap",
        productCount: 520,
        sortOrder: 1,
      },
      {
        id: "educational-kits",
        name: "Educational Kits",
        slug: "educational-kits",
        parentId: "educational-stem-kits",
        level: 1,
        description: "Breadboard starter kits, basic soldering trainer sets, and micro-python coding bundles.",
        iconName: "BookOpen",
        productCount: 410,
        sortOrder: 2,
      },
      {
        id: "educational-toys",
        name: "Educational Toys",
        slug: "educational-toys",
        parentId: "educational-stem-kits",
        level: 1,
        description: "DIY mechanical gear toys, magnetic levitation experiment sets, and early STEM creative blocks.",
        iconName: "Gift",
        productCount: 320,
        sortOrder: 3,
      },
      {
        id: "project-kits",
        name: "Project Kits",
        slug: "project-kits",
        parentId: "educational-stem-kits",
        level: 1,
        description: "IoT smart agriculture, home automation, automated toll booth, and biometric attendance projects.",
        iconName: "FolderOpen",
        productCount: 400,
        sortOrder: 4,
      },
    ],
  },

  // ============================================================
  // 9. INDUSTRIAL AUTOMATION
  // ============================================================
  {
    id: "industrial-automation",
    name: "Industrial Automation",
    slug: "industrial-automation",
    parentId: null,
    level: 0,
    description:
      "PLCs, DIN-rail power supplies, solid-state relays, proximity sensors, and industrial controls.",
    seoTitle: "Industrial Automation | PLCs, Relays, Proximity Sensors India",
    seoDescription:
      "Commercial-grade factory automation products: micro-PLCs, DIN-rail modules, inductive sensors, and RS485 controllers.",
    bannerUrl:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1600&q=80",
    iconName: "Briefcase",
    productCount: 850,
    sortOrder: 9,
    children: [
      {
        id: "industrial-automation-products",
        name: "Industrial Automation Products",
        slug: "industrial-automation-products",
        parentId: "industrial-automation",
        level: 1,
        description: "Micro-PLCs, solid-state relays, DIN-rail modules, inductive proximity sensors, and RS485 communication converters.",
        iconName: "Briefcase",
        productCount: 850,
        sortOrder: 1,
      },
    ],
  },
];

// =====================================================================
// UTILITY FUNCTIONS
// =====================================================================

/** Flat list of all categories (for filter dropdowns and breadcrumbs) */
export function flattenCategories(
  nodes: CategoryNode[] = CATEGORIES_HIERARCHY,
): CategoryNode[] {
  const result: CategoryNode[] = [];
  for (const node of nodes) {
    result.push(node);
    if (node.children) {
      result.push(...flattenCategories(node.children));
    }
  }
  return result;
}

/** Get all top-level (parent) categories */
export const PARENT_CATEGORIES = CATEGORIES_HIERARCHY.filter(
  (c) => c.level === 0,
);

/** Get category node by slug */
export function getCategoryBySlug(slug: string): CategoryNode | undefined {
  return flattenCategories().find((c) => c.slug === slug);
}

/** Get all children of a parent category */
export function getCategoryChildren(parentId: string): CategoryNode[] {
  return flattenCategories().filter((c) => c.parentId === parentId);
}

/** Get dynamic filter labels for a category by its ID */
export function getCategoryDynamicFilters(
  categoryId: string,
): CategoryDynamicFilters | undefined {
  const cat = flattenCategories().find((c) => c.id === categoryId);
  if (!cat) return undefined;
  if (cat.dynamicFilters) return cat.dynamicFilters;
  // Inherit from parent
  if (cat.parentId) {
    const parent = flattenCategories().find((c) => c.id === cat.parentId);
    return parent?.dynamicFilters;
  }
  return undefined;
}
