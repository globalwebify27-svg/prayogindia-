export interface InterStoreTransfer {
  id: string;
  transferNumber: string;
  sourceStoreCode: "RANCHI" | "PATNA" | "DELHI" | "MUMBAI" | string;
  sourceStoreName: string;
  destinationStoreCode: "RANCHI" | "PATNA" | "DELHI" | "MUMBAI" | string;
  destinationStoreName: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  initiatedBy: string;
  approvedBy?: string;
  dispatchedAt?: string;
  receivedAt?: string;
  status:
    | "Draft / Requested"
    | "Approved"
    | "Dispatched & In Transit"
    | "Received & Stock Updated"
    | "Cancelled";
  courierReference?: string;
  notes?: string;
}

export interface StockAdjustmentEntry {
  id: string;
  adjustmentNumber: string;
  storeCode: string;
  storeName: string;
  productId: string;
  productName: string;
  sku: string;
  previousStock: number;
  adjustmentQuantity: number; // e.g. -2 for damaged, +5 for count correction
  newStock: number;
  reason:
    | "Damaged goods"
    | "Lost goods"
    | "Physical count correction"
    | "Returns"
    | "Internal consumption"
    | "Manual correction";
  adjustedBy: string;
  timestamp: string;
  notes: string;
}

export const INITIAL_STOCK_TRANSFERS: InterStoreTransfer[] = [
  {
    id: "trf-9901",
    transferNumber: "TRF-RNC-PAT-001",
    sourceStoreCode: "RANCHI",
    sourceStoreName: "Ranchi Central Inventory Hub",
    destinationStoreCode: "PATNA",
    destinationStoreName: "Patna Robotics & STEM Branch",
    productId: "prod-1",
    productName: "Arduino UNO R4 WiFi",
    sku: "PRG-ARD-R4W",
    quantity: 25,
    initiatedBy: "Jay Prakash (Patna Store Manager)",
    approvedBy: "Abhishek Kumar (Super Admin)",
    dispatchedAt: "2026-08-28 11:30",
    status: "Dispatched & In Transit",
    courierReference: "XPR-88112200IN",
    notes: "Urgent restocking for college workshop batch",
  },
  {
    id: "trf-9902",
    transferNumber: "TRF-RNC-DEL-002",
    sourceStoreCode: "RANCHI",
    sourceStoreName: "Ranchi Central Inventory Hub",
    destinationStoreCode: "DELHI",
    destinationStoreName: "NCR Innovation Center, Delhi",
    productId: "prod-2",
    productName: "Pixhawk 2.4.8 Flight Controller",
    sku: "PRG-DRN-PX4",
    quantity: 10,
    initiatedBy: "Vikramaditya Sahay",
    approvedBy: "Abhishek Kumar",
    dispatchedAt: "2026-08-27 15:00",
    receivedAt: "2026-08-29 10:15",
    status: "Received & Stock Updated",
    courierReference: "DEL-99223311IN",
    notes: "Received in good condition; Delhi branch stock incremented by 10.",
  },
];

export const INITIAL_STOCK_ADJUSTMENTS: StockAdjustmentEntry[] = [
  {
    id: "adj-501",
    adjustmentNumber: "ADJ-2026-0801",
    storeCode: "RANCHI",
    storeName: "Ranchi Central Hub",
    productId: "prod-1",
    productName: "4S 14.8V 5200mAh LiPo Battery Pack",
    sku: "PRG-BAT-4S52",
    previousStock: 45,
    adjustmentQuantity: -2,
    newStock: 43,
    reason: "Damaged goods",
    adjustedBy: "Abhishek Kumar",
    timestamp: "2026-08-28 14:20",
    notes: "Outer packaging punctured during pallet unloading",
  },
  {
    id: "adj-502",
    adjustmentNumber: "ADJ-2026-0802",
    storeCode: "PATNA",
    storeName: "Patna Branch",
    productId: "prod-3",
    productName: "ESP32-WROOM-32D Development Board",
    sku: "PRG-ESP-32D",
    previousStock: 18,
    adjustmentQuantity: +2,
    newStock: 20,
    reason: "Physical count correction",
    adjustedBy: "Jay Prakash",
    timestamp: "2026-08-29 09:45",
    notes: "2 units found in shelf A3 during weekly inventory audit",
  },
];
