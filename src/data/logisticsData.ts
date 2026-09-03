export interface CourierPartner {
  id: string;
  name: string;
  code: "DELHIVERY" | "SHIPROCKET" | "XPRESSBEES" | "BLUEDART" | "EKART";
  mode: "Air" | "Surface";
  baseRatePer500g: number;
  codAvailable: boolean;
  batteryItemAllowed: boolean;
  avgDeliveryDays: number;
  rating: number;
  integrationActive: boolean;
}

export interface ShipmentManifest {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryCity: string;
  pincode: string;
  courierPartner: string;
  courierCode: string;
  awbNumber: string;
  mode: "Air Priority" | "Surface Ground";
  weightKg: number;
  lengthCm: number;
  breadthCm: number;
  heightCm: number;
  shippingCharge: number;
  status:
    | "Manifest Created"
    | "Pickup Scheduled"
    | "In Transit"
    | "Out for Delivery"
    | "Delivered"
    | "Cancelled"
    | "RTO";
  labelGenerated: boolean;
  labelUrl?: string;
  createdAt: string;
  estimatedDelivery: string;
}

export interface PinServiceabilityResult {
  pincode: string;
  city: string;
  state: string;
  isServiceable: boolean;
  codServiceable: boolean;
  prepaidServiceable: boolean;
  airCourierAllowed: boolean;
  availableCouriers: Array<{
    name: string;
    code: string;
    rate: number;
    etdDays: string;
  }>;
}

export const COURIER_PROVIDERS: CourierPartner[] = [
  {
    id: "c-delhivery",
    name: "Delhivery Surface & Express",
    code: "DELHIVERY",
    mode: "Surface",
    baseRatePer500g: 45,
    codAvailable: true,
    batteryItemAllowed: true,
    avgDeliveryDays: 3,
    rating: 4.8,
    integrationActive: true,
  },
  {
    id: "c-shiprocket",
    name: "Shiprocket Multi-Carrier API",
    code: "SHIPROCKET",
    mode: "Air",
    baseRatePer500g: 65,
    codAvailable: true,
    batteryItemAllowed: false,
    avgDeliveryDays: 2,
    rating: 4.7,
    integrationActive: true,
  },
  {
    id: "c-xpressbees",
    name: "Xpressbees Logistics",
    code: "XPRESSBEES",
    mode: "Surface",
    baseRatePer500g: 40,
    codAvailable: true,
    batteryItemAllowed: true,
    avgDeliveryDays: 4,
    rating: 4.6,
    integrationActive: true,
  },
  {
    id: "c-bluedart",
    name: "Blue Dart Aviation Express",
    code: "BLUEDART",
    mode: "Air",
    baseRatePer500g: 110,
    codAvailable: true,
    batteryItemAllowed: false,
    avgDeliveryDays: 1,
    rating: 4.9,
    integrationActive: true,
  },
];

export const INITIAL_SHIPMENTS: ShipmentManifest[] = [
  {
    id: "shp-101",
    orderNumber: "PRG-2026-8941",
    customerName: "Dr. Om Prakash",
    customerPhone: "+91 98765 43210",
    deliveryCity: "Bengaluru",
    pincode: "560100",
    courierPartner: "Delhivery Surface & Express",
    courierCode: "DELHIVERY",
    awbNumber: "DEL-99228811IN",
    mode: "Surface Ground",
    weightKg: 1.2,
    lengthCm: 25,
    breadthCm: 18,
    heightCm: 10,
    shippingCharge: 95,
    status: "In Transit",
    labelGenerated: true,
    labelUrl: "/labels/DEL-99228811IN.pdf",
    createdAt: "2026-08-24 18:00",
    estimatedDelivery: "2026-08-27",
  },
  {
    id: "shp-102",
    orderNumber: "PRG-2026-7732",
    customerName: "Enamul Haque",
    customerPhone: "+91 91234 56789",
    deliveryCity: "Ranchi",
    pincode: "834001",
    courierPartner: "Xpressbees Logistics",
    courierCode: "XPRESSBEES",
    awbNumber: "XPR-55443322IN",
    mode: "Surface Ground",
    weightKg: 0.8,
    lengthCm: 20,
    breadthCm: 15,
    heightCm: 8,
    shippingCharge: 49,
    status: "Out for Delivery",
    labelGenerated: true,
    labelUrl: "/labels/XPR-55443322IN.pdf",
    createdAt: "2026-08-25 09:30",
    estimatedDelivery: "2026-08-26",
  },
  {
    id: "shp-103",
    orderNumber: "PRG-2026-9012",
    customerName: "IIT Kharagpur Robotics Lab",
    customerPhone: "+91 98112 33445",
    deliveryCity: "Kharagpur",
    pincode: "721302",
    courierPartner: "Blue Dart Aviation Express",
    courierCode: "BLUEDART",
    awbNumber: "BLU-11002299IN",
    mode: "Air Priority",
    weightKg: 3.5,
    lengthCm: 35,
    breadthCm: 25,
    heightCm: 20,
    shippingCharge: 380,
    status: "Manifest Created",
    labelGenerated: false,
    createdAt: "2026-08-26 11:15",
    estimatedDelivery: "2026-08-28",
  },
];

/**
 * Check Real-Time PIN Code Serviceability & Rates
 */
export function checkPincodeServiceability(
  pincode: string,
  weightKg: number = 0.5,
): PinServiceabilityResult {
  const pin = pincode.replace(/\D/g, "");
  if (pin.length !== 6) {
    return {
      pincode: pin,
      city: "Unknown",
      state: "Unknown",
      isServiceable: false,
      codServiceable: false,
      prepaidServiceable: false,
      airCourierAllowed: false,
      availableCouriers: [],
    };
  }

  // City deduction by PIN range
  let city = "Metro Regional Hub";
  let state = "India";
  if (pin.startsWith("834")) {
    city = "Ranchi";
    state = "Jharkhand";
  } else if (pin.startsWith("560")) {
    city = "Bengaluru";
    state = "Karnataka";
  } else if (pin.startsWith("110")) {
    city = "New Delhi";
    state = "Delhi NCR";
  } else if (pin.startsWith("400")) {
    city = "Mumbai";
    state = "Maharashtra";
  } else if (pin.startsWith("700")) {
    city = "Kolkata";
    state = "West Bengal";
  } else if (pin.startsWith("600")) {
    city = "Chennai";
    state = "Tamil Nadu";
  } else if (pin.startsWith("500")) {
    city = "Hyderabad";
    state = "Telangana";
  }

  const availableCouriers = COURIER_PROVIDERS.filter(
    (c) => c.integrationActive,
  ).map((c) => ({
    name: c.name,
    code: c.code,
    rate: Math.round(c.baseRatePer500g * Math.ceil(weightKg / 0.5)),
    etdDays: `${c.avgDeliveryDays}–${c.avgDeliveryDays + 2} Days`,
  }));

  return {
    pincode: pin,
    city,
    state,
    isServiceable: true,
    codServiceable: true,
    prepaidServiceable: true,
    airCourierAllowed: true,
    availableCouriers,
  };
}
