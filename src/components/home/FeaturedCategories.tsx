"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  ShoppingCart,
  Check,
  Maximize2,
  ArrowLeftRight,
  Heart,
} from "lucide-react";
import { Product, PRODUCTS } from "@/data/mockData";
import { useCartStore, useWishlistStore, useUIStore } from "@/store";
import { haptic } from "@/utils/haptics";

const WhatsAppIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    role="img"
    aria-label="WhatsApp"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

export interface PopularProduct extends Product {
  secondaryImage?: string;
}

interface Props {
  onSelectCategory?: (category: string) => void;
  onAddToCart?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  wishlistIds?: string[];
}

// 16 Distinct, Premium Hardware Products with 100% Unique Images & Secondary Hover Angles
const POPULAR_PRODUCTS_DATA: PopularProduct[] = [
  {
    id: "ard-uno-r3",
    slug: "arduino-uno-r3",
    name: "Arduino UNO R3 Official Board (ATmega328P)",
    sku: "PRG-ARD-001",
    brand: "Arduino",
    category: "Arduino & Microcontrollers",
    price: 1499,
    mrp: 1999,
    discount: "25% OFF",
    rating: 5,
    reviews: 342,
    inStock: true,
    image: "/images/products/arduino-uno-r3.png",
    secondaryImage: "/products/arduino_cutout.png",
    description: "The gold standard prototyping board for robotics, IoT and mechatronics.",
    specs: { MCU: "ATmega328P", Voltage: "5V", Clock: "16 MHz" },
  },
  {
    id: "prayog-stem-robot-kit",
    slug: "prayog-stem-robot-kit",
    name: "Dilay-Bot 4WD Smart Autonomous Robotics Car Kit",
    sku: "PRG-ROB-001",
    brand: "Prayog India",
    category: "Robotics & DIY Kits",
    price: 3499,
    mrp: 4999,
    discount: "30% OFF",
    rating: 5,
    reviews: 184,
    inStock: true,
    image: "/images/products/4wd-robot-chassis-kit.jpg",
    secondaryImage: "/images/robot_banner_stem.jpg",
    description: "Complete 4-wheel drive educational robotics kit with ultrasonic obstacle avoidance.",
    specs: { Chassis: "Dual-layer Acrylic", Wheels: "4x 65mm Rubber", Drive: "4x TT Gear Motors" },
  },
  {
    id: "hcsr04-ultrasonic",
    slug: "hcsr04-ultrasonic",
    name: "HC-SR04 Precision Ultrasonic Distance Sensor (2cm-400cm)",
    sku: "PRG-SEN-001",
    brand: "Sensors Lab",
    category: "Sensors & Electronic Modules",
    price: 149,
    mrp: 249,
    discount: "40% OFF",
    rating: 5,
    reviews: 420,
    inStock: true,
    image: "/images/products/ultrasonic-sensor-hcsr04.png",
    secondaryImage: "/images/categories/sensors.jpg",
    description: "High-accuracy dual ultrasonic distance sensor for obstacle detection and ranging.",
    specs: { Range: "2cm - 400cm", Angle: "15 degrees", Voltage: "5V DC" },
  },
  {
    id: "pixhawk-fc",
    slug: "pixhawk-fc",
    name: "Pixhawk 6C Autopilot Flight Controller UAV System",
    sku: "PRG-DRN-001",
    brand: "Holybro",
    category: "Drones & UAV Parts",
    price: 14999,
    mrp: 18999,
    discount: "21% OFF",
    rating: 5,
    reviews: 95,
    inStock: true,
    image: "/images/categories/vip_drone.jpg",
    secondaryImage: "/images/drone_cutout.jpg",
    description: "Industrial flight controller with dual redundant IMUs and PX4/ArduPilot support.",
    specs: { Processor: "STM32H753 480MHz", Sensors: "Dual IMU", Barometer: "MS5611" },
  },
  {
    id: "esp32-devkit-v1",
    slug: "esp32-devkit-v1",
    name: "ESP32 Dual-Core WiFi + Bluetooth Development Board",
    sku: "PRG-IOT-001",
    brand: "Espressif",
    category: "IoT & Wireless Modules",
    price: 449,
    mrp: 699,
    discount: "36% OFF",
    rating: 5,
    reviews: 310,
    inStock: true,
    image: "/images/categories/iot_wireless.jpg",
    secondaryImage: "/images/categories/components.jpg",
    description: "Ultra-low power dual-core 240MHz SoC with integrated Wi-Fi and Bluetooth LE.",
    specs: { CPU: "Xtensa 32-bit LX6 240MHz", RAM: "520KB SRAM", Wireless: "802.11 b/g/n + BLE" },
  },
  {
    id: "rpi-5-8gb",
    slug: "raspberry-pi-5-8gb",
    name: "Raspberry Pi 5 Single Board Computer (8GB RAM Edition)",
    sku: "PRG-SBC-005",
    brand: "Raspberry Pi",
    category: "Single Board Computers & Dev Boards",
    price: 7899,
    mrp: 9999,
    discount: "21% OFF",
    rating: 5,
    reviews: 215,
    inStock: true,
    image: "/images/categories/raspberry_pi.jpg",
    secondaryImage: "/images/pi_hero.jpg",
    description: "Next-gen 2.4GHz quad-core 64-bit Arm Cortex-A76 with dual 4K HDMI and PCIe 2.0.",
    specs: { CPU: "Broadcom BCM2712 2.4GHz", RAM: "8GB LPDDR4X", Display: "Dual 4K micro-HDMI" },
  },
  {
    id: "l298n-motor-driver",
    slug: "l298n-motor-driver",
    name: "L298N Dual H-Bridge DC Stepper Motor Driver Module",
    sku: "PRG-MOT-002",
    brand: "Prayog India",
    category: "Motors, Steppers & Drivers",
    price: 189,
    mrp: 299,
    discount: "37% OFF",
    rating: 5,
    reviews: 260,
    inStock: true,
    image: "/images/products/l298n-motor-driver.jpg",
    secondaryImage: "/images/categories/motors_robotics.jpg",
    description: "High-power motor driver capable of driving 2 DC motors or 1 bipolar stepper motor.",
    specs: { Chip: "L298N", "Peak Current": "2A per bridge", "Supply Voltage": "5V - 35V" },
  },
  {
    id: "arm-manipulator-6dof",
    slug: "arm-manipulator-6dof",
    name: "6-DOF Heavy Duty Metal Robotic Arm Manipulator Kit",
    sku: "PRG-ROB-003",
    brand: "RoboMech",
    category: "Robotics & DIY Kits",
    price: 8499,
    mrp: 11999,
    discount: "29% OFF",
    rating: 5,
    reviews: 78,
    inStock: true,
    image: "/images/categories/robotics.jpg",
    secondaryImage: "/images/robotics_arm_banner_v2.jpg",
    description: "All-aluminum 6 degrees of freedom robotic arm with high-torque MG996R metal gear servos.",
    specs: { DOF: "6 Degrees of Freedom", Servos: "6x Metal Gear MG996R", Material: "Anodized Aluminum" },
  },
  {
    id: "speedybee-f405-stack",
    slug: "speedybee-f405-stack",
    name: "SpeedyBee F405 V3 50A 4-in-1 ESC Flight Stack for FPV",
    sku: "PRG-DRN-005",
    brand: "SpeedyBee",
    category: "Drones & UAV Parts",
    price: 4899,
    mrp: 6499,
    discount: "25% OFF",
    rating: 5,
    reviews: 112,
    inStock: true,
    image: "/images/drone_banner_lab.jpg",
    secondaryImage: "/images/categories/drones.jpg",
    description: "All-in-one Bluetooth configurable flight controller and 50A BLHeli_S 4-in-1 ESC.",
    specs: { MCU: "STM32F405", ESC: "50A 4-in-1 6S Dshot600", Wireless: "Bluetooth BLE" },
  },
  {
    id: "tt-gear-motor-wheel",
    slug: "tt-gear-motor-wheel",
    name: "TT Dual-Shaft Gear Motor with 65mm Anti-Skid Rubber Wheel",
    sku: "PRG-MOT-001",
    brand: "Prayog India",
    category: "Motors, Steppers & Drivers",
    price: 129,
    mrp: 199,
    discount: "35% OFF",
    rating: 5,
    reviews: 510,
    inStock: true,
    image: "/images/products/tt-gear-motor-wheel.png",
    secondaryImage: "/images/categories/motors_robotics.jpg",
    description: "Reliable 1:48 reduction DC gearbox motor with high-grip rubber robotics tire.",
    specs: { Ratio: "1:48", Voltage: "3V - 6V DC", Speed: "200 RPM @ 6V" },
  },
  {
    id: "esp32-cam-ov2640",
    slug: "esp32-cam-ov2640",
    name: "ESP32-CAM AI Vision Board with OV2640 2MP Camera",
    sku: "PRG-IOT-007",
    brand: "AI Vision",
    category: "Sensors & Electronic Modules",
    price: 699,
    mrp: 999,
    discount: "30% OFF",
    rating: 5,
    reviews: 189,
    inStock: true,
    image: "/images/categories/camera.jpg",
    secondaryImage: "/images/categories/iot_wireless.jpg",
    description: "Compact wireless video streaming and facial recognition edge AI module with microSD slot.",
    specs: { Camera: "OV2640 2MP", Flash: "High-power White LED", Card: "TF Card up to 4GB" },
  },
  {
    id: "mecanum-4wd-car",
    slug: "mecanum-4wd-car",
    name: "4WD Omni-Directional Mecanum Wheel Chassis Platform",
    sku: "PRG-ROB-004",
    brand: "Prayog India",
    category: "Robotics & DIY Kits",
    price: 2999,
    mrp: 4299,
    discount: "30% OFF",
    rating: 5,
    reviews: 84,
    inStock: true,
    image: "/images/products/4wd-robot-chassis-kit.jpg",
    secondaryImage: "/images/robot_cutout.jpg",
    description: "Heavy-duty chassis with 4 omni-directional mecanum rollers for 360-degree lateral movement.",
    specs: { Wheels: "4x 80mm Mecanum Rollers", Material: "Laser-cut Acrylic", Motors: "4x TT Motors" },
  },
  {
    id: "nema-17-stepper",
    slug: "nema-17-stepper",
    name: "NEMA 17 High-Torque 1.8° Bipolar Hybrid Stepper Motor",
    sku: "PRG-MOT-005",
    brand: "MotionTech",
    category: "Motors, Steppers & Drivers",
    price: 799,
    mrp: 1199,
    discount: "33% OFF",
    rating: 5,
    reviews: 140,
    inStock: true,
    image: "/images/categories/stepper_motor.jpg",
    secondaryImage: "/images/categories/3d_printing.jpg",
    description: "Precision 42mm stepper motor with 45N.cm holding torque for 3D printers and CNC machines.",
    specs: { "Step Angle": "1.8 deg", "Holding Torque": "45 N.cm", Current: "1.5A/phase" },
  },
  {
    id: "stem-starter-lab-kit",
    slug: "stem-starter-lab-kit",
    name: "STEM Educational Robotics & Electronics Starter Lab Kit",
    sku: "PRG-STM-001",
    brand: "Prayog STEM",
    category: "STEM & Educational Kits",
    price: 1899,
    mrp: 2699,
    discount: "30% OFF",
    rating: 5,
    reviews: 290,
    inStock: true,
    image: "/images/categories/stem_kits.jpg",
    secondaryImage: "/images/stem_robot_banner.jpg",
    description: "Over 45+ components including breadboard, sensors, LEDs, buzzer, and illustrated guidebook.",
    specs: { Components: "45+ Pieces", Compatibility: "Arduino & Micro:bit", Curriculum: "20 Lessons" },
  },
  {
    id: "soldering-multimeter-kit",
    slug: "soldering-multimeter-kit",
    name: "Electronics Soldering Iron & Digital Multimeter Lab Kit",
    sku: "PRG-TLS-001",
    brand: "ToolCraft",
    category: "Automation & Manufacturing",
    price: 1299,
    mrp: 1899,
    discount: "32% OFF",
    rating: 5,
    reviews: 175,
    inStock: true,
    image: "/images/categories/tools.jpg",
    secondaryImage: "/images/categories/components.jpg",
    description: "60W adjustable temperature soldering iron with digital multimeter, solder wire, and stand.",
    specs: { Power: "60W 110V/220V", Multimeter: "Auto-ranging Digital", Tips: "5x Interchangeable" },
  },
  {
    id: "3d-printing-extruder-kit",
    slug: "3d-printing-extruder-kit",
    name: "3D Rapid Prototyping Dual-Gear Extruder & Hotend Assembly",
    sku: "PRG-3DP-001",
    brand: "Creality Lab",
    category: "Automation & Manufacturing",
    price: 2199,
    mrp: 2999,
    discount: "27% OFF",
    rating: 5,
    reviews: 64,
    inStock: true,
    image: "/images/categories/3d_printing.jpg",
    secondaryImage: "/images/categories/tools.jpg",
    description: "All-metal direct drive dual gear extruder assembly with titanium heatbreak for 3D printers.",
    specs: { Filament: "1.75mm PLA/PETG/ABS", MaxTemp: "300°C", Gear: "Dual Hardened Steel" },
  },
];

const POPULAR_TABS = [
  { id: "all", label: "ALL" },
  {
    id: "robotics",
    label: "ROBOTICS",
    match: ["Robotics & DIY Kits"],
  },
  {
    id: "arduino",
    label: "ARDUINO",
    match: ["Arduino & Microcontrollers"],
  },
  {
    id: "drones",
    label: "DRONES",
    match: ["Drones & UAV Parts"],
  },
  {
    id: "sensors",
    label: "SENSORS",
    match: ["Sensors & Electronic Modules"],
  },
  {
    id: "stem",
    label: "STEM KITS",
    match: ["STEM & Educational Kits"],
  },
  {
    id: "dev-boards",
    label: "DEV BOARDS",
    match: ["Single Board Computers & Dev Boards", "IoT & Wireless Modules"],
  },
];

interface PopularProductCardProps {
  product: PopularProduct;
  onAddToCart?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  isWishlisted?: boolean;
}

const PopularProductCard: React.FC<PopularProductCardProps> = ({
  product,
  onAddToCart,
  onToggleWishlist,
  onQuickView,
  isWishlisted,
}) => {
  const addToCartStore = useCartStore((s) => s.addToCart);
  const toggleWishlistStore = useWishlistStore((s) => s.toggleWishlist);
  const isWishlistedInStore = useWishlistStore((s) =>
    s.wishlist.some((p) => p.id === product.id)
  );
  const showToast = useUIStore((s) => s.showToast);

  const [isAdded, setIsAdded] = useState(false);
  const [isCompared, setIsCompared] = useState(false);

  const displayPrice = product.price;
  const displayMrp =
    product.mrp && product.mrp > displayPrice
      ? product.mrp
      : Math.round(displayPrice * 1.25);
  const discountAmount = displayMrp - displayPrice;
  const discountPercent = Math.max(
    1,
    Math.round((discountAmount / displayMrp) * 100),
  );

  const primaryImage = product.image;
  const secondaryImage =
    product.secondaryImage || product.images?.[1] || primaryImage;
  const hasSecondary = secondaryImage !== primaryImage;

  const primaryIsPng = primaryImage.endsWith(".png");
  const secondaryIsPng = secondaryImage.endsWith(".png");

  const itemIsWishlisted =
    typeof isWishlisted === "boolean" ? isWishlisted : isWishlistedInStore;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    haptic?.medium?.();

    if (onAddToCart) {
      onAddToCart(product);
    } else {
      addToCartStore(product);
    }
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    haptic?.selection?.();

    if (onToggleWishlist) {
      onToggleWishlist(product);
    } else {
      toggleWishlistStore(product);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    haptic?.light?.();

    if (onQuickView) {
      const master = PRODUCTS.find(
        (p) =>
          p.id === product.id ||
          p.sku === product.sku ||
          p.slug === product.slug ||
          p.name.toLowerCase() === product.name.toLowerCase(),
      );
      const enriched: Product = master
        ? {
            ...master,
            ...product,
            specs: { ...master.specs, ...product.specs },
            features: master.features || product.features,
            applications: master.applications || product.applications,
            whatsIncluded: master.whatsIncluded || product.whatsIncluded,
            description: master.description || product.description,
            documents: master.documents || product.documents,
          }
        : product;
      onQuickView(enriched);
    }
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    haptic?.light?.();

    setIsCompared(true);
    showToast({
      title: "Comparison Added",
      message: `${product.name} added to comparison list.`,
      type: "success",
    });
    setTimeout(() => setIsCompared(false), 2500);
  };

  return (
    <div
      id={`popular-product-${product.id}`}
      className="w-[200px] xs:w-[215px] sm:w-[230px] md:w-[245px] shrink-0 snap-start bg-white rounded-2xl border border-slate-200/90 overflow-hidden hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between group font-sans relative"
    >
      {/* ── Top: Full-Bleed Product Image Container with Smooth Cross-Fade on Hover ── */}
      <div className="relative w-full aspect-[4/4.5] bg-slate-50 overflow-hidden">
        {/* Discount Badge in Top-Left (Matches screenshot red rounded badge) */}
        <div className="absolute top-2.5 left-2.5 z-20 bg-[#FF3B30] text-white text-[11px] font-extrabold px-2 py-0.5 rounded-xl shadow-xs pointer-events-none">
          {discountPercent}%
        </div>

        {/* ── Right Action Icons Stack (Slide + Fade in smoothly on hover) ── */}
        <div className="absolute top-2.5 right-2.5 z-30 flex flex-col gap-1.5 opacity-0 translate-x-2.5 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto transition-all duration-300 ease-out">
          {/* 1. Quick View / Zoom */}
          <button
            type="button"
            onClick={handleQuickView}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 backdrop-blur-xs border border-slate-200/90 shadow-sm flex items-center justify-center text-slate-700 hover:text-[#2563EB] hover:border-blue-300 hover:bg-blue-50/80 active:scale-90 transition-all cursor-pointer"
            title="Quick View"
            aria-label="Quick View"
          >
            <Maximize2 className="w-3.5 h-3.5 stroke-[2.2]" />
          </button>

          {/* 2. Compare / Swap */}
          <button
            type="button"
            onClick={handleCompare}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 backdrop-blur-xs border shadow-sm flex items-center justify-center active:scale-90 transition-all cursor-pointer ${
              isCompared
                ? "border-emerald-400 text-emerald-600 bg-emerald-50"
                : "border-slate-200/90 text-slate-700 hover:text-[#2563EB] hover:border-blue-300 hover:bg-blue-50/80"
            }`}
            title="Compare Product"
            aria-label="Compare Product"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 stroke-[2.2]" />
          </button>

          {/* 3. Wishlist Heart with Reference Tooltip */}
          <div className="relative group/wish">
            <button
              type="button"
              onClick={handleToggleWishlist}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 backdrop-blur-xs border shadow-sm flex items-center justify-center active:scale-90 transition-all cursor-pointer ${
                itemIsWishlisted
                  ? "border-red-300 text-red-500 bg-red-50"
                  : "border-slate-200/90 text-slate-700 hover:text-red-500 hover:border-red-200 hover:bg-red-50/50"
              }`}
              aria-label={itemIsWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                className={`w-3.5 h-3.5 transition-colors ${
                  itemIsWishlisted ? "fill-red-500 text-red-500" : "stroke-[2.2]"
                }`}
              />
            </button>

            {/* Tooltip matching Reference Screenshot (Image 3) */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/wish:flex flex-col items-center pointer-events-none z-50">
              <span className="bg-[#18181B] text-white text-[11px] font-medium px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
                {itemIsWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              </span>
              <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-[#18181B]" />
            </div>
          </div>
        </div>

        {/* ── Product Images (Smooth Cross-Fade on Hover) ── */}
        <Link
          href={`/products/${product.slug || product.id}`}
          className="relative w-full h-full block cursor-pointer"
        >
          {/* Primary View */}
          <div
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
              hasSecondary ? "opacity-100 group-hover:opacity-0" : "opacity-100"
            }`}
          >
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              draggable={false}
              sizes="(max-width: 640px) 210px, 260px"
              className={`${
                primaryIsPng ? "object-contain p-2.5" : "object-cover object-center"
              } transition-transform duration-500 ease-out group-hover:scale-105 pointer-events-none select-none`}
              style={{ WebkitUserDrag: "none" } as React.CSSProperties}
            />
          </div>

          {/* Secondary View (smoothly cross-fades in on hover) */}
          {hasSecondary && (
            <div className="absolute inset-0 transition-opacity duration-500 ease-in-out opacity-0 group-hover:opacity-100">
              <Image
                src={secondaryImage}
                alt={`${product.name} alternate angle`}
                fill
                draggable={false}
                sizes="(max-width: 640px) 210px, 260px"
                className={`${
                  secondaryIsPng ? "object-contain p-2.5" : "object-cover object-center"
                } transition-transform duration-500 ease-out group-hover:scale-105 pointer-events-none select-none`}
                style={{ WebkitUserDrag: "none" } as React.CSSProperties}
              />
            </div>
          )}
        </Link>
      </div>

      {/* ── Bottom: Card Details with Comfortable Padding ── */}
      <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between space-y-2.5 bg-white">
        <Link
          href={`/products/${product.slug || product.id}`}
          className="block cursor-pointer space-y-1"
        >
          {/* Brand Name (Only show if distinct brand and not Prayog India) */}
          {product.brand && product.brand.trim().toLowerCase() !== "prayog india" && (
            <div className="text-xs sm:text-[13px] text-slate-500 font-normal leading-tight truncate">
              {product.brand}
            </div>
          )}

          {/* Product Title (Bold Dark Slate/Black) */}
          <h3 className="text-xs sm:text-[14px] font-bold text-slate-900 line-clamp-2 group-hover:text-[#2563EB] transition-colors leading-snug">
            {product.name}
          </h3>

          {/* 5 Gold Stars Rating */}
          <div className="flex items-center text-amber-400 gap-0.5 pt-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
              />
            ))}
          </div>

          {/* Price Row: Strikethrough MRP on left, Bold Coral-Red Sale Price on right */}
          <div className="flex items-baseline justify-between gap-1 pt-1">
            <span className="text-xs sm:text-sm text-slate-400 font-medium line-through">
              ₹{displayMrp.toLocaleString("en-IN")}.00
            </span>
            <span className="text-sm sm:text-base font-extrabold text-[#FF3B30]">
              ₹{displayPrice.toLocaleString("en-IN")}.00
            </span>
          </div>
        </Link>

        {/* Add to Cart or Out of Stock WhatsApp Inquiry Button */}
        {product.inStock !== false ? (
          <button
            onClick={handleAddToCart}
            className={`w-full py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl border text-[11px] sm:text-xs font-bold uppercase tracking-normal sm:tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-150 active:scale-95 cursor-pointer shadow-2xs whitespace-nowrap overflow-hidden ${
              isAdded
                ? "bg-emerald-600 border-emerald-600 text-white"
                : "border-[#2563EB] text-[#2563EB] bg-white hover:bg-[#2563EB] hover:text-white active:bg-blue-50"
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap font-bold">ADDED!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap font-bold">ADD TO CART</span>
              </>
            )}
          </button>
        ) : (
          <a
            href={`https://wa.me/918709789641?text=${encodeURIComponent(
              `Hello Prayog India, I want to inquire about the out-of-stock product: ${product.name}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-full py-2 sm:py-2.5 px-1.5 sm:px-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-[10px] sm:text-[11px] font-bold tracking-tight flex items-center justify-center gap-1.5 transition-all duration-150 active:scale-95 cursor-pointer shadow-2xs whitespace-nowrap overflow-hidden"
            title="Out of Stock — Inquire on WhatsApp"
          >
            <WhatsAppIcon className="w-3.5 h-3.5 fill-white shrink-0" />
            <span className="truncate">Out of Stock — Inquire on WhatsApp</span>
          </a>
        )}
      </div>
    </div>
  );
};

export const FeaturedCategories: React.FC<Props> = ({
  onAddToCart,
  onToggleWishlist,
  onQuickView,
  wishlistIds = [],
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  // Filtered popular products based on selected category tab
  const filteredProducts = React.useMemo(() => {
    if (activeTab === "all") {
      return POPULAR_PRODUCTS_DATA;
    }
    const currentTabObj = POPULAR_TABS.find((t) => t.id === activeTab);
    if (!currentTabObj?.match) {
      return POPULAR_PRODUCTS_DATA;
    }
    const matches = POPULAR_PRODUCTS_DATA.filter((p) =>
      currentTabObj.match!.some(
        (cat) =>
          p.category.toLowerCase().includes(cat.toLowerCase()) ||
          p.subcategory?.toLowerCase().includes(cat.toLowerCase()),
      ),
    );
    return matches.length > 0 ? matches : POPULAR_PRODUCTS_DATA;
  }, [activeTab]);

  // Check scroll boundary state for arrows
  const checkScrollState = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    checkScrollState();
    el.addEventListener("scroll", checkScrollState, { passive: true });
    window.addEventListener("resize", checkScrollState);
    return () => {
      el.removeEventListener("scroll", checkScrollState);
      window.removeEventListener("resize", checkScrollState);
    };
  }, [checkScrollState, filteredProducts]);

  // Handle smooth button scrolling
  const handleManualScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const containerWidth = scrollContainerRef.current.clientWidth;
      const scrollAmount =
        direction === "left" ? -containerWidth * 0.75 : containerWidth * 0.75;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="pt-3 sm:pt-6 pb-6 sm:pb-8 lg:py-10 bg-white select-none">
      <div className="w-full px-3.5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 space-y-3 sm:space-y-6">
        {/* Section Header: Title + Subtitle on Left, Category Tabs on Right */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-100 pb-2 sm:pb-3 gap-2 sm:gap-3">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg sm:text-2xl md:text-[26px] font-bold text-slate-900 tracking-tight">
                  Popular Products
                </h2>
                <div className="hidden sm:block w-10 h-1 bg-[#FFC20E] rounded-full" />
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-3 sm:gap-5 overflow-x-auto scrollbar-none pt-1 sm:pt-0 pb-0.5 -mx-1 px-1">
            {POPULAR_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollTo({
                      left: 0,
                      behavior: "smooth",
                    });
                  }
                }}
                className={`text-xs sm:text-[13px] font-bold uppercase tracking-wider transition-all pb-1 whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === tab.id
                    ? "text-[#2563EB] border-b-2 border-[#2563EB]"
                    : "text-slate-500 hover:text-slate-800 border-b-2 border-transparent"
                }`}
              >
                {tab.label}
              </button>
            ))}
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
          </div>
        </div>

        {/* Full-Width Product Carousel with Floating Circular Navigation Arrows */}
        <div className="relative group/slider">
          {/* Left Floating Arrow Button */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => handleManualScroll("left")}
              aria-label="Previous Products"
              className="absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:bg-[#FFC20E] hover:text-slate-950 hover:border-[#FFC20E] transition-all cursor-pointer active:scale-90"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Right Floating Arrow Button */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => handleManualScroll("right")}
              aria-label="Next Products"
              className="absolute -right-3 sm:-right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:bg-[#FFC20E] hover:text-slate-950 hover:border-[#FFC20E] transition-all cursor-pointer active:scale-90"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Smooth Snap Scrollable Track */}
          <div
            ref={scrollContainerRef}
            className="flex gap-3.5 sm:gap-5 overflow-x-auto scroll-smooth py-2 px-1 snap-x snap-mandatory touch-pan-x touch-pan-y no-scrollbar"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
              touchAction: "pan-x pan-y",
            }}
          >
            {filteredProducts.map((product) => {
              const isWishlisted = wishlistIds.includes(product.id);

              return (
                <PopularProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                  onToggleWishlist={onToggleWishlist}
                  onQuickView={onQuickView}
                  isWishlisted={isWishlisted}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
