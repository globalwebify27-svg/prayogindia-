import { cookies } from "next/headers";
import { StaffRole, StaffStatus } from "@prisma/client";

export interface StaffSessionUser {
  id: string;
  name: string;
  email: string | null;
  username: string;
  role: StaffRole; // 'SUPER_ADMIN' | 'REGIONAL_MANAGER' | 'STORE_MANAGER' | 'POS_CASHIER' | 'KIOSK_USER'
  storeId: string | null;
  storeCode?: string | null;
  storeName?: string | null;
  allowedStoreCodes?: string[]; // For REGIONAL_MANAGER with MULTI_STORE access
  deviceId?: string | null;
  deviceLabel?: string | null;
  status: StaffStatus;
}

export const AUTH_STAFF_COOKIE_NAME = "prayog_staff_session";

/**
 * Fallback Mock staff users in dev when running without active DB
 */
export const MOCK_STAFF_USERS: Record<string, StaffSessionUser> = {
  superadmin: {
    id: "staff-superadmin",
    name: "System Administrator",
    email: "admin@prayogindia.com",
    username: "superadmin",
    role: "SUPER_ADMIN" as StaffRole,
    storeId: null,
    deviceId: "DEV-ADMIN-01",
    deviceLabel: "Admin Console",
    status: "ACTIVE" as StaffStatus,
  },
  regional_east: {
    id: "staff-regional-east",
    name: "East Region Manager (Ranchi + Patna)",
    email: "regional.east@prayogindia.com",
    username: "regional_east",
    role: "REGIONAL_MANAGER" as StaffRole,
    storeId: "str-ranchi-01",
    storeCode: "RANCHI",
    allowedStoreCodes: ["RANCHI", "PATNA"],
    storeName: "East Regional Operations",
    deviceId: "TAB-REG-01",
    deviceLabel: "Regional Operations Tablet",
    status: "ACTIVE" as StaffStatus,
  },
  ranchi_manager: {
    id: "staff-ranchi-mgr",
    name: "Abhishek Kumar",
    email: "ranchi.manager@prayogindia.com",
    username: "ranchi_manager",
    role: "STORE_MANAGER" as StaffRole,
    storeId: "str-ranchi-01",
    storeCode: "RANCHI",
    storeName: "Prayog India Ranchi Main Branch & Central Hub",
    deviceId: "TAB-RNC-MGR-01",
    deviceLabel: "Ranchi Manager Terminal",
    status: "ACTIVE" as StaffStatus,
  },
  ranchi_pos: {
    id: "staff-ranchi-pos",
    name: "Ranchi POS Cashier",
    email: "ranchi.pos@prayogindia.com",
    username: "ranchi_pos",
    role: "POS_CASHIER" as StaffRole,
    storeId: "str-ranchi-01",
    storeCode: "RANCHI",
    storeName: "Prayog India Ranchi Main Branch & Central Hub",
    deviceId: "POS-RNC-01",
    deviceLabel: "Ranchi POS Terminal 1",
    status: "ACTIVE" as StaffStatus,
  },
  patna_manager: {
    id: "staff-patna-mgr",
    name: "Jay Prakash",
    email: "patna.manager@prayogindia.com",
    username: "patna_manager",
    role: "STORE_MANAGER" as StaffRole,
    storeId: "str-patna-02",
    storeCode: "PATNA",
    storeName: "Prayog India Patna Robotics & STEM Branch",
    deviceId: "TAB-PAT-MGR-01",
    deviceLabel: "Patna Manager Terminal",
    status: "ACTIVE" as StaffStatus,
  },
  patna_pos: {
    id: "staff-patna-pos",
    name: "Patna POS Cashier",
    email: "patna.pos@prayogindia.com",
    username: "patna_pos",
    role: "POS_CASHIER" as StaffRole,
    storeId: "str-patna-02",
    storeCode: "PATNA",
    storeName: "Prayog India Patna Robotics & STEM Branch",
    deviceId: "POS-PAT-01",
    deviceLabel: "Patna POS Terminal 1",
    status: "ACTIVE" as StaffStatus,
  },
  delhi_manager: {
    id: "staff-delhi-mgr",
    name: "Siddharth Varma",
    email: "delhi.manager@prayogindia.com",
    username: "delhi_manager",
    role: "STORE_MANAGER" as StaffRole,
    storeId: "str-delhi-03",
    storeCode: "DELHI",
    storeName: "Prayog India NCR Innovation Center",
    deviceId: "TAB-DEL-MGR-01",
    deviceLabel: "Delhi Manager Terminal",
    status: "ACTIVE" as StaffStatus,
  },
  ranchi_kiosk: {
    id: "staff-ranchi-kiosk",
    name: "Ranchi Tablet (Store Shopping Device #1)",
    email: null,
    username: "ranchi_kiosk",
    role: "KIOSK_USER" as StaffRole,
    storeId: "str-ranchi-01",
    storeCode: "RANCHI",
    storeName: "Prayog India Ranchi Main Branch & Central Hub",
    deviceId: "TAB-RNC-KIOSK-01",
    deviceLabel: "Ranchi Shopping Tablet",
    status: "ACTIVE" as StaffStatus,
  },
  patna_kiosk: {
    id: "staff-patna-kiosk",
    name: "Patna Tablet (Store Shopping Device #1)",
    email: null,
    username: "patna_kiosk",
    role: "KIOSK_USER" as StaffRole,
    storeId: "str-patna-02",
    storeCode: "PATNA",
    storeName: "Prayog India Patna Robotics & STEM Branch",
    deviceId: "TAB-PAT-KIOSK-01",
    deviceLabel: "Patna Shopping Tablet",
    status: "ACTIVE" as StaffStatus,
  },
  delhi_kiosk: {
    id: "staff-delhi-kiosk",
    name: "Delhi Tablet (Store Shopping Device #1)",
    email: null,
    username: "delhi_kiosk",
    role: "KIOSK_USER" as StaffRole,
    storeId: "str-delhi-03",
    storeCode: "DELHI",
    storeName: "Prayog India NCR Innovation Center",
    deviceId: "TAB-DEL-KIOSK-01",
    deviceLabel: "Delhi Shopping Tablet",
    status: "ACTIVE" as StaffStatus,
  },
  mumbai_kiosk: {
    id: "staff-mumbai-kiosk",
    name: "Mumbai Tablet (Store Shopping Device #1)",
    email: null,
    username: "mumbai_kiosk",
    role: "KIOSK_USER" as StaffRole,
    storeId: "str-mumbai-04",
    storeCode: "MUMBAI",
    storeName: "Prayog India Western Robotics Center",
    deviceId: "TAB-BOM-KIOSK-01",
    deviceLabel: "Mumbai Shopping Tablet",
    status: "ACTIVE" as StaffStatus,
  },
};

/**
 * Server-side Helper: Extract & Verify Authenticated Staff Session
 */
export async function getAuthenticatedStaff(): Promise<StaffSessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(AUTH_STAFF_COOKIE_NAME);

  if (!sessionCookie?.value) return null;

  try {
    const user: StaffSessionUser = JSON.parse(sessionCookie.value);
    if (!user || !user.role || !user.username) {
      return null;
    }

    if (user.status && user.status !== "ACTIVE") {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

/**
 * Guard Helper: Verify user has one of the allowed roles
 */
export function hasRequiredRole(
  user: StaffSessionUser,
  ...allowedRoles: StaffRole[]
): boolean {
  return allowedRoles.includes(user.role);
}

/**
 * Strict Multi-Store Access Guard:
 * - SUPER_ADMIN has global access (ALL_STORES)
 * - REGIONAL_MANAGER has MULTI_STORE access matching their allowedStoreCodes
 * - STORE_MANAGER, POS_CASHIER, and KIOSK_USER have SINGLE_STORE access strictly matching their assigned storeId / storeCode
 */
export function hasStoreAccess(
  user: StaffSessionUser,
  targetStoreId?: string | null,
): boolean {
  if (user.role === "SUPER_ADMIN") {
    return true;
  }

  if (!targetStoreId) {
    return !!user.storeId;
  }

  const targetUpper = targetStoreId.toUpperCase();

  // Regional Manager Multi-Store Check
  if (user.role === "REGIONAL_MANAGER") {
    if (
      user.allowedStoreCodes?.map((c) => c.toUpperCase()).includes(targetUpper)
    ) {
      return true;
    }
    return (
      user.storeCode?.toUpperCase() === targetUpper ||
      user.storeId === targetStoreId
    );
  }

  // Single Store Staff Check
  if (!user.storeId) {
    return false;
  }

  return (
    user.storeId === targetStoreId ||
    user.storeCode?.toUpperCase() === targetUpper ||
    targetStoreId.toLowerCase().includes(user.storeCode?.toLowerCase() || "___")
  );
}

/**
 * Sanitize Staff User object for session cookie or response payload
 */
export function sanitizeStaffUser(user: {
  id: string;
  name: string;
  email?: string | null;
  username: string;
  role: StaffRole;
  storeId?: string | null;
  store?: { code?: string; name?: string } | null;
  status?: StaffStatus;
}): StaffSessionUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email || null,
    username: user.username,
    role: user.role,
    storeId: user.storeId || null,
    storeCode: user.store?.code || null,
    storeName: user.store?.name || null,
    status: user.status || "ACTIVE",
  };
}
