'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Printer, 
  Send, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Download, 
  Trash2, 
  Search,
  ArrowRight,
  ShieldCheck,
  Eye,
  CreditCard,
  Edit3,
  Save
} from 'lucide-react';
import { PRODUCTS, Product } from '@/data/mockData';

export type DocStage = 'QUOTATION' | 'PROFORMA_INVOICE' | 'PAYMENT_RECEIVED' | 'TAX_INVOICE';

export interface QuotationItem {
  productId: string;
  name: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  discountPct: number;
}

export interface QuotationDoc {
  id: string;
  quoteNumber: string;
  institutionName: string;
  contactPerson: string;
  email: string;
  phone: string;
  gstin: string;
  status: DocStage;
  date: string;
  validUntil: string;
  items: QuotationItem[];
  gstRate: number; // e.g. 18%
  notes: string;
  terms: string;
  paymentReference?: string;
}

const MOCK_QUOTATIONS: QuotationDoc[] = [
  {
    id: 'q-101',
    quoteNumber: 'PRG-QT-2026-0042',
    institutionName: 'IIT Delhi Robotics & AI Research Lab',
    contactPerson: 'Dr. Rajesh Vardhan',
    email: 'robotics.lab@iitd.ac.in',
    phone: '9876543210',
    gstin: '07AAAAI0000A1Z5',
    status: 'PROFORMA_INVOICE',
    date: '24 Aug 2026',
    validUntil: '24 Sep 2026',
    gstRate: 18,
    items: [
      { productId: 'rpi-5-8gb', name: 'Raspberry Pi 5 Model B (8GB RAM)', sku: 'PRG-RPI-508', unitPrice: 8999, quantity: 10, discountPct: 5 },
      { productId: 'pixhawk-fc', name: 'Pixhawk 6C Autopilot Flight Controller Unit', sku: 'PRG-UAV-601', unitPrice: 14500, quantity: 5, discountPct: 8 },
    ],
    notes: 'Institutional research grant procurement with 1-year hardware warranty support.',
    terms: '1. 100% Advance payment via NEFT/RTGS for dispatch.\n2. Delivery within 5 working days from PO confirmation.\n3. Goods once sold are covered under Prayog 1-Year OEM replacement warranty.',
    paymentReference: 'NEFT-IITD-8899201',
  },
  {
    id: 'q-102',
    quoteNumber: 'PRG-QT-2026-0043',
    institutionName: 'Delhi Public School STEM Innovation Wing',
    contactPerson: 'Vikram Singh',
    email: 'stem@dpschool.org',
    phone: '9812345678',
    gstin: '20BBBBB1111B2Z6',
    status: 'QUOTATION',
    date: '26 Aug 2026',
    validUntil: '26 Sep 2026',
    gstRate: 18,
    items: [
      { productId: 'prayog-stem-robot-kit', name: 'PRAYOG Dilay-Bot 4WD Autonomous Robotics Kit', sku: 'PRG-KIT-100', unitPrice: 4999, quantity: 25, discountPct: 10 },
      { productId: 'ard-uno-r3', name: 'Arduino UNO R3 Official Board', sku: 'PRG-ARD-001', unitPrice: 1499, quantity: 50, discountPct: 12 },
    ],
    notes: 'Includes teacher training workshop vouchers and lab assembly curriculum.',
    terms: '1. Prices valid for 30 days from quote date.\n2. GST 18% as applicable for educational STEM hardware kits.\n3. Onsite lab installation support included in Ranchi / Delhi NCR.',
  },
];

const STAGES: { stage: DocStage; label: string; subtitle: string }[] = [
  { stage: 'QUOTATION', label: '1. QUOTATION', subtitle: 'Draft / Editable' },
  { stage: 'PROFORMA_INVOICE', label: '2. PROFORMA INVOICE', subtitle: 'Payment Notice' },
  { stage: 'PAYMENT_RECEIVED', label: '3. PAYMENT RECEIVED', subtitle: 'Verification' },
  { stage: 'TAX_INVOICE', label: '4. TAX INVOICE', subtitle: 'Final GST Invoice' },
];

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<QuotationDoc[]>(MOCK_QUOTATIONS);
  const [selectedDoc, setSelectedDoc] = useState<QuotationDoc | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isEditingDoc, setIsEditingDoc] = useState(false);

  // New Quote Form State
  const [instName, setInstName] = useState('');
  const [person, setPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gstinInput, setGstinInput] = useState('');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState(
    '1. 100% Advance payment against Proforma Invoice.\n2. Delivery within 3-5 days via Surface / Air Express.\n3. Standard 1-Year OEM warranty.'
  );
  const [gstRate, setGstRate] = useState(18);
  const [items, setItems] = useState<QuotationItem[]>([
    { productId: PRODUCTS[0].id, name: PRODUCTS[0].name, sku: PRODUCTS[0].sku, unitPrice: PRODUCTS[0].price, quantity: 5, discountPct: 5 },
    { productId: PRODUCTS[1].id, name: PRODUCTS[1].name, sku: PRODUCTS[1].sku, unitPrice: PRODUCTS[1].price, quantity: 2, discountPct: 0 }
  ]);

  const handleAddItem = (product: Product) => {
    setItems(prev => [
      ...prev,
      { productId: product.id, name: product.name, sku: product.sku, unitPrice: product.price, quantity: 1, discountPct: 0 }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: keyof QuotationItem, val: any) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: val } : item));
  };

  const handleCreateQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    const newDoc: QuotationDoc = {
      id: `q-${Date.now()}`,
      quoteNumber: `PRG-QT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      institutionName: instName || 'Apex Institute of Technology',
      contactPerson: person || 'Procurement Officer',
      email: email || 'procure@institution.edu',
      phone: phone || '9876543210',
      gstin: gstinInput || '20AAAAA0000A1Z5',
      status: 'QUOTATION',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      validUntil: new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      gstRate: gstRate || 18,
      items: [...items],
      notes: notes || 'Official Prayog India Institutional Quotation.',
      terms: terms || 'Standard academic procurement terms.',
    };

    setQuotations([newDoc, ...quotations]);
    setSelectedDoc(newDoc);
    setIsCreatingNew(false);
  };

  const handleAdvanceStatus = (docId: string) => {
    setQuotations(prev => prev.map(doc => {
      if (doc.id === docId) {
        let nextStatus: DocStage = 'PROFORMA_INVOICE';
        if (doc.status === 'QUOTATION') nextStatus = 'PROFORMA_INVOICE';
        else if (doc.status === 'PROFORMA_INVOICE') nextStatus = 'PAYMENT_RECEIVED';
        else if (doc.status === 'PAYMENT_RECEIVED') nextStatus = 'TAX_INVOICE';
        else nextStatus = 'TAX_INVOICE';

        const updated: QuotationDoc = { ...doc, status: nextStatus };
        if (selectedDoc?.id === docId) setSelectedDoc(updated);
        return updated;
      }
      return doc;
    }));
  };

  const calcDocSubtotal = (docItems: QuotationItem[]) => {
    return docItems.reduce((sum, item) => {
      const discountedUnit = item.unitPrice * (1 - item.discountPct / 100);
      return sum + discountedUnit * item.quantity;
    }, 0);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="bg-[#0F172A] text-white p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="bg-[#00AEEF] text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
            SECTION 7: B2B SALES PIPELINE
          </span>
          <h1 className="text-2xl font-black text-white mt-1">Institutional Quotation & Sales Pipeline</h1>
          <p className="text-xs text-slate-400">Manage quotation drafts, proforma invoices, payment verification, and GST tax invoices.</p>
        </div>

        <button
          onClick={() => { setIsCreatingNew(true); setSelectedDoc(null); }}
          className="bg-[#00AEEF] hover:bg-[#0096D6] text-white text-xs font-extrabold px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Quotation</span>
        </button>
      </div>

      {/* Section 7 Lifecycle Stepper Preview */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs overflow-x-auto">
        <div className="flex items-center justify-between min-w-[700px] gap-2">
          {STAGES.map((s, idx) => (
            <React.Fragment key={s.stage}>
              <div className="flex-1 bg-slate-50 border border-slate-200 p-3 rounded-2xl text-center space-y-0.5">
                <span className="text-[11px] font-black text-slate-900 uppercase block">{s.label}</span>
                <span className="text-[10px] text-slate-500 font-medium block">{s.subtitle}</span>
              </div>
              {idx < STAGES.length - 1 && (
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Content Area: Create Form / Document Viewer / Master List */}
      {isCreatingNew ? (
        /* Create New Quotation Form */
        <form onSubmit={handleCreateQuotation} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-black uppercase text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#00AEEF]" /> Create Institutional Quotation Draft
            </h2>
            <button
              type="button"
              onClick={() => setIsCreatingNew(false)}
              className="text-xs text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
            >
              Cancel
            </button>
          </div>

          {/* Client Details */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Institution Name</label>
              <input
                type="text"
                required
                placeholder="e.g. IIT Delhi Research Lab"
                value={instName}
                onChange={(e) => setInstName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-[#00AEEF]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Contact Person</label>
              <input
                type="text"
                placeholder="Dr. Rajesh Vardhan"
                value={person}
                onChange={(e) => setPerson(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-[#00AEEF]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">GSTIN (15 Digits)</label>
              <input
                type="text"
                placeholder="07AAAAI0000A1Z5"
                value={gstinInput}
                onChange={(e) => setGstinInput(e.target.value.toUpperCase())}
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-mono font-bold text-slate-800 uppercase focus:outline-none focus:border-[#00AEEF]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Applicable GST %</label>
              <select
                value={gstRate}
                onChange={(e) => setGstRate(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-[#00AEEF]"
              >
                <option value={18}>18% GST (Standard Hardware & Electronics)</option>
                <option value={12}>12% GST (Educational Kits Concession)</option>
                <option value={5}>5% GST (Special Research Category)</option>
                <option value={0}>0% GST (Tax Exempt SEZ / Export)</option>
              </select>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-slate-900">Line Items & Hardware Pricing</h3>
              <div className="flex gap-2">
                {PRODUCTS.slice(0, 4).map((prod) => (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => handleAddItem(prod)}
                    className="bg-slate-100 hover:bg-[#E0F7FC] hover:text-[#00AEEF] text-[10px] font-bold px-2.5 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                  >
                    + {prod.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <div className="bg-slate-50 p-3 font-bold text-slate-500 grid grid-cols-12 gap-2 text-[11px] uppercase">
                <span className="col-span-5">Product Details</span>
                <span className="col-span-2 text-right">Unit Rate (₹)</span>
                <span className="col-span-2 text-center">Quantity</span>
                <span className="col-span-2 text-right">Discount %</span>
                <span className="col-span-1 text-center">Action</span>
              </div>

              {items.map((item, idx) => (
                <div key={idx} className="p-3 grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <h4 className="font-extrabold text-slate-900 truncate">{item.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{item.sku}</span>
                  </div>
                  <div className="col-span-2 text-right">
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => handleUpdateItem(idx, 'unitPrice', Number(e.target.value))}
                      className="w-24 bg-slate-50 p-1.5 rounded-lg text-right font-bold border border-slate-200"
                    />
                  </div>
                  <div className="col-span-2 text-center">
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => handleUpdateItem(idx, 'quantity', Number(e.target.value))}
                      className="w-16 bg-slate-50 p-1.5 rounded-lg text-center font-bold border border-slate-200"
                    />
                  </div>
                  <div className="col-span-2 text-right">
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={item.discountPct}
                      onChange={(e) => handleUpdateItem(idx, 'discountPct', Number(e.target.value))}
                      className="w-16 bg-slate-50 p-1.5 rounded-lg text-right font-bold border border-slate-200"
                    />
                  </div>
                  <div className="col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-slate-400 hover:text-red-500 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes & Terms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Custom Notes / Scope of Work</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Includes teacher training workshop vouchers and lab assembly manual sets..."
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Terms & Conditions</label>
              <textarea
                rows={3}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                placeholder="Payment terms, delivery timeline, warranty..."
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium text-slate-800 font-mono text-[11px]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#00AEEF] hover:bg-[#0096D6] text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer active:scale-95"
          >
            Create Official Quotation Document
          </button>
        </form>
      ) : selectedDoc ? (
        /* Document Detail & Printable Letterhead Preview */
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl space-y-6 text-slate-900 animate-in fade-in duration-200">
          
          {/* Status Progression Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-black uppercase px-3 py-1 rounded-full ${
                selectedDoc.status === 'TAX_INVOICE'
                  ? 'bg-emerald-100 text-emerald-800'
                  : selectedDoc.status === 'PAYMENT_RECEIVED'
                  ? 'bg-purple-100 text-purple-800'
                  : selectedDoc.status === 'PROFORMA_INVOICE'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {selectedDoc.status.replace('_', ' ')}
              </span>
              <span className="font-mono font-bold text-slate-500 text-xs">{selectedDoc.quoteNumber}</span>
            </div>

            <div className="flex items-center gap-2">
              {selectedDoc.status !== 'TAX_INVOICE' && (
                <button
                  onClick={() => handleAdvanceStatus(selectedDoc.id)}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                >
                  <span>
                    Advance to {
                      selectedDoc.status === 'QUOTATION' ? 'Proforma Invoice' : 
                      selectedDoc.status === 'PROFORMA_INVOICE' ? 'Payment Received' : 'Tax Invoice (Final GST)'
                    }
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#FFC20E]" />
                </button>
              )}

              <button
                onClick={() => window.print()}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Export Official PDF
              </button>

              <button
                onClick={() => setSelectedDoc(null)}
                className="text-xs text-slate-400 hover:text-slate-700 font-bold ml-2 cursor-pointer"
              >
                ✕ Close
              </button>
            </div>
          </div>

          {/* Official Letterhead Printable Area */}
          <div id="quotation-print-sheet" className="p-8 border border-slate-200 rounded-3xl bg-slate-50/50 space-y-6 font-sans shadow-inner">
            
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-wide">PRAYOG INDIA</h2>
                <p className="text-xs text-slate-500 font-medium">Official Robotics, UAV & STEM Institutional Solutions Provider</p>
                <p className="text-[11px] text-slate-400 font-mono">Ranchi Central Hub • GSTIN: 20AABCP1234F1Z9 • Email: b2b@prayogindia.in</p>
              </div>

              <div className="text-right text-xs font-mono">
                <span className="font-black text-slate-900 block text-base">{selectedDoc.quoteNumber}</span>
                <span className="text-slate-500 block">Issue Date: {selectedDoc.date}</span>
                <span className="text-slate-500 block">Valid Until: {selectedDoc.validUntil}</span>
              </div>
            </div>

            {/* Bill To Block */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-xs space-y-1">
              <span className="text-[10px] font-black uppercase text-[#00AEEF]">Billed / Quoted Institution:</span>
              <h3 className="font-extrabold text-slate-900 text-base">{selectedDoc.institutionName}</h3>
              <p className="text-slate-600">Attn: {selectedDoc.contactPerson} ({selectedDoc.phone} • {selectedDoc.email})</p>
              <p className="text-slate-500 font-mono text-[11px]">GSTIN: <strong>{selectedDoc.gstin}</strong></p>
            </div>

            {/* Line Items Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white text-xs">
              <table className="w-full text-left divide-y divide-slate-200">
                <thead className="bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-wider">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Hardware Description</th>
                    <th className="p-3 text-right">Unit Rate</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Disc %</th>
                    <th className="p-3 text-right">Taxable Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedDoc.items.map((it, idx) => {
                    const net = it.unitPrice * (1 - it.discountPct / 100) * it.quantity;
                    return (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                        <td className="p-3">
                          <span className="font-extrabold text-slate-900 block">{it.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">SKU: {it.sku}</span>
                        </td>
                        <td className="p-3 text-right font-mono">₹{it.unitPrice.toLocaleString()}</td>
                        <td className="p-3 text-center font-bold">{it.quantity}</td>
                        <td className="p-3 text-right font-bold text-emerald-600">{it.discountPct}%</td>
                        <td className="p-3 text-right font-extrabold text-slate-900 font-mono">₹{net.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Totals & Signature */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2">
              <div className="text-xs text-slate-600 max-w-sm space-y-2 flex-1">
                <div>
                  <p className="font-bold text-slate-800">Custom Notes & Remarks:</p>
                  <p className="text-[11px] leading-relaxed text-slate-600">{selectedDoc.notes}</p>
                </div>
                <div>
                  <p className="font-bold text-slate-800">Terms & Conditions:</p>
                  <pre className="text-[10px] whitespace-pre-wrap font-sans text-slate-500 bg-white p-2.5 rounded-xl border border-slate-200">
                    {selectedDoc.terms}
                  </pre>
                </div>
                <p className="text-[10px] text-slate-400 pt-1">
                  Authorized Signatory: Prayog India Institutional Procurement & B2B Division
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 w-72 space-y-2 text-xs">
                {(() => {
                  const sub = calcDocSubtotal(selectedDoc.items);
                  const gst = Math.round(sub * (selectedDoc.gstRate / 100));
                  const total = sub + gst;
                  return (
                    <>
                      <div className="flex justify-between text-slate-500">
                        <span>Taxable Amount:</span>
                        <span className="font-mono">₹{sub.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>GST ({selectedDoc.gstRate}%):</span>
                        <span className="font-mono">₹{gst.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-base font-black text-slate-900 pt-1.5 border-t border-slate-200">
                        <span>Grand Total:</span>
                        <span className="text-[#00AEEF] font-mono">₹{total.toLocaleString()}</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>

        </div>
      ) : (
        /* Quotation Master List */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xs font-black uppercase text-slate-900">Active B2B Sales Document Pipeline</h2>
            <span className="text-xs text-slate-400 font-bold">{quotations.length} records</span>
          </div>

          <div className="divide-y divide-slate-100">
            {quotations.map((doc) => {
              const sub = calcDocSubtotal(doc.items);
              const total = Math.round(sub * (1 + doc.gstRate / 100));

              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-slate-900 text-xs">{doc.quoteNumber}</span>
                      <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        doc.status === 'TAX_INVOICE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : doc.status === 'PAYMENT_RECEIVED'
                          ? 'bg-purple-100 text-purple-800'
                          : doc.status === 'PROFORMA_INVOICE'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {doc.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{doc.institutionName}</h3>
                    <p className="text-xs text-slate-500">{doc.items.length} hardware items • Attn: {doc.contactPerson}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-sm font-black text-slate-900 block font-mono">₹{total.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-400 block font-medium">Valid until {doc.validUntil}</span>
                    </div>
                    <button className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-[#00AEEF] hover:text-white flex items-center justify-center transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
