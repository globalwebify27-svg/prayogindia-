import fs from "fs";
import path from "path";
import { JobOpening, JOB_OPENINGS } from "@/data/companyData";

export interface JobOpeningRecord extends JobOpening {
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_PATH = path.join(
  process.cwd(),
  "src",
  "data",
  "careersStore.json",
);

function getDefaultRecords(): JobOpeningRecord[] {
  const now = new Date().toISOString();
  return JOB_OPENINGS.map((job) => ({
    ...job,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }));
}

export function getCareersRecordsFromDisk(): JobOpeningRecord[] {
  try {
    if (fs.existsSync(STORAGE_PATH)) {
      const raw = fs.readFileSync(STORAGE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error reading careersStore.json:", err);
  }

  // Fallback and seed if file doesn't exist
  const defaults = getDefaultRecords();
  saveCareersRecordsToDisk(defaults);
  return defaults;
}

export function saveCareersRecordsToDisk(records: JobOpeningRecord[]): boolean {
  try {
    const dir = path.dirname(STORAGE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORAGE_PATH, JSON.stringify(records, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing careersStore.json:", err);
    return false;
  }
}

export function getCareersJobs(options?: { activeOnly?: boolean }): JobOpeningRecord[] {
  const all = getCareersRecordsFromDisk();
  if (options?.activeOnly) {
    return all.filter((job) => job.isActive !== false);
  }
  return all;
}

export function getCareersJobBySlug(slug: string): JobOpeningRecord | undefined {
  const all = getCareersRecordsFromDisk();
  return all.find(
    (j) =>
      j.slug.toLowerCase() === slug.toLowerCase() ||
      j.id.toLowerCase() === slug.toLowerCase(),
  );
}

export function createCareersJob(
  input: Omit<JobOpeningRecord, "id" | "createdAt" | "updatedAt"> & {
    id?: string;
  },
): JobOpeningRecord {
  const all = getCareersRecordsFromDisk();
  const now = new Date().toISOString();

  // Generate slug if not provided
  const slug =
    input.slug?.trim() ||
    input.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const newRecord: JobOpeningRecord = {
    id: input.id || `job-${Date.now()}`,
    slug,
    title: input.title.trim(),
    department: input.department.trim(),
    location: input.location.trim(),
    type: input.type?.trim() || "Full-time",
    experience: input.experience?.trim() || "1 - 3 Years",
    salaryRange: input.salaryRange?.trim() || "Best in Industry",
    tags: Array.isArray(input.tags) ? input.tags : [],
    isFeatured: Boolean(input.isFeatured),
    shortDescription: input.shortDescription?.trim() || "",
    responsibilities: Array.isArray(input.responsibilities)
      ? input.responsibilities
      : [],
    requirements: Array.isArray(input.requirements) ? input.requirements : [],
    isActive: input.isActive ?? true,
    createdAt: now,
    updatedAt: now,
  };

  all.unshift(newRecord);
  saveCareersRecordsToDisk(all);
  return newRecord;
}

export function updateCareersJob(
  id: string,
  updates: Partial<JobOpeningRecord>,
): JobOpeningRecord | null {
  const all = getCareersRecordsFromDisk();
  const index = all.findIndex((j) => j.id === id);

  if (index === -1) {
    return null;
  }

  const existing = all[index];
  const updated: JobOpeningRecord = {
    ...existing,
    ...updates,
    id: existing.id, // prevent ID change
    updatedAt: new Date().toISOString(),
  };

  all[index] = updated;
  saveCareersRecordsToDisk(all);
  return updated;
}

export function deleteCareersJob(id: string): boolean {
  const all = getCareersRecordsFromDisk();
  const filtered = all.filter((j) => j.id !== id);

  if (filtered.length === all.length) {
    return false;
  }

  saveCareersRecordsToDisk(filtered);
  return true;
}
