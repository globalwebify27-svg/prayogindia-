"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Search,
  ShoppingBag,
  Loader2,
  Plus,
  Trash2,
  Link2,
  CheckCircle2,
  AlertCircle,
  Building2,
} from "lucide-react";
import { PRODUCTS, Product } from "@/data/mockData";
import { useSearchSuggestions } from "@/hooks/useSearchSuggestions";
import { useAuth } from "@/store";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

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
  const { suggestions: results, isLoading } = useSearchSuggestions(query, 300, 10);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-start justify-center pt-20 px-4">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
      />

      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 z-10 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3 w-full">
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-[#1E56A0]" />
            )}
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
          {isLoading && results.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span>Searching live database...</span>
            </div>
          ) : query.trim() === "" ? (
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
                      const fullProduct: Product = {
                        id: product.id,
                        name: product.name,
                        sku: product.sku,
                        price: product.price,
                        mrp: product.mrp || product.price * 1.2,
                        category: product.category,
                        image: product.image,
                        inStock: product.inStock,
                        rating: product.rating ?? 4.8,
                        discount:
                          product.mrp && product.mrp > product.price
                            ? `${Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF`
                            : "",
                        reviews: 12,
                        description: "",
                        specs: {},
                      };
                      onAddToCart(fullProduct);
                      onClose();
                    }}
                    className="p-2 bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
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

interface QuotationProductItem {
  id: string;
  name: string;
  link: string;
  quantity: string;
  targetPrice: string;
}

interface B2BModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProduct?: {
    name?: string;
    link?: string;
    quantity?: string;
    targetPrice?: string;
  };
}

export const B2BModal: React.FC<B2BModalProps> = ({
  isOpen,
  onClose,
  initialProduct,
}) => {
  const user = useAuth((s) => s.user);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quoteNumber, setQuoteNumber] = useState("");

  const [institutionType, setInstitutionType] = useState("ATL School");
  const [companyName, setCompanyName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [products, setProducts] = useState<QuotationProductItem[]>([
    { id: "1", name: "", link: "", quantity: "1", targetPrice: "" },
  ]);

  interface B2BErrors {
    companyName?: string;
    customerName?: string;
    phone?: string;
    email?: string;
    products?: string;
  }
  const [fieldErrors, setFieldErrors] = useState<B2BErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateB2BField = (field: keyof B2BErrors, value: string): string | undefined => {
    const trimmed = value.trim();
    switch (field) {
      case "companyName":
        if (!trimmed) return "Organization / Lab name is required.";
        if (trimmed.length < 2) return "Organization name must be at least 2 characters.";
        return undefined;
      case "customerName":
        if (!trimmed) return "Contact person name is required.";
        if (trimmed.length < 2) return "Contact person name must be at least 2 characters.";
        if (!/[a-zA-Z]/.test(trimmed)) return "Contact person name must contain valid letters.";
        return undefined;
      case "phone": {
        if (!trimmed) return "Mobile number is required.";
        const cleaned = trimmed.replace(/\D/g, "");
        if (!/^[6-9]\d{9}$/.test(cleaned)) {
          return "Enter a valid 10-digit Indian mobile number.";
        }
        return undefined;
      }
      case "email": {
        if (!trimmed) return "Email address is required.";
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmed)) {
          return "Enter a valid email address.";
        }
        return undefined;
      }
      default:
        return undefined;
    }
  };

  const handleB2BBlur = (field: keyof B2BErrors, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateB2BField(field, value);
    setFieldErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleB2BChange = (
    field: keyof B2BErrors,
    value: string,
    setter: (val: string) => void,
  ) => {
    setter(value);
    if (touched[field]) {
      const err = validateB2BField(field, value);
      setFieldErrors((prev) => ({ ...prev, [field]: err }));
    }
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync user info and initial product when modal opens
  useEffect(() => {
    if (isOpen) {
      setSubmitted(false);
      setError("");
      setFieldErrors({});
      setTouched({});
      if (user) {
        if (user.companyName) setCompanyName(user.companyName);
        if (user.name) setCustomerName(user.name);
        if (user.email) setEmail(user.email);
        if (user.phone) setPhone(user.phone.replace(/\D/g, "").slice(-10));
      }
      if (initialProduct?.name) {
        setProducts([
          {
            id: "1",
            name: initialProduct.name,
            link: initialProduct.link || "",
            quantity: initialProduct.quantity || "1",
            targetPrice: initialProduct.targetPrice || "",
          },
        ]);
      } else {
        setProducts([
          {
            id: "1",
            name: "",
            link: "",
            quantity: "1",
            targetPrice: "",
          },
        ]);
      }
    }
  }, [isOpen, user, initialProduct]);

  // Lock background scroll when open (prevents background cards and page from moving)
  useBodyScrollLock(isOpen);

  const handleAddProduct = () => {
    setProducts((prev) => [
      ...prev,
      {
        id: `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: "",
        link: "",
        quantity: "1",
        targetPrice: "",
      },
    ]);
  };

  const handleRemoveProduct = (id: string) => {
    if (products.length <= 1) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleUpdateProduct = (
    id: string,
    field: keyof QuotationProductItem,
    value: string,
  ) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      companyName: true,
      customerName: true,
      phone: true,
      email: true,
      products: true,
    });

    const compErr = validateB2BField("companyName", companyName);
    const custErr = validateB2BField("customerName", customerName);
    const phoneErr = validateB2BField("phone", phone);
    const emailErr = validateB2BField("email", email);

    const validProducts = products.filter((p) => p.name.trim().length > 0);
    const prodErr =
      validProducts.length === 0
        ? "Please specify at least one product requirement."
        : undefined;

    const newErrors: B2BErrors = {};
    if (compErr) newErrors.companyName = compErr;
    if (custErr) newErrors.customerName = custErr;
    if (phoneErr) newErrors.phone = phoneErr;
    if (emailErr) newErrors.email = emailErr;
    if (prodErr) newErrors.products = prodErr;

    setFieldErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setError("Please fix the highlighted fields before submitting.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const itemsPayload = validProducts.map((p) => ({
        productName: p.name.trim(),
        productLink: p.link.trim() || undefined,
        quantity: Math.max(1, parseInt(p.quantity, 10) || 1),
        unitPrice:
          p.targetPrice && Number(p.targetPrice) > 0
            ? Number(p.targetPrice)
            : undefined,
      }));

      const linksList = validProducts
        .filter((p) => p.link.trim().length > 0)
        .map(
          (p, idx) =>
            `${idx + 1}. ${p.name.trim()} (${p.quantity}x): ${p.link.trim()}`,
        )
        .join("\n");

      const combinedNotes = [
        notes.trim(),
        linksList ? `Product Reference Links:\n${linksList}` : "",
      ]
        .filter(Boolean)
        .join("\n\n");

      const cleanedPhone = phone.replace(/\D/g, "");
      const res = await fetch("/api/quotations/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyName.trim(),
          customerName: customerName.trim(),
          customerEmail: email.trim(),
          customerPhone: `+91 ${cleanedPhone}`,
          institutionType,
          notes: combinedNotes || undefined,
          items: itemsPayload,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setQuoteNumber(data.data?.quoteNumber || "PRG-QT");
        setSubmitted(true);
      } else {
        setError(data.message || "Failed to submit quotation request.");
      }
    } catch {
      setError("Network error submitting quotation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] overflow-hidden flex justify-start overscroll-contain">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 touch-none"
            aria-hidden="true"
          />

          {/* Drawer Sidebar (Slides smoothly from LEFT) */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{
              type: "tween",
              duration: 0.38,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative w-full max-w-lg sm:max-w-xl h-full max-h-[100dvh] h-[100dvh] bg-white text-slate-900 shadow-2xl flex flex-col z-10 overflow-hidden overscroll-contain border-r border-slate-200 transform-gpu will-change-transform"
          >
            {/* Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex items-start justify-between bg-white shrink-0">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0 border border-blue-100/60 mt-0.5">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Request a Quotation
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                    Submit your bulk or institutional hardware requirement.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4 stroke-[2]" />
              </button>
            </div>

            {submitted ? (
              <div className="p-6 sm:p-8 text-center space-y-4 my-auto">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold border border-emerald-100 shadow-2xs">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  Quotation Request Received
                </h3>
                <p className="text-xs font-mono font-bold text-[#2563EB] bg-blue-50 border border-blue-200/60 px-3.5 py-1.5 rounded-full inline-block">
                  Quote Ref: {quoteNumber}
                </p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  We’ve received your institutional requirement and our team will share a formal proposal with special B2B pricing shortly.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      onClose();
                    }}
                    className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold px-8 py-2.5 rounded-xl cursor-pointer transition-all shadow-md shadow-blue-500/20 active:scale-95"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="flex flex-col flex-1 min-h-0">
                <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-3.5 text-xs">
                  {error && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium flex items-center gap-2 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Institution Type Chips */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5 text-[11px] sm:text-xs">
                      Institution Type
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        "ATL School",
                        "University / College",
                        "Corporate / R&D",
                        "Research Lab",
                        "Maker / Bulk",
                      ].map((type) => {
                        const isSelected = institutionType === type;
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setInstitutionType(type)}
                            className={`px-3 py-1 rounded-full font-semibold text-[11px] sm:text-xs transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#2563EB] text-white shadow-2xs"
                                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            }`}
                          >
                            {type}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Organization / Lab Name */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 text-[11px] sm:text-xs">
                      Organization / School / Lab Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="School, college, or company name"
                      value={companyName}
                      onChange={(e) => handleB2BChange("companyName", e.target.value, setCompanyName)}
                      onBlur={() => handleB2BBlur("companyName", companyName)}
                      aria-invalid={!!(touched.companyName && fieldErrors.companyName)}
                      className={`w-full px-3 py-2 rounded-lg font-medium text-xs outline-none transition-all placeholder:text-slate-400 placeholder:font-normal ${
                        touched.companyName && fieldErrors.companyName
                          ? "bg-rose-50/20 border border-rose-400 text-slate-900 focus:ring-2 focus:ring-rose-400"
                          : "bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 text-slate-900"
                      }`}
                    />
                    {touched.companyName && fieldErrors.companyName && (
                      <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1 animate-in fade-in">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{fieldErrors.companyName}</span>
                      </p>
                    )}
                  </div>

                  {/* Contact Person & Mobile Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-[11px] sm:text-xs">
                        Contact Person Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Full name of contact person"
                        value={customerName}
                        onChange={(e) => handleB2BChange("customerName", e.target.value, setCustomerName)}
                        onBlur={() => handleB2BBlur("customerName", customerName)}
                        aria-invalid={!!(touched.customerName && fieldErrors.customerName)}
                        className={`w-full px-3 py-2 rounded-lg font-medium text-xs outline-none transition-all placeholder:text-slate-400 placeholder:font-normal ${
                          touched.customerName && fieldErrors.customerName
                            ? "bg-rose-50/20 border border-rose-400 text-slate-900 focus:ring-2 focus:ring-rose-400"
                            : "bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 text-slate-900"
                        }`}
                      />
                      {touched.customerName && fieldErrors.customerName && (
                        <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1 animate-in fade-in">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{fieldErrors.customerName}</span>
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-[11px] sm:text-xs">
                        Mobile Number <span className="text-rose-500">*</span>
                      </label>
                      <div className={`flex rounded-lg border overflow-hidden transition-all ${
                        touched.phone && fieldErrors.phone
                          ? "border-rose-400 bg-rose-50/20 ring-2 ring-rose-400"
                          : "border-slate-200 focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#2563EB]/15"
                      }`}>
                        <span className="bg-slate-100 text-slate-500 font-bold px-2.5 py-2 border-r border-slate-200 flex items-center select-none text-xs">
                          +91
                        </span>
                        <input
                          type="tel"
                          maxLength={10}
                          placeholder="10-digit mobile number"
                          value={phone}
                          onChange={(e) => handleB2BChange("phone", e.target.value.replace(/\D/g, "").slice(0, 10), setPhone)}
                          onBlur={() => handleB2BBlur("phone", phone)}
                          aria-invalid={!!(touched.phone && fieldErrors.phone)}
                          className="w-full px-3 py-2 bg-slate-50/70 hover:bg-slate-50 focus:bg-white font-medium text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
                        />
                      </div>
                      {touched.phone && fieldErrors.phone && (
                        <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1 animate-in fade-in">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{fieldErrors.phone}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 text-[11px] sm:text-xs">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="contact@institution.edu"
                      value={email}
                      onChange={(e) => handleB2BChange("email", e.target.value, setEmail)}
                      onBlur={() => handleB2BBlur("email", email)}
                      aria-invalid={!!(touched.email && fieldErrors.email)}
                      className={`w-full px-3 py-2 rounded-lg font-medium text-xs outline-none transition-all placeholder:text-slate-400 placeholder:font-normal ${
                        touched.email && fieldErrors.email
                          ? "bg-rose-50/20 border border-rose-400 text-slate-900 focus:ring-2 focus:ring-rose-400"
                          : "bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 text-slate-900"
                      }`}
                    />
                    {touched.email && fieldErrors.email && (
                      <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1 animate-in fade-in">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{fieldErrors.email}</span>
                      </p>
                    )}
                  </div>

                  {/* Products & Components */}
                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div>
                        <label className="block font-bold text-slate-800 text-xs sm:text-sm">
                          Products &amp; Components <span className="text-rose-500">*</span>
                        </label>
                        <p className="text-[10px] sm:text-[11px] text-slate-500 font-normal">
                          Add products with required quantity and optional links.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddProduct}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#2563EB] text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-2xs shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Add Product</span>
                      </button>
                    </div>

                    {touched.products && fieldErrors.products && (
                      <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 animate-in fade-in">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{fieldErrors.products}</span>
                      </p>
                    )}

                    <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-0.5">
                      {products.map((prod, index) => (
                        <div
                          key={prod.id}
                          className="bg-slate-50/80 hover:bg-slate-50 border border-slate-200/90 rounded-xl p-3 space-y-2 transition-colors relative"
                        >
                          {/* Item Top Bar */}
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0A233F]">
                              <span className="w-4.5 h-4.5 rounded-full bg-[#0A233F] text-white text-[10px] font-bold flex items-center justify-center">
                                {index + 1}
                              </span>
                              <span>Product #{index + 1}</span>
                            </span>

                            {products.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveProduct(prod.id)}
                                className="text-xs font-semibold text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2 py-0.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                                title="Remove this product"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Remove</span>
                              </button>
                            )}
                          </div>

                          {/* Product Name Input */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Product Name / Specification <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Product name or requirement"
                              value={prod.name}
                              onChange={(e) =>
                                handleUpdateProduct(prod.id, "name", e.target.value)
                              }
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 rounded-lg font-medium text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
                            />
                          </div>

                          {/* Product Link + Quantity & Target Price Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                            {/* Product Link (Optional) */}
                            <div className="sm:col-span-6">
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Product Link / URL{" "}
                                <span className="text-slate-400 font-normal">
                                  (Optional)
                                </span>
                              </label>
                              <div className="flex items-center bg-white border border-slate-200 focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#2563EB]/15 rounded-lg overflow-hidden px-2.5 py-1.5 transition-all">
                                <Link2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1.5" />
                                <input
                                  type="url"
                                  placeholder="https://example.com/product-link"
                                  value={prod.link}
                                  onChange={(e) =>
                                    handleUpdateProduct(prod.id, "link", e.target.value)
                                  }
                                  className="w-full bg-transparent font-medium text-xs text-slate-900 placeholder:text-slate-400 placeholder:font-normal outline-none"
                                />
                              </div>
                            </div>

                            {/* Quantity */}
                            <div className="sm:col-span-3">
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Quantity <span className="text-rose-500">*</span>
                              </label>
                              <input
                                type="number"
                                min="1"
                                required
                                placeholder="1"
                                value={prod.quantity}
                                onChange={(e) =>
                                  handleUpdateProduct(
                                    prod.id,
                                    "quantity",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 rounded-lg font-medium text-xs text-slate-900 outline-none transition-all text-center sm:text-left placeholder:text-slate-400 placeholder:font-normal"
                              />
                            </div>

                            {/* Target Unit Price (Optional) */}
                            <div className="sm:col-span-3">
                              <label className="block text-[11px] font-bold text-slate-700 mb-1 truncate">
                                Target ₹{" "}
                                <span className="text-slate-400 font-normal">
                                  (Opt)
                                </span>
                              </label>
                              <input
                                type="number"
                                min="0"
                                placeholder="Price per unit"
                                value={prod.targetPrice}
                                onChange={(e) =>
                                  handleUpdateProduct(
                                    prod.id,
                                    "targetPrice",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 rounded-lg font-medium text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add another product dashed button */}
                    <button
                      type="button"
                      onClick={handleAddProduct}
                      className="w-full py-2 border-2 border-dashed border-slate-200 hover:border-[#2563EB] hover:bg-blue-50/50 rounded-xl text-xs font-bold text-slate-600 hover:text-[#2563EB] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Another Product</span>
                    </button>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 text-[11px] sm:text-xs">
                      Additional Notes / Specifications (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Any specific delivery timeline, batch requirements, or instructions..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full p-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 rounded-lg font-medium text-xs text-slate-900 outline-none transition-all resize-none placeholder:text-slate-400 placeholder:font-normal"
                    />
                  </div>
                </div>

                {/* Sticky Footer Actions */}
                <div className="px-4 sm:px-6 py-3.5 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-white shrink-0 sticky bottom-0 z-20 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] pb-[max(0.875rem,env(safe-area-inset-bottom))]">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 font-bold text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-5 py-2 rounded-lg font-bold text-xs shadow-xs active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer transition-all"
                  >
                    {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Submit Request</span>
                  </button>
                </div>
              </form>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
