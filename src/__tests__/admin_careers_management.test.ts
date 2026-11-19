import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import {
  getCareersRecordsFromDisk,
  getCareersJobs,
  getCareersJobBySlug,
  createCareersJob,
  updateCareersJob,
  deleteCareersJob,
  saveCareersRecordsToDisk,
  JobOpeningRecord,
} from "@/lib/careersStore";

const STORAGE_PATH = path.join(
  process.cwd(),
  "src",
  "data",
  "careersStore.json",
);

describe("Admin Careers Management & Publishing System", () => {
  let backupData: string | null = null;

  beforeEach(() => {
    if (fs.existsSync(STORAGE_PATH)) {
      backupData = fs.readFileSync(STORAGE_PATH, "utf-8");
    }
  });

  afterEach(() => {
    if (backupData !== null) {
      fs.writeFileSync(STORAGE_PATH, backupData, "utf-8");
    }
  });

  it("should initialize default careers records and retrieve all jobs", () => {
    const jobs = getCareersJobs();
    expect(jobs.length).toBeGreaterThanOrEqual(5);

    const firstJob = jobs[0];
    expect(firstJob).toHaveProperty("id");
    expect(firstJob).toHaveProperty("title");
    expect(firstJob).toHaveProperty("department");
    expect(firstJob).toHaveProperty("slug");
    expect(firstJob.isActive).toBe(true);
  });

  it("should post/create a new engineering job opening from admin", () => {
    const newJob = createCareersJob({
      title: "Senior Mechatronics Test Engineer",
      slug: "senior-mechatronics-test-engineer",
      department: "Hardware R&D",
      location: "Bengaluru, Karnataka (On-site)",
      type: "Full-time",
      experience: "3 - 5 Years",
      salaryRange: "₹12 - 18 LPA",
      tags: ["Mechatronics", "HIL Testing", "CAN Bus"],
      isFeatured: true,
      shortDescription: "Lead end-to-end hardware-in-the-loop stress testing for robotics payloads.",
      responsibilities: ["Develop test rigs", "Automate telemetry validation"],
      requirements: ["B.Tech Mechatronics", "3+ years HIL testing"],
      isActive: true,
    });

    expect(newJob.id).toBeDefined();
    expect(newJob.title).toBe("Senior Mechatronics Test Engineer");
    expect(newJob.slug).toBe("senior-mechatronics-test-engineer");

    // Verify it is retrievable
    const found = getCareersJobBySlug("senior-mechatronics-test-engineer");
    expect(found).toBeDefined();
    expect(found?.salaryRange).toBe("₹12 - 18 LPA");
  });

  it("should edit and update an existing job opening", () => {
    const jobs = getCareersJobs();
    const target = jobs[0];

    const updated = updateCareersJob(target.id, {
      salaryRange: "₹15 - 22 LPA",
      experience: "4 - 7 Years",
      isActive: false,
    });

    expect(updated).not.toBeNull();
    expect(updated?.salaryRange).toBe("₹15 - 22 LPA");
    expect(updated?.isActive).toBe(false);

    // Verify activeOnly filter excludes inactive jobs
    const activeJobs = getCareersJobs({ activeOnly: true });
    expect(activeJobs.some((j) => j.id === target.id)).toBe(false);
  });

  it("should delete a job opening", () => {
    const jobsBefore = getCareersJobs();
    const targetId = jobsBefore[0].id;

    const success = deleteCareersJob(targetId);
    expect(success).toBe(true);

    const jobsAfter = getCareersJobs();
    expect(jobsAfter.some((j) => j.id === targetId)).toBe(false);
  });
});
