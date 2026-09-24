"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  ArrowRightLeft,
  Boxes,
  Plus,
  Truck,
  X,
  History,
} from "lucide-react";
import {
  INITIAL_STOCK_TRANSFERS,
  INITIAL_STOCK_ADJUSTMENTS,
  InterStoreTransfer,
  StockAdjustmentEntry,
} from "@/data/inventoryTransfersData";
import { PRODUCTS } from "@/data/mockData";

export interface InventoryItemRow {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  ranchiStock: number;
  patnaStock: number;
  delhiStock: number;
  mumbaiStock: number;
  reservedStock: number;
  inStock: boolean;
  shippingTag: string;
}

export default function AdminInventoryPage() {
  const [items, setItems] = useState<InventoryItemRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "stock" | "transfers" | "adjustments"
  >("stock");

  // Transfers & Adjustments State
  const [transfers, setTransfers] = useState<InterStoreTransfer[]>(
    INITIAL_STOCK_TRANSFERS,
  );
  const [adjustments, setAdjustments] = useState<StockAdjustmentEntry[]>(
    INITIAL_STOCK_ADJUSTMENTS,
  );

  // Transfer Wizard Modal State
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferSource, setTransferSource] = useState("RANCHI");
  const [transferDest, setTransferDest] = useState("PATNA");
  const [transferProductSku, setTransferProductSku] = useState(PRODUCTS[0].sku);
  const [transferQty, setTransferQty] = useState(10);
  const [transferNotes, setTransferNotes] = useState("");

  // Adjustment Modal State
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustStore, setAdjustStore] = useState("RANCHI");
  const [adjustProductSku, setAdjustProductSku] = useState(PRODUCTS[0].sku);
  const [adjustQuantity, setAdjustQuantity] = useState(-1);
  const [adjustReason, setAdjustReason] =
    useState<StockAdjustmentEntry["reason"]>("Damaged goods");
  const [adjustNotes, setAdjustNotes] = useState("");

  // Professional Direct Restock / Add Stock Modal State
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [selectedProductForStock, setSelectedProductForStock] =
    useState<InventoryItemRow | null>(null);
  const [addStockStore, setAddStockStore] = useState<
    "ranchi" | "patna" | "delhi" | "mumbai"
  >("ranchi");
  const [addStockQuantity, setAddStockQuantity] = useState<number>(50);
  const [addStockPoNumber, setAddStockPoNumber] = useState<string>("");
  const [addStockVendor, setAddStockVendor] = useState<string>(
    "Official Manufacturer / Prayog Central",
  );
  const [addStockBatchNumber, setAddStockBatchNumber] = useState<string>("");
  const [addStockNotes, setAddStockNotes] = useState<string>("");
  const [isSubmittingStock, setIsSubmittingStock] = useState<boolean>(false);

  const fetchInventory = () => {
    fetch(`/api/admin/inventory?q=${encodeURIComponent(searchQuery)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setItems(
            data.data.map(
              (item: {
                productId?: string;
                id: string;
                name: string;
                sku: string;
                category?: string;
                basePrice?: number;
                price?: number;
                totalNetworkStock?: number;
                stock?: number;
                storeStocks?: Record<string, { stock?: number }>;
                ranchiStock?: number;
                patnaStock?: number;
                delhiStock?: number;
                mumbaiStock?: number;
                centralStock?: number;
              }) => ({
                id: item.productId || item.id,
                name: item.name,
                sku: item.sku,
                category: item.category || "Components",
                price: item.basePrice || item.price || 0,
                stock: item.totalNetworkStock ?? item.stock ?? 0,
                ranchiStock:
                  item.storeStocks?.ranchi?.stock ??
                  item.ranchiStock ??
                  item.centralStock ??
                  0,
                patnaStock:
                  item.storeStocks?.patna?.stock ?? item.patnaStock ?? 0,
                delhiStock:
                  item.storeStocks?.delhi?.stock ?? item.delhiStock ?? 0,
                mumbaiStock:
                  item.storeStocks?.mumbai?.stock ?? item.mumbaiStock ?? 0,
                reservedStock: 0,
                inStock: (item.totalNetworkStock ?? item.stock ?? 0) > 0,
                shippingTag: "Standard",
              }),
            ),
          );
        }
      })
      .catch(() => {});
  };

  const fetchTransactions = () => {
    fetch("/api/admin/inventory?mode=transactions")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && data.data.length > 0) {
          setAdjustments(
            data.data.map(
              (t: {
                id: string;
                storeId?: string;
                productId: string;
                productName?: string;
                sku?: string;
                quantityBefore: number;
                quantityChange: number;
                quantityAfter: number;
                notes?: string;
                transactionType: string;
                userId?: string;
                createdAt: string;
              }) => ({
                id: t.id,
                adjustmentNumber: t.id.toUpperCase(),
                storeCode: (t.storeId || "RANCHI").toUpperCase(),
                storeName:
                  t.storeId === "ranchi"
                    ? "Ranchi Central Hub"
                    : `${(t.storeId || "").toUpperCase()} Branch`,
                productId: t.productId,
                productName: t.productName || t.productId,
                sku: t.sku || "",
                previousStock: t.quantityBefore,
                adjustmentQuantity: t.quantityChange,
                newStock: t.quantityAfter,
                reason: (t.notes ||
                  t.transactionType) as StockAdjustmentEntry["reason"],
                adjustedBy: t.userId || "System",
                timestamp: t.createdAt.replace("T", " ").slice(0, 16),
                notes: t.notes || "",
              }),
            ),
          );
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (!isMounted) return;
      fetchInventory();
      fetchTransactions();
    };
    loadData();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const handleUpdateStock = async (productId: string, currentStock: number) => {
    const nextStock = prompt(
      "Enter updated inventory stock count for Ranchi Central / Branch Hub:",
      String(currentStock),
    );
    if (nextStock === null) return;
    const parsed = parseInt(nextStock, 10);
    if (isNaN(parsed) || parsed < 0)
      return alert("Invalid stock count. Must be 0 or greater.");

    const qtyDiff = parsed - currentStock;

    try {
      const res = await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: "ranchi",
          productId,
          quantityChange: qtyDiff,
          transactionType: "ADJUSTMENT",
          reason: "Manager Manual Adjustment",
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchInventory();
        fetchTransactions();
      } else {
        alert(data.message || "Failed to update stock");
      }
    } catch {
      fetchInventory();
    }
  };

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (transferSource === transferDest) {
      alert("Source and destination stores must be different.");
      return;
    }
    const selectedProd =
      PRODUCTS.find((p) => p.sku === transferProductSku) || PRODUCTS[0];

    try {
      const res = await fetch("/api/admin/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceStoreId: transferSource.toLowerCase(),
          destinationStoreId: transferDest.toLowerCase(),
          items: [
            { productId: selectedProd.id, quantity: Number(transferQty) },
          ],
          notes: transferNotes,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setShowTransferModal(false);
        setActiveTab("transfers");
        setTransferNotes("");
        fetchInventory();
        fetchTransactions();
        alert(data.message || `Transfer initiated successfully.`);
      } else {
        alert(data.message || "Transfer failed.");
      }
    } catch {
      alert("Transfer request failed.");
    }
  };

  const handleCreateAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedProd =
      PRODUCTS.find((p) => p.sku === adjustProductSku) || PRODUCTS[0];

    try {
      const res = await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: adjustStore.toLowerCase(),
          productId: selectedProd.id,
          quantityChange: Number(adjustQuantity),
          transactionType: "ADJUSTMENT",
          reason: `${adjustReason} - ${adjustNotes}`,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setShowAdjustModal(false);
        setActiveTab("adjustments");
        setAdjustNotes("");
        fetchInventory();
        fetchTransactions();
        alert(data.message || `Stock adjustment recorded.`);
      } else {
        alert(data.message || "Adjustment failed.");
      }
    } catch {
      alert("Stock adjustment request failed.");
    }
  };

  const handleOpenAddStock = (productItem?: InventoryItemRow) => {
    const target =
      productItem || items[0] || (PRODUCTS[0] as unknown as InventoryItemRow);
    setSelectedProductForStock(target);
    setAddStockQuantity(50);
    setAddStockPoNumber(
      `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    );
    setAddStockBatchNumber(`BAT-${Date.now().toString().slice(-6)}`);
    setAddStockNotes("Inward Restock Shipment Verified");
    setShowAddStockModal(true);
  };

  const handleProfessionalAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForStock || addStockQuantity <= 0) {
      alert("Please specify a valid product and quantity greater than zero.");
      return;
    }

    setIsSubmittingStock(true);
    try {
      const reasonDetail = `RESTOCK INWARD | PO: ${addStockPoNumber || "N/A"} | Vendor: ${addStockVendor} | Batch: ${addStockBatchNumber || "N/A"}${addStockNotes ? " | " + addStockNotes : ""}`;

      const res = await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: addStockStore,
          productId: selectedProductForStock.id || selectedProductForStock.sku,
          quantityChange: Number(addStockQuantity),
          transactionType: "RESTOCK",
          reason: reasonDetail,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setShowAddStockModal(false);
        fetchInventory();
        fetchTransactions();
        alert(
          `✅ Stock Inward Successfully Recorded!\n\nAdded +${addStockQuantity} units of "${selectedProductForStock.name}" to ${addStockStore.toUpperCase()}.\nAudit Reference: ${addStockPoNumber}`,
        );
      } else {
        alert(data.message || "Failed to add stock.");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to commit stock inward.";
      alert(msg);
    } finally {
      setIsSubmittingStock(false);
    }
  };

  const handleReceiveTransfer = (transferId: string) => {
    setTransfers((prev) =>
      prev.map((t) => {
        if (t.id === transferId) {
          return {
            ...t,
            status: "Received & Stock Updated",
            receivedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
          };
        }
        return t;
      }),
    );
    alert(
      "Stock received! Destination branch inventory has been updated automatically.",
    );
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 animate-in fade-in duration-300">
      {/* 1. Header with Multi-Store Principle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#E0F7FC] px-3.5 py-1 rounded-full border border-[#00AEEF]/20">
              Section 37–42 · Multi-Location Inventory &amp; Inter-Store
              Transfers
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Multi-Store Stock &amp; Inventory Engine
          </h1>
          <p className="text-xs text-slate-500">
            Ranchi Main Hub acts as central inventory for Website, App, and
            Ranchi Store. Independent branch stocks in Patna, Delhi, and Mumbai
            with inter-store transfer pipelines.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleOpenAddStock()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Add Stock / Inward</span>
          </button>

          <button
            onClick={() => setShowTransferModal(true)}
            className="bg-[#00AEEF] hover:bg-[#0096D6] text-white px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer transition-all"
          >
            <ArrowRightLeft className="w-4 h-4 text-[#FFC20E]" />
            <span>Store Transfer Wizard</span>
          </button>

          <button
            onClick={() => setShowAdjustModal(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer transition-all"
          >
            <History className="w-4 h-4 text-emerald-400" />
            <span>Audit Adjustment</span>
          </button>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("stock")}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "stock"
              ? "bg-[#00AEEF] text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Boxes className="w-3.5 h-3.5 inline mr-1.5" />
          Location-Wise Stock Pool
        </button>

        <button
          onClick={() => setActiveTab("transfers")}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "transfers"
              ? "bg-[#00AEEF] text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Truck className="w-3.5 h-3.5 inline mr-1.5" />
          Inter-Store Transfers ({transfers.length})
        </button>

        <button
          onClick={() => setActiveTab("adjustments")}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "adjustments"
              ? "bg-[#00AEEF] text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <History className="w-3.5 h-3.5 inline mr-1.5" />
          Stock Adjustment Audit Log ({adjustments.length})
        </button>
      </div>

      {/* 3. Tab 1: Location-Wise Stock Pool */}
      {activeTab === "stock" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search SKU or product..."
                className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00AEEF]"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lowStockFilter}
                  onChange={(e) => setLowStockFilter(e.target.checked)}
                  className="rounded text-[#00AEEF] accent-[#00AEEF]"
                />
                <span>Low Stock Only</span>
              </label>
            </div>
          </div>

          <div className="w-full">
            <table className="w-full text-left text-xs border-collapse table-auto">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                  <th className="py-3 pr-2 font-black">Product &amp; SKU</th>
                  <th className="py-3 px-2 font-black text-center whitespace-nowrap bg-blue-50/60 rounded-t-xl text-blue-900">
                    🏢 Ranchi Hub
                  </th>
                  <th className="py-3 px-2 font-black text-center whitespace-nowrap">
                    🏬 Patna
                  </th>
                  <th className="py-3 px-2 font-black text-center whitespace-nowrap">
                    🏬 Delhi
                  </th>
                  <th className="py-3 px-2 font-black text-center whitespace-nowrap text-amber-700">
                    🔒 Reserved
                  </th>
                  <th className="py-3 px-2 font-black text-center whitespace-nowrap bg-emerald-50/60 rounded-t-xl text-emerald-900">
                    📦 Total
                  </th>
                  <th className="py-3 pl-2 font-black text-right whitespace-nowrap">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3 pr-2">
                      <div className="font-extrabold text-slate-900 line-clamp-1 text-xs">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono font-bold mt-0.5">
                        {item.sku}
                      </div>
                    </td>

                    <td className="py-3 px-2 text-center bg-blue-50/20">
                      <span className="font-black text-slate-900 bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-lg inline-block text-[11px]">
                        {item.ranchiStock ?? item.stock} Units
                      </span>
                      <div className="text-[8px] text-slate-400 font-bold mt-0.5 whitespace-nowrap">
                        Online + Ranchi
                      </div>
                    </td>

                    <td className="py-3 px-2 text-center font-bold text-slate-700">
                      <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-lg border border-slate-200/80 inline-block text-[11px]">
                        {item.patnaStock ?? 12} Units
                      </span>
                    </td>

                    <td className="py-3 px-2 text-center font-bold text-slate-700">
                      <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-lg border border-slate-200/80 inline-block text-[11px]">
                        {item.delhiStock ?? 8} Units
                      </span>
                    </td>

                    <td className="py-3 px-2 text-center font-bold text-amber-700">
                      <span className="bg-amber-50 text-amber-800 border border-amber-200/60 px-2 py-0.5 rounded-lg inline-block text-[11px]">
                        {item.reservedStock ?? 2} Units
                      </span>
                    </td>

                    <td className="py-3 px-2 text-center font-black text-emerald-700 bg-emerald-50/20">
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-lg inline-block font-mono font-black text-[11px]">
                        {(item.ranchiStock ?? item.stock) +
                          (item.patnaStock ?? 12) +
                          (item.delhiStock ?? 8)}{" "}
                        Units
                      </span>
                    </td>

                    <td className="py-3 pl-2 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenAddStock(item)}
                          title="Restock Inward for this product"
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-black text-[11px] rounded-lg cursor-pointer transition-colors border border-emerald-200 flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Inward</span>
                        </button>

                        <button
                          onClick={() => handleUpdateStock(item.id, item.stock)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold text-[11px] cursor-pointer transition-colors border border-slate-200/60"
                        >
                          Adjust
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Tab 2: Inter-Store Transfers */}
      {activeTab === "transfers" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase">
                Active Store-to-Store Stock Transfers
              </h3>
              <p className="text-xs text-slate-500">
                Track dispatch, transit courier AWB, and receiving store
                confirmations.
              </p>
            </div>
            <button
              onClick={() => setShowTransferModal(true)}
              className="px-3 py-1.5 bg-[#00AEEF] text-white rounded-xl font-bold text-xs"
            >
              + Initiate Transfer
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                  <th className="pb-3">Transfer Ref #</th>
                  <th className="pb-3">Product / SKU</th>
                  <th className="pb-3">Source Hub</th>
                  <th className="pb-3">Destination Store</th>
                  <th className="pb-3">Qty</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transfers.map((trf) => (
                  <tr
                    key={trf.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5">
                      <div className="font-mono font-black text-slate-900">
                        {trf.transferNumber}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {trf.dispatchedAt}
                      </div>
                    </td>

                    <td className="py-3.5 font-bold text-slate-900">
                      <div>{trf.productName}</div>
                      <span className="font-mono text-[10px] text-slate-400">
                        {trf.sku}
                      </span>
                    </td>

                    <td className="py-3.5 font-semibold text-slate-700">
                      {trf.sourceStoreName}
                    </td>

                    <td className="py-3.5 font-semibold text-slate-700">
                      {trf.destinationStoreName}
                    </td>

                    <td className="py-3.5 font-black text-slate-900">
                      {trf.quantity} Units
                    </td>

                    <td className="py-3.5">
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          trf.status === "Received & Stock Updated"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {trf.status}
                      </span>
                    </td>

                    <td className="py-3.5 text-right">
                      {trf.status === "Dispatched & In Transit" && (
                        <button
                          onClick={() => handleReceiveTransfer(trf.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-[10px] uppercase tracking-wider cursor-pointer shadow-xs"
                        >
                          Confirm Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Tab 3: Stock Adjustment Audit Trail */}
      {activeTab === "adjustments" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase">
                Section 42 Stock Adjustment Audit Log
              </h3>
              <p className="text-xs text-slate-500">
                Every damaged, lost, or corrected unit creates an immutable
                audit record.
              </p>
            </div>
            <button
              onClick={() => setShowAdjustModal(true)}
              className="px-3 py-1.5 bg-slate-900 text-white rounded-xl font-bold text-xs"
            >
              + Record Adjustment
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                  <th className="pb-3">Audit # &amp; Date</th>
                  <th className="pb-3">Store Location</th>
                  <th className="pb-3">Product / SKU</th>
                  <th className="pb-3">Adjustment Reason</th>
                  <th className="pb-3">Prev ➔ New</th>
                  <th className="pb-3">Adjusted By</th>
                  <th className="pb-3 text-right">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {adjustments.map((adj) => (
                  <tr
                    key={adj.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5">
                      <div className="font-mono font-black text-slate-900">
                        {adj.adjustmentNumber}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {adj.timestamp}
                      </div>
                    </td>

                    <td className="py-3.5 font-bold text-slate-700">
                      {adj.storeName}
                    </td>

                    <td className="py-3.5 font-bold text-slate-900">
                      <div>{adj.productName}</div>
                      <span className="font-mono text-[10px] text-slate-400">
                        {adj.sku}
                      </span>
                    </td>

                    <td className="py-3.5">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          adj.reason === "Damaged goods" ||
                          adj.reason === "Lost goods"
                            ? "bg-red-100 text-red-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {adj.reason}
                      </span>
                    </td>

                    <td className="py-3.5 font-black text-slate-900">
                      <span className="text-slate-400 line-through mr-1">
                        {adj.previousStock}
                      </span>
                      <span
                        className={
                          adj.adjustmentQuantity < 0
                            ? "text-red-600"
                            : "text-emerald-600"
                        }
                      >
                        {adj.adjustmentQuantity > 0
                          ? `+${adj.adjustmentQuantity}`
                          : adj.adjustmentQuantity}
                      </span>
                      <span className="ml-1 text-slate-900">
                        ({adj.newStock})
                      </span>
                    </td>

                    <td className="py-3.5 font-medium text-slate-600">
                      {adj.adjustedBy}
                    </td>

                    <td
                      className="py-3.5 text-right font-medium text-slate-500 max-w-xs truncate"
                      title={adj.notes}
                    >
                      {adj.notes || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transfer Wizard Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            onClick={() => setShowTransferModal(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
          />
          <div className="relative max-w-md w-full bg-white rounded-3xl p-6 sm:p-7 shadow-2xl z-10 space-y-4 text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 uppercase">
                Initiate Inter-Store Stock Transfer
              </h3>
              <button
                onClick={() => setShowTransferModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTransfer} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Source Store *
                  </label>
                  <select
                    value={transferSource}
                    onChange={(e) => setTransferSource(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900"
                  >
                    <option value="RANCHI">Ranchi Central Hub</option>
                    <option value="PATNA">Patna Branch</option>
                    <option value="DELHI">Delhi NCR Hub</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Destination Store *
                  </label>
                  <select
                    value={transferDest}
                    onChange={(e) => setTransferDest(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900"
                  >
                    <option value="PATNA">Patna Branch</option>
                    <option value="DELHI">Delhi NCR Hub</option>
                    <option value="RANCHI">Ranchi Central Hub</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Select Product *
                </label>
                <select
                  value={transferProductSku}
                  onChange={(e) => setTransferProductSku(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900"
                >
                  {PRODUCTS.map((p) => (
                    <option key={p.sku} value={p.sku}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Transfer Units (Qty) *
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={transferQty}
                  onChange={(e) => setTransferQty(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Transfer Notes / Reason
                </label>
                <input
                  type="text"
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  placeholder="e.g. Replenishment for local robotics workshop"
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 font-bold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#00AEEF] hover:bg-[#0096D6] text-white px-5 py-2.5 rounded-xl font-black uppercase shadow-md"
                >
                  Dispatch &amp; Create AWB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            onClick={() => setShowAdjustModal(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
          />
          <div className="relative max-w-md w-full bg-white rounded-3xl p-6 sm:p-7 shadow-2xl z-10 space-y-4 text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 uppercase">
                Record Section 42 Stock Adjustment
              </h3>
              <button
                onClick={() => setShowAdjustModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdjustment} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Store Location *
                  </label>
                  <select
                    value={adjustStore}
                    onChange={(e) => setAdjustStore(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900"
                  >
                    <option value="RANCHI">Ranchi Central Hub</option>
                    <option value="PATNA">Patna Branch</option>
                    <option value="DELHI">Delhi NCR Hub</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Reason *
                  </label>
                  <select
                    value={adjustReason}
                    onChange={(e) =>
                      setAdjustReason(
                        e.target.value as StockAdjustmentEntry["reason"],
                      )
                    }
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900"
                  >
                    <option value="Damaged goods">Damaged goods</option>
                    <option value="Lost goods">Lost goods</option>
                    <option value="Physical count correction">
                      Physical count correction
                    </option>
                    <option value="Returns">Returns</option>
                    <option value="Internal consumption">
                      Internal consumption
                    </option>
                    <option value="Manual correction">Manual correction</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Select Product *
                </label>
                <select
                  value={adjustProductSku}
                  onChange={(e) => setAdjustProductSku(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900"
                >
                  {PRODUCTS.map((p) => (
                    <option key={p.sku} value={p.sku}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Quantity Adjustment (+ or -) *
                </label>
                <input
                  type="number"
                  required
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(Number(e.target.value))}
                  placeholder="-1 for damaged, +5 for audit count"
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Audit Notes / Incident Detail
                </label>
                <input
                  type="text"
                  required
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  placeholder="e.g. Damaged in shipment or found in stock count"
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 font-bold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-black uppercase shadow-md"
                >
                  Commit Audit Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Professional Add Stock / Inward Modal */}
      {showAddStockModal && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            onClick={() => !isSubmittingStock && setShowAddStockModal(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
          />
          <div className="relative max-w-lg w-full bg-white rounded-3xl p-6 sm:p-7 shadow-2xl z-10 space-y-4 text-xs animate-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 uppercase">
                    Stock Inward &amp; Restock
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Receive shipments, allocate to store inventory, and log
                    audit entries.
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  !isSubmittingStock && setShowAddStockModal(false)
                }
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProfessionalAddStock} className="space-y-4">
              {/* Product Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Target Product *
                </label>
                <select
                  value={
                    selectedProductForStock?.id ||
                    selectedProductForStock?.sku ||
                    ""
                  }
                  onChange={(e) => {
                    const found = items.find(
                      (i) =>
                        i.id === e.target.value || i.sku === e.target.value,
                    );
                    if (found) setSelectedProductForStock(found);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900"
                >
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} ({i.sku}) — Current Ranchi:{" "}
                      {i.ranchiStock ?? i.stock} units
                    </option>
                  ))}
                </select>
              </div>

              {/* Store & Inward Quantity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Destination Store *
                  </label>
                  <select
                    value={addStockStore}
                    onChange={(e) =>
                      setAddStockStore(
                        e.target.value as
                          "ranchi" | "patna" | "delhi" | "mumbai",
                      )
                    }
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900"
                  >
                    <option value="ranchi">
                      🏢 Ranchi Central Hub (Web + Ranchi)
                    </option>
                    <option value="patna">🏬 Patna Robotics Branch</option>
                    <option value="delhi">
                      🏬 Delhi NCR Innovation Center
                    </option>
                    <option value="mumbai">🏬 Mumbai Western Drone Hub</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Inward Units (Qty) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      required
                      value={addStockQuantity}
                      onChange={(e) =>
                        setAddStockQuantity(Number(e.target.value))
                      }
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-black text-slate-900 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[10px]">
                      Units
                    </span>
                  </div>
                </div>
              </div>

              {/* Purchase Order & Batch Tracking */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Purchase Order (PO) #
                  </label>
                  <input
                    type="text"
                    value={addStockPoNumber}
                    onChange={(e) => setAddStockPoNumber(e.target.value)}
                    placeholder="e.g. PO-2026-4891"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Batch / Lot #
                  </label>
                  <input
                    type="text"
                    value={addStockBatchNumber}
                    onChange={(e) => setAddStockBatchNumber(e.target.value)}
                    placeholder="e.g. BAT-829103"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Supplier / Vendor */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Supplier / Vendor
                </label>
                <input
                  type="text"
                  value={addStockVendor}
                  onChange={(e) => setAddStockVendor(e.target.value)}
                  placeholder="e.g. Official Arduino Distributor / SparkFun Electronics"
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium text-slate-900"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Receiving Inspection Notes
                </label>
                <input
                  type="text"
                  value={addStockNotes}
                  onChange={(e) => setAddStockNotes(e.target.value)}
                  placeholder="e.g. All cartons inspected, anti-static seal intact"
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium text-slate-900"
                />
              </div>

              {/* Summary Pill */}
              <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-2xl flex items-center justify-between text-[11px]">
                <span className="font-bold text-emerald-900">
                  Total Addition: +{addStockQuantity} units to{" "}
                  {addStockStore.toUpperCase()}
                </span>
                <span className="font-extrabold text-emerald-700">
                  RESTOCK Audit Logged
                </span>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSubmittingStock}
                  onClick={() => setShowAddStockModal(false)}
                  className="px-4 py-2 font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingStock}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-black uppercase shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {isSubmittingStock
                      ? "Committing Inward..."
                      : "Confirm & Inward Stock"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
