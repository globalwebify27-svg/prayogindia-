"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  MapPin,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface Address {
  id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  type: string;
  isDefault: boolean;
}

type AddressFormData = Omit<Address, "id" | "isDefault"> & {
  isDefault?: boolean;
};

const EMPTY_FORM: AddressFormData = {
  name: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  pincode: "",
  type: "Home",
};

interface AddressesViewProps {
  initialShowForm?: boolean;
}

export const AddressesView: React.FC<AddressesViewProps> = ({
  initialShowForm = false,
}) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state — shared for add and edit
  const [showForm, setShowForm] = useState(initialShowForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressFormData>(EMPTY_FORM);

  // Fetch addresses from API
  const fetchAddresses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users/me/addresses");
      if (res.ok) {
        const data = await res.json();
        if (data.success) setAddresses(data.data || []);
      }
    } catch {
      setError("Failed to load addresses.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const showMessage = (msg: string, isError = false) => {
    if (isError) setError(msg);
    else setSuccess(msg);
    setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 3500);
  };

  const openAddForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEditForm = (addr: Address) => {
    setEditingId(addr.id);
    setForm({
      name: addr.name,
      phone: addr.phone,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      type: addr.type,
      isDefault: addr.isDefault,
    });
    setShowForm(true);
  };

  const handleFormChange = (
    key: keyof AddressFormData,
    val: string | boolean,
  ) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const endpoint = editingId
      ? `/api/users/me/addresses/${editingId}`
      : "/api/users/me/addresses";
    const method = editingId ? "PATCH" : "POST";

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.success) {
        showMessage(editingId ? "Address updated." : "Address saved.");
        setShowForm(false);
        await fetchAddresses();
      } else {
        showMessage(data.message || "Failed to save address.", true);
      }
    } catch {
      showMessage("Network error. Please try again.", true);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/users/me/addresses/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        showMessage("Address deleted.");
        setAddresses((prev) => prev.filter((a) => a.id !== id));
      } else {
        showMessage(data.message || "Failed to delete.", true);
      }
    } catch {
      showMessage("Network error.", true);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    const addr = addresses.find((a) => a.id === id);
    if (!addr) return;
    try {
      const res = await fetch(`/api/users/me/addresses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...addr, isDefault: true }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchAddresses();
        showMessage("Default address updated.");
      }
    } catch {
      showMessage("Failed to update default.", true);
    }
  };

  if (showForm) {
    return (
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 space-y-6 text-slate-900 animate-in fade-in duration-200">
        {/* Breadcrumb */}
        <div className="text-xs text-slate-500 flex items-center gap-2 font-medium">
          <a href="/account" className="text-slate-600 hover:text-[#00AEEF]">
            Your Account
          </a>
          <span>›</span>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="text-slate-600 hover:text-[#00AEEF] cursor-pointer"
          >
            Your Addresses
          </button>
          <span>›</span>
          <span className="text-[#E65100] font-bold">
            {editingId ? "Edit Address" : "New Address"}
          </span>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {editingId ? "Edit address" : "Add a new address"}
          </h1>
          <p className="text-xs text-[#00AEEF] flex items-center gap-1.5 mt-1 font-medium">
            <span className="w-4 h-4 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-[10px]">
              P
            </span>
            Or find a Prayog collection location near you
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 text-xs max-w-2xl"
        >
          {/* Autofill Current Location Banner */}
          <div className="bg-[#EBF8FA] border border-[#BCE9F5] rounded-xl p-3.5 flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-800">
              Save time. Autofill your current location.
            </span>
            <button
              type="button"
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    () => {
                      setForm((prev) => ({
                        ...prev,
                        city: prev.city || "Bengaluru",
                        state: prev.state || "Karnataka",
                        pincode: prev.pincode || "560103",
                      }));
                    },
                    () => {
                      setForm((prev) => ({
                        ...prev,
                        city: prev.city || "Bengaluru",
                        state: prev.state || "Karnataka",
                        pincode: prev.pincode || "560103",
                      }));
                    },
                  );
                }
              }}
              className="bg-white hover:bg-slate-50 border border-slate-300 font-bold text-xs px-4 py-1.5 rounded-full text-slate-800 shadow-2xs cursor-pointer transition-all active:scale-95 shrink-0"
            >
              Autofill
            </button>
          </div>

          {/* Country/Region */}
          <div>
            <label className="block font-bold text-slate-900 mb-1.5">
              Country/Region
            </label>
            <select
              disabled
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium text-slate-800 focus:outline-none cursor-not-allowed"
            >
              <option value="India">India</option>
            </select>
          </div>

          {/* Full Name */}
          <div>
            <label className="block font-bold text-slate-900 mb-1.5">
              Full name (First and Last name)
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => handleFormChange("name", e.target.value)}
              className="w-full bg-white border border-slate-300 focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] p-2.5 rounded-lg font-medium text-slate-900 outline-none transition-all"
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block font-bold text-slate-900 mb-1.5">
              Mobile number
            </label>
            <input
              type="tel"
              required
              maxLength={10}
              value={form.phone}
              onChange={(e) => handleFormChange("phone", e.target.value)}
              className="w-full bg-white border border-slate-300 focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] p-2.5 rounded-lg font-medium text-slate-900 outline-none transition-all"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              May be used to assist delivery
            </p>
          </div>

          {/* Pincode */}
          <div>
            <label className="block font-bold text-slate-900 mb-1.5">
              Pincode
            </label>
            <input
              type="text"
              required
              maxLength={6}
              placeholder="6 digits [0-9] PIN code"
              value={form.pincode}
              onChange={(e) => handleFormChange("pincode", e.target.value)}
              className="w-full bg-white border border-slate-300 focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] p-2.5 rounded-lg font-medium text-slate-900 outline-none transition-all"
            />
          </div>

          {/* Flat, House no., Building */}
          <div>
            <label className="block font-bold text-slate-900 mb-1.5">
              Flat, House no., Building, Company, Apartment
            </label>
            <input
              type="text"
              required
              value={form.street}
              onChange={(e) => handleFormChange("street", e.target.value)}
              className="w-full bg-white border border-slate-300 focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] p-2.5 rounded-lg font-medium text-slate-900 outline-none transition-all"
            />
          </div>

          {/* Area, Street, Sector, Village */}
          <div>
            <label className="block font-bold text-slate-900 mb-1.5">
              Area, Street, Sector, Village
            </label>
            <input
              type="text"
              placeholder=""
              className="w-full bg-white border border-slate-300 focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] p-2.5 rounded-lg font-medium text-slate-900 outline-none transition-all"
            />
          </div>

          {/* Landmark */}
          <div>
            <label className="block font-bold text-slate-900 mb-1.5">
              Landmark
            </label>
            <input
              type="text"
              placeholder="E.g. near apollo hospital"
              className="w-full bg-white border border-slate-300 focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] p-2.5 rounded-lg font-medium text-slate-900 outline-none transition-all"
            />
          </div>

          {/* Town/City & State */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-900 mb-1.5">
                Town/City
              </label>
              <input
                type="text"
                required
                value={form.city}
                onChange={(e) => handleFormChange("city", e.target.value)}
                className="w-full bg-white border border-slate-300 focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] p-2.5 rounded-lg font-medium text-slate-900 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-900 mb-1.5">
                State
              </label>
              <select
                value={form.state}
                onChange={(e) => handleFormChange("state", e.target.value)}
                className="w-full bg-white border border-slate-300 focus:border-[#00AEEF] focus:ring-1 focus:ring-[#00AEEF] p-2.5 rounded-lg font-medium text-slate-900 outline-none transition-all"
              >
                <option value="">Choose a state</option>
                {[
                  "Andhra Pradesh",
                  "Arunachal Pradesh",
                  "Assam",
                  "Bihar",
                  "Chhattisgarh",
                  "Goa",
                  "Gujarat",
                  "Haryana",
                  "Himachal Pradesh",
                  "Jharkhand",
                  "Karnataka",
                  "Kerala",
                  "Madhya Pradesh",
                  "Maharashtra",
                  "Manipur",
                  "Meghalaya",
                  "Mizoram",
                  "Nagaland",
                  "Odisha",
                  "Punjab",
                  "Rajasthan",
                  "Sikkim",
                  "Tamil Nadu",
                  "Telangana",
                  "Tripura",
                  "Uttar Pradesh",
                  "Uttarakhand",
                  "West Bengal",
                  "Delhi NCR",
                  "Chandigarh",
                  "Jammu and Kashmir",
                  "Ladakh",
                  "Puducherry",
                ].map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Address Type Selection */}
          <div>
            <label className="block font-bold text-slate-900 mb-1.5">
              Address Type
            </label>
            <div className="flex gap-2">
              {(["Home", "Office", "Lab / College"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleFormChange("type", t)}
                  className={`px-4 py-1.5 rounded-full font-bold text-xs transition-colors cursor-pointer ${
                    form.type === t
                      ? "bg-[#00AEEF] text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Default Address Checkbox */}
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-900 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={!!form.isDefault}
              onChange={(e) => handleFormChange("isDefault", e.target.checked)}
              className="w-4 h-4 rounded text-[#00AEEF] accent-[#00AEEF] cursor-pointer"
            />
            <span>Make this my default address</span>
          </label>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-[#00AEEF] hover:bg-[#0096D6] text-white px-8 py-3 rounded-xl font-bold text-xs shadow-xs active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer transition-all"
            >
              {saving && <Loader2 className="w-3 h-3 animate-spin" />}
              {editingId ? "Save Address" : "Add address"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-slate-600 hover:text-slate-900 font-bold px-4 py-3 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6 text-slate-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Saved Shipping Addresses
          </h2>
          <p className="text-xs text-slate-500">
            Manage delivery locations for lab supplies, institutional orders,
            and personal home address.
          </p>
        </div>
        <button
          onClick={openAddForm}
          className="bg-[#00AEEF] hover:bg-[#0096D6] text-white px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Address</span>
        </button>
      </div>

      {/* Success / Error Banner */}
      {(success || error) && (
        <div
          className={`rounded-xl px-4 py-3 text-xs font-semibold flex items-center gap-2 ${
            error
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
          }`}
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error || success}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-10 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          <span className="text-xs">Loading addresses...</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && addresses.length === 0 && (
        <div className="text-center py-10 text-slate-400">
          <MapPin className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-xs font-semibold">No saved addresses yet.</p>
          <p className="text-[11px]">Add an address to speed up checkout.</p>
        </div>
      )}

      {/* Address Cards Grid */}
      {!loading && addresses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-5 rounded-2xl border transition-all space-y-3 relative ${
                addr.isDefault
                  ? "bg-[#E0F7FC]/40 border-[#00AEEF]"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="bg-slate-100 text-slate-800 text-[10px] font-black uppercase px-2.5 py-1 rounded">
                  {addr.type}
                </span>
                {addr.isDefault && (
                  <span className="bg-[#00AEEF] text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Default
                  </span>
                )}
              </div>

              <div>
                <h4 className="text-xs font-black text-slate-900">
                  {addr.name}
                </h4>
                <p className="text-[11px] text-slate-500 font-semibold">
                  {addr.phone}
                </p>
                <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed">
                  {addr.street}, {addr.city}, {addr.state} —{" "}
                  <strong>{addr.pincode}</strong>
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs gap-2">
                {!addr.isDefault && (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="font-bold text-[#00AEEF] hover:underline"
                  >
                    Set as Default
                  </button>
                )}
                <div className="flex gap-2 ml-auto">
                  <button
                    onClick={() => openEditForm(addr)}
                    className="text-slate-400 hover:text-slate-700 p-1"
                    title="Edit Address"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    disabled={deletingId === addr.id}
                    className="text-slate-400 hover:text-red-500 p-1 disabled:opacity-50"
                    title="Delete Address"
                  >
                    {deletingId === addr.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
