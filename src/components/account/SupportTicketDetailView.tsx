"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MOCK_SUPPORT_TICKETS, SupportTicket } from "@/data/accountData";
import {
  Headphones,
  Plus,
  Send,
  MessageSquare,
  CheckCircle2,
  ArrowLeft,
  Clock,
} from "lucide-react";

interface SupportTicketDetailProps {
  ticketId: string;
}

export const SupportTicketDetailView: React.FC<SupportTicketDetailProps> = ({
  ticketId,
}) => {
  const [tickets, setTickets] = useState<SupportTicket[]>(MOCK_SUPPORT_TICKETS);
  const ticket =
    tickets.find((t) => t.id === ticketId || t.ticketNumber === ticketId) ||
    tickets[0];

  const [replyText, setReplyText] = useState("");

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const updated = tickets.map((t) => {
      if (t.id === ticket.id) {
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
    setReplyText("");
  };

  const getStatusBadge = (status: SupportTicket["status"]) => {
    switch (status) {
      case "Open":
        return "bg-blue-50 text-blue-600 border-blue-200";
      case "In Progress":
        return "bg-amber-50 text-amber-600 border-amber-200";
      case "Waiting for Customer":
        return "bg-purple-50 text-purple-600 border-purple-200";
      case "Resolved":
        return "bg-emerald-50 text-emerald-600 border-emerald-200";
      case "Closed":
        return "bg-slate-100 text-slate-600 border-slate-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6 text-slate-900 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <Link
            href="/account/support"
            className="text-xs font-bold text-[#00AEEF] hover:underline flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Support Tickets
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900">
              {ticket.ticketNumber}
            </h1>
            <span
              className={`text-xs font-black px-3 py-0.5 rounded-full border ${getStatusBadge(ticket.status)}`}
            >
              {ticket.status}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Category: {ticket.category} • Created {ticket.createdDate}
          </p>
        </div>
      </div>

      {/* Ticket Subject */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
        <span className="text-[10px] font-black uppercase text-slate-400 block">
          Subject Title
        </span>
        <h3 className="text-base font-extrabold text-slate-900">
          {ticket.subject}
        </h3>
      </div>

      {/* Messages Conversation Thread */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
          Conversation Log
        </h3>

        <div className="space-y-3 bg-slate-50 border border-slate-200 p-4 rounded-3xl max-h-96 overflow-y-auto">
          {ticket.messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl text-xs space-y-1.5 max-w-xl ${
                msg.sender === "Customer"
                  ? "bg-[#00AEEF] text-white ml-auto"
                  : "bg-white text-slate-800 border border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-bold opacity-80 border-b border-white/20 pb-1">
                <span>{msg.sender}</span>
                <span>{msg.timestamp}</span>
              </div>
              <p className="leading-relaxed">{msg.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Reply Form */}
      <form onSubmit={handleSendReply} className="space-y-3 pt-2">
        <label className="font-bold text-xs text-slate-700 block">
          Reply to Support Desk
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            required
            placeholder="Type your message reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs focus:outline-none font-medium"
          />
          <button
            type="submit"
            className="bg-slate-900 hover:bg-[#00AEEF] text-white px-5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
            <span>Send Reply</span>
          </button>
        </div>
      </form>
    </div>
  );
};
