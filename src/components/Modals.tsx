"use client";

import React, { useState } from "react";
import { X, Search, Star, ShoppingBag, Eye, Heart } from "lucide-react";
import { PRODUCTS, Product } from "@/data/mockData";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (p: Product) => void;
  onQuickView: (p: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onAddToCart,
  onQuickView,
}) => {
  const [query, setQuery] = useState("");

  if (!isOpen) return null;

  const results =
    query.trim() === ""
      ? []
      : PRODUCTS.filter(
          (p) =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.category.toLowerCase().includes(query.toLowerCase()) ||
            p.sku.toLowerCase().includes(query.toLowerCase()),
        );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-start justify-center pt-20 px-4">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
      />

      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 z-10 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3 w-full">
            <Search className="w-5 h-5 text-[#1E56A0]" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Arduino, ESP32, Drones, Sensors, Flight Controllers..."
              className="w-full text-base font-medium text-slate-900 placeholder-slate-400 focus:outline-none"
            />
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="mt-4 max-h-96 overflow-y-auto divide-y divide-slate-100">
          {query.trim() === "" ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Type to search 10,000+ technology products across all robotics
              categories.
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No products found matching &quot;{query}&quot;.
            </div>
          ) : (
            results.map((product) => (
              <div
                key={product.id}
                className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {product.name}
                    </h4>
                    <span className="text-[10px] text-[#1E56A0] bg-blue-50 px-2 py-0.5 rounded font-semibold">
                      {product.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs font-extrabold text-[#0A1128]">
                    ₹{product.price}
                  </div>
                  <button
                    onClick={() => {
                      onAddToCart(product);
                      onClose();
                    }}
                    className="p-2 bg-[#0A1128] text-white rounded-lg text-xs font-semibold hover:bg-[#1E56A0]"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export { QuickViewModal } from "@/components/products/QuickViewModal";

interface B2BModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const B2BModal: React.FC<B2BModalProps> = ({ isOpen, onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quoteNumber, setQuoteNumber] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    institutionName: "",
    gstin: "",
    institutionType: "Corporate",
    requirements: "",
    deliveryAddress: "",
    items: [{ productName: "", quantity: 1 }],
  });

  if (!isOpen) return null;

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { productName: "", quantity: 1 }],
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Build items array from either structured items or textarea requirements
      let formattedItems = formData.items.filter(
        (i) => i.productName.trim().length > 0,
      );
      if (formattedItems.length === 0) {
        formattedItems = [
          {
            productName:
              formData.requirements.slice(0, 120) ||
              "B2B Hardware / Component Requirement",
            quantity: 1,
          },
        ];
      }

      const res = await fetch("/api/quotations/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: formData.institutionName,
          customerName: formData.fullName,
          customerEmail: formData.email,
          customerPhone: formData.phone || "+91 98000 00000",
          gstin: formData.gstin || null,
          institutionType: formData.institutionType,
          shippingAddress: formData.deliveryAddress,
          notes: formData.requirements,
          items: formattedItems,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setQuoteNumber(data.data?.quoteNumber || "PRG-QT");
        setSubmitted(true);
      } else {
        setError(data.message || "Failed to submit quote request.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
      />

      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 z-10 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold border border-emerald-100">
              ✓
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Quotation Request Received
            </h3>
            <p className="text-xs font-mono font-bold text-[#00AEEF] bg-[#E0F7FC] px-3 py-1 rounded-full inline-block">
              Quote Ref: {quoteNumber}
            </p>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              We’ve received your requirement and will share a formal proposal shortly.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="bg-[#00AEEF] hover:bg-[#0096D6] text-white text-xs font-bold px-6 py-2.5 rounded-xl cursor-pointer transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Request a Quotation
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Institutional and bulk hardware pricing.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                {error}
              </div>
            )}

            <div className="space-y-3">
              {/* Institution Type Chips */}
              <div className="flex flex-wrap gap-2">
                {[
                  "School / ATL",
                  "College / Univ",
                  "Corporate",
                  "Research Lab",
                  "Maker / Bulk",
                ].map((type) => {
                  const isSelected = formData.institutionType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, institutionType: type })}
                      className={`px-3 py-1 rounded-full font-bold text-xs transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#00AEEF] text-white shadow-2xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  required
                  type="text"
                  placeholder="Contact Name *"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white p-2.5 rounded-xl border border-slate-200 focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/15 outline-none transition-all font-medium text-slate-900"
                />
                <input
                  required
                  type="email"
                  placeholder="Email Address *"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white p-2.5 rounded-xl border border-slate-200 focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/15 outline-none transition-all font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  required
                  type="tel"
                  placeholder="Phone Number *"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white p-2.5 rounded-xl border border-slate-200 focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/15 outline-none transition-all font-medium text-slate-900"
                />
                <input
                  required
                  type="text"
                  placeholder="Organization / School Name *"
                  value={formData.institutionName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      institutionName: e.target.value,
                    })
                  }
                  className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white p-2.5 rounded-xl border border-slate-200 focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/15 outline-none transition-all font-medium text-slate-900"
                />
              </div>

              <input
                type="text"
                placeholder="GSTIN (Optional)"
                value={formData.gstin}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    gstin: e.target.value.toUpperCase(),
                  })
                }
                className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white p-2.5 rounded-xl border border-slate-200 focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/15 outline-none transition-all uppercase font-medium text-slate-900"
              />

              {/* Product items list */}
              <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">
                    Products &amp; Quantities
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-[11px] font-bold text-[#00AEEF] hover:underline cursor-pointer"
                  >
                    + Add Item
                  </button>
                </div>

                {formData.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Arduino Uno R3, Raspberry Pi 5..."
                      value={item.productName}
                      onChange={(e) => {
                        const next = [...formData.items];
                        next[idx].productName = e.target.value;
                        setFormData({ ...formData, items: next });
                      }}
                      className="flex-1 bg-white p-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:border-[#00AEEF] outline-none"
                    />
                    <input
                      type="number"
                      min={1}
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => {
                        const next = [...formData.items];
                        next[idx].quantity = parseInt(e.target.value, 10) || 1;
                        setFormData({ ...formData, items: next });
                      }}
                      className="w-16 bg-white p-2 rounded-xl border border-slate-200 text-xs text-center font-bold text-slate-900 focus:border-[#00AEEF] outline-none"
                    />
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <textarea
                rows={2}
                placeholder="Additional notes / timeline requirements (Optional)..."
                value={formData.requirements}
                onChange={(e) =>
                  setFormData({ ...formData, requirements: e.target.value })
                }
                className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white p-2.5 rounded-xl border border-slate-200 focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/15 outline-none transition-all resize-none font-medium text-slate-900"
              />

              <input
                type="text"
                placeholder="Delivery City / Address (Optional)"
                value={formData.deliveryAddress}
                onChange={(e) =>
                  setFormData({ ...formData, deliveryAddress: e.target.value })
                }
                className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white p-2.5 rounded-xl border border-slate-200 focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/15 outline-none transition-all font-medium text-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00AEEF] hover:bg-[#0096D6] disabled:opacity-50 text-white py-3 rounded-xl text-xs font-bold shadow-2xs cursor-pointer transition-all active:scale-95"
            >
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
