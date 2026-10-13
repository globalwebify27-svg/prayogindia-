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
} from "lucide-react";
import { Product } from "@/data/mockData";
import { useStore } from "@/context/StoreContext";
import { haptic } from "@/utils/haptics";

interface Props {
  onSelectCategory?: (category: string) => void;
  onAddToCart?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  wishlistIds?: string[];
}

// 16 Distinct, Premium Hardware Products with 100% Unique Images
const POPULAR_PRODUCTS_DATA: Product[] = [
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
    image: "/images/categories/arduino.jpg",
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
    image: "/images/robot_banner_stem.jpg",
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
  product: Product;
  onAddToCart?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  isWishlisted?: boolean;
}

const PopularProductCard: React.FC<PopularProductCardProps> = ({
  product,
  onAddToCart,
}) => {
  const store = useStore();
  const [isAdded, setIsAdded] = useState(false);

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

  const isPng = product.image.endsWith(".png");

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    haptic?.medium?.();

    if (onAddToCart) {
      onAddToCart(product);
    } else if (store?.addToCart) {
      store.addToCart(product);
    }
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div
      id={`popular-product-${product.id}`}
      className="w-[200px] xs:w-[215px] sm:w-[230px] md:w-[245px] shrink-0 snap-start bg-white rounded-2xl border border-slate-200/90 overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col justify-between group font-sans"
    >
      {/* ── Top: Full-Bleed Product Image Container (Zero Padding) ── */}
      <div className="relative w-full aspect-[4/4.5] bg-slate-50 overflow-hidden">
        {/* Rounded Squircle Discount Badge in Top-Left */}
        <div className="absolute top-2.5 left-2.5 z-10 bg-[#FF3B30] text-white text-[11px] font-extrabold px-2 py-0.5 rounded-xl shadow-xs">
          {discountPercent}%
        </div>

        {/* Full Bleed Image with smooth hover scale */}
        <Link
          href={`/products/${product.slug || product.id}`}
          className="relative w-full h-full block cursor-pointer"
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 210px, 260px"
            className={`${
              isPng ? "object-contain p-2.5" : "object-cover object-center"
            } group-hover:scale-105 transition-transform duration-300`}
          />
        </Link>
      </div>

      {/* ── Bottom: Card Details with Comfortable Padding ── */}
      <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between space-y-2.5 bg-white">
        <Link
          href={`/products/${product.slug || product.id}`}
          className="block cursor-pointer space-y-1"
        >
          {/* Brand Name (Clean Slate Title Case) */}
          <div className="text-xs sm:text-[13px] text-slate-500 font-normal leading-tight truncate">
            {product.brand || "Prayog India"}
          </div>

          {/* Product Title (Bold Dark Slate/Black) */}
          <h3 className="text-xs sm:text-[14px] font-bold text-slate-900 line-clamp-2 group-hover:text-[#00AEEF] transition-colors leading-snug">
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

        {/* Add to Cart Outlined Button */}
        <button
          onClick={handleAddToCart}
          className={`w-full py-2 sm:py-2.5 px-3 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-150 active:scale-95 cursor-pointer shadow-2xs ${
            isAdded
              ? "bg-emerald-600 border-emerald-600 text-white"
              : "border-[#FF3B30] text-[#FF3B30] hover:bg-[#FF3B30] hover:text-white"
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>ADDED!</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>ADD TO CART</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export const FeaturedCategories: React.FC<Props> = ({
  onAddToCart,
  onToggleWishlist,
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
    <section className="py-6 sm:py-8 lg:py-10 bg-white select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
        {/* Section Header: Title + Subtitle on Left, Category Tabs on Right */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-100 pb-3 gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-[26px] font-bold text-slate-900 tracking-tight">
              Popular Products
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Do not miss the current offers until the end of March.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-3 sm:gap-5 overflow-x-auto no-scrollbar pt-2 md:pt-0">
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
                className={`text-xs sm:text-[13px] font-bold uppercase tracking-wider transition-all pb-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? "text-[#EF4444] border-b-2 border-[#EF4444]"
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
              className="absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:bg-[#EF4444] hover:text-white hover:border-[#EF4444] transition-all cursor-pointer active:scale-90"
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
              className="absolute -right-3 sm:-right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:bg-[#EF4444] hover:text-white hover:border-[#EF4444] transition-all cursor-pointer active:scale-90"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Smooth Snap Scrollable Track */}
          <div
            ref={scrollContainerRef}
            className="flex gap-3.5 sm:gap-5 overflow-x-auto scroll-smooth py-2 px-1 snap-x snap-mandatory touch-pan-x no-scrollbar"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
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
