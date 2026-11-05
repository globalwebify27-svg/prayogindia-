import { Product } from "@/data/mockData";

/**
 * Universal Category Matcher for Prayog India
 * Accurately determines if a product belongs to a given category slug or category name.
 * Handles both the 9 canonical domains as well as granular subcategories/tabs.
 */
export function isProductInCategory(
  product: Product,
  categoryIdentifier: string,
): boolean {
  if (!product || !categoryIdentifier) return false;
  const target = categoryIdentifier.toLowerCase().trim();
  if (target === "all" || target === "all-categories") return true;

  const pCat = (product.category || "").toLowerCase().trim();
  const pSub = (product.subcategory || "").toLowerCase().trim();
  const pName = (product.name || "").toLowerCase();
  const pSku = (product.sku || "").toUpperCase();

  // 1. Direct or Partial String Match
  if (pCat === target || pCat.includes(target) || target.includes(pCat)) {
    return true;
  }
  if (pSub && (pSub === target || pSub.includes(target) || target.includes(pSub))) {
    return true;
  }

  // 2. Canonical Domain & Tab Mappings
  // --- Arduino & Microcontrollers ---
  if (
    target.includes("arduino") ||
    target.includes("microcontroller")
  ) {
    return (
      pCat.includes("arduino") ||
      pCat.includes("microcontroller") ||
      pSub.includes("arduino") ||
      pSku.includes("ARD") ||
      pName.includes("arduino") ||
      pName.includes("atmega")
    );
  }

  // --- Drones & UAV Technology ---
  if (
    target.includes("drone") ||
    target.includes("uav") ||
    target.includes("flight controller")
  ) {
    return (
      pCat.includes("drone") ||
      pCat.includes("uav") ||
      pSub.includes("drone") ||
      pSub.includes("flight controller") ||
      pSub.includes("esc") ||
      pSub.includes("propeller") ||
      pSku.includes("DRN") ||
      pSku.includes("UAV") ||
      pName.includes("pixhawk") ||
      pName.includes("flight controller") ||
      pName.includes("propeller") ||
      pName.includes("bldc") ||
      pName.includes("esc")
    );
  }

  // --- Robotics & DIY Kits ---
  if (
    target === "robotics" ||
    target.includes("robot") ||
    target.includes("diy kit")
  ) {
    return (
      (pCat.includes("robot") || pCat.includes("diy kit")) &&
      !pCat.includes("stem") ||
      pSub.includes("robot") ||
      pSku.includes("ROB") ||
      pSku.includes("KIT") ||
      pName.includes("robot") ||
      pName.includes("chassis")
    );
  }

  // --- Development Boards / Single Board Computers (Raspberry Pi, SBC, Dev) ---
  if (
    target.includes("development-board") ||
    target.includes("dev-board") ||
    target.includes("dev board") ||
    target.includes("single board") ||
    target.includes("raspberry")
  ) {
    return (
      pCat.includes("development board") ||
      pCat.includes("single board") ||
      pCat.includes("dev board") ||
      pCat.includes("raspberry") ||
      pCat.includes("sbc") ||
      pCat.includes("jetson") ||
      pSub.includes("raspberry") ||
      pSub.includes("development board") ||
      pSku.includes("SBC") ||
      pSku.includes("DEV") ||
      pSku.includes("RPI") ||
      pName.includes("raspberry pi") ||
      pName.includes("jetson") ||
      pName.includes("esp32")
    );
  }

  // --- Sensors & IoT Modules ---
  if (
    target.includes("sensor") ||
    target.includes("iot") ||
    target.includes("wireless")
  ) {
    return (
      pCat.includes("sensor") ||
      pCat.includes("iot") ||
      pCat.includes("wireless") ||
      pCat.includes("electronic module") ||
      pSub.includes("sensor") ||
      pSub.includes("iot") ||
      pSku.includes("SEN") ||
      pSku.includes("IOT") ||
      pName.includes("sensor") ||
      pName.includes("ultrasonic") ||
      pName.includes("radar") ||
      pName.includes("lidar") ||
      pName.includes("esp32") ||
      pName.includes("lora")
    );
  }

  // --- STEM & Educational Kits ---
  if (
    target.includes("stem") ||
    target.includes("education") ||
    target.includes("tinkering")
  ) {
    return (
      pCat.includes("stem") ||
      pCat.includes("educational") ||
      pCat.includes("tinkering") ||
      pCat.includes("science") ||
      pSub.includes("stem") ||
      pSku.includes("STM") ||
      pName.includes("stem") ||
      pName.includes("science kit") ||
      pName.includes("atl") ||
      pName.includes("educational")
    );
  }

  // --- Motors, Steppers & Drivers ---
  if (
    target.includes("motor") ||
    target.includes("stepper") ||
    target.includes("driver")
  ) {
    return (
      pCat.includes("motor") ||
      pCat.includes("stepper") ||
      pCat.includes("driver") ||
      pSub.includes("motor") ||
      pSub.includes("driver") ||
      pSku.includes("MOT") ||
      pName.includes("motor") ||
      pName.includes("stepper") ||
      pName.includes("driver") ||
      pName.includes("nema") ||
      pName.includes("servo")
    );
  }

  // --- Electronic Components (Resistors, Capacitors, ICs, Relays, LEDs) ---
  if (
    target.includes("electronic-component") ||
    target.includes("component") ||
    target.includes("passive") ||
    target.includes("resistor") ||
    target.includes("capacitor") ||
    target.includes("ic") ||
    target.includes("relay")
  ) {
    return (
      pCat.includes("component") ||
      pCat.includes("resistor") ||
      pCat.includes("capacitor") ||
      pCat.includes("relay") ||
      pCat.includes("diode") ||
      pCat.includes("transistor") ||
      pCat.includes("ic") ||
      pSub.includes("resistor") ||
      pSub.includes("capacitor") ||
      pSub.includes("ic") ||
      pSub.includes("relay") ||
      pSku.includes("CMP") ||
      pSku.includes("RES") ||
      pSku.includes("CAP") ||
      pSku.includes("REL")
    );
  }

  // --- Batteries & Power ---
  if (
    target.includes("battery") ||
    target.includes("power") ||
    target.includes("charger")
  ) {
    return (
      pCat.includes("battery") ||
      pCat.includes("power") ||
      pSub.includes("battery") ||
      pSku.includes("BAT") ||
      pSku.includes("PWR") ||
      pName.includes("lipo") ||
      pName.includes("battery") ||
      pName.includes("bms")
    );
  }

  // --- Mechanical, 3D & Hardware ---
  if (
    target.includes("mechanical") ||
    target.includes("hardware") ||
    target.includes("3d")
  ) {
    return (
      pCat.includes("mechanical") ||
      pCat.includes("hardware") ||
      pCat.includes("3d") ||
      pSub.includes("mechanical") ||
      pSub.includes("hardware") ||
      pSku.includes("MEC") ||
      pSku.includes("HRD")
    );
  }

  // --- Industrial Automation ---
  if (
    target.includes("industrial") ||
    target.includes("automation") ||
    target.includes("plc")
  ) {
    return (
      pCat.includes("industrial") ||
      pCat.includes("automation") ||
      pSub.includes("automation") ||
      pSku.includes("IND") ||
      pSku.includes("AUT")
    );
  }

  return false;
}

