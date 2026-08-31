// src/data/storeConfig.ts
// Prayog India — Physical Store Configuration for Walk-in Shopping System

export type StoreId = 'ranchi' | 'patna' | 'delhi';

export interface StoreConfig {
  id: StoreId;
  name: string;
  shortName: string;
  city: string;
  address: string;
  phone: string;
  timings: string;
  terminalKey: string;          // Activation key required on manager POS
  kioskUrl: string;             // Customer-facing kiosk URL
  accentColor: string;          // Primary brand accent for this store
  accentLight: string;          // Light bg variant
  managerDevice: string;        // Device label for manager POS
  gstin: string;
  mapUrl: string;
}

export const STORES: Record<StoreId, StoreConfig> = {
  ranchi: {
    id: 'ranchi',
    name: 'Prayog India Central Experience Hub',
    shortName: 'Ranchi Central Hub',
    city: 'Ranchi, Jharkhand',
    address: 'Plot 42, Tech Innovation Corridor, Main Road, Ranchi, JH - 834001',
    phone: '+91 98765 43210',
    timings: '10:00 AM – 8:00 PM (Open 7 Days)',
    terminalKey: 'PRG-RANCHI-POS-2026',
    kioskUrl: '/walk-in/ranchi',
    accentColor: '#00AEEF',
    accentLight: '#E0F7FC',
    managerDevice: 'TAB-RNC-01',
    gstin: '20AAGCP8845K1Z2',
    mapUrl: 'https://maps.google.com/?q=Ranchi,Jharkhand',
  },
  patna: {
    id: 'patna',
    name: 'Prayog India Robotics & STEM Branch',
    shortName: 'Patna Branch',
    city: 'Patna, Bihar',
    address: 'Boring Road Tech Plaza, Near Science College, Patna, BR - 800001',
    phone: '+91 98123 45678',
    timings: '10:30 AM – 7:30 PM (Mon – Sat)',
    terminalKey: 'PRG-PATNA-POS-2026',
    kioskUrl: '/walk-in/patna',
    accentColor: '#7C3AED',
    accentLight: '#F5F3FF',
    managerDevice: 'TAB-PAT-02',
    gstin: '10AAGCP8845K1Z3',
    mapUrl: 'https://maps.google.com/?q=Patna,Bihar',
  },
  delhi: {
    id: 'delhi',
    name: 'Prayog India NCR Innovation Center',
    shortName: 'Delhi NCR Center',
    city: 'New Delhi, NCR',
    address: 'Okhla Industrial Area Phase-III, New Delhi – 110020',
    phone: '+91 98333 44455',
    timings: '10:00 AM – 7:00 PM (Mon – Sat)',
    terminalKey: 'PRG-DELHI-POS-2026',
    kioskUrl: '/walk-in/delhi',
    accentColor: '#059669',
    accentLight: '#ECFDF5',
    managerDevice: 'TAB-DEL-03',
    gstin: '07AAGCP8845K1Z4',
    mapUrl: 'https://maps.google.com/?q=Okhla,NewDelhi',
  },
};

export const ALL_STORE_IDS: StoreId[] = ['ranchi', 'patna', 'delhi'];

// ─────────────────────────────────────────
// Walk-in Session Types (shared across kiosk and POS)
// ─────────────────────────────────────────

export type PaymentMethod = 'CASH' | 'UPI';
export type SessionStatus = 'PENDING' | 'ACCEPTED' | 'PROCESSING' | 'PAID' | 'CANCELLED';

export interface WalkInCartItem {
  productId: string;
  name: string;
  sku: string;
  image: string;
  price: number;       // Per unit price after customer type discount
  mrp: number;
  quantity: number;
}

export interface WalkInSession {
  id: string;                    // e.g. "WI-RNC-1725012345678"
  storeId: StoreId;
  status: SessionStatus;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  paymentMethod: PaymentMethod;
  items: WalkInCartItem[];
  subtotal: number;
  gstAmount: number;
  total: number;
  notes: string;
  createdAt: string;             // ISO timestamp
  updatedAt: string;
  invoiceNo?: string;
  changeAmount?: number;         // For cash: change to give back
  cashReceived?: number;
}

// localStorage key for active sessions per store
export const SESSION_STORE_KEY = 'prayog_walkin_sessions';

// BroadcastChannel name for real-time cross-tab sync
export const POS_BROADCAST_CHANNEL = 'prayog_pos_live';

// ─────────────────────────────────────────
// Utilities for session storage
// ─────────────────────────────────────────

export function getAllSessions(): WalkInSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SESSION_STORE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getStoreSessionsPending(storeId: StoreId): WalkInSession[] {
  return getAllSessions().filter(
    (s) => s.storeId === storeId && (s.status === 'PENDING' || s.status === 'ACCEPTED' || s.status === 'PROCESSING')
  );
}

export function saveSession(session: WalkInSession): void {
  if (typeof window === 'undefined') return;
  const all = getAllSessions();
  const idx = all.findIndex((s) => s.id === session.id);
  if (idx >= 0) {
    all[idx] = session;
  } else {
    all.unshift(session); // Newest first
  }
  // Keep only last 50 sessions in storage
  localStorage.setItem(SESSION_STORE_KEY, JSON.stringify(all.slice(0, 50)));
}

export function generateSessionId(storeId: StoreId): string {
  const prefix = storeId.slice(0, 3).toUpperCase();
  return `WI-${prefix}-${Date.now()}`;
}

export function generateInvoiceNo(storeId: StoreId): string {
  const prefix = storeId.slice(0, 3).toUpperCase();
  return `POS-${prefix}-${Date.now().toString().slice(-7)}`;
}
