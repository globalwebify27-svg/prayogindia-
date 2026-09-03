"use client";

import React, { useState } from "react";
import { MOCK_SUPPORT_TICKETS, SupportTicket } from "@/data/accountData";
import { createSupportTicket, addSupportMessage } from "@/lib/apiServices";
import {
  Headphones,
  Plus,
  Send,
  MessageSquare,
  CheckCircle2,
  Clock,
} from "lucide-react";

export const SupportTicketsView: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>(MOCK_SUPPORT_TICKETS);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null,
  );
  const [showCreateForm, setShowCreateForm] = useState(false);

  // New Ticket Form State
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<
    "Hardware Inquiry" | "Lab Setup" | "Order Tracking" | "Technical Support"
  >("Technical Support");
  const [message, setMessage] = useState("");

  // Reply State
  const [replyText, setReplyText] = useState("");

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createSupportTicket(subject, category, message);
    if (result.success && result.data) {
      const newTkt: SupportTicket = {
        id: result.data.id || `tkt-${Date.now()}`,
        ticketNumber: result.data.ticketNumber || `TKT-2026-OK`,
        subject: result.data.subject || subject,
        category: category as any,
        status: "Open",
        createdDate: "Just Now",
        messages: result.data.messages?.map((m: any) => ({
          sender: m.sender,
          text: m.text,
          timestamp: "Just Now",
        })) || [
          {
            sender: "Customer",
            text: message,
            timestamp: "Just Now",
          },
        ],
      };
      setTickets([newTkt, ...tickets]);
      setShowCreateForm(false);
      setSubject("");
      setMessage("");
    } else {
      alert(
        `Ticket submission response: ${result.message || "Error creating ticket."}`,
      );
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    const result = await addSupportMessage(selectedTicket.id, replyText);

    const updated = tickets.map((t) => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          status: "Open" as const,
          messages: [
            ...t.messages,
            {
              sender: "Customer" as const,
              text: replyText,
              timestamp: "Just Now",
            },
          ],
        };
      }
      return t;
    });

    setTickets(updated);
    setSelectedTicket(updated.find((t) => t.id === selectedTicket.id) || null);
    setReplyText("");
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6 text-slate-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Technical Support & Helpdesk
          </h2>
          <p className="text-xs text-slate-500">
            Submit hardware setup inquiries, sensor troubleshooting tickets, or
            order help desk requests.
          </p>
        </div>

        <button
          onClick={() => {
            setShowCreateForm(!showCreateForm);
            setSelectedTicket(null);
          }}
          className="bg-[#00AEEF] hover:bg-[#0096D6] text-white px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Support Ticket</span>
        </button>
      </div>

      {/* New Ticket Form */}
      {showCreateForm && (
        <form
          onSubmit={handleCreateTicket}
          className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4 text-xs"
        >
          <h3 className="font-extrabold text-slate-900 text-sm">
            Create New Technical Support Ticket
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Subject Title</label>
              <input
                type="text"
                required
                placeholder="e.g. ESP32 Wi-Fi Module Connectivity Issue"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-white p-2.5 rounded-xl border border-slate-200 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-white p-2.5 rounded-xl border border-slate-200 focus:outline-none font-bold"
              >
                <option value="Technical Support">Technical Support</option>
                <option value="Hardware Inquiry">Hardware Inquiry</option>
                <option value="Lab Setup">Lab Setup</option>
                <option value="Order Tracking">Order Tracking</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">
              Detailed Query / Message
            </label>
            <textarea
              required
              rows={4}
              placeholder="Describe your technical inquiry, hardware model, pin connections, or issue details..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-white p-2.5 rounded-xl border border-slate-200 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="bg-slate-900 text-white px-5 py-2 rounded-xl font-bold text-xs hover:bg-[#00AEEF]"
            >
              Submit Ticket
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="text-slate-500 font-bold hover:underline"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Selected Ticket Thread View */}
      {selectedTicket ? (
        <div className="space-y-4 border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400">
                {selectedTicket.ticketNumber}
              </span>
              <h3 className="text-base font-extrabold text-slate-900">
                {selectedTicket.subject}
              </h3>
            </div>
            <button
              onClick={() => setSelectedTicket(null)}
              className="text-xs font-bold text-[#00AEEF] hover:underline"
            >
              ← Back to All Tickets
            </button>
          </div>

          {/* Messages Feed */}
          <div className="space-y-3 bg-slate-50 border border-slate-200 p-4 rounded-2xl max-h-80 overflow-y-auto">
            {selectedTicket.messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-2xl text-xs space-y-1 max-w-xl ${
                  msg.sender === "Customer"
                    ? "bg-[#00AEEF] text-white ml-auto"
                    : "bg-white text-slate-800 border border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] opacity-80 font-bold">
                  <span>{msg.sender}</span>
                  <span>{msg.timestamp}</span>
                </div>
                <p className="leading-relaxed">{msg.text}</p>
              </div>
            ))}
          </div>

          {/* Reply Form */}
          <form onSubmit={handleSendReply} className="flex gap-2">
            <input
              type="text"
              required
              placeholder="Type your reply message to support engineers..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs focus:outline-none"
            />
            <button
              type="submit"
              className="bg-slate-900 hover:bg-[#00AEEF] text-white px-4 rounded-xl text-xs font-extrabold flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Reply</span>
            </button>
          </form>
        </div>
      ) : (
        /* Support Tickets List */
        <div className="space-y-3">
          {tickets.map((tkt) => (
            <div
              key={tkt.id}
              onClick={() => setSelectedTicket(tkt)}
              className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 flex items-center justify-between gap-4 cursor-pointer hover:border-[#00AEEF] transition-colors"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900">
                    {tkt.ticketNumber}
                  </span>
                  <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">
                    {tkt.category}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 mt-1">
                  {tkt.subject}
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Created on {tkt.createdDate}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="bg-[#E0F7FC] text-[#00AEEF] text-xs font-black px-3 py-1 rounded-full border border-[#00AEEF]/20">
                  {tkt.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
