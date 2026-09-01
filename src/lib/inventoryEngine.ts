// src/lib/inventoryEngine.ts
// Prayog India — Multi-Store Inventory Engine
// Architecture Rules:
// 1. Ranchi Main Branch = Central Inventory
//    - Used for: Website orders, Mobile App orders, Ranchi physical-store walk-in sales.
//    - There is no separate online inventory; 100 units in Ranchi = 100 units online & Ranchi store.
// 2. Other Physical Stores (Patna, Delhi, Mumbai, etc.) = Independent Store Inventories
//    - A Patna sale reduces Patna stock only.
//    - An online sale reduces Ranchi stock.
//    - A Ranchi walk-in sale reduces Ranchi stock.

import { StoreId, STORES } from '@/data/storeConfig';
import { PRODUCTS } from '@/data/mockData';

export interface StoreStockEntry {
  storeId: StoreId;
  storeName: string;
  isCentral: boolean;
  stock: number;
  allocated: number;
  available: number;
}

export interface MultiStoreProductStock {
  productId: string;
  sku: string;
  name: string;
  centralStock: number; // Ranchi (Online + App + Ranchi Walk-in)
  storeStocks: Record<StoreId, StoreStockEntry>;
  totalNetworkStock: number;
}

// In-memory / persisted multi-store inventory state
// Base proportions per architecture specification:
// Ranchi = 100, Patna = 20, Delhi = 15, Mumbai = 10 (or proportional to product stock)
const GLOBAL_STORE_INVENTORY: Record<string, Record<StoreId, number>> = {};

// Initialize mock store stocks from product base catalog
export function initializeStoreInventory(): void {
  PRODUCTS.forEach((product: any) => {
    if (!GLOBAL_STORE_INVENTORY[product.id]) {
      // Special exact configuration for ESP32-001 or standard products
      if (product.sku === 'ESP32-001' || product.id === 'esp32-devkit-v1') {
        GLOBAL_STORE_INVENTORY[product.id] = {
          ranchi: 100, // Ranchi Central Inventory (Online + App + Ranchi walk-in)
          patna: 20,   // Patna Store
          delhi: 15,   // Delhi Store
          mumbai: 10,  // Mumbai Store
        };
      } else {
        const baseCentral = typeof product.stock === 'number' ? product.stock : (product.inStock ? 100 : 0);
        GLOBAL_STORE_INVENTORY[product.id] = {
          ranchi: baseCentral,                         // Central Inventory (Website + Mobile App + Ranchi store)
          patna: Math.max(0, Math.floor(baseCentral * 0.20)),  // Independent Patna stock (e.g. 20)
          delhi: Math.max(0, Math.floor(baseCentral * 0.15)),  // Independent Delhi stock (e.g. 15)
          mumbai: Math.max(0, Math.floor(baseCentral * 0.10)), // Independent Mumbai stock (e.g. 10)
        };
      }
    }
  });
}

// Initialize on module load
initializeStoreInventory();

/**
 * Get stock availability for a specific store channel.
 * For Online / Mobile App channels, targetStore is 'ranchi' (Central Inventory).
 */
export function getProductStockForStore(productId: string, storeId: StoreId = 'ranchi'): number {
  if (!GLOBAL_STORE_INVENTORY[productId]) {
    initializeStoreInventory();
  }
  const storeStocks = GLOBAL_STORE_INVENTORY[productId];
  if (!storeStocks) return 0;
  return storeStocks[storeId] ?? 0;
}

/**
 * Deduct inventory for an order based on order source channel:
 * - Online (Website / Mobile App) -> Deducts from Ranchi (Central Inventory)
 * - Ranchi Walk-in -> Deducts from Ranchi (Central Inventory)
 * - Patna Walk-in -> Deducts from Patna store only
 * - Delhi Walk-in -> Deducts from Delhi store only
 * - Mumbai Walk-in -> Deducts from Mumbai store only
 */
export function deductStoreInventory(params: {
  productId: string;
  quantity: number;
  orderSource: 'ONLINE_WEB' | 'MOBILE_APP' | 'WALK_IN';
  storeId?: StoreId;
}): { success: boolean; deductedFrom: StoreId; remainingStock: number; message: string } {
  const { productId, quantity, orderSource, storeId } = params;

  if (!GLOBAL_STORE_INVENTORY[productId]) {
    initializeStoreInventory();
  }

  // Determine target store to deduct from:
  // Online orders & App orders ALWAYS draw directly from Ranchi Central Inventory
  let targetStore: StoreId = 'ranchi';

  if (orderSource === 'WALK_IN') {
    targetStore = storeId || 'ranchi';
  } else {
    // Online Web / Mobile App
    targetStore = 'ranchi';
  }

  const currentStock = GLOBAL_STORE_INVENTORY[productId]?.[targetStore] ?? 0;

  if (currentStock < quantity) {
    return {
      success: false,
      deductedFrom: targetStore,
      remainingStock: currentStock,
      message: `Insufficient stock in ${STORES[targetStore]?.name || targetStore}. Available: ${currentStock}, Requested: ${quantity}.`,
    };
  }

  GLOBAL_STORE_INVENTORY[productId][targetStore] = currentStock - quantity;

  return {
    success: true,
    deductedFrom: targetStore,
    remainingStock: GLOBAL_STORE_INVENTORY[productId][targetStore],
    message: `Successfully deducted ${quantity} units from ${STORES[targetStore]?.name} (${targetStore.toUpperCase()}).`,
  };
}

/**
 * Get a full breakdown of a product's stock across all network stores.
 */
export function getProductMultiStoreBreakdown(productId: string): MultiStoreProductStock | null {
  if (!GLOBAL_STORE_INVENTORY[productId]) {
    initializeStoreInventory();
  }

  const prod = PRODUCTS.find((p: any) => p.id === productId);
  if (!prod) return null;

  const stocks = GLOBAL_STORE_INVENTORY[productId] || {
    ranchi: 0,
    patna: 0,
    delhi: 0,
    mumbai: 0,
  };

  const storeStocks: Record<StoreId, StoreStockEntry> = {
    ranchi: {
      storeId: 'ranchi',
      storeName: 'Ranchi Main Branch (Central Hub)',
      isCentral: true,
      stock: stocks.ranchi,
      allocated: 0,
      available: stocks.ranchi,
    },
    patna: {
      storeId: 'patna',
      storeName: 'Patna Store Branch',
      isCentral: false,
      stock: stocks.patna,
      allocated: 0,
      available: stocks.patna,
    },
    delhi: {
      storeId: 'delhi',
      storeName: 'Delhi NCR Innovation Center',
      isCentral: false,
      stock: stocks.delhi,
      allocated: 0,
      available: stocks.delhi,
    },
    mumbai: {
      storeId: 'mumbai',
      storeName: 'Mumbai Robotics Center',
      isCentral: false,
      stock: stocks.mumbai,
      allocated: 0,
      available: stocks.mumbai,
    },
  };

  const totalNetworkStock = Object.values(stocks).reduce((sum, val) => sum + val, 0);

  return {
    productId: prod.id,
    sku: prod.sku,
    name: prod.name,
    centralStock: stocks.ranchi,
    storeStocks,
    totalNetworkStock,
  };
}
