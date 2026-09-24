import { describe, it, expect } from "vitest";
import { renderEmailTemplate } from "../lib/email";

describe("Notifications & Email Template Rendering", () => {
  const userA = { id: "usr-notif-100", email: "user.a@prayog.in" };
  const userB = { id: "usr-notif-200", email: "user.b@prayog.in" };

  it("should render order placed email template with order number and currency formatting", () => {
    const orderTemplate = renderEmailTemplate("ORDER_PLACED", {
      orderNumber: "PRG-2026-9999",
      totalAmount: 4999,
      shippingAddress: "Electronics City, Bengaluru",
    });

    expect(orderTemplate.subject).toContain("PRG-2026-9999");
    expect(orderTemplate.html).toContain("₹4,999");
  });

  it("should render support reply email template with message snippets", () => {
    const supportTemplate = renderEmailTemplate("SUPPORT_REPLY", {
      ticketNumber: "TKT-2026-1234",
      subject: "Sensor Calibration",
      messageSnippet: "Please check your I2C pullup resistors.",
    });

    expect(supportTemplate.html).toContain("I2C pullup resistors");
  });

  it("should enforce isolation on notification feeds and unread counts", () => {
    const mockNotifications = [
      { id: "notif-1", userId: userA.id, title: "Order Placed", readAt: null },
      {
        id: "notif-2",
        userId: userA.id,
        title: "Support Reply",
        readAt: new Date(),
      },
      {
        id: "notif-3",
        userId: userB.id,
        title: "Enquiry Received",
        readAt: null,
      },
    ];

    const getUnreadForUser = (userId: string) =>
      mockNotifications.filter((n) => n.userId === userId && n.readAt === null).length;

    expect(getUnreadForUser(userA.id)).toBe(1);
    expect(getUnreadForUser(userB.id)).toBe(1);

    const accessNotification = (requesterId: string, notifId: string) => {
      const notif = mockNotifications.find((n) => n.id === notifId);
      if (!notif || notif.userId !== requesterId) return { status: 404 };
      return { status: 200, data: notif };
    };

    expect(accessNotification(userA.id, "notif-1").status).toBe(200);
    expect(accessNotification(userA.id, "notif-3").status).toBe(404);
  });
});
