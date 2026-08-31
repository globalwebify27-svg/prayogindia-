'use client';

import React, { useState, useEffect } from 'react';
import { Tablet, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';

export default function StoreDevicesPage() {
  const [devices, setDevices] = useState<any[]>([]);
  const [storeCode, setStoreCode] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/store/devices');
      const data = await res.json();
      if (data.success) {
        setDevices(data.data || []);
        setStoreCode(data.store || 'STORE');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#00AEEF] text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
              {storeCode} Branch Hardware
            </span>
            <span className="text-xs text-slate-400 font-semibold">POS & Kiosk Fleet</span>
          </div>
          <h1 className="text-2xl font-black text-white">Authorized Store Tablets & Kiosks</h1>
          <p className="text-xs text-slate-400 mt-1">
            Hardware terminals configured for walk-in customer checkout and staff order fulfillment.
          </p>
        </div>

        <button
          onClick={fetchDevices}
          disabled={loading}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Fleet</span>
        </button>
      </div>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-[#00AEEF] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span>Connecting to device telemetry...</span>
          </div>
        ) : devices.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-3xl">
            No dedicated hardware terminals registered for this store yet.
          </div>
        ) : (
          devices.map((device) => (
            <div key={device.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-slate-700 transition-all">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 bg-blue-950/80 border border-blue-800/40 rounded-2xl flex items-center justify-center text-[#00AEEF]">
                  <Tablet className="w-5 h-5" />
                </div>
                <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> {device.status || 'Active'}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white">{device.deviceName}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{device.deviceModel}</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl space-y-1.5 text-[11px] font-mono">
                <div className="text-slate-400 flex justify-between">
                  <span>Assigned Staff:</span>
                  <span className="text-slate-200">{device.assignedStaff || 'Store Clerk'}</span>
                </div>
                <div className="text-slate-400 flex justify-between">
                  <span>Last Ping:</span>
                  <span className="text-emerald-400">{device.lastActiveAt || 'Active'}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
