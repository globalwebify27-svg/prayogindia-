'use client';

import React, { useState, useEffect } from 'react';
import { Headset, MessageSquare, Send, CheckCircle2, Clock } from 'lucide-react';

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTicket, setActiveTicket] = useState<any | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  const fetchTickets = () => {
    setLoading(true);
    fetch('/api/admin/support/tickets')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setTickets(data.data);
          if (data.data.length > 0 && !activeTicket) {
            setActiveTicket(data.data[0]);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !replyText.trim()) return;
    setReplying(true);

    try {
      const res = await fetch(`/api/admin/support/${activeTicket.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: replyText.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setReplyText('');
        fetchTickets();
      } else {
        alert(data.message || 'Failed to post reply');
      }
    } catch {
      alert('Network error posting reply');
    } finally {
      setReplying(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Customer Support Operations Desk</h1>
        <p className="text-xs text-slate-500 font-medium">Respond to customer technical support inquiries and hardware lab tickets</p>
      </div>

      {/* Desk Interface Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Ticket List Queue */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Headset className="w-4 h-4 text-[#00AEEF]" /> Support Ticket Queue
          </div>
          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading support desk tickets...</div>
            ) : tickets.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No support tickets found</div>
            ) : (
              tickets.map((tkt) => (
                <div
                  key={tkt.id}
                  onClick={() => setActiveTicket(tkt)}
                  className={`p-4 cursor-pointer transition-colors ${
                    activeTicket?.id === tkt.id ? 'bg-[#E0F7FC] border-l-4 border-[#00AEEF]' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-extrabold text-xs text-slate-900">{tkt.ticketNumber || tkt.id}</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-blue-100 text-blue-800">
                      {tkt.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 truncate mb-1">{tkt.subject}</h4>
                  <span className="text-[10px] text-slate-500 font-semibold">{tkt.user?.name || 'Customer'}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Conversation Detail Panel */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6 min-h-[500px] flex flex-col">
          {!activeTicket ? (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
              Select a ticket from the queue to view thread details
            </div>
          ) : (
            <>
              {/* Thread Header */}
              <div className="border-b border-slate-100 pb-4 flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-[#00AEEF] tracking-wider block">
                    {activeTicket.category || 'TECHNICAL_SUPPORT'}
                  </span>
                  <h2 className="text-base font-extrabold text-slate-900">{activeTicket.subject}</h2>
                  <span className="text-xs text-slate-500 font-semibold">
                    Customer: {activeTicket.user?.name} ({activeTicket.user?.email})
                  </span>
                </div>
                <span className="px-3 py-1 bg-slate-100 text-slate-800 font-extrabold text-xs rounded-full">
                  #{activeTicket.ticketNumber || activeTicket.id}
                </span>
              </div>

              {/* Conversation Messages */}
              <div className="flex-1 space-y-4 overflow-y-auto max-h-[350px] pr-2">
                {(!activeTicket.messages || activeTicket.messages.length === 0) ? (
                  <div className="text-xs text-slate-400 italic">No messages in thread</div>
                ) : (
                  activeTicket.messages.map((msg: any) => (
                    <div
                      key={msg.id}
                      className={`p-3.5 rounded-2xl max-w-xl text-xs ${
                        msg.sender === 'Support Desk'
                          ? 'ml-auto bg-[#00AEEF] text-white rounded-br-none'
                          : 'bg-slate-100 text-slate-800 rounded-bl-none'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1 text-[10px] opacity-80 font-bold">
                        <span>{msg.sender}</span>
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="font-medium whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Admin Reply Box */}
              <form onSubmit={handleSendReply} className="pt-4 border-t border-slate-100 space-y-3">
                <textarea
                  rows={3}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type support desk response..."
                  className="w-full border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-[#00AEEF]"
                />
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-400">Replies trigger instant notification to customer</span>
                  <button
                    type="submit"
                    disabled={replying}
                    className="bg-[#00AEEF] hover:bg-[#0096D6] text-white px-5 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{replying ? 'Sending...' : 'Post Reply'}</span>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

      </div>

    </div>
  );
}
