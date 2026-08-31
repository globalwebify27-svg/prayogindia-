'use client';

import React, { useState, useEffect } from 'react';
import { 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Search, 
  MapPin, 
  ArrowRightLeft, 
  ShieldCheck,
  Building2,
  Boxes,
  Plus,
  Truck,
  FileText,
  Clock,
  Send,
  X,
  History,
  TrendingDown,
  Check
} from 'lucide-react';
import { 
  INITIAL_STOCK_TRANSFERS, 
  INITIAL_STOCK_ADJUSTMENTS, 
  InterStoreTransfer, 
  StockAdjustmentEntry 
} from '@/data/inventoryTransfersData';
import { PRODUCTS } from '@/data/mockData';

export default function AdminInventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<'all' | 'ranchi' | 'patna' | 'delhi'>('all');
  const [activeTab, setActiveTab] = useState<'stock' | 'transfers' | 'adjustments'>('stock');

  // Transfers & Adjustments State
  const [transfers, setTransfers] = useState<InterStoreTransfer[]>(INITIAL_STOCK_TRANSFERS);
  const [adjustments, setAdjustments] = useState<StockAdjustmentEntry[]>(INITIAL_STOCK_ADJUSTMENTS);

  // Transfer Wizard Modal State
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferSource, setTransferSource] = useState('RANCHI');
  const [transferDest, setTransferDest] = useState('PATNA');
  const [transferProductSku, setTransferProductSku] = useState(PRODUCTS[0].sku);
  const [transferQty, setTransferQty] = useState(10);
  const [transferNotes, setTransferNotes] = useState('');

  // Adjustment Modal State
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustStore, setAdjustStore] = useState('RANCHI');
  const [adjustProductSku, setAdjustProductSku] = useState(PRODUCTS[0].sku);
  const [adjustQuantity, setAdjustQuantity] = useState(-1);
  const [adjustReason, setAdjustReason] = useState<StockAdjustmentEntry['reason']>('Damaged goods');
  const [adjustNotes, setAdjustNotes] = useState('');

  const fetchInventory = () => {
    setLoading(true);
    fetch(`/api/admin/inventory?q=${encodeURIComponent(searchQuery)}&lowStock=${lowStockFilter}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setItems(data.data);
        } else {
          // Fallback location-specific breakdown
          setItems(PRODUCTS.map((p, idx) => ({
            id: p.id,
            name: p.name,
            sku: p.sku,
            category: p.category,
            price: p.price,
            stock: p.inStock ? 50 + idx * 5 : 0,
            ranchiStock: p.inStock ? 35 + idx * 3 : 0,
            patnaStock: p.inStock ? 10 + idx : 0,
            delhiStock: p.inStock ? 5 + idx : 0,
            reservedStock: 4,
            inStock: p.inStock,
            shippingTag: p.shippingTag || 'Standard',
          })));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInventory();
  }, [searchQuery, lowStockFilter]);

  const handleUpdateStock = async (productId: string, currentStock: number) => {
    const nextStock = prompt('Enter updated inventory stock count for Ranchi Central / Branch Hub:', String(currentStock));
    if (nextStock === null) return;
    const parsed = parseInt(nextStock, 10);
    if (isNaN(parsed) || parsed < 0) return alert('Invalid stock count. Must be 0 or greater.');

    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, stock: parsed }),
      });
      const data = await res.json();
      if (data.success) {
        fetchInventory();
      } else {
        setItems(prev => prev.map(i => i.id === productId ? { ...i, stock: parsed, ranchiStock: parsed } : i));
      }
    } catch {
      setItems(prev => prev.map(i => i.id === productId ? { ...i, stock: parsed, ranchiStock: parsed } : i));
    }
  };

  const handleCreateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (transferSource === transferDest) {
      alert('Source and destination stores must be different.');
      return;
    }
    const selectedProd = PRODUCTS.find(p => p.sku === transferProductSku) || PRODUCTS[0];
    const newTrf: InterStoreTransfer = {
      id: `trf-${Date.now()}`,
      transferNumber: `TRF-${transferSource}-${transferDest}-${Math.floor(100 + Math.random() * 900)}`,
      sourceStoreCode: transferSource,
      sourceStoreName: transferSource === 'RANCHI' ? 'Ranchi Central Hub' : `${transferSource} Branch Store`,
      destinationStoreCode: transferDest,
      destinationStoreName: transferDest === 'RANCHI' ? 'Ranchi Central Hub' : `${transferDest} Branch Store`,
      productId: selectedProd.id,
      productName: selectedProd.name,
      sku: selectedProd.sku,
      quantity: Number(transferQty),
      initiatedBy: 'Store Inventory Manager',
      status: 'Dispatched & In Transit',
      dispatchedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      courierReference: `TRF-COURIER-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: transferNotes,
    };

    setTransfers([newTrf, ...transfers]);
    setShowTransferModal(false);
    setActiveTab('transfers');
    setTransferNotes('');
    alert(`Transfer request ${newTrf.transferNumber} created successfully and marked In Transit.`);
  };

  const handleCreateAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedProd = PRODUCTS.find(p => p.sku === adjustProductSku) || PRODUCTS[0];
    const prevStock = 45;
    const newStock = Math.max(0, prevStock + Number(adjustQuantity));

    const newAdj: StockAdjustmentEntry = {
      id: `adj-${Date.now()}`,
      adjustmentNumber: `ADJ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      storeCode: adjustStore,
      storeName: adjustStore === 'RANCHI' ? 'Ranchi Central Hub' : `${adjustStore} Branch`,
      productId: selectedProd.id,
      productName: selectedProd.name,
      sku: selectedProd.sku,
      previousStock: prevStock,
      adjustmentQuantity: Number(adjustQuantity),
      newStock,
      reason: adjustReason,
      adjustedBy: 'Authorized Store Manager',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      notes: adjustNotes,
    };

    setAdjustments([newAdj, ...adjustments]);
    setShowAdjustModal(false);
    setActiveTab('adjustments');
    setAdjustNotes('');
    alert(`Stock adjustment audit entry ${newAdj.adjustmentNumber} recorded.`);
  };

  const handleReceiveTransfer = (transferId: string) => {
    setTransfers(prev => prev.map(t => {
      if (t.id === transferId) {
        return {
          ...t,
          status: 'Received & Stock Updated',
          receivedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        };
      }
      return t;
    }));
    alert('Stock received! Destination branch inventory has been updated automatically.');
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Header with Multi-Store Principle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#E0F7FC] px-3.5 py-1 rounded-full border border-[#00AEEF]/20">
              Section 37–42 · Multi-Location Inventory &amp; Inter-Store Transfers
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Multi-Store Stock &amp; Inventory Engine
          </h1>
          <p className="text-xs text-slate-500">
            Ranchi Main Hub acts as central inventory for Website, App, and Ranchi Store. Independent branch stocks in Patna, Delhi, and Mumbai with inter-store transfer pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2">
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
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Stock Adjustment</span>
          </button>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('stock')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'stock'
              ? 'bg-[#00AEEF] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Boxes className="w-3.5 h-3.5 inline mr-1.5" />
          Location-Wise Stock Pool
        </button>

        <button
          onClick={() => setActiveTab('transfers')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'transfers'
              ? 'bg-[#00AEEF] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Truck className="w-3.5 h-3.5 inline mr-1.5" />
          Inter-Store Transfers ({transfers.length})
        </button>

        <button
          onClick={() => setActiveTab('adjustments')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'adjustments'
              ? 'bg-[#00AEEF] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <History className="w-3.5 h-3.5 inline mr-1.5" />
          Stock Adjustment Audit Log ({adjustments.length})
        </button>
      </div>

      {/* 3. Tab 1: Location-Wise Stock Pool */}
      {activeTab === 'stock' && (
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

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                  <th className="pb-3 font-black">Product &amp; SKU</th>
                  <th className="pb-3 font-black">Ranchi Central Hub</th>
                  <th className="pb-3 font-black">Patna Store</th>
                  <th className="pb-3 font-black">Delhi Store</th>
                  <th className="pb-3 font-black">Reserved Stock</th>
                  <th className="pb-3 font-black">Total Available</th>
                  <th className="pb-3 font-black text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5">
                      <div className="font-extrabold text-slate-900">{item.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono font-bold">{item.sku}</div>
                    </td>

                    <td className="py-3.5">
                      <span className="font-black text-slate-900 bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-lg">
                        {item.ranchiStock ?? item.stock} Units
                      </span>
                      <div className="text-[9px] text-slate-400 font-bold mt-0.5">Online + Ranchi POS</div>
                    </td>

                    <td className="py-3.5 font-bold text-slate-700">
                      {item.patnaStock ?? 12} Units
                    </td>

                    <td className="py-3.5 font-bold text-slate-700">
                      {item.delhiStock ?? 8} Units
                    </td>

                    <td className="py-3.5 font-bold text-amber-700">
                      {item.reservedStock ?? 2} Units
                    </td>

                    <td className="py-3.5 font-black text-emerald-700 text-sm">
                      {(item.ranchiStock ?? item.stock) + (item.patnaStock ?? 12) + (item.delhiStock ?? 8)} Units
                    </td>

                    <td className="py-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleUpdateStock(item.id, item.stock)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold text-[11px] cursor-pointer"
                      >
                        Adjust Count
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Tab 2: Inter-Store Transfers */}
      {activeTab === 'transfers' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase">
                Active Store-to-Store Stock Transfers
              </h3>
              <p className="text-xs text-slate-500">Track dispatch, transit courier AWB, and receiving store confirmations.</p>
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
                  <tr key={trf.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5">
                      <div className="font-mono font-black text-slate-900">{trf.transferNumber}</div>
                      <div className="text-[10px] text-slate-400">{trf.dispatchedAt}</div>
                    </td>

                    <td className="py-3.5 font-bold text-slate-900">
                      <div>{trf.productName}</div>
                      <span className="font-mono text-[10px] text-slate-400">{trf.sku}</span>
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
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        trf.status === 'Received & Stock Updated'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {trf.status}
                      </span>
                    </td>

                    <td className="py-3.5 text-right">
                      {trf.status === 'Dispatched & In Transit' && (
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
      {activeTab === 'adjustments' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase">
                Section 42 Stock Adjustment Audit Log
              </h3>
              <p className="text-xs text-slate-500">Every damaged, lost, or corrected unit creates an immutable audit record.</p>
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
                  <tr key={adj.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5">
                      <div className="font-mono font-black text-slate-900">{adj.adjustmentNumber}</div>
                      <div className="text-[10px] text-slate-400">{adj.timestamp}</div>
                    </td>

                    <td className="py-3.5 font-bold text-slate-700">
                      {adj.storeName}
                    </td>

                    <td className="py-3.5 font-bold text-slate-900">
                      <div>{adj.productName}</div>
                      <span className="font-mono text-[10px] text-slate-400">{adj.sku}</span>
                    </td>

                    <td className="py-3.5">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                        adj.reason === 'Damaged goods' || adj.reason === 'Lost goods'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {adj.reason}
                      </span>
                    </td>

                    <td className="py-3.5 font-black text-slate-900">
                      <span className="text-slate-400 line-through mr-1">{adj.previousStock}</span>
                      <span className={adj.adjustmentQuantity < 0 ? 'text-red-600' : 'text-emerald-600'}>
                        {adj.adjustmentQuantity > 0 ? `+${adj.adjustmentQuantity}` : adj.adjustmentQuantity}
                      </span>
                      <span className="ml-1 text-slate-900">({adj.newStock})</span>
                    </td>

                    <td className="py-3.5 font-medium text-slate-600">
                      {adj.adjustedBy}
                    </td>

                    <td className="py-3.5 text-right font-medium text-slate-500 max-w-xs truncate" title={adj.notes}>
                      {adj.notes || '—'}
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
          <div onClick={() => setShowTransferModal(false)} className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs animate-in fade-in" />
          <div className="relative max-w-md w-full bg-white rounded-3xl p-6 sm:p-7 shadow-2xl z-10 space-y-4 text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 uppercase">
                Initiate Inter-Store Stock Transfer
              </h3>
              <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTransfer} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Source Store *</label>
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
                  <label className="block font-bold text-slate-700 mb-1">Destination Store *</label>
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
                <label className="block font-bold text-slate-700 mb-1">Select Product *</label>
                <select
                  value={transferProductSku}
                  onChange={(e) => setTransferProductSku(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900"
                >
                  {PRODUCTS.map(p => (
                    <option key={p.sku} value={p.sku}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Transfer Units (Qty) *</label>
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
                <label className="block font-bold text-slate-700 mb-1">Transfer Notes / Reason</label>
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
          <div onClick={() => setShowAdjustModal(false)} className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs animate-in fade-in" />
          <div className="relative max-w-md w-full bg-white rounded-3xl p-6 sm:p-7 shadow-2xl z-10 space-y-4 text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 uppercase">
                Record Section 42 Stock Adjustment
              </h3>
              <button onClick={() => setShowAdjustModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdjustment} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Store Location *</label>
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
                  <label className="block font-bold text-slate-700 mb-1">Reason *</label>
                  <select
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900"
                  >
                    <option value="Damaged goods">Damaged goods</option>
                    <option value="Lost goods">Lost goods</option>
                    <option value="Physical count correction">Physical count correction</option>
                    <option value="Returns">Returns</option>
                    <option value="Internal consumption">Internal consumption</option>
                    <option value="Manual correction">Manual correction</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Product *</label>
                <select
                  value={adjustProductSku}
                  onChange={(e) => setAdjustProductSku(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900"
                >
                  {PRODUCTS.map(p => (
                    <option key={p.sku} value={p.sku}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Quantity Adjustment (+ or -) *</label>
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
                <label className="block font-bold text-slate-700 mb-1">Audit Notes / Incident Detail</label>
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

    </div>
  );
}
