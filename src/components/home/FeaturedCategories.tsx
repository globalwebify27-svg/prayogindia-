"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import { Product, PRODUCTS } from "@/data/mockData";
import { isProductInCategory } from "@/lib/categoryMapping";
import { haptic } from "@/utils/haptics";
import {
  getCachedPopularProducts,
  hasCachedPopularProducts,
  fetchAndCacheLiveCatalog,
} from "@/lib/productCatalogCache";

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
  const [liveCatalog, setLiveCatalog] = useState<PopularProduct[]>(() =>
    getCachedPopularProducts(POPULAR_PRODUCTS_DATA)
  );
  const [isLoading, setIsLoading] = useState(() => !hasCachedPopularProducts());

  // Sync with live products added from Admin
  useEffect(() => {
    let isMounted = true;
    fetchAndCacheLiveCatalog(POPULAR_PRODUCTS_DATA)
      .then(({ popular }) => {
        if (isMounted) {
          setLiveCatalog(popular);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.warn("FeaturedCategories: API fetch error", err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered popular products based on selected category tab
  const filteredProducts = React.useMemo(() => {
    if (activeTab === "all") {
      return liveCatalog;
    }
    const currentTabObj = POPULAR_TABS.find((t) => t.id === activeTab);
    if (!currentTabObj) {
      return liveCatalog;
    }

    const matches = liveCatalog.filter((p) => {
      // Use universal matcher for the tab ID and labels
      if (
        isProductInCategory(p, currentTabObj.id) ||
        isProductInCategory(p, currentTabObj.label)
      ) {
        return true;
      }
      if (currentTabObj.match) {
        return currentTabObj.match.some((m) => isProductInCategory(p, m));
      }
      return false;
    });

    return matches.length > 0 ? matches : liveCatalog;
  }, [activeTab, liveCatalog]);

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
    <section className="pt-0.5 sm:pt-6 pb-4 sm:pb-8 lg:py-10 bg-white select-none">
      <div className="w-full px-3.5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 space-y-1.5 sm:space-y-6">
        {/* Section Header: Title + Subtitle on Left, Category Tabs on Right */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-100 pb-1.5 sm:pb-3 gap-1.5 sm:gap-3">
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
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="w-[160px] sm:w-[220px] h-[340px] rounded-2xl bg-slate-100 animate-pulse shrink-0 border border-slate-200/60"
                />
              ))
            ) : (
              filteredProducts.map((product) => {
                const isWishlisted = wishlistIds.includes(product.id);

                return (
                  <div
                    key={product.id}
                    className="w-[200px] xs:w-[215px] sm:w-[230px] md:w-[245px] shrink-0 snap-start flex"
                  >
                    <ProductCard
                      product={product}
                      onAddToCart={onAddToCart}
                      onToggleWishlist={onToggleWishlist}
                      onQuickView={onQuickView}
                      isWishlisted={isWishlisted}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
