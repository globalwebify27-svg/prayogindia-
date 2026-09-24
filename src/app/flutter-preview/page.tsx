"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Mic,
  Bell,
  Heart,
  User,
  ChevronRight,
  Sparkles,
  Zap,
  ShoppingBag,
  ShoppingCart,
  Bot,
  Flame,
  Star,
  Home,
  Grid,
  ArrowRight,
  Cpu,
  Plane,
  Radio,
  FlaskConical,
  Settings,
  Plus,
  Minus,
  Trash2,
  X,
  CheckCircle2,
  Package,
  MapPin,
  Clock,
  ShieldCheck,
  CreditCard,
  ArrowLeft,
  Share2,
  Check,
} from "lucide-react";

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  catId: string;
  rating: number;
  reviews: string;
  price: number;
  mrp: number;
  discount: string;
  image: string;
  images?: string[];
  videoUrl?: string;
  media360?: string[];
  brand?: string;
  sku?: string;
  stockCount?: number;
  features?: string[];
  specs?: Record<string, string>;
  documents?: { title: string; type: string; url: string }[];
  description: string;
  inStock: boolean;
}

export interface CartItem extends ProductItem {
  quantity: number;
}

export default function FlutterPreviewPage() {
  const [activeBottomNav, setActiveBottomNav] = useState(0); // 0: Home, 1: Categories, 2: Cart, 3: Wishlist, 4: Account
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(
    null,
  );
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [ordersModalOpen, setOrdersModalOpen] = useState(false);
  const [gstModalOpen, setGstModalOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "upi" | "card" | "cod"
  >("upi");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [userOrders, setUserOrders] = useState([
    {
      id: "PRG-ORD-98421",
      date: "Today, 2:15 PM",
      status: "Out for Delivery (Hub Patna)",
      statusColor: "text-blue-600 bg-blue-50 border-blue-200",
      total: 3998,
      items: ["Arduino Starter Kit (45+ Sensors)", "ESP32 Wi-Fi + Bluetooth"],
    },
    {
      id: "PRG-ORD-87102",
      date: "04 Sep 2026",
      status: "Delivered (OTP Verified)",
      statusColor: "text-emerald-600 bg-emerald-50 border-emerald-200",
      total: 12499,
      items: ["FPV Racing Drone Kit (2300KV)"],
    },
    {
      id: "PRG-ORD-76290",
      date: "28 Aug 2026",
      status: "Delivered (Store Kiosk Pickup)",
      statusColor: "text-emerald-600 bg-emerald-50 border-emerald-200",
      total: 44999,
      items: ["Jetson Orin Nano 8GB Kit"],
    },
  ]);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [activeNewArrivalIndex, setActiveNewArrivalIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Cart & Wishlist State
  const [cart, setCart] = useState<CartItem[]>([
    {
      id: "ard-uno",
      name: "Arduino UNO R3 Official Board",
      category: "ARDUINO",
      catId: "arduino",
      rating: 4.8,
      reviews: "1.2k",
      price: 1499,
      mrp: 1999,
      discount: "25% OFF",
      image:
        "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=400&q=80",
      description:
        "Official ATmega328P Rev3 microcontroller board for robotics and STEM prototyping.",
      inStock: true,
      quantity: 1,
    },
    {
      id: "esp-32",
      name: "ESP32 Wi-Fi + Bluetooth Dual-Core Board",
      category: "DEV BOARDS",
      catId: "devboards",
      rating: 4.7,
      reviews: "762",
      price: 449,
      mrp: 699,
      discount: "35% OFF",
      image:
        "https://images.unsplash.com/photo-1608564697071-ddf911d81370?auto=format&fit=crop&w=400&q=80",
      description:
        "High performance NodeMCU-32S IoT development module with dual Xtensa LX6 processors.",
      inStock: true,
      quantity: 1,
    },
  ]);

  const [wishlist, setWishlist] = useState<Record<string, boolean>>({
    "rpi-4": true,
    "fpv-quad": true,
  });

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  const addToCart = (product: ProductItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    triggerToast(`Added ${product.name} to Cart`);
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart(
      (prev) =>
        prev
          .map((item) => {
            if (item.id === id) {
              const newQty = item.quantity + delta;
              return newQty > 0 ? { ...item, quantity: newQty } : null;
            }
            return item;
          })
          .filter(Boolean) as CartItem[],
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    triggerToast("Item removed from cart");
  };

  const toggleWish = (product: ProductItem) => {
    setWishlist((prev) => {
      const nextState = !prev[product.id];
      triggerToast(nextState ? `Saved to Wishlist` : `Removed from Wishlist`);
      return { ...prev, [product.id]: nextState };
    });
  };

  const categories = [
    {
      id: "drones",
      name: "Drones",
      icon: Plane,
      bg: "bg-blue-50/70 text-[#005CA9] border-blue-200/70 hover:bg-blue-100/60",
    },
    {
      id: "devboards",
      name: "Dev Boards",
      icon: Cpu,
      bg: "bg-blue-50/70 text-[#005CA9] border-blue-200/70 hover:bg-blue-100/60",
    },
    {
      id: "arduino",
      name: "Arduino",
      icon: Bot,
      bg: "bg-blue-50/70 text-[#005CA9] border-blue-200/70 hover:bg-blue-100/60",
    },
    {
      id: "sensors",
      name: "Sensors",
      icon: Radio,
      bg: "bg-blue-50/70 text-[#005CA9] border-blue-200/70 hover:bg-blue-100/60",
    },
    {
      id: "stem",
      name: "Stem",
      icon: FlaskConical,
      bg: "bg-blue-50/70 text-[#005CA9] border-blue-200/70 hover:bg-blue-100/60",
    },
    {
      id: "motors",
      name: "Motors",
      icon: Settings,
      bg: "bg-blue-50/70 text-[#005CA9] border-blue-200/70 hover:bg-blue-100/60",
    },
  ];

  const allProducts: ProductItem[] = [
    {
      id: "ard-kit",
      name: "Arduino Starter Kit (45+ Sensors)",
      brand: "Arduino Official",
      sku: "PRG-ARD-KIT-01",
      category: "ROBOTICS & STEM",
      catId: "arduino",
      rating: 4.9,
      reviews: "1.4k",
      price: 2499,
      mrp: 3499,
      discount: "28% OFF",
      stockCount: 6,
      image:
        "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80",
      images: [
        "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1608564697071-ddf911d81370?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
      ],
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      description:
        "Complete hands-on STEM electronics lab kit with Arduino Uno, 45 sensors, LCD, and tutorial guide.",
      features: [
        "100% Genuine ATmega328P Board with USB Interface",
        "45+ Essential Sensor Modules (Ultrasonic, PIR, Gas, Sound, IR)",
        "16x2 I2C Character Display with Blue Backlight",
        "Comprehensive 120-Page Color Experiment Guide",
      ],
      specs: {
        Microcontroller: "ATmega328P 16MHz",
        "Operating Voltage": "5V DC",
        "Sensors Included": "45 Modules",
        Documentation: "PDF & Video Lab",
      },
      documents: [
        {
          title: "Arduino Starter Kit Lab Manual (PDF)",
          type: "PDF",
          url: "#",
        },
        {
          title: "Sensors Pinout & Circuit Schematic",
          type: "Schematic",
          url: "#",
        },
      ],
      inStock: true,
    },
    {
      id: "fpv-quad",
      name: "FPV Racing Drone Kit (2300KV)",
      brand: "Prayog AeroTech",
      sku: "PRG-UAV-FPV-01",
      category: "DRONES & UAV",
      catId: "drones",
      rating: 4.8,
      reviews: "890",
      price: 12499,
      mrp: 16999,
      discount: "26% OFF",
      stockCount: 4,
      image:
        "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80",
      images: [
        "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=600&q=80",
      ],
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      description:
        "Carbon fiber racing frame, 4x 2300KV motors, 30A 4-in-1 ESC and high-speed flight controller.",
      features: [
        "Ultra-light 3K Full Carbon Fiber Racing Frame",
        "4x EMAX RS2205 2300KV Brushless Motors",
        "SpeedyBee F405 V3 50A 4-in-1 Flight Controller Stack",
        "1000TVL Low Latency 4ms FPV Camera",
      ],
      specs: {
        "Frame Wheelbase": "220mm",
        "Battery Compatibility": "3-4S LiPo",
        "Flight Controller": "STM32F405 Betaflight",
        Weight: "340g (without battery)",
      },
      documents: [
        {
          title: "FPV Drone Assembly & Betaflight Tuning Guide",
          type: "Manual",
          url: "#",
        },
      ],
      inStock: true,
    },
    {
      id: "jet-nano",
      name: "Jetson Orin Nano 8GB Kit",
      brand: "NVIDIA",
      sku: "PRG-AI-JET-08",
      category: "AI COMPUTING",
      catId: "devboards",
      rating: 4.9,
      reviews: "640",
      price: 44999,
      mrp: 49999,
      discount: "10% OFF",
      stockCount: 3,
      image:
        "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=600&q=80",
      images: [
        "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
      ],
      description:
        "40 TOPS generative AI computing powerhouse for autonomous robots and vision AI pipelines.",
      features: [
        "40 TOPS AI Compute (NVIDIA Ampere Architecture with 1024 CUDA Cores)",
        "6-core Arm Cortex-A78AE v8.2 64-bit CPU",
        "8GB 128-bit LPDDR5 Memory @ 68 GB/s",
        "Full JetPack 5.x & JetPack 6.x Software Support",
      ],
      specs: {
        "AI Performance": "40 TOPS",
        Memory: "8GB LPDDR5",
        Display: "DisplayPort 1.2",
        PCIe: "PCIe Gen4 x4",
      },
      documents: [
        {
          title: "NVIDIA Jetson Orin Nano Hardware Reference (PDF)",
          type: "PDF",
          url: "#",
        },
      ],
      inStock: true,
    },
    {
      id: "rplidar",
      name: "RPLIDAR A1M8 360° Laser",
      brand: "Slamtec",
      sku: "PRG-SNS-RPL-01",
      category: "SENSORS & LIDAR",
      catId: "sensors",
      rating: 4.7,
      reviews: "412",
      price: 9250,
      mrp: 11500,
      discount: "20% OFF",
      stockCount: 5,
      image:
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
      description:
        "360 degree 12-meter range 2D laser LiDAR scanner sensor for SLAM navigation and mapping robots.",
      features: [
        "360° Omnidirectional Laser Range Scanning",
        "12-Meter Measurement Range Radius",
        "Up to 8000 Times Laser Sample Frequency",
        "ROS 1 & ROS 2 Driver Ready",
      ],
      specs: {
        "Distance Range": "0.15m - 12m",
        "Scan Rate": "5.5Hz - 10Hz",
        Interface: "UART Serial",
        "Supply Voltage": "5V DC",
      },
      documents: [
        {
          title: "Slamtec RPLIDAR A1 Protocol & SDK Manual",
          type: "PDF",
          url: "#",
        },
      ],
      inStock: true,
    },
    {
      id: "ard-uno",
      name: "Arduino UNO R3 Board",
      brand: "Arduino Official",
      sku: "PRG-ARD-001",
      category: "ARDUINO",
      catId: "arduino",
      rating: 4.8,
      reviews: "1.2k",
      price: 1499,
      mrp: 1999,
      discount: "25% OFF",
      stockCount: 15,
      image:
        "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80",
      images: [
        "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1608564697071-ddf911d81370?auto=format&fit=crop&w=600&q=80",
      ],
      description:
        "Industry standard ATmega328P 8-bit AVR microcontroller board with removable DIP socket.",
      features: [
        "Original ATmega328P Microchip with DIP Socket",
        "14 Digital I/O Pins & 6 Analog Inputs",
        "USB Type-B Interface & ICSP Header",
        "Standard 5V Logic Level",
      ],
      specs: {
        "Clock Speed": "16 MHz",
        "Flash Memory": "32 KB",
        SRAM: "2 KB",
        EEPROM: "1 KB",
      },
      documents: [
        {
          title: "Arduino UNO R3 Official Datasheet (PDF)",
          type: "PDF",
          url: "#",
        },
      ],
      inStock: true,
    },
    {
      id: "rpi-4",
      name: "Raspberry Pi 4 (8GB RAM)",
      category: "DEV BOARDS",
      catId: "devboards",
      rating: 4.9,
      reviews: "980",
      price: 7899,
      mrp: 9499,
      discount: "17% OFF",
      image:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80",
      description:
        "Quad-core Cortex-A72 processor, dual 4K micro HDMI outputs, Gigabit Ethernet, 8GB LPDDR4 RAM.",
      inStock: true,
    },
    {
      id: "esp-32",
      name: "ESP32 Wi-Fi + Bluetooth",
      category: "DEV BOARDS",
      catId: "devboards",
      rating: 4.7,
      reviews: "762",
      price: 449,
      mrp: 699,
      discount: "35% OFF",
      image:
        "https://images.unsplash.com/photo-1608564697071-ddf911d81370?auto=format&fit=crop&w=400&q=80",
      description:
        "Dual-core 240MHz Wi-Fi and Bluetooth MCU with ultra-low power coprocessor and rich GPIO.",
      inStock: true,
    },
    {
      id: "rob-arm",
      name: "6-DOF Robotic Arm Set",
      category: "ROBOTICS & STEM",
      catId: "stem",
      rating: 4.6,
      reviews: "543",
      price: 8999,
      mrp: 11999,
      discount: "25% OFF",
      image:
        "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=400&q=80",
      description:
        "All-metal robotic arm with 6 digital metal-gear servos, claw gripper, and controller board.",
      inStock: true,
    },
    {
      id: "pix-6c",
      name: "Pixhawk 6C Flight Controller",
      category: "DRONES & UAV",
      catId: "drones",
      rating: 4.5,
      reviews: "421",
      price: 18499,
      mrp: 22000,
      discount: "16% OFF",
      image:
        "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=400&q=80",
      description:
        "Next-gen autopilot flight controller for commercial and experimental drones powered by PX4/Ardupilot.",
      inStock: true,
    },
    {
      id: "bldc-kit",
      name: "BLDC 2205 + 30A ESC Set",
      category: "MOTORS & ESC",
      catId: "motors",
      rating: 4.8,
      reviews: "310",
      price: 1199,
      mrp: 1599,
      discount: "25% OFF",
      image:
        "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=400&q=80",
      description:
        "High-thrust 2300KV brushless motor with SimonK 30A speed controller for multirotors and quadcopters.",
      inStock: true,
    },
    {
      id: "ai-cam",
      name: "AI Smart Vision Sensor Kit",
      category: "SENSORS & AI",
      catId: "sensors",
      rating: 4.9,
      reviews: "198",
      price: 3799,
      mrp: 4999,
      discount: "24% OFF",
      image:
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=400&q=80",
      description:
        "On-device neural network camera sensor for face tracking, color detection, and shape classification.",
      inStock: true,
    },
    {
      id: "stepper-nema",
      name: "NEMA 17 Stepper + Driver",
      brand: "Prayog Motion",
      sku: "PRG-MTR-NEM-17",
      category: "MOTORS & DRIVERS",
      catId: "motors",
      rating: 4.7,
      reviews: "450",
      price: 750,
      mrp: 999,
      discount: "25% OFF",
      stockCount: 14,
      image:
        "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80",
      description:
        "High torque 1.8 degree bipolar stepper motor with A4988 microstepping driver board for 3D printers and CNCs.",
      features: [
        "1.8° Step Angle with 200 Steps per Revolution",
        "Holding Torque: 40 N.cm (56.6 oz.in)",
        "Includes A4988 Stepper Driver with Heat Sink",
        "Standard 4-Wire Bipolar Lead Wires",
      ],
      specs: {
        "Step Angle": "1.8°",
        "Rated Current": "1.5A/Phase",
        "Phase Resistance": "1.5 Ohms",
        "Shaft Diameter": "5mm D-Cut",
      },
      inStock: true,
    },
    {
      id: "rpi-5",
      name: "Raspberry Pi 5 (8GB RAM)",
      brand: "Raspberry Pi Official",
      sku: "PRG-DEV-RPI-05",
      category: "DEV BOARDS",
      catId: "devboards",
      rating: 5.0,
      reviews: "1.1k",
      price: 9499,
      mrp: 11999,
      discount: "21% OFF",
      stockCount: 8,
      image:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
      images: [
        "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1608564697071-ddf911d81370?auto=format&fit=crop&w=600&q=80",
      ],
      description:
        "2-3x faster Broadcom BCM2712 quad-core 2.4GHz Arm Cortex-A76 processor with dual 4Kp60 HDMI and PCIe 2.0 interface.",
      features: [
        "2.4GHz Quad-Core 64-bit Arm Cortex-A76 CPU with Cryptographic Extensions",
        "VideoCore VII GPU supporting OpenGL-ES 3.1 & Vulkan 1.2",
        "Dual 4Kp60 Micro-HDMI Display Outputs with HDR Support",
        "PCIe 2.0 x1 Interface for High-Speed NVMe Storage HATs",
      ],
      specs: {
        Processor: "Broadcom BCM2712 Quad 2.4GHz",
        RAM: "8GB LPDDR4X-4267",
        Wireless: "2.4/5GHz Wi-Fi + BT 5.0 BLE",
        "Power Delivery": "5V/5A USB-C PD",
      },
      documents: [
        {
          title: "Raspberry Pi 5 Datasheet & Pinout Diagram",
          type: "PDF",
          url: "#",
        },
      ],
      inStock: true,
    },
    {
      id: "mpu-6050",
      name: "MPU-6050 6-DOF Gyro & Accelerometer",
      brand: "TDK InvenSense",
      sku: "PRG-SNS-MPU-60",
      category: "SENSORS",
      catId: "sensors",
      rating: 4.8,
      reviews: "890",
      price: 189,
      mrp: 299,
      discount: "37% OFF",
      stockCount: 28,
      image:
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
      description:
        "Integrated 3-axis angular rate sensor (gyroscope) and 3-axis accelerometer with onboard Digital Motion Processor (DMP).",
      features: [
        "Tri-Axis Angular Rate Sensor (Gyro) with ±250 to ±2000°/sec Range",
        "Tri-Axis Accelerometer with ±2g to ±16g Programmable Range",
        "I2C Digital Output with Built-in 16-Bit ADCs",
        "Low Operating Current of 3.8mA",
      ],
      specs: {
        Communication: "I2C Interface (Up to 400kHz)",
        "Input Voltage": "3.3V - 5V DC (Onboard LDO)",
        "Gyro Sensitivity": "131 LSBs/°/sec",
        "Accel Sensitivity": "16384 LSB/g",
      },
      inStock: true,
    },
    {
      id: "hc-sr04",
      name: "HC-SR04 Ultrasonic Distance Sensor",
      brand: "Prayog Tech",
      sku: "PRG-SNS-HCS-04",
      category: "SENSORS",
      catId: "sensors",
      rating: 4.6,
      reviews: "1.5k",
      price: 99,
      mrp: 199,
      discount: "50% OFF",
      stockCount: 45,
      image:
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80",
      description:
        "Precision non-contact sonar ranging module offering 2cm to 400cm ranging accuracy with 3mm precision.",
      features: [
        "Ranging Distance: 2cm to 400cm Non-Contact Ranging",
        "Measuring Angle: 15 Degrees Cone",
        "Direct Arduino / Raspberry Pi 5V Logic Compatibility",
        "Complete Sonar Transmitter, Receiver and Control Circuitry",
      ],
      specs: {
        "Working Voltage": "5V DC",
        "Working Current": "15mA",
        "Effectual Angle": "< 15°",
        "Ranging Resolution": "0.3 cm",
      },
      inStock: true,
    },
    {
      id: "servo-sg90",
      name: "TowerPro SG90 9g Micro Servo (Pack of 4)",
      brand: "TowerPro",
      sku: "PRG-MTR-SG9-04",
      category: "MOTORS & DRIVERS",
      catId: "motors",
      rating: 4.7,
      reviews: "1.2k",
      price: 349,
      mrp: 599,
      discount: "42% OFF",
      stockCount: 30,
      image:
        "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80",
      description:
        "Lightweight high-output micro servo motor suitable for robot steering, pan-tilt cameras, and RC aircraft control surfaces.",
      features: [
        "High Speed 0.12 sec / 60 degrees @ 4.8V",
        "Stall Torque: 1.6 kg-cm @ 4.8V",
        "Includes Servo Horns, Mounting Screws, and Standard 3-Pin Cable",
        "Universal PWM Compatibility with Arduino, ESP32, and Raspberry Pi",
      ],
      specs: {
        Weight: "9g per servo",
        "Operating Voltage": "4.8V - 6.0V DC",
        "Dead Band Width": "7 us",
        "Rotation Angle": "180° Standard",
      },
      inStock: true,
    },
    {
      id: "lipo-4s-1500",
      name: "Tattu R-Line 4S 1500mAh 120C LiPo Battery",
      brand: "Tattu GensAce",
      sku: "PRG-BAT-TAT-4S",
      category: "DRONES & UAV",
      catId: "drones",
      rating: 4.9,
      reviews: "340",
      price: 2499,
      mrp: 3299,
      discount: "24% OFF",
      stockCount: 7,
      image:
        "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80",
      description:
        "Ultra-high discharge 120C LiPo battery pack engineered for high-performance FPV racing quads and heavy-lift UAVs.",
      features: [
        "True 120C High Discharge Rate for Instant Throttle Response",
        "High Energy Density with Lightweight Carbon Form Factor",
        "Pre-soldered XT60 Connector and JST-XH Balance Lead",
        "Low Internal Resistance (IR) Cells",
      ],
      specs: {
        Capacity: "1500mAh",
        Voltage: "14.8V (4S1P)",
        "Discharge Rate": "120C Burst 240C",
        Weight: "178g",
      },
      inStock: true,
    },
    {
      id: "flysky-i6x",
      name: "FlySky FS-i6X 10CH Transmitter + iA10B Receiver",
      brand: "FlySky Official",
      sku: "PRG-TX-FS-I6X",
      category: "DRONES & UAV",
      catId: "drones",
      rating: 4.8,
      reviews: "560",
      price: 4999,
      mrp: 6499,
      discount: "23% OFF",
      stockCount: 5,
      image:
        "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=600&q=80",
      description:
        "10-channel 2.4GHz AFHDS 2A digital proportional radio remote control system with telemetry receiver for drones and RC robots.",
      features: [
        "Automatic Frequency Hopping Digital System (AFHDS 2A)",
        "10-Channel PPM / i-BUS / PWM Output Support",
        "Backlit LCD Screen with Real-Time Voltage & Signal Telemetry",
        "Long Range Up to 1.5 km LOS Range",
      ],
      specs: {
        Channels: "10 Channels",
        "RF Range": "2.408 - 2.475 GHz",
        Bandwidth: "500 KHz",
        "Receiver Included": "FS-iA10B 10-Channel",
      },
      documents: [
        {
          title: "FlySky FS-i6X Manual & Firmware Guide",
          type: "PDF",
          url: "#",
        },
      ],
      inStock: true,
    },
    {
      id: "esp8266-nodemcu",
      name: "ESP8266 NodeMCU CP2102 Lua WiFi Board",
      brand: "Espressif Systems",
      sku: "PRG-DEV-ESP-82",
      category: "ARDUINO & DEV BOARDS",
      catId: "arduino",
      rating: 4.7,
      reviews: "2.1k",
      price: 289,
      mrp: 449,
      discount: "36% OFF",
      stockCount: 40,
      image:
        "https://images.unsplash.com/photo-1608564697071-ddf911d81370?auto=format&fit=crop&w=600&q=80",
      description:
        "Open-source IoT development platform with built-in Wi-Fi, CP2102 USB-to-UART chip, and full Arduino IDE support.",
      features: [
        "802.11 b/g/n Integrated Wi-Fi SoC with Tensilica L106 32-bit MCU",
        "Silicon Labs CP2102 Driver for Rock-Solid Flashing & Serial Debugging",
        "10 GPIOs with PWM, I2C, SPI, and 1 ADC Input",
        "Plug & Play Micro-USB Power and Programming",
      ],
      specs: {
        "Flash Memory": "4MB SPI Flash",
        "Clock Speed": "80MHz / 160MHz",
        "Operating Voltage": "3.3V (5V Tolerant USB)",
        "Wi-Fi Security": "WPA/WPA2 PSK",
      },
      inStock: true,
    },
    {
      id: "l298n-driver",
      name: "L298N Dual H-Bridge Motor Driver Module",
      brand: "Prayog Electronics",
      sku: "PRG-MTR-L29-8N",
      category: "MOTORS & DRIVERS",
      catId: "motors",
      rating: 4.6,
      reviews: "1.8k",
      price: 149,
      mrp: 249,
      discount: "40% OFF",
      stockCount: 50,
      image:
        "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80",
      description:
        "High power dual full-bridge driver designed to control 2 DC motors (speed and direction) or 1 bipolar 4-wire stepper motor.",
      features: [
        "Drives 2 DC Motors Bi-directionally or 1 Stepper Motor",
        "Peak Current: 2A per Bridge with Onboard Heat Sink",
        "Built-in 5V Regulator for Powering External Microcontroller",
        "Screw Terminal Blocks for Direct Battery & Motor Hookup",
      ],
      specs: {
        "Driver Chip": "ST L298N Dual H-Bridge",
        "Drive Voltage": "5V - 35V DC",
        "Logic Current": "0 - 36mA",
        "Max Power": "25W",
      },
      inStock: true,
    },
    {
      id: "bme280-sensor",
      name: "BME280 Temperature, Humidity & Barometric Sensor",
      brand: "Bosch Sensortec",
      sku: "PRG-SNS-BME-28",
      category: "SENSORS",
      catId: "sensors",
      rating: 4.9,
      reviews: "480",
      price: 499,
      mrp: 799,
      discount: "38% OFF",
      stockCount: 19,
      image:
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80",
      description:
        "Precision combined environmental sensor measuring barometric pressure (altitude calculation), ambient temperature, and humidity.",
      features: [
        "3-in-1 Environmental Sensing: Temp, Relative Humidity, Pressure",
        "High Altitude Accuracy: ±1 Meter Altitude Calculation",
        "Dual Interface Support: I2C (Up to 3.4MHz) and SPI (Up to 10MHz)",
        "Ultra-Low Current Consumption (3.6 uA @ 1Hz)",
      ],
      specs: {
        "Pressure Range": "300 - 1100 hPa",
        "Temp Range": "-40 to +85 °C",
        "Humidity Range": "0 - 100% RH",
        "Supply Voltage": "1.8V - 5V DC",
      },
      inStock: true,
    },
  ];

  const heroBanners = [
    {
      badge: "OFFICIAL PARTNER",
      title: "Arduino & Raspberry Pi",
      subtitle: "Build Your Ideas, Step by Step",
      buttonText: "Shop Now",
      image:
        "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80",
      gradient: "from-[#002B54] via-[#003B73] to-[#005CA9]",
      catTarget: "arduino",
    },
    {
      badge: "AUTOPILOT & FPV",
      title: "Drone Technology",
      subtitle: "Pixhawk 6C, BLDC Motors & ESCs",
      buttonText: "Explore Drones",
      image:
        "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80",
      gradient: "from-[#002B54] via-[#004B87] to-[#0072CE]",
      catTarget: "drones",
    },
    {
      badge: "AI & ROBOTICS",
      title: "Jetson Orin Nano AI",
      subtitle: "40 TOPS Generative AI for Robotics",
      buttonText: "Order Now",
      image:
        "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80",
      gradient: "from-[#001E3D] via-[#003B73] to-[#005CA9]",
      catTarget: "devboards",
    },
  ];

  const searchHints = [
    'Search "Arduino Uno, Mega, Nano..."',
    'Search "Raspberry Pi 4 & 5 Kits..."',
    'Search "BLDC Motors, ESCs & Servos..."',
    'Search "Sensors, Modules & Displays..."',
    'Search "Robotics Arms & Grippers..."',
    'Search "3D Printers & PLA Filaments..."',
    'Search "FPV Drones & Flight Controllers..."',
    'Search "LiPo Batteries & BMS Modules..."',
  ];
  const [searchHintIndex, setSearchHintIndex] = useState(0);

  // Auto rotate search hint placeholder index
  useEffect(() => {
    const hintTimer = setInterval(() => {
      setSearchHintIndex((prev) => (prev + 1) % searchHints.length);
    }, 3000);
    return () => clearInterval(hintTimer);
  }, [searchHints.length]);

  // Auto rotate banner
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % heroBanners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [heroBanners.length]);

  // Filtered products based on search and selected category
  const filteredProducts = allProducts.filter((p) => {
    const matchesCat =
      activeCategoryFilter === "all" || p.catId === activeCategoryFilter;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const cartTotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const cartTotalMRP = cart.reduce(
    (acc, item) => acc + item.mrp * item.quantity,
    0,
  );
  const cartSavings = cartTotalMRP - cartTotal;
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistedProducts = allProducts.filter((p) => wishlist[p.id]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-2 sm:py-6 font-sans select-none">
      {/* Device Indicator */}
      <div className="mb-2.5 flex items-center gap-2 text-xs text-slate-400 font-semibold">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 rounded-full border border-slate-700 text-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Prayog Native App Simulator
        </span>
      </div>

      {/* Main Mobile Device Container */}
      <div className="w-full max-w-[390px] h-[780px] bg-white rounded-[48px] shadow-[0_25px_70px_rgba(0,0,0,0.6)] overflow-hidden border-[8px] border-slate-800 relative flex flex-col ring-1 ring-white/10">
        {/* ========================================================= */}
        {/* APP HEADER */}
        {/* ========================================================= */}
        <div className="bg-gradient-to-b from-[#003B73] via-[#005CA9] to-[#0072CE] text-white px-5 pt-3 pb-3.5 shrink-0 shadow-md">
          {/* Status Bar */}
          <div className="flex justify-between items-center text-xs font-semibold pb-2.5">
            <span>11:46</span>
            <div className="w-20 h-3.5 bg-black/40 rounded-full mx-auto backdrop-blur-md hidden sm:block"></div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold">5G</span>
              <div className="w-4 h-2.5 border border-white rounded-[3px] p-[1px]">
                <div className="w-full h-full bg-white rounded-[1px]"></div>
              </div>
            </div>
          </div>

          {/* Logo & Actions */}
          <div className="flex items-center justify-between mb-3">
            <div
              onClick={() => {
                setActiveBottomNav(0);
                setActiveCategoryFilter("all");
                setSearchQuery("");
              }}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-white p-1 flex items-center justify-center shadow-md">
                <svg
                  viewBox="0 0 64 64"
                  fill="none"
                  className="w-full h-full text-[#00AEEF]"
                >
                  <line
                    x1="20"
                    y1="14"
                    x2="10"
                    y2="4"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <circle cx="9" cy="3" r="3.5" fill="currentColor" />
                  <line
                    x1="44"
                    y1="14"
                    x2="54"
                    y2="4"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <circle cx="55" cy="3" r="3.5" fill="currentColor" />
                  <rect
                    x="8"
                    y="14"
                    width="48"
                    height="34"
                    rx="9"
                    fill="currentColor"
                  />
                  <path
                    d="M 22 48 L 22 53 L 42 53 L 42 48 Z"
                    fill="currentColor"
                  />
                  <circle cx="22" cy="30" r="7.5" fill="white" />
                  <circle cx="22" cy="30" r="3.5" fill="#00AEEF" />
                  <circle cx="42" cy="30" r="7.5" fill="white" />
                  <circle cx="42" cy="30" r="3.5" fill="#00AEEF" />
                  <path
                    d="M22 41 Q32 45 42 41"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </div>
              <div>
                <div className="flex items-center text-lg font-black tracking-tight leading-none">
                  <span className="text-white">PRAYOG</span>
                  <span className="text-[#FFC20E] ml-1">INDIA</span>
                </div>
                <div className="text-[7.5px] text-cyan-100 font-bold tracking-widest uppercase mt-0.5">
                  HARDWARE & ROBOTICS
                </div>
              </div>
            </div>

            {/* Header Right Action Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition relative"
              >
                <Bell className="w-3.5 h-3.5" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#FFC20E] rounded-full"></span>
              </button>
              <button
                onClick={() => setActiveBottomNav(3)}
                className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition"
              >
                <Heart className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveBottomNav(4)}
                className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition"
              >
                <User className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Search Bar */}
          <div className="bg-white rounded-2xl h-10 px-3 flex items-center gap-2 shadow-md text-slate-800">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchHints[searchHintIndex]}
              className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
            />
            {searchQuery ? (
              <X
                onClick={() => setSearchQuery("")}
                className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              />
            ) : (
              <Mic className="w-3.5 h-3.5 text-slate-400 shrink-0 cursor-pointer" />
            )}
          </div>
        </div>

        {/* Notifications Dropdown Drawer */}
        {notificationOpen && (
          <div className="absolute top-[130px] inset-x-4 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
              <span className="text-xs font-black text-slate-900">
                Notifications (2)
              </span>
              <button
                onClick={() => setNotificationOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2 bg-blue-50 rounded-xl">
                <div className="font-bold text-blue-950 text-[11px]">
                  🎉 28% OFF on Arduino Kits
                </div>
                <div className="text-slate-600 text-[9.5px]">
                  Use code PRAYOG300 on checkout today.
                </div>
              </div>
              <div className="p-2 bg-emerald-50 rounded-xl">
                <div className="font-bold text-emerald-950 text-[11px]">
                  ⚡ 30 Min Kiosk Active
                </div>
                <div className="text-slate-600 text-[9.5px]">
                  Local pickup ready in Patna & Ranchi hubs.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MAIN BODY VIEWPORT (Changes with Bottom Nav Tabs) */}
        {/* ========================================================= */}
        <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50 flex flex-col">
          {/* TAB 0: HOME SCREEN */}
          {activeBottomNav === 0 && (
            <>
              {/* Category Filter Chips */}
              <div className="px-4 py-3 bg-white flex justify-between items-center shadow-2xs">
                {categories.map((cat) => {
                  const IconComp = cat.icon;
                  const isSelected = activeCategoryFilter === cat.id;
                  return (
                    <div
                      key={cat.id}
                      onClick={() =>
                        setActiveCategoryFilter(isSelected ? "all" : cat.id)
                      }
                      className="flex flex-col items-center gap-1 cursor-pointer group"
                    >
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-xs transition-all ${isSelected ? "bg-blue-600 text-white scale-105 border-blue-600 ring-2 ring-blue-400/40" : cat.bg}`}
                      >
                        <IconComp className="w-4.5 h-4.5" />
                      </div>
                      <span
                        className={`text-[9.5px] font-bold ${isSelected ? "text-blue-600" : "text-slate-700"}`}
                      >
                        {cat.name}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Active Filter Pill Bar (If selected) */}
              {activeCategoryFilter !== "all" && (
                <div className="px-4 py-1.5 bg-blue-50 flex items-center justify-between border-b border-blue-100">
                  <span className="text-[10px] font-bold text-blue-900">
                    Filtered by:{" "}
                    <span className="uppercase text-blue-600 font-extrabold">
                      {activeCategoryFilter}
                    </span>
                  </span>
                  <button
                    onClick={() => setActiveCategoryFilter("all")}
                    className="text-[9px] font-extrabold text-blue-600 bg-white px-2 py-0.5 rounded-full shadow-2xs border border-blue-200"
                  >
                    Clear Filter ✕
                  </button>
                </div>
              )}

              {/* Hero Banner Carousel Card */}
              {activeCategoryFilter === "all" && (
                <div className="px-4 mt-2.5">
                  <div
                    className={`rounded-3xl overflow-hidden shadow-lg text-white p-3.5 relative bg-gradient-to-r ${heroBanners[activeBannerIndex].gradient} transition-all duration-500`}
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <div className="max-w-[180px]">
                        <span className="bg-[#FFC20E] text-slate-950 text-[7.5px] font-black tracking-wider px-2 py-0.5 rounded-full uppercase inline-block mb-1 shadow-xs">
                          {heroBanners[activeBannerIndex].badge}
                        </span>
                        <h3 className="text-sm font-black leading-tight tracking-tight text-white mb-0.5">
                          {heroBanners[activeBannerIndex].title}
                        </h3>
                        <p className="text-[9.5px] text-slate-200 font-medium leading-relaxed mb-2.5">
                          {heroBanners[activeBannerIndex].subtitle}
                        </p>
                        <button
                          onClick={() =>
                            setActiveCategoryFilter(
                              heroBanners[activeBannerIndex].catTarget,
                            )
                          }
                          className="bg-white text-slate-900 text-[10px] font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1 hover:bg-slate-100 transition cursor-pointer"
                        >
                          <span>
                            {heroBanners[activeBannerIndex].buttonText}
                          </span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      </div>

                      <div className="w-[115px] h-[95px] rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl bg-slate-900/60 shrink-0">
                        <img
                          src={heroBanners[activeBannerIndex].image}
                          alt="Hero Product"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Banner Dots */}
                  <div className="flex justify-center gap-1 mt-1.5">
                    {heroBanners.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveBannerIndex(idx)}
                        className={`h-1.5 rounded-full transition-all ${
                          activeBannerIndex === idx
                            ? "w-4 bg-blue-600"
                            : "w-1.5 bg-slate-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 1: Featured STEM Deals Horizontal 3-Card Carousel */}
              <div className="px-4 mt-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
                    <span>Featured Deals</span>
                  </div>
                  <span className="text-[9px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    UP TO 40% OFF
                  </span>
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {allProducts.slice(0, 4).map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => setSelectedProduct(prod)}
                      className="w-[115px] bg-white rounded-2xl border border-slate-200/80 p-2 shrink-0 shadow-2xs flex flex-col justify-between group hover:border-blue-400 transition cursor-pointer"
                    >
                      <div className="relative mb-1">
                        <span className="absolute top-1 left-1 bg-rose-500 text-white text-[7px] font-black px-1 py-0.2 rounded shadow-xs z-10">
                          {prod.discount}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWish(prod);
                          }}
                          className="absolute top-1 right-1 p-1 bg-white/80 backdrop-blur-sm rounded-full shadow-2xs text-slate-400 hover:text-rose-500 z-10"
                        >
                          <Heart
                            className={`w-2.5 h-2.5 ${wishlist[prod.id] ? "fill-rose-500 text-rose-500" : ""}`}
                          />
                        </button>
                        <div className="w-full h-20 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center p-1">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition"
                          />
                        </div>
                      </div>

                      <div>
                        <span className="text-[7.5px] font-extrabold text-slate-400 uppercase tracking-wider line-clamp-1">
                          {prod.category}
                        </span>
                        <h4 className="text-[9.5px] font-bold text-slate-900 truncate mt-0.5">
                          {prod.name}
                        </h4>
                        <div className="flex items-center gap-1 mt-0.5 text-[8px] text-slate-500 font-semibold">
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          <span>{prod.rating}</span>
                          <span className="text-slate-400">
                            ({prod.reviews})
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-100">
                          <div>
                            <div className="text-[11px] font-black text-blue-600 leading-none">
                              ₹{prod.price}
                            </div>
                            <div className="text-[8px] text-slate-400 line-through leading-none mt-0.5">
                              ₹{prod.mrp}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(prod);
                            }}
                            className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center shadow-xs hover:bg-blue-700 transition"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 2: Trending STEM Hardware Horizontal Scroll */}
              <div className="mt-3.5 px-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                    <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                    <span>Trending STEM Hardware</span>
                  </div>
                  <button
                    onClick={() => setActiveBottomNav(1)}
                    className="text-xs font-extrabold text-blue-600 flex items-center gap-0.5 hover:underline"
                  >
                    <span>View All</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {allProducts.slice(4, 9).map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => setSelectedProduct(prod)}
                      className="w-[115px] bg-white rounded-2xl border border-slate-200/80 p-2 shrink-0 shadow-2xs flex flex-col justify-between group hover:border-blue-400 transition cursor-pointer"
                    >
                      <div className="relative mb-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWish(prod);
                          }}
                          className="absolute top-1 right-1 p-1 bg-white/80 backdrop-blur-sm rounded-full shadow-2xs text-slate-400 hover:text-rose-500 z-10"
                        >
                          <Heart
                            className={`w-2.5 h-2.5 ${wishlist[prod.id] ? "fill-rose-500 text-rose-500" : ""}`}
                          />
                        </button>
                        <div className="w-full h-18 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center p-1">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition"
                          />
                        </div>
                      </div>

                      <div>
                        <h4 className="text-[9.5px] font-bold text-slate-800 truncate">
                          {prod.name}
                        </h4>
                        <div className="flex items-center gap-1 mt-0.5 text-[8px] text-slate-500 font-semibold">
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          <span>{prod.rating}</span>
                          <span className="text-slate-400">
                            ({prod.reviews})
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-100">
                          <div className="text-[11px] font-black text-blue-600">
                            ₹{prod.price}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(prod);
                            }}
                            className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center shadow-xs hover:bg-blue-700 transition"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 3: New Arrivals Feature Banner + Bottom 3-Card Row */}
              <div className="px-4 mt-3.5 mb-4">
                <div className="bg-gradient-to-r from-[#005CA9] via-[#0072CE] to-[#00AEEF] text-white rounded-3xl p-3.5 flex items-center justify-between shadow-md relative overflow-hidden">
                  <div className="max-w-[170px] z-10">
                    <h4 className="text-xs font-black text-white leading-tight">
                      New Arrivals
                    </h4>
                    <p className="text-[9px] text-cyan-100 font-medium mt-0.5 mb-2">
                      Latest Kits & Components
                    </p>
                    <button
                      onClick={() => setActiveBottomNav(1)}
                      className="bg-[#FFC20E] text-slate-950 text-[9.5px] font-black px-3 py-1 rounded-full shadow flex items-center gap-1 cursor-pointer"
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  </div>

                  <div className="w-[110px] h-[70px] rounded-xl overflow-hidden border border-white/20 shadow-md bg-slate-900 shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=300&q=80"
                      alt="New arrivals"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Bottom 3-Card Row for New Arrivals */}
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                      <span>Just Launched in Store</span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-500">
                      Fast Dispatch
                    </span>
                  </div>

                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {allProducts.slice(8, 12).map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => setSelectedProduct(prod)}
                        className="w-[115px] bg-white rounded-2xl border border-slate-200/80 p-2 shrink-0 shadow-2xs flex flex-col justify-between group hover:border-blue-400 transition cursor-pointer"
                      >
                        <div className="relative mb-1">
                          <span className="absolute top-1 left-1 bg-emerald-500 text-white text-[7px] font-black px-1 py-0.2 rounded shadow-xs z-10">
                            {prod.discount}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWish(prod);
                            }}
                            className="absolute top-1 right-1 p-1 bg-white/80 backdrop-blur-sm rounded-full shadow-2xs text-slate-400 hover:text-rose-500 z-10"
                          >
                            <Heart
                              className={`w-2.5 h-2.5 ${wishlist[prod.id] ? "fill-rose-500 text-rose-500" : ""}`}
                            />
                          </button>
                          <div className="w-full h-18 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center p-1">
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition"
                            />
                          </div>
                        </div>

                        <div>
                          <span className="text-[7.5px] font-extrabold text-slate-400 uppercase tracking-wider line-clamp-1">
                            {prod.category}
                          </span>
                          <h4 className="text-[9.5px] font-bold text-slate-900 truncate mt-0.5">
                            {prod.name}
                          </h4>
                          <div className="flex items-center gap-1 mt-0.5 text-[8px] text-slate-500 font-semibold">
                            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                            <span>{prod.rating}</span>
                            <span className="text-slate-400">
                              ({prod.reviews})
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-100">
                            <div className="text-[11px] font-black text-blue-600 leading-none">
                              ₹{prod.price}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(prod);
                              }}
                              className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center shadow-xs hover:bg-blue-700 transition"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 1: CATEGORIES FULL BROWSE */}
          {activeBottomNav === 1 && (
            <div className="p-4 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-black text-slate-900">
                  All Hardware Categories
                </h3>
                <span className="text-xs text-slate-500 font-semibold">
                  {filteredProducts.length} Products
                </span>
              </div>

              {/* Filter pills */}
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-2 mb-3">
                <button
                  onClick={() => setActiveCategoryFilter("all")}
                  className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition ${activeCategoryFilter === "all" ? "bg-blue-600 text-white" : "bg-white text-slate-600 border border-slate-200"}`}
                >
                  All Items
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveCategoryFilter(c.id)}
                    className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition ${activeCategoryFilter === c.id ? "bg-blue-600 text-white" : "bg-white text-slate-600 border border-slate-200"}`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              {/* 2-Column Product Grid */}
              <div className="grid grid-cols-2 gap-2.5 pb-4">
                {filteredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => setSelectedProduct(prod)}
                    className="bg-white rounded-2xl border border-slate-200/80 p-2.5 shadow-2xs flex flex-col justify-between group hover:border-blue-400 transition cursor-pointer"
                  >
                    <div className="relative mb-2">
                      <span className="absolute top-1 left-1 bg-rose-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-xs z-10">
                        {prod.discount}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWish(prod);
                        }}
                        className="absolute top-1 right-1 p-1 bg-white/80 backdrop-blur-sm rounded-full shadow-2xs text-slate-400 hover:text-rose-500 z-10"
                      >
                        <Heart
                          className={`w-3 h-3 ${wishlist[prod.id] ? "fill-rose-500 text-rose-500" : ""}`}
                        />
                      </button>
                      <div className="w-full h-24 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center p-1">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">
                        {prod.category}
                      </span>
                      <h4 className="text-[10px] font-bold text-slate-900 line-clamp-1 mt-0.5">
                        {prod.name}
                      </h4>
                      <div className="flex items-center gap-1 mt-1 text-[8.5px] text-slate-500 font-semibold">
                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        <span>{prod.rating}</span>
                        <span className="text-slate-400">({prod.reviews})</span>
                      </div>
                      <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-slate-100">
                        <div>
                          <span className="text-xs font-black text-blue-600">
                            ₹{prod.price}
                          </span>
                          <span className="text-[9px] text-slate-400 line-through ml-1">
                            ₹{prod.mrp}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(prod);
                          }}
                          className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs hover:bg-blue-700 transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: CART SCREEN */}
          {activeBottomNav === 2 && (
            <div className="p-4 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-black text-slate-900">
                  Your Shopping Cart ({cartItemCount})
                </h3>
                <span className="text-xs text-emerald-600 font-bold">
                  Free Shipping on ₹999+
                </span>
              </div>

              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-3">
                    <ShoppingCart className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Your cart is empty
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
                    Explore our robotics kits and start building!
                  </p>
                  <button
                    onClick={() => setActiveBottomNav(0)}
                    className="mt-4 bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-md hover:bg-blue-700"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5 flex-1">
                  {cart.map((item) => {
                    const fullProduct =
                      allProducts.find((p) => p.id === item.id) || item;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedProduct(fullProduct)}
                        className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs flex items-center gap-3 hover:border-blue-400/80 transition cursor-pointer group"
                      >
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0 group-hover:scale-105 transition">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition">
                            {item.name}
                          </h4>
                          <div className="text-[10px] text-slate-500">
                            {item.category}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-xs font-black text-blue-600">
                              ₹{item.price}
                            </span>
                            <span className="text-[10px] text-slate-400 line-through">
                              ₹{item.mrp}
                            </span>
                          </div>
                        </div>

                        {/* Qty Stepper */}
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-xl shrink-0"
                        >
                          <button
                            onClick={() => updateCartQty(item.id, -1)}
                            className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-slate-700 hover:bg-slate-200 text-xs font-bold shadow-2xs cursor-pointer"
                          >
                            -
                          </button>
                          <span className="text-xs font-black text-slate-900 w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQty(item.id, 1)}
                            className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-slate-700 hover:bg-slate-200 text-xs font-bold shadow-2xs cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Bill Summary */}
                  <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs mt-4 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal MRP:</span>
                      <span>₹{cartTotalMRP}</span>
                    </div>
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Promotional Savings:</span>
                      <span>-₹{cartSavings}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Delivery (Pan-India):</span>
                      <span className="text-emerald-600 font-bold">FREE</span>
                    </div>
                    <div className="border-t border-slate-100 pt-2 flex justify-between items-center text-sm font-black text-slate-900">
                      <span>Grand Total:</span>
                      <span className="text-blue-600 text-base">
                        ₹{cartTotal}
                      </span>
                    </div>
                  </div>

                  {/* Checkout CTA */}
                  <button
                    onClick={() => {
                      setCheckoutModalOpen(true);
                    }}
                    className="w-full bg-gradient-to-r from-[#003B73] via-[#005CA9] to-[#0072CE] hover:from-[#002B54] hover:to-[#005CA9] text-white font-black text-xs py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 mt-3 cursor-pointer active:scale-98 transition"
                  >
                    <span>Proceed to Buy (₹{cartTotal})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: WISHLIST SCREEN */}
          {activeBottomNav === 3 && (
            <div className="p-4 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-black text-slate-900">
                  Your Saved Items ({wishlistedProducts.length})
                </h3>
                {wishlistedProducts.length > 0 && (
                  <button
                    onClick={() => {
                      wishlistedProducts.forEach((p) => addToCart(p));
                      triggerToast("All saved items added to cart!");
                    }}
                    className="text-[10px] font-bold text-blue-600 hover:underline"
                  >
                    Add All to Cart
                  </button>
                )}
              </div>

              {wishlistedProducts.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-3">
                    <Heart className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    No items in wishlist
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
                    Tap the heart icon on any card to save it here!
                  </p>
                  <button
                    onClick={() => setActiveBottomNav(0)}
                    className="mt-4 bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-md hover:bg-blue-700"
                  >
                    Explore Products
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5 pb-4">
                  {wishlistedProducts.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => setSelectedProduct(prod)}
                      className="bg-white rounded-2xl border border-slate-200/80 p-2.5 shadow-2xs flex flex-col justify-between group hover:border-blue-400 transition cursor-pointer"
                    >
                      <div className="relative mb-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWish(prod);
                          }}
                          className="absolute top-1 right-1 p-1 bg-white/80 backdrop-blur-sm rounded-full shadow-2xs text-rose-500 z-10"
                        >
                          <Heart className="w-3 h-3 fill-rose-500" />
                        </button>
                        <div className="w-full h-24 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center p-1">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition"
                          />
                        </div>
                      </div>

                      <div>
                        <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">
                          {prod.category}
                        </span>
                        <h4 className="text-[10px] font-bold text-slate-900 line-clamp-1 mt-0.5">
                          {prod.name}
                        </h4>
                        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100">
                          <span className="text-xs font-black text-blue-600">
                            ₹{prod.price}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(prod);
                            }}
                            className="text-[9px] font-extrabold bg-blue-50 text-blue-600 px-2 py-1 rounded-md hover:bg-blue-600 hover:text-white transition"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ACCOUNT SCREEN */}
          {activeBottomNav === 4 && (
            <div className="p-4 flex flex-col flex-1 text-slate-800">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl p-4 mb-3 shadow-md flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-lg font-black">
                  OK
                </div>
                <div>
                  <h4 className="text-sm font-black">Om Kumar</h4>
                  <p className="text-[10px] text-cyan-100">
                    +91 98765 43210 | om@prayog.in
                  </p>
                  <span className="inline-block mt-1 bg-[#FFC20E] text-slate-950 text-[8px] font-black px-2 py-0.5 rounded-full">
                    PRAYOG PRO MEMBER
                  </span>
                </div>
              </div>

              {/* Account Quick Links */}
              <div className="bg-white rounded-2xl p-2 border border-slate-200/80 shadow-2xs space-y-1 mb-3">
                <div
                  onClick={() => setOrdersModalOpen(true)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer text-xs font-bold text-slate-700"
                >
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    <span>My Hardware Orders (3 Active)</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div
                  onClick={() => setGstModalOpen(true)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer text-xs font-bold text-slate-700"
                >
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <span>B2B Institutional GST Invoices</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div
                  onClick={() =>
                    triggerToast(
                      "Default delivery address: Boring Road Hub, Patna (800001)",
                    )
                  }
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer text-xs font-bold text-slate-700"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-500" />
                    <span>Saved Delivery Addresses (800001)</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>

              {/* Support & Preferences */}
              <div className="bg-white rounded-2xl p-2 border border-slate-200/80 shadow-2xs space-y-1">
                <div
                  onClick={() => setSupportModalOpen(true)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer text-xs font-bold text-slate-700"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span>Mechatronics Tech Support</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* FULL PRODUCT DETAILS SCREEN (Dedicated Page View) */}
        {/* ========================================================= */}
        {selectedProduct && (
          <div className="absolute inset-0 bg-white z-50 flex flex-col animate-in slide-in-from-right duration-250">
            {/* Top Navigation Bar with Back Button */}
            <div className="bg-gradient-to-b from-[#003B73] to-[#005CA9] text-white px-4 pt-3 pb-3 shrink-0 shadow-md flex flex-col gap-2">
              {/* Status Bar */}
              <div className="flex justify-between items-center text-xs font-semibold pb-1">
                <span>11:46</span>
                <div className="w-16 h-3 bg-black/40 rounded-full mx-auto backdrop-blur-md"></div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold">5G</span>
                  <div className="w-4 h-2.5 border border-white rounded-[3px] p-[1px]">
                    <div className="w-full h-full bg-white rounded-[1px]"></div>
                  </div>
                </div>
              </div>

              {/* Back button & Page Title Actions */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white cursor-pointer transition shadow-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="text-center">
                  <span className="text-xs font-black tracking-tight uppercase text-white block">
                    Product Details
                  </span>
                  <span className="text-[8px] text-cyan-200 uppercase tracking-widest">
                    {selectedProduct.category}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleWish(selectedProduct)}
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white cursor-pointer transition"
                  >
                    <Heart
                      className={`w-4 h-4 ${wishlist[selectedProduct.id] ? "fill-rose-400 text-rose-400" : ""}`}
                    />
                  </button>
                  <button
                    onClick={() => {
                      if (
                        typeof navigator !== "undefined" &&
                        navigator.clipboard
                      ) {
                        navigator.clipboard.writeText(window.location.href);
                        triggerToast("Product link copied!");
                      }
                    }}
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white cursor-pointer transition"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable Page Body */}
            <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50 p-4 space-y-4">
              {/* Product Gallery Section */}
              <div className="space-y-2">
                <div className="w-full h-56 rounded-3xl overflow-hidden bg-white border border-slate-200/90 p-4 flex items-center justify-center relative shadow-xs">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full h-full object-contain hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-[#00AEEF] text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                    {selectedProduct.brand || "Official Hardware"}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-slate-900/80 text-white text-[8.5px] font-mono font-bold px-2.5 py-1 rounded-lg backdrop-blur-xs">
                    SKU: {selectedProduct.sku || "PRG-SKU-01"}
                  </div>
                </div>

                {/* Multiple Images Thumbnails Strip */}
                {selectedProduct.images &&
                  selectedProduct.images.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                      {selectedProduct.images.map((img, idx) => (
                        <div
                          key={idx}
                          className="w-14 h-14 rounded-2xl border-2 border-blue-600 overflow-hidden bg-white shrink-0 p-1 shadow-2xs"
                        >
                          <img
                            src={img}
                            alt=""
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ))}
                    </div>
                  )}
              </div>

              {/* Title & Reviews Row */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1.5">
                <h1 className="text-sm font-black text-slate-900 leading-snug">
                  {selectedProduct.name}
                </h1>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{selectedProduct.rating}</span>
                    <span className="text-slate-400 font-medium">
                      ({selectedProduct.reviews} verified reviews)
                    </span>
                  </div>
                  <span className="text-[9.5px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    ✓ In Stock (Ready)
                  </span>
                </div>
              </div>

              {/* Price, GST & Urgency Stock Card */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2.5">
                <div className="flex items-baseline gap-2.5">
                  <span className="text-2xl font-black text-blue-600 leading-none">
                    ₹{selectedProduct.price}
                  </span>
                  <span className="text-xs text-slate-400 line-through font-bold">
                    ₹{selectedProduct.mrp}
                  </span>
                  <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                    {selectedProduct.discount}
                  </span>
                  <span className="ml-auto text-[10px] font-bold text-emerald-600">
                    Save ₹{selectedProduct.mrp - selectedProduct.price}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-100">
                  <span className="font-medium">
                    Incl. GST (No Hidden Charges)
                  </span>
                  <span className="font-bold text-slate-800">
                    ⚡ Free Pan-India Delivery
                  </span>
                </div>

                {/* Urgency Stock Countdown */}
                <div className="pt-1 space-y-1">
                  <div className="flex justify-between text-[9.5px] font-black text-rose-600">
                    <span>
                      🔥 Please hurry! Only {selectedProduct.stockCount || 4}{" "}
                      units left in stock
                    </span>
                    <span>High Demand</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500 w-[70%] rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Short Product Summary */}
              <div className="bg-blue-50/60 p-3 rounded-2xl border border-blue-100 space-y-1">
                <span className="text-[9.5px] font-black text-blue-950 uppercase tracking-wider block">
                  Overview & Summary:
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {selectedProduct.description}
                </p>
              </div>

              {/* Key Features List */}
              {selectedProduct.features &&
                selectedProduct.features.length > 0 && (
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
                    <span className="text-[10px] font-black uppercase text-slate-900 tracking-wider block">
                      Key Engineering Highlights:
                    </span>
                    <ul className="space-y-1.5">
                      {selectedProduct.features.map((feat, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-xs text-slate-600 leading-tight"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Technical Specifications Grid */}
              {selectedProduct.specs && (
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-900 tracking-wider block">
                    Technical Parameters:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(selectedProduct.specs).map(([k, v]) => (
                      <div
                        key={k}
                        className="bg-slate-50 p-2.5 rounded-xl border border-slate-100"
                      >
                        <div className="text-[8.5px] font-bold text-slate-400 uppercase">
                          {k}
                        </div>
                        <div className="text-xs font-black text-slate-900 truncate mt-0.5">
                          {v}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Engineering Downloads & Datasheets */}
              {selectedProduct.documents && (
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2 mb-2">
                  <div className="text-[10px] font-black text-slate-900 uppercase flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-blue-600" />
                    <span>Official Datasheets & Schematics</span>
                  </div>
                  {selectedProduct.documents.map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs font-bold text-blue-600 bg-blue-50/50 p-2 rounded-xl border border-blue-100"
                    >
                      <span className="truncate">{doc.title}</span>
                      <span className="text-[8.5px] bg-blue-600 text-white px-2 py-0.5 rounded-md uppercase font-extrabold">
                        {doc.type}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* SIMILAR & RELATED PRODUCTS CAROUSEL - 2 HORIZONTAL ROWS */}
              <div className="pt-2 pb-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
                    <span className="text-xs font-black text-slate-900">
                      Similar & Related Hardware
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    Recommended
                  </span>
                </div>

                {/* ROW 1: Same Category & Direct Alternatives */}
                <div className="space-y-1">
                  <span className="text-[8.5px] font-extrabold uppercase tracking-wider text-slate-400 block px-0.5">
                    Category Matches & Alternatives
                  </span>
                  <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                    {allProducts
                      .filter((p) => p.id !== selectedProduct.id)
                      .sort((a, b) => {
                        const aSameCat =
                          a.catId === selectedProduct.catId ? 1 : 0;
                        const bSameCat =
                          b.catId === selectedProduct.catId ? 1 : 0;
                        return bSameCat - aSameCat;
                      })
                      .slice(0, 7)
                      .map((relProd) => (
                        <div
                          key={relProd.id}
                          onClick={() => {
                            setSelectedProduct(relProd);
                            const container =
                              document.querySelector(".overflow-y-auto");
                            if (container) container.scrollTop = 0;
                          }}
                          className="w-[130px] bg-white rounded-2xl border border-slate-200/80 p-2 shrink-0 shadow-2xs flex flex-col justify-between group hover:border-blue-500 transition cursor-pointer"
                        >
                          <div className="relative mb-1">
                            <span className="absolute top-1 left-1 bg-rose-500 text-white text-[7px] font-black px-1 py-0.2 rounded shadow-xs z-10">
                              {relProd.discount}
                            </span>
                            <div className="w-full h-20 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center p-1">
                              <img
                                src={relProd.image}
                                alt={relProd.name}
                                className="w-full h-full object-contain group-hover:scale-105 transition duration-300"
                              />
                            </div>
                          </div>

                          <div>
                            <span className="text-[7.5px] font-extrabold text-slate-400 uppercase tracking-wider line-clamp-1">
                              {relProd.category}
                            </span>
                            <h4 className="text-[9.5px] font-bold text-slate-900 truncate mt-0.5">
                              {relProd.name}
                            </h4>
                            <div className="flex items-center gap-1 mt-0.5 text-[8px] text-slate-500 font-semibold">
                              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                              <span>{relProd.rating}</span>
                              <span className="text-[7.5px] text-slate-400">
                                ({relProd.reviews})
                              </span>
                            </div>
                            <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-100">
                              <div>
                                <div className="text-[11px] font-black text-blue-600 leading-none">
                                  ₹{relProd.price}
                                </div>
                                <div className="text-[8px] text-slate-400 line-through leading-none mt-0.5">
                                  ₹{relProd.mrp}
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToCart(relProd);
                                }}
                                className="w-5 h-5 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-xs transition"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* ROW 2: Frequently Bought Together / Add-on Hardware */}
                <div className="space-y-1 pt-1 border-t border-slate-100">
                  <span className="text-[8.5px] font-extrabold uppercase tracking-wider text-slate-400 block px-0.5">
                    Frequently Bought Together & Add-ons
                  </span>
                  <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                    {allProducts
                      .filter((p) => p.id !== selectedProduct.id)
                      .slice(7, 16)
                      .map((relProd) => (
                        <div
                          key={relProd.id}
                          onClick={() => {
                            setSelectedProduct(relProd);
                            const container =
                              document.querySelector(".overflow-y-auto");
                            if (container) container.scrollTop = 0;
                          }}
                          className="w-[130px] bg-white rounded-2xl border border-slate-200/80 p-2 shrink-0 shadow-2xs flex flex-col justify-between group hover:border-blue-500 transition cursor-pointer"
                        >
                          <div className="relative mb-1">
                            <span className="absolute top-1 left-1 bg-rose-500 text-white text-[7px] font-black px-1 py-0.2 rounded shadow-xs z-10">
                              {relProd.discount}
                            </span>
                            <div className="w-full h-20 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center p-1">
                              <img
                                src={relProd.image}
                                alt={relProd.name}
                                className="w-full h-full object-contain group-hover:scale-105 transition duration-300"
                              />
                            </div>
                          </div>

                          <div>
                            <span className="text-[7.5px] font-extrabold text-slate-400 uppercase tracking-wider line-clamp-1">
                              {relProd.category}
                            </span>
                            <h4 className="text-[9.5px] font-bold text-slate-900 truncate mt-0.5">
                              {relProd.name}
                            </h4>
                            <div className="flex items-center gap-1 mt-0.5 text-[8px] text-slate-500 font-semibold">
                              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                              <span>{relProd.rating}</span>
                              <span className="text-[7.5px] text-slate-400">
                                ({relProd.reviews})
                              </span>
                            </div>
                            <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-100">
                              <div>
                                <div className="text-[11px] font-black text-blue-600 leading-none">
                                  ₹{relProd.price}
                                </div>
                                <div className="text-[8px] text-slate-400 line-through leading-none mt-0.5">
                                  ₹{relProd.mrp}
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToCart(relProd);
                                }}
                                className="w-5 h-5 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-xs transition"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Sticky Action Bar with Add to Cart & Buy Now */}
            <div className="bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-3.5 py-3 flex items-center gap-2.5 shrink-0 shadow-2xl">
              <button
                onClick={() => toggleWish(selectedProduct)}
                className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 cursor-pointer transition shadow-2xs ${
                  wishlist[selectedProduct.id]
                    ? "border-rose-300 bg-rose-50 text-rose-500"
                    : "border-slate-200 bg-slate-50/80 text-slate-600 hover:text-rose-500 hover:border-rose-200"
                }`}
                title="Save to Wishlist"
              >
                <Heart
                  className={`w-4 h-4 ${wishlist[selectedProduct.id] ? "fill-rose-500" : ""}`}
                />
              </button>

              {/* Add to Cart Button */}
              <button
                onClick={() => {
                  addToCart(selectedProduct);
                }}
                className="flex-1 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-extrabold text-xs py-3 rounded-2xl shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition border border-slate-700"
              >
                <ShoppingCart className="w-3.5 h-3.5 text-cyan-400" />
                <span>Add to Cart</span>
              </button>

              {/* Buy Now Button */}
              <button
                onClick={() => {
                  addToCart(selectedProduct);
                  setSelectedProduct(null);
                  setActiveBottomNav(2); // Switch directly to Cart / Checkout tab
                  triggerToast(`Express Checkout for ${selectedProduct.name}`);
                }}
                className="flex-1 bg-gradient-to-r from-[#003B73] via-[#005CA9] to-[#0072CE] hover:from-[#002B54] hover:to-[#005CA9] text-white font-black text-xs py-3 rounded-2xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition border border-blue-400/30"
              >
                <Zap className="w-3.5 h-3.5 fill-[#FFC20E] text-[#FFC20E]" />
                <span>Buy Now (₹{selectedProduct.price})</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* INTERACTIVE CHECKOUT & PAYMENT MODAL */}
        {/* ========================================================= */}
        {checkoutModalOpen && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex flex-col justify-end animate-in fade-in duration-200">
            <div className="bg-white rounded-t-[32px] max-h-[85%] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
              {/* Modal Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs">
                    ₹
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      Secure Express Checkout
                    </h3>
                    <p className="text-[9.5px] text-slate-500 font-medium">
                      100% Encrypted & GST B2B Ready
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setCheckoutModalOpen(false);
                    setOrderSuccess(false);
                  }}
                  className="w-7 h-7 rounded-full bg-slate-200/80 hover:bg-slate-300 flex items-center justify-center text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-4 overflow-y-auto no-scrollbar space-y-3.5 flex-1">
                {orderSuccess ? (
                  <div className="py-6 flex flex-col items-center text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg animate-bounce">
                      <Check className="w-8 h-8 stroke-[3]" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-slate-900">
                        Order Confirmed!
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Order ID:{" "}
                        <span className="font-mono font-bold text-blue-600">
                          {placedOrderId}
                        </span>
                      </p>
                    </div>
                    <div className="bg-emerald-50 text-emerald-800 text-xs p-3 rounded-2xl border border-emerald-200 text-left w-full space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Dispatched from Nearest Hub</span>
                      </div>
                      <p className="text-[10px] text-emerald-700">
                        Estimated delivery: Tomorrow by 11:00 AM (Free Express
                        Courier with Live GPS Tracking)
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setCheckoutModalOpen(false);
                        setOrderSuccess(false);
                        setCart([]);
                        setActiveBottomNav(4); // Go to account
                        setOrdersModalOpen(true); // Open orders
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-3 rounded-2xl shadow-md cursor-pointer"
                    >
                      Track Active Order
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Delivery Address Pill */}
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-500">
                        <span>Shipping Address</span>
                        <span className="text-blue-600 cursor-pointer">
                          Change
                        </span>
                      </div>
                      <div className="flex items-start gap-2 pt-0.5">
                        <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            Om Kumar • +91 98765 43210
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Plot 42, Boring Road Mechatronics Hub, Patna, Bihar
                            - 800001
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black uppercase text-slate-500">
                        Items in Order ({cartItemCount})
                      </span>
                      <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                        {cart.map((c) => (
                          <div
                            key={c.id}
                            className="flex justify-between items-center text-xs bg-white p-2 rounded-xl border border-slate-100"
                          >
                            <span className="truncate max-w-[180px] font-semibold text-slate-800">
                              {c.name} (x{c.quantity})
                            </span>
                            <span className="font-black text-slate-900">
                              ₹{c.price * c.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Payment Method Selector */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black uppercase text-slate-500">
                        Payment Option
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => setSelectedPaymentMethod("upi")}
                          className={`p-2.5 rounded-2xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                            selectedPaymentMethod === "upi"
                              ? "border-blue-600 bg-blue-50 text-blue-700 font-bold ring-2 ring-blue-400/30"
                              : "border-slate-200 bg-white text-slate-600"
                          }`}
                        >
                          <Zap className="w-4 h-4 text-blue-600" />
                          <span className="text-[10px]">UPI / QR</span>
                        </button>
                        <button
                          onClick={() => setSelectedPaymentMethod("card")}
                          className={`p-2.5 rounded-2xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                            selectedPaymentMethod === "card"
                              ? "border-blue-600 bg-blue-50 text-blue-700 font-bold ring-2 ring-blue-400/30"
                              : "border-slate-200 bg-white text-slate-600"
                          }`}
                        >
                          <CreditCard className="w-4 h-4 text-emerald-600" />
                          <span className="text-[10px]">Card / Net</span>
                        </button>
                        <button
                          onClick={() => setSelectedPaymentMethod("cod")}
                          className={`p-2.5 rounded-2xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                            selectedPaymentMethod === "cod"
                              ? "border-blue-600 bg-blue-50 text-blue-700 font-bold ring-2 ring-blue-400/30"
                              : "border-slate-200 bg-white text-slate-600"
                          }`}
                        >
                          <Package className="w-4 h-4 text-amber-500" />
                          <span className="text-[10px]">Cash / Hub</span>
                        </button>
                      </div>
                    </div>

                    {/* GST Note */}
                    <div className="flex items-center gap-2 bg-blue-50/60 p-2 rounded-xl text-[10px] text-blue-900">
                      <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>
                        Official 18% GST Tax Invoice will be generated and
                        emailed automatically.
                      </span>
                    </div>

                    {/* Pay Button */}
                    <button
                      onClick={() => {
                        const newOrderId = `PRG-ORD-${Math.floor(10000 + Math.random() * 90000)}`;
                        setPlacedOrderId(newOrderId);
                        setUserOrders((prev) => [
                          {
                            id: newOrderId,
                            date: "Just Now",
                            status: "Order Placed (Processing)",
                            statusColor:
                              "text-amber-600 bg-amber-50 border-amber-200",
                            total: cartTotal,
                            items: cart.map((c) => c.name),
                          },
                          ...prev,
                        ]);
                        setOrderSuccess(true);
                      }}
                      className="w-full bg-gradient-to-r from-[#003B73] via-[#005CA9] to-[#0072CE] hover:from-[#002B54] text-white font-black text-xs py-3.5 rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition mt-2"
                    >
                      <Zap className="w-4 h-4 fill-[#FFC20E] text-[#FFC20E]" />
                      <span>Pay & Place Order (₹{cartTotal})</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ORDERS TRACKING MODAL */}
        {/* ========================================================= */}
        {ordersModalOpen && (
          <div className="absolute inset-0 bg-white z-50 flex flex-col animate-in slide-in-from-right duration-250">
            <div className="bg-gradient-to-b from-[#003B73] to-[#005CA9] text-white px-4 pt-3 pb-3 shrink-0 shadow-md flex items-center justify-between">
              <button
                onClick={() => setOrdersModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 text-white" />
              </button>
              <span className="text-xs font-black uppercase tracking-wider">
                My Hardware Orders
              </span>
              <div className="w-8"></div>
            </div>

            <div className="p-4 flex-1 overflow-y-auto no-scrollbar space-y-3 bg-slate-50">
              {userOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs font-black text-slate-900">
                        {ord.id}
                      </div>
                      <div className="text-[9.5px] text-slate-400 font-semibold">
                        {ord.date}
                      </div>
                    </div>
                    <span
                      className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${ord.statusColor}`}
                    >
                      {ord.status}
                    </span>
                  </div>

                  <div className="border-t border-slate-100 pt-2 space-y-1">
                    {ord.items.map((it, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 text-xs text-slate-700 font-medium"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="truncate">{it}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 pt-2 flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">
                      Total Paid:
                    </span>
                    <span className="font-black text-blue-600 text-sm">
                      ₹{ord.total}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* GST INVOICES MODAL */}
        {/* ========================================================= */}
        {gstModalOpen && (
          <div className="absolute inset-0 bg-white z-50 flex flex-col animate-in slide-in-from-right duration-250">
            <div className="bg-gradient-to-b from-[#003B73] to-[#005CA9] text-white px-4 pt-3 pb-3 shrink-0 shadow-md flex items-center justify-between">
              <button
                onClick={() => setGstModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 text-white" />
              </button>
              <span className="text-xs font-black uppercase tracking-wider">
                GST Tax Invoices
              </span>
              <div className="w-8"></div>
            </div>

            <div className="p-4 flex-1 overflow-y-auto no-scrollbar space-y-3 bg-slate-50">
              <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 text-xs text-blue-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>GSTIN: 10AAECP9842M1ZB</span>
                </div>
                <p className="text-[10px] text-blue-800">
                  Download official 18% input tax credit tax invoices for
                  institutional and laboratory billing.
                </p>
              </div>

              {userOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs flex justify-between items-center"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {ord.id} - Tax Invoice
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Amount: ₹{ord.total} (Incl. GST)
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      triggerToast(`Downloading PDF Invoice for ${ord.id}...`)
                    }
                    className="text-[9.5px] font-black bg-blue-50 text-blue-600 border border-blue-200 px-2.5 py-1.5 rounded-xl hover:bg-blue-600 hover:text-white transition"
                  >
                    PDF Invoice
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TECH SUPPORT CHAT MODAL */}
        {/* ========================================================= */}
        {supportModalOpen && (
          <div className="absolute inset-0 bg-white z-50 flex flex-col animate-in slide-in-from-right duration-250">
            <div className="bg-gradient-to-b from-[#003B73] to-[#005CA9] text-white px-4 pt-3 pb-3 shrink-0 shadow-md flex items-center justify-between">
              <button
                onClick={() => setSupportModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 text-white" />
              </button>
              <div className="text-center">
                <span className="text-xs font-black uppercase tracking-wider block">
                  Prayog Lab Support
                </span>
                <span className="text-[8px] text-emerald-300 font-bold">
                  ● Hardware Engineer Online
                </span>
              </div>
              <div className="w-8"></div>
            </div>

            <div className="p-4 flex-1 overflow-y-auto no-scrollbar space-y-3 bg-slate-50 text-xs">
              <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <div className="font-bold text-slate-900 text-xs">
                  Robotics & Mechatronics Lab Helpdesk
                </div>
                <p className="text-[10px] text-slate-600">
                  Need wiring schematics, firmware code, or drone PID tuning
                  help? Ask our engineers!
                </p>
              </div>

              <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-tr-none shadow-xs ml-8 space-y-1">
                <p className="text-xs">
                  Hello! How can I connect the MPU6050 with Arduino UNO for roll
                  and pitch telemetry?
                </p>
                <span className="text-[8px] text-cyan-200 block text-right">
                  Today, 2:40 PM
                </span>
              </div>

              <div className="bg-white text-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-xs mr-8 space-y-1">
                <p className="text-xs">
                  Connect <strong>VCC to 5V</strong>,{" "}
                  <strong>GND to GND</strong>, <strong>SDA to Pin A4</strong>,
                  and <strong>SCL to Pin A5</strong>. Use our official Prayog
                  Arduino Starter Library!
                </p>
                <span className="text-[8px] text-slate-400 block">
                  Today, 2:41 PM
                </span>
              </div>
            </div>

            <div className="p-3 bg-white border-t border-slate-200 flex gap-2 items-center">
              <input
                type="text"
                placeholder="Type your hardware question..."
                className="flex-1 text-xs bg-slate-100 px-3 py-2 rounded-xl focus:outline-none"
              />
              <button
                onClick={() =>
                  triggerToast("Message sent to Prayog Lab Engineer")
                }
                className="bg-blue-600 text-white font-bold text-xs px-3 py-2 rounded-xl"
              >
                Send
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TOAST POPUP */}
        {/* ========================================================= */}
        {toastMessage && (
          <div className="absolute top-16 inset-x-6 bg-slate-900 text-white text-xs font-bold py-2.5 px-3.5 rounded-2xl shadow-2xl flex items-center justify-center gap-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200 border border-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">{toastMessage}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* BOTTOM NAVIGATION BAR */}
        {/* ========================================================= */}
        <div className="bg-white border-t border-slate-200/80 px-4 py-2 flex justify-between items-center shadow-lg z-30 shrink-0">
          {/* Home */}
          <button
            onClick={() => {
              setActiveBottomNav(0);
              setActiveCategoryFilter("all");
            }}
            className="flex flex-col items-center gap-0.5 flex-1 cursor-pointer"
          >
            <Home
              className={`w-4.5 h-4.5 ${activeBottomNav === 0 ? "text-blue-600" : "text-slate-500"}`}
            />
            <span
              className={`text-[10px] font-black ${activeBottomNav === 0 ? "text-blue-600" : "text-slate-500"}`}
            >
              Home
            </span>
          </button>

          {/* Categories */}
          <button
            onClick={() => setActiveBottomNav(1)}
            className="flex flex-col items-center gap-0.5 flex-1 cursor-pointer"
          >
            <Grid
              className={`w-4.5 h-4.5 ${activeBottomNav === 1 ? "text-blue-600" : "text-slate-500"}`}
            />
            <span
              className={`text-[10px] font-bold ${activeBottomNav === 1 ? "text-blue-600" : "text-slate-500"}`}
            >
              Categories
            </span>
          </button>

          {/* Cart */}
          <button
            onClick={() => setActiveBottomNav(2)}
            className="flex flex-col items-center gap-0.5 flex-1 relative cursor-pointer"
          >
            <div className="relative">
              <ShoppingCart
                className={`w-4.5 h-4.5 ${activeBottomNav === 2 ? "text-blue-600" : "text-slate-500"}`}
              />
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[7.5px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-xs">
                  {cartItemCount}
                </span>
              )}
            </div>
            <span
              className={`text-[10px] font-bold ${activeBottomNav === 2 ? "text-blue-600" : "text-slate-500"}`}
            >
              Cart
            </span>
          </button>

          {/* Wishlist */}
          <button
            onClick={() => setActiveBottomNav(3)}
            className="flex flex-col items-center gap-0.5 flex-1 cursor-pointer"
          >
            <Heart
              className={`w-4.5 h-4.5 ${activeBottomNav === 3 ? "text-blue-600" : "text-slate-500"}`}
            />
            <span
              className={`text-[10px] font-bold ${activeBottomNav === 3 ? "text-blue-600" : "text-slate-500"}`}
            >
              Wishlist
            </span>
          </button>

          {/* Account */}
          <button
            onClick={() => setActiveBottomNav(4)}
            className="flex flex-col items-center gap-0.5 flex-1 cursor-pointer"
          >
            <User
              className={`w-4.5 h-4.5 ${activeBottomNav === 4 ? "text-blue-600" : "text-slate-500"}`}
            />
            <span
              className={`text-[10px] font-bold ${activeBottomNav === 4 ? "text-blue-600" : "text-slate-500"}`}
            >
              Account
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
