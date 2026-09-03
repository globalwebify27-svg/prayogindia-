export type ShippingZone =
  | "Within City (Ranchi)"
  | "Within State (Jharkhand)"
  | "Metro to Metro"
  | "Rest of India"
  | "Special / North East";

export type ShippingMode = "Air Freight" | "Surface Freight";

export interface WeightSlabRate {
  id: string;
  minWeightGm: number;
  maxWeightGm: number;
  label: string; // e.g. "0 – 500 gm", "500 gm – 1 Kg", "1 Kg – 2 Kg"
  baseRateRupees: number; // e.g. ₹80, ₹120, ₹180
  zoneMultipliers: Record<ShippingZone, number>;
  courierMultipliers: Record<string, number>;
}

export interface ConfigurableShippingRateTable {
  id: string;
  name: string;
  slabs: WeightSlabRate[];
  hazardousSurcharge: number; // Extra charge for battery / hazardous surface handling
  freeShippingThreshold: number; // Default: ₹2,000
}

export const DEFAULT_SHIPPING_RATE_TABLE: ConfigurableShippingRateTable = {
  id: "rate-table-std-2026",
  name: "Standard Pan-India Dynamic Weight Slab Rate Table",
  freeShippingThreshold: 2000,
  hazardousSurcharge: 30,
  slabs: [
    {
      id: "slab-1",
      minWeightGm: 0,
      maxWeightGm: 500,
      label: "0 – 500 gm",
      baseRateRupees: 80,
      zoneMultipliers: {
        "Within City (Ranchi)": 0.6,
        "Within State (Jharkhand)": 0.8,
        "Metro to Metro": 1.0,
        "Rest of India": 1.2,
        "Special / North East": 1.5,
      },
      courierMultipliers: {
        DELHIVERY: 1.0,
        SHIPROCKET: 1.1,
        XPRESSBEES: 0.9,
        BLUEDART: 1.6,
      },
    },
    {
      id: "slab-2",
      minWeightGm: 501,
      maxWeightGm: 1000,
      label: "500 gm – 1 Kg",
      baseRateRupees: 120,
      zoneMultipliers: {
        "Within City (Ranchi)": 0.6,
        "Within State (Jharkhand)": 0.8,
        "Metro to Metro": 1.0,
        "Rest of India": 1.2,
        "Special / North East": 1.5,
      },
      courierMultipliers: {
        DELHIVERY: 1.0,
        SHIPROCKET: 1.1,
        XPRESSBEES: 0.9,
        BLUEDART: 1.5,
      },
    },
    {
      id: "slab-3",
      minWeightGm: 1001,
      maxWeightGm: 2000,
      label: "1 Kg – 2 Kg",
      baseRateRupees: 180,
      zoneMultipliers: {
        "Within City (Ranchi)": 0.6,
        "Within State (Jharkhand)": 0.8,
        "Metro to Metro": 1.0,
        "Rest of India": 1.2,
        "Special / North East": 1.5,
      },
      courierMultipliers: {
        DELHIVERY: 1.0,
        SHIPROCKET: 1.1,
        XPRESSBEES: 0.9,
        BLUEDART: 1.4,
      },
    },
    {
      id: "slab-4",
      minWeightGm: 2001,
      maxWeightGm: 5000,
      label: "2 Kg – 5 Kg (Heavy Consignment)",
      baseRateRupees: 280,
      zoneMultipliers: {
        "Within City (Ranchi)": 0.6,
        "Within State (Jharkhand)": 0.8,
        "Metro to Metro": 1.0,
        "Rest of India": 1.2,
        "Special / North East": 1.5,
      },
      courierMultipliers: {
        DELHIVERY: 1.0,
        SHIPROCKET: 1.1,
        XPRESSBEES: 0.9,
        BLUEDART: 1.4,
      },
    },
  ],
};

/**
 * Determine shipping zone by PIN code & Destination
 */
export function determineShippingZone(
  pincode: string,
  city: string,
): ShippingZone {
  const pin = pincode.replace(/\D/g, "");
  const c = city.trim().toLowerCase();

  if (pin.startsWith("834") || c === "ranchi") {
    return "Within City (Ranchi)";
  }
  if (pin.startsWith("82") || pin.startsWith("83")) {
    return "Within State (Jharkhand)";
  }
  if (
    pin.startsWith("110") ||
    pin.startsWith("400") ||
    pin.startsWith("560") ||
    pin.startsWith("700") ||
    pin.startsWith("600") ||
    pin.startsWith("500")
  ) {
    return "Metro to Metro";
  }
  if (pin.startsWith("79") || pin.startsWith("78") || pin.startsWith("19")) {
    return "Special / North East";
  }
  return "Rest of India";
}

/**
 * Section 28 Dynamic Shipping Charge Calculator
 */
export function calculatePreciseShippingCharge(params: {
  totalWeightGm: number;
  pincode: string;
  city: string;
  courierCode: string;
  shippingMode: ShippingMode;
  hasRestrictedBatteryOrHazardous: boolean;
  cartSubtotal: number;
  rateTable?: ConfigurableShippingRateTable;
}): {
  chargeRupees: number;
  slabLabel: string;
  baseRate: number;
  zone: ShippingZone;
  zoneMultiplier: number;
  courierMultiplier: number;
  hazardousFee: number;
  isFreeThresholdApplied: boolean;
} {
  const table = params.rateTable || DEFAULT_SHIPPING_RATE_TABLE;
  const weight = Math.max(1, params.totalWeightGm);

  // Check free shipping threshold
  if (
    params.cartSubtotal >= table.freeShippingThreshold &&
    params.shippingMode === "Surface Freight"
  ) {
    const zone = determineShippingZone(params.pincode, params.city);
    return {
      chargeRupees: 0,
      slabLabel: "Orders > ₹2,000 Free Shipping",
      baseRate: 0,
      zone,
      zoneMultiplier: 1.0,
      courierMultiplier: 1.0,
      hazardousFee: 0,
      isFreeThresholdApplied: true,
    };
  }

  // Find matching weight slab (or last slab for heavy parcels)
  let matchingSlab = table.slabs.find(
    (s) => weight >= s.minWeightGm && weight <= s.maxWeightGm,
  );
  if (!matchingSlab) {
    matchingSlab = table.slabs[table.slabs.length - 1];
  }

  const zone = determineShippingZone(params.pincode, params.city);
  const zoneMult = matchingSlab.zoneMultipliers[zone] || 1.0;
  const courierMult =
    matchingSlab.courierMultipliers[params.courierCode.toUpperCase()] || 1.0;
  const modeMult =
    params.shippingMode === "Air Freight" &&
    !params.hasRestrictedBatteryOrHazardous
      ? 1.4
      : 1.0;
  const hazardousFee = params.hasRestrictedBatteryOrHazardous
    ? table.hazardousSurcharge
    : 0;

  const rawCharge = Math.round(
    matchingSlab.baseRateRupees * zoneMult * courierMult * modeMult +
      hazardousFee,
  );

  return {
    chargeRupees: rawCharge,
    slabLabel: matchingSlab.label,
    baseRate: matchingSlab.baseRateRupees,
    zone,
    zoneMultiplier: zoneMult,
    courierMultiplier: courierMult,
    hazardousFee,
    isFreeThresholdApplied: false,
  };
}
