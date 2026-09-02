export interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  companyName?: string;
  gstin?: string;
  rewardPoints: number;
  customerType: 'Registered Customer' | 'B2B Customer' | 'B2C Customer';
  createdAt: string;
}

// Next.js hot-reload safe global singleton store
const globalForUserDB = globalThis as unknown as {
  prayogUsers: Map<string, UserRecord> | undefined;
};

export const GLOBAL_USERS = globalForUserDB.prayogUsers ?? new Map<string, UserRecord>();
if (process.env.NODE_ENV !== 'production') {
  globalForUserDB.prayogUsers = GLOBAL_USERS;
}

function indexUser(user: UserRecord) {
  GLOBAL_USERS.set(user.id, user);
  if (user.email) {
    GLOBAL_USERS.set(user.email.toLowerCase().trim(), user);
  }
  if (user.phone) {
    const rawPhone = user.phone.replace(/\D/g, '');
    GLOBAL_USERS.set(rawPhone, user);
    if (rawPhone.length >= 10) {
      GLOBAL_USERS.set(rawPhone.slice(-10), user);
    }
  }
}

export const UserDB = {
  findByEmailOrPhone: (identifier: string): UserRecord | undefined => {
    const clean = identifier.trim().toLowerCase();
    const cleanDigits = clean.replace(/\D/g, '');

    // 1. Direct key match (email or full string)
    let found = GLOBAL_USERS.get(clean);
    if (found) return found;

    // 2. Exact phone digits match (or 10-digit suffix)
    if (cleanDigits.length >= 10) {
      found = GLOBAL_USERS.get(cleanDigits) || GLOBAL_USERS.get(cleanDigits.slice(-10));
      if (found) return found;
    }

    // 3. Scan all registered users
    for (const user of GLOBAL_USERS.values()) {
      if (user.email && user.email.toLowerCase().trim() === clean) return user;
      if (user.phone) {
        const userPhoneDigits = user.phone.replace(/\D/g, '');
        if (cleanDigits.length >= 10 && (userPhoneDigits === cleanDigits || userPhoneDigits.endsWith(cleanDigits.slice(-10)))) {
          return user;
        }
      }
    }

    return undefined;
  },

  exists: (email: string, phone: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.replace(/\D/g, '');

    if (GLOBAL_USERS.has(cleanEmail)) return true;
    if (cleanPhone.length >= 10 && (GLOBAL_USERS.has(cleanPhone) || GLOBAL_USERS.has(cleanPhone.slice(-10)))) {
      return true;
    }

    for (const user of GLOBAL_USERS.values()) {
      if (user.email && user.email.toLowerCase().trim() === cleanEmail) return true;
      if (user.phone) {
        const userPhoneDigits = user.phone.replace(/\D/g, '');
        if (cleanPhone.length >= 10 && (userPhoneDigits === cleanPhone || userPhoneDigits.endsWith(cleanPhone.slice(-10)))) {
          return true;
        }
      }
    }

    return false;
  },

  create: (user: Omit<UserRecord, 'id' | 'createdAt'>): UserRecord => {
    const cleanEmail = user.email.trim().toLowerCase();
    const cleanPhone = user.phone.replace(/\D/g, '');

    const newRecord: UserRecord = {
      ...user,
      id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      email: cleanEmail,
      phone: cleanPhone.length >= 10 ? `+91 ${cleanPhone.slice(-10)}` : user.phone,
      createdAt: new Date().toISOString(),
    };

    indexUser(newRecord);
    return newRecord;
  },
};
