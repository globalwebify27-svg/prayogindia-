'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  Tablet, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Boxes, 
  Sparkles, 
  KeyRound, 
  Lock, 
  X,
  ExternalLink,
  Smartphone,
  Check,
  AlertTriangle
} from 'lucide-react';
import { INITIAL_STORES, PhysicalStoreBranch, StoreDevice } from '@/data/storesData';

export default function AdminStoresPage() {
  const [stores, setStores] = useState<PhysicalStoreBranch[]>(INITIAL_STORES);
  const [selectedStore, setSelectedStore] = useState<PhysicalStoreBranch | null>(null);
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);
  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
  const [activeStoreForDevice, setActiveStoreForDevice] = useState<PhysicalStoreBranch | null>(null);

  // New Store Form State
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreCode, setNewStoreCode] = useState('');
  const [newStoreAddress, setNewStoreAddress] = useState('');
  const [newStoreCity, setNewStoreCity] = useState('');
  const [newStoreState, setNewStoreState] = useState('');
  const [newStorePincode, setNewStorePincode] = useState('');
  const [newStorePhone, setNewStorePhone] = useState('');
  const [newStoreEmail, setNewStoreEmail] = useState('');
  const [newStoreManager, setNewStoreManager] = useState('');

  // New Device Form State
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceModel, setNewDeviceModel] = useState('Apple iPad 10th Gen');
  const [newDeviceStaff, setNewDeviceStaff] = useState('');

  const handleCreateStore = (e: React.FormEvent) => {
    e.preventDefault();
    const store: PhysicalStoreBranch = {
      id: `str-${Date.now()}`,
      code: newStoreCode.toUpperCase().trim(),
      name: newStoreName.trim(),
      type: 'Physical Branch Store',
      isCentralHub: false,
      address: newStoreAddress.trim(),
      city: newStoreCity.trim(),
      state: newStoreState.trim(),
      pincode: newStorePincode.trim(),
      contactPhone: newStorePhone.trim(),
      contactEmail: newStoreEmail.trim(),
      storeManager: newStoreManager.trim(),
      operatingHours: '10:00 AM - 08:00 PM (Mon - Sat)',
      status: 'Operational',
      totalStockUnits: 0,
      monthlyWalkInRevenue: 0,
      authorizedDevices: [],
    };

    setStores([...stores, store]);
    setShowAddStoreModal(false);
    // Reset
    setNewStoreName('');
    setNewStoreCode('');
    setNewStoreAddress('');
  };

  const handleAddDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStoreForDevice) return;

    const deviceToken = `PRG_POS_AUTH_${activeStoreForDevice.code}_TAB${Math.floor(10 + Math.random() * 90)}`;
    const newDevice: StoreDevice = {
      id: `dev-${Date.now()}`,
      deviceName: newDeviceName.trim(),
      deviceModel: newDeviceModel.trim(),
      token: deviceToken,
      assignedStaff: newDeviceStaff.trim() || 'Store Cashier',
      status: 'Active / Paired',
      lastActiveAt: 'Just now',
    };

    setStores(prev => prev.map(s => {
      if (s.id === activeStoreForDevice.id) {
        return {
          ...s,
          authorizedDevices: [...s.authorizedDevices, newDevice],
        };
      }
      return s;
    }));

    setShowAddDeviceModal(false);
    setNewDeviceName('');
    setNewDeviceStaff('');
  };

  const handleRevokeDevice = (storeId: string, deviceId: string) => {
    if (confirm('Revoke access for this store tablet/terminal? In-store checkout will be immediately locked.')) {
      setStores(prev => prev.map(s => {
        if (s.id === storeId) {
          return {
            ...s,
            authorizedDevices: s.authorizedDevices.filter(d => d.id !== deviceId),
          };
        }
        return s;
      }));
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#E0F7FC] px-3.5 py-1 rounded-full border border-[#00AEEF]/20">
              Section 84 &amp; 38 · Physical Stores &amp; POS Device Authentication
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Store Branches &amp; POS Tablet Manager
          </h1>
          <p className="text-xs text-slate-500">
            Manage Ranchi Central Inventory Hub, independent store branch locations (Patna, Delhi, Mumbai), and authorized tablet/device tokens for secure in-store walk-in shopping.
          </p>
        </div>

        <button
          onClick={() => setShowAddStoreModal(true)}
          className="bg-[#00AEEF] hover:bg-[#0096D6] text-white px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4 text-[#FFC20E]" />
          <span>Add New Store Branch</span>
        </button>
      </div>

      {/* 2. Stores Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {stores.map((store) => (
          <div
            key={store.id}
            className={`bg-white border rounded-3xl p-6 shadow-2xs space-y-5 transition-all relative ${
              store.isCentralHub 
                ? 'border-[#00AEEF] ring-2 ring-[#00AEEF]/20' 
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            {/* Top Store Badge */}
            <div className="flex items-start justify-between">
              <div>
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                  store.isCentralHub 
                    ? 'bg-[#00AEEF] text-white' 
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {store.code} · {store.type}
                </span>
                <h3 className="font-extrabold text-slate-900 text-base mt-1.5">{store.name}</h3>
              </div>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                store.status === 'Operational' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {store.status}
              </span>
            </div>

            {/* Address & Contact */}
            <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#00AEEF] shrink-0 mt-0.5" />
                <span className="font-medium">{store.address}, {store.city}, {store.state} - {store.pincode}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-mono text-slate-700 font-bold">{store.contactPhone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-[11px] text-slate-500">{store.operatingHours}</span>
              </div>
            </div>

            {/* Inventory & Revenue KPI */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Assigned Stock</span>
                <span className="text-sm font-black text-slate-900">{store.totalStockUnits.toLocaleString()} Units</span>
                {store.isCentralHub && <span className="text-[9px] text-[#00AEEF] block font-bold">Online + Store Hub</span>}
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Monthly Walk-in</span>
                <span className="text-sm font-black text-emerald-600">₹{(store.monthlyWalkInRevenue / 100000).toFixed(2)} Lakh</span>
                <span className="text-[9px] text-slate-400 block font-bold">In-Store POS</span>
              </div>
            </div>

            {/* Authorized Tablets & Devices Section */}
            <div className="space-y-2 border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
                  <Tablet className="w-3.5 h-3.5 text-[#00AEEF]" /> Authorized Devices ({store.authorizedDevices.length})
                </span>
                <button
                  onClick={() => {
                    setActiveStoreForDevice(store);
                    setShowAddDeviceModal(true);
                  }}
                  className="text-[11px] font-bold text-[#00AEEF] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Pair Device
                </button>
              </div>

              {store.authorizedDevices.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic bg-slate-50 p-2.5 rounded-xl text-center">
                  No tablets paired. In-store walk-in POS is locked for this location.
                </p>
              ) : (
                <div className="space-y-2">
                  {store.authorizedDevices.map((dev) => (
                    <div
                      key={dev.id}
                      className="bg-white border border-slate-200 p-2.5 rounded-xl flex items-center justify-between text-xs shadow-2xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{dev.deviceName}</span>
                        </div>
                        <div className="font-mono text-[10px] text-[#00AEEF] font-bold">{dev.token}</div>
                        <div className="text-[9px] text-slate-400">Staff: {dev.assignedStaff} · {dev.lastActiveAt}</div>
                      </div>

                      <button
                        onClick={() => handleRevokeDevice(store.id, dev.id)}
                        className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                        title="Revoke Device Token"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Launch Store POS View Link */}
            <div className="pt-2">
              <a
                href="/store-pos"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Tablet className="w-3.5 h-3.5 text-[#FFC20E]" />
                <span>Launch {store.code} POS Station</span>
              </a>
            </div>

          </div>
        ))}
      </div>

      {/* Add New Store Modal */}
      {showAddStoreModal && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div onClick={() => setShowAddStoreModal(false)} className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs animate-in fade-in" />
          <div className="relative max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-4 text-xs animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 uppercase">
                Add New Physical Store Branch
              </h3>
              <button onClick={() => setShowAddStoreModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStore} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Store Name *</label>
                  <input
                    type="text"
                    required
                    value={newStoreName}
                    onChange={(e) => setNewStoreName(e.target.value)}
                    placeholder="e.g. Prayog India Pune Tech Branch"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Store Code *</label>
                  <input
                    type="text"
                    required
                    value={newStoreCode}
                    onChange={(e) => setNewStoreCode(e.target.value.toUpperCase())}
                    placeholder="PUNE"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  value={newStoreAddress}
                  onChange={(e) => setNewStoreAddress(e.target.value)}
                  placeholder="Plot 10, Shivaji Nagar Tech Complex"
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={newStoreCity}
                    onChange={(e) => setNewStoreCity(e.target.value)}
                    placeholder="Pune"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={newStoreState}
                    onChange={(e) => setNewStoreState(e.target.value)}
                    placeholder="Maharashtra"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pincode *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={newStorePincode}
                    onChange={(e) => setNewStorePincode(e.target.value)}
                    placeholder="411005"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Store Phone *</label>
                  <input
                    type="tel"
                    required
                    value={newStorePhone}
                    onChange={(e) => setNewStorePhone(e.target.value)}
                    placeholder="+91 98220 11223"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Store Manager *</label>
                  <input
                    type="text"
                    required
                    value={newStoreManager}
                    onChange={(e) => setNewStoreManager(e.target.value)}
                    placeholder="Manager Name"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddStoreModal(false)}
                  className="px-4 py-2 font-bold text-slate-500 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#00AEEF] hover:bg-[#0096D6] text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-wider shadow-md"
                >
                  Create Store Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pair POS Device Modal */}
      {showAddDeviceModal && activeStoreForDevice && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div onClick={() => setShowAddDeviceModal(false)} className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs animate-in fade-in" />
          <div className="relative max-w-md w-full bg-white rounded-3xl p-6 sm:p-7 shadow-2xl z-10 space-y-4 text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 uppercase">
                Pair Tablet for {activeStoreForDevice.code} Store
              </h3>
              <button onClick={() => setShowAddDeviceModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDevice} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Terminal / Device Name *</label>
                <input
                  type="text"
                  required
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  placeholder="e.g. Counter Billing iPad #2"
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Device Model</label>
                <input
                  type="text"
                  value={newDeviceModel}
                  onChange={(e) => setNewDeviceModel(e.target.value)}
                  placeholder="Apple iPad Pro 11"
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Cashier / Staff</label>
                <input
                  type="text"
                  value={newDeviceStaff}
                  onChange={(e) => setNewDeviceStaff(e.target.value)}
                  placeholder="e.g. Shahnawaz Abbas"
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] font-medium">
                🔒 A unique hardware cryptographic pairing token (`PRG_POS_AUTH_{activeStoreForDevice.code}_...`) will be generated.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddDeviceModal(false)}
                  className="px-4 py-2 font-bold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#00AEEF] hover:bg-[#0096D6] text-white px-5 py-2.5 rounded-xl font-black uppercase shadow-md"
                >
                  Generate Token &amp; Pair
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
