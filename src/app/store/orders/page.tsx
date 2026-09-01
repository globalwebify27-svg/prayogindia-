'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Printer,
  Send,
  Mail,
  Download,
  FileText,
  X,
  Sparkles
} from 'lucide-react';

export default function StoreOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [storeCode, setStoreCode] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/store/orders')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrders(data.data.items || []);
          setStoreCode(data.store || 'STORE');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredOrders = orders.filter(o => 
    o.id?.toLowerCase().includes(search.toLowerCase()) ||
    o.customerName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#00AEEF] text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
              {storeCode} Branch
            </span>
            <span className="text-xs text-slate-400 font-semibold">Store Orders Management</span>
          </div>
          <h1 className="text-2xl font-black text-white">Branch Orders & Counter Receipts</h1>
          <p className="text-xs text-slate-400 mt-1">
            Official desk for branch managers to generate, print, and WhatsApp walk-in Tax Invoices.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID or Customer name..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00AEEF]"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Store Code</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Invoice Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-[#00AEEF] border-t-transparent rounded-full animate-spin" />
                      <span>Loading branch orders...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No orders found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-white">
                      {order.id}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-950 text-[#00AEEF] border border-blue-800/50 px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                        {order.storeCode || storeCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {order.user?.name || order.customerName || 'Walk-in Customer'}
                      <div className="text-[10px] text-slate-500 font-mono">{order.user?.phone || order.customerPhone || 'Walk-in'}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-white">
                      ₹{order.totalAmount?.toLocaleString('en-IN') || '2,499'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3" /> {order.status || 'CONFIRMED'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-[11px]">
                      {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedInvoice(order)}
                        className="inline-flex items-center gap-1.5 bg-[#00AEEF] hover:bg-[#0096D6] text-slate-950 text-xs font-black px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-md shadow-[#00AEEF]/20"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Generate Bill</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Store Manager Official Tax Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#00AEEF]" />
                <h2 className="text-base font-black text-white">Branch Manager Tax Invoice Desk</h2>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Tax Invoice Card */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-xs font-mono text-left space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {/* Header */}
              <div className="border-b border-slate-800 pb-3 flex justify-between items-start">
                <div>
                  <div className="text-sm font-black text-white tracking-wide">PRAYOG INDIA</div>
                  <div className="text-[10px] text-slate-400">
                    {selectedInvoice.storeLocation || `${selectedInvoice.storeCode || storeCode} Store Branch`}
                  </div>
                  <div className="text-[10px] text-amber-400 mt-0.5">Order Source: WALK-IN</div>
                </div>
                <div className="text-right text-[10px] text-slate-400">
                  <div>Invoice: <span className="font-bold text-[#00AEEF]">{selectedInvoice.id}</span></div>
                  <div>Date: <span className="text-slate-200">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></div>
                  <div>Staff: <span className="text-white">Store Manager</span></div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="border-b border-slate-800 pb-2 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Customer Name:</span>
                  <span className="font-bold text-white">{selectedInvoice.user?.name || selectedInvoice.customerName || 'Walk-in Customer'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mobile Number:</span>
                  <span className="text-slate-200">{selectedInvoice.user?.phone || selectedInvoice.customerPhone || '9876543210'}</span>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="space-y-1 text-[11px] text-slate-400 border-b border-slate-800 pb-2">
                <div className="flex justify-between">
                  <span>Taxable Subtotal:</span>
                  <span className="font-mono text-slate-200">₹{Math.round((selectedInvoice.totalAmount || 2499) / 1.18).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18% Included):</span>
                  <span className="font-mono text-slate-200">₹{Math.round((selectedInvoice.totalAmount || 2499) - ((selectedInvoice.totalAmount || 2499) / 1.18)).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center pt-1 text-sm font-bold text-white">
                  <span>Total Amount Paid:</span>
                  <span className="text-base font-black text-white font-mono">₹{(selectedInvoice.totalAmount || 2499).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Payment Details */}
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Payment Status:</span>
                <span className="text-emerald-400 font-bold">PAID (CONFIRMED)</span>
              </div>
            </div>

            {/* Manager Actions Bar */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Manager Actions
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold p-2.5 rounded-xl border border-slate-700 flex flex-col items-center gap-1 transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-[#00AEEF]" />
                  <span>Print Bill</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const phone = (selectedInvoice.user?.phone || selectedInvoice.customerPhone || '9876543210').replace(/\D/g, '');
                    const msg = encodeURIComponent(
                      `Hello ${selectedInvoice.user?.name || selectedInvoice.customerName || 'Customer'}! Here is your official Prayog India Tax Invoice #${selectedInvoice.id} for ₹${selectedInvoice.totalAmount || 2499} from ${storeCode} Store. Thank you for shopping with us!`
                    );
                    window.open(`https://wa.me/91${phone}?text=${msg}`, '_blank');
                  }}
                  className="bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60 text-xs font-bold p-2.5 rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const subject = encodeURIComponent(`Prayog India Invoice #${selectedInvoice.id}`);
                    const body = encodeURIComponent(`Dear Customer,\n\nPlease find attached your tax invoice #${selectedInvoice.id} for amount ₹${selectedInvoice.totalAmount || 2499}.\n\nBranch: ${storeCode}\nThank you!`);
                    window.location.href = `mailto:?subject=${subject}&body=${body}`;
                  }}
                  className="bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 border border-blue-800/60 text-xs font-bold p-2.5 rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-[#00AEEF]" />
                  <span>Email</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(selectedInvoice, null, 2))}`;
                    const downloadAnchor = document.createElement('a');
                    downloadAnchor.setAttribute('href', jsonString);
                    downloadAnchor.setAttribute('download', `Invoice_${selectedInvoice.id}.json`);
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    downloadAnchor.remove();
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold p-2.5 rounded-xl border border-slate-700 flex flex-col items-center gap-1 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#FFC20E]" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

