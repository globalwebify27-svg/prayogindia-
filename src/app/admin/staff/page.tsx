'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Store, 
  Tablet, 
  Plus, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  UserPlus,
  RefreshCw,
  X,
  Building2
} from 'lucide-react';
import { INITIAL_STORES } from '@/data/storesData';

export default function AdminStaffManagementPage() {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>(INITIAL_STORES);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // New staff form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'STORE_MANAGER' | 'KIOSK_USER' | 'SUPER_ADMIN'>('STORE_MANAGER');
  const [storeId, setStoreId] = useState('');
  const [phone, setPhone] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchStaffAndStores = async () => {
    setLoading(true);
    try {
      const [staffRes, storeRes] = await Promise.all([
        fetch('/api/admin/staff'),
        fetch('/api/admin/stores'),
      ]);

      const staffData = await staffRes.json();
      const storeData = await storeRes.json();

      if (staffData.success) {
        setStaffList(staffData.data || []);
      }
      if (storeData.success && storeData.data?.length) {
        setStores(storeData.data);
        setStoreId(storeData.data[0].id || storeData.data[0].code);
      }
    } catch (err) {
      console.error('Failed to load staff list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffAndStores();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email: email || null,
          username,
          password,
          role,
          storeId: role === 'SUPER_ADMIN' ? null : storeId,
          phone,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.message || 'Failed to create staff account.');
        setSubmitting(false);
        return;
      }

      // Reset form & reload
      setShowAddModal(false);
      setName('');
      setEmail('');
      setUsername('');
      setPassword('');
      fetchStaffAndStores();
    } catch {
      setFormError('Network error while provisioning staff user.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await fetch(`/api/admin/staff/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      fetchStaffAndStores();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm('Are you sure you want to revoke and delete this staff user account?')) return;
    try {
      await fetch(`/api/admin/staff/${id}`, { method: 'DELETE' });
      fetchStaffAndStores();
    } catch (err) {
      console.error('Failed to delete staff user:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#FFC20E]" /> Super Admin Desk
            </span>
            <span className="text-slate-400 text-xs font-semibold">Staff & Device RBAC</span>
          </div>
          <h1 className="text-2xl font-black text-white">Staff Management & Store Provisioning</h1>
          <p className="text-xs text-slate-400 mt-1">
            Create Store Managers, assign store branches, and manage Kiosk credentials across all hubs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchStaffAndStores}
            disabled={loading}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-700 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-[#00AEEF] hover:bg-[#0096D6] text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-[#00AEEF]/20 cursor-pointer transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Staff Account</span>
          </button>
        </div>
      </div>

      {/* Staff User Cards / Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Staff Member</th>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Assigned Store</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-[#00AEEF] border-t-transparent rounded-full animate-spin" />
                      <span>Loading staff directory...</span>
                    </div>
                  </td>
                </tr>
              ) : staffList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No staff accounts configured.
                  </td>
                </tr>
              ) : (
                staffList.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">
                      <div>{user.name}</div>
                      {user.email && (
                        <div className="text-[11px] text-slate-400 font-normal">{user.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-[#00AEEF]">
                      @{user.username}
                    </td>
                    <td className="px-6 py-4">
                      {user.role === 'SUPER_ADMIN' ? (
                        <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">
                          <ShieldCheck className="w-3 h-3" /> Super Admin
                        </span>
                      ) : user.role === 'STORE_MANAGER' ? (
                        <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">
                          <Store className="w-3 h-3" /> Store Manager
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">
                          <Tablet className="w-3 h-3" /> Kiosk User
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user.store ? (
                        <span className="bg-slate-950 border border-slate-800 px-2 py-1 rounded text-slate-300 font-mono text-[11px]">
                          {user.store.code} • {user.store.name}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">Global (All Stores)</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(user.id, user.status)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase transition-all cursor-pointer ${
                          user.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-red-500/10 hover:text-red-400'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-emerald-500/10 hover:text-emerald-400'
                        }`}
                        title="Click to toggle status"
                      >
                        {user.status || 'ACTIVE'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.role !== 'SUPER_ADMIN' && (
                        <button
                          onClick={() => handleDeleteStaff(user.id)}
                          className="text-slate-500 hover:text-red-400 p-1 rounded-lg transition-colors cursor-pointer"
                          title="Delete Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Staff Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#00AEEF]" />
                <h2 className="text-base font-black text-white">Create Staff / Manager Account</h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Full Name / Device Label *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Kumar (or Front Kiosk)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00AEEF]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Username (Unique) *
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. ranchi_manager"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00AEEF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00AEEF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Staff Role *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00AEEF]"
                  >
                    <option value="STORE_MANAGER">STORE_MANAGER (Branch Dashboard)</option>
                    <option value="KIOSK_USER">KIOSK_USER (POS / Walk-in)</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN (Complete Access)</option>
                  </select>
                </div>

                {role !== 'SUPER_ADMIN' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Assigned Store Branch *
                    </label>
                    <select
                      value={storeId}
                      onChange={(e) => setStoreId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00AEEF]"
                    >
                      {stores.map(st => (
                        <option key={st.id || st.code} value={st.id || st.code}>
                          {st.code} — {st.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="manager@prayogindia.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00AEEF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 94311 00000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00AEEF]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#00AEEF] hover:bg-[#0096D6] text-slate-950 font-black py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-lg shadow-[#00AEEF]/20 mt-2"
              >
                {submitting ? 'Creating Account...' : 'Provision Staff Member'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
