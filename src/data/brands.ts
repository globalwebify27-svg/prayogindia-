import { PRODUCTS } from "@/data/mockData";

export interface Brand {
  id: string;
  name: string;
  count: number;
}

/**
 * Returns the verified, canonical brand for any product in the Prayog India store.
 * Inspects explicit `brand` property first, then falls back to brand detection
 * based on product title, MCU model, or manufacturer prefix.
 */
export function getProductBrand(product: {
  id?: string;
  name?: string;
  brand?: string;
  category?: string;
}): string {
  if (product.brand && product.brand.trim()) {
    const raw = product.brand.trim();
    const lower = raw.toLowerCase();
    if (lower === "prayog india" || lower === "prayog") return "Prayog India";
    if (lower === "espressif systems" || lower === "espressif") return "Espressif";
    if (lower === "stm" || lower === "stmicroelectronics") return "STMicroelectronics";
    if (lower === "arduino") return "Arduino";
    if (lower === "raspberry pi") return "Raspberry Pi";
    if (lower !== "generic" && lower !== "unknown") return raw;
  }

  const text = `${product.id || ""} ${product.name || ""}`.toLowerCase();

  if (text.includes("arduino") || text.includes("atmega328p") || text.includes("atmega32u4") || text.includes("atmega2560")) {
    return "Arduino";
  }
  if (text.includes("raspberry pi") || text.includes("rpi-") || text.includes("rpi 5") || text.includes("rpi 4")) {
    return "Raspberry Pi";
  }
  if (text.includes("jetson") || text.includes("nvidia")) {
    return "NVIDIA";
  }
  if (text.includes("esp32") || text.includes("esp8266") || text.includes("nodemcu") || text.includes("espressif")) {
    return "Espressif";
  }
  if (text.includes("stm32") || text.includes("stmicroelectronics") || text.includes("nucleo") || text.includes("blue pill")) {
    return "STMicroelectronics";
  }
  if (text.includes("pixhawk")) {
    return "Pixhawk";
  }
  if (text.includes("holybro")) {
    return "Holybro";
  }
  if (text.includes("speedybee")) {
    return "SpeedyBee";
  }
  if (text.includes("flysky")) {
    return "FlySky";
  }
  if (text.includes("foxeer")) {
    return "Foxeer";
  }
  if (text.includes("gemfan")) {
    return "Gemfan";
  }
  if (text.includes("matek")) {
    return "Matek Systems";
  }
  if (text.includes("towerpro") || text.includes("mg996r") || text.includes("sg90")) {
    return "TowerPro";
  }
  if (text.includes("benewake") || text.includes("tf-luna")) {
    return "Benewake";
  }
  if (text.includes("bme280") || text.includes("bosch") || text.includes("bmp280")) {
    return "Bosch";
  }
  if (text.includes("mpu6050") || text.includes("mpu-6050") || text.includes("invensense")) {
    return "InvenSense";
  }
  if (text.includes("seeed") || text.includes("xiao")) {
    return "Seeed Studio";
  }
  if (text.includes("orange pi")) {
    return "Orange Pi";
  }
  if (text.includes("beaglebone") || text.includes("beagleboard")) {
    return "BeagleBoard";
  }
  if (text.includes("teensy")) {
    return "Teensy";
  }
  if (text.includes("nema")) {
    return "NEMA";
  }

  // Official Prayog India in-house robotics, STEM kits, custom drivers, and hardware
  return "Prayog India";
}

/**
 * Normalizes category input to standard keywords for resilient cross-view matching.
 */
export function normalizeCategoryKey(cat?: string | null): string | null {
  if (!cat) return null;
  const c = cat.toLowerCase().trim();
  if (c.includes("electronic") || c.includes("component")) return "electronic-components";
  if (c.includes("robot")) return "robotics";
  if (c.includes("dev") || c.includes("arduino") || c.includes("microcontroller") || c.includes("single board"))
    return "development-boards";
  if (c.includes("drone") || c.includes("uav")) return "drone-technology";
  if (c.includes("sensor") || c.includes("iot") || c.includes("wireless")) return "sensors-iot";
  if (c.includes("batter") || c.includes("power")) return "batteries-power";
  if (c.includes("mechanic") || c.includes("hardware") || c.includes("motor") || c.includes("stepper"))
    return "mechanical-hardware";
  if (c.includes("stem") || c.includes("edu")) return "educational-stem-kits";
  if (c.includes("industrial") || c.includes("automation")) return "industrial-automation";
  return c;
}

/**
 * Checks if a product belongs to a given category filter.
 */
function isProductInCategory(
  product: { category?: string; subcategory?: string; name?: string },
  selectedCategory: string
): boolean {
  const normTarget = normalizeCategoryKey(selectedCategory);
  if (!normTarget) return true;

  const prodCat = (product.category || "").toLowerCase();
  const prodSub = (product.subcategory || "").toLowerCase();
  const prodName = (product.name || "").toLowerCase();
  const targetLower = selectedCategory.toLowerCase();

  // Direct name or substring match
  if (prodCat.includes(targetLower) || targetLower.includes(prodCat)) return true;
  if (prodSub.includes(targetLower) || targetLower.includes(prodSub)) return true;

  // Normalized key match
  const normProd = normalizeCategoryKey(product.category);
  if (normProd && normProd === normTarget) return true;

  // Keyword associations
  if (normTarget === "drone-technology" && (prodCat.includes("drone") || prodCat.includes("uav") || prodName.includes("fpv") || prodName.includes("flight controller"))) return true;
  if (normTarget === "robotics" && (prodCat.includes("robot") || prodName.includes("robot") || prodName.includes("chassis") || prodName.includes("rover"))) return true;
  if (normTarget === "educational-stem-kits" && (prodCat.includes("stem") || prodCat.includes("educational") || prodName.includes("kit"))) return true;
  if (normTarget === "development-boards" && (prodCat.includes("microcontroller") || prodCat.includes("dev board") || prodCat.includes("single board") || prodCat.includes("arduino"))) return true;
  if (normTarget === "sensors-iot" && (prodCat.includes("sensor") || prodCat.includes("iot") || prodCat.includes("wireless"))) return true;
  if (normTarget === "mechanical-hardware" && (prodCat.includes("motor") || prodCat.includes("stepper") || prodCat.includes("mechanical"))) return true;

  return false;
}

/**
 * Returns strictly available brands dynamically calculated from the live product list.
 * Only brands with actual products (> 0) in the given category/catalog are returned.
 */
export function getBrandsForCategory(
  selectedCategory?: string | null,
  rawProducts?: Array<{ id?: string; name: string; brand?: string; category?: string; subcategory?: string }>
): Brand[] {
  const source = rawProducts && rawProducts.length > 0 ? rawProducts : PRODUCTS;

  // Filter products by category if specified
  const filteredProducts = selectedCategory
    ? source.filter((p) => isProductInCategory(p, selectedCategory))
    : source;

  // Count products per brand
  const brandCountMap = new Map<string, number>();

  filteredProducts.forEach((p) => {
    // Exclude sub-objects like review/variant entries if present
    if (p.id && (p.id.startsWith("var-") || p.id.startsWith("rev-") || p.id.startsWith("v-") || /^\d+$/.test(p.id))) {
      return;
    }
    const brand = getProductBrand(p);
    brandCountMap.set(brand, (brandCountMap.get(brand) || 0) + 1);
  });

  return Array.from(brandCountMap.entries())
    .filter(([, count]) => count > 0)
    .map(([name, count]) => ({
      id: `b-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      name,
      count,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

// Fallback site-wide brand registry computed from actual catalog
export const BRANDS_DATA: Brand[] = getBrandsForCategory(null, PRODUCTS);
