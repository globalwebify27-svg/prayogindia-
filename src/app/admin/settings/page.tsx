'use client';

import React from 'react';
import { Settings, ShieldCheck, Database, Key } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">System Settings & Audit Log</h1>
        <p className="text-xs text-slate-500 font-medium">Operational audit logging and security configuration</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        
        {/* Audit Log Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="w-5 h-5 text-[#00AEEF]" />
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Security Audit Trail</h3>
              <span className="text-[11px] text-slate-500">Record of sensitive admin authentication & catalog modifications</span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900 block">Admin Authentication Event</span>
                <span className="text-[11px] text-slate-500">User admin@prayogindia.com logged in successfully</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Today, 12:00 PM</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900 block">Product Inventory Update</span>
                <span className="text-[11px] text-slate-500">Stock updated for Arduino UNO R4 WiFi Board (+10 units)</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Today, 11:45 AM</span>
            </div>
          </div>
        </div>

        {/* Database Info Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Database className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Database & Storage Engine</h3>
              <span className="text-[11px] text-slate-500">Production environment connection status</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Primary Database</span>
              <span className="text-slate-900 font-bold block mt-0.5">PostgreSQL (Prisma ORM)</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Object Storage</span>
              <span className="text-slate-900 font-bold block mt-0.5">AWS S3 / S3-Compatible</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
