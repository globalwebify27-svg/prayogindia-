'use client';

import React, { useState } from 'react';
import { 
  DEFAULT_REWARD_RULES, 
  INITIAL_POINTS_LEDGER, 
  RewardPointsRule, 
  PointsLedgerEntry 
} from '@/data/rewardsData';
import { 
  Award, 
  Coins, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Calendar, 
  UserCheck, 
  Search,
  Filter,
  RefreshCw,
  X
} from 'lucide-react';

export default function AdminRewardsPage() {
  const [rules, setRules] = useState<RewardPointsRule[]>(DEFAULT_REWARD_RULES);
  const [ledger, setLedger] = useState<PointsLedgerEntry[]>(INITIAL_POINTS_LEDGER);
  const [searchQuery, setSearchQuery] = useState('');

  // Manual Adjustment Modal State
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustEmail, setAdjustEmail] = useState('');
  const [adjustName, setAdjustName] = useState('');
  const [adjustPoints, setAdjustPoints] = useState(100);
  const [adjustType, setAdjustType] = useState<'Earned' | 'Admin Adjustment' | 'Expired'>('Admin Adjustment');
  const [adjustNotes, setAdjustNotes] = useState('');

  // Edit Rule Modal State
  const [editingRule, setEditingRule] = useState<RewardPointsRule | null>(null);

  const handleCreateAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustEmail.trim() || !adjustPoints) return;

    const newEntry: PointsLedgerEntry = {
      id: `adj-${Date.now()}`,
      userEmail: adjustEmail.trim().toLowerCase(),
      userName: adjustName.trim() || 'Prayog Customer',
      type: adjustType,
      points: Number(adjustPoints),
      date: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: adjustNotes.trim() || 'Manual adjustment by authorized Store Administrator.',
    };

    setLedger([newEntry, ...ledger]);
    setShowAdjustModal(false);
    setAdjustEmail('');
    setAdjustName('');
    setAdjustPoints(100);
    setAdjustNotes('');
  };

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;

    setRules(prev => prev.map(r => r.id === editingRule.id ? editingRule : r));
    setEditingRule(null);
  };

  const filteredLedger = ledger.filter(l => 
    l.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.orderNumber && l.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-6 sm:p-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#E0F7FC] px-3.5 py-1 rounded-full border border-[#00AEEF]/20">
              Section 22 · Loyalty &amp; Rewards Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Rewards &amp; Loyalty Configuration
          </h1>
          <p className="text-xs text-slate-500">
            Configure earning multipliers, checkout redemption caps, validity expiry rules, and issue manual customer point adjustments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAdjustModal(true)}
            className="bg-[#00AEEF] hover:bg-[#0096D6] text-white px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4 text-[#FFC20E]" />
            <span>Manual Points Adjustment</span>
          </button>
        </div>
      </div>

      {/* 1. Configurable Redemption & Earning Rules */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-[#00AEEF]" /> Customer-Type Redemption &amp; Earning Rules
          </h2>
          <span className="text-xs text-slate-400 font-bold">{rules.length} Configured Tiers</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4 relative"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">{rule.name}</h3>
                  <span className="text-[10px] bg-[#E0F7FC] text-[#00AEEF] px-2 py-0.5 rounded-full font-bold">
                    {rule.customerType}
                  </span>
                </div>
                <button
                  onClick={() => setEditingRule(rule)}
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-900 transition-colors"
                  title="Edit Rule"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Earning Multiplier:</span>
                  <span className="font-black text-slate-900">{rule.pointsPer100Spent} Coin / ₹100 spent</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Redemption Value:</span>
                  <span className="font-black text-emerald-600">1 Coin = ₹{rule.redemptionRateRupees}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Min. Redeem Points:</span>
                  <span className="font-bold text-slate-900">{rule.minRedemptionPoints} PTS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Max Cart Cap:</span>
                  <span className="font-bold text-slate-900">{rule.maxRedemptionPercentage}% of subtotal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Welcome Bonus:</span>
                  <span className="font-bold text-purple-700">+{rule.registrationBonus} PTS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Expiry Period:</span>
                  <span className="font-bold text-slate-900">{rule.validityDays} Days</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Customer Points Ledger & Audit Trail */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#00AEEF]" /> Global Points Ledger &amp; Adjustments History
            </h2>
            <p className="text-xs text-slate-500">Real-time audit log of customer earnings, checkout redemptions, and manual adjustments.</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user, email, order #..."
              className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-2 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00AEEF]"
            />
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                <th className="pb-3 font-black">Customer</th>
                <th className="pb-3 font-black">Transaction Type</th>
                <th className="pb-3 font-black">Points</th>
                <th className="pb-3 font-black">Date</th>
                <th className="pb-3 font-black">Expiry</th>
                <th className="pb-3 font-black">Details / Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLedger.map((entry) => {
                const isPositive = entry.points > 0;
                return (
                  <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3">
                      <div className="font-extrabold text-slate-900">{entry.userName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{entry.userEmail}</div>
                    </td>
                    <td className="py-3">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        entry.type === 'Earned' || entry.type === 'Registration Bonus'
                          ? 'bg-emerald-100 text-emerald-800'
                          : entry.type === 'Admin Adjustment'
                          ? 'bg-[#E0F7FC] text-[#00AEEF]'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {entry.type}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`font-black text-sm ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                        {isPositive ? `+${entry.points}` : entry.points} PTS
                      </span>
                    </td>
                    <td className="py-3 font-semibold text-slate-600">{entry.date}</td>
                    <td className="py-3 font-semibold text-slate-400">{entry.expiryDate || '—'}</td>
                    <td className="py-3 text-slate-600 max-w-xs truncate">
                      {entry.notes} {entry.orderNumber && <strong className="text-slate-900">({entry.orderNumber})</strong>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Points Adjustment Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div onClick={() => setShowAdjustModal(false)} className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs" />
          <div className="relative max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl z-10 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 uppercase">
                Manual Points Adjustment
              </h3>
              <button onClick={() => setShowAdjustModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdjustment} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer Email Address *</label>
                <input
                  type="email"
                  required
                  value={adjustEmail}
                  onChange={(e) => setAdjustEmail(e.target.value)}
                  placeholder="e.g. customer@college.edu"
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-[#00AEEF]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer Name (Optional)</label>
                <input
                  type="text"
                  value={adjustName}
                  onChange={(e) => setAdjustName(e.target.value)}
                  placeholder="e.g. Prof. Arvind Rao"
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Adjustment Type</label>
                  <select
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900 focus:outline-none"
                  >
                    <option value="Admin Adjustment">Admin Grant (+)</option>
                    <option value="Earned">Manual Earn (+)</option>
                    <option value="Expired">Deduct / Expire (-)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Points Quantity</label>
                  <input
                    type="number"
                    required
                    value={adjustPoints}
                    onChange={(e) => setAdjustPoints(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Administrative Reason / Notes *</label>
                <textarea
                  required
                  rows={2}
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  placeholder="Reason for grant (e.g. hackathon sponsorship reward, goodwill voucher)..."
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium text-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 font-bold text-slate-500 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#00AEEF] hover:bg-[#0096D6] text-white px-5 py-2.5 rounded-xl font-black uppercase tracking-wider shadow-md"
                >
                  Apply Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Rule Modal */}
      {editingRule && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div onClick={() => setEditingRule(null)} className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs" />
          <div className="relative max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl z-10 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 uppercase">
                Edit {editingRule.name}
              </h3>
              <button onClick={() => setEditingRule(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Points per ₹100 Spent</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editingRule.pointsPer100Spent}
                    onChange={(e) => setEditingRule({ ...editingRule, pointsPer100Spent: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Redemption Value (₹/pt)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingRule.redemptionRateRupees}
                    onChange={(e) => setEditingRule({ ...editingRule, redemptionRateRupees: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Min. Redeem Points</label>
                  <input
                    type="number"
                    value={editingRule.minRedemptionPoints}
                    onChange={(e) => setEditingRule({ ...editingRule, minRedemptionPoints: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Cart % Cap</label>
                  <input
                    type="number"
                    value={editingRule.maxRedemptionPercentage}
                    onChange={(e) => setEditingRule({ ...editingRule, maxRedemptionPercentage: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Registration Bonus</label>
                  <input
                    type="number"
                    value={editingRule.registrationBonus}
                    onChange={(e) => setEditingRule({ ...editingRule, registrationBonus: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expiry (Days)</label>
                  <input
                    type="number"
                    value={editingRule.validityDays}
                    onChange={(e) => setEditingRule({ ...editingRule, validityDays: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRule(null)}
                  className="px-4 py-2 font-bold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#00AEEF] text-white px-5 py-2 rounded-xl font-black uppercase"
                >
                  Save Tier Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
