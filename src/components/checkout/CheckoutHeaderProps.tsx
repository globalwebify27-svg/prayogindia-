'use client';

import React from 'react';
import { ShoppingBag, MapPin, Truck, ShieldCheck, CreditCard } from 'lucide-react';

export type CheckoutStep = 'address' | 'delivery' | 'review' | 'payment';

interface CheckoutHeaderProps {
  currentStep: CheckoutStep;
  onStepClick: (step: CheckoutStep) => void;
}

export const CheckoutHeaderProps: React.FC<CheckoutHeaderProps> = ({
  currentStep,
  onStepClick,
}) => {
  const steps: Array<{ id: CheckoutStep; label: string; icon: any }> = [
    { id: 'address', label: '1. Shipping Address', icon: MapPin },
    { id: 'delivery', label: '2. Delivery Method', icon: Truck },
    { id: 'review', label: '3. Order Review', icon: ShieldCheck },
    { id: 'payment', label: '4. Payment Mode', icon: CreditCard },
  ];

  return (
    <div className="border-b border-slate-100 pb-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#E0F7FC] px-3 py-1 rounded-full inline-block">
            Secure Checkout
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Customer Checkout
          </h1>
        </div>
      </div>

      {/* Progress Indicator Steps Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          return (
            <button
              key={step.id}
              onClick={() => onStepClick(step.id)}
              className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                isActive
                  ? 'bg-[#E0F7FC] border-[#00AEEF] text-[#00AEEF] shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#00AEEF]' : 'text-slate-400'}`} />
              <span className="text-xs font-bold truncate">{step.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
