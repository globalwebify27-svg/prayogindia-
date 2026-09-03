"use client";

import React, { useState } from "react";
import {
  Truck,
  Plus,
  Search,
  Building2,
  TrendingUp,
  DollarSign,
  Calendar,
  CheckCircle2,
  FileText,
  Percent,
  Package,
  BarChart3,
  History,
  X,
  Boxes,
  ArrowUpRight,
  TrendingDown,
} from "lucide-react";
import { PRODUCTS } from "@/data/mockData";

export interface PurchasePriceRecord {
  date: string;
  qty: number;
  price: number;
  supplier: string;
}

export interface PurchaseEntry {
  id: string;
  poNumber: string;
  supplierName: string;
  supplierGstin: string;
  invoiceNo: string;
  date: string;
  productName: string;
  sku: string;
  locationStore: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  shippingLandedCost: number;
  totalBillAmount: number;
  paymentStatus: "PAID" | "DUE";
}

// Section 45 Historical Purchase Price Ledger by SKU
export const HISTORICAL_PURCHASE_LEDGER: Record<string, PurchasePriceRecord[]> =
  {
    "PRG-ARD-001": [
      {
        date: "01-Jan-26",
        qty: 100,
        price: 280,
        supplier: "Arduino OEM Direct",
      },
      {
        date: "15-Mar-26",
        qty: 50,
        price: 295,
        supplier: "Arduino Global Tech",
      },
      {
        date: "20-Jun-26",
        qty: 100,
        price: 310,
        supplier: "Semiconductor Importers",
      },
      {
        date: "11-Aug-26",
        qty: 50,
        price: 320,
        supplier: "Arduino Tech Global Ltd.",
      },
    ],
    "PRG-UAV-601": [
      { date: "10-Feb-26", qty: 15, price: 9600, supplier: "Holybro Direct" },
      { date: "05-May-26", qty: 25, price: 9900, supplier: "Holybro Robotics" },
      {
        date: "22-Aug-26",
        qty: 20,
        price: 10200,
        supplier: "Holybro Pixhawk Robotics Corp.",
      },
    ],
    "PRG-RPI-508": [
      {
        date: "15-Jan-26",
        qty: 40,
        price: 6400,
        supplier: "Raspberry Pi Trading",
      },
      {
        date: "10-Apr-26",
        qty: 50,
        price: 6600,
        supplier: "Element14 Importers",
      },
      {
        date: "25-Aug-26",
        qty: 50,
        price: 6800,
        supplier: "Raspberry Pi Foundation Trading",
      },
    ],
  };

const MOCK_PURCHASES: PurchaseEntry[] = [
  {
    id: "pur-1",
    poNumber: "PO-2026-081",
    supplierName: "Arduino Tech Global Ltd.",
    supplierGstin: "27AABCU9603R1ZM",
    invoiceNo: "INV-ARD-9941",
    date: "11 Aug 2026",
    productName: "Arduino UNO R3 Official Board (ATmega328P)",
    sku: "PRG-ARD-001",
    locationStore: "Ranchi Central Hub",
    quantity: 50,
    costPrice: 320,
    sellingPrice: 450,
    shippingLandedCost: 15,
    totalBillAmount: 16750,
    paymentStatus: "PAID",
  },
  {
    id: "pur-2",
    poNumber: "PO-2026-082",
    supplierName: "Holybro Pixhawk Robotics Corp.",
    supplierGstin: "29AAACH1234F1Z8",
    invoiceNo: "INV-HLB-4412",
    date: "22 Aug 2026",
    productName: "Pixhawk 6C Autopilot Flight Controller Unit",
    sku: "PRG-UAV-601",
    locationStore: "Ranchi Central Hub",
    quantity: 20,
    costPrice: 10200,
    sellingPrice: 14500,
    shippingLandedCost: 300,
    totalBillAmount: 210000,
    paymentStatus: "PAID",
  },
  {
    id: "pur-3",
    poNumber: "PO-2026-083",
    supplierName: "Raspberry Pi Foundation Trading",
    supplierGstin: "07AAACR4412E1Z1",
    invoiceNo: "INV-RPI-8819",
    date: "25 Aug 2026",
    productName: "Raspberry Pi 5 Model B (8GB RAM)",
    sku: "PRG-RPI-508",
    locationStore: "Patna Branch Store",
    quantity: 50,
    costPrice: 6800,
    sellingPrice: 8999,
    shippingLandedCost: 150,
    totalBillAmount: 347500,
    paymentStatus: "PAID",
  },
];

export default function PurchasesSupplierPage() {
  const [purchases, setPurchases] = useState<PurchaseEntry[]>(MOCK_PURCHASES);
  const [priceLedger, setPriceLedger] = useState<
    Record<string, PurchasePriceRecord[]>
  >(HISTORICAL_PURCHASE_LEDGER);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSkuForHistory, setSelectedSkuForHistory] = useState<
    string | null
  >(null);

  // New Purchase Entry Form State
  const [supplierName, setSupplierName] = useState("");
  const [supplierGstin, setSupplierGstin] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [selectedSku, setSelectedSku] = useState(PRODUCTS[0].sku);
  const [targetStore, setTargetStore] = useState("Ranchi Central Hub");
  const [quantity, setQuantity] = useState("50");
  const [costPrice, setCostPrice] = useState("320");
  const [sellingPrice, setSellingPrice] = useState("450");
  const [shippingLandedCost, setShippingLandedCost] = useState("15");

  const selectedProduct =
    PRODUCTS.find((p) => p.sku === selectedSku) || PRODUCTS[0];

  const handleCreatePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(quantity, 10) || 1;
    const cp = parseFloat(costPrice) || 0;
    const sp = parseFloat(sellingPrice) || 0;
    const freight = parseFloat(shippingLandedCost) || 0;
    const totalBill = (cp + freight) * qty;

    const newPurchase: PurchaseEntry = {
      id: `pur-${Date.now()}`,
      poNumber: `PO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      supplierName: supplierName.trim(),
      supplierGstin: supplierGstin.trim() || "20AAACP9921E1Z5",
      invoiceNo: invoiceNo.trim() || `INV-${Date.now().toString().slice(-4)}`,
      date: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      productName: selectedProduct.name,
      sku: selectedProduct.sku,
      locationStore: targetStore,
      quantity: qty,
      costPrice: cp,
      sellingPrice: sp,
      shippingLandedCost: freight,
      totalBillAmount: totalBill,
      paymentStatus: "PAID",
    };

    // Update purchases list
    setPurchases([newPurchase, ...purchases]);

    // Section 45: Append new price record to historical ledger
    const newPriceRecord: PurchasePriceRecord = {
      date: new Date()
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "2-digit",
        })
        .replace(/ /g, "-"),
      qty,
      price: cp,
      supplier: supplierName.trim(),
    };

    setPriceLedger((prev) => ({
      ...prev,
      [selectedProduct.sku]: [
        ...(prev[selectedProduct.sku] || []),
        newPriceRecord,
      ],
    }));

    setShowCreateModal(false);
    alert(
      `Purchase Entry recorded! ${qty} units added to ${targetStore}. Supplier cost ledger updated.`,
    );

    // Reset Form
    setSupplierName("");
    setInvoiceNo("");
  };

  const filteredPurchases = purchases.filter(
    (p) =>
      p.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalProcurementSpend = purchases.reduce(
    (sum, p) => sum + p.totalBillAmount,
    0,
  );

  return (
    <div className="p-6 sm:p-8 space-y-8 animate-in fade-in duration-300">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#E0F7FC] px-3.5 py-1 rounded-full border border-[#00AEEF]/20">
              Section 43–46 · Procurement, Price History &amp; Profit Margins
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Purchases &amp; Supplier Cost Analysis
          </h1>
          <p className="text-xs text-slate-500">
            Record OEM supplier purchase orders, track historical supplier
            purchase price changes, auto-increment location stock, and calculate
            product profit margins.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#00AEEF] hover:bg-[#0096D6] text-white px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4 text-[#FFC20E]" />
          <span>Record Supplier Purchase</span>
        </button>
      </div>

      {/* 2. Procurement Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
            Total Procurement Spend
          </span>
          <div className="text-2xl font-black text-slate-900">
            ₹{totalProcurementSpend.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold">
            {purchases.length} recorded supplier purchase entries
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
            Average Gross Margin
          </span>
          <div className="text-2xl font-black text-emerald-600">30.8%</div>
          <span className="text-[10px] text-slate-500 font-semibold">
            Across microcontrollers, drone parts &amp; STEM kits
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
            Active OEM Suppliers
          </span>
          <div className="text-2xl font-black text-purple-900">14 Verified</div>
          <span className="text-[10px] text-slate-500 font-semibold">
            Direct manufacturers &amp; authorized distributors
          </span>
        </div>
      </div>

      {/* 3. Search & Purchases Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search supplier, product, PO #, SKU..."
              className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00AEEF]"
            />
          </div>
          <span className="text-xs font-bold text-slate-400">
            Showing {filteredPurchases.length} supplier invoices
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                <th className="pb-3 font-black">PO &amp; Supplier</th>
                <th className="pb-3 font-black">Product Details</th>
                <th className="pb-3 font-black">Location Stocked</th>
                <th className="pb-3 font-black text-center">Qty</th>
                <th className="pb-3 font-black text-right">Cost (CP)</th>
                <th className="pb-3 font-black text-right">Selling (SP)</th>
                <th className="pb-3 font-black text-right">
                  Profit &amp; Margin
                </th>
                <th className="pb-3 font-black text-right">Price History</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredPurchases.map((p) => {
                const landedCost = p.costPrice + p.shippingLandedCost;
                const unitProfit = p.sellingPrice - landedCost;
                const margin = ((unitProfit / p.sellingPrice) * 100).toFixed(2);

                return (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* PO & Supplier */}
                    <td className="py-3.5 space-y-0.5">
                      <span className="font-mono font-black text-slate-900 text-xs block">
                        {p.poNumber}
                      </span>
                      <span className="text-[11px] text-slate-700 font-bold block">
                        {p.supplierName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Invoice: {p.invoiceNo} • {p.date}
                      </span>
                    </td>

                    {/* Product */}
                    <td className="py-3.5">
                      <div className="font-extrabold text-slate-900 truncate max-w-xs">
                        {p.productName}
                      </div>
                      <div className="font-mono text-[10px] text-slate-400 font-bold">
                        {p.sku}
                      </div>
                    </td>

                    {/* Target Store Location */}
                    <td className="py-3.5">
                      <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {p.locationStore}
                      </span>
                    </td>

                    {/* Qty */}
                    <td className="py-3.5 text-center font-black text-slate-900">
                      {p.quantity} Units
                    </td>

                    {/* Cost Price */}
                    <td className="py-3.5 text-right font-mono text-slate-700">
                      <div className="font-bold">₹{p.costPrice}</div>
                      <span className="text-[9px] text-slate-400 block">
                        +₹{p.shippingLandedCost} freight
                      </span>
                    </td>

                    {/* Selling Price */}
                    <td className="py-3.5 text-right font-mono font-bold text-slate-900">
                      ₹{p.sellingPrice}
                    </td>

                    {/* Section 46: Profit & Margin Analysis */}
                    <td className="py-3.5 text-right font-mono">
                      <div className="font-black text-emerald-600">
                        +₹{unitProfit.toLocaleString()}
                      </div>
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded inline-block mt-0.5">
                        {margin}% Margin
                      </span>
                    </td>

                    {/* Section 45: View Price History Trigger */}
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => setSelectedSkuForHistory(p.sku)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-[#00AEEF] hover:text-white rounded-xl font-bold text-[11px] transition-all inline-flex items-center gap-1 cursor-pointer"
                        title="View Historical Supplier Price Fluctuations"
                      >
                        <History className="w-3.5 h-3.5" />
                        <span>History</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Section 45 Purchase Price History Modal */}
      {selectedSkuForHistory && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedSkuForHistory(null)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
          />
          <div className="relative max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-4 text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF]">
                  Section 45 · Supplier Price Tracking
                </span>
                <h3 className="text-base font-black text-slate-900 uppercase">
                  Purchase Price History: {selectedSkuForHistory}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSkuForHistory(null)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1 text-base"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Tracks OEM supplier price inflation and component acquisition
              costs over time.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-black">
                  <tr>
                    <th className="p-3">Purchase Date</th>
                    <th className="p-3">Batch Qty</th>
                    <th className="p-3 text-right">Unit Price</th>
                    <th className="p-3">Supplier Name</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {(
                    priceLedger[selectedSkuForHistory] || [
                      {
                        date: "01-Jan-26",
                        qty: 100,
                        price: 280,
                        supplier: "OEM Direct",
                      },
                      {
                        date: "15-Mar-26",
                        qty: 50,
                        price: 295,
                        supplier: "Global Distributor",
                      },
                      {
                        date: "20-Jun-26",
                        qty: 100,
                        price: 310,
                        supplier: "Regional Importer",
                      },
                      {
                        date: "11-Aug-26",
                        qty: 50,
                        price: 320,
                        supplier: "Authorized Dealer",
                      },
                    ]
                  ).map((rec, i) => (
                    <tr key={i} className="hover:bg-white transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-900">
                        {rec.date}
                      </td>
                      <td className="p-3 font-bold text-slate-700">
                        {rec.qty} units
                      </td>
                      <td className="p-3 text-right font-mono font-black text-slate-900">
                        ₹{rec.price}
                      </td>
                      <td className="p-3 text-slate-600 text-[11px]">
                        {rec.supplier}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-900">
                Current Cost vs. Selling Price Margin:
              </span>
              <span className="font-black text-emerald-700 font-mono">
                28.89% Profit
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedSkuForHistory(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold uppercase tracking-wider text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Create Purchase Entry Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            onClick={() => setShowCreateModal(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
          />
          <div className="relative max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-4 text-xs animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 uppercase">
                Record Supplier Purchase Entry
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePurchase} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Supplier Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    placeholder="e.g. Arduino Tech Global Ltd."
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Supplier GSTIN
                  </label>
                  <input
                    type="text"
                    value={supplierGstin}
                    onChange={(e) => setSupplierGstin(e.target.value)}
                    placeholder="27AABCU9603R1ZM"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Invoice Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={invoiceNo}
                    onChange={(e) => setInvoiceNo(e.target.value)}
                    placeholder="INV-ARD-9941"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Store Receiving Stock *
                  </label>
                  <select
                    value={targetStore}
                    onChange={(e) => setTargetStore(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900"
                  >
                    <option value="Ranchi Central Hub">
                      Ranchi Central Hub
                    </option>
                    <option value="Patna Branch Store">
                      Patna Branch Store
                    </option>
                    <option value="Delhi NCR Hub">Delhi NCR Hub</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Select Hardware Product *
                </label>
                <select
                  value={selectedSku}
                  onChange={(e) => setSelectedSku(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900"
                >
                  {PRODUCTS.map((p) => (
                    <option key={p.sku} value={p.sku}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Cost Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Section 46 Real-Time Margin Preview */}
              {(() => {
                const cp = parseFloat(costPrice) || 0;
                const sp = parseFloat(sellingPrice) || 0;
                const profit = sp - cp;
                const margin = sp > 0 ? ((profit / sp) * 100).toFixed(1) : "0";

                return (
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Section 46 Profit Preview
                      </span>
                      <span className="font-bold text-slate-900">
                        Unit Profit: ₹{profit}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Gross Margin
                      </span>
                      <span className="font-black text-emerald-600 text-sm">
                        {margin}%
                      </span>
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 font-bold text-slate-500 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#00AEEF] hover:bg-[#0096D6] text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-wider shadow-md"
                >
                  Save Entry &amp; Increment Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
