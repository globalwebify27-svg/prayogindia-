export interface Subcategory {
  id: string;
  slug: string;
  slugAlias?: string[];
  name: string;
  description: string;
  image: string;
  productCount: number;
}

export interface CategoryData {
  id: string;
  slug: string;
  slugAlias?: string | string[];
  name: string;
  shortName?: string;
  shortDescription: string;
  fullDescription: string;
  image: string;
  productCount: number;
  featured?: boolean;
  color?: string;
  bgColor?: string;
  subcategories: Subcategory[];
}

export const CATEGORIES_DATA: CategoryData[] = [
  // 1. Electronic Components
  {
    id: "cat-electronic-components",
    slug: "electronic-components",
    slugAlias: ["cables-connectors", "components", "passives"],
    name: "Electronic Components",
    shortName: "Components",
    shortDescription:
      "Essential active & passive components: resistors, capacitors, ICs, LEDs, relays, and connectors.",
    fullDescription:
      "Comprehensive catalog of authentic electronic components for electronics engineering, prototyping, and assembly. Includes precision resistors, high-grade electrolytic & ceramic capacitors, logic ICs, power regulators, optoelectronics, switching relays, and robust PCB connectors.",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    productCount: 4200,
    featured: true,
    color: "#E11D48",
    bgColor: "#FFE4E6",
    subcategories: [
      {
        id: "sub-resistors",
        slug: "resistors",
        name: "Resistors",
        description: "Through-hole, SMD metal film resistors, power wirewound & potentiometers.",
        image:
          "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80",
        productCount: 1100,
      },
      {
        id: "sub-capacitors",
        slug: "capacitors",
        name: "Capacitors",
        description: "Electrolytic, ceramic multilayer, tantalum, and supercapacitors.",
        image:
          "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
        productCount: 950,
      },
      {
        id: "sub-ics",
        slug: "ics",
        name: "ICs",
        description: "Linear regulators, operational amplifiers, 555 timers, logic gates, and driver ICs.",
        image:
          "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
        productCount: 820,
      },
      {
        id: "sub-leds",
        slug: "leds",
        name: "LEDs",
        description: "Standard 3mm/5mm through-hole LEDs, RGB Neopixels, SMD diodes, and high-power emitters.",
        image:
          "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80",
        productCount: 480,
      },
      {
        id: "sub-relays",
        slug: "relays",
        name: "Relays",
        description: "Electromechanical 5V/12V relays, solid state relays (SSR), and multi-channel relay modules.",
        image:
          "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80",
        productCount: 390,
      },
      {
        id: "sub-connectors",
        slug: "connectors",
        name: "Connectors",
        description: "JST, Dupont headers, screw terminals, USB connectors, DC barrel jacks, and wire assemblies.",
        image:
          "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
        productCount: 460,
      },
    ],
  },

  // 2. Robotics
  {
    id: "cat-robotics",
    slug: "robotics",
    slugAlias: ["robotics-diy-kits", "robotics-accessories", "motors-drivers", "robotics-stem-kits"],
    name: "Robotics",
    shortName: "Robotics",
    shortDescription:
      "Robot kits, robotics accessories, precision motors, motor drivers, wheels, and motion controllers.",
    fullDescription:
      "Explore high-grade hardware for autonomous rovers, robotic arm manipulators, hexapods, line followers, and industrial research robots. Features complete chassis kits, heavy-duty gearboxes, encoder stepper drives, omnidirectional wheels, and smart PID servo controllers.",
    image:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
    productCount: 3600,
    featured: true,
    color: "#2563EB",
    bgColor: "#EFF6FF",
    subcategories: [
      {
        id: "sub-robot-kits",
        slug: "robot-kits",
        name: "Robot Kits",
        description: "2WD/4WD obstacle avoiding rovers, 6-DOF robotic arms, bipedal walkers, and SLAM kits.",
        image:
          "/images/products/4wd-robot-chassis-kit.jpg",
        productCount: 680,
      },
      {
        id: "sub-robotics-accessories",
        slug: "robotics-accessories",
        name: "Robotics Accessories",
        description: "Metal brackets, servo horns, ball casters, pan-tilt mounts, and chassis hardware.",
        image:
          "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
        productCount: 750,
      },
      {
        id: "sub-motors-drivers",
        slug: "motors-drivers",
        name: "Motors & Drivers",
        description: "NEMA steppers, DC gear motors, coreless servos, L298N, TB6600, and Cytron motor drivers.",
        image:
          "/images/products/l298n-motor-driver.jpg",
        productCount: 1100,
      },
      {
        id: "sub-wheels",
        slug: "wheels",
        name: "Wheels",
        description: "Mecanum wheels, omnidirectional rollers, high-grip rubber tires, and brass motor couplings.",
        image:
          "/images/products/tt-gear-motor-wheel.png",
        productCount: 520,
      },
      {
        id: "sub-controllers",
        slug: "controllers",
        name: "Controllers",
        description: "Robotics motion control boards, 16-channel PWM servo drivers, and wireless RC joysticks.",
        image:
          "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80",
        productCount: 550,
      },
    ],
  },

  // 3. Development Boards
  {
    id: "cat-development-boards",
    slug: "development-boards",
    slugAlias: ["arduino-development-boards", "arduino", "raspberry-pi", "devboards", "arduino-microcontrollers"],
    name: "Development Boards",
    shortName: "Dev Boards",
    shortDescription:
      "Official Arduino, Raspberry Pi single-board computers, and advanced embedded development platforms.",
    fullDescription:
      "The ultimate destination for embedded prototyping and AI computing. Featuring genuine Arduino UNO, Nano & Mega boards, Raspberry Pi 5 & Compute Module 4, ESP32 dual-core IoT modules, NVIDIA Jetson edge AI boards, and STM32 ARM platforms.",
    image:
      "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=800&q=80",
    productCount: 2900,
    featured: true,
    color: "#00878F",
    bgColor: "#E6F7F8",
    subcategories: [
      {
        id: "sub-arduino",
        slug: "arduino",
        name: "Arduino",
        description: "UNO R3, R4 WiFi, Mega 2560, Nano, Pro Mini, and official Arduino shield accessories.",
        image:
          "/images/products/arduino-uno-r3.png",
        productCount: 1200,
      },
      {
        id: "sub-raspberry-pi",
        slug: "raspberry-pi",
        name: "Raspberry Pi",
        description: "Raspberry Pi 5, 4B, Pi 400, Compute Module 4, Pico W, and official cooling HATs.",
        image:
          "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
        productCount: 850,
      },
      {
        id: "sub-other-dev-boards",
        slug: "other-development-boards",
        name: "Other Development Boards",
        description: "ESP32, ESP8266, STM32 Blue Pill, NVIDIA Jetson Orin Nano, BeagleBone, and FPGA platforms.",
        image:
          "https://images.unsplash.com/photo-1608564697071-ddf911d81370?auto=format&fit=crop&w=600&q=80",
        productCount: 850,
      },
    ],
  },

  // 4. Drone Technology
  {
    id: "cat-drone-technology",
    slug: "drone-technology",
    slugAlias: ["drones", "uav-parts", "drone-parts", "drone-components"],
    name: "Drone Technology",
    shortName: "Drones",
    shortDescription:
      "UAV avionics: flight controllers, BLDC motors, ESC speed controllers, GPS modules, propellers, batteries, and FPV cameras.",
    fullDescription:
      "Professional drone components and UAV technology for quadcopters, hexacopters, surveying UAVs, and FPV racing drones. Includes Pixhawk autopilots, high-thrust brushless motors, 4-in-1 DShot ESCs, high-precision GPS compass modules, carbon fiber props, LiPo batteries, and low-latency HD cameras.",
    image:
      "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80",
    productCount: 2200,
    featured: true,
    color: "#0284C7",
    bgColor: "#E0F2FE",
    subcategories: [
      {
        id: "sub-flight-controllers",
        slug: "flight-controllers",
        name: "Flight Controllers",
        description: "Pixhawk 6C/2.4.8, Betaflight F4/F7/H7 flight controllers, and APM autopilot systems.",
        image:
          "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80",
        productCount: 380,
      },
      {
        id: "sub-drone-motors",
        slug: "motors",
        name: "Motors",
        description: "High-thrust BLDC motors: 2205, 2212, 2306, 2814, and heavy-lift agricultural drone motors.",
        image:
          "https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=600&q=80",
        productCount: 420,
      },
      {
        id: "sub-esc",
        slug: "esc",
        name: "ESC",
        description: "Electronic Speed Controllers: SimonK 30A, BLHeli_S, BLHeli_32 4-in-1, and 60A high-voltage ESCs.",
        image:
          "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&w=600&q=80",
        productCount: 310,
      },
      {
        id: "sub-gps-modules",
        slug: "gps-modules",
        name: "GPS Modules",
        description: "NEO-6M, NEO-M8N, M9N high-precision GPS antennas, RTK positioning, and compass modules.",
        image:
          "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80",
        productCount: 240,
      },
      {
        id: "sub-propellers",
        slug: "propellers",
        name: "Propellers",
        description: "Carbon fiber, poly-carbonate 5040, 1045, 1245 props, and folding agricultural propellers.",
        image:
          "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=600&q=80",
        productCount: 320,
      },
      {
        id: "sub-drone-batteries",
        slug: "drone-batteries",
        slugAlias: ["batteries", "lipo-batteries", "lipo-battery-packs"],
        name: "Batteries",
        description: "High discharge rate LiPo battery packs: 3S 2200mAh, 4S 1500mAh, 6S 4500mAh, and 12S drone power.",
        image:
          "https://images.unsplash.com/photo-1619641253018-095a2542a22c?auto=format&fit=crop&w=600&q=80",
        productCount: 280,
      },
      {
        id: "sub-drone-cameras",
        slug: "cameras",
        name: "Cameras",
        description: "FPV analog 1200TVL cameras, Caddx digital HD units, and 3-axis brushless camera gimbals.",
        image:
          "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=600&q=80",
        productCount: 250,
      },
    ],
  },

  // 5. Sensors & IoT
  {
    id: "cat-sensors-iot",
    slug: "sensors-iot",
    slugAlias: ["sensors-modules", "iot-wireless", "sensors", "iot", "iot-wireless-modules", "wireless-iot-modules"],
    name: "Sensors & IoT",
    shortName: "Sensors & IoT",
    shortDescription:
      "Environmental, motion, optical sensors and smart IoT wireless connectivity hardware.",
    fullDescription:
      "A complete ecosystem of telemetry sensors and connected IoT hardware. Includes ultrasonic distance meters, IMU motion trackers, environmental gas & humidity sensors, LoRaWAN long-range modems, Wi-Fi ESP modules, Zigbee nodes, and smart IoT gateways.",
    image:
      "/images/products/ultrasonic-sensor-hcsr04.png",
    productCount: 3100,
    featured: true,
    color: "#7C3AED",
    bgColor: "#F5F3FF",
    subcategories: [
      {
        id: "sub-sensors-modules",
        slug: "sensors-modules",
        name: "Sensors & Modules",
        description: "HC-SR04 ultrasonic, MPU-6050 gyro, DHT11/22, LiDAR, PIR motion, and optical gas sensors.",
        image:
          "/images/products/ultrasonic-sensor-hcsr04.png",
        productCount: 1850,
      },
      {
        id: "sub-iot-products",
        slug: "iot-products",
        name: "IoT Products",
        description: "ESP8266 NodeMCU, LoRa SX1278 transceivers, NRF24L01, GSM/GPRS shields, and cloud IoT gateways.",
        image:
          "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
        productCount: 1250,
      },
    ],
  },

  // 6. Batteries & Power
  {
    id: "cat-batteries-power",
    slug: "batteries-power",
    slugAlias: ["batteries", "power-supplies", "power"],
    name: "Batteries & Power",
    shortName: "Batteries & Power",
    shortDescription:
      "Lithium-ion 18650 cells, LiPo battery packs, step-down converters, and smart battery chargers.",
    fullDescription:
      "Certified energy storage and power conversion solutions for hardware systems. Featuring authentic 18650 and 21700 lithium cells, multi-cell battery management systems (BMS), buck/boost voltage regulators, solar charge controllers, and AC-DC desktop power supplies.",
    image:
      "https://images.unsplash.com/photo-1619641253018-095a2542a22c?auto=format&fit=crop&w=800&q=80",
    productCount: 1200,
    featured: false,
    color: "#F59E0B",
    bgColor: "#FEF3C7",
    subcategories: [
      {
        id: "sub-batteries",
        slug: "batteries",
        name: "Batteries",
        description: "18650 Li-ion cells, LiFePO4 packs, 9V rechargeable batteries, BMS protection boards, and smart balance chargers.",
        image:
          "https://images.unsplash.com/photo-1619641253018-095a2542a22c?auto=format&fit=crop&w=600&q=80",
        productCount: 1200,
      },
    ],
  },

  // 7. Mechanical & Hardware
  {
    id: "cat-mechanical-hardware",
    slug: "mechanical-hardware",
    slugAlias: ["mechanical-components", "hardware-tools", "3d-printing", "rapid-prototyping"],
    name: "Mechanical & Hardware",
    shortName: "Mechanical & Hardware",
    shortDescription:
      "Mechanical gears, aluminum extrusions, precision fasteners, brackets, and 3D printing accessories.",
    fullDescription:
      "Industrial-grade structural mechanical components and hardware prototyping parts. Covers aluminum V-slot profiles, linear bearings, timing belts, metric screw kits, standoffs, 3D printer extruders, hotends, nozzles, and engineering filaments.",
    image:
      "https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=800&q=80",
    productCount: 2100,
    featured: false,
    color: "#475569",
    bgColor: "#F1F5F9",
    subcategories: [
      {
        id: "sub-mechanical-products",
        slug: "mechanical-products",
        name: "Mechanical Products",
        description: "Linear motion shafts, lead screws, GT2 timing pulleys, spur gears, and structural brackets.",
        image:
          "https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=600&q=80",
        productCount: 850,
      },
      {
        id: "sub-hardware",
        slug: "hardware",
        name: "Hardware",
        description: "M2/M3/M4 hex screws, nylon standoffs, T-nuts, washers, heat-set inserts, and prototyping enclosures.",
        image:
          "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80",
        productCount: 780,
      },
      {
        id: "sub-3d-accessories",
        slug: "3d-accessories",
        name: "3D Accessories",
        description: "Brass nozzles, PTFE Capricorn tubes, magnetic build plates, thermistors, and PLA/PETG filaments.",
        image:
          "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
        productCount: 470,
      },
    ],
  },

  // 8. Educational & STEM Kits
  {
    id: "cat-educational-stem-kits",
    slug: "educational-stem-kits",
    slugAlias: ["educational-stem", "stem-kits", "project-kits", "stem", "robotics-stem-kits"],
    name: "Educational & STEM Kits",
    shortName: "STEM & Kits",
    shortDescription:
      "Hands-on STEM learning kits, educational robotics, electronic science toys, and college project kits.",
    fullDescription:
      "Designed for students, schools, Atal Tinkering Labs (ATL), and engineering makers. Complete self-contained learning kits covering electronics basics, sensor experiments, IoT telemetry, robotics building, and capstone engineering degree project kits.",
    image:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80",
    productCount: 1650,
    featured: true,
    color: "#059669",
    bgColor: "#ECFDF5",
    subcategories: [
      {
        id: "sub-stem-kits",
        slug: "stem-kits",
        name: "STEM Kits",
        description: "Hands-on robotics, electronics foundation, solar power, and Atal Tinkering Lab curriculum kits.",
        image:
          "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80",
        productCount: 520,
      },
      {
        id: "sub-educational-kits",
        slug: "educational-kits",
        name: "Educational Kits",
        description: "Breadboard starter kits, basic soldering trainer sets, and micro-python coding bundles.",
        image:
          "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80",
        productCount: 410,
      },
      {
        id: "sub-educational-toys",
        slug: "educational-toys",
        name: "Educational Toys",
        description: "DIY mechanical gear toys, magnetic levitation experiment sets, and early STEM creative blocks.",
        image:
          "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=600&q=80",
        productCount: 320,
      },
      {
        id: "sub-project-kits",
        slug: "project-kits",
        name: "Project Kits",
        description: "IoT smart agriculture, home automation, automated toll booth, and biometric attendance projects.",
        image:
          "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80",
        productCount: 400,
      },
    ],
  },

  // 9. Industrial Automation
  {
    id: "cat-industrial-automation",
    slug: "industrial-automation",
    slugAlias: ["automation", "industrial"],
    name: "Industrial Automation",
    shortName: "Automation",
    shortDescription:
      "PLCs, DIN-rail power supplies, solid-state relays, proximity sensors, and industrial controls.",
    fullDescription:
      "Commercial and factory automation products designed for 24/7 reliability. Featuring programmable logic controllers (PLCs), 24V DIN-rail industrial PSUs, inductive proximity sensors, Modbus/RS485 converters, and industrial motor contactors.",
    image:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80",
    productCount: 850,
    featured: false,
    color: "#D97706",
    bgColor: "#FFFBEB",
    subcategories: [
      {
        id: "sub-industrial-automation-products",
        slug: "industrial-automation-products",
        name: "Industrial Automation Products",
        description: "Micro-PLCs, solid-state relays, DIN-rail modules, inductive proximity sensors, and RS485 communication converters.",
        image:
          "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80",
        productCount: 850,
      },
    ],
  },
];

/** Helper to match a category by slug, id, name, or alias */
export function matchCategory(category: CategoryData, slugOrAlias: string): boolean {
  if (!slugOrAlias) return false;
  const target = slugOrAlias.toLowerCase().trim();
  if (category.slug.toLowerCase() === target) return true;
  if (category.id.toLowerCase() === target) return true;
  if (category.name.toLowerCase() === target) return true;
  if (category.slugAlias) {
    if (Array.isArray(category.slugAlias)) {
      if (category.slugAlias.some((a) => a.toLowerCase() === target)) return true;
    } else if (category.slugAlias.toLowerCase() === target) {
      return true;
    }
  }
  return false;
}

/** Helper to match a subcategory by slug, id, name, or alias */
export function matchSubcategory(subcategory: Subcategory, slugOrAlias: string): boolean {
  if (!slugOrAlias) return false;
  const target = slugOrAlias.toLowerCase().trim();
  if (subcategory.slug.toLowerCase() === target) return true;
  if (subcategory.id.toLowerCase() === target) return true;
  if (subcategory.name.toLowerCase() === target) return true;
  if (subcategory.slugAlias) {
    if (subcategory.slugAlias.some((a) => a.toLowerCase() === target)) return true;
  }
  return false;
}

/** Get a category by its slug or alias */
export function getCategoryBySlug(slugOrAlias: string): CategoryData | undefined {
  return CATEGORIES_DATA.find((c) => matchCategory(c, slugOrAlias));
}

export const COLLECTION_ECOSYSTEMS = [
  {
    id: "eco-robotics",
    title: "Robotics & Motion Ecosystem",
    description:
      "Explore robotic arms, chassis rovers, stepper drives, and servo motion controllers built for research and makers.",
    image:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1000&q=80",
    categorySlug: "robotics",
    tag: "INDUSTRIAL SPEC",
  },
  {
    id: "eco-development-boards",
    title: "Development Boards & Embedded Computing",
    description:
      "Official Arduino boards, Raspberry Pi 5 single board computers, and ESP32/NVIDIA Jetson AI edge modules.",
    image:
      "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=1000&q=80",
    categorySlug: "development-boards",
    tag: "DEVELOPER SPEC",
  },
  {
    id: "eco-drones",
    title: "Drone Avionics & UAV Hardware",
    description:
      "Pixhawk autopilots, BLDC brushless motors, DShot ESCs, high-precision GPS, and FPV cameras.",
    image:
      "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=1000&q=80",
    categorySlug: "drone-technology",
    tag: "AERIAL SPEC",
  },
];
