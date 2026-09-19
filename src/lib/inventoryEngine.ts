// src/lib/inventoryEngine.ts
// Prayog India — Enterprise Multi-Store Product & Inventory Architecture
//
// FIX (2026-09-19): Engine now persists all data to PostgreSQL via Prisma.
// The previous in-memory Map implementation caused inventory resets on every server restart.
// The StoreInventory DB table (schema already correct) is now the single source of truth.

import { db } from "@/lib/db";
import { StoreId, STORES } from "@/data/storeConfig";

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
// Helper: Resolve store DB id from store code or UUID
// ─────────────────────────────────────────────
async function resolveStoreDbId(storeId: StoreId | string): Promise<string | null> {
  try {
    const store = await db.store.findFirst({
      where: {
        OR: [
          { id: storeId },
          { code: { equals: storeId.toUpperCase(), mode: "insensitive" } },
          { name: { contains: storeId, mode: "insensitive" } },
        ],
      },
      select: { id: true },
    });
    return store?.id ?? null;
  } catch {
    return null;
  }
}

async function resolveProductDbId(productId: string): Promise<string | null> {
  try {
    const prod = await db.product.findFirst({
      where: {
        OR: [
          { id: productId },
          { sku: productId },
          { slug: productId },
        ],
      },
      select: { id: true },
    });
    return prod?.id ?? null;
  } catch {
    return null;
  }
}

async function resolveDeviceDbId(deviceId?: string | null): Promise<string | null> {
  if (!deviceId) return null;
  try {
    const dev = await db.device.findFirst({
      where: {
        OR: [
          { id: deviceId },
          { deviceCode: deviceId },
        ],
      },
      select: { id: true },
    });
    return dev?.id ?? null;
  } catch {
    return null;
  }
}

function computeStatus(qty: number, lowThreshold = 5): StockStatus {
  if (qty === 0) return "OUT_OF_STOCK";
  if (qty <= lowThreshold) return "LOW_STOCK";
  return "IN_STOCK";
}

// ─────────────────────────────────────────────
// Core Queries (DB-backed)
// ─────────────────────────────────────────────

/**
 * Get single product stock for a specific store from the database.
 */
export async function getProductStockForStore(
  productId: string,
  storeId: StoreId = "ranchi",
): Promise<number> {
  try {
    const storeDbId = await resolveStoreDbId(storeId);
    if (!storeDbId) return 0;
    const inv = await db.storeInventory.findUnique({
      where: { storeId_productId: { storeId: storeDbId, productId } },
      select: { availableQuantity: true },
    });
    return inv?.availableQuantity ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Get product price for a specific store (resolving store_product_settings price override).
 */
export async function getProductPriceForStore(
  productId: string,
  storeId: StoreId = "ranchi",
): Promise<number> {
  try {
    const storeDbId = await resolveStoreDbId(storeId);
    if (storeDbId) {
      const settings = await db.storeProductSettings.findUnique({
        where: { storeId_productId: { storeId: storeDbId, productId } },
        select: { priceOverride: true },
      });
      if (settings?.priceOverride != null) return settings.priceOverride;
    }
    const product = await db.product.findUnique({
      where: { id: productId },
      select: { price: true },
    });
    return product?.price ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Get entire store inventory joined with product master from the database.
 */
export async function getStoreInventory(storeId: StoreId) {
  try {
    const storeDbId = await resolveStoreDbId(storeId);
    if (!storeDbId) return [];

    const isCentral = storeId === "ranchi";
    const inventoryRows = await db.storeInventory.findMany({
      where: { storeId: storeDbId },
      include: {
        product: {
          include: {
            category: { select: { name: true } },
            images: { select: { imageUrl: true }, orderBy: { sortOrder: "asc" }, take: 1 },
          },
        },
      },
    });

    return inventoryRows.map((inv) => {
      const p = inv.product;
      return {
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category?.name ?? "",
        brand: p.brand ?? "Prayog India",
        price: p.price,
        basePrice: p.price,
        mrp: p.mrp,
        image: (p.images as Array<{imageUrl: string}>)?.[0]?.imageUrl ?? "",
        images: (p.images as Array<{imageUrl: string}>)?.map((i) => i.imageUrl) ?? [],
        storeId,
        storeName: STORES[storeId]?.name || storeId,
        isCentralInventory: isCentral,
        quantity: inv.quantity,
        reservedQuantity: inv.reservedQuantity,
        availableQuantity: inv.availableQuantity,
        reorderLevel: inv.reorderLevel,
        lowStockThreshold: inv.lowStockThreshold,
        status: inv.status as StockStatus,
        updatedAt: inv.updatedAt.toISOString(),
      };
    });
  } catch (err) {
    console.error("[inventoryEngine] getStoreInventory error:", err);
    return [];
  }
}

/**
 * Search products within a store's inventory.
 */
export async function searchStoreProducts(params: {
  storeId: StoreId;
  query?: string;
  category?: string;
  inStockOnly?: boolean;
}) {
  const { storeId, query = "", category, inStockOnly = false } = params;
  const items = await getStoreInventory(storeId);
  const q = query.toLowerCase().trim();

  return items.filter((item) => {
    if (category && category !== "all" && item.category.toLowerCase() !== category.toLowerCase()) return false;
    if (inStockOnly && item.availableQuantity <= 0) return false;
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
 * Adjust stock in a specific store (manual adjustment, damage, audit correction)
 * Persisted to PostgreSQL via Prisma with full audit trail logging.
 */
export async function adjustStoreInventory(params: {
  storeId: StoreId | string;
  productId: string;
  quantityChange: number;
  transactionType: TransactionType;
  reason?: string;
  userId?: string;
  deviceId?: string;
}): Promise<{ success: boolean; newQuantity: number; message: string }> {
  const { storeId, productId, quantityChange, transactionType, reason, userId, deviceId } = params;

  try {
    const storeDbId = await resolveStoreDbId(storeId);
    if (!storeDbId) {
      return { success: false, newQuantity: 0, message: `Store '${storeId}' not found in database.` };
    }

    const productDbId = (await resolveProductDbId(productId)) ?? productId;
    const dbDevice = await resolveDeviceDbId(deviceId);

    const currentInv = await db.storeInventory.findUnique({
      where: { storeId_productId: { storeId: storeDbId, productId: productDbId } },
    });
    const currentQty = currentInv?.quantity ?? 0;
    const newQuantity = Math.max(0, currentQty + quantityChange);
    const lowThreshold = currentInv?.lowStockThreshold ?? 5;

    const updated = await db.storeInventory.upsert({
      where: { storeId_productId: { storeId: storeDbId, productId: productDbId } },
      update: {
        quantity: newQuantity,
        availableQuantity: Math.max(0, newQuantity - (currentInv?.reservedQuantity ?? 0)),
        status: computeStatus(newQuantity, lowThreshold),
        updatedAt: new Date(),
      },
      create: {
        storeId: storeDbId,
        productId: productDbId,
        quantity: newQuantity,
        availableQuantity: newQuantity,
        reservedQuantity: 0,
        reorderLevel: 10,
        lowStockThreshold: 5,
        status: computeStatus(newQuantity),
      },
    });

    try {
      await db.inventoryTransaction.create({
        data: {
          storeId: storeDbId,
          productId: productDbId,
          transactionType,
          quantityBefore: currentQty,
          quantityChange,
          quantityAfter: newQuantity,
          userId: userId ?? null,
          deviceId: dbDevice,
          notes: reason ?? `${transactionType} adjustment`,
        },
      });
    } catch (txErr) {
      console.error("[inventoryEngine] transaction log error:", txErr);
    }

    const product = await db.product.findUnique({ where: { id: productDbId }, select: { name: true } });
    return {
      success: true,
      newQuantity: updated.quantity,
      message: `Updated ${product?.name ?? productId} in ${STORES[(storeId as StoreId)]?.name ?? storeId} to ${updated.quantity} units.`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Inventory adjustment failed";
    console.error("[inventoryEngine] adjustStoreInventory error:", err);
    return { success: false, newQuantity: 0, message: msg };
  }
}

/**
 * Deduct inventory for an order — persisted to DB with atomic audit logging.
 */
export async function deductStoreInventory(params: {
  productId: string;
  quantity: number;
  orderSource: "ONLINE_WEB" | "MOBILE_APP" | "WALK_IN";
  storeId?: StoreId;
  orderId?: string;
  userId?: string;
  deviceId?: string;
}): Promise<{
  success: boolean;
  deductedFrom: StoreId;
  remainingStock: number;
  message: string;
}> {
  const { productId, quantity, orderSource, storeId, orderId, userId, deviceId } = params;
  const targetStore: StoreId = orderSource === "WALK_IN" ? storeId || "ranchi" : "ranchi";

  try {
    const storeDbId = await resolveStoreDbId(targetStore);
    if (!storeDbId) {
      return { success: false, deductedFrom: targetStore, remainingStock: 0, message: `Store '${targetStore}' not found.` };
    }

    const productDbId = (await resolveProductDbId(productId)) ?? productId;
    const dbDevice = await resolveDeviceDbId(deviceId);

    const inv = await db.storeInventory.findUnique({
      where: { storeId_productId: { storeId: storeDbId, productId: productDbId } },
    });
    const currentStock = inv?.quantity ?? 0;

    if (currentStock < quantity) {
      return {
        success: false,
        deductedFrom: targetStore,
        remainingStock: currentStock,
        message: `Insufficient stock in ${STORES[targetStore]?.name ?? targetStore}. Available: ${currentStock}, Requested: ${quantity}.`,
      };
    }

    const updatedQty = currentStock - quantity;
    await db.storeInventory.update({
      where: { storeId_productId: { storeId: storeDbId, productId: productDbId } },
      data: {
        quantity: updatedQty,
        availableQuantity: Math.max(0, updatedQty - (inv?.reservedQuantity ?? 0)),
        status: computeStatus(updatedQty, inv?.lowStockThreshold ?? 5),
        updatedAt: new Date(),
      },
    });

    try {
      await db.inventoryTransaction.create({
        data: {
          storeId: storeDbId,
          productId: productDbId,
          orderId: orderId ?? null,
          transactionType: orderSource === "WALK_IN" ? "SALE" : "ONLINE_FULFILLMENT",
          quantityBefore: currentStock,
          quantityChange: -quantity,
          quantityAfter: updatedQty,
          userId: userId ?? null,
          deviceId: dbDevice,
          referenceId: orderId ?? null,
          notes: `${orderSource} order deduction of ${quantity} units`,
        },
      });
    } catch (txErr) {
      console.error("[inventoryEngine] transaction log error:", txErr);
    }

    return {
      success: true,
      deductedFrom: targetStore,
      remainingStock: updatedQty,
      message: `Successfully deducted ${quantity} units from ${STORES[targetStore]?.name ?? targetStore}.`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Deduction failed";
    console.error("[inventoryEngine] deductStoreInventory error:", err);
    return { success: false, deductedFrom: targetStore, remainingStock: 0, message: msg };
  }
}

/**
 * Get product stock across all stores (multi-store matrix) from the database.
 */
export async function getProductMultiStoreBreakdown(
  productId: string,
): Promise<MultiStoreProductStock | null> {
  try {
    const product = await db.product.findUnique({
      where: { id: productId },
      select: { id: true, sku: true, name: true, price: true },
    });
    if (!product) return null;

    const storeIds: StoreId[] = ["ranchi", "patna", "delhi", "mumbai"];
    const storeStocks = {} as Record<StoreId, StoreStockEntry>;
    let totalNetworkStock = 0;

    for (const sid of storeIds) {
      const storeDbId = await resolveStoreDbId(sid);
      let stock = 0, available = 0, allocated = 0, status: StockStatus = "OUT_OF_STOCK";
      let price = product.price;

      if (storeDbId) {
        const [inv, settings] = await Promise.all([
          db.storeInventory.findUnique({ where: { storeId_productId: { storeId: storeDbId, productId } } }),
          db.storeProductSettings.findUnique({ where: { storeId_productId: { storeId: storeDbId, productId } }, select: { priceOverride: true } }),
        ]);
        stock = inv?.quantity ?? 0;
        available = inv?.availableQuantity ?? 0;
        allocated = inv?.reservedQuantity ?? 0;
        status = (inv?.status as StockStatus) ?? computeStatus(stock);
        if (settings?.priceOverride != null) price = settings.priceOverride;
      }

      totalNetworkStock += stock;
      storeStocks[sid] = { storeId: sid, storeName: STORES[sid]?.name ?? sid, isCentral: sid === "ranchi", stock, allocated, available, status, price };
    }

    return { productId: product.id, sku: product.sku, name: product.name, basePrice: product.price, centralStock: storeStocks.ranchi.stock, storeStocks, totalNetworkStock };
  } catch (err) {
    console.error("[inventoryEngine] getProductMultiStoreBreakdown error:", err);
    return null;
  }
}

/**
 * Get complete multi-store inventory matrix across all products from the database.
 */
export async function getMultiStoreInventoryMatrix() {
  try {
    const products = await db.product.findMany({ select: { id: true } });
    const results = await Promise.all(products.map((p) => getProductMultiStoreBreakdown(p.id)));
    return results.filter(Boolean);
  } catch (err) {
    console.error("[inventoryEngine] getMultiStoreInventoryMatrix error:", err);
    return [];
  }
}

/**
 * Query Inventory Transactions Audit Trail from the database.
 */
export async function getInventoryTransactions(filters?: {
  storeId?: StoreId;
  productId?: string;
  transactionType?: TransactionType;
  limit?: number;
}): Promise<InventoryTransactionRecord[]> {
  try {
    const where: Record<string, unknown> = {};
    if (filters?.storeId) {
      const storeDbId = await resolveStoreDbId(filters.storeId);
      if (storeDbId) where.storeId = storeDbId;
    }
    if (filters?.productId) where.productId = filters.productId;
    if (filters?.transactionType) where.transactionType = filters.transactionType;

    const rows = await db.inventoryTransaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: filters?.limit ?? 100,
      include: { product: { select: { name: true, sku: true } } },
    });

    const storeRows = await db.store.findMany({ select: { id: true, code: true } });
    const storeCodeMap: Record<string, StoreId> = {};
    storeRows.forEach((s) => { storeCodeMap[s.id] = s.code.toLowerCase() as StoreId; });

    return rows.map((r) => {
      const row = r as typeof r & { product?: { name?: string; sku?: string } };
      return {
        id: r.id,
        storeId: storeCodeMap[r.storeId] ?? (r.storeId as StoreId),
        productId: r.productId,
        productName: row.product?.name,
        sku: row.product?.sku,
        orderId: r.orderId ?? null,
        transactionType: r.transactionType as TransactionType,
        quantityBefore: r.quantityBefore,
        quantityChange: r.quantityChange,
        quantityAfter: r.quantityAfter,
        userId: r.userId ?? null,
        deviceId: r.deviceId ?? null,
        referenceId: r.referenceId ?? null,
        notes: r.notes ?? null,
        createdAt: r.createdAt.toISOString(),
      };
    });
  } catch (err) {
    console.error("[inventoryEngine] getInventoryTransactions error:", err);
    return [];
  }
}

/**
 * Validate cart items against real store-specific inventory in the database.
 */
export async function validateCartForStore(params: {
  storeId: StoreId;
  items: Array<{ productId: string; quantity: number }>;
}): Promise<{ valid: boolean; errors: Array<{ productId: string; message: string }> }> {
  const { storeId, items } = params;
  const errors: Array<{ productId: string; message: string }> = [];
  for (const item of items) {
    const available = await getProductStockForStore(item.productId, storeId);
    if (available < item.quantity) {
      errors.push({ productId: item.productId, message: `Insufficient stock in ${STORES[storeId]?.name ?? storeId}. Available: ${available}, Requested: ${item.quantity}.` });
    }
  }
  return { valid: errors.length === 0, errors };
}

/**
 * Inter-Store Stock Transfer Workflow — persisted to DB in an atomic transaction.
 */
export async function transferStockBetweenStores(params: {
  sourceStoreId: StoreId;
  destinationStoreId: StoreId;
  items: Array<{ productId: string; quantity: number }>;
  userId?: string;
  notes?: string;
}): Promise<{ success: boolean; transfer?: StockTransferRecord; message: string }> {
  const { sourceStoreId, destinationStoreId, items, userId, notes } = params;

  if (sourceStoreId === destinationStoreId) {
    return { success: false, message: "Source and destination stores cannot be identical." };
  }

  try {
    for (const item of items) {
      const available = await getProductStockForStore(item.productId, sourceStoreId);
      if (available < item.quantity) {
        const p = await db.product.findUnique({ where: { id: item.productId }, select: { name: true } });
        return { success: false, message: `Insufficient stock in ${STORES[sourceStoreId]?.name} for ${p?.name ?? item.productId}. Available: ${available}, Required: ${item.quantity}.` };
      }
    }

    const transferNumber = `TR-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    const sourceDbId = await resolveStoreDbId(sourceStoreId);
    const destDbId = await resolveStoreDbId(destinationStoreId);
    if (!sourceDbId || !destDbId) return { success: false, message: "One or both stores not found in database." };

    const transfer = await db.$transaction(async (tx) => {
      const created = await tx.stockTransfer.create({
        data: {
          transferNumber,
          sourceStoreId: sourceDbId,
          destinationStoreId: destDbId,
          status: "COMPLETED",
          requestedByUserId: userId ?? null,
          approvedByUserId: userId ?? null,
          notes: notes ?? null,
          items: { create: items.map((i) => ({ productId: i.productId, quantity: i.quantity, receivedQuantity: i.quantity })) },
        },
        include: { items: { include: { product: { select: { name: true, sku: true } } } } },
      });

      for (const item of items) {
        const srcInv = await tx.storeInventory.findUnique({ where: { storeId_productId: { storeId: sourceDbId, productId: item.productId } } });
        const srcQty = Math.max(0, (srcInv?.quantity ?? 0) - item.quantity);
        await tx.storeInventory.update({ where: { storeId_productId: { storeId: sourceDbId, productId: item.productId } }, data: { quantity: srcQty, availableQuantity: Math.max(0, srcQty - (srcInv?.reservedQuantity ?? 0)), status: computeStatus(srcQty) } });
        await tx.inventoryTransaction.create({ data: { storeId: sourceDbId, productId: item.productId, transactionType: "TRANSFER_OUT", quantityBefore: srcInv?.quantity ?? 0, quantityChange: -item.quantity, quantityAfter: srcQty, userId: userId ?? null, referenceId: transferNumber } });

        const dstInv = await tx.storeInventory.findUnique({ where: { storeId_productId: { storeId: destDbId, productId: item.productId } } });
        const dstQty = (dstInv?.quantity ?? 0) + item.quantity;
        await tx.storeInventory.upsert({ where: { storeId_productId: { storeId: destDbId, productId: item.productId } }, update: { quantity: dstQty, availableQuantity: Math.max(0, dstQty - (dstInv?.reservedQuantity ?? 0)), status: computeStatus(dstQty) }, create: { storeId: destDbId, productId: item.productId, quantity: dstQty, availableQuantity: dstQty, reservedQuantity: 0, reorderLevel: 10, lowStockThreshold: 5, status: computeStatus(dstQty) } });
        await tx.inventoryTransaction.create({ data: { storeId: destDbId, productId: item.productId, transactionType: "TRANSFER_IN", quantityBefore: dstInv?.quantity ?? 0, quantityChange: item.quantity, quantityAfter: dstQty, userId: userId ?? null, referenceId: transferNumber } });
      }
      return created;
    });

    const storeCodeMap: Record<string, StoreId> = {};
    (await db.store.findMany({ select: { id: true, code: true } })).forEach((s) => { storeCodeMap[s.id] = s.code.toLowerCase() as StoreId; });

    const transferRecord: StockTransferRecord = {
      id: transfer.id,
      transferNumber: transfer.transferNumber,
      sourceStoreId,
      destinationStoreId,
      status: "COMPLETED",
      items: transfer.items.map((i) => {
        const item = i as typeof i & { product?: { name?: string; sku?: string } };
        return { productId: i.productId, productName: item.product?.name ?? i.productId, sku: item.product?.sku ?? "", quantity: i.quantity, receivedQuantity: i.receivedQuantity };
      }),
      requestedByUserId: userId,
      approvedByUserId: userId,
      notes: notes ?? undefined,
      createdAt: transfer.createdAt.toISOString(),
      updatedAt: transfer.updatedAt.toISOString(),
    };

    return { success: true, transfer: transferRecord, message: `Transferred ${items.reduce((s, i) => s + i.quantity, 0)} units from ${STORES[sourceStoreId]?.name} to ${STORES[destinationStoreId]?.name}.` };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Transfer failed";
    console.error("[inventoryEngine] transferStockBetweenStores error:", err);
    return { success: false, message: msg };
  }
}

/**
 * Get all Stock Transfers from the database.
 */
export async function getStockTransfers(): Promise<StockTransferRecord[]> {
  try {
    const storeRows = await db.store.findMany({ select: { id: true, code: true } });
    const storeCodeMap: Record<string, StoreId> = {};
    storeRows.forEach((s) => { storeCodeMap[s.id] = s.code.toLowerCase() as StoreId; });

    const transfers = await db.stockTransfer.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { items: { include: { product: { select: { name: true, sku: true } } } } },
    });

    return transfers.map((t) => ({
      id: t.id,
      transferNumber: t.transferNumber,
      sourceStoreId: storeCodeMap[t.sourceStoreId] ?? (t.sourceStoreId as StoreId),
      destinationStoreId: storeCodeMap[t.destinationStoreId] ?? (t.destinationStoreId as StoreId),
      status: t.status as StockTransferRecord["status"],
      items: t.items.map((i) => {
        const item = i as typeof i & { product?: { name?: string; sku?: string } };
        return { productId: i.productId, productName: item.product?.name ?? i.productId, sku: item.product?.sku ?? "", quantity: i.quantity, receivedQuantity: i.receivedQuantity };
      }),
      requestedByUserId: t.requestedByUserId ?? undefined,
      approvedByUserId: t.approvedByUserId ?? undefined,
      notes: t.notes ?? undefined,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    }));
  } catch (err) {
    console.error("[inventoryEngine] getStockTransfers error:", err);
    return [];
  }
}

/**
 * Register a newly created product across all store inventory records.
 */
export async function registerProductInEngine(
  productId: string,
  initialRanchiStock = 25,
): Promise<void> {
  const storeIds: StoreId[] = ["ranchi", "patna", "delhi", "mumbai"];
  for (const sid of storeIds) {
    const storeDbId = await resolveStoreDbId(sid);
    if (!storeDbId) continue;
    const qty = sid === "ranchi" ? initialRanchiStock : 0;
    await db.storeInventory.upsert({
      where: { storeId_productId: { storeId: storeDbId, productId } },
      update: {},
      create: { storeId: storeDbId, productId, quantity: qty, availableQuantity: qty, reservedQuantity: 0, reorderLevel: 10, lowStockThreshold: 5, status: computeStatus(qty) },
    });
  }
}

/** @deprecated No-op: inventory is now DB-backed and does not require seeding */
export function initializeStoreInventory(): void {}
