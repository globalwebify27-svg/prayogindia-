'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react';

export const ForgotPasswordForm: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim()) {
      setError('Please enter your registered Email or Mobile Number.');
      return;
    }

    setSubmitted(true);
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white rounded-3xl border border-slate-200 p-8 shadow-xl space-y-6 text-slate-900">
      
      {!submitted ? (
        <>
          <div className="space-y-1 text-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#E0F7FC] px-3 py-1 rounded-full inline-block">
              Account Recovery
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Forgot Password?
            </h1>
            <p className="text-xs text-slate-500">
              Enter your registered Email Address or Mobile Number. We will issue password reset instructions.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-xs font-bold p-3 rounded-xl border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Email or Mobile Number</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. name@domain.com or +91 9876543210"
                  className="w-full bg-slate-50 text-slate-900 pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#00AEEF] font-semibold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#00AEEF] hover:bg-[#0096D6] text-white py-3.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#00AEEF]/25 flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Send Reset Instructions</span>
              <ArrowRight className="w-4 h-4 text-[#FFC20E]" />
            </button>
          </form>
        </>
      ) : (
        <div className="text-center space-y-4 py-4">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Reset Request Submitted</h2>
          <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
            If an account exists for <strong className="text-slate-900">{identifier}</strong>, a password reset link or verification code has been dispatched.
          </p>
        </div>
      )}

      <div className="text-center pt-2 border-t border-slate-100">
        <Link href="/login" className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-[#00AEEF]">
          <ArrowLeft className="w-4 h-4" /> Back to Sign In
        </Link>
      </div>

    </div>
  );
};
