import fs from "fs";
import path from "path";

export interface StoredServiceEnquiry {
  id: string;
  serviceId?: string | null;
  serviceName: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: "NEW" | "CONTACTED" | "IN_PROGRESS" | "CLOSED";
  adminNote?: string;
  createdAt: string;
  updatedAt?: string;
  service?: {
    id: string;
    name: string;
    slug: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  } | null;
}

const STORAGE_PATH = path.join(
  process.cwd(),
  "src",
  "data",
  "serviceEnquiriesStore.json"
);

export function resolveServiceMeta(
  serviceId?: string | null,
  serviceName?: string | null
): { id: string; name: string; slug: string } {
  const query = `${serviceId || ""} ${serviceName || ""}`.toLowerCase();

  if (query.includes("stem")) {
    return {
      id: "stem-lab-setup",
      name: "STEM Lab Setup",
      slug: "STEM_LAB_SETUP",
    };
  }
  if (query.includes("robot")) {
    return {
      id: "robotics-lab-setup",
      name: "Robotics Lab Setup",
      slug: "ROBOTICS_LAB_SETUP",
    };
  }
  if (query.includes("drone") || query.includes("uav")) {
    return {
      id: "drone-lab-setup",
      name: "Drone & UAV Lab Setup",
      slug: "DRONE_LAB_SETUP",
    };
  }
  if (query.includes("industrial") || query.includes("iot")) {
    return {
      id: "industrial-iot-lab",
      name: "Industrial Projects & IoT",
      slug: "INDUSTRIAL_PROJECTS",
    };
  }
  if (query.includes("consult") || query.includes("ai")) {
    return {
      id: "ai-cv-lab",
      name: "Consultancy & AI Labs",
      slug: "CONSULTANCY",
    };
  }

  return {
    id: serviceId || "stem-lab-setup",
    name: serviceName || "STEM Lab Setup",
    slug: "STEM_LAB_SETUP",
  };
}

function getDefaultRecords(): StoredServiceEnquiry[] {
  return [
    {
      id: "enq-seed-001",
      serviceId: "stem-lab-setup",
      serviceName: "STEM Lab Setup",
      name: "Bahubali (KD)",
      email: "sultansusu09@gmail.com",
      phone: "+918709789641",
      message:
        "Quotation request for turnkey STEM Lab Setup with hands-on curriculums, microcontrollers, and trainer certification.",
      status: "NEW",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      service: {
        id: "stem-lab-setup",
        name: "STEM Lab Setup",
        slug: "STEM_LAB_SETUP",
      },
    },
  ];
}

export function getStoredServiceEnquiries(): StoredServiceEnquiry[] {
  try {
    if (fs.existsSync(STORAGE_PATH)) {
      const raw = fs.readFileSync(STORAGE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error reading serviceEnquiriesStore.json:", err);
  }

  const defaults = getDefaultRecords();
  saveAllServiceEnquiries(defaults);
  return defaults;
}

export function saveAllServiceEnquiries(records: StoredServiceEnquiry[]): boolean {
  try {
    const dir = path.dirname(STORAGE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORAGE_PATH, JSON.stringify(records, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing serviceEnquiriesStore.json:", err);
    return false;
  }
}

export function saveStoredServiceEnquiry(
  input: {
    serviceId?: string | null;
    serviceName?: string | null;
    name: string;
    email: string;
    phone: string;
    message: string;
    user?: { id: string; name: string; email: string; phone?: string } | null;
  }
): StoredServiceEnquiry {
  const records = getStoredServiceEnquiries();
  const serviceMeta = resolveServiceMeta(input.serviceId, input.serviceName);

  const newRecord: StoredServiceEnquiry = {
    id: `enq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    serviceId: serviceMeta.id,
    serviceName: input.serviceName || serviceMeta.name,
    name: input.name,
    email: input.email,
    phone: input.phone,
    message: input.message,
    status: "NEW",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    service: serviceMeta,
    user: input.user || null,
  };

  // Prepend to top of list
  records.unshift(newRecord);
  saveAllServiceEnquiries(records);
  return newRecord;
}

export function updateStoredServiceEnquiry(
  id: string,
  updates: Partial<StoredServiceEnquiry>
): StoredServiceEnquiry | null {
  const records = getStoredServiceEnquiries();
  const index = records.findIndex((r) => r.id === id);
  if (index === -1) return null;

  records[index] = {
    ...records[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  saveAllServiceEnquiries(records);
  return records[index];
}

export function deleteStoredServiceEnquiry(id: string): boolean {
  const records = getStoredServiceEnquiries();
  const filtered = records.filter((r) => r.id !== id);
  if (filtered.length === records.length) return false;
  return saveAllServiceEnquiries(filtered);
}
