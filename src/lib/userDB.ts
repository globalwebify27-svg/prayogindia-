export interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  companyName?: string;
  gstin?: string;
  rewardPoints: number;
  customerType: "Registered Customer" | "B2B Customer" | "B2C Customer";
  status?: "ACTIVE" | "BLOCKED";
  emailVerified?: boolean;
  mobileVerified?: boolean;
  createdAt: string;
}

export interface AuthIdentityRecord {
  id: string;
  userId: string;
  provider: "mobile" | "email" | "google";
  providerUserId: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddressRecord {
  id: string;
  userId: string;
  name: string;
  phone: string;
  street: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  type: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SessionRecord {
  id: string;
  userId: string;
  refreshTokenHash?: string;
  deviceInfo?: string;
  expiresAt: string;
  lastUsedAt?: string;
  createdAt: string;
}

// Next.js hot-reload safe global singleton store
const globalForUserDB = globalThis as unknown as {
  prayogUsers: Map<string, UserRecord> | undefined;
  prayogIdentities: Map<string, AuthIdentityRecord> | undefined;
  prayogAddresses: Map<string, AddressRecord[]> | undefined;
  prayogSessions: Map<string, SessionRecord[]> | undefined;
};

export const GLOBAL_USERS =
  globalForUserDB.prayogUsers ?? new Map<string, UserRecord>();
export const GLOBAL_IDENTITIES =
  globalForUserDB.prayogIdentities ?? new Map<string, AuthIdentityRecord>();
export const GLOBAL_ADDRESSES =
  globalForUserDB.prayogAddresses ?? new Map<string, AddressRecord[]>();
export const GLOBAL_SESSIONS =
  globalForUserDB.prayogSessions ?? new Map<string, SessionRecord[]>();

if (process.env.NODE_ENV !== "production") {
  globalForUserDB.prayogUsers = GLOBAL_USERS;
  globalForUserDB.prayogIdentities = GLOBAL_IDENTITIES;
  globalForUserDB.prayogAddresses = GLOBAL_ADDRESSES;
  globalForUserDB.prayogSessions = GLOBAL_SESSIONS;
}

function indexUser(user: UserRecord) {
  GLOBAL_USERS.set(user.id, user);
  if (user.email) {
    GLOBAL_USERS.set(user.email.toLowerCase().trim(), user);
  }
  if (user.phone) {
    const rawPhone = user.phone.replace(/\D/g, "");
    GLOBAL_USERS.set(rawPhone, user);
    if (rawPhone.length >= 10) {
      GLOBAL_USERS.set(rawPhone.slice(-10), user);
    }
  }
}

export const UserDB = {
  findByEmailOrPhone: (identifier: string): UserRecord | undefined => {
    const clean = identifier.trim().toLowerCase();
    const cleanDigits = clean.replace(/\D/g, "");

    // 1. Direct key match (email or full string)
    let found = GLOBAL_USERS.get(clean);
    if (found) return found;

    // 2. Exact phone digits match (or 10-digit suffix)
    if (cleanDigits.length >= 10) {
      found =
        GLOBAL_USERS.get(cleanDigits) ||
        GLOBAL_USERS.get(cleanDigits.slice(-10));
      if (found) return found;
    }

    // 3. Scan all registered users
    for (const user of GLOBAL_USERS.values()) {
      if (user.email && user.email.toLowerCase().trim() === clean) return user;
      if (user.phone) {
        const userPhoneDigits = user.phone.replace(/\D/g, "");
        if (
          cleanDigits.length >= 10 &&
          (userPhoneDigits === cleanDigits ||
            userPhoneDigits.endsWith(cleanDigits.slice(-10)))
        ) {
          return user;
        }
      }
    }

    return undefined;
  },

  exists: (email: string, phone: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.replace(/\D/g, "");

    const existingByEmail = GLOBAL_USERS.get(cleanEmail);
    if (existingByEmail && existingByEmail.passwordHash !== "GUEST_ACCOUNT_NO_PASSWORD") {
      return true;
    }

    if (cleanPhone.length >= 10) {
      const existingByPhone =
        GLOBAL_USERS.get(cleanPhone) || GLOBAL_USERS.get(cleanPhone.slice(-10));
      if (existingByPhone && existingByPhone.passwordHash !== "GUEST_ACCOUNT_NO_PASSWORD") {
        return true;
      }
    }

    for (const user of GLOBAL_USERS.values()) {
      if (user.passwordHash === "GUEST_ACCOUNT_NO_PASSWORD") continue;
      if (user.email && user.email.toLowerCase().trim() === cleanEmail)
        return true;
      if (user.phone) {
        const userPhoneDigits = user.phone.replace(/\D/g, "");
        if (
          cleanPhone.length >= 10 &&
          (userPhoneDigits === cleanPhone ||
            userPhoneDigits.endsWith(cleanPhone.slice(-10)))
        ) {
          return true;
        }
      }
    }

    return false;
  },

  create: (user: Omit<UserRecord, "id" | "createdAt">): UserRecord => {
    const cleanEmail = user.email.trim().toLowerCase();
    const cleanPhone = user.phone.replace(/\D/g, "");

    const newRecord: UserRecord = {
      ...user,
      id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      email: cleanEmail,
      phone:
        cleanPhone.length >= 10 ? `+91 ${cleanPhone.slice(-10)}` : user.phone,
      createdAt: new Date().toISOString(),
    };

    indexUser(newRecord);

    // Automatically link mobile identity if phone exists
    if (cleanPhone.length >= 10) {
      try {
        UserDB.linkIdentity(newRecord.id, "mobile", cleanPhone.slice(-10), true);
      } catch (_) {
        const key = `mobile:${cleanPhone.slice(-10)}`;
        const existing = GLOBAL_IDENTITIES.get(key);
        if (existing) {
          existing.userId = newRecord.id;
        }
      }
    }
    if (cleanEmail && !cleanEmail.includes("@otp.") && !cleanEmail.includes("@prayogindia.local")) {
      try {
        UserDB.linkIdentity(newRecord.id, "email", cleanEmail, Boolean(newRecord.emailVerified));
      } catch (_) {
        const key = `email:${cleanEmail.toLowerCase().trim()}`;
        const existing = GLOBAL_IDENTITIES.get(key);
        if (existing) {
          existing.userId = newRecord.id;
        }
      }
    }

    return newRecord;
  },

  findUserByIdentity: (
    provider: "mobile" | "email" | "google",
    providerUserId: string,
  ): UserRecord | undefined => {
    const key = `${provider}:${providerUserId.trim().toLowerCase()}`;
    const identity = GLOBAL_IDENTITIES.get(key);
    if (identity) {
      return GLOBAL_USERS.get(identity.userId);
    }
    return undefined;
  },

  linkIdentity: (
    userId: string,
    provider: "mobile" | "email" | "google",
    providerUserId: string,
    verified: boolean = true,
  ): AuthIdentityRecord => {
    const cleanId = providerUserId.trim().toLowerCase();
    const key = `${provider}:${cleanId}`;
    const now = new Date().toISOString();

    const existing = GLOBAL_IDENTITIES.get(key);
    if (existing && existing.userId !== userId) {
      throw new Error(
        `This ${provider} identity is already linked to another Prayog customer account.`,
      );
    }

    const record: AuthIdentityRecord = {
      id: existing?.id || `ident-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      provider,
      providerUserId: cleanId,
      verified,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    GLOBAL_IDENTITIES.set(key, record);
    return record;
  },

  getIdentities: (userId: string): AuthIdentityRecord[] => {
    const list: AuthIdentityRecord[] = [];
    for (const identity of GLOBAL_IDENTITIES.values()) {
      if (identity.userId === userId) {
        list.push(identity);
      }
    }
    return list;
  },

  getAddresses: (userId: string): AddressRecord[] => {
    return GLOBAL_ADDRESSES.get(userId) || [];
  },

  addAddress: (
    userId: string,
    addr: Omit<AddressRecord, "id" | "userId" | "createdAt" | "updatedAt">,
  ): AddressRecord => {
    const existing = GLOBAL_ADDRESSES.get(userId) || [];
    const now = new Date().toISOString();

    if (addr.isDefault) {
      existing.forEach((a) => (a.isDefault = false));
    }

    const newAddr: AddressRecord = {
      ...addr,
      id: `addr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      isDefault: existing.length === 0 ? true : Boolean(addr.isDefault),
      createdAt: now,
      updatedAt: now,
    };

    existing.unshift(newAddr);
    GLOBAL_ADDRESSES.set(userId, existing);
    return newAddr;
  },

  updateAddress: (
    userId: string,
    addressId: string,
    data: Partial<AddressRecord>,
  ): AddressRecord | null => {
    const list = GLOBAL_ADDRESSES.get(userId) || [];
    const index = list.findIndex((a) => a.id === addressId);
    if (index === -1) return null;

    if (data.isDefault) {
      list.forEach((a) => (a.isDefault = false));
    }

    list[index] = {
      ...list[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    GLOBAL_ADDRESSES.set(userId, list);
    return list[index];
  },

  deleteAddress: (userId: string, addressId: string): boolean => {
    const list = GLOBAL_ADDRESSES.get(userId) || [];
    const index = list.findIndex((a) => a.id === addressId);
    if (index === -1) return false;

    const wasDefault = list[index].isDefault;
    list.splice(index, 1);

    if (wasDefault && list.length > 0) {
      list[0].isDefault = true;
    }

    GLOBAL_ADDRESSES.set(userId, list);
    return true;
  },

  getSessions: (userId: string): SessionRecord[] => {
    return (GLOBAL_SESSIONS.get(userId) || []).filter(
      (s) => new Date(s.expiresAt).getTime() > Date.now(),
    );
  },

  createSession: (
    userId: string,
    refreshTokenHash?: string,
    deviceInfo?: string,
    expiresAt?: Date,
  ): SessionRecord => {
    const list = GLOBAL_SESSIONS.get(userId) || [];
    const now = new Date();
    const expiry = expiresAt || new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const session: SessionRecord = {
      id: `sess-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      refreshTokenHash,
      deviceInfo: deviceInfo || "Web Browser",
      expiresAt: expiry.toISOString(),
      lastUsedAt: now.toISOString(),
      createdAt: now.toISOString(),
    };

    list.unshift(session);
    GLOBAL_SESSIONS.set(userId, list);
    return session;
  },

  revokeSession: (userId: string, sessionId: string): boolean => {
    const list = GLOBAL_SESSIONS.get(userId) || [];
    const index = list.findIndex((s) => s.id === sessionId);
    if (index === -1) return false;
    list.splice(index, 1);
    GLOBAL_SESSIONS.set(userId, list);
    return true;
  },

  revokeAllSessions: (userId: string): void => {
    GLOBAL_SESSIONS.set(userId, []);
  },

  createOrUpdate: (data: Partial<UserRecord> & { id: string }): UserRecord => {
    let existing = GLOBAL_USERS.get(data.id);
    if (existing) {
      Object.assign(existing, data);
      indexUser(existing);
      return existing;
    }
    const now = new Date().toISOString();
    const newRecord: UserRecord = {
      id: data.id,
      name: data.name || "",
      email: data.email || "",
      phone: data.phone || "",
      passwordHash: data.passwordHash || "OTP_AUTH_VERIFIED",
      customerType: data.customerType || "Registered Customer",
      companyName: data.companyName,
      gstin: data.gstin,
      rewardPoints: data.rewardPoints ?? 100,
      mobileVerified: data.mobileVerified ?? true,
      emailVerified: data.emailVerified ?? false,
      status: "ACTIVE",
      createdAt: now,
    };
    indexUser(newRecord);
    return newRecord;
  },
};
