export interface DeliveryCalculationParams {
  subtotal: number;
  totalWeightGrams: number;
  deliveryCity: string;
  pincode: string;
  deliveryOption: "standard" | "ranchi_24h" | "faster_express" | "store_pickup";
  hasRestrictedBattery: boolean;
}

export interface DeliveryCalculationResult {
  option: "standard" | "ranchi_24h" | "faster_express" | "store_pickup";
  fee: number;
  isFree: boolean;
  timelineText: string;
  description: string;
  isRanchiEligible: boolean;
  fasterExpressBreakdown?: {
    baseCharge: number;
    weightCharge: number;
    zoneCharge: number;
  };
}

/**
 * Section 24 Online Delivery Rules Engine
 */
export function calculateDeliveryRules(
  params: DeliveryCalculationParams,
): DeliveryCalculationResult {
  const {
    subtotal,
    totalWeightGrams,
    deliveryCity,
    pincode,
    deliveryOption,
    hasRestrictedBattery,
  } = params;

  // 1. Check Ranchi City Eligibility (PINs starting 834xxx or City = Ranchi)
  const isRanchiEligible =
    deliveryCity.trim().toLowerCase() === "ranchi" ||
    pincode.trim().startsWith("834");

  // Rule 1: Free Delivery over ₹2,000/- for standard delivery
  const isFreeStandard = subtotal >= 2000;

  // 2. Ranchi Delivery: Within 24 Hours
  if (deliveryOption === "ranchi_24h" && isRanchiEligible) {
    return {
      option: "ranchi_24h",
      fee: isFreeStandard ? 0 : 49,
      isFree: isFreeStandard,
      timelineText: "Within 24 Hours",
      description: "Local Ranchi direct warehouse dispatch & doorstep courier.",
      isRanchiEligible: true,
    };
  }

  // 3. Faster Delivery (Express Air/Priority Freight)
  if (deliveryOption === "faster_express") {
    // Faster delivery is chargeable based on weight, zone, and freight mode
    const baseCharge = 120;
    const weightKg = Math.ceil(totalWeightGrams / 1000) || 1;
    const weightCharge = (weightKg - 1) * 60; // ₹60 per extra kg
    const zoneCharge = isRanchiEligible ? 30 : 80; // Distance freight surcharge

    const totalFasterFee = baseCharge + weightCharge + zoneCharge;

    return {
      option: "faster_express",
      fee: hasRestrictedBattery ? 120 : totalFasterFee,
      isFree: false,
      timelineText: hasRestrictedBattery
        ? "2-4 Days (Surface Priority)"
        : "24-48 Hours (Air Priority)",
      description:
        "Priority flight courier (Bluedart/Delhivery Air) with instant dispatch.",
      isRanchiEligible,
      fasterExpressBreakdown: {
        baseCharge,
        weightCharge,
        zoneCharge,
      },
    };
  }

  // 4. Store Pickup
  if (deliveryOption === "store_pickup") {
    return {
      option: "store_pickup",
      fee: 0,
      isFree: true,
      timelineText: "Same-Day Pickup",
      description:
        "Collect immediately from nearest Prayog India Experience Store.",
      isRanchiEligible,
    };
  }

  // 5. Standard Delivery: Free over ₹2,000/-, otherwise standard fee (7-10 days)
  return {
    option: "standard",
    fee: isFreeStandard ? 0 : 99,
    isFree: isFreeStandard,
    timelineText: "7–10 Days",
    description: isFreeStandard
      ? "FREE Standard Surface Logistics (Order over ₹2,000)"
      : "Pan-India standard ground transport & safe packaging.",
    isRanchiEligible,
  };
}
