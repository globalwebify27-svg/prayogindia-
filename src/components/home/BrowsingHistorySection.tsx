"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Star, ShoppingCart, Check, Eye } from "lucide-react";
import { getOptimizedImageUrl } from "@/lib/cloudinaryUrl";
import { Product } from "@/data/mockData";
import { useStore } from "@/context/StoreContext";
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

interface BrowsingHistorySectionProps {
  title?: string;
  onAddToCart?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
}

// Curated list of genuine Prayog India products with authentic images and accurate reviews
const BROWSING_HISTORY_PRODUCTS: Product[] = [
  {
    id: "ard-uno-r3",
    slug: "arduino-uno-r3-official-rev3-board",
    name: "Arduino UNO R3 Official Rev3 Board (ATmega328P 16MHz DIP)",
    sku: "PRG-ARD-001",
    brand: "Arduino",
    category: "Arduino & Microcontrollers",
    price: 1499,
    mrp: 1999,
    discount: "25% OFF",
    rating: 4.9,
    reviews: 342,
    inStock: true,
    image: "/images/products/arduino-uno-r3.png",
    description: "The Arduino UNO R3 standard microcontroller board for mechatronics, robotics, and STEM tinkering.",
    specs: { Microcontroller: "ATmega328P", Voltage: "5V DC", Clock: "16 MHz" },
  },
  {
    id: "ultrasonic-sensor-hcsr04",
    slug: "ultrasonic-sensor-hcsr04",
    name: "HC-SR04 Precision Ultrasonic Distance Sensor Module (2cm - 400cm)",
    sku: "PRG-SEN-001",
    brand: "Prayog India",
    category: "Sensors & Electronic Modules",
    price: 120,
    mrp: 199,
    discount: "40% OFF",
    rating: 4.8,
    reviews: 1240,
    inStock: true,
    image: "/images/products/ultrasonic-sensor-hcsr04.png",
    description: "Non-contact ultrasonic ranging module with 3mm high precision accuracy.",
    specs: { Range: "2cm - 400cm", OperatingVoltage: "5V DC" },
  },
  {
    id: "esp32-devkit-v1",
    slug: "esp32-devkit-v1",
    name: "ESP32 DevKit V1 30-Pin Dual-Core Wi-Fi & Bluetooth IoT Board",
    sku: "PRG-ESP-001",
    brand: "Espressif",
    category: "IoT & Wireless Modules",
    price: 399,
    mrp: 599,
    discount: "33% OFF",
    rating: 4.8,
    reviews: 620,
    inStock: true,
    image: "/images/products/esp32-devkit-v1.jpg",
    description: "High-performance dual-core 240MHz microcontroller with integrated 802.11b/g/n Wi-Fi and Bluetooth v4.2 BR/EDR.",
    specs: { Core: "Dual 32-bit LX6", RAM: "520 KB", Wireless: "Wi-Fi + BLE" },
  },
  {
    id: "4wd-robot-chassis",
    slug: "4wd-smart-robot-car-chassis-kit",
    name: "4WD Smart Robot Car Chassis Kit with Speed Encoders & Battery Box",
    sku: "PRG-KIT-101",
    brand: "Prayog India",
    category: "Robotics & DIY Kits",
    price: 899,
    mrp: 1399,
    discount: "36% OFF",
    rating: 4.9,
    reviews: 410,
    inStock: true,
    image: "/images/products/4wd-robot-chassis-kit.jpg",
    description: "Complete acrylic autonomous mobile robotics car platform with 4 DC TT motors and wheels.",
    specs: { Motors: "4x TT Gear Motors", Voltage: "3-6V DC" },
  },
  {
    id: "l298n-motor-driver",
    slug: "l298n-dual-h-bridge-motor-driver",
    name: "L298N Dual H-Bridge DC & Stepper Motor Driver Controller Module",
    sku: "PRG-MOT-001",
    brand: "Prayog India",
    category: "Motors, Steppers & Drivers",
    price: 180,
    mrp: 280,
    discount: "36% OFF",
    rating: 4.7,
    reviews: 890,
    inStock: true,
    image: "/images/products/l298n-motor-driver.jpg",
    description: "Heavy-duty dual H-bridge motor driver module capable of driving up to 2A per channel.",
    specs: { DriverChip: "L298N", LogicVoltage: "5V", MaxCurrent: "2A per bridge" },
  },
  {
    id: "esp32-cam-ov2640",
    slug: "esp32-cam-wifi-camera-module",
    name: "ESP32-CAM WiFi + Bluetooth Board with OV2640 2MP Camera Module",
    sku: "PRG-ESP-302",
    brand: "Ai-Thinker",
    category: "IoT & Wireless Modules",
    price: 549,
    mrp: 799,
    discount: "31% OFF",
    rating: 4.7,
    reviews: 780,
    inStock: true,
    image: "/images/products/esp32-cam.jpg",
    description: "Cost-effective vision and AI face recognition board with integrated microSD card slot.",
    specs: { Camera: "OV2640 2MP", Resolution: "UXGA (1600x1200)", Storage: "TF Card up to 4GB" },
  },
  {
    id: "pixhawk-6c-autopilot",
    slug: "pixhawk-6c-flight-controller",
    name: "Pixhawk 6C Autopilot Drone Flight Controller (Triple Redundant IMU)",
    sku: "PRG-UAV-601",
    brand: "Holybro",
    category: "Drones & UAV Parts",
    price: 18999,
    mrp: 22499,
    discount: "16% OFF",
    rating: 4.9,
    reviews: 135,
    inStock: true,
    image: "/images/products/pixhawk-6c.jpg",
    description: "Enterprise-grade autonomous drone autopilot system running PX4 and ArduPilot firmware.",
    specs: { Processor: "STM32H753 480MHz", Sensors: "Triple Redundant IMU", GPS: "M8N/M9N Ready" },
  },
  {
    id: "tt-gear-motor-wheel",
    slug: "tt-gear-motor-with-wheel-65mm",
    name: "TT Dual-Shaft DC Gear Motor (1:48) with 65mm High-Grip Rubber Wheel",
    sku: "PRG-MOT-002",
    brand: "Prayog India",
    category: "Motors, Steppers & Drivers",
    price: 99,
    mrp: 160,
    discount: "38% OFF",
    rating: 4.7,
    reviews: 1450,
    inStock: true,
    image: "/images/products/tt-gear-motor-wheel.png",
    description: "High torque 1:48 gear ratio DC motor paired with 65mm robot rubber wheel.",
    specs: { GearRatio: "1:48", OperatingVoltage: "3-6V DC" },
  },
  {
    id: "nema-17-stepper-motor",
    slug: "nema-17-stepper-motor-high-torque",
    name: "NEMA 17 High-Torque Bipolar Stepper Motor (42BYGH 1.5A 40mm)",
    sku: "PRG-MOT-003",
    brand: "Prayog India",
    category: "Motors, Steppers & Drivers",
    price: 650,
    mrp: 950,
    discount: "32% OFF",
    rating: 4.8,
    reviews: 520,
    inStock: true,
    image: "/images/products/nema-17-stepper.jpg",
    description: "High precision 1.8 degree step angle stepper motor ideal for 3D printers and CNC machines.",
    specs: { StepAngle: "1.8 deg", HoldingTorque: "40 N.cm", RatedCurrent: "1.5A" },
  },
  {
    id: "soldering-iron-kit-60w",
    slug: "soldering-iron-kit-temperature-controlled",
    name: "60W Adjustable Temperature Soldering Iron Kit with 5 Tips & Stand",
    sku: "PRG-TOOL-001",
    brand: "Prayog Tools",
    category: "Robotics & DIY Kits",
    price: 799,
    mrp: 1299,
    discount: "38% OFF",
    rating: 4.8,
    reviews: 630,
    inStock: true,
    image: "/images/products/soldering-iron-kit.jpg",
    description: "Ceramic heater core soldering iron with 200°C - 450°C adjustable temperature dial and solder wire.",
    specs: { Power: "60W", Temperature: "200°C - 450°C", Voltage: "220V AC" },
  },
  {
    id: "3d-printer-hotend-v6",
    slug: "all-metal-v6-hotend-extruder",
    name: "All-Metal V6 Hotend Direct/Bowden Extruder for 1.75mm Filament",
    sku: "PRG-TOOL-002",
    brand: "Prayog Tools",
    category: "Robotics & DIY Kits",
    price: 1199,
    mrp: 1699,
    discount: "29% OFF",
    rating: 4.7,
    reviews: 290,
    inStock: true,
    image: "/images/products/3d-printer-hotend.jpg",
    description: "High temperature all-metal heatbreak hotend capable of printing PLA, ABS, PETG, and Nylon.",
    specs: { Filament: "1.75mm", Nozzle: "0.4mm Brass", MaxTemp: "300°C" },
  },
];

export const BrowsingHistorySection: React.FC<BrowsingHistorySectionProps> = ({
  title = "Recent View",
  onAddToCart,
  onToggleWishlist,
  onQuickView,
}) => {
  const store = useStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(4);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});

  // Calculate pages based on scrollWidth and clientWidth
  const updatePagination = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const scrollLeft = el.scrollLeft;
    const scrollWidth = el.scrollWidth;
    const clientWidth = el.clientWidth;

    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);

    const maxScroll = Math.max(1, scrollWidth - clientWidth);
    const progress = Math.min(1, Math.max(0, scrollLeft / maxScroll));

    const calculatedPages = Math.max(
      2,
      Math.ceil(scrollWidth / Math.max(1, clientWidth)) + 1,
    );
    const pages = Math.min(6, calculatedPages);
    setTotalPages(pages);

    const curr = Math.min(pages, Math.max(1, Math.round(progress * (pages - 1)) + 1));
    setCurrentPage(curr);
  }, []);

  useEffect(() => {
    updatePagination();
    const el = scrollContainerRef.current;
    if (!el) return;

    const handleScroll = () => updatePagination();
    el.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updatePagination);

    return () => {
      el.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updatePagination);
    };
  }, [updatePagination]);

  const scroll = (direction: "left" | "right") => {
    haptic?.selection?.();
    const el = scrollContainerRef.current;
    if (!el) return;

    const scrollAmount = el.clientWidth * 0.82;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const handleAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    haptic?.medium?.();

    if (onAddToCart) {
      onAddToCart(product);
    } else if (store?.addToCart) {
      store.addToCart(product);
    }

    setAddedItemIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [product.id]: false }));
    }, 2000);
  };

  return (
    <section className="py-6 sm:py-8 bg-white border-t border-slate-200/80">
      <div className="w-full px-3.5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        {/* Section Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            {title}
          </h2>
          <div className="text-xs sm:text-[13px] font-medium text-slate-500">
            Page {currentPage} of {totalPages}
          </div>
        </div>

        {/* Carousel Container with Left/Right Navigation */}
        <div className="relative group/carousel mt-3">
          {/* Left Arrow Button */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              aria-label="Previous Page"
              className="absolute -left-2 sm:-left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-10 sm:w-10 sm:h-12 bg-white/95 hover:bg-white border border-slate-300 hover:border-slate-400 rounded-md shadow-md flex items-center justify-center text-slate-800 transition-all active:scale-95 cursor-pointer hover:shadow-lg"
            >
              <ChevronLeft className="w-5 h-5 text-slate-700" />
            </button>
          )}

          {/* Right Arrow Button */}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              aria-label="Next Page"
              className="absolute -right-2 sm:-right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-10 sm:w-10 sm:h-12 bg-white/95 hover:bg-white border border-slate-300 hover:border-slate-400 rounded-md shadow-md flex items-center justify-center text-slate-800 transition-all active:scale-95 cursor-pointer hover:shadow-lg"
            >
              <ChevronRight className="w-5 h-5 text-slate-700" />
            </button>
          )}

          {/* Horizontal Scrolling Items */}
          <div
            ref={scrollContainerRef}
            className="flex items-stretch gap-3.5 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1 snap-x snap-mandatory"
          >
            {BROWSING_HISTORY_PRODUCTS.map((prod) => {
              const displayPrice = prod.price;
              const displayMrp = prod.mrp;
              const discountPercent =
                displayMrp > displayPrice
                  ? Math.round(((displayMrp - displayPrice) / displayMrp) * 100)
                  : 0;
              const isAdded = !!addedItemIds[prod.id];
              const isInStock = prod.inStock !== false;

              return (
                <div
                  key={prod.id}
                  className="w-[170px] sm:w-[195px] md:w-[210px] lg:w-[220px] shrink-0 snap-start flex flex-col justify-between group p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-100/90 hover:border-slate-200 hover:shadow-md transition-all duration-200"
                >
                  {/* Top Portion: Image & Details */}
                  <div className="flex flex-col flex-1">
                    {/* Square Image Box with hover zoom & Quick View */}
                    <div className="relative w-full h-36 sm:h-44 bg-slate-50/50 rounded-xl flex items-center justify-center p-2 mb-2 overflow-hidden border border-slate-100/80 group-hover:border-slate-200 transition-colors">
                      <Link
                        href={`/products/${prod.slug || prod.id}`}
                        className="relative w-full h-full block cursor-pointer"
                      >
                        <Image
                          src={getOptimizedImageUrl(prod.image, {
                            width: 320,
                            quality: "auto",
                          })}
                          alt={prod.name}
                          fill
                          sizes="(max-width: 640px) 170px, 220px"
                          className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>

                      {/* Quick View Button on Hover */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          haptic?.light?.();
                          onQuickView?.(prod);
                        }}
                        className="opacity-0 group-hover:opacity-100 absolute bottom-2 right-2 bg-white/95 hover:bg-white text-slate-700 hover:text-[#2563EB] p-1.5 rounded-md shadow-md border border-slate-200 transition-all active:scale-90 z-10 cursor-pointer"
                        title="Quick View"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Brand Name */}
                    {prod.brand && prod.brand.trim().toLowerCase() !== "prayog india" && (
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
                        {prod.brand}
                      </div>
                    )}

                    {/* Product Title */}
                    <Link
                      href={`/products/${prod.slug || prod.id}`}
                      className="group/title block mt-0.5"
                    >
                      <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 line-clamp-2 group-hover/title:text-[#2563EB] transition-colors leading-snug">
                        {prod.name}
                      </h3>
                    </Link>

                    {/* Prayog India Star Review */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <div className="flex items-center text-amber-400 gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                          />
                        ))}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {prod.reviews}
                      </span>
                    </div>

                    {/* Price Row: Bold Black Price + Strike M.R.P. + Green % Off */}
                    <div className="flex items-baseline flex-wrap gap-1.5 pt-1.5 mt-auto">
                      <span className="text-sm sm:text-base font-extrabold text-slate-900">
                        ₹{displayPrice.toLocaleString("en-IN")}
                      </span>
                      {displayMrp > displayPrice && (
                        <>
                          <span className="text-[11px] sm:text-xs text-slate-400 line-through">
                            ₹{displayMrp.toLocaleString("en-IN")}
                          </span>
                          <span className="text-[11px] sm:text-xs font-bold text-emerald-600">
                            ({discountPercent}% off)
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Add to Cart or Out of Stock Button */}
                  <div className="pt-2.5 mt-2">
                    {isInStock ? (
                      <button
                        onClick={(e) => handleAdd(e, prod)}
                        className={`w-full py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl border text-[11px] sm:text-xs font-bold uppercase tracking-normal sm:tracking-wider flex items-center justify-center gap-1.5 transition-all duration-150 active:scale-95 cursor-pointer shadow-2xs whitespace-nowrap overflow-hidden ${
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
                          `Hello Prayog India, I want to inquire about the out-of-stock product: ${prod.name}`
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
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
