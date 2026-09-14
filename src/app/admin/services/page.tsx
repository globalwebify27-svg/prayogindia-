"use client";

import React, { useState, useEffect } from "react";
import {
  Wrench,
  Search,
  Filter,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  RefreshCw,
  Eye,
  X,
  Cpu,
  Wind,
  Factory,
  BriefcaseBusiness,
  MessageSquare,
  User,
  Building2,
  Download,
  ChevronDown,
} from "lucide-react";

const SERVICE_TYPES = [
  { slug: "all", label: "All Enquiries", icon: Wrench, color: "text-slate-600" },
  { slug: "STEM_LAB_SETUP", label: "STEM Lab Setup", icon: Cpu, color: "text-blue-600" },
  { slug: "ROBOTICS_LAB_SETUP", label: "Robotics Lab", icon: Cpu, color: "text-purple-600" },
  { slug: "DRONE_LAB_SETUP", label: "Drone Lab", icon: Wind, color: "text-sky-600" },
  { slug: "INDUSTRIAL_PROJECTS", label: "Industrial Projects", icon: Factory, color: "text-orange-600" },
  { slug: "CONSULTANCY", label: "Consultancy", icon: BriefcaseBusiness, color: "text-emerald-600" },
];

const STATUS_OPTIONS = [
  { value: "NEW", label: "New", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "CONTACTED", label: "Contacted", color: "bg-amber-100 text-amber-800 border-amber-200" },
  { value: "IN_PROGRESS", label: "In Progress", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { value: "CLOSED", label: "Closed", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
];

export default function AdminServicesPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState("all");
  const [selectedEnquiry, setSelectedEnquiry] = useState<any | null>(null);
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedService !== "all") params.set("service", selectedService);
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/admin/services?${params}`);
      const data = await res.json();
      if (data.success) {
        setEnquiries(data.data || []);
        setServices(data.services || []);
      }
    } catch {
      setEnquiries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedService]);

  const filteredEnquiries = enquiries.filter((e) => {
    const q = searchQuery.toLowerCase();
    return (
      !searchQuery ||
      e.name?.toLowerCase().includes(q) ||
      e.email?.toLowerCase().includes(q) ||
      e.phone?.includes(q) ||
      e.message?.toLowerCase().includes(q)
    );
  });

  const getStatusForEnquiry = (id: string) => localStatuses[id] || "NEW";

  const getStatusConfig = (status: string) =>
    STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];

  const totalThisMonth = enquiries.filter((e) => {
    const d = new Date(e.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-0.5 rounded-full border border-emerald-200">
              Service Enquiry Management
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Service Enquiries
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage B2B & institutional enquiries for STEM Labs, Robotics, Drone Labs, and consultancy services
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Summary KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Total Enquiries",
            value: enquiries.length,
            color: "bg-slate-50 border-slate-200",
            valueColor: "text-slate-900",
          },
          {
            label: "This Month",
            value: totalThisMonth,
            color: "bg-blue-50 border-blue-200",
            valueColor: "text-blue-800",
          },
          {
            label: "New / Unread",
            value: enquiries.filter((e) => getStatusForEnquiry(e.id) === "NEW").length,
            color: "bg-amber-50 border-amber-200",
            valueColor: "text-amber-800",
          },
          {
            label: "Closed / Done",
            value: enquiries.filter((e) => getStatusForEnquiry(e.id) === "CLOSED").length,
            color: "bg-emerald-50 border-emerald-200",
            valueColor: "text-emerald-800",
          },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-2xl border p-4 ${stat.color} flex flex-col`}>
            <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
              {stat.label}
            </span>
            <span className={`text-3xl font-black mt-1 ${stat.valueColor}`}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Service Type Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {SERVICE_TYPES.map((svc) => {
          const Icon = svc.icon;
          const count = svc.slug === "all"
            ? enquiries.length
            : enquiries.filter((e) => e.service?.slug === svc.slug).length;

          return (
            <button
              key={svc.slug}
              onClick={() => setSelectedService(svc.slug)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs border ${
                selectedService === svc.slug
                  ? "bg-[#0B132B] text-white border-[#0B132B] shadow-md"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${selectedService === svc.slug ? "text-[#00AEEF]" : svc.color}`} />
              <span>{svc.label}</span>
              {count > 0 && (
                <span
                  className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                    selectedService === svc.slug ? "bg-[#00AEEF] text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, email, phone or message..."
          className="flex-1 bg-transparent text-xs font-bold text-slate-900 focus:outline-none placeholder:text-slate-400 placeholder:font-normal"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Enquiries Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Service Type</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Message Preview</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin text-[#00AEEF]" />
                      <span className="text-xs">Loading service enquiries...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <Wrench className="w-8 h-8 opacity-30" />
                      <span className="text-xs font-bold">No service enquiries found</span>
                      <span className="text-[11px]">Enquiries submitted via the services pages will appear here</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEnquiries.map((enq) => {
                  const status = getStatusForEnquiry(enq.id);
                  const statusConfig = getStatusConfig(status);
                  return (
                    <tr key={enq.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Customer */}
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-600 text-sm shrink-0">
                            {(enq.name || "?")[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900">{enq.name}</div>
                            {enq.user && (
                              <div className="text-[10px] text-[#00AEEF] font-bold">Registered Customer</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Service Type */}
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-[11px] font-bold">
                          <Wrench className="w-3 h-3" />
                          {enq.service?.name || "—"}
                        </span>
                      </td>

                      {/* Contact */}
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-[11px] text-slate-700 font-bold">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          {enq.phone}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          {enq.email}
                        </div>
                      </td>

                      {/* Message Preview */}
                      <td className="p-4 max-w-xs">
                        <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                          {enq.message}
                        </p>
                      </td>

                      {/* Date */}
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-bold">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {new Date(enq.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="p-4">
                        <select
                          value={status}
                          onChange={(e) =>
                            setLocalStatuses((prev) => ({ ...prev, [enq.id]: e.target.value }))
                          }
                          className={`border rounded-lg px-2 py-1 text-[11px] font-bold focus:outline-none cursor-pointer ${statusConfig.color}`}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* View Button */}
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedEnquiry(enq)}
                          className="px-3 py-1.5 bg-[#0B132B] hover:bg-[#00AEEF] text-white rounded-xl font-bold text-[11px] transition-all inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enquiry Detail Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedEnquiry(null)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
          />
          <div className="relative max-w-lg w-full bg-white rounded-3xl shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-[#0B132B] to-[#1a2544]">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#00AEEF] block mb-1">
                  Service Enquiry Detail
                </span>
                <h2 className="text-lg font-black text-white">{selectedEnquiry.name}</h2>
                <p className="text-xs text-slate-400 font-medium">{selectedEnquiry.service?.name}</p>
              </div>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contact Details */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Phone</span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                    <Phone className="w-4 h-4 text-[#00AEEF]" />
                    {selectedEnquiry.phone}
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Email</span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                    <Mail className="w-4 h-4 text-[#00AEEF]" />
                    <span className="truncate text-xs">{selectedEnquiry.email}</span>
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Service</span>
                  <div className="font-bold text-slate-900 text-sm">{selectedEnquiry.service?.name}</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Submitted</span>
                  <div className="font-bold text-slate-900 text-sm">
                    {new Date(selectedEnquiry.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <span className="text-[10px] font-black uppercase text-slate-400 block mb-2">
                  Customer Message
                </span>
                <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                  {selectedEnquiry.message}
                </p>
              </div>

              {/* Linked Account */}
              {selectedEnquiry.user && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-center gap-3">
                  <User className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <span className="text-[10px] font-black uppercase text-blue-500 block">
                      Linked Customer Account
                    </span>
                    <span className="font-bold text-blue-900 text-sm">{selectedEnquiry.user.name}</span>
                    <span className="text-xs text-blue-600 block">{selectedEnquiry.user.email}</span>
                  </div>
                </div>
              )}

              {/* Status Update */}
              <div>
                <span className="text-xs font-extrabold uppercase text-slate-600 block mb-2">
                  Update Status
                </span>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((s) => {
                    const current = getStatusForEnquiry(selectedEnquiry.id);
                    return (
                      <button
                        key={s.value}
                        onClick={() =>
                          setLocalStatuses((prev) => ({ ...prev, [selectedEnquiry.id]: s.value }))
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          current === s.value
                            ? s.color + " shadow-sm"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <a
                  href={`tel:${selectedEnquiry.phone}`}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Call Now
                </a>
                <a
                  href={`mailto:${selectedEnquiry.email}`}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#00AEEF] hover:bg-[#0096D6] text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email Reply
                </a>
                <button
                  onClick={() => setSelectedEnquiry(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
