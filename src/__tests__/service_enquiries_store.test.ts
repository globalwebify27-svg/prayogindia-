import { describe, it, expect } from "vitest";
import {
  getStoredServiceEnquiries,
  saveStoredServiceEnquiry,
  updateStoredServiceEnquiry,
  deleteStoredServiceEnquiry,
  resolveServiceMeta,
} from "../lib/serviceEnquiriesStore";

describe("Service Enquiries Persistence & Management", () => {
  it("should resolve service meta correctly for different service queries", () => {
    const stem = resolveServiceMeta("stem-lab-setup", "STEM Lab Setup");
    expect(stem.slug).toBe("STEM_LAB_SETUP");
    expect(stem.name).toBe("STEM Lab Setup");

    const robotics = resolveServiceMeta("robotics-lab", "Robotics Laboratory");
    expect(robotics.slug).toBe("ROBOTICS_LAB_SETUP");

    const drone = resolveServiceMeta(null, "Drone & UAV Lab Setup");
    expect(drone.slug).toBe("DRONE_LAB_SETUP");

    const industrial = resolveServiceMeta(null, "Industrial Automation");
    expect(industrial.slug).toBe("INDUSTRIAL_PROJECTS");

    const consult = resolveServiceMeta(null, "AI & Consultancy Service");
    expect(consult.slug).toBe("CONSULTANCY");
  });

  it("should load existing service enquiries from disk store", () => {
    const enquiries = getStoredServiceEnquiries();
    expect(Array.isArray(enquiries)).toBe(true);
    expect(enquiries.length).toBeGreaterThanOrEqual(1);

    const stemEnquiry = enquiries.find(
      (e) => e.phone === "+918709789641" || e.email === "sultansusu09@gmail.com",
    );
    expect(stemEnquiry).toBeDefined();
    expect(stemEnquiry?.serviceName).toBe("STEM Lab Setup");
    expect(stemEnquiry?.notes).toBeDefined();
  });

  it("should create, update, and delete service enquiries", () => {
    // 1. Create
    const created = saveStoredServiceEnquiry({
      serviceId: "robotics-lab-setup",
      serviceName: "Robotics Lab Setup",
      name: "Prof. Test Kumar",
      email: "prof.test@example.com",
      phone: "+919876543210",
      message: "Need 10 mobile robotics kits and 2 robotic arms for college lab.",
    });

    expect(created.id).toBeDefined();
    expect(created.status).toBe("NEW");
    expect(created.service?.slug).toBe("ROBOTICS_LAB_SETUP");

    // 2. Update status
    const updated = updateStoredServiceEnquiry(created.id, {
      status: "CONTACTED",
      adminNote: "Spoke on phone, sending technical specification sheet.",
    });
    expect(updated?.status).toBe("CONTACTED");
    expect(updated?.adminNote).toBe(
      "Spoke on phone, sending technical specification sheet.",
    );

    // 3. Delete
    const deleted = deleteStoredServiceEnquiry(created.id);
    expect(deleted).toBe(true);

    const afterDelete = getStoredServiceEnquiries();
    expect(afterDelete.find((e) => e.id === created.id)).toBeUndefined();
  });
});
