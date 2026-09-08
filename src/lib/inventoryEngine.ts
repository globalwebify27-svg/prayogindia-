// src/lib/inventoryEngine.ts
// Prayog India — Enterprise Multi-Store Product & Inventory Architecture
//
// Core Golden Rule:
// PRODUCT = GLOBAL (One central catalogue master)
// INVENTORY = STORE-SPECIFIC (Isolated row per Store + Product: UNIQUE(store_id, product_id))
// ORDER = STORE-SPECIFIC
// POS = STORE-SPECIFIC
// DEVICE = STORE-SPECIFIC
// USER ACCESS = STORE-SCOPED

import { StoreId, STORES } from "@/data/storeConfig";
import { PRODUCTS, Product } from "@/data/mockData";

export type TransactionType =
  | "SALE"
  | "RESTOCK"
  | "TRANSFER_IN"
  | "TRANSFER_OUT"
  | "ADJUSTMENT"
  | "RETURN"
  | "ONLINE_FULFILLMENT";

export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export interface StoreInventoryRecord {
  id: string;
  storeId: StoreId;
  productId: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  reorderLevel: number;
  lowStockThreshold: number;
  status: StockStatus;
  updatedAt: string;
}

export interface StoreProductSettingsRecord {
  id: string;
  storeId: StoreId;
  productId: string;
  isEnabled: boolean;
  isVisible: boolean;
  priceOverride?: number | null;
  reorderLevel?: number | null;
  storeTaxOverride?: number | null;
  updatedAt: string;
}

export interface InventoryTransactionRecord {
  id: string;
  storeId: StoreId;
  productId: string;
  productName?: string;
  sku?: string;
  orderId?: string | null;
  transactionType: TransactionType;
  quantityBefore: number;
  quantityChange: number;
  quantityAfter: number;
  userId?: string | null;
  deviceId?: string | null;
  referenceId?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface StockTransferRecord {
  id: string;
  transferNumber: string;
  sourceStoreId: StoreId;
  destinationStoreId: StoreId;
  status: "PENDING" | "IN_TRANSIT" | "COMPLETED" | "CANCELLED";
  items: Array<{
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    receivedQuantity: number;
  }>;
  requestedByUserId?: string;
  approvedByUserId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreStockEntry {
  storeId: StoreId;
  storeName: string;
  isCentral: boolean;
  stock: number;
  allocated: number;
  available: number;
  status: StockStatus;
  price: number;
}

export interface MultiStoreProductStock {
  productId: string;
  sku: string;
  name: string;
  basePrice: number;
  centralStock: number;
  storeStocks: Record<StoreId, StoreStockEntry>;
  totalNetworkStock: number;
}

// ─────────────────────────────────────────────
// In-Memory Persistent Store (with DB Fallback Sync)
// ─────────────────────────────────────────────
const STORE_INVENTORY_TABLE: Map<string, StoreInventoryRecord> = new Map();
const STORE_SETTINGS_TABLE: Map<string, StoreProductSettingsRecord> = new Map();
const INVENTORY_TRANSACTIONS: InventoryTransactionRecord[] = [];
const STOCK_TRANSFERS: StockTransferRecord[] = [];

function makeInventoryKey(storeId: StoreId, productId: string): string {
  return `${storeId}:${productId}`;
}

/**
 * Initialize / Seed store inventory from global product catalog
 * Proportions: Ranchi (Central) = 100, Patna = 20, Delhi = 15, Mumbai = 10
 */
export function initializeStoreInventory(): void {
  const storeIds: StoreId[] = ["ranchi", "patna", "delhi", "mumbai"];

  PRODUCTS.forEach((product: Product) => {
    const pAny = product as unknown as Record<string, unknown>;
    const baseStock =
      typeof pAny.stock === "number"
        ? (pAny.stock as number)
        : product.inStock
          ? 100
          : 0;

    storeIds.forEach((storeId) => {
      const key = makeInventoryKey(storeId, product.id);
      if (!STORE_INVENTORY_TABLE.has(key)) {
        let qty = 0;
        if (storeId === "ranchi") {
          qty = baseStock;
        } else if (storeId === "patna") {
          qty = Math.max(0, Math.floor(baseStock * 0.2));
        } else if (storeId === "delhi") {
          qty = Math.max(0, Math.floor(baseStock * 0.15));
        } else if (storeId === "mumbai") {
          qty = Math.max(0, Math.floor(baseStock * 0.1));
        }

        const lowThreshold = 5;
        const status: StockStatus =
          qty === 0
            ? "OUT_OF_STOCK"
            : qty <= lowThreshold
              ? "LOW_STOCK"
              : "IN_STOCK";

        STORE_INVENTORY_TABLE.set(key, {
          id: `inv-${storeId}-${product.id}`,
          storeId,
          productId: product.id,
          quantity: qty,
          reservedQuantity: 0,
          availableQuantity: qty,
          reorderLevel: 10,
          lowStockThreshold: lowThreshold,
          status,
          updatedAt: new Date().toISOString(),
        });
      }
    });
  });
}

// Seed on startup
initializeStoreInventory();

// ─────────────────────────────────────────────
// Core Queries & Calculations
// ─────────────────────────────────────────────

/**
 * Get single product stock for a specific store.
 */
export function getProductStockForStore(
  productId: string,
  storeId: StoreId = "ranchi",
): number {
  if (STORE_INVENTORY_TABLE.size === 0) initializeStoreInventory();
  const key = makeInventoryKey(storeId, productId);
  const record = STORE_INVENTORY_TABLE.get(key);
  return record ? record.availableQuantity : 0;
}

/**
 * Get product price for a specific store (resolving store_product_settings price override).
 */
export function getProductPriceForStore(
  productId: string,
  storeId: StoreId = "ranchi",
): number {
  const key = makeInventoryKey(storeId, productId);
  const settings = STORE_SETTINGS_TABLE.get(key);
  if (settings && typeof settings.priceOverride === "number") {
    return settings.priceOverride;
  }
  const product = PRODUCTS.find((p) => p.id === productId);
  return product?.price ?? 0;
}

/**
 * Get entire store inventory joined with central product master.
 */
export function getStoreInventory(storeId: StoreId) {
  if (STORE_INVENTORY_TABLE.size === 0) initializeStoreInventory();

  return PRODUCTS.map((product) => {
    const key = makeInventoryKey(storeId, product.id);
    const inv = STORE_INVENTORY_TABLE.get(key) || {
      id: `inv-${storeId}-${product.id}`,
      storeId,
      productId: product.id,
      quantity: 0,
      reservedQuantity: 0,
      availableQuantity: 0,
      reorderLevel: 10,
      lowStockThreshold: 5,
      status: "OUT_OF_STOCK" as StockStatus,
      updatedAt: new Date().toISOString(),
    };

    const price = getProductPriceForStore(product.id, storeId);
    const isCentral = storeId === "ranchi";

    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      category: product.category,
      brand: product.brand || "Prayog India",
      price,
      basePrice: product.price,
      mrp: product.mrp,
      image: product.image,
      images: product.images || (product.image ? [product.image] : []),
      storeId,
      storeName: STORES[storeId]?.name || storeId,
      isCentralInventory: isCentral,
      quantity: inv.quantity,
      reservedQuantity: inv.reservedQuantity,
      availableQuantity: inv.availableQuantity,
      reorderLevel: inv.reorderLevel,
      lowStockThreshold: inv.lowStockThreshold,
      status: inv.status,
      updatedAt: inv.updatedAt,
    };
  });
}

/**
 * Search global products joined with a specific store's inventory.
 */
export function searchStoreProducts(params: {
  storeId: StoreId;
  query?: string;
  category?: string;
  inStockOnly?: boolean;
}) {
  const { storeId, query = "", category, inStockOnly = false } = params;
  const inventory = getStoreInventory(storeId);
  const q = query.toLowerCase().trim();

  return inventory.filter((item) => {
    if (
      category &&
      category !== "all" &&
      item.category.toLowerCase() !== category.toLowerCase()
    ) {
      return false;
    }
    if (inStockOnly && item.availableQuantity <= 0) {
      return false;
    }
    if (!q) return true;
    return (
      item.name.toLowerCase().includes(q) ||
      item.sku.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.brand.toLowerCase().includes(q)
    );
  });
}

/**
 * Authoritative Cart Validation against store-isolated inventory.
 */
export function validateCartForStore(params: {
  storeId: StoreId;
  items: Array<{ productId: string; quantity: number }>;
}): { valid: boolean; errors: Array<{ productId: string; message: string }> } {
  const { storeId, items } = params;
  const errors: Array<{ productId: string; message: string }> = [];

  for (const item of items) {
    const product = PRODUCTS.find((p) => p.id === item.productId);
    if (!product) {
      errors.push({
        productId: item.productId,
        message: `Product not found in global catalog.`,
      });
      continue;
    }

    const availableStock = getProductStockForStore(item.productId, storeId);
    if (availableStock < item.quantity) {
      errors.push({
        productId: item.productId,
        message: `Insufficient stock in ${STORES[storeId]?.name || storeId}. Available: ${availableStock}, Requested: ${item.quantity}.`,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Deduct inventory for an order with atomic transaction audit logging.
 */
export function deductStoreInventory(params: {
  productId: string;
  quantity: number;
  orderSource: "ONLINE_WEB" | "MOBILE_APP" | "WALK_IN";
  storeId?: StoreId;
  orderId?: string;
  userId?: string;
  deviceId?: string;
}): {
  success: boolean;
  deductedFrom: StoreId;
  remainingStock: number;
  message: string;
} {
  const {
    productId,
    quantity,
    orderSource,
    storeId,
    orderId,
    userId,
    deviceId,
  } = params;

  if (STORE_INVENTORY_TABLE.size === 0) initializeStoreInventory();

  // Determine authoritative store target
  // Online Web & Mobile App dispatch from Central Hub (Ranchi)
  const targetStore: StoreId =
    orderSource === "WALK_IN" ? storeId || "ranchi" : "ranchi";
  const key = makeInventoryKey(targetStore, productId);
  const record = STORE_INVENTORY_TABLE.get(key);

  const currentStock = record?.quantity ?? 0;

  if (currentStock < quantity) {
    return {
      success: false,
      deductedFrom: targetStore,
      remainingStock: currentStock,
      message: `Insufficient stock in ${STORES[targetStore]?.name || targetStore}. Available: ${currentStock}, Requested: ${quantity}.`,
    };
  }

  const updatedQty = currentStock - quantity;
  const lowThreshold = record?.lowStockThreshold ?? 5;
  const newStatus: StockStatus =
    updatedQty === 0
      ? "OUT_OF_STOCK"
      : updatedQty <= lowThreshold
        ? "LOW_STOCK"
        : "IN_STOCK";

  if (record) {
    record.quantity = updatedQty;
    record.availableQuantity = updatedQty - record.reservedQuantity;
    record.status = newStatus;
    record.updatedAt = new Date().toISOString();
  }

  const product = PRODUCTS.find((p) => p.id === productId);

  // Emit Audit Log
  const transaction: InventoryTransactionRecord = {
    id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    storeId: targetStore,
    productId,
    productName: product?.name,
    sku: product?.sku,
    orderId: orderId || null,
    transactionType: orderSource === "WALK_IN" ? "SALE" : "ONLINE_FULFILLMENT",
    quantityBefore: currentStock,
    quantityChange: -quantity,
    quantityAfter: updatedQty,
    userId: userId || null,
    deviceId: deviceId || null,
    referenceId: orderId || null,
    notes: `${orderSource} order deduction of ${quantity} units`,
    createdAt: new Date().toISOString(),
  };

  INVENTORY_TRANSACTIONS.unshift(transaction);

  return {
    success: true,
    deductedFrom: targetStore,
    remainingStock: updatedQty,
    message: `Successfully deducted ${quantity} units from ${STORES[targetStore]?.name}.`,
  };
}

/**
 * Restock or manually adjust inventory with audit logging.
 */
export function adjustStoreInventory(params: {
  storeId: StoreId;
  productId: string;
  quantityChange: number;
  transactionType: TransactionType;
  reason?: string;
  userId?: string;
  deviceId?: string;
}): { success: boolean; newQuantity: number; message: string } {
  const {
    storeId,
    productId,
    quantityChange,
    transactionType,
    reason,
    userId,
    deviceId,
  } = params;

  if (STORE_INVENTORY_TABLE.size === 0) initializeStoreInventory();

  const product =
    PRODUCTS.find((p) => p.id === productId || p.sku === productId);
  const actualProductId = product?.id || productId;

  const key = makeInventoryKey(storeId, actualProductId);
  let record = STORE_INVENTORY_TABLE.get(key);

  if (!record) {
    record = {
      id: `inv-${storeId}-${productId}`,
      storeId,
      productId,
      quantity: 0,
      reservedQuantity: 0,
      availableQuantity: 0,
      reorderLevel: 10,
      lowStockThreshold: 5,
      status: "OUT_OF_STOCK",
      updatedAt: new Date().toISOString(),
    };
    STORE_INVENTORY_TABLE.set(key, record);
  }

  const currentStock = record.quantity;
  const newQuantity = Math.max(0, currentStock + quantityChange);
  const lowThreshold = record.lowStockThreshold || 5;

  record.quantity = newQuantity;
  record.availableQuantity = Math.max(0, newQuantity - record.reservedQuantity);
  record.status =
    newQuantity === 0
      ? "OUT_OF_STOCK"
      : newQuantity <= lowThreshold
        ? "LOW_STOCK"
        : "IN_STOCK";
  record.updatedAt = new Date().toISOString();

  INVENTORY_TRANSACTIONS.unshift({
    id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    storeId,
    productId: actualProductId,
    productName: product?.name,
    sku: product?.sku,
    transactionType,
    quantityBefore: currentStock,
    quantityChange,
    quantityAfter: newQuantity,
    userId: userId || null,
    deviceId: deviceId || null,
    notes: reason || `Manual adjustment: ${transactionType}`,
    createdAt: new Date().toISOString(),
  });

  return {
    success: true,
    newQuantity,
    message: `Updated ${product?.name || productId} in ${STORES[storeId]?.name} to ${newQuantity} units.`,
  };
}

/**
 * Inter-Store Stock Transfer Workflow.
 * Dual-sided transaction logging (Source: TRANSFER_OUT, Destination: TRANSFER_IN).
 */
export function transferStockBetweenStores(params: {
  sourceStoreId: StoreId;
  destinationStoreId: StoreId;
  items: Array<{ productId: string; quantity: number }>;
  userId?: string;
  notes?: string;
}): { success: boolean; transfer?: StockTransferRecord; message: string } {
  const { sourceStoreId, destinationStoreId, items, userId, notes } = params;

  if (sourceStoreId === destinationStoreId) {
    return {
      success: false,
      message: "Source and Destination stores cannot be identical.",
    };
  }

  // Pre-validate source stock
  for (const item of items) {
    const available = getProductStockForStore(item.productId, sourceStoreId);
    if (available < item.quantity) {
      const p = PRODUCTS.find((x) => x.id === item.productId);
      return {
        success: false,
        message: `Insufficient stock in ${STORES[sourceStoreId]?.name} for ${p?.name || item.productId}. Available: ${available}, Required: ${item.quantity}.`,
      };
    }
  }

  const transferNumber = `TR-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
  const transferItems: StockTransferRecord["items"] = [];

  // Execute atomic transfer
  for (const item of items) {
    const p = PRODUCTS.find((x) => x.id === item.productId);
    const prodName = p?.name || item.productId;
    const sku = p?.sku || "";

    // 1. Deduct from Source
    adjustStoreInventory({
      storeId: sourceStoreId,
      productId: item.productId,
      quantityChange: -item.quantity,
      transactionType: "TRANSFER_OUT",
      reason: `Stock Transfer ${transferNumber} to ${STORES[destinationStoreId]?.name}`,
      userId,
    });

    // 2. Add to Destination
    adjustStoreInventory({
      storeId: destinationStoreId,
      productId: item.productId,
      quantityChange: item.quantity,
      transactionType: "TRANSFER_IN",
      reason: `Stock Transfer ${transferNumber} from ${STORES[sourceStoreId]?.name}`,
      userId,
    });

    transferItems.push({
      productId: item.productId,
      productName: prodName,
      sku,
      quantity: item.quantity,
      receivedQuantity: item.quantity,
    });
  }

  const transferRecord: StockTransferRecord = {
    id: `trf-${Date.now()}`,
    transferNumber,
    sourceStoreId,
    destinationStoreId,
    status: "COMPLETED",
    items: transferItems,
    requestedByUserId: userId,
    approvedByUserId: userId,
    notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  STOCK_TRANSFERS.unshift(transferRecord);

  return {
    success: true,
    transfer: transferRecord,
    message: `Transferred ${items.reduce((s, i) => s + i.quantity, 0)} units from ${STORES[sourceStoreId]?.name} to ${STORES[destinationStoreId]?.name}.`,
  };
}

/**
 * Get multi-store matrix of product stock.
 */
export function getProductMultiStoreBreakdown(
  productId: string,
): MultiStoreProductStock | null {
  if (STORE_INVENTORY_TABLE.size === 0) initializeStoreInventory();

  const prod = PRODUCTS.find((p) => p.id === productId);
  if (!prod) return null;

  const storeIds: StoreId[] = ["ranchi", "patna", "delhi", "mumbai"];
  const storeStocks = {} as Record<StoreId, StoreStockEntry>;

  let totalNetworkStock = 0;

  storeIds.forEach((sId) => {
    const key = makeInventoryKey(sId, prod.id);
    const rec = STORE_INVENTORY_TABLE.get(key);
    const stock = rec?.quantity ?? 0;
    const available = rec?.availableQuantity ?? 0;
    const status = rec?.status ?? "OUT_OF_STOCK";
    const price = getProductPriceForStore(prod.id, sId);

    totalNetworkStock += stock;

    storeStocks[sId] = {
      storeId: sId,
      storeName: STORES[sId]?.name || sId,
      isCentral: sId === "ranchi",
      stock,
      allocated: rec?.reservedQuantity ?? 0,
      available,
      status,
      price,
    };
  });

  return {
    productId: prod.id,
    sku: prod.sku,
    name: prod.name,
    basePrice: prod.price,
    centralStock: storeStocks.ranchi.stock,
    storeStocks,
    totalNetworkStock,
  };
}

/**
 * Get complete multi-store inventory matrix across all products.
 */
export function getMultiStoreInventoryMatrix() {
  if (STORE_INVENTORY_TABLE.size === 0) initializeStoreInventory();
  return PRODUCTS.map((product) =>
    getProductMultiStoreBreakdown(product.id),
  ).filter(Boolean);
}

/**
 * Query Inventory Transactions Audit Trail.
 */
export function getInventoryTransactions(filters?: {
  storeId?: StoreId;
  productId?: string;
  transactionType?: TransactionType;
  limit?: number;
}): InventoryTransactionRecord[] {
  let list = [...INVENTORY_TRANSACTIONS];

  if (filters?.storeId) {
    list = list.filter((t) => t.storeId === filters.storeId);
  }
  if (filters?.productId) {
    list = list.filter((t) => t.productId === filters.productId);
  }
  if (filters?.transactionType) {
    list = list.filter((t) => t.transactionType === filters.transactionType);
  }

  return list.slice(0, filters?.limit || 100);
}

/**
 * Register a newly created product across all store inventory records.
 * Default allocation: Ranchi (Central Hub) receives the initial stock, other branches set to 0 or fractional.
 */
export function registerProductInEngine(product: Product, initialRanchiStock = 25): void {
  const storeIds: StoreId[] = ["ranchi", "patna", "delhi", "mumbai"];

  // Push to local PRODUCTS array if not already present
  const existingIdx = PRODUCTS.findIndex((p) => p.id === product.id || p.sku === product.sku);
  if (existingIdx >= 0) {
    PRODUCTS[existingIdx] = { ...PRODUCTS[existingIdx], ...product };
  } else {
    PRODUCTS.unshift(product);
  }

  storeIds.forEach((storeId) => {
    const key = makeInventoryKey(storeId, product.id);
    const qty = storeId === "ranchi" ? initialRanchiStock : 0;
    const lowThreshold = 5;
    const status: StockStatus =
      qty === 0 ? "OUT_OF_STOCK" : qty <= lowThreshold ? "LOW_STOCK" : "IN_STOCK";

    STORE_INVENTORY_TABLE.set(key, {
      id: `inv-${storeId}-${product.id}`,
      storeId,
      productId: product.id,
      quantity: qty,
      reservedQuantity: 0,
      availableQuantity: qty,
      reorderLevel: 10,
      lowStockThreshold: lowThreshold,
      status,
      updatedAt: new Date().toISOString(),
    });
  });
}

/**
 * Get all Stock Transfers.
 */
export function getStockTransfers(): StockTransferRecord[] {
  return [...STOCK_TRANSFERS];
}

