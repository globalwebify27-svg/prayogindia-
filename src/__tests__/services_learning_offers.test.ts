import { describe, it, expect } from "vitest";

describe("Services, Learning Hub & Offers Engine", () => {
  const sampleServices = [
    { id: "stem-lab-setup", slug: "stem-lab-setup", name: "STEM Lab Setup" },
    {
      id: "robotics-lab-setup",
      slug: "robotics-lab-setup",
      name: "Robotics Lab Setup",
    },
  ];

  const sampleLearning = [
    {
      id: "lrn-1",
      slug: "getting-started-arduino",
      title: "Getting Started with Arduino UNO R3",
      category: "Microcontrollers",
      level: "Beginner",
    },
    {
      id: "lrn-2",
      slug: "pixhawk-calibration",
      title: "Pixhawk 6C Flight Controller Setup",
      category: "Drone Technology",
      level: "Advanced",
    },
  ];

  it("should resolve service by slug or return 404", () => {
    const getServiceBySlug = (slug: string) => {
      const match = sampleServices.find((s) => s.slug === slug || s.id === slug);
      if (!match) return { status: 404, message: "Service not found." };
      return { status: 200, data: match };
    };

    expect(getServiceBySlug("stem-lab-setup").status).toBe(200);
    expect(getServiceBySlug("invalid-slug-123").status).toBe(404);
  });

  it("should validate service enquiry inputs correctly", () => {
    const validateServiceEnquiry = (payload: any) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!payload.name || payload.name.trim().length < 2)
        return { status: 400, message: "Invalid name" };
      if (!payload.email || !emailRegex.test(payload.email))
        return { status: 400, message: "Invalid email" };
      const phoneDigits = String(payload.phone || "").replace(/\D/g, "");
      if (phoneDigits.length < 10) return { status: 400, message: "Invalid phone" };
      if (!payload.message || payload.message.trim().length < 5)
        return { status: 400, message: "Invalid message" };
      return { status: 200 };
    };

    expect(
      validateServiceEnquiry({
        name: "Om",
        email: "invalid-email",
        phone: "9876543210",
        message: "Hello",
      }).status,
    ).toBe(400);

    expect(
      validateServiceEnquiry({
        name: "Dr. Om Prakash",
        email: "om@prayog.in",
        phone: "+91 98765 43210",
        message: "Need STEM lab quotation.",
      }).status,
    ).toBe(200);
  });

  it("should filter learning articles by query and category", () => {
    const searchLearning = (q?: string, category?: string) => {
      let res = [...sampleLearning];
      if (category)
        res = res.filter(
          (item) => item.category.toLowerCase() === category.toLowerCase(),
        );
      if (q)
        res = res.filter((item) =>
          item.title.toLowerCase().includes(q.toLowerCase()),
        );
      return res;
    };

    const arduinoSearch = searchLearning("arduino");
    expect(arduinoSearch.length).toBe(1);
    expect(arduinoSearch[0].id).toBe("lrn-1");

    const droneCategorySearch = searchLearning(undefined, "Drone Technology");
    expect(droneCategorySearch.length).toBe(1);
    expect(droneCategorySearch[0].id).toBe("lrn-2");
  });
});
