'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  AlertCircle, 
  ArrowRight, 
  Store, 
  Building2,
  MapPin,
  Sparkles
} from 'lucide-react';
import { PrayogLogo } from '@/components/PrayogLogo';
import { STORES, StoreId } from '@/data/storeConfig';

export default function StoreManagerBranchLoginPage() {
  const router = useRouter();
  const params = useParams();
  const branchSlug = ((params?.branch as string) || 'ranchi').toLowerCase() as StoreId;
  const storeConfig = STORES[branchSlug] || STORES.ranchi;

  const defaultUsername = `${branchSlug}_manager`;
  const [username, setUsername] = useState(defaultUsername);
  const [password, setPassword] = useState('manager123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/staff/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Invalid manager username/password.');
        setLoading(false);
        return;
      }

      router.push('/store');
    } catch {
      setError('Network error while authenticating store manager.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1D] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Dynamic Background Glow */}
      <div 
        className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ background: storeConfig.accentColor }} 
      />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#00AEEF]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/50 space-y-6">
          
          {/* Header */}
          <div className="flex flex-col items-center text-center space-y-2.5">
            <PrayogLogo size="lg" showSubtitle={false} />
            
            <div 
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider text-white shadow-inner border border-white/20"
              style={{ background: storeConfig.accentColor }}
            >
              <Store className="w-3.5 h-3.5" />
              <span>{storeConfig.shortName} Manager Portal</span>
            </div>

            <div className="flex items-center gap-1 text-slate-400 text-xs font-medium">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>{storeConfig.city}</span>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs p-3.5 rounded-xl flex items-start gap-2.5 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Store Manager Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={`e.g. ${branchSlug}_manager`}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00AEEF] transition-all font-mono"
                />
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00AEEF] transition-all"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-black text-xs py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50 mt-2 active:scale-[0.99]"
              style={{ background: storeConfig.accentColor }}
            >
              {loading ? (
                <span>Authenticating Manager...</span>
              ) : (
                <>
                  <span>Sign In as {storeConfig.shortName} Manager</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Branch Switcher */}
          <div className="pt-3 border-t border-slate-800/80">
            <div className="text-[10px] font-black uppercase text-slate-400 mb-2 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-[#00AEEF]" /> Switch Branch Login:
            </div>
            <div className="flex gap-1.5">
              {(['ranchi', 'patna', 'delhi'] as const).map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => router.push(`/storemanager/${b}`)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-black uppercase transition-all ${
                    b === branchSlug 
                      ? 'bg-slate-800 text-white border border-slate-700' 
                      : 'bg-slate-950/60 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
