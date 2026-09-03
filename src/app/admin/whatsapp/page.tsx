"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  Send,
  Settings,
  Search,
  CheckCircle2,
  Clock,
  Plus,
  Edit2,
  Trash2,
  Bot,
  FileText,
  User,
  ExternalLink,
  Smartphone,
  ShieldCheck,
  Sparkles,
  PhoneCall,
} from "lucide-react";

export interface WhatsAppTemplate {
  id: string;
  name: string;
  triggerEvent: string;
  content: string;
  status: "Approved (Meta API)" | "Pending Verification";
  variables: string[];
}

export interface WhatsAppEnquiry {
  id: string;
  customerName: string;
  mobileNumber: string;
  productName: string;
  sku: string;
  timestamp: string;
  status: "New Enquiry" | "Quotation Sent" | "Closed" | "Replied";
  messageText: string;
}

const INITIAL_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: "tpl-1",
    name: "order_confirmation_v1",
    triggerEvent: "Order Placed & Payment Confirmed",
    content:
      "Hi {{customer_name}}, thank you for your order #{{order_number}} on Prayog India! Your invoice has been generated. Track live delivery: {{tracking_url}}",
    status: "Approved (Meta API)",
    variables: ["customer_name", "order_number", "tracking_url"],
  },
  {
    id: "tpl-2",
    name: "dispatch_awb_tracking",
    triggerEvent: "Order Shipped with Tracking AWB",
    content:
      "Hello {{customer_name}}, your consignment #{{order_number}} is on the way via {{courier_name}} (AWB: {{awb_number}}). Expected arrival: {{eta_date}}.",
    status: "Approved (Meta API)",
    variables: [
      "customer_name",
      "order_number",
      "courier_name",
      "awb_number",
      "eta_date",
    ],
  },
  {
    id: "tpl-3",
    name: "out_of_stock_availability_reply",
    triggerEvent: 'Customer Clicked "Ask Availability on WhatsApp"',
    content:
      "Hi {{customer_name}}, regarding your inquiry for {{product_name}} (SKU: {{sku}}): New stock has arrived at our Ranchi hub! You can order now: {{product_url}}",
    status: "Approved (Meta API)",
    variables: ["customer_name", "product_name", "sku", "product_url"],
  },
  {
    id: "tpl-4",
    name: "walkin_tax_invoice",
    triggerEvent: "Walk-in POS In-Store Purchase",
    content:
      "Thank you for visiting Prayog India {{store_name}} Store! Your digital GST Tax Invoice #{{invoice_number}} (Total ₹{{total_amount}}) is available here: {{invoice_pdf_url}}",
    status: "Approved (Meta API)",
    variables: [
      "store_name",
      "invoice_number",
      "total_amount",
      "invoice_pdf_url",
    ],
  },
];

const INITIAL_ENQUIRIES: WhatsAppEnquiry[] = [
  {
    id: "enq-101",
    customerName: "Aman Deep",
    mobileNumber: "+91 94311 88291",
    productName: "Pixhawk 6C Autopilot Flight Controller Unit",
    sku: "PRG-UAV-601",
    timestamp: "28 Aug 2026, 16:30",
    status: "Replied",
    messageText:
      "Hi Prayog India, I am interested in Pixhawk 6C (SKU: PRG-UAV-601). Please let me know the availability and latest B2B price.",
  },
  {
    id: "enq-102",
    customerName: "Prof. S. K. Roy",
    mobileNumber: "+91 98123 55667",
    productName: "Raspberry Pi 5 Model B (8GB RAM)",
    sku: "PRG-RPI-508",
    timestamp: "28 Aug 2026, 14:15",
    status: "Quotation Sent",
    messageText:
      "Hi Prayog India, I need 20 units of Raspberry Pi 5 8GB for university lab setup. Please share quotation.",
  },
  {
    id: "enq-103",
    customerName: "Ravi Teja",
    mobileNumber: "+91 98765 00112",
    productName: "4S 14.8V 5200mAh LiPo Battery Pack",
    sku: "PRG-BAT-4S52",
    timestamp: "29 Aug 2026, 11:00",
    status: "New Enquiry",
    messageText:
      "Hi Prayog India, is this LiPo battery safe to ship to Hyderabad? Need for college drone competition.",
  },
];

export default function AdminWhatsAppPage() {
  const [templates, setTemplates] =
    useState<WhatsAppTemplate[]>(INITIAL_TEMPLATES);
  const [enquiries, setEnquiries] =
    useState<WhatsAppEnquiry[]>(INITIAL_ENQUIRIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<
    "enquiries" | "templates" | "settings"
  >("enquiries");

  // WhatsApp API Settings State
  const [whatsappPhone, setWhatsappPhone] = useState("+91 98765 43210");
  const [businessAccountId, setBusinessAccountId] =
    useState("WABA_PRAG_IND_2026");
  const [apiKey, setApiKey] = useState("EAAGk18992xza8991288aa091...");

  const handleUpdateStatus = (
    id: string,
    newStatus: WhatsAppEnquiry["status"],
  ) => {
    setEnquiries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e)),
    );
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 animate-in fade-in duration-300">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
              <MessageSquare className="w-3 h-3 text-emerald-600" /> Section 74
              · WhatsApp Business Platform Hub
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            WhatsApp Notifications &amp; Inquiries
          </h1>
          <p className="text-xs text-slate-500">
            Manage Meta Business Platform message templates for order
            notifications, dispatch AWB alerts, out-of-stock product inquiries,
            and digital POS invoices.
          </p>
        </div>
      </div>

      {/* 2. Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("enquiries")}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "enquiries"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 inline mr-1.5" />
          Customer Product Inquiries ({enquiries.length})
        </button>

        <button
          onClick={() => setActiveTab("templates")}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "templates"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Bot className="w-3.5 h-3.5 inline mr-1.5" />
          Automated Message Templates ({templates.length})
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "settings"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Settings className="w-3.5 h-3.5 inline mr-1.5" />
          API Credentials &amp; Number
        </button>
      </div>

      {/* 3. Tab 1: Customer Product Inquiries */}
      {activeTab === "enquiries" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase">
                Product Availability &amp; Price Inquiries
              </h3>
              <p className="text-xs text-slate-500">
                Customer conversations initiated via "Ask Availability on
                WhatsApp" with pre-filled SKU attributes.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400">
              {enquiries.filter((e) => e.status === "New Enquiry").length}{" "}
              Action Required
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                  <th className="pb-3">Customer &amp; Mobile</th>
                  <th className="pb-3">Product Requested</th>
                  <th className="pb-3">Inquiry Message</th>
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {enquiries.map((enq) => (
                  <tr
                    key={enq.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5">
                      <div className="font-extrabold text-slate-900">
                        {enq.customerName}
                      </div>
                      <div className="font-mono text-[10px] text-emerald-700 font-bold">
                        {enq.mobileNumber}
                      </div>
                    </td>

                    <td className="py-3.5">
                      <div className="font-bold text-slate-900">
                        {enq.productName}
                      </div>
                      <span className="font-mono text-[10px] text-slate-400 font-bold">
                        {enq.sku}
                      </span>
                    </td>

                    <td
                      className="py-3.5 text-slate-600 max-w-xs truncate"
                      title={enq.messageText}
                    >
                      {enq.messageText}
                    </td>

                    <td className="py-3.5 text-slate-400 font-mono text-[10px]">
                      {enq.timestamp}
                    </td>

                    <td className="py-3.5">
                      <select
                        value={enq.status}
                        onChange={(e) =>
                          handleUpdateStatus(enq.id, e.target.value as any)
                        }
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border focus:outline-none cursor-pointer ${
                          enq.status === "New Enquiry"
                            ? "bg-amber-100 text-amber-900 border-amber-300"
                            : enq.status === "Replied"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : "bg-blue-100 text-blue-800 border-blue-300"
                        }`}
                      >
                        <option value="New Enquiry">New Enquiry</option>
                        <option value="Replied">Replied</option>
                        <option value="Quotation Sent">Quotation Sent</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>

                    <td className="py-3.5 text-right">
                      <a
                        href={`https://wa.me/${enq.mobileNumber.replace(/\D/g, "")}?text=Hi%20${encodeURIComponent(enq.customerName)},%20regarding%20your%20inquiry%20for%20${encodeURIComponent(enq.productName)}...`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[11px] inline-flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>Chat on WA</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Tab 2: Automated Templates */}
      {activeTab === "templates" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase">
                Section 74 Pre-Approved Message Templates
              </h3>
              <p className="text-xs text-slate-500">
                Configured HSM templates for automated backend transactional
                dispatches.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-slate-900 text-xs">
                    {tpl.name}
                  </span>
                  <span className="text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                    {tpl.status}
                  </span>
                </div>
                <div className="text-[10px] font-bold text-[#00AEEF] uppercase">
                  {tpl.triggerEvent}
                </div>
                <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200/80 font-medium leading-relaxed">
                  {tpl.content}
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {tpl.variables.map((v) => (
                    <span
                      key={v}
                      className="bg-slate-200 text-slate-700 font-mono text-[9px] px-1.5 py-0.5 rounded"
                    >
                      {`{{${v}}}`}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Tab 3: Settings */}
      {activeTab === "settings" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4 max-w-xl">
          <h3 className="text-sm font-black text-slate-900 uppercase border-b border-slate-100 pb-3">
            WhatsApp Business API Credentials
          </h3>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("WhatsApp API settings saved!");
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Official WhatsApp Phone Number
              </label>
              <input
                type="tel"
                value={whatsappPhone}
                onChange={(e) => setWhatsappPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-mono font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                WhatsApp Business Account ID (WABA)
              </label>
              <input
                type="text"
                value={businessAccountId}
                onChange={(e) => setBusinessAccountId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-mono font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Permanent Meta Access Token
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-mono font-bold text-slate-900"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-wider shadow-md cursor-pointer"
              >
                Save WhatsApp Configuration
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
