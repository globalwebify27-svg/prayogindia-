'use client';

import React, { useState } from 'react';
import { 
  INITIAL_PROMO_COUPONS, 
  PromoCoupon, 
  CustomerTypeScope, 
  DiscountType 
} from '@/data/promoData';
import { 
  Tag, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Calendar, 
  Users, 
  Search,
  Filter,
  DollarSign,
  Percent,
  X,
  Store,
  Layers,
  Award
} from 'lucide-react';

export default function AdminOffersPage() {
  const [coupons, setCoupons] = useState<PromoCoupon[]>(INITIAL_PROMO_COUPONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterScope, setFilterScope] = useState<string>('All');

  // Modal State for New / Edit Coupon
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<PromoCoupon, 'id' | 'usageCount'>>({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 1000,
    maxDiscountAmount: 1000,
    customerTypeScope: 'All',
    applicableCategory: 'All',
    usageLimitGlobal: 500,
    usageLimitPerUser: 1,
    restrictedUserEmails: [],
    expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isActive: true,
  });

  const [restrictedEmailInput, setRestrictedEmailInput] = useState('');

  const openNewModal = () => {
    setEditingId(null);
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: 10,
      minOrderValue: 1000,
      maxDiscountAmount: 1000,
      customerTypeScope: 'All',
      applicableCategory: 'All',
      usageLimitGlobal: 500,
      usageLimitPerUser: 1,
      restrictedUserEmails: [],
      expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isActive: true,
    });
    setRestrictedEmailInput('');
    setShowModal(true);
  };

  const openEditModal = (coupon: PromoCoupon) => {
    setEditingId(coupon.id);
    setFormData({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderValue: coupon.minOrderValue,
      maxDiscountAmount: coupon.maxDiscountAmount,
      customerTypeScope: coupon.customerTypeScope,
      applicableCategory: coupon.applicableCategory || 'All',
      usageLimitGlobal: coupon.usageLimitGlobal,
      usageLimitPerUser: coupon.usageLimitPerUser,
      restrictedUserEmails: coupon.restrictedUserEmails || [],
      expiryDate: coupon.expiryDate,
      isActive: coupon.isActive,
    });
    setRestrictedEmailInput(coupon.restrictedUserEmails ? coupon.restrictedUserEmails.join(', ') : '');
    setShowModal(true);
  };

  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) return;

    const emailsArray = restrictedEmailInput
      .split(',')
      .map(e => e.trim())
      .filter(Boolean);

    if (editingId) {
      setCoupons(prev => prev.map(c => c.id === editingId ? {
        ...c,
        ...formData,
        code: formData.code.toUpperCase().trim(),
        restrictedUserEmails: emailsArray,
      } : c));
    } else {
      const newCoupon: PromoCoupon = {
        ...formData,
        id: `coup-${Date.now()}`,
        code: formData.code.toUpperCase().trim(),
        usageCount: 0,
        restrictedUserEmails: emailsArray,
      };
      setCoupons([newCoupon, ...coupons]);
    }
    setShowModal(false);
  };

  const handleDeleteCoupon = (id: string) => {
    if (confirm('Are you sure you want to delete this promotional coupon?')) {
      setCoupons(prev => prev.filter(c => c.id !== id));
    }
  };

  const toggleCouponStatus = (id: string) => {
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
  };

  const filteredCoupons = coupons.filter(c => {
    const matchesSearch = c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesScope = filterScope === 'All' || c.customerTypeScope === filterScope;
    return matchesSearch && matchesScope;
  });

  const getScopeBadge = (scope: CustomerTypeScope) => {
    switch (scope) {
      case 'B2B-only':
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-purple-200">B2B Institutional Only</span>;
      case 'B2C-only':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-blue-200">B2C Retail Only</span>;
      case 'Walk-in-only':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-amber-200">Walk-in POS Only</span>;
      case 'Registered-customer':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-200">Registered Members</span>;
      case 'New-customer':
        return <span className="bg-pink-100 text-pink-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-pink-200">1st Order Welcome</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-slate-200">Universal Access</span>;
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#E0F7FC] px-3.5 py-1 rounded-full border border-[#00AEEF]/20">
              Section 23 · Customer-Type Promo Codes Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Promotional Coupons &amp; Discount Rules
          </h1>
          <p className="text-xs text-slate-500">
            Define customer-type targeted coupons (B2B, B2C, Walk-in POS, New Users), usage limits, minimum order rules, and category filters.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="bg-[#00AEEF] hover:bg-[#0096D6] text-white px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4 text-[#FFC20E]" />
          <span>Create New Promo Coupon</span>
        </button>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search coupon code or description..."
            className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00AEEF]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto text-xs font-bold">
          <span className="text-slate-400 text-[11px] font-bold uppercase shrink-0">Filter Scope:</span>
          {['All', 'B2B-only', 'B2C-only', 'Walk-in-only', 'Registered-customer', 'New-customer'].map((scope) => (
            <button
              key={scope}
              onClick={() => setFilterScope(scope)}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                filterScope === scope
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {scope}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Promo Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCoupons.map((coupon) => (
          <div
            key={coupon.id}
            className={`bg-white border rounded-3xl p-6 shadow-2xs space-y-4 relative transition-all ${
              coupon.isActive ? 'border-slate-200' : 'border-red-200 opacity-60 bg-slate-50/50'
            }`}
          >
            {/* Header: Code & Scope */}
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-black text-slate-900 tracking-wider bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200">
                    {coupon.code}
                  </span>
                  <button
                    onClick={() => toggleCouponStatus(coupon.id)}
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                      coupon.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {coupon.isActive ? 'Active' : 'Disabled'}
                  </button>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1.5">{coupon.description}</p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(coupon)}
                  className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-colors"
                  title="Edit Coupon"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteCoupon(coupon.id)}
                  className="p-1.5 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-600 transition-colors"
                  title="Delete Coupon"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scope Badge */}
            <div>{getScopeBadge(coupon.customerTypeScope)}</div>

            {/* Discount Value Highlight */}
            <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Discount Offering</span>
                <div className="text-lg font-black text-slate-900">
                  {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} FLAT OFF`}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Max Discount Cap</span>
                <div className="text-sm font-extrabold text-emerald-600">₹{coupon.maxDiscountAmount.toLocaleString()}</div>
              </div>
            </div>

            {/* Rules Matrix */}
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold">Min Order Value:</span>
                <span className="font-extrabold text-slate-900">₹{coupon.minOrderValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold">Category Scope:</span>
                <span className="font-extrabold text-slate-900">{coupon.applicableCategory || 'All'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold">Usage Progress:</span>
                <span className="font-extrabold text-slate-900">
                  {coupon.usageCount} / {coupon.usageLimitGlobal} ({coupon.usageLimitPerUser}/user)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold">Expiry Date:</span>
                <span className="font-extrabold text-slate-900">{coupon.expiryDate}</span>
              </div>
              {coupon.restrictedUserEmails && coupon.restrictedUserEmails.length > 0 && (
                <div className="pt-1 text-[10px] text-purple-700 font-bold">
                  Restricted to {coupon.restrictedUserEmails.length} specific email whitelist.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 4. Create / Edit Coupon Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div onClick={() => setShowModal(false)} className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs" />
          <div className="relative max-w-xl w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF]">
                  Section 23 Configurator
                </span>
                <h3 className="text-base font-black text-slate-900 uppercase">
                  {editingId ? 'Edit Promo Coupon' : 'Create Promotional Coupon'}
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-4">
              
              {/* Row 1: Code & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. B2BINSTITUTE20"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-mono font-black text-slate-900 uppercase focus:outline-none focus:border-[#00AEEF]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Description *</label>
                  <input
                    type="text"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g. 20% Off for Verified Labs"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 2: Customer Type Scope & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Customer Type Scope *</label>
                  <select
                    value={formData.customerTypeScope}
                    onChange={(e) => setFormData({ ...formData, customerTypeScope: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900 focus:outline-none"
                  >
                    <option value="All">All Customer Types (Universal)</option>
                    <option value="B2B-only">B2B-only (Institutions & Labs)</option>
                    <option value="B2C-only">B2C-only (Retail Shoppers)</option>
                    <option value="Walk-in-only">Walk-in-only (POS In-Store)</option>
                    <option value="Registered-customer">Registered-customer (Must be logged in)</option>
                    <option value="New-customer">New-customer (1st order only)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Applicable Category</label>
                  <select
                    value={formData.applicableCategory}
                    onChange={(e) => setFormData({ ...formData, applicableCategory: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900 focus:outline-none"
                  >
                    <option value="All">All Product Categories</option>
                    <option value="Microcontroller Boards">Microcontroller Boards</option>
                    <option value="Sensors & Modules">Sensors &amp; Modules</option>
                    <option value="Robotics & Drone Hardware">Robotics &amp; Drone Hardware</option>
                    <option value="Power, Batteries & Chargers">Power, Batteries &amp; Chargers</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Discount Type & Value */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900 focus:outline-none"
                  >
                    <option value="percentage">Percentage (% Off)</option>
                    <option value="flat">Flat Value (₹ Off)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {formData.discountType === 'percentage' ? 'Percentage Value (%)' : 'Flat Rupee Amount (₹)'}
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 4: Minimum Order & Usage Limits */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Min Order Value (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Global Usage Limit</label>
                  <input
                    type="number"
                    required
                    value={formData.usageLimitGlobal}
                    onChange={(e) => setFormData({ ...formData, usageLimitGlobal: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Usage Limit / User</label>
                  <input
                    type="number"
                    required
                    value={formData.usageLimitPerUser}
                    onChange={(e) => setFormData({ ...formData, usageLimitPerUser: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 5: Expiry & Whitelist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">User-Specific Restriction (Comma Separated)</label>
                  <input
                    type="text"
                    value={restrictedEmailInput}
                    onChange={(e) => setRestrictedEmailInput(e.target.value)}
                    placeholder="user1@lab.in, dean@mit.edu"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 font-bold text-slate-500 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#00AEEF] hover:bg-[#0096D6] text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-wider shadow-md"
                >
                  {editingId ? 'Update Coupon' : 'Publish Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
