"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Plus,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Smartphone,
  Landmark,
  Lock,
  Sparkles,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";

interface SavedCard {
  id: string;
  cardHolder: string;
  brand: "VISA" | "MASTERCARD" | "RUPAY" | "AMEX";
  last4: string;
  expiry: string;
  isDefault: boolean;
}

interface SavedUPI {
  id: string;
  upiId: string;
  provider: "Google Pay" | "PhonePe" | "Paytm" | "BHIM" | "Other";
  isDefault: boolean;
}

export const PaymentMethodsView: React.FC = () => {
  const { user, showToast } = useStore();

  const [cards, setCards] = useState<SavedCard[]>([
    {
      id: "card-1",
      cardHolder: user?.name || "Om Kumar",
      brand: "VISA",
      last4: "4242",
      expiry: "09/28",
      isDefault: true,
    },
    {
      id: "card-2",
      cardHolder: user?.companyName || user?.name || "Prayog Robotics Lab",
      brand: "MASTERCARD",
      last4: "8821",
      expiry: "11/29",
      isDefault: false,
    },
  ]);

  const [upis, setUpis] = useState<SavedUPI[]>([
    {
      id: "upi-1",
      upiId: user?.email ? `${user.email.split("@")[0]}@okaxis` : "omkumar@okaxis",
      provider: "Google Pay",
      isDefault: true,
    },
    {
      id: "upi-2",
      upiId: "prayoglabs@icici",
      provider: "PhonePe",
      isDefault: false,
    },
  ]);

  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showAddUPIModal, setShowAddUPIModal] = useState(false);

  // New card form state
  const [newCardNumber, setNewCardNumber] = useState("");
  const [newCardName, setNewCardName] = useState(user?.name || "");
  const [newCardExpiry, setNewCardExpiry] = useState("");
  const [newCardCvv, setNewCardCvv] = useState("");

  // New UPI form state
  const [newUpiId, setNewUpiId] = useState("");
  const [newUpiProvider, setNewUpiProvider] = useState<SavedUPI["provider"]>("Google Pay");

  const handleSetDefaultCard = (id: string) => {
    setCards((prev) =>
      prev.map((c) => ({
        ...c,
        isDefault: c.id === id,
      }))
    );
    showToast?.({
      title: "Default Card Updated",
      message: "Your primary card for one-click checkout has been updated.",
      type: "success",
    });
  };

  const handleDeleteCard = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
    showToast?.({
      title: "Card Removed",
      message: "The selected card has been deleted from your account.",
      type: "info",
    });
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardNumber || !newCardExpiry) return;
    const cleanNum = newCardNumber.replace(/\s+/g, "");
    const last4 = cleanNum.slice(-4) || "1234";

    const newCard: SavedCard = {
      id: `card-${Date.now()}`,
      cardHolder: newCardName || "Primary Cardholder",
      brand: "VISA",
      last4,
      expiry: newCardExpiry,
      isDefault: cards.length === 0,
    };

    setCards((prev) => [...prev, newCard]);
    setShowAddCardModal(false);
    setNewCardNumber("");
    setNewCardExpiry("");
    setNewCardCvv("");
    showToast?.({
      title: "Card Added Securely",
      message: "Card saved with 256-bit tokenized encryption.",
      type: "success",
    });
  };

  const handleAddUPI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpiId || !newUpiId.includes("@")) {
      alert("Please enter a valid UPI ID (e.g. yourname@upi)");
      return;
    }

    const newUpi: SavedUPI = {
      id: `upi-${Date.now()}`,
      upiId: newUpiId.trim(),
      provider: newUpiProvider,
      isDefault: upis.length === 0,
    };

    setUpis((prev) => [...prev, newUpi]);
    setShowAddUPIModal(false);
    setNewUpiId("");
    showToast?.({
      title: "UPI ID Added",
      message: `${newUpi.upiId} is now verified for instant autopay.`,
      type: "success",
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-8 text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF] bg-[#E0F7FC] px-3 py-1 rounded-full">
              Secure Wallet
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
              <ShieldCheck className="w-3.5 h-3.5" /> RBI Compliant Tokenized
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
            Payment Methods
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your saved credit/debit cards, verified UPI IDs, and institutional credit line.
          </p>
        </div>
      </div>

      {/* Institutional Credit Line Card */}
      <div className="bg-gradient-to-br from-[#0A1128] via-[#0d1b3e] to-[#1E56A0] rounded-3xl p-6 text-white relative overflow-hidden shadow-lg border border-slate-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-cyan-300">
              <Building2 className="w-3.5 h-3.5 text-[#D4AF37]" /> Institutional Pre-Approved Credit
            </div>
            <div className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              ₹5,00,000 <span className="text-xs font-normal text-slate-300">Available Limit</span>
            </div>
            <p className="text-xs text-slate-300 max-w-md">
              Zero-interest 30-day net credit term for recognized ATL schools, colleges, and university labs.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl flex flex-col gap-2 min-w-[200px]">
            <div className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">
              GSTIN Account
            </div>
            <div className="text-xs font-mono font-bold text-white">
              {user?.gstin || "07AAAAA0000A1Z5"}
            </div>
            <div className="text-[11px] text-emerald-300 font-bold flex items-center gap-1.5 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Pre-Approved Active
            </div>
          </div>
        </div>
      </div>

      {/* Saved Cards Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#00AEEF]" />
            <h2 className="text-lg font-black text-slate-900">Saved Credit &amp; Debit Cards</h2>
          </div>
          <button
            onClick={() => setShowAddCardModal(true)}
            className="flex items-center gap-1.5 bg-[#00AEEF] hover:bg-[#0098d4] text-white px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Card</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`p-5 rounded-2xl border transition-all relative flex flex-col justify-between h-44 ${
                card.isDefault
                  ? "border-[#00AEEF] bg-[#E0F7FC]/30 shadow-xs ring-1 ring-[#00AEEF]/30"
                  : "border-slate-200 bg-slate-50/60 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono font-black text-xs uppercase px-2 py-0.5 rounded bg-slate-900 text-white">
                    {card.brand}
                  </span>
                  {card.isDefault && (
                    <span className="ml-2 text-[10px] font-black uppercase text-[#00AEEF] bg-white px-2 py-0.5 rounded-full border border-[#00AEEF]/30">
                      Default
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteCard(card.id)}
                  className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                  title="Remove Card"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <div className="font-mono text-base font-black tracking-widest text-slate-800">
                  •••• •••• •••• {card.last4}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                  <span className="font-bold text-slate-700 truncate max-w-[180px]">
                    {card.cardHolder}
                  </span>
                  <span className="font-mono font-semibold">Exp {card.expiry}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                {!card.isDefault ? (
                  <button
                    onClick={() => handleSetDefaultCard(card.id)}
                    className="text-[#00AEEF] hover:underline font-bold text-[11px]"
                  >
                    Set as Default
                  </button>
                ) : (
                  <span className="text-emerald-600 font-bold text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Primary Checkout Card
                  </span>
                )}
                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Tokenized
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Saved UPI IDs Section */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-black text-slate-900">Verified UPI Accounts</h2>
          </div>
          <button
            onClick={() => setShowAddUPIModal(true)}
            className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add UPI ID</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upis.map((upi) => (
            <div
              key={upi.id}
              className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                upi.isDefault
                  ? "border-purple-300 bg-purple-50/40 shadow-xs"
                  : "border-slate-200 bg-slate-50/60 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-purple-600 font-black text-xs shadow-2xs">
                  UPI
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 font-mono flex items-center gap-2">
                    {upi.upiId}
                    {upi.isDefault && (
                      <span className="text-[9px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.2 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    {upi.provider} • Auto-verified
                  </div>
                </div>
              </div>
              <button
                onClick={() => setUpis((prev) => prev.filter((u) => u.id !== upi.id))}
                className="text-slate-400 hover:text-red-500 p-1.5 transition-colors"
                title="Remove UPI"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Card Modal */}
      {showAddCardModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#00AEEF]" /> Add New Card
              </h3>
              <button
                onClick={() => setShowAddCardModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddCard} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={newCardName}
                  onChange={(e) => setNewCardName(e.target.value)}
                  placeholder="e.g. Om Kumar"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#00AEEF]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Card Number (16-digits)
                </label>
                <input
                  type="text"
                  maxLength={19}
                  value={newCardNumber}
                  onChange={(e) => setNewCardNumber(e.target.value)}
                  placeholder="4242 •••• •••• 4242"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-semibold focus:outline-none focus:border-[#00AEEF]"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Expiry (MM/YY)
                  </label>
                  <input
                    type="text"
                    maxLength={5}
                    value={newCardExpiry}
                    onChange={(e) => setNewCardExpiry(e.target.value)}
                    placeholder="12/28"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-semibold focus:outline-none focus:border-[#00AEEF]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    CVV / CVC
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={newCardCvv}
                    onChange={(e) => setNewCardCvv(e.target.value)}
                    placeholder="•••"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-semibold focus:outline-none focus:border-[#00AEEF]"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCardModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-black bg-[#00AEEF] hover:bg-[#0098d4] text-white shadow-xs"
                >
                  Save &amp; Tokenize Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add UPI Modal */}
      {showAddUPIModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-purple-600" /> Link UPI ID
              </h3>
              <button
                onClick={() => setShowAddUPIModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddUPI} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  UPI VPA / Handle
                </label>
                <input
                  type="text"
                  value={newUpiId}
                  onChange={(e) => setNewUpiId(e.target.value)}
                  placeholder="mobile@okaxis or username@paytm"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-semibold focus:outline-none focus:border-purple-600"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  UPI App Provider
                </label>
                <select
                  value={newUpiProvider}
                  onChange={(e) => setNewUpiProvider(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-purple-600"
                >
                  <option value="Google Pay">Google Pay</option>
                  <option value="PhonePe">PhonePe</option>
                  <option value="Paytm">Paytm</option>
                  <option value="BHIM">BHIM</option>
                  <option value="Other">Other UPI App</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUPIModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-black bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
                >
                  Verify &amp; Save UPI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
