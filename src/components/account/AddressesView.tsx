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

export const AddressesView: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state — shared for add and edit
  const [showForm, setShowForm] = useState(false);
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
          className="bg-[#00AEEF] hover:bg-[#0096D6] text-white px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
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

      {/* Add / Edit Address Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4 text-xs"
        >
          <h3 className="font-extrabold text-slate-900 text-sm">
            {editingId ? "Edit Address" : "Add New Delivery Location"}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              placeholder="Contact Person Name"
              value={form.name}
              onChange={(e) => handleFormChange("name", e.target.value)}
              className="bg-white p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#00AEEF]"
            />
            <input
              type="tel"
              required
              placeholder="Mobile Phone Number"
              value={form.phone}
              onChange={(e) => handleFormChange("phone", e.target.value)}
              className="bg-white p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#00AEEF]"
            />
          </div>

          <input
            type="text"
            required
            placeholder="Flat, House no., Building, Lab / Dept Name, Street"
            value={form.street}
            onChange={(e) => handleFormChange("street", e.target.value)}
            className="w-full bg-white p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#00AEEF]"
          />

          <div className="grid grid-cols-3 gap-3">
            <input
              type="text"
              required
              placeholder="City"
              value={form.city}
              onChange={(e) => handleFormChange("city", e.target.value)}
              className="bg-white p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#00AEEF]"
            />
            <input
              type="text"
              required
              placeholder="State"
              value={form.state}
              onChange={(e) => handleFormChange("state", e.target.value)}
              className="bg-white p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#00AEEF]"
            />
            <input
              type="text"
              required
              maxLength={6}
              placeholder="PIN Code"
              value={form.pincode}
              onChange={(e) => handleFormChange("pincode", e.target.value)}
              className="bg-white p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#00AEEF]"
            />
          </div>

          <div className="flex items-center gap-4">
            <select
              value={form.type}
              onChange={(e) => handleFormChange("type", e.target.value)}
              className="bg-white p-2.5 rounded-xl border border-slate-200 focus:outline-none text-xs"
            >
              <option value="Home">Home</option>
              <option value="Office">Office</option>
              <option value="Lab / College">Lab / College</option>
            </select>
            <label className="flex items-center gap-2 text-xs text-slate-600 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={!!form.isDefault}
                onChange={(e) =>
                  handleFormChange("isDefault", e.target.checked)
                }
                className="rounded"
              />
              Set as default
            </label>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-slate-900 text-white px-5 py-2 rounded-xl font-bold text-xs hover:bg-[#00AEEF] disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="w-3 h-3 animate-spin" />}
              {editingId ? "Update Address" : "Save Address"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-slate-500 font-bold hover:underline"
            >
              Cancel
            </button>
          </div>
        </form>
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
