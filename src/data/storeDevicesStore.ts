import fs from "fs";
import path from "path";

export interface StoredDeviceRecord {
  id: string;
  storeCode: string;
  deviceName: string;
  deviceType: "KIOSK_TABLET" | "POS_TERMINAL";
  deviceCode: string;
  username: string;
  passwordPlain: string;
  salesExecutive: string;
  status: "Active" | "Suspended";
  createdAt: string;
  lastActiveAt: string;
}

function getStoreDevicesFilePath(): string {
  const possiblePaths = [
    path.join(process.cwd(), "src", "data", "storeDevicesStore.json"),
    path.join(process.cwd(), "prayog-app", "src", "data", "storeDevicesStore.json"),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  for (const p of possiblePaths) {
    if (fs.existsSync(path.dirname(p))) return p;
  }
  return possiblePaths[0];
}

const DEFAULT_DEVICES: StoredDeviceRecord[] = [
  {
    id: "dev-pat-01",
    storeCode: "PATNA",
    deviceName: "Abhishek Kumar's Store Tablet",
    deviceType: "KIOSK_TABLET",
    deviceCode: "TAB-PATNA-ABHISHEK_TAB",
    username: "abhishek_tab",
    passwordPlain: "kiosk123",
    salesExecutive: "Abhishek Kumar",
    status: "Active",
    createdAt: new Date().toISOString(),
    lastActiveAt: "Active",
  },
  {
    id: "dev-pat-02",
    storeCode: "PATNA",
    deviceName: "Patna Kiosk (Store Shopping Tablet)",
    deviceType: "KIOSK_TABLET",
    deviceCode: "TAB-PATNA-PATNA_KIOSK",
    username: "patna_kiosk",
    passwordPlain: "kiosk123",
    salesExecutive: "Jay Prakash",
    status: "Active",
    createdAt: new Date().toISOString(),
    lastActiveAt: "Active",
  },
  {
    id: "dev-pat-03",
    storeCode: "PATNA",
    deviceName: "tux (Jay Prakash's Terminal)",
    deviceType: "KIOSK_TABLET",
    deviceCode: "TAB-PATNA-TUX007",
    username: "tux007",
    passwordPlain: "kiosk123",
    salesExecutive: "Jay Prakash",
    status: "Active",
    createdAt: new Date().toISOString(),
    lastActiveAt: "Active",
  },
  {
    id: "dev-rnc-01",
    storeCode: "RANCHI",
    deviceName: "Shahnawaz Abbas's Kiosk Tablet",
    deviceType: "KIOSK_TABLET",
    deviceCode: "TAB-RANCHI-SHAHNAWAZ_TAB",
    username: "shahnawaz_tab",
    passwordPlain: "kiosk123",
    salesExecutive: "Shahnawaz Abbas",
    status: "Active",
    createdAt: new Date().toISOString(),
    lastActiveAt: "Active",
  },
  {
    id: "dev-rnc-02",
    storeCode: "RANCHI",
    deviceName: "Ranchi Shopping Tablet",
    deviceType: "KIOSK_TABLET",
    deviceCode: "TAB-RNC-KIOSK-01",
    username: "ranchi_kiosk",
    passwordPlain: "kiosk123",
    salesExecutive: "Abhishek Kumar",
    status: "Active",
    createdAt: new Date().toISOString(),
    lastActiveAt: "Active",
  },
  {
    id: "dev-del-01",
    storeCode: "DELHI",
    deviceName: "Delhi Shopping Tablet",
    deviceType: "KIOSK_TABLET",
    deviceCode: "TAB-DEL-KIOSK-01",
    username: "delhi_kiosk",
    passwordPlain: "kiosk123",
    salesExecutive: "Siddharth Varma",
    status: "Active",
    createdAt: new Date().toISOString(),
    lastActiveAt: "Active",
  },
];

export function getStoredDevices(): StoredDeviceRecord[] {
  const filePath = getStoreDevicesFilePath();
  try {
    if (!fs.existsSync(filePath)) {
      const parentDir = path.dirname(filePath);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
      fs.writeFileSync(
        filePath,
        JSON.stringify(DEFAULT_DEVICES, null, 2),
        "utf8",
      );
      return DEFAULT_DEVICES;
    }
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_DEVICES;
    }
    return parsed;
  } catch (err) {
    console.warn("Failed to read storeDevicesStore.json, using defaults:", err);
    return DEFAULT_DEVICES;
  }
}

export function saveStoredDevice(
  device: Omit<StoredDeviceRecord, "id" | "createdAt" | "lastActiveAt">,
): StoredDeviceRecord {
  const current = getStoredDevices();
  const cleanUsername = device.username.trim().toLowerCase();

  // Check if device already exists for this username or deviceCode
  const existingIndex = current.findIndex(
    (d) =>
      d.username.toLowerCase() === cleanUsername ||
      d.deviceCode.toUpperCase() === device.deviceCode.toUpperCase(),
  );

  const record: StoredDeviceRecord = {
    id: `dev-${device.storeCode.toLowerCase()}-${Date.now()}`,
    createdAt: new Date().toISOString(),
    lastActiveAt: "Active",
    ...device,
    username: cleanUsername,
    deviceCode: device.deviceCode.toUpperCase(),
  };

  let updated: StoredDeviceRecord[];
  if (existingIndex >= 0) {
    updated = [...current];
    updated[existingIndex] = {
      ...updated[existingIndex],
      ...record,
      id: updated[existingIndex].id,
      createdAt: updated[existingIndex].createdAt,
    };
  } else {
    updated = [record, ...current];
  }

  const filePath = getStoreDevicesFilePath();
  try {
    const parentDir = path.dirname(filePath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write storeDevicesStore.json:", err);
  }

  return record;
}
