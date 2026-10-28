"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Star, ShoppingCart, Check, Eye } from "lucide-react";
import { getOptimizedImageUrl } from "@/lib/cloudinaryUrl";
import { Product } from "@/data/mockData";
import { useCartStore, useWishlistStore } from "@/store";
import { haptic } from "@/utils/haptics";
import { getRecentlyViewedProducts, recordProductView } from "@/utils/recentProducts";

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
    id: "robotic-arm-4dof",
    slug: "4-dof-acrylic-robotic-arm-manipulator-kit",
    name: "4-DOF Acrylic Robotic Arm Manipulator Kit with Servos",
    sku: "PRG-KIT-101",
    brand: "Prayog India",
    category: "Robotics & DIY Kits",
    price: 2499,
    mrp: 3499,
    discount: "29% OFF",
    rating: 4.7,
    reviews: 145,
    inStock: true,
    image: "/images/products/4wd-robot-chassis-kit.jpg",
    description: "4-degree-of-freedom robotic arm assembly kit with 4x MG996R metal gear servos.",
    specs: { Servos: "4x MG996R", Reach: "20cm", Payload: "150g" },
  },
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
  const addToCartStore = useCartStore((s) => s.addToCart);
  const toggleWishlistStore = useWishlistStore((s) => s.toggleWishlist);
  const wishlist = useWishlistStore((s) => s.wishlist);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(4);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});
  const [productsList, setProductsList] = useState<Product[]>(BROWSING_HISTORY_PRODUCTS);

  // Sync customer's real-time recently viewed items from localStorage, merged with popular products
  useEffect(() => {
    const loadRecentlyViewed = () => {
      const recents = getRecentlyViewedProducts();
      if (recents && recents.length > 0) {
        const seen = new Set<string>();
        const merged: Product[] = [];

        // 1. Customer's recently viewed products first
        for (const p of recents) {
          if (p && p.id && !seen.has(p.id)) {
            seen.add(p.id);
            merged.push(p);
          }
        }

        // 2. Backfill with popular store products
        for (const p of BROWSING_HISTORY_PRODUCTS) {
          if (p && p.id && !seen.has(p.id)) {
            seen.add(p.id);
            merged.push(p);
          }
        }

        setProductsList(merged);
      } else {
        setProductsList(BROWSING_HISTORY_PRODUCTS);
      }
    };

    loadRecentlyViewed();

    window.addEventListener("prayog_recent_products_updated", loadRecentlyViewed);
    window.addEventListener("storage", loadRecentlyViewed);
    return () => {
      window.removeEventListener("prayog_recent_products_updated", loadRecentlyViewed);
      window.removeEventListener("storage", loadRecentlyViewed);
    };
  }, []);

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
  }, [updatePagination, productsList]);

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
    } else {
      addToCartStore(product);
    }

    setAddedItemIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [product.id]: false }));
    }, 2000);
  };

  const handleBuyNow = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    haptic?.medium?.();

    if (onAddToCart) {
      onAddToCart(product);
    } else {
      addToCartStore(product);
    }
    window.location.href = "/cart";
  };

  const handleToggleWishlist = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    haptic?.light?.();

    if (onToggleWishlist) {
      onToggleWishlist(product);
    } else {
      toggleWishlistStore(product);
    }
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
        <div className="relative group/carousel mt-2">
          {/* Left Arrow Button */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              aria-label="Previous Page"
              className="absolute -left-2 sm:-left-3 top-1/2 -translate-y-1/2 z-30 w-8 h-10 sm:w-10 sm:h-12 bg-white/95 hover:bg-white border border-slate-300 hover:border-slate-400 rounded-md shadow-md flex items-center justify-center text-slate-800 transition-all active:scale-95 cursor-pointer hover:shadow-lg"
            >
              <ChevronLeft className="w-5 h-5 text-slate-700" />
            </button>
          )}

          {/* Right Arrow Button */}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              aria-label="Next Page"
              className="absolute -right-2 sm:-right-3 top-1/2 -translate-y-1/2 z-30 w-8 h-10 sm:w-10 sm:h-12 bg-white/95 hover:bg-white border border-slate-300 hover:border-slate-400 rounded-md shadow-md flex items-center justify-center text-slate-800 transition-all active:scale-95 cursor-pointer hover:shadow-lg"
            >
              <ChevronRight className="w-5 h-5 text-slate-700" />
            </button>
          )}

          {/* Horizontal Scrolling Items */}
          <div
            ref={scrollContainerRef}
            className="recent-view-scope flex items-stretch gap-4 sm:gap-5 overflow-x-auto no-scrollbar scroll-smooth py-8 px-3 snap-x snap-mandatory"
          >
            {productsList.map((prod) => {
              const displayPrice = prod.price;
              const displayMrp = prod.mrp;
              const discountPercent =
                displayMrp > displayPrice
                  ? Math.round(((displayMrp - displayPrice) / displayMrp) * 100)
                  : 0;
              const isAdded = !!addedItemIds[prod.id];
              const isInStock = prod.inStock !== false;
              const isWishlisted = wishlist.some((p) => p.id === prod.id);

              return (
                <div key={prod.id} className="card shrink-0 snap-start">
                  {/* Top Image Container: Full Width Cover with Curved Corner */}
                  <div className="image-container">
                    <Link
                      href={`/products/${prod.slug || prod.id}`}
                      onClick={() => recordProductView(prod)}
                      className="relative w-full h-full block cursor-pointer rounded-[0.75rem] rounded-tr-[4rem] overflow-hidden bg-white"
                    >
                      <Image
                        src={getOptimizedImageUrl(prod.image, {
                          width: 400,
                          quality: "auto",
                        })}
                        alt={prod.name}
                        fill
                        sizes="240px"
                        className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                      />
                    </Link>
                    <div className="price">₹{displayPrice.toLocaleString("en-IN")}</div>
                  </div>

                  {/* Floating Favorite Wishlist Heart */}
                  <label
                    className="favorite"
                    onClick={(e) => handleToggleWishlist(e, prod)}
                    title={isWishlisted ? "Wishlisted" : "Add to Wishlist"}
                  >
                    <input
                      type="checkbox"
                      checked={isWishlisted}
                      onChange={() => {}}
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path d="M12 20a1 1 0 0 1-.437-.1C11.214 19.73 3 15.671 3 9a5 5 0 0 1 8.535-3.536l.465.465.465-.465A5 5 0 0 1 21 9c0 6.646-8.212 10.728-8.562 10.9A1 1 0 0 1 12 20z" />
                    </svg>
                  </label>

                  {/* Card Content with Prayog India Authentic Details */}
                  <div className="content">
                    {prod.brand && (
                      <div className="brand">{prod.brand}</div>
                    )}
                    <Link
                      href={`/products/${prod.slug || prod.id}`}
                      onClick={() => recordProductView(prod)}
                      className="block"
                    >
                      <h3 className="product-name" title={prod.name}>
                        {prod.name}
                      </h3>
                    </Link>

                    {/* Rating row: 4/5 amber stars + review count */}
                    <div className="rating">
                      <div className="flex items-center text-amber-500 gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(prod.rating || 4)
                                ? "fill-amber-400 text-amber-400"
                                : "fill-slate-200 text-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="reviews-count">
                        {prod.reviews || 45}
                      </span>
                    </div>

                    {/* Limited Time Deal Badge */}
                    {discountPercent > 15 && (
                      <div className="deal-badge">
                        LIMITED TIME DEAL
                      </div>
                    )}

                    {/* Price Row */}
                    <div className="price-row">
                      <span className="price-main">
                        ₹{displayPrice.toLocaleString("en-IN")}
                      </span>
                      {displayMrp > displayPrice && (
                        <>
                          <span className="price-mrp">
                            ₹{displayMrp.toLocaleString("en-IN")}
                          </span>
                          <span className="price-discount">
                            ({discountPercent}% off)
                          </span>
                        </>
                      )}
                    </div>

                    {/* Real Product Specs / Highlights */}
                    {prod.specs && (
                      <div className="specs-container">
                        {Object.entries(prod.specs).slice(0, 2).map(([key, val]) => (
                          <span key={key} className="spec-pill" title={`${key}: ${val}`}>
                            {val}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Button Container: Buy Now + Add to Cart in Prayog Theme */}
                  <div className="button-container">
                    {isInStock ? (
                      <>
                        <button
                          type="button"
                          className="buy-button button"
                          onClick={(e) => handleBuyNow(e, prod)}
                        >
                          Buy Now
                        </button>
                        <button
                          type="button"
                          className="cart-button button"
                          aria-label="Add to cart"
                          title="Add to cart"
                          onClick={(e) => handleAdd(e, prod)}
                        >
                          {isAdded ? (
                            <Check className="w-4 h-4 text-white" />
                          ) : (
                            <svg viewBox="0 0 27.97 25.074" xmlns="http://www.w3.org/2000/svg">
                              <path d="M0,1.175A1.173,1.173,0,0,1,1.175,0H3.4A2.743,2.743,0,0,1,5.882,1.567H26.01A1.958,1.958,0,0,1,27.9,4.035l-2.008,7.459a3.532,3.532,0,0,1-3.4,2.61H8.36l.264,1.4a1.18,1.18,0,0,0,1.156.955H23.9a1.175,1.175,0,0,1,0,2.351H9.78a3.522,3.522,0,0,1-3.462-2.865L3.791,2.669A.39.39,0,0,0,3.4,2.351H1.175A1.173,1.173,0,0,1,0,1.175ZM6.269,22.724a2.351,2.351,0,1,1,2.351,2.351A2.351,2.351,0,0,1,6.269,22.724Zm16.455-2.351a2.351,2.351,0,1,1-2.351,2.351A2.351,2.351,0,0,1,22.724,20.373Z" id={`cart-icon-${prod.id}`} />
                            </svg>
                          )}
                        </button>
                      </>
                    ) : (
                      <a
                        href={`https://wa.me/918709789641?text=${encodeURIComponent(
                          `Hello Prayog India, I want to inquire about the out-of-stock product: ${prod.name}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="buy-button button !bg-emerald-600 hover:!bg-emerald-700 !text-white text-center flex items-center justify-center gap-1.5"
                        style={{ width: "100%", borderRadius: "1.4rem" }}
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5 fill-white shrink-0" />
                        <span className="truncate">Inquire on WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scoped CSS Matching the exact user card design in Prayog India color theme */}
      <style>{`
        .recent-view-scope .card {
          --accent-color: #2563EB;
          position: relative;
          width: 240px;
          background: white;
          border-radius: 1rem;
          padding: 0.4rem;
          box-shadow: rgba(100, 100, 111, 0.15) 0px 20px 30px -10px, 0 1px 3px 0 rgba(0, 0, 0, 0.05);
          border: 1px solid #f1f5f9;
          transition: all 0.35s ease-in-out;
          display: flex;
          flex-direction: column;
        }

        .recent-view-scope .card:hover {
          transform: scale(1.03);
          box-shadow: rgba(37, 99, 235, 0.16) 0px 25px 35px -12px, 0 2px 8px 0 rgba(0, 0, 0, 0.06);
          border-color: #cbd5e1;
        }

        .recent-view-scope .card .image-container {
          position: relative;
          width: 100%;
          height: 155px;
          border-radius: 0.75rem;
          border-top-right-radius: 4rem;
          margin-bottom: 0.85rem;
          background: #ffffff;
          overflow: visible;
        }

        .recent-view-scope .card .image-container img {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          border-radius: inherit;
        }

        .recent-view-scope .card .image-container .price {
          position: absolute;
          right: 0.7rem;
          bottom: -0.95rem;
          background: white;
          color: var(--accent-color);
          font-weight: 900;
          font-size: 0.95rem;
          padding: 0.4rem 0.75rem;
          border-radius: 1rem 1rem 2rem 2rem;
          box-shadow: rgba(15, 23, 42, 0.12) 0px 4px 14px 0px;
          z-index: 10;
          line-height: 1;
          border: 1px solid #f1f5f9;
        }

        .recent-view-scope .card .favorite {
          position: absolute;
          width: 26px;
          height: 26px;
          top: 8px;
          right: 8px;
          cursor: pointer;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(4px);
          border-radius: 50%;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
          transition: all 0.2s ease;
        }

        .recent-view-scope .card .favorite:hover {
          background: #ffffff;
          transform: scale(1.1);
        }

        .recent-view-scope .card .favorite input {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .recent-view-scope .card .favorite input:checked ~ svg {
          animation: rvBouncing 0.5s;
          fill: #ef4444;
          filter: drop-shadow(0px 2px 4px rgba(239, 68, 68, 0.25));
        }

        .recent-view-scope .card .favorite svg {
          width: 16px;
          height: 16px;
          fill: #94a3b8;
          transition: fill 0.2s ease;
        }

        .recent-view-scope .card .content {
          padding: 0 0.6rem;
          margin-bottom: 0.75rem;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .recent-view-scope .card .content .brand {
          font-weight: 800;
          color: #94a3b8;
          font-size: 0.68rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          line-height: 1.2;
          margin-bottom: 0.15rem;
        }

        .recent-view-scope .card .content .product-name {
          font-weight: 700;
          color: #0f172a;
          font-size: 0.82rem;
          line-height: 1.35;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          height: 2.25rem;
          transition: color 0.15s ease;
          margin-bottom: 0.35rem;
        }

        .recent-view-scope .card .content .product-name:hover {
          color: #2563eb;
        }

        .recent-view-scope .card .content .rating {
          color: #64748b;
          font-size: 0.7rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          margin-bottom: 0.35rem;
        }

        .recent-view-scope .card .content .rating .reviews-count {
          font-size: 0.7rem;
          font-weight: 600;
          color: #64748b;
        }

        .recent-view-scope .card .content .deal-badge {
          background: #CC0C39;
          color: white;
          font-size: 0.62rem;
          font-weight: 900;
          padding: 0.15rem 0.45rem;
          border-radius: 2px;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          display: inline-block;
          align-self: flex-start;
          margin-bottom: 0.4rem;
          line-height: 1.2;
        }

        .recent-view-scope .card .content .price-row {
          display: flex;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 0.4rem;
          margin-bottom: 0.4rem;
        }

        .recent-view-scope .card .content .price-main {
          font-size: 1.05rem;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: -0.02em;
        }

        .recent-view-scope .card .content .price-mrp {
          font-size: 0.72rem;
          color: #94a3b8;
          text-decoration: line-through;
        }

        .recent-view-scope .card .content .price-discount {
          font-size: 0.72rem;
          font-weight: 700;
          color: #16a34a;
        }

        .recent-view-scope .card .content .specs-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.3rem;
          margin-top: auto;
          padding-top: 0.15rem;
        }

        .recent-view-scope .card .content .spec-pill {
          font-size: 0.62rem;
          font-weight: 600;
          color: #475569;
          background: #f1f5f9;
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
          border: 1px solid #e2e8f0;
        }

        .recent-view-scope .card .button-container {
          display: flex;
          gap: 0.35rem;
          padding: 0 0.1rem;
        }

        .recent-view-scope .card .button-container .button {
          border-radius: 1.4rem 1.4rem 0.7rem 0.7rem;
          border: none;
          padding: 0.55rem 0;
          background: var(--accent-color);
          color: white;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
          text-decoration: none;
        }

        .recent-view-scope .card .button-container .button:hover {
          background: #1d4ed8;
        }

        .recent-view-scope .card .button-container .buy-button {
          flex: auto;
          font-size: 0.78rem;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .recent-view-scope .card .button-container .cart-button {
          display: grid;
          place-content: center;
          width: 48px;
          flex-shrink: 0;
        }

        .recent-view-scope .card .button-container .cart-button svg {
          width: 15px;
          fill: white;
        }

        .recent-view-scope .card:hover {
          transform: scale(1.03);
        }

        @keyframes rvBouncing {
          from, to {
            transform: scale(1, 1);
          }
          25% {
            transform: scale(1.5, 2.1);
          }
          50% {
            transform: scale(2.1, 1.5);
          }
          75% {
            transform: scale(1.5, 2.05);
          }
        }
      `}</style>
    </section>
  );
};
