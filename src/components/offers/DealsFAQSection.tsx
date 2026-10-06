"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle, Sparkles } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

export const DealsFAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: "How do I apply coupon codes to my order?",
      answer:
        "Simply click 'Copy' on any voucher card in the Voucher Vault. When reviewing your shopping cart or reaching the checkout page, paste the code into the 'Promo Code / Voucher' field and click Apply. The discount will instantly recalculate your final payable total.",
    },
    {
      question: "Can I combine multiple promotional voucher codes?",
      answer:
        "One coupon code can be applied per checkout order. However, coupon discounts can be combined with automatic catalogue discounts, free shipping promotions (orders over ₹999), and combo bundle package savings.",
    },
    {
      question: "Do discounted deal items come with official warranty?",
      answer:
        "Yes, 100%! All hardware components, Arduino boards, Pixhawk autopilots, and robotic kits sold under deals carry our full standard 1-Year Prayog India Replacement & QC Warranty against manufacturing defects.",
    },
    {
      question: "How do institutional and college lab bulk discounts work?",
      answer:
        "Engineering colleges, universities, and registered companies can use code INSTITUTE20 on orders above ₹14,999 or contact our Institutional Desk directly for customized quotation sheets, GST Input Credit tax invoices, and Net-30 purchase order terms.",
    },
    {
      question: "What is the return policy on clearance and promotional items?",
      answer:
        "All deal items are protected by our 7-day hassle-free replacement policy. If any component is damaged during transit or arrives non-functional, our technical support team will dispatch a replacement immediately.",
    },
  ];

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="space-y-4 pt-6 border-t border-slate-200">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-6 bg-purple-500 rounded-full" />
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <span>Frequently Asked Questions About Deals</span>
          <HelpCircle className="w-5 h-5 text-purple-500" />
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? "bg-slate-50 border-[#00AEEF]/40 shadow-sm"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <button
                onClick={() => toggle(idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 cursor-pointer"
              >
                <span className="text-xs sm:text-sm font-bold text-slate-900">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-[#00AEEF]" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 sm:px-5 pb-4 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 mt-1 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
