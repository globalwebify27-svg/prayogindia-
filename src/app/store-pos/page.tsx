'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Tablet, 
  ShieldCheck, 
  ShieldAlert, 
  MapPin, 
  Phone, 
  Clock, 
  Store, 
  KeyRound, 
  ArrowRight, 
  ShoppingBag, 
  CheckCircle2, 
  AlertTriangle,
  Lock,
  Compass,
  Building2
} from 'lucide-react';

interface PhysicalStore {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  timings: string;
  terminalPrefix: string;
  status: 'Open Today' | 'Main Hub Stock';
  isMainHub: boolean;
}

const PHYSICAL_STORES: PhysicalStore[] = [
  {
    id: 'store-ranchi',
    name: 'Prayog India Central Experience Hub',
    city: 'Ranchi, Jharkhand',
    address: 'Plot 42, Tech Innovation Corridor, Main Road, Ranchi, Jharkhand - 834001',
    phone: '+91 98765 43210',
    timings: '10:00 AM - 8:00 PM (Open 7 Days)',
    terminalPrefix: 'TAB-RNC-01',
    status: 'Main Hub Stock',
    isMainHub: true,
  },
  {
    id: 'store-patna',
    name: 'Prayog India Robotics & STEM Branch',
    city: 'Patna, Bihar',
    address: 'Boring Road Tech Plaza, Near Science College, Patna, Bihar - 800001',
    phone: '+91 98123 45678',
    timings: '10:30 AM - 7:30 PM (Mon - Sat)',
    terminalPrefix: 'TAB-PAT-02',
    status: 'Open Today',
    isMainHub: false,
  },
  {
    id: 'store-delhi',
    name: 'Prayog India NCR Innovation Center',
    city: 'New Delhi, NCR',
    address: 'Okhla Industrial Area Phase-III, New Delhi - 110020',
    phone: '+91 98333 44455',
    timings: '10:00 AM - 7:00 PM (Mon - Sat)',
    terminalPrefix: 'TAB-DEL-03',
    status: 'Open Today',
    isMainHub: false,
  },
];

export default function StorePOSGatePage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [deviceToken, setDeviceToken] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  // Activation Key modal/form
  const [showStaffLogin, setShowStaffLogin] = useState(false);
  const [selectedStoreKey, setSelectedStoreKey] = useState<string>('store-ranchi');
  const [activationKey, setActivationKey] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState(false);

  useEffect(() => {
    // Check localStorage for existing cryptographic hardware token
    const token = localStorage.getItem('prayog_pos_device_token');
    const storedStore = localStorage.getItem('prayog_pos_store_id');
    const storedDevice = localStorage.getItem('prayog_pos_device_id');

    if (token && token.startsWith('PRG_POS_AUTH_')) {
      setIsAuthorized(true);
      setDeviceToken(token);
      setStoreId(storedStore || 'RANCHI');
      setDeviceId(storedDevice || 'TAB-RNC-01');
    } else {
      setIsAuthorized(false);
    }
  }, []);

  const handleActivateDevice = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const storeConfig: Record<string, { storeId: string; deviceId: string }> = {
      'store-ranchi': { storeId: 'RANCHI', deviceId: 'TAB-RNC-01' },
      'store-patna': { storeId: 'PATNA', deviceId: 'TAB-PAT-02' },
      'store-delhi': { storeId: 'DELHI', deviceId: 'TAB-DEL-03' },
    };

    const config = storeConfig[selectedStoreKey] || storeConfig['store-ranchi'];

    // Demo activation key validation
    if (activationKey === 'PRAYOG-DEMO-POS' || activationKey === 'RANCHI-POS-2026' || activationKey === 'PATNA-POS-2026' || activationKey === 'DELHI-POS-2026') {
      const generatedToken = `PRG_POS_AUTH_${config.storeId}_${Date.now()}`;
      localStorage.setItem('prayog_pos_device_token', generatedToken);
      localStorage.setItem('prayog_pos_store_id', config.storeId);
      localStorage.setItem('prayog_pos_device_id', config.deviceId);

      setIsAuthorized(true);
      setDeviceToken(generatedToken);
      setStoreId(config.storeId);
      setDeviceId(config.deviceId);
      setAuthSuccess(true);

      setTimeout(() => {
        router.push('/admin/pos');
      }, 1200);
    } else {
      setAuthError('Invalid Terminal Activation Key. Please use Demo Key: PRAYOG-DEMO-POS or contact Ranchi Central HQ.');
    }
  };

  const handleDeauthorize = () => {
    if (confirm('De-authorize this tablet? POS access will be locked until re-authenticated with a store terminal key.')) {
      localStorage.removeItem('prayog_pos_device_token');
      localStorage.removeItem('prayog_pos_store_id');
      localStorage.removeItem('prayog_pos_device_id');
      setIsAuthorized(false);
      setDeviceToken(null);
      setStoreId(null);
      setDeviceId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-in fade-in duration-300">
      
      {/* Top Banner Header */}
      <div className="bg-[#0F172A] text-white p-6 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-[#00AEEF] text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
              SECTION 3.0 STORE &amp; POS ARCHITECTURE
            </span>
            <span className="text-xs text-slate-400 font-bold">Physical Retail &amp; Experience Centers</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Store / Walk-in Shopping
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-medium">
            Explore Prayog India physical experience centers across Ranchi, Patna, and Delhi. Walk-in sales terminals are securely hardware-locked to authorized store devices.
          </p>
        </div>

        {/* Device Status Pill */}
        {isAuthorized ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <div className="text-xs font-black text-emerald-400 uppercase tracking-wider">Authorized Store Device</div>
              <div className="text-[11px] text-slate-300 font-mono">Terminal: {deviceId} ({storeId})</div>
            </div>
          </div>
        ) : (
          <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-center gap-3">
            <Lock className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <div className="text-xs font-black text-amber-400 uppercase tracking-wider">Hardware Lock Active</div>
              <div className="text-[11px] text-slate-400">Public browsing mode</div>
            </div>
          </div>
        )}
      </div>

      {/* Important Walk-in Rule Notice Box */}
      <div className="bg-blue-50/70 border-2 border-blue-200 rounded-3xl p-6 flex flex-col md:flex-row items-start gap-4 text-xs text-blue-950 shadow-2xs">
        <div className="w-10 h-10 rounded-2xl bg-[#00AEEF] text-white flex items-center justify-center shrink-0 shadow-md">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="space-y-1.5 flex-1">
          <h3 className="font-black text-sm text-blue-900 uppercase tracking-wider">
            Important Walk-in Rule &amp; Security Policy
          </h3>
          <p className="text-slate-700 leading-relaxed font-medium">
            Walk-in checkout is exclusively provisioned through <strong>authorized store tablets and POS devices assigned to physical stores</strong>. It is not open as an unrestricted public form. This prevents fake walk-in entries and guarantees all in-store inventory and GST records remain strictly bound to their verified retail hub.
          </p>
        </div>
      </div>

      {/* Main Grid: Device Mode Card & Store Locator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Authorized Device Launcher / Staff Key Form (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          {isAuthorized ? (
            <div className="bg-white rounded-3xl border-2 border-emerald-300 p-6 space-y-5 shadow-lg relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                  <Tablet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Active Store Terminal</h3>
                  <p className="text-xs text-slate-500 font-medium">Ready for In-Person Customer Billing</p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 font-mono text-xs text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Hub:</span>
                  <strong className="text-slate-900">{storeId} Main Store</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Device ID:</span>
                  <strong className="text-slate-900">{deviceId}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Token Status:</span>
                  <span className="text-emerald-600 font-black">VALID &amp; ENCRYPTED</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <Link
                  href="/admin/pos"
                  className="w-full bg-[#00AEEF] hover:bg-[#0096D6] text-white py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#00AEEF]/20 transition-all active:scale-95 text-center"
                >
                  <Tablet className="w-4 h-4" />
                  <span>Launch Store POS Billing Desk</span>
                  <ArrowRight className="w-4 h-4 text-[#FFC20E]" />
                </Link>

                <button
                  onClick={handleDeauthorize}
                  className="w-full bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 py-2.5 px-4 rounded-2xl font-bold text-xs transition-colors cursor-pointer"
                >
                  De-authorize Device
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-xs">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Store Staff POS Activation</h3>
                  <p className="text-xs text-slate-500 font-medium">Physical Store Terminal Access Gate</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                If you are a store executive operating a physical store tablet at Ranchi, Patna, or Delhi, enter your store terminal activation key below to authenticate this hardware.
              </p>

              <form onSubmit={handleActivateDevice} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Physical Store Hub</label>
                  <select
                    value={selectedStoreKey}
                    onChange={(e) => setSelectedStoreKey(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 text-xs"
                  >
                    <option value="store-ranchi">Ranchi Central Hub (TAB-RNC-01)</option>
                    <option value="store-patna">Patna Branch (TAB-PAT-02)</option>
                    <option value="store-delhi">Delhi NCR Center (TAB-DEL-03)</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-slate-700">Terminal Activation Key</label>
                    <button
                      type="button"
                      onClick={() => setActivationKey('PRAYOG-DEMO-POS')}
                      className="text-[10px] font-black text-[#00AEEF] hover:underline cursor-pointer"
                    >
                      Fill Demo Key
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="Enter Store Key (e.g. PRAYOG-DEMO-POS)"
                    value={activationKey}
                    onChange={(e) => setActivationKey(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900 text-xs tracking-wider uppercase font-bold"
                  />
                </div>

                {authError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold animate-in fade-in">
                    ✕ {authError}
                  </div>
                )}

                {authSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-bold animate-in fade-in flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Device Authorized! Redirecting to POS...
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-[#00AEEF] text-white py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                >
                  Authorize Hardware Tablet
                </button>
              </form>

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                <span>Demo Key: <strong className="text-slate-700 font-mono">PRAYOG-DEMO-POS</strong></span>
              </div>
            </div>
          )}

          {/* Quick Online Store Alternate */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-3xl space-y-3 shadow-xl">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FFC20E] bg-white/10 px-2 py-0.5 rounded">
              PUBLIC CUSTOMER SHOPPING
            </span>
            <h4 className="text-sm font-black">Shopping from home or office?</h4>
            <p className="text-xs text-slate-300 font-medium">
              Browse our complete catalog of 80+ robotics kits, microcontrollers, and drone parts with 24-hour express dispatch.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-xs font-black text-[#00AEEF] hover:text-white transition-colors"
            >
              <span>Explore Online Hardware Store</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Column: Physical Store Locations & Experience Centers (Span 7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase text-slate-900 flex items-center gap-2">
              <Store className="w-4 h-4 text-[#00AEEF]" /> Official Physical Experience Centers
            </h2>
            <span className="text-xs font-bold text-slate-500">3 Locations Live</span>
          </div>

          <div className="space-y-4">
            {PHYSICAL_STORES.map((store) => (
              <div
                key={store.id}
                className={`bg-white rounded-3xl border p-6 space-y-4 shadow-xs transition-all hover:shadow-md ${
                  store.isMainHub ? 'border-[#00AEEF]/50 ring-2 ring-[#00AEEF]/10' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900">{store.name}</h3>
                      {store.isMainHub && (
                        <span className="bg-[#FFC20E] text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                          Central Stock Hub
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#00AEEF] font-bold">{store.city}</span>
                  </div>

                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                    {store.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                  <div className="space-y-1 flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>{store.address}</span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-mono font-bold text-slate-800">{store.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-slate-500 font-medium">{store.timings}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-slate-400 text-[11px]">
                    Hardware Terminal: <strong className="font-mono text-slate-700">{store.terminalPrefix}</strong>
                  </span>

                  <a
                    href={`https://wa.me/919876543210?text=${encodeURIComponent(`Hi Prayog India, I would like to visit the ${store.name} in ${store.city}. Please share directions and hardware demo slots.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#00AEEF] hover:text-[#0086B8] font-bold text-xs flex items-center gap-1 hover:underline"
                  >
                    <span>Request Walk-in Demo Slot</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
