export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  mrp: number;
  inStock: boolean;
}

export interface ProductDocument {
  title: string;
  type: string;
  url: string;
}

export interface ProductReview {
  id: string;
  author: string;
  role: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

export type ShippingTag =
  "Standard" | "Battery Item" | "Fragile" | "Heavy/Oversized" | "Hazardous";

export interface Product {
  id: string;
  slug?: string;
  name: string;
  sku: string;
  brand?: string;
  category: string;
  subcategory?: string;
  price: number;
  mrp: number;
  discount: string;
  gstInclusive?: boolean;
  rating: number;
  reviews: number;
  inStock: boolean;
  image: string;
  images?: string[];
  videoUrl?: string;
  media360?: string[];
  badge?: string;
  description: string;
  features?: string[];
  applications?: string[];
  whatsIncluded?: string[];
  specs: Record<string, string>;
  variants?: ProductVariant[];
  documents?: ProductDocument[];
  reviewItems?: ProductReview[];
  relatedProductIds?: string[];
  frequentlyBoughtTogetherIds?: string[];
  recommendedAccessoryIds?: string[];

  // Section 5: Shipping, Freight Rules & Battery Restriction
  weightGrams?: number;
  dimensionsCm?: {
    length: number;
    width: number;
    height: number;
  };
  shippingTag?: ShippingTag;
  airFreightAllowed?: boolean;
  surfaceFreightAllowed?: boolean;

  // Section 6: Search Engine Optimization (SEO) & OpenGraph
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  indexFollow?: boolean;
  structuredDataType?: string;
  seoSlug?: string;
}

export interface Category {
  id: string;
  name: string;
  count: string;
  description: string;
  image: string;
  iconName: string;
}

export interface Solution {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  highlights: string[];
}

export interface Industry {
  id: string;
  title: string;
  description: string;
  image: string;
}

export interface LearningItem {
  id: string;
  category:
    "Tutorials" | "Projects" | "Courses" | "Workshops" | "Certifications";
  title: string;
  level: string;
  duration: string;
  description: string;
  image: string;
}

export const CATEGORIES: Category[] = [
  {
    id: "robotics",
    name: "Robotics & DIY Kits",
    count: "2,400+ Products",
    description:
      "Humanoid arms, robotic chassis, servos, manipulators & industrial kits.",
    image:
      "https://res.cloudinary.com/fyueflvh/image/upload/v1788595386/prayog/products/prod_catalog_template_4.jpg",
    iconName: "Bot",
  },
  {
    id: "arduino",
    name: "Arduino & Microcontrollers",
    count: "1,800+ Products",
    description:
      "UNO, Mega, Nano, ESP8266, ESP32, and official expansion shields.",
    image:
      "https://res.cloudinary.com/fyueflvh/image/upload/v1788595383/prayog/products/prod_catalog_template_1.jpg",
    iconName: "Cpu",
  },
  {
    id: "drones",
    name: "Drones & UAV Parts",
    count: "950+ Products",
    description:
      "Flight controllers, ESCs, BLDC motors, FPV gear & carbon fiber frames.",
    image:
      "https://res.cloudinary.com/fyueflvh/image/upload/v1788595385/prayog/products/prod_catalog_template_3.jpg",
    iconName: "Plane",
  },
  {
    id: "iot",
    name: "IoT & Wireless Modules",
    count: "3,100+ Products",
    description:
      "LoRaWAN modules, wireless gateways, relays, displays & power units.",
    image:
      "https://res.cloudinary.com/fyueflvh/image/upload/v1788595384/prayog/products/prod_catalog_template_2.jpg",
    iconName: "Wifi",
  },
  {
    id: "stem",
    name: "STEM & Educational Kits",
    count: "650+ Kits",
    description:
      "Hands-on learning science & coding lab kits tailored for schools & DIY.",
    image:
      "https://res.cloudinary.com/fyueflvh/image/upload/v1788595388/prayog/products/prod_catalog_template_7.jpg",
    iconName: "GraduationCap",
  },
  {
    id: "sensors",
    name: "Sensors & Electronic Modules",
    count: "1,450+ Sensors",
    description:
      "LiDAR, Ultrasonic, IMU 9-DOF, Gas, Biometric & Vision cameras.",
    image:
      "https://res.cloudinary.com/fyueflvh/image/upload/v1788595387/prayog/products/prod_catalog_template_5.jpg",
    iconName: "Activity",
  },
  {
    id: "motors",
    name: "Motors, Steppers & Drivers",
    count: "1,100+ Drives",
    description:
      "High torque stepper motors, BLDC, planetary gearheads & motor drivers.",
    image:
      "https://res.cloudinary.com/fyueflvh/image/upload/v1788595389/prayog/products/prod_catalog_template_8.jpg",
    iconName: "Zap",
  },
  {
    id: "devboards",
    name: "Single Board Computers & Dev Boards",
    count: "820+ Boards",
    description:
      "Raspberry Pi 5, Jetson Orin Nano, STM32 Nucleo & FPGA boards.",
    image:
      "https://res.cloudinary.com/fyueflvh/image/upload/v1788595388/prayog/products/prod_catalog_template_6.jpg",
    iconName: "CircuitBoard",
  },
];

export const PRODUCTS: Product[] = [
  // ==========================================
  // 1. Arduino & Microcontrollers (10 Products)
  // ==========================================
  {
    id: "ard-uno-r3",
    slug: "arduino-uno-r3-official-rev3-board",
    name: "Arduino UNO R3 Official Rev3 Board (ATmega328P)",
    sku: "PRG-ARD-001",
    brand: "Arduino",
    category: "Arduino & Microcontrollers",
    subcategory: "Arduino Boards",
    price: 1499,
    mrp: 1999,
    discount: "25% OFF",
    gstInclusive: true,
    rating: 4.9,
    reviews: 342,
    inStock: true,
    badge: "BESTSELLER",
    image:
      "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1608564697071-ddf911d81370?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    ],
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    description:
      "The Arduino UNO R3 is the world standard microcontroller board for mechatronics, robotics, and smart IoT automation. Powered by the high-reliability ATmega328P 8-bit AVR microchip operating at 16 MHz.",
    features: [
      "100% Genuine ATmega328P Microchip with removable DIP IC socket.",
      "14 Digital Input/Output Pins (6 provide hardware PWM output).",
      "6 Analog Input Pins with 10-bit ADC resolution.",
      "16 MHz Crystal Oscillator & On-board USB Type-B Interface.",
      "Integrated ICSP Header for direct bootloader programming.",
    ],
    applications: [
      "Autonomous Mobile Robotics & Chassis Control",
      "STEM Laboratory Tinkering & University Research",
      "IoT Sensor Telemetry & Home Automation Systems",
      "Embedded Prototyping & Industrial Motor Control",
    ],
    whatsIncluded: [
      "1x Official Arduino UNO R3 Board",
      "1x High-speed USB Type-A to Type-B Cable (50cm)",
      "1x Quick Start Guide & Pinout Reference Sheet",
    ],
    specs: {
      Microcontroller: "ATmega328P",
      "Operating Voltage": "5V DC",
      "Input Voltage (Recommended)": "7-12V DC",
      "Digital I/O Pins": "14 (of which 6 provide PWM output)",
      "Analog Input Pins": "6",
      "DC Current per I/O Pin": "20 mA",
      "Flash Memory": "32 KB (ATmega328P) of which 0.5 KB used by bootloader",
      SRAM: "2 KB (ATmega328P)",
      EEPROM: "1 KB (ATmega328P)",
      "Clock Speed": "16 MHz",
    },
    variants: [
      {
        id: "var-uno-standard",
        name: "Standard USB-B Edition",
        sku: "PRG-ARD-001-STD",
        price: 1499,
        mrp: 1999,
        inStock: true,
      },
      {
        id: "var-uno-smd",
        name: "SMD Surface Mount Edition",
        sku: "PRG-ARD-001-SMD",
        price: 1299,
        mrp: 1799,
        inStock: true,
      },
    ],
    documents: [
      {
        title: "Arduino UNO R3 Official Datasheet (PDF)",
        type: "PDF",
        url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      },
      {
        title: "ATmega328P Full Hardware Schematic",
        type: "PDF",
        url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      },
      {
        title: "Arduino IDE Installation & Driver Setup Guide",
        type: "Manual",
        url: "#",
      },
    ],
    reviewItems: [
      {
        id: "rev-1",
        author: "Prof. Alok Gupta",
        role: "IIT Bombay Mechatronics Lab",
        rating: 5,
        date: "22 Aug 2026",
        comment:
          "Authentic board with original ATmega328P IC. Performs flawlessly in our undergraduate robotics curriculum.",
        verified: true,
      },
      {
        id: "rev-2",
        author: "Rohan Sharma",
        role: "Robotics Hobbyist",
        rating: 5,
        date: "15 Aug 2026",
        comment:
          "Extremely reliable board. Shipped in antistatic packaging with full GST invoice.",
        verified: true,
      },
    ],
    relatedProductIds: ["ard-mega-2560", "ard-nano-v3", "node-mcu-v3"],
    frequentlyBoughtTogetherIds: [
      "hcsr04-ultrasonic",
      "mpu6050-gyro",
      "dht11-sensor",
    ],
    recommendedAccessoryIds: ["hcsr04-ultrasonic", "dht11-sensor"],
  },
  {
    id: "ard-uno-r4-wifi",
    name: "Arduino UNO R4 WiFi Board (Renesas RA4M1 + ESP32-S3)",
    sku: "PRG-ARD-006",
    brand: "Arduino",
    category: "Arduino & Microcontrollers",
    price: 2799,
    mrp: 3499,
    discount: "20% OFF",
    rating: 4.9,
    reviews: 142,
    inStock: true,
    badge: "NEW GENERATION",
    image:
      "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80",
    description:
      "The revolutionary UNO R4 WiFi merges a 32-bit Renesas RA4M1 Cortex-M4 microprocessor with an onboard ESP32-S3 for seamless Wi-Fi and Bluetooth connectivity, plus a 12x8 red LED matrix.",
    specs: {
      MCU: "Renesas RA4M1 48MHz",
      Wireless: "ESP32-S3 Wi-Fi/BLE",
      Matrix: "12x8 Red LED Matrix",
      Voltage: "5V (Operates up to 24V in)",
    },
  },
  {
    id: "ard-mega-2560",
    name: "Arduino Mega 2560 R3 Board (54 I/O Pins)",
    sku: "PRG-ARD-002",
    category: "Arduino & Microcontrollers",
    price: 1899,
    mrp: 2499,
    discount: "24% OFF",
    rating: 4.8,
    reviews: 198,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80",
    description:
      "Designed for 3D printers and robotics with 54 digital pins and 16 analog inputs.",
    specs: {
      Microcontroller: "ATmega2560",
      "Flash Memory": "256 KB",
      "Digital Pins": "54",
    },
  },
  {
    id: "ard-nano-v3",
    name: "Arduino Nano V3 CH340 Type-C Microcontroller",
    sku: "PRG-ARD-003",
    category: "Arduino & Microcontrollers",
    price: 349,
    mrp: 499,
    discount: "30% OFF",
    rating: 4.7,
    reviews: 512,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80",
    description:
      "Compact breadboard-friendly microcontroller with USB Type-C interface.",
    specs: {
      Microcontroller: "ATmega328P",
      Interface: "USB-C",
      Dimensions: "18 x 45 mm",
    },
  },
  {
    id: "ard-nano-every",
    name: "Arduino Nano Every Compact 20MHz Microcontroller",
    sku: "PRG-ARD-007",
    category: "Arduino & Microcontrollers",
    price: 999,
    mrp: 1399,
    discount: "28% OFF",
    rating: 4.8,
    reviews: 87,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80",
    description:
      "Supercharged Nano form-factor with 48KB Flash memory, 6KB RAM and 20MHz clock speed.",
    specs: { MCU: "ATMega4809", Clock: "20 MHz", RAM: "6 KB", Flash: "48 KB" },
  },
  {
    id: "ard-nano-33-ble",
    name: "Arduino Nano 33 BLE Sense (9-Axis IMU & Microphone)",
    sku: "PRG-ARD-008",
    category: "Arduino & Microcontrollers",
    price: 3199,
    mrp: 3899,
    discount: "18% OFF",
    rating: 4.9,
    reviews: 64,
    inStock: true,
    badge: "AI EDGE",
    image:
      "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1608564697071-ddf911d81370?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
    ],
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    description:
      "TinyML AI edge board packed with 9-axis motion sensor, gesture sensor, digital mic, temperature and humidity sensors.",
    specs: {
      MCU: "nRF52840 Cortex-M4F 64MHz",
      Bluetooth: "BLE 5.0",
      Sensors: "IMU, Mic, Temp, Humidity, Light",
    },
  },
  {
    id: "node-mcu-v3",
    name: "NodeMCU ESP8266 Wi-Fi Development Board",
    sku: "PRG-ARD-004",
    category: "Arduino & Microcontrollers",
    price: 299,
    mrp: 450,
    discount: "33% OFF",
    rating: 4.8,
    reviews: 420,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
    description:
      "Open-source IoT development board based on ESP8266 Wi-Fi chip.",
    specs: { "Wi-Fi": "802.11 b/g/n", Clock: "80MHz", GPIO: "10 Pins" },
  },
  {
    id: "esp32-devkit-v1",
    slug: "esp32-development-board-esp32-001",
    name: "ESP32 Development Board (Wi-Fi + Bluetooth Dual-Core 240MHz)",
    sku: "ESP32-001",
    brand: "Espressif Systems",
    category: "Arduino & Microcontrollers",
    subcategory: "IoT & Wireless Microcontrollers",
    price: 499,
    mrp: 699,
    discount: "28% OFF",
    gstInclusive: true,
    rating: 4.9,
    reviews: 580,
    inStock: true,
    badge: "TOP SELLER",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=800&q=80",
    ],
    description:
      "Centralized Product Catalogue Master: The ESP32-WROOM-32 is a powerful, generic Wi-Fi + Bluetooth + BLE MCU module for smart robotics and telemetry.",
    features: [
      "Dual-Core Tensilica Xtensa 32-bit LX6 Microprocessor @ 240 MHz.",
      "Integrated 802.11 b/g/n Wi-Fi Transceiver and Bluetooth v4.2 BR/EDR and BLE.",
      "Ultra-low power co-processor with deep sleep current below 5µA.",
      "30 GPIO Pins with capacitive touch sensors, ADC, DAC, UART, SPI, I2C.",
    ],
    specs: {
      Microcontroller: "ESP32-D0WDQ6 Dual-Core",
      "Clock Speed": "240 MHz",
      "Flash Memory": "4 MB SPI Flash",
      SRAM: "520 KB",
      "Wireless Connectivity": "Wi-Fi 802.11 b/g/n + BLE 4.2",
      "Operating Voltage": "3.3V DC (Micro-USB 5V Input)",
      "Digital GPIO": "30 Pins (with PWM/Interrupt)",
    },
    variants: [
      {
        id: "var-esp32-30p",
        name: "30-Pin CP2102 Edition",
        sku: "ESP32-001-30P",
        price: 499,
        mrp: 699,
        inStock: true,
      },
      {
        id: "var-esp32-38p",
        name: "38-Pin CH9102 Edition",
        sku: "ESP32-001-38P",
        price: 549,
        mrp: 749,
        inStock: true,
      },
    ],
    documents: [
      {
        title: "ESP32-WROOM-32 Official Hardware Datasheet",
        type: "PDF",
        url: "https://www.espressif.com/sites/default/files/documentation/esp32-wroom-32_datasheet_en.pdf",
      },
      {
        title: "ESP-IDF & Arduino Core Pinout Schematic",
        type: "PDF",
        url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      },
    ],
    frequentlyBoughtTogetherIds: [
      "dht11-sensor",
      "relay-module-4ch",
      "oled-096-i2c",
    ],
  },
  {
    id: "esp32-s3-devkit",
    name: "ESP32-S3-DevKitC-1 Dual-Core 240MHz Wi-Fi + BLE 5.0",
    sku: "PRG-ARD-009",
    category: "Arduino & Microcontrollers",
    price: 799,
    mrp: 1100,
    discount: "27% OFF",
    rating: 4.9,
    reviews: 130,
    inStock: true,
    badge: "AI EDGE",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
    description:
      "Next-generation dual-core Xtensa LX7 MCU with vector instructions for edge machine learning, 44 GPIOs, and dual USB-C ports.",
    specs: {
      CPU: "Dual-core 240MHz LX7",
      Flash: "8MB Flash + 2MB PSRAM",
      USB: "Dual USB-C (OTG + UART)",
    },
  },
  {
    id: "stm32-bluepill",
    name: "STM32F103C8T6 Blue Pill ARM Cortex-M3 Board",
    sku: "PRG-ARD-005",
    category: "Arduino & Microcontrollers",
    price: 399,
    mrp: 599,
    discount: "33% OFF",
    rating: 4.6,
    reviews: 180,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1608564697071-ddf911d81370?auto=format&fit=crop&w=600&q=80",
    description: "High-speed 72MHz 32-bit ARM Cortex microcontroller board.",
    specs: { CPU: "72MHz ARM Cortex-M3", Flash: "64KB", RAM: "20KB" },
  },
  {
    id: "ard-leonardo-r3",
    name: "Arduino Leonardo R3 with ATmega32u4 USB HID Support",
    sku: "PRG-ARD-010",
    category: "Arduino & Microcontrollers",
    price: 1299,
    mrp: 1699,
    discount: "23% OFF",
    rating: 4.7,
    reviews: 95,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80",
    description:
      "Microcontroller with native USB communication eliminating the need for a secondary processor, acting as mouse or keyboard.",
    specs: {
      Microcontroller: "ATmega32u4",
      NativeUSB: "HID Keyboard/Mouse",
      Clock: "16MHz",
      PWM: "7 Channels",
    },
  },

  // ==========================================
  // 2. Drones & UAV Parts (10 Products)
  // ==========================================
  {
    id: "pixhawk-fc",
    name: "Pixhawk 6C Autopilot Flight Controller Unit",
    sku: "PRG-UAV-601",
    category: "Drones & UAV Parts",
    price: 14500,
    mrp: 18000,
    discount: "19% OFF",
    rating: 4.9,
    reviews: 84,
    inStock: true,
    badge: "PRO SPEC",
    image:
      "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=600&q=80",
    description:
      "Advanced autopilot hardware standard for autonomous multirotors, fixed-wing aircraft and rover robotics.",
    specs: {
      Processor: "STM32H743",
      IMU: "Triple redundant",
      Protocol: "MavLink 2.0",
      GNSS: "Dual GPS Support",
    },
  },
  {
    id: "holybro-m8n-gps",
    name: "Holybro Micro M8N High-Precision Compass GPS Module",
    sku: "PRG-UAV-606",
    category: "Drones & UAV Parts",
    price: 2999,
    mrp: 3899,
    discount: "23% OFF",
    rating: 4.9,
    reviews: 112,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=600&q=80",
    description:
      "U-blox M8N concurrent GNSS receiver module with integrated digital compass for Pixhawk flight controllers.",
    specs: {
      Chip: "u-blox NEO-M8N",
      Compass: "IST8310",
      Protocol: "UART/I2C",
      Antenna: "25x25mm Ceramic Patch",
    },
  },
  {
    id: "bldc-motor-2212",
    name: "A2212 1000KV Brushless BLDC Motor for Drones",
    sku: "PRG-UAV-602",
    category: "Drones & UAV Parts",
    price: 499,
    mrp: 750,
    discount: "33% OFF",
    rating: 4.7,
    reviews: 630,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=600&q=80",
    description:
      "High efficiency outrunner brushless motor ideal for 10-inch propellers and quadcopter frames.",
    specs: { KV: "1000KV", Thrust: "850g", Voltage: "2-3S LiPo" },
  },
  {
    id: "esc-30a-simonk",
    name: "30A ESC Speed Controller with SimonK Firmware",
    sku: "PRG-UAV-603",
    category: "Drones & UAV Parts",
    price: 449,
    mrp: 699,
    discount: "35% OFF",
    rating: 4.8,
    reviews: 389,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=600&q=80",
    description:
      "Fast response 30A ESC designed specifically for multi-rotor drones.",
    specs: { Current: "30A Continuous", BEC: "5V/2A", Battery: "2-3S" },
  },
  {
    id: "speedybee-f405-stack",
    name: "SpeedyBee F405 V3 50A 4-in-1 ESC Flight Stack for FPV",
    sku: "PRG-UAV-607",
    category: "Drones & UAV Parts",
    price: 6499,
    mrp: 7999,
    discount: "18% OFF",
    rating: 5.0,
    reviews: 175,
    inStock: true,
    badge: "FPV RACER",
    image:
      "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=600&q=80",
    description:
      "High performance FPV drone stack with built-in Bluetooth/WiFi wireless configuration, 50A 4-in-1 ESC, and BetaFlight OSD.",
    specs: {
      MCU: "STM32F405",
      ESC: "50A 4-in-1 BLHeli_S",
      Wireless: "Bluetooth & WiFi App Tuning",
      Battery: "3-6S LiPo",
    },
  },
  {
    id: "f450-frame",
    name: "F450 Quadcopter Frame Kit with Integrated PCB",
    sku: "PRG-UAV-604",
    category: "Drones & UAV Parts",
    price: 899,
    mrp: 1299,
    discount: "30% OFF",
    rating: 4.9,
    reviews: 210,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=600&q=80",
    description:
      "Durable ultra-strong polyamide arms quadcopter frame with integrated power distribution board.",
    specs: {
      Wheelbase: "450mm",
      Weight: "282g",
      Material: "Glass Fiber & Polyamide",
    },
  },
  {
    id: "flysky-i6-tx",
    name: "FlySky FS-i6X 10CH 2.4GHz Transmitter + iA10B Receiver",
    sku: "PRG-UAV-605",
    category: "Drones & UAV Parts",
    price: 4299,
    mrp: 5499,
    discount: "21% OFF",
    rating: 4.9,
    reviews: 310,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=600&q=80",
    description:
      "10 channel 2.4GHz AFHDS 2A digital proportional RC radio transmitter system.",
    specs: { Channels: "10", Range: "500m-1500m", Protocol: "AFHDS 2A" },
  },
  {
    id: "foxeer-predator-5",
    name: "Foxeer Predator 5 Micro 1000TVL FPV Low Latency Camera",
    sku: "PRG-UAV-608",
    category: "Drones & UAV Parts",
    price: 2399,
    mrp: 3100,
    discount: "22% OFF",
    rating: 4.8,
    reviews: 92,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=600&q=80",
    description:
      "Ultra-clear 1000TVL FPV camera with super WDR and 4ms low latency for FPV racing drones.",
    specs: {
      Resolution: "1000TVL",
      Latency: "4ms Super Low",
      Lens: "1.7mm M8",
      FOV: "155 Degrees",
    },
  },
  {
    id: "gemfan-1045-props",
    name: "Gemfan 1045 Carbon Reinforced Propellers (4 Pairs CW/CCW)",
    sku: "PRG-UAV-609",
    category: "Drones & UAV Parts",
    price: 349,
    mrp: 550,
    discount: "36% OFF",
    rating: 4.7,
    reviews: 410,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=600&q=80",
    description:
      "Balanced 10x4.5 inch high-strength carbon nylon propellers designed for A2212 and similar drone motors.",
    specs: {
      Size: "10x4.5 Inch",
      Pitch: "4.5",
      Hub: "6mm Adapter Rings",
      Set: "4 Pairs (4 CW + 4 CCW)",
    },
  },
  {
    id: "matek-pdb-xt60",
    name: "Matek Systems PDB-XT60 Dual BEC 5V/12V Power Board",
    sku: "PRG-UAV-610",
    category: "Drones & UAV Parts",
    price: 599,
    mrp: 850,
    discount: "29% OFF",
    rating: 4.8,
    reviews: 165,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=600&q=80",
    description:
      "Reliable power distribution board engineered to distribute battery power to 4 ESCs with linear dual BEC outputs.",
    specs: {
      Input: "9-26V DC (3-6S LiPo)",
      BEC1: "5V/2A",
      BEC2: "12V/0.5A Linear",
      Plug: "Direct XT60 Solder",
    },
  },

  // ==========================================
  // 3. Robotics & DIY Kits (10 Products)
  // ==========================================
  {
    id: "prayog-stem-robot-kit",
    name: "PRAYOG Dilay-Bot 4WD Autonomous Robotics Learning Kit",
    sku: "PRG-KIT-100",
    category: "Robotics & DIY Kits",
    price: 4999,
    mrp: 6999,
    discount: "28% OFF",
    rating: 5.0,
    reviews: 215,
    inStock: true,
    badge: "FLAGSHIP KIT",
    image:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80",
    description:
      "Complete hands-on robotics kit including metal chassis, ultrasonic line follower, Bluetooth app control & code tutorials.",
    specs: {
      Motors: "4x Metal Gear TT Motors",
      Control: "Arduino Compatible",
      Battery: "Rechargeable 18650",
      App: "Android & iOS",
    },
  },
  {
    id: "robotic-arm-4dof",
    name: "4-DOF Acrylic Robotic Arm Manipulator Kit with Servos",
    sku: "PRG-KIT-101",
    category: "Robotics & DIY Kits",
    price: 2499,
    mrp: 3499,
    discount: "28% OFF",
    rating: 4.7,
    reviews: 145,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80",
    description:
      "4-degree-of-freedom robotic arm assembly kit with 4x MG996R metal gear servos.",
    specs: { Servos: "4x MG996R", Reach: "20cm", Payload: "150g" },
  },
  {
    id: "arm-manipulator-6dof",
    name: "6-DOF Heavy Duty Metal Robotic Arm Manipulator Kit",
    sku: "PRG-KIT-102",
    category: "Robotics & DIY Kits",
    price: 8499,
    mrp: 11999,
    discount: "29% OFF",
    rating: 4.9,
    reviews: 98,
    inStock: true,
    badge: "PRO SPEC",
    image:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80",
    description:
      "Industrial-grade 6-DOF aluminium alloy robot arm manipulator with 6 digital high-torque servos and mechanical claw.",
    specs: {
      Material: "2mm Hard Aluminium",
      Servos: "6x High Torque Metal Gear",
      ClawSpan: "55mm",
      Payload: "500g",
    },
  },
  {
    id: "mecanum-4wd-car",
    name: "4WD Omni-Directional Mecanum Wheel Chassis Kit",
    sku: "PRG-KIT-103",
    category: "Robotics & DIY Kits",
    price: 3699,
    mrp: 4999,
    discount: "26% OFF",
    rating: 4.9,
    reviews: 160,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80",
    description:
      "Omnidirectional mobile platform with 4 independent Mecanum wheels for 360-degree rotation and lateral translation.",
    specs: {
      Wheels: "4x 80mm Mecanum Wheels",
      Chassis: "Aluminium Plate",
      Motors: "4x TT Gear Motors with Hall Encoders",
    },
  },
  {
    id: "tank-robot-chassis",
    name: "Heavy Duty Tracked Robot Tank Chassis with Dual DC Motors",
    sku: "PRG-KIT-104",
    category: "Robotics & DIY Kits",
    price: 4299,
    mrp: 5800,
    discount: "25% OFF",
    rating: 4.8,
    reviews: 88,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80",
    description:
      "All-terrain crawler tank chassis with metal damping suspension and engineering rubber tracks for rough outdoor ground.",
    specs: {
      Track: "Engineering Rubber Continuous",
      Material: "Aluminium Alloy",
      Motors: "Dual 9-12V High Torque Motors",
    },
  },
  {
    id: "ros2-slam-rover",
    name: "ROS 2 SLAM Autonomous Mobile Robot LiDAR Mapping Platform",
    sku: "PRG-KIT-105",
    category: "Robotics & DIY Kits",
    price: 28999,
    mrp: 35000,
    discount: "17% OFF",
    rating: 5.0,
    reviews: 42,
    inStock: true,
    badge: "RESEARCH SPEC",
    image:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80",
    description:
      "Complete research-ready autonomous navigation rover with RPLiDAR A1, IMU, high-resolution encoders, and ROS 2 Humble support.",
    specs: {
      Framework: "ROS 2 Humble / Noetic",
      LiDAR: "360° 12m RPLiDAR",
      Odometry: "Optical Encoders + 9-DOF IMU",
    },
  },
  {
    id: "pan-tilt-servo-kit",
    name: "2-Axis Pan-Tilt FPV Camera Mount with Dual SG90 Servos",
    sku: "PRG-KIT-106",
    category: "Robotics & DIY Kits",
    price: 399,
    mrp: 650,
    discount: "38% OFF",
    rating: 4.6,
    reviews: 320,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80",
    description:
      "Lightweight dual-axis servo pan-and-tilt assembly for mounting ultrasonic sensors or FPV cameras.",
    specs: {
      Servos: "2x SG90 9g",
      Rotation: "180° Pan & 180° Tilt",
      Weight: "35g",
    },
  },
  {
    id: "mg996r-servo-high-torque",
    name: "TowerPro MG996R High Torque Metal Gear Digital Servo",
    sku: "PRG-KIT-107",
    category: "Robotics & DIY Kits",
    price: 380,
    mrp: 599,
    discount: "36% OFF",
    rating: 4.8,
    reviews: 580,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80",
    description:
      "Industry standard metal gear servo delivering up to 11 kg-cm stall torque at 6V.",
    specs: {
      StallTorque: "11 kg/cm at 6V",
      Gears: "Full Copper Metal",
      Angle: "180 Degrees Digital",
    },
  },
  {
    id: "sg90-servos-10pack",
    name: "Micro SG90 9g Servos Value Multipack (10 Units)",
    sku: "PRG-KIT-108",
    category: "Robotics & DIY Kits",
    price: 1199,
    mrp: 1800,
    discount: "33% OFF",
    rating: 4.7,
    reviews: 290,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80",
    description:
      "Bulk pack of 10 micro 9-gram servos for school projects, DIY robot grippers, and RC planes.",
    specs: {
      Quantity: "10 Pieces",
      Weight: "9g each",
      Torque: "1.6 kg/cm",
      OperatingVoltage: "4.8V DC",
    },
  },
  {
    id: "robot-claw-gripper",
    name: "Aluminium Alloy Mechanical Robot Claw Gripper",
    sku: "PRG-KIT-109",
    category: "Robotics & DIY Kits",
    price: 799,
    mrp: 1200,
    discount: "33% OFF",
    rating: 4.8,
    reviews: 135,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80",
    description:
      "Precision laser-cut aluminium robotic claw gripper with wave-serrated gripping fingers compatible with MG996R servos.",
    specs: {
      MaxOpening: "55mm",
      TotalLength: "108mm",
      Material: "Hard Aluminium Alloy",
      ServoSupport: "Standard MG995/MG996",
    },
  },

  // ==========================================
  // 4. IoT & Wireless Modules (10 Products)
  // ==========================================
  {
    id: "esp32-wroom",
    name: "ESP32 Dual-Core WiFi + Bluetooth Dev Board",
    sku: "PRG-ESP-302",
    category: "IoT & Wireless Modules",
    price: 549,
    mrp: 799,
    discount: "31% OFF",
    rating: 4.8,
    reviews: 518,
    inStock: true,
    badge: "HOT DEAL",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
    description:
      "Powerful 240MHz dual-core microcontroller with integrated 2.4GHz Wi-Fi and BLE 4.2 for smart IoT applications.",
    specs: {
      Clock: "240 MHz",
      Wireless: "Wi-Fi 802.11 b/g/n + BLE",
      Flash: "4MB",
      Pinout: "38 Pins",
    },
  },
  {
    id: "hc05-bluetooth",
    name: "HC-05 Wireless Bluetooth Master/Slave Transceiver Module",
    sku: "PRG-ESP-303",
    category: "IoT & Wireless Modules",
    price: 289,
    mrp: 450,
    discount: "35% OFF",
    rating: 4.7,
    reviews: 780,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
    description:
      "Serial Bluetooth RF transceiver module for wireless microcontroller communication.",
    specs: {
      Protocol: "Bluetooth 2.0+EDR",
      BaudRate: "9600 bps",
      Range: "10 meters",
    },
  },
  {
    id: "lora-ra02-module",
    name: "Ra-02 LoRa SX1278 433MHz Wireless Transceiver",
    sku: "PRG-ESP-304",
    category: "IoT & Wireless Modules",
    price: 499,
    mrp: 750,
    discount: "33% OFF",
    rating: 4.9,
    reviews: 140,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
    description:
      "Long-range low-power spread spectrum communication module for rural IoT.",
    specs: { Frequency: "433MHz", Range: "Up to 5km", Interface: "SPI" },
  },
  {
    id: "nrf24l01-plus",
    name: "NRF24L01+ 2.4GHz Wireless Transceiver Module",
    sku: "PRG-ESP-305",
    category: "IoT & Wireless Modules",
    price: 149,
    mrp: 250,
    discount: "40% OFF",
    rating: 4.6,
    reviews: 620,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
    description:
      "Ultra-low power 2.4GHz RF transceiver for remote control and telemetry.",
    specs: { Frequency: "2.4GHz", Speed: "2Mbps", Interface: "SPI" },
  },
  {
    id: "sim800l-gsm",
    name: "SIM800L GPRS GSM Cellular Quad-Band Micro SIM Module",
    sku: "PRG-ESP-306",
    category: "IoT & Wireless Modules",
    price: 499,
    mrp: 750,
    discount: "33% OFF",
    rating: 4.7,
    reviews: 245,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
    description:
      "Compact GSM/GPRS module for sending SMS, voice calls, and connecting IoT nodes to cloud cellular networks.",
    specs: {
      Bands: "Quad-band 850/900/1800/1900MHz",
      SIM: "Micro SIM",
      Voltage: "3.7V-4.2V Li-ion",
    },
  },
  {
    id: "relay-8ch-5v",
    name: "8-Channel 5V Optocoupler Isolated Relay Module",
    sku: "PRG-ESP-307",
    category: "IoT & Wireless Modules",
    price: 399,
    mrp: 599,
    discount: "33% OFF",
    rating: 4.8,
    reviews: 310,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
    description:
      "8-channel AC/DC relay board with optical isolation for controlling home appliances with Arduino and ESP32.",
    specs: {
      RelayOutputs: "AC 250V 10A / DC 30V 10A",
      Trigger: "Active Low/High",
      Channels: "8 Isolated",
    },
  },
  {
    id: "esp32-cam-ov2640",
    name: "ESP32-CAM WiFi + Bluetooth Board with OV2640 Camera",
    sku: "PRG-ESP-308",
    category: "IoT & Wireless Modules",
    price: 599,
    mrp: 899,
    discount: "33% OFF",
    rating: 4.8,
    reviews: 430,
    inStock: true,
    badge: "BEST VALUE",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
    description:
      "Low cost AI camera module featuring ESP32-S chip, 2MP OV2640 image sensor, and MicroSD card slot for facial recognition & video streaming.",
    specs: {
      Camera: "2MP OV2640",
      RAM: "520KB SRAM + 4MB PSRAM",
      Card: "MicroSD slot up to 4GB",
    },
  },
  {
    id: "zigbee-cc2530",
    name: "CC2530 Zigbee 2.4GHz Wireless Mesh Network Module",
    sku: "PRG-ESP-309",
    category: "IoT & Wireless Modules",
    price: 449,
    mrp: 650,
    discount: "30% OFF",
    rating: 4.7,
    reviews: 98,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
    description:
      "TI CC2530 Zigbee SoC module enabling low-power IEEE 802.15.4 mesh network deployment for smart buildings.",
    specs: {
      Protocol: "Zigbee 3.0 / IEEE 802.15.4",
      Range: "Up to 250m LOS",
      Interface: "UART",
    },
  },
  {
    id: "w5500-ethernet",
    name: "W5500 SPI Ethernet Hardware TCP/IP Network Module",
    sku: "PRG-ESP-310",
    category: "IoT & Wireless Modules",
    price: 499,
    mrp: 750,
    discount: "33% OFF",
    rating: 4.8,
    reviews: 110,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
    description:
      "Hardwired TCP/IP embedded Ethernet controller module for high-speed industrial microcontrollers via SPI interface.",
    specs: {
      Protocols: "TCP, UDP, ICMP, IPv4, ARP, IGMP, PPPoE",
      Speed: "10/100 Mbps",
      Buffer: "32KB Internal",
    },
  },
  {
    id: "rf-433mhz-pair",
    name: "433MHz Wireless RF Transmitter and Receiver Pair",
    sku: "PRG-ESP-311",
    category: "IoT & Wireless Modules",
    price: 129,
    mrp: 199,
    discount: "35% OFF",
    rating: 4.6,
    reviews: 520,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
    description:
      "Simple ASK/OOK 433MHz radio link kit for wireless doorbells, remote switches, and microcontroller communication.",
    specs: {
      Frequency: "433.92 MHz",
      Range: "20-100m with antenna",
      OperatingVoltage: "3.5-12V DC",
    },
  },

  // ==========================================
  // 5. Sensors & Electronic Modules (10 Products)
  // ==========================================
  {
    id: "hcsr04-ultrasonic",
    name: "HC-SR04 Precision Ultrasonic Distance Sensor",
    sku: "PRG-SEN-042",
    category: "Sensors & Electronic Modules",
    price: 120,
    mrp: 199,
    discount: "39% OFF",
    rating: 4.7,
    reviews: 1240,
    inStock: true,
    badge: "TOP RATED",
    image:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
    description:
      "Non-contact distance measurement module providing 2cm to 400cm ranging accuracy up to 3mm.",
    specs: {
      Range: "2cm - 400cm",
      Angle: "15 degrees",
      Voltage: "5V DC",
      Frequency: "40kHz",
    },
  },
  {
    id: "dht11-sensor",
    name: "DHT11 Digital Temperature & Humidity Sensor Module",
    sku: "PRG-SEN-043",
    category: "Sensors & Electronic Modules",
    price: 110,
    mrp: 180,
    discount: "38% OFF",
    rating: 4.6,
    reviews: 890,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
    description:
      "Calibrated digital signal output temperature and humidity sensor module.",
    specs: { Humidity: "20-90% RH", Temp: "0-50°C", Voltage: "3.3V-5V" },
  },
  {
    id: "mpu6050-gyro",
    name: "MPU-6050 3-Axis Gyroscope + 3-Axis Accelerometer",
    sku: "PRG-SEN-044",
    category: "Sensors & Electronic Modules",
    price: 199,
    mrp: 350,
    discount: "43% OFF",
    rating: 4.8,
    reviews: 640,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
    description:
      "6-DOF MotionTracking device combining 3-axis gyroscope and 3-axis accelerometer.",
    specs: {
      Protocol: "I2C",
      Gyro: "±250 500 1000 2000 °/s",
      Voltage: "3.3V-5V",
    },
  },
  {
    id: "tfluna-lidar",
    name: "Benewake TF-Luna 8m Micro LiDAR Distance Sensor",
    sku: "PRG-SEN-045",
    category: "Sensors & Electronic Modules",
    price: 1899,
    mrp: 2499,
    discount: "24% OFF",
    rating: 4.9,
    reviews: 130,
    inStock: true,
    badge: "PRO SPEC",
    image:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
    description:
      "High-precision micro Time-of-Flight single-point LiDAR sensor for drone obstacle avoidance and robotics SLAM.",
    specs: {
      OperatingRange: "0.2m - 8m",
      Accuracy: "±6cm",
      FrameRate: "1-250Hz adjustable",
      Protocol: "UART & I2C",
    },
  },
  {
    id: "vl53l0x-tof",
    name: "VL53L0X Time-of-Flight (ToF) Laser Distance Sensor",
    sku: "PRG-SEN-046",
    category: "Sensors & Electronic Modules",
    price: 399,
    mrp: 599,
    discount: "33% OFF",
    rating: 4.8,
    reviews: 215,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
    description:
      "940nm VCSEL laser emitter distance sensor measuring absolute distances up to 2 meters irrespective of target color.",
    specs: {
      Range: "Up to 2000mm",
      Laser: "940nm Class 1 Invisible",
      Interface: "I2C Interface",
    },
  },
  {
    id: "bme280-temp-pressure",
    name: "BME280 Digital Barometric Pressure, Temp & Humidity Sensor",
    sku: "PRG-SEN-047",
    category: "Sensors & Electronic Modules",
    price: 449,
    mrp: 650,
    discount: "30% OFF",
    rating: 4.9,
    reviews: 320,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
    description:
      "All-in-one environmental sensor precision manufactured for weather forecasting, altitude estimation, and HVAC control.",
    specs: {
      Pressure: "300-1100 hPa",
      Humidity: "0-100%",
      Temp: "-40 to 85°C",
      Interface: "I2C / SPI",
    },
  },
  {
    id: "mq135-air-quality",
    name: "MQ-135 Hazardous Gas & Air Quality Sensor Module",
    sku: "PRG-SEN-048",
    category: "Sensors & Electronic Modules",
    price: 189,
    mrp: 299,
    discount: "36% OFF",
    rating: 4.7,
    reviews: 410,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
    description:
      "SnO2 gas sensing element sensitive to Ammonia (NH3), NOx, alcohol, Benzene, smoke, and CO2.",
    specs: {
      TargetGases: "NH3, NOx, Alcohol, Benzene, Smoke, CO2",
      Output: "Analog + Digital TTL",
    },
  },
  {
    id: "rcwl-0516-radar",
    name: "RCWL-0516 Doppler Microwave Radar Motion Sensor Module",
    sku: "PRG-SEN-049",
    category: "Sensors & Electronic Modules",
    price: 99,
    mrp: 180,
    discount: "45% OFF",
    rating: 4.6,
    reviews: 580,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
    description:
      "Microwave Doppler radar module capable of detecting motion through walls and acrylic enclosures.",
    specs: {
      DetectionDistance: "5 - 7 meters",
      Angle: "360 degree no blind zone",
      Voltage: "4 - 28V DC",
    },
  },
  {
    id: "tcs3200-color",
    name: "TCS3200 RGB Color Recognition Sensor Module",
    sku: "PRG-SEN-050",
    category: "Sensors & Electronic Modules",
    price: 329,
    mrp: 499,
    discount: "34% OFF",
    rating: 4.7,
    reviews: 175,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
    description:
      "Programmable color light-to-frequency converter with 4 white LEDs for sorting objects by color.",
    specs: {
      SensorArray: "8x8 Photodiodes",
      Illumination: "4 Bright White LEDs",
      Interface: "Direct Microcontroller Frequency",
    },
  },
  {
    id: "max30102-oximeter",
    name: "MAX30102 Pulse Oximeter & Heart-Rate Biosensor Module",
    sku: "PRG-SEN-051",
    category: "Sensors & Electronic Modules",
    price: 299,
    mrp: 450,
    discount: "33% OFF",
    rating: 4.8,
    reviews: 230,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
    description:
      "Integrated pulse oximetry and heart-rate monitor biosensor module with dual LEDs (Red + Infrared) and photodetector.",
    specs: {
      Wavelengths: "660nm (Red) & 880nm (IR)",
      Interface: "I2C Interface",
      SupplyVoltage: "1.8V - 5V",
    },
  },

  // =======================================================
  // 6. Single Board Computers & Dev Boards (10 Products)
  // =======================================================
  {
    id: "rpi-5-8gb",
    name: "Raspberry Pi 5 Model B (8GB RAM ARM Cortex-A76)",
    sku: "PRG-RPI-508",
    category: "Single Board Computers & Dev Boards",
    price: 8999,
    mrp: 10499,
    discount: "14% OFF",
    rating: 5.0,
    reviews: 189,
    inStock: true,
    badge: "NEW GENERATION",
    image:
      "https://images.unsplash.com/photo-1608564697071-ddf911d81370?auto=format&fit=crop&w=600&q=80",
    description:
      "Next-gen single board computer delivering up to 3x performance with 2.4GHz quad-core 64-bit Arm Cortex-A76 CPU.",
    specs: {
      RAM: "8GB LPDDR4X",
      CPU: "Quad-Core 2.4GHz",
      Display: "Dual 4K60 HDMI",
      PCI: "PCIe 2.0 interface",
    },
  },
  {
    id: "rpi-4-4gb",
    name: "Raspberry Pi 4 Model B (4GB RAM Dual 4K Output)",
    sku: "PRG-RPI-404",
    category: "Single Board Computers & Dev Boards",
    price: 5499,
    mrp: 6499,
    discount: "15% OFF",
    rating: 4.9,
    reviews: 450,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1608564697071-ddf911d81370?auto=format&fit=crop&w=600&q=80",
    description:
      "Versatile quad-core computer for AI, home servers, and Linux desktop development.",
    specs: {
      RAM: "4GB LPDDR4",
      CPU: "Quad-Core 1.5GHz",
      USB: "2x USB 3.0 + 2x USB 2.0",
    },
  },
  {
    id: "rpi-zero-2w",
    name: "Raspberry Pi Zero 2 W Quad-Core 1GHz Wi-Fi + BLE",
    sku: "PRG-RPI-510",
    category: "Single Board Computers & Dev Boards",
    price: 1899,
    mrp: 2399,
    discount: "20% OFF",
    rating: 4.8,
    reviews: 240,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1608564697071-ddf911d81370?auto=format&fit=crop&w=600&q=80",
    description:
      "Ultra-compact single board computer featuring a quad-core 64-bit Arm Cortex-A53 processor and wireless connectivity.",
    specs: {
      CPU: "Quad-Core 1GHz 64-bit",
      RAM: "512MB LPDDR2",
      Dimensions: "65 x 30 mm",
    },
  },
  {
    id: "jetson-orin-nano",
    name: "NVIDIA Jetson Orin Nano Developer Kit (40 TOPS AI)",
    sku: "PRG-RPI-509",
    category: "Single Board Computers & Dev Boards",
    price: 49999,
    mrp: 56000,
    discount: "10% OFF",
    rating: 5.0,
    reviews: 65,
    inStock: false,
    badge: "AI EDGE SPEC",
    variants: [
      {
        id: "v-8gb",
        name: "8GB Dev Kit (Out of Stock)",
        sku: "PRG-RPI-509-8G",
        price: 49999,
        mrp: 56000,
        inStock: false,
      },
      {
        id: "v-16gb",
        name: "16GB AI Industrial Kit",
        sku: "PRG-RPI-509-16G",
        price: 68999,
        mrp: 74999,
        inStock: true,
      },
    ],
    image:
      "https://images.unsplash.com/photo-1608564697071-ddf911d81370?auto=format&fit=crop&w=600&q=80",
    description:
      "Supercharge entry-level edge AI applications with up to 40 TOPS of AI performance.",
    specs: {
      AI: "40 TOPS",
      GPU: "1024-core Ampere",
      RAM: "8GB 128-bit LPDDR5",
    },
  },
  {
    id: "stm32-nucleo-f401",
    name: "STM32 Nucleo-64 F401RE ARM Cortex-M4 Development Board",
    sku: "PRG-RPI-511",
    category: "Single Board Computers & Dev Boards",
    price: 1850,
    mrp: 2400,
    discount: "22% OFF",
    rating: 4.9,
    reviews: 82,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1608564697071-ddf911d81370?auto=format&fit=crop&w=600&q=80",
    description:
      "Affordable and flexible evaluation platform featuring an STM32F401RET6 MCU with ST-LINK/V2-1 debugger on board.",
    specs: {
      Core: "84MHz ARM Cortex-M4 with FPU",
      Flash: "512KB",
      Connectivity: "Arduino Uno V3 Headers",
    },
  },
  {
    id: "orange-pi-5-8gb",
    name: "Orange Pi 5 RK3588S 8-Core 8GB RAM Single Board Computer",
    sku: "PRG-RPI-512",
    category: "Single Board Computers & Dev Boards",
    price: 8499,
    mrp: 10200,
    discount: "16% OFF",
    rating: 4.8,
    reviews: 70,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1608564697071-ddf911d81370?auto=format&fit=crop&w=600&q=80",
    description:
      "High-end 8K video output SBC powered by Rockchip RK3588S 8-core 64-bit processor with 6 TOPS NPU for edge computing.",
    specs: {
      Processor: "RK3588S 8-core up to 2.4GHz",
      NPU: "6 TOPS AI",
      Video: "8K@60fps HDMI 2.1",
    },
  },
  {
    id: "beaglebone-black-c",
    name: "BeagleBone Black Rev C Industrial Linux Development Board",
    sku: "PRG-RPI-513",
    category: "Single Board Computers & Dev Boards",
    price: 6200,
    mrp: 7500,
    discount: "17% OFF",
    rating: 4.8,
    reviews: 55,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1608564697071-ddf911d81370?auto=format&fit=crop&w=600&q=80",
    description:
      "Industrial-proven open hardware computer based on TI AM3358 with dual 200MHz PRU real-time coprocessors.",
    specs: {
      CPU: "1GHz AM335x ARM Cortex-A8",
      eMMC: "4GB 8-bit Onboard",
      PRU: "Dual 32-bit 200MHz PRUs",
    },
  },
  {
    id: "teensy-41-usb",
    name: "Teensy 4.1 USB Microcontroller Development Board (600MHz)",
    sku: "PRG-RPI-514",
    category: "Single Board Computers & Dev Boards",
    price: 3499,
    mrp: 4200,
    discount: "16% OFF",
    rating: 5.0,
    reviews: 90,
    inStock: true,
    badge: "SUPER FAST",
    image:
      "https://images.unsplash.com/photo-1608564697071-ddf911d81370?auto=format&fit=crop&w=600&q=80",
    description:
      "Blazing fast 600MHz ARM Cortex-M7 board with Ethernet PHY, SD card socket, and 55 I/O pins.",
    specs: {
      Clock: "600MHz ARM Cortex-M7",
      RAM: "1024K RAM (512K tightly coupled)",
      Ethernet: "10/100Mbit PHY",
    },
  },
  {
    id: "seeed-xiao-rp2040",
    name: "Seeed Studio XIAO RP2040 Dual-Core Cortex-M0+ Mini Board",
    sku: "PRG-RPI-515",
    category: "Single Board Computers & Dev Boards",
    price: 499,
    mrp: 750,
    discount: "33% OFF",
    rating: 4.9,
    reviews: 140,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1608564697071-ddf911d81370?auto=format&fit=crop&w=600&q=80",
    description:
      "Thumb-sized development board with Raspberry Pi RP2040 dual-core chip, RGB user LED, and Type-C port.",
    specs: {
      Dimensions: "20 x 17.5 mm",
      CPU: "Dual-core 133MHz RP2040",
      SRAM: "264KB",
      Interface: "USB Type-C",
    },
  },
  {
    id: "esp32-s3-box",
    name: "ESP32-S3-BOX AI Voice & Touch Interactive Dev Kit",
    sku: "PRG-RPI-516",
    category: "Single Board Computers & Dev Boards",
    price: 3899,
    mrp: 4800,
    discount: "18% OFF",
    rating: 4.9,
    reviews: 48,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1608564697071-ddf911d81370?auto=format&fit=crop&w=600&q=80",
    description:
      "All-in-one AI development kit featuring a 2.4-inch capacitive touch screen, dual microphones with noise cancellation, and offline speech recognition.",
    specs: {
      Display: "2.4 inch 320x240 Touch",
      Audio: "Dual Mics + Speaker",
      AI: "Offline Voice Recognition",
    },
  },

  // ==========================================
  // 7. STEM & Educational Kits (10 Products)
  // ==========================================
  {
    id: "stem-atl-mega-kit",
    name: "Atal Tinkering Lab (ATL) Official STEM Innovation Starter Kit",
    sku: "PRG-STM-701",
    category: "STEM & Educational Kits",
    price: 6499,
    mrp: 8999,
    discount: "27% OFF",
    rating: 5.0,
    reviews: 168,
    inStock: true,
    badge: "ATL APPROVED",
    image:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80",
    description:
      "Government ATL compliant mega tinkering curriculum kit with 50+ sensors, Arduino boards, breadboards, motors, and step-by-step project guide book.",
    specs: {
      Curriculum: "ATL NITI Aayog Compliant",
      Experiments: "45+ Hands-on Projects",
      Storage: "Heavy Duty Plastic Organiser Box",
    },
  },
  {
    id: "diy-solar-car-kit",
    name: "DIY Solar Powered Engineering Robotic Vehicle Kit",
    sku: "PRG-STM-702",
    category: "STEM & Educational Kits",
    price: 899,
    mrp: 1299,
    discount: "30% OFF",
    rating: 4.8,
    reviews: 310,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80",
    description:
      "Educational clean energy science toy teaching solar photovoltaic principles, gear mechanics, and electrical assembly.",
    specs: {
      Power: "High-Efficiency Polycrystalline Solar Panel",
      Age: "8+ Years",
      Assembly: "No Soldering Required",
    },
  },
  {
    id: "smart-city-stem-kit",
    name: "Smart Automated City IoT School Demonstration Kit",
    sku: "PRG-STM-703",
    category: "STEM & Educational Kits",
    price: 3299,
    mrp: 4500,
    discount: "26% OFF",
    rating: 4.9,
    reviews: 95,
    inStock: true,
    badge: "TOP RATED",
    image:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80",
    description:
      "Interactive smart urban ecosystem model featuring automated streetlights, rain sensor gates, RFID parking, and fire alarm simulation.",
    specs: {
      Components: "RFID, Soil Moisture, LDR, Servos, Buzzer",
      Architecture: "Precision Cut MDF Board Model",
    },
  },
  {
    id: "hydraulic-arm-wood",
    name: "DIY Hydraulic Mechanical Excavator Wood Assembly Kit",
    sku: "PRG-STM-704",
    category: "STEM & Educational Kits",
    price: 699,
    mrp: 999,
    discount: "30% OFF",
    rating: 4.7,
    reviews: 215,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80",
    description:
      "Hands-on Pascal law demonstration kit using water syringes to actuate a 3-axis mechanical digger arm.",
    specs: {
      Principle: "Fluid Mechanics & Pascal Law",
      Material: "Laser-Cut Birch Plywood",
      Actuation: "4-Chamber Water Syringes",
    },
  },
  {
    id: "snap-circuits-lab",
    name: "Electronic Snap Circuits Exploration Lab Kit (100+ Experiments)",
    sku: "PRG-STM-705",
    category: "STEM & Educational Kits",
    price: 1899,
    mrp: 2600,
    discount: "26% OFF",
    rating: 4.9,
    reviews: 420,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80",
    description:
      "Snap-together electronic circuits teaching resistors, transistors, speakers, flying saucers, and light-activated alarms safely without tools.",
    specs: {
      Projects: "100+ Safe Snap Circuit Projects",
      Parts: "30+ Snap-together Modules",
      Safety: "Safe 3V Battery Powered",
    },
  },
  {
    id: "wind-turbine-stem",
    name: "DIY Mini Wind Turbine Power Generator Educational Kit",
    sku: "PRG-STM-706",
    category: "STEM & Educational Kits",
    price: 799,
    mrp: 1199,
    discount: "33% OFF",
    rating: 4.7,
    reviews: 140,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80",
    description:
      "Working aerodynamic wind turbine generator with multi-color LED voltage meter showing renewable energy generation.",
    specs: {
      Generator: "3-Phase AC Mini Generator with Rectifier",
      Blades: "3-Blade Aerodynamic Rotor",
      Output: "5V USB Regulated",
    },
  },
  {
    id: "line-follower-diy",
    name: "Analog Line Follower Robot Soldering & Assembly Kit",
    sku: "PRG-STM-707",
    category: "STEM & Educational Kits",
    price: 599,
    mrp: 899,
    discount: "33% OFF",
    rating: 4.8,
    reviews: 260,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80",
    description:
      "Classic LM393 dual comparator line-following robot kit ideal for teaching PCB soldering and optical reflection principles.",
    specs: {
      IC: "LM393 Voltage Comparator",
      Sensors: "Dual Phototransistors",
      Track: "Track mat included",
    },
  },
  {
    id: "bluetooth-rover-kit",
    name: "Bluetooth Smartphone-Controlled Smart Car DIY Student Kit",
    sku: "PRG-STM-708",
    category: "STEM & Educational Kits",
    price: 1999,
    mrp: 2799,
    discount: "28% OFF",
    rating: 4.8,
    reviews: 380,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80",
    description:
      "DIY two-wheel drive robotic vehicle controlled via Android Bluetooth app with obstacle-avoidance ultrasonic sensor.",
    specs: {
      Connectivity: "HC-05 Bluetooth",
      Microcontroller: "Arduino Nano Compatible",
      App: "Custom Android Controller App",
    },
  },
  {
    id: "iot-weather-station",
    name: "IoT Environmental Weather Station Cloud Logging DIY Kit",
    sku: "PRG-STM-709",
    category: "STEM & Educational Kits",
    price: 2799,
    mrp: 3800,
    discount: "26% OFF",
    rating: 4.9,
    reviews: 88,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80",
    description:
      "Build your own smart IoT weather station logging temperature, humidity, pressure, and rain data to ThingSpeak and Blynk cloud.",
    specs: {
      Controller: "ESP8266 NodeMCU",
      Cloud: "ThingSpeak & Blynk IoT Platform",
      Sensors: "BME280 + Rain Sensor + 0.96 OLED",
    },
  },
  {
    id: "piano-glove-stem",
    name: "Interactive Electronic Piano Glove Wearable Sound DIY Kit",
    sku: "PRG-STM-710",
    category: "STEM & Educational Kits",
    price: 999,
    mrp: 1450,
    discount: "31% OFF",
    rating: 4.6,
    reviews: 110,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80",
    description:
      "Fingertip touch sensor glove that plays musical notes on contact with any surface using frequency modulation.",
    specs: {
      Sensors: "5x Conductive Fingertip Sensors",
      Speaker: "8 Ohm Mini Buzzer",
      Power: "9V Battery Clip",
    },
  },

  // ==========================================
  // 8. Motors, Steppers & Drivers (10 Products)
  // ==========================================
  {
    id: "nema17-stepper-59ncm",
    name: "NEMA 17 High Torque Bipolar Stepper Motor (59 Ncm 1.8°)",
    sku: "PRG-MOT-801",
    category: "Motors, Steppers & Drivers",
    price: 899,
    mrp: 1299,
    discount: "30% OFF",
    rating: 4.9,
    reviews: 340,
    inStock: true,
    badge: "BESTSELLER",
    image:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80",
    description:
      "High precision 4-wire bipolar stepper motor engineered for 3D printers, CNC laser cutters, and robotics.",
    specs: {
      HoldingTorque: "59 Ncm (83.6 oz.in)",
      StepAngle: "1.8 deg",
      RatedCurrent: "2.0A / Phase",
      Shaft: "5mm D-Cut",
    },
  },
  {
    id: "tb6600-stepper-driver",
    name: "TB6600 4A 9-42V Microstepping Stepper Motor Driver",
    sku: "PRG-MOT-802",
    category: "Motors, Steppers & Drivers",
    price: 649,
    mrp: 950,
    discount: "31% OFF",
    rating: 4.8,
    reviews: 215,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80",
    description:
      "Heavy duty CNC stepper motor driver with optocoupler high-speed isolation and up to 32 microstep resolution.",
    specs: {
      CurrentRange: "0.5A - 4.0A",
      SupplyVoltage: "9V - 42V DC",
      Microsteps: "1, 2/A, 2/B, 4, 8, 16, 32",
    },
  },
  {
    id: "a4988-driver-carrier",
    name: "A4988 Stepper Motor Driver Carrier Module with Heat Sink",
    sku: "PRG-MOT-803",
    category: "Motors, Steppers & Drivers",
    price: 120,
    mrp: 199,
    discount: "39% OFF",
    rating: 4.7,
    reviews: 680,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80",
    description:
      "Compact microstepping motor driver with built-in translator for easy operation with RAMPS 1.4 and CNC shields.",
    specs: {
      Microstep: "Full, 1/2, 1/4, 1/8, and 1/16",
      MaxCurrent: "2A with cooling",
      LogicVoltage: "3V - 5.5V",
    },
  },
  {
    id: "rs775-high-speed-motor",
    name: "RS-775 12V 10000RPM High Speed High Torque DC Motor",
    sku: "PRG-MOT-804",
    category: "Motors, Steppers & Drivers",
    price: 699,
    mrp: 1050,
    discount: "33% OFF",
    rating: 4.8,
    reviews: 410,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80",
    description:
      "Ball-bearing robust 775 DC motor engineered for DIY drill presses, CNC spindles, and heavy combat robotics.",
    specs: {
      Speed: "10,000 RPM at 12V",
      Voltage: "12V - 24V DC",
      ShaftDiameter: "5mm Round Shaft",
      Cooling: "Built-in Fan",
    },
  },
  {
    id: "planetary-dc-motor-12v",
    name: "12V High Torque Planetary Gearhead DC Motor with Encoder",
    sku: "PRG-MOT-805",
    category: "Motors, Steppers & Drivers",
    price: 1499,
    mrp: 2199,
    discount: "31% OFF",
    rating: 4.9,
    reviews: 95,
    inStock: true,
    badge: "PRO ROBOTICS",
    image:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80",
    description:
      "All-metal planetary gearbox DC motor with dual-channel magnetic Hall encoder for closed-loop velocity control.",
    specs: {
      GearRatio: "1:50 Planetary",
      StallTorque: "18 kg.cm",
      Encoder: "Hall 334 PPR dual channel",
    },
  },
  {
    id: "l298n-dual-hbridge",
    name: "L298N Dual H-Bridge DC & Stepper Motor Driver Module",
    sku: "PRG-MOT-806",
    category: "Motors, Steppers & Drivers",
    price: 189,
    mrp: 320,
    discount: "40% OFF",
    rating: 4.7,
    reviews: 890,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80",
    description:
      "Classic dual full-bridge driver chip designed to drive two DC motors or one 4-wire bipolar stepper motor.",
    specs: {
      Driver: "L298N Dual H Bridge",
      PeakCurrent: "2A per bridge",
      DriverVoltage: "5V - 35V DC",
    },
  },
  {
    id: "pca9685-pwm-driver",
    name: "PCA9685 16-Channel 12-bit PWM I2C Servo Shield Driver",
    sku: "PRG-MOT-807",
    category: "Motors, Steppers & Drivers",
    price: 349,
    mrp: 550,
    discount: "36% OFF",
    rating: 4.9,
    reviews: 280,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80",
    description:
      "Drive up to 16 servos simultaneously with free-running 12-bit PWM control using only 2 I2C pins from any microcontroller.",
    specs: {
      Channels: "16 PWM Outputs",
      Resolution: "12-bit (4096 steps)",
      Frequency: "40Hz - 1000Hz",
      Interface: "I2C Interface",
    },
  },
  {
    id: "stepper-28byj48-uln",
    name: "28BYJ-48 5V Stepper Motor + ULN2003 Driver Board Kit",
    sku: "PRG-MOT-808",
    category: "Motors, Steppers & Drivers",
    price: 169,
    mrp: 270,
    discount: "37% OFF",
    rating: 4.6,
    reviews: 540,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80",
    description:
      "Beginner-friendly 5V 4-phase geared stepper motor with 4-channel LED state indicator board.",
    specs: {
      StrideAngle: "5.625° / 64",
      ReductionRatio: "1:64",
      OperatingVoltage: "5V DC",
    },
  },
  {
    id: "ga12-n20-gearmotor",
    name: "GA12-N20 Micro Metal Gear Motor 6V 100RPM",
    sku: "PRG-MOT-809",
    category: "Motors, Steppers & Drivers",
    price: 220,
    mrp: 350,
    discount: "37% OFF",
    rating: 4.8,
    reviews: 310,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80",
    description:
      "Miniature precision steel gearbox motor perfect for micro sumo robots, electronic door locks, and DIY rovers.",
    specs: {
      Speed: "100 RPM at 6V",
      Shaft: "3mm D-Type Shaft",
      GearMaterial: "Full Carbon Steel Gears",
    },
  },
  {
    id: "vnh2sp30-monster-shield",
    name: "Monster Moto Shield 30A Dual VNH2SP30 Motor Driver",
    sku: "PRG-MOT-810",
    category: "Motors, Steppers & Drivers",
    price: 899,
    mrp: 1400,
    discount: "35% OFF",
    rating: 4.8,
    reviews: 120,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80",
    description:
      "Extreme high-current dual motor driver shield capable of driving a pair of heavy high-power DC motors up to 30A continuous.",
    specs: {
      MaxVoltage: "16V DC",
      PeakCurrent: "30A per channel",
      Protection: "Thermal Shutdown & Under-Voltage",
    },
  },
];

export const SOLUTIONS: Solution[] = [
  {
    id: "industrial-robotics",
    title: "Industrial Robotics Automation",
    category: "Automation & Manufacturing",
    description:
      "Collaborative robotic arms, AGVs, and custom end-effectors designed for high-precision manufacturing.",
    image:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80",
    highlights: [
      "6-Axis Manipulators",
      "Safety Torque Sensors",
      "PLC & ROS Integration",
    ],
  },
  {
    id: "educational-robotics",
    title: "Turnkey Educational STEM Labs",
    category: "STEM & Institutional",
    description:
      "Turnkey robotics lab setups for schools, colleges, and polytechnics with complete curriculum manuals.",
    image:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
    highlights: [
      "Curriculum Aligned",
      "Teacher Training Included",
      "Multi-level DIY Hardware",
    ],
  },
  {
    id: "drone-technology",
    title: "UAV Aerial Surveillance & Mapping",
    category: "Aerial Systems",
    description:
      "Custom UAV platforms for agricultural mapping, surveillance, payload delivery, and aerial inspection.",
    image:
      "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80",
    highlights: [
      "Autonomous Waypoint Navigation",
      "Thermal/RGB Gimbal Payload",
      "DGCA Compliant Frames",
    ],
  },
  {
    id: "ai-vision-systems",
    title: "Edge AI Machine Vision Systems",
    category: "Intelligent Edge",
    description:
      "Embedded edge AI vision solutions powered by NVIDIA Jetson for real-time quality check & object detection.",
    image:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
    highlights: [
      "Deep Learning Models",
      "4K Stereo Vision",
      "Sub-10ms Inference Latency",
    ],
  },
];

export const INDUSTRIES: Industry[] = [
  {
    id: "edu",
    title: "Education & STEM Academics",
    description:
      "Empowering 500+ STEM labs and university research departments.",
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "mfg",
    title: "Smart Factory Manufacturing",
    description:
      "Smart factory automation and custom robotic arm integrations.",
    image:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "rd",
    title: "Research & Defense Labs",
    description:
      "Prototyping boards and precision sensors for defense & tech labs.",
    image:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "def",
    title: "Defense & Tactical Drone UAV",
    description:
      "Ruggedized electronics, flight telemetry, and tactical drone components.",
    image:
      "https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "agri",
    title: "Smart Agriculture & Soil IoT",
    description:
      "IoT soil monitoring sensors and automated agricultural drones.",
    image:
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "auto",
    title: "Industrial Mechatronics",
    description:
      "Motor controllers, encoders, and pneumatic automation valves.",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "health",
    title: "Healthcare & Surgical Robotics",
    description:
      "Precision actuators and bio-sensing modules for medical tech.",
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "train",
    title: "Industrial Skill Certification",
    description:
      "Vocational skill development kits for mechatronics & robotics certification.",
    image:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80",
  },
];

export const LEARNING_HUB: LearningItem[] = [
  {
    id: "tut-1",
    category: "Tutorials",
    title: "Getting Started with ESP32 & FreeRTOS for IoT",
    level: "Beginner to Intermediate",
    duration: "45 mins read",
    description:
      "Learn step-by-step how to configure multi-tasking routines on dual-core ESP32 boards.",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "proj-1",
    category: "Projects",
    title: "Building an Autonomous Obstacle Avoidance Rover",
    level: "Intermediate",
    duration: "2 Hours build",
    description:
      "Complete circuit schematics, chassis assembly guide, and Arduino C++ source code.",
    image:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "course-1",
    category: "Courses",
    title: "ROS 2 (Robot Operating System) Masterclass",
    level: "Advanced",
    duration: "12 Modules",
    description:
      "Master publisher/subscriber nodes, TF2 transforms, and Nav2 navigation stacks.",
    image:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "ws-1",
    category: "Workshops",
    title: "Hands-on Quadcopter Flight Dynamics & PID Tuning",
    level: "Intermediate",
    duration: "Live Weekend",
    description:
      "Interactive workshop with Dilay Robotics engineers covering flight telemetry and safety tuning.",
    image:
      "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=600&q=80",
  },
];

export const TESTIMONIALS = [
  {
    id: "1",
    name: "Dr. Rajesh Vardhan",
    role: "Head of Robotics Lab",
    institution: "IIT Delhi",
    rating: 5,
    comment:
      "Prayog India delivers authentic microcontrollers and sensors with unmatched quality and speedy delivery. Their technical documentation for research labs is top notch.",
    product: "Raspberry Pi 5 & Jetson Orin",
  },
  {
    id: "2",
    name: "Ananya Sharma",
    role: "Lead Systems Engineer",
    institution: "AeroTech Dynamics",
    rating: 5,
    comment:
      "The Pixhawk flight controllers and BLDC drone motors supplied for our autonomous surveillance drone fleet exceeded our durability requirements under field tests.",
    product: "Pixhawk 6C & Drone Motors",
  },
  {
    id: "3",
    name: "Vikram Singh",
    role: "STEM Educator & Director",
    institution: "Innovate Academy",
    rating: 5,
    comment:
      "We equipped 12 school robotics labs using Prayog India Dilay-Bot kits. Students love the clear tutorials and hands-on assembly modules!",
    product: "Dilay-Bot 4WD STEM Kits",
  },
];
