'use client';

import React, { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Percent, 
  ShieldCheck, 
  Filter, 
  Lock, 
  Layers, 
  Users, 
  ShoppingBag, 
  Calendar, 
  Building2,
  FileSpreadsheet,
  Download,
  Printer,
  ChevronDown,
  ArrowUpRight,
  PieChart
} from 'lucide-react';

interface OrderProfitRecord {
  id: string;
  orderNumber: string;
  customerName: string;
  customerType: 'B2B' | 'B2C' | 'Walk-in' | 'Online';
  storeLocation: string;
  salesExecutive: string;
  date: string;
  sellingPrice: number;
  purchaseCost: number;
  shippingCost: number;
  additionalCharges: number;
  grossProfit: number;
  netProfit: number;
  profitMarginPct: number;
}

export interface ProfitSharingRule {
  role: string;
  percentage: number;
  applicableScope: string;
}

const MOCK_PROFIT_ORDERS: OrderProfitRecord[] = [
  {
    id: 'ord-p1',
    orderNumber: 'ORD-1054',
    customerName: 'BIT Mesra Robotics Lab',
    customerType: 'B2B',
    storeLocation: 'Ranchi Main Hub',
    salesExecutive: 'Abhishek Kumar',
    date: '28 Aug 2026',
    sellingPrice: 52000,
    purchaseCost: 35000,
    shippingCost: 800,
    additionalCharges: 500,
    grossProfit: 17000,
    netProfit: 15700,
    profitMarginPct: 30.19,
  },
  {
    id: 'ord-p2',
    orderNumber: 'ORD-1055',
    customerName: 'Rahul Sharma',
    customerType: 'Online',
    storeLocation: 'Ranchi Main Hub',
    salesExecutive: 'Direct Website',
    date: '28 Aug 2026',
    sellingPrice: 10000,
    purchaseCost: 7000,
    shippingCost: 500,
    additionalCharges: 0,
    grossProfit: 3000,
    netProfit: 2500,
    profitMarginPct: 25.00,
  },
  {
    id: 'ord-p3',
    orderNumber: 'ORD-1056',
    customerName: 'Priya Verma',
    customerType: 'Walk-in',
    storeLocation: 'Ranchi Main Store',
    salesExecutive: 'Emraan Hassan',
    date: '27 Aug 2026',
    sellingPrice: 1899,
    purchaseCost: 1250,
    shippingCost: 0,
    additionalCharges: 50,
    grossProfit: 649,
    netProfit: 599,
    profitMarginPct: 31.54,
  },
  {
    id: 'ord-p4',
    orderNumber: 'ORD-1057',
    customerName: 'Patna Science College Lab',
    customerType: 'B2B',
    storeLocation: 'Patna Branch',
    salesExecutive: 'Jay Prakash',
    date: '26 Aug 2026',
    sellingPrice: 38500,
    purchaseCost: 26000,
    shippingCost: 600,
    additionalCharges: 400,
    grossProfit: 12500,
    netProfit: 11500,
    profitMarginPct: 29.87,
  },
  {
    id: 'ord-p5',
    orderNumber: 'ORD-1058',
    customerName: 'Delhi Tech Academy',
    customerType: 'B2B',
    storeLocation: 'Delhi NCR Hub',
    salesExecutive: 'Shahnawaz Abbas',
    date: '25 Aug 2026',
    sellingPrice: 85000,
    purchaseCost: 58000,
    shippingCost: 1200,
    additionalCharges: 800,
    grossProfit: 27000,
    netProfit: 25000,
    profitMarginPct: 29.41,
  },
];

export default function AdminProfitPage() {
  const [profitOrders, setProfitOrders] = useState<OrderProfitRecord[]>(MOCK_PROFIT_ORDERS);
  const [filterStore, setFilterStore] = useState('All');
  const [filterChannel, setFilterChannel] = useState('All');
  const [filterExecutive, setFilterExecutive] = useState('All');
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Section 72 Profit Sharing Rules
  const [profitRules, setProfitRules] = useState<ProfitSharingRule[]>([
    { role: 'Intern / Trainee', percentage: 5, applicableScope: '5% of Net Order Profit' },
    { role: 'Sales Executive', percentage: 7, applicableScope: '7% of Net Order Profit' },
    { role: 'Store Manager', percentage: 2, applicableScope: '2% of Total Store Net Profit' },
  ]);

  const filteredOrders = profitOrders.filter(ord => {
    const matchesStore = filterStore === 'All' || ord.storeLocation.includes(filterStore);
    const matchesChannel = filterChannel === 'All' || ord.customerType === filterChannel;
    const matchesExec = filterExecutive === 'All' || ord.salesExecutive === filterExecutive;
    return matchesStore && matchesChannel && matchesExec;
  });

  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.sellingPrice, 0);
  const totalPurchaseCost = filteredOrders.reduce((sum, o) => sum + o.purchaseCost, 0);
  const totalShippingCost = filteredOrders.reduce((sum, o) => sum + o.shippingCost, 0);
  const totalNetProfit = filteredOrders.reduce((sum, o) => sum + o.netProfit, 0);
  const averageMargin = totalRevenue > 0 ? ((totalNetProfit / totalRevenue) * 100).toFixed(1) : '0';

  return (
    <div className="p-6 sm:p-8 space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Header (Permission Protected) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#E0F7FC] px-3.5 py-1 rounded-full border border-[#00AEEF]/20 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Section 69–72 · Permission-Restricted Profit Dashboard
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Order Profit &amp; Role-Based Margin Analysis
          </h1>
          <p className="text-xs text-slate-500">
            Visible only to Super Admin &amp; Store Managers. Net Profit = Selling Price − Purchase Cost − Shipping − Additional Charges.
          </p>
        </div>

        <button
          onClick={() => setShowConfigModal(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer transition-all"
        >
          <Percent className="w-4 h-4 text-[#FFC20E]" />
          <span>Configure Profit Sharing (%)</span>
        </button>
      </div>

      {/* 2. Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase text-slate-400">Total Billed Revenue</span>
          <div className="text-2xl font-black text-slate-900">₹{totalRevenue.toLocaleString()}</div>
          <span className="text-[10px] text-slate-400 font-bold">Across {filteredOrders.length} orders</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase text-slate-400">Total Purchase Cost</span>
          <div className="text-2xl font-black text-slate-700">₹{totalPurchaseCost.toLocaleString()}</div>
          <span className="text-[10px] text-slate-400 font-bold">+ ₹{totalShippingCost.toLocaleString()} freight expenses</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase text-slate-400">Total Net Profit</span>
          <div className="text-2xl font-black text-emerald-600">₹{totalNetProfit.toLocaleString()}</div>
          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded inline-block">
            Net Margin: {averageMargin}%
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase text-slate-400">Top Sales Earner</span>
          <div className="text-lg font-black text-purple-950">Shahnawaz Abbas</div>
          <span className="text-[10px] text-purple-700 font-bold">₹25,000 Profit Generated (7% Pool)</span>
        </div>
      </div>

      {/* 3. Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-500">Store:</span>
            <select
              value={filterStore}
              onChange={(e) => setFilterStore(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-900 focus:outline-none"
            >
              <option value="All">All Locations</option>
              <option value="Ranchi">Ranchi Main Hub</option>
              <option value="Patna">Patna Branch</option>
              <option value="Delhi">Delhi NCR Hub</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-500">Channel:</span>
            <select
              value={filterChannel}
              onChange={(e) => setFilterChannel(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-900 focus:outline-none"
            >
              <option value="All">All Channels</option>
              <option value="B2B">B2B Institutional</option>
              <option value="Online">Online Website</option>
              <option value="Walk-in">In-Store Walk-in</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-500">Executive:</span>
            <select
              value={filterExecutive}
              onChange={(e) => setFilterExecutive(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-900 focus:outline-none"
            >
              <option value="All">All Sales Executives</option>
              <option value="Abhishek Kumar">Abhishek Kumar</option>
              <option value="Shahnawaz Abbas">Shahnawaz Abbas</option>
              <option value="Emraan Hassan">Emraan Hassan</option>
              <option value="Jay Prakash">Jay Prakash</option>
            </select>
          </div>
        </div>

        <span className="font-bold text-slate-400">
          Showing {filteredOrders.length} audited orders
        </span>
      </div>

      {/* 4. Order Profit Breakdown Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                <th className="pb-3 font-black">Order &amp; Customer</th>
                <th className="pb-3 font-black">Channel &amp; Store</th>
                <th className="pb-3 font-black">Executive</th>
                <th className="pb-3 font-black text-right">Selling Price</th>
                <th className="pb-3 font-black text-right">Purchase Cost</th>
                <th className="pb-3 font-black text-right">Freight &amp; Exp</th>
                <th className="pb-3 font-black text-right">Net Profit</th>
                <th className="pb-3 font-black text-right">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5">
                    <div className="font-mono font-black text-slate-900">{ord.orderNumber}</div>
                    <div className="font-bold text-slate-700">{ord.customerName}</div>
                  </td>

                  <td className="py-3.5">
                    <span className="font-bold text-slate-800 block">{ord.storeLocation}</span>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-black uppercase text-slate-600">
                      {ord.customerType}
                    </span>
                  </td>

                  <td className="py-3.5 font-bold text-purple-900">
                    {ord.salesExecutive}
                  </td>

                  <td className="py-3.5 text-right font-black text-slate-900">
                    ₹{ord.sellingPrice.toLocaleString()}
                  </td>

                  <td className="py-3.5 text-right font-mono text-slate-500">
                    ₹{ord.purchaseCost.toLocaleString()}
                  </td>

                  <td className="py-3.5 text-right font-mono text-slate-400 text-[11px]">
                    ₹{(ord.shippingCost + ord.additionalCharges).toLocaleString()}
                  </td>

                  <td className="py-3.5 text-right font-mono font-black text-emerald-600 text-sm">
                    +₹{ord.netProfit.toLocaleString()}
                  </td>

                  <td className="py-3.5 text-right">
                    <span className="font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px]">
                      {ord.profitMarginPct}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Section 72 Role-Based Profit Sharing Settings Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div onClick={() => setShowConfigModal(false)} className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs animate-in fade-in" />
          <div className="relative max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-4 text-xs animate-in zoom-in-95">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF]">
                  Section 72 Configuration
                </span>
                <h3 className="text-base font-black text-slate-900 uppercase">
                  Role-Based Profit-Sharing Settings
                </h3>
              </div>
              <button onClick={() => setShowConfigModal(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <p className="text-slate-500">
              Define commission % calculated directly from eligible Net Order Profits ($Selling - Purchase - Shipping - Overhead$).
            </p>

            <div className="space-y-3">
              {profitRules.map((rule, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex items-center justify-between gap-3">
                  <div>
                    <span className="font-extrabold text-slate-900 block">{rule.role}</span>
                    <span className="text-[10px] text-slate-400">{rule.applicableScope}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={rule.percentage}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setProfitRules(prev => prev.map((r, i) => i === idx ? { ...r, percentage: val, applicableScope: `${val}% of Net Profit` } : r));
                      }}
                      className="w-16 bg-white border border-slate-200 rounded-xl p-1.5 font-black text-center text-slate-900"
                    />
                    <span className="font-bold text-slate-500">%</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-purple-50 border border-purple-200 p-3 rounded-2xl text-[11px] text-purple-900 font-medium">
              🔒 Immutable Audit Rule: Historical reports retain the calculation rate active at the time the order was closed.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 font-bold text-slate-500"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfigModal(false);
                  alert('Profit sharing rules updated & saved to system policy.');
                }}
                className="bg-[#00AEEF] hover:bg-[#0096D6] text-white px-5 py-2 rounded-xl font-black uppercase shadow-md"
              >
                Save Profit Rules
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
