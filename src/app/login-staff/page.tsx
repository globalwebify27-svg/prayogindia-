'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  AlertCircle, 
  ArrowRight, 
  Store, 
  Tablet, 
  KeyRound, 
  Sparkles,
  CheckCircle2,
  Building2
} from 'lucide-react';
import { PrayogLogo } from '@/components/PrayogLogo';

function StaffLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
        setError(data.message || 'Invalid username/password.');
        setLoading(false);
        return;
      }

      // Priority: specific redirect or computed destination based on role
      const destination = redirectTarget || data.redirectTo || '/admin';
      router.push(destination);
    } catch {
      setError('Network error while authenticating staff member.');
      setLoading(false);
    }
  };

  const fillQuickPreset = (presetUser: string, presetPass: string) => {
    setUsername(presetUser);
    setPassword(presetPass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#0A0F1D] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background Decorative Lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#00AEEF]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#FFC20E]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Main Card */}
        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/50 space-y-6">
          
          {/* Brand Logo & Portal Header */}
          <div className="flex flex-col items-center text-center space-y-2.5">
            <PrayogLogo size="lg" showSubtitle={false} />
            <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-950 to-slate-900 border border-blue-800/40 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-[#00AEEF] mt-1 shadow-inner">
              <ShieldCheck className="w-4 h-4 text-[#FFC20E]" /> Operations & Staff Portal
            </div>
            <p className="text-slate-400 text-xs font-medium">
              Unified login for Super Admin, Store Managers & Kiosk Terminals
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs p-3.5 rounded-xl flex items-start gap-2.5 font-medium animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Email / Staff Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. superadmin or ranchi_manager"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] transition-all"
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
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] transition-all"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#00AEEF] to-[#0086ba] hover:from-[#0096D6] hover:to-[#0074a2] text-white font-black text-xs py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#00AEEF]/20 cursor-pointer disabled:opacity-50 mt-2 active:scale-[0.99]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating Identity...</span>
                </div>
              ) : (
                <>
                  <span>Sign In to Staff Desk</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Preset Switcher */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#FFC20E]" /> Demo Role Fast-Fill
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillQuickPreset('superadmin', 'admin123')}
                className="bg-slate-950/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 p-2.5 rounded-xl text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-1 text-[10px] font-bold text-amber-400 group-hover:text-amber-300">
                  <ShieldCheck className="w-3 h-3" /> Super Admin
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">@superadmin</div>
                <div className="text-[9px] text-slate-500 mt-0.5">/admin</div>
              </button>

              <button
                type="button"
                onClick={() => fillQuickPreset('ranchi_manager', 'manager123')}
                className="bg-slate-950/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 p-2.5 rounded-xl text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-1 text-[10px] font-bold text-blue-400 group-hover:text-blue-300">
                  <Store className="w-3 h-3" /> Store Mgr
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">@ranchi_mgr</div>
                <div className="text-[9px] text-slate-500 mt-0.5">/storemanager/ranchi</div>
              </button>

              <button
                type="button"
                onClick={() => fillQuickPreset('ranchi_kiosk', 'kiosk123')}
                className="bg-slate-950/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 p-2.5 rounded-xl text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 group-hover:text-emerald-300">
                  <Tablet className="w-3 h-3" /> Kiosk Device
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">@ranchi_kiosk</div>
                <div className="text-[9px] text-slate-500 mt-0.5">/kiosk</div>
              </button>
            </div>
          </div>

          {/* Security & Routing Hint Footer */}
          <div className="text-center pt-2 text-[11px] text-slate-500 space-y-1">
            <div className="flex items-center justify-center gap-1 text-slate-400 font-medium">
              <KeyRound className="w-3 h-3 text-[#00AEEF]" /> Automatic Store-Level Routing & Protection
            </div>
            <p className="text-[10px]">
              Store managers and kiosks are restricted to their assigned branch.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function StaffLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0A0F1D] flex items-center justify-center text-white">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-[#00AEEF] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold text-slate-400">Loading Staff Portal...</span>
          </div>
        </div>
      }
    >
      <StaffLoginForm />
    </Suspense>
  );
}

