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

interface QuickViewProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (p: Product) => void;
}

export const QuickViewModal: React.FC<QuickViewProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
      />

      <div className="relative w-[92vw] max-w-lg md:max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 sm:p-6 z-10 animate-in zoom-in-95 duration-200 my-auto max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-1.5 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-start">
          <div className="relative h-40 sm:h-48 md:aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-2.5 sm:space-y-3">
            <div>
              <span className="bg-blue-50 text-[#1E56A0] text-[9px] sm:text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full inline-block">
                {product.category}
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-[#0A1128] leading-tight mt-1">
                {product.name}
              </h2>
              <div className="text-[10px] text-slate-400 font-mono">
                SKU: {product.sku}
              </div>
            </div>

            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-lg sm:text-xl font-extrabold text-[#0A1128]">
                ₹{product.price.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 line-through">
                ₹{product.mrp.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-emerald-600">
                Save {product.discount}
              </span>
            </div>

            <p className="text-[11px] text-slate-600 leading-snug line-clamp-2 sm:line-clamp-none">
              {product.description}
            </p>

            <div className="pt-2 border-t border-slate-100">
              <h4 className="text-[11px] font-bold text-slate-900 mb-1">
                Technical Specifications
              </h4>
              <div className="grid grid-cols-2 gap-1.5 text-[10px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                {Object.entries(product.specs).map(([k, v]) => (
                  <div key={k} className="truncate">
                    <span className="text-slate-400">{k}: </span>
                    <span className="font-semibold text-slate-800">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {product.inStock ? (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    onAddToCart(product);
                    onClose();
                  }}
                  className="border border-[#00AEEF] text-[#00AEEF] hover:bg-[#E0F7FC] py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 text-center cursor-pointer"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => {
                    onAddToCart(product);
                    onClose();
                  }}
                  className="bg-[#00AEEF] hover:bg-[#0096D6] text-white py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md text-center cursor-pointer"
                >
                  Buy Now
                </button>
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                <div className="bg-red-50 text-red-600 text-[11px] font-bold px-3 py-1.5 rounded-xl border border-red-200 text-center">
                  Currently Out of Stock in Central Inventory
                </div>
                <a
                  href={`https://wa.me/919876543210?text=${encodeURIComponent(`Hi Prayog India, I am interested in ${product.name} (SKU: ${product.sku}). Please let me know the availability and latest price.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all text-center"
                >
                  <span>Ask Availability on WhatsApp</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

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
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-black">
              ✓
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Quotation Request Received!
            </h3>
            <p className="text-xs font-mono font-bold text-[#00AEEF] bg-[#E0F7FC] px-3 py-1 rounded-full inline-block">
              Quote Ref: {quoteNumber}
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Our B2B institutional procurement desk has logged your request.
              You will receive an official GST proforma quotation with
              negotiated volume pricing within 2 business hours.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="bg-[#0A1128] hover:bg-[#1E56A0] text-white text-xs font-bold px-8 py-3 rounded-full cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="bg-[#D4AF37] text-slate-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                Institutional &amp; Enterprise Desk
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-[#0A1128]">
              Request Official B2B Quotation
            </h2>
            <p className="text-xs text-slate-500">
              Direct institutional pricing for Schools, Colleges, STEM Labs,
              Universities &amp; Enterprises.
            </p>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                {error}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  required
                  type="text"
                  placeholder="Procurement Officer / Contact Name *"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 focus:bg-white focus:outline-none"
                />
                <input
                  required
                  type="email"
                  placeholder="Institutional / Work Email *"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  required
                  type="tel"
                  placeholder="Phone Number (+91) *"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 focus:bg-white focus:outline-none"
                />
                <input
                  required
                  type="text"
                  placeholder="Institution / Company Name *"
                  value={formData.institutionName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      institutionName: e.target.value,
                    })
                  }
                  className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  value={formData.institutionType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      institutionType: e.target.value,
                    })
                  }
                  className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 focus:bg-white focus:outline-none text-slate-700 font-medium"
                >
                  <option value="School">School / ATL Lab</option>
                  <option value="College">College / Polytechnic</option>
                  <option value="University">University Research Lab</option>
                  <option value="Corporate">Corporate / Enterprise</option>
                  <option value="STEM Lab">Private Robotics Center</option>
                  <option value="Government / Tender">
                    Govt Dept / Tender
                  </option>
                </select>

                <input
                  type="text"
                  placeholder="GST Number (Optional)"
                  value={formData.gstin}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gstin: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 focus:bg-white focus:outline-none uppercase"
                />
              </div>

              {/* Product items list */}
              <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">
                    Requested Products &amp; Quantities
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-[11px] font-bold text-[#00AEEF] hover:underline cursor-pointer"
                  >
                    + Add Product Line
                  </button>
                </div>

                {formData.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={`e.g. Raspberry Pi 5 8GB / Arduino Kit ${idx + 1}`}
                      value={item.productName}
                      onChange={(e) => {
                        const next = [...formData.items];
                        next[idx].productName = e.target.value;
                        setFormData({ ...formData, items: next });
                      }}
                      className="flex-1 bg-white p-2.5 rounded-xl border border-slate-200 text-xs"
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
                      className="w-20 bg-white p-2.5 rounded-xl border border-slate-200 text-xs text-center font-bold"
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
                placeholder="Additional notes, project specs, preferred delivery timeline..."
                value={formData.requirements}
                onChange={(e) =>
                  setFormData({ ...formData, requirements: e.target.value })
                }
                className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 focus:bg-white focus:outline-none"
              ></textarea>

              <input
                type="text"
                placeholder="Delivery City / Campus Address"
                value={formData.deliveryAddress}
                onChange={(e) =>
                  setFormData({ ...formData, deliveryAddress: e.target.value })
                }
                className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 focus:bg-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0A1128] hover:bg-[#1E56A0] disabled:bg-slate-300 text-white py-3.5 rounded-full text-xs font-bold shadow-md cursor-pointer transition-all"
            >
              {loading
                ? "Submitting Quotation Request..."
                : "Submit Quotation Request"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
