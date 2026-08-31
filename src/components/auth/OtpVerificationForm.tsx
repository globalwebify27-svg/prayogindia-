'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { ShieldCheck, Phone, ArrowRight, RefreshCw, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export const OtpVerificationForm: React.FC = () => {
  const router = useRouter();
  const { loginUser } = useStore();

  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'send' | 'verify'>('send');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'verify' && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanNum = phone.replace(/\D/g, '');

    if (!cleanNum || cleanNum.length < 10) {
      setError('Please enter a valid 10-digit mobile phone number.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', phone: cleanNum }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'Failed to send OTP.');
        setLoading(false);
        return;
      }

      setInfoMsg(data.message || `OTP sent to +91 ${cleanNum}.`);
      setStep('verify');
      setTimer(30);
    } catch {
      setError('Network error sending OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (val: string, index: number) => {
    if (val.length <= 1) {
      const updated = [...otp];
      updated[index] = val;
      setOtp(updated);

      if (val && index < 5) {
        const nextInput = document.getElementById(`otp-input-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanNum = phone.replace(/\D/g, '');
    const enteredCode = otp.join('');

    if (enteredCode.length !== 6) {
      setError('Please enter all 6 digits of the OTP passcode.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          phone: cleanNum,
          code: enteredCode,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'Invalid OTP code.');
        setLoading(false);
        return;
      }

      loginUser({
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone,
        customerType: 'Registered Customer',
        rewardPoints: 100,
      });

      router.push('/account');
    } catch {
      setError('Network error validating OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-6 text-slate-900 animate-in fade-in duration-300">
      
      {/* Brand Header */}
      <div className="text-center space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#E0F7FC] px-3.5 py-1 rounded-full border border-[#00AEEF]/20 w-fit mx-auto mb-2">
          <Sparkles className="w-3 h-3" /> Secure OTP Gateway
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          {step === 'send' ? 'Login with Mobile OTP' : 'Verify Mobile OTP'}
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          {step === 'send' 
            ? 'Enter your 10-digit registered mobile number to receive a verification OTP'
            : `Enter the 6-digit verification code sent to +91 ${phone.replace(/\D/g, '')}`}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-xs font-bold p-3.5 rounded-2xl border border-red-200 flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {infoMsg && (
        <div className="bg-[#E0F7FC] text-[#00AEEF] text-xs font-bold p-3.5 rounded-2xl border border-[#00AEEF]/20 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#00AEEF] shrink-0" />
          <span>{infoMsg}</span>
        </div>
      )}

      {step === 'send' && (
        <form onSubmit={handleSendOtp} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-extrabold text-slate-700 block">Mobile Phone Number *</label>
            <div className="flex items-center rounded-2xl border-2 border-slate-200 focus-within:border-[#00AEEF] bg-slate-50 overflow-hidden transition-all">
              <span className="px-4 font-black text-slate-700 text-sm border-r border-slate-200 bg-slate-100/60 py-3.5">
                +91
              </span>
              <input
                type="tel"
                required
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 10-digit mobile number"
                className="w-full bg-transparent text-slate-900 px-4 py-3.5 text-base font-bold tracking-wide focus:outline-none placeholder-slate-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={phone.replace(/\D/g, '').length < 10 || loading}
            className="w-full bg-[#00AEEF] hover:bg-[#0096D6] disabled:opacity-50 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-[#00AEEF]/25 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <span>{loading ? 'Sending OTP...' : 'Send 6-Digit OTP'}</span>
            <ArrowRight className="w-4 h-4 text-[#FFC20E]" />
          </button>
        </form>
      )}

      {step === 'verify' && (
        <form onSubmit={handleVerify} className="space-y-5 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-2 text-center">
              Enter 6-Digit Verification Code
            </label>
            <div className="flex justify-center gap-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, idx)}
                  className="w-11 h-13 bg-slate-50 text-center text-xl font-black text-slate-900 rounded-xl border-2 border-slate-200 focus:outline-none focus:border-[#00AEEF] focus:bg-white transition-all shadow-2xs"
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={otp.join('').length < 6 || loading}
            className="w-full bg-[#00AEEF] hover:bg-[#0096D6] disabled:opacity-50 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-[#00AEEF]/25 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <span>{loading ? 'Verifying...' : 'Verify & Sign In'}</span>
            <ArrowRight className="w-4 h-4 text-[#FFC20E]" />
          </button>

          <div className="flex items-center justify-between text-[11px] pt-1">
            <button
              type="button"
              onClick={() => {
                setStep('send');
                setOtp(['', '', '', '', '', '']);
              }}
              className="font-bold text-slate-500 hover:text-slate-900"
            >
              Change Mobile Number
            </button>

            {timer > 0 ? (
              <span className="text-slate-400 font-semibold">Resend in {timer}s</span>
            ) : (
              <button
                type="button"
                onClick={handleSendOtp}
                className="font-bold text-[#00AEEF] hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Resend OTP
              </button>
            )}
          </div>
        </form>
      )}

      {/* Footer */}
      <div className="text-center pt-3 border-t border-slate-100 text-xs text-slate-500">
        Prefer password login?{' '}
        <Link href="/login" className="font-extrabold text-[#00AEEF] hover:underline">
          Sign In with Password
        </Link>
      </div>

    </div>
  );
};
