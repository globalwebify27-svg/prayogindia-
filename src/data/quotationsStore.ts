import fs from "fs";
import path from "path";

export interface StoredQuotationItem {
  id?: string;
  productId?: string | null;
  variantId?: string | null;
  productName: string;
  productSku: string;
  unitPrice: number;
  quantity: number;
  discountPct: number;
  taxRate?: number;
  total?: number;
}

export interface StoredQuotation {
  id: string;
  quoteNumber: string;
  userId?: string | null;
  storeId?: string | null;
  store?: { id: string; name: string; code: string; city: string };
  institutionType: string;
  companyName: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  gstin?: string | null;
  billingAddress?: string | null;
  shippingAddress?: string | null;
  status:
    | "DRAFT"
    | "REQUESTED"
    | "UNDER_REVIEW"
    | "SENT"
    | "VIEWED"
    | "NEGOTIATION"
    | "ACCEPTED"
    | "REJECTED"
    | "EXPIRED"
    | "CONVERTED"
    | "CANCELLED";
  createdAt: string;
  updatedAt?: string;
  validUntil: string;
  items: StoredQuotationItem[];
  subtotal: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  shippingCharge: number;
  grandTotal: number;
  notes?: string | null;
  terms?: string | null;
  adminNotes?: string | null;
  customerFeedback?: string | null;
  convertedAt?: string | null;
  order?: {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
  } | null;
  revisions?: any[];
}

const STORAGE_PATH = path.join(
  process.cwd(),
  "src",
  "data",
  "quotationsStore.json",
);

export const DEFAULT_QUOTATIONS: StoredQuotation[] = [
  {
    id: "qt-seed-01",
    quoteNumber: "PRG-QT-2026-8941",
    storeId: "str-ranchi-01",
    store: {
      id: "str-ranchi-01",
      name: "Prayog India Ranchi Main Branch & Central Hub",
      code: "RANCHI",
      city: "Ranchi",
    },
    institutionType: "ATL School",
    companyName: "Delhi Public School - ATL Innovation Lab",
    customerName: "Dr. Rajeshwar Sharma",
    customerPhone: "+91 98765 43210",
    customerEmail: "atl.lab@dpsranchi.edu.in",
    gstin: "20AAACD1234F1Z5",
    billingAddress: "Sail Township, Dhurwa, Ranchi, Jharkhand - 834004",
    shippingAddress: "ATL Lab Room 204, DPS Ranchi Campus, Ranchi - 834004",
    status: "REQUESTED",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    validUntil: new Date(Date.now() + 86400000 * 30).toISOString(),
    subtotal: 78500,
    discountAmount: 3925,
    taxRate: 18,
    taxAmount: 13423.5,
    shippingCharge: 0,
    grandTotal: 87998.5,
    notes: "Requirement for 30 ATL Robotics Kits for upcoming inter-school mechatronics competition.",
    terms:
      "1. Quotation valid for 30 days from date of issue.\n2. Official GST invoice provided upon dispatch.\n3. Standard Prayog India OEM replacement warranty applies.",
    items: [
      {
        id: "item-seed-01",
        productName: "Prayog DIY Hexacopter Drone Starter STEM Kit with Pixhawk",
        productSku: "PRG-HEXA-01",
        unitPrice: 18500,
        quantity: 3,
        discountPct: 5,
        total: 52725,
      },
      {
        id: "item-seed-02",
        productName: "ESP32 IoT Sensor Suite with OLED Display (Pack of 10)",
        productSku: "PRG-ESP32-10",
        unitPrice: 25775,
        quantity: 1,
        discountPct: 0,
        total: 25775,
      },
    ],
  },
  {
    id: "qt-seed-02",
    quoteNumber: "PRG-QT-2026-5120",
    storeId: "str-ranchi-01",
    store: {
      id: "str-ranchi-01",
      name: "Prayog India Ranchi Main Branch & Central Hub",
      code: "RANCHI",
      city: "Ranchi",
    },
    institutionType: "Engineering College",
    companyName: "Birla Institute of Technology (BIT Mesra)",
    customerName: "Prof. Ananya Sen",
    customerPhone: "+91 94311 88990",
    customerEmail: "robotics.club@bitmesra.ac.in",
    gstin: "20AAAB1002C1Z8",
    billingAddress: "BIT Mesra Campus, Ranchi, Jharkhand - 835215",
    shippingAddress: "Central Robotics Workshop, BIT Mesra, Ranchi - 835215",
    status: "UNDER_REVIEW",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    validUntil: new Date(Date.now() + 86400000 * 25).toISOString(),
    subtotal: 124000,
    discountAmount: 12400,
    taxRate: 18,
    taxAmount: 20088,
    shippingCharge: 500,
    grandTotal: 132188,
    notes: "Bulk institutional pricing requested for Autonomous Rover telemetry & LiDAR mapping modules.",
    terms:
      "1. Quotation valid for 30 days.\n2. Payment terms 50% advance, 50% on delivery inspection.",
    items: [
      {
        id: "item-seed-03",
        productName: "Industrial 2D 360° LiDAR Scanner Sensor A1M8",
        productSku: "PRG-LIDAR-A1",
        unitPrice: 12400,
        quantity: 10,
        discountPct: 10,
        total: 111600,
      },
    ],
  },
];

let cachedQuotations: StoredQuotation[] | null = null;

export function getStoredQuotations(): StoredQuotation[] {
  if (cachedQuotations && cachedQuotations.length > 0) {
    return cachedQuotations;
  }

  try {
    if (fs.existsSync(STORAGE_PATH)) {
      const raw = fs.readFileSync(STORAGE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedQuotations = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error reading quotationsStore.json:", err);
  }

  cachedQuotations = [...DEFAULT_QUOTATIONS];
  return cachedQuotations;
}

export function saveStoredQuotation(quote: StoredQuotation): boolean {
  try {
    const list = getStoredQuotations();
    const existingIndex = list.findIndex(
      (q) => q.id === quote.id || q.quoteNumber === quote.quoteNumber,
    );

    let updatedList: StoredQuotation[];
    if (existingIndex >= 0) {
      updatedList = [...list];
      updatedList[existingIndex] = { ...updatedList[existingIndex], ...quote };
    } else {
      updatedList = [quote, ...list];
    }

    cachedQuotations = updatedList;

    try {
      fs.writeFileSync(STORAGE_PATH, JSON.stringify(updatedList, null, 2), "utf-8");
    } catch (fsErr) {
      // In serverless read-only filesystem (like Vercel lambda), memory cache persists in active instance
      console.warn("quotationsStore disk write skipped (in-memory preserved):", fsErr);
    }
    return true;
  } catch (err) {
    console.error("Error saving quotation to store:", err);
    return false;
  }
}

export function updateStoredQuotationStatus(
  id: string,
  status: StoredQuotation["status"],
  notes?: string,
): StoredQuotation | null {
  const list = getStoredQuotations();
  const quote = list.find((q) => q.id === id || q.quoteNumber === id);
  if (!quote) return null;

  quote.status = status;
  if (notes) {
    quote.customerFeedback = notes;
  }
  quote.updatedAt = new Date().toISOString();
  saveStoredQuotation(quote);
  return quote;
}
