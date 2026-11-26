export const AUTH_COOKIE_NAME = "prayog_customer_session";
export const AUTH_STAFF_COOKIE_NAME = "prayog_staff_session";
export const AUTH_ADMIN_COOKIE_NAME = "prayog_admin_session";

export interface AuthSessionUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "CUSTOMER" | "ADMIN";
  customerType?: string;
  companyName?: string | null;
  gstin?: string | null;
  rewardPoints?: number;
  avatarUrl?: string;
}

export interface StaffSessionUser {
  id: string;
  name: string;
  email: string | null;
  username: string;
  role: string;
  storeId: string | null;
  storeCode?: string | null;
  storeName?: string | null;
  allowedStoreCodes?: string[];
  deviceId?: string | null;
  deviceLabel?: string | null;
  salesExecutive?: string | null;
  status: string;
}

export interface AdminSessionUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}
