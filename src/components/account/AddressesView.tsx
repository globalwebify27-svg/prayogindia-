"use client";

import React, { useState } from "react";
import { MOCK_SAVED_ADDRESSES, Address } from "@/data/accountData";
import { MapPin, Plus, Trash2, Edit3, CheckCircle2 } from "lucide-react";

export const AddressesView: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>(MOCK_SAVED_ADDRESSES);
  const [showAddForm, setShowAddForm] = useState(false);

  // New Address Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("Karnataka");
  const [pincode, setPincode] = useState("");
  const [type, setType] = useState<"Home" | "Office" | "Lab / College">(
    "Lab / College",
  );

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const newAddr: Address = {
      id: `addr-${Date.now()}`,
      name,
      phone,
      street,
      city,
      state,
      pincode,
      type,
      isDefault: addresses.length === 0,
    };
    setAddresses([...addresses, newAddr]);
    setShowAddForm(false);
    // Reset Form
    setName("");
    setPhone("");
    setStreet("");
    setCity("");
    setPincode("");
  };

  const handleSetDefault = (id: string) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
  };

  const handleDelete = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
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
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[#00AEEF] hover:bg-[#0096D6] text-white px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Address</span>
        </button>
      </div>

      {/* Add Address Form Modal / Inline Section */}
      {showAddForm && (
        <form
          onSubmit={handleAddAddress}
          className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4 text-xs"
        >
          <h3 className="font-extrabold text-slate-900 text-sm">
            Add New Delivery Location
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              placeholder="Contact Person Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white p-2.5 rounded-xl border border-slate-200 focus:outline-none"
            />
            <input
              type="tel"
              required
              placeholder="Mobile Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-white p-2.5 rounded-xl border border-slate-200 focus:outline-none"
            />
          </div>

          <input
            type="text"
            required
            placeholder="Flat, House no., Building, Lab / Dept Name, Street"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            className="w-full bg-white p-2.5 rounded-xl border border-slate-200 focus:outline-none"
          />

          <div className="grid grid-cols-3 gap-3">
            <input
              type="text"
              required
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="bg-white p-2.5 rounded-xl border border-slate-200 focus:outline-none"
            />
            <input
              type="text"
              required
              placeholder="State"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="bg-white p-2.5 rounded-xl border border-slate-200 focus:outline-none"
            />
            <input
              type="text"
              required
              maxLength={6}
              placeholder="PIN Code"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              className="bg-white p-2.5 rounded-xl border border-slate-200 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              className="bg-slate-900 text-white px-5 py-2 rounded-xl font-bold text-xs hover:bg-[#00AEEF]"
            >
              Save Address
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-slate-500 font-bold hover:underline"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Address Cards Grid */}
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
                  <CheckCircle2 className="w-3 h-3" /> Default Shipping Address
                </span>
              )}
            </div>

            <div>
              <h4 className="text-xs font-black text-slate-900">{addr.name}</h4>
              <p className="text-[11px] text-slate-500 font-semibold">
                {addr.phone}
              </p>
              <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed">
                {addr.street}, {addr.city}, {addr.state} -{" "}
                <strong>{addr.pincode}</strong>
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              {!addr.isDefault && (
                <button
                  onClick={() => handleSetDefault(addr.id)}
                  className="font-bold text-[#00AEEF] hover:underline"
                >
                  Set as Default
                </button>
              )}
              <button
                onClick={() => handleDelete(addr.id)}
                className="text-slate-400 hover:text-red-500 p-1 ml-auto"
                title="Delete Address"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
