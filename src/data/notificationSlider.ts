export type NotificationPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface WebsiteNotification {
  id: string;
  badgeTag: string;
  text: string;
  link: string;
  linkText?: string;
  priority: NotificationPriority;
  displayOrder: number;
  isActive: boolean;
  startDate?: string; // ISO format: YYYY-MM-DDTHH:mm
  endDate?: string; // ISO format: YYYY-MM-DDTHH:mm
  theme?: "dark" | "amber" | "red" | "blue" | "emerald";
  createdAt?: string;
}

export const DEFAULT_NOTIFICATIONS: WebsiteNotification[] = [
  {
    id: "notif-1",
    badgeTag: "FESTIVAL SALE",
    text: "Festival Sale Live Now — Use coupon code PRAYOG10 for 10% instant off on all robotics kits!",
    link: "/offers",
    linkText: "Shop Deals",
    priority: "HIGH",
    displayOrder: 1,
    isActive: true,
    startDate: "2026-08-01T00:00",
    endDate: "2026-12-31T23:59",
    theme: "emerald",
    createdAt: "2026-08-20T10:00:00Z",
  },
  {
    id: "notif-2",
    badgeTag: "SHIPPING NOTICE",
    text: "Shipping may be delayed due to high order frequency across North-East routes.",
    link: "/contact",
    linkText: "Track Order",
    priority: "MEDIUM",
    displayOrder: 2,
    isActive: true,
    startDate: "2026-08-15T00:00",
    endDate: "2026-09-30T23:59",
    theme: "amber",
    createdAt: "2026-08-22T14:30:00Z",
  },
  {
    id: "notif-3",
    badgeTag: "DELIVERY TIMELINES",
    text: "Delivery timelines may vary for selected locations. Ranchi & Patna local orders dispatch in 24 hours.",
    link: "/contact",
    linkText: "Store Hubs",
    priority: "LOW",
    displayOrder: 3,
    isActive: true,
    startDate: "2026-08-01T00:00",
    endDate: "2026-12-31T23:59",
    theme: "blue",
    createdAt: "2026-08-10T09:00:00Z",
  },
  {
    id: "notif-4",
    badgeTag: "MAINTENANCE",
    text: "Website Under Maintenance: Scheduled server upgrades tonight from 02:00 AM to 04:00 AM IST.",
    link: "/contact",
    linkText: "Details",
    priority: "CRITICAL",
    displayOrder: 4,
    isActive: false, // Inactive by default; enabled by admin during maintenance windows
    startDate: "2026-08-29T02:00",
    endDate: "2026-08-29T04:00",
    theme: "red",
    createdAt: "2026-08-28T18:00:00Z",
  },
];

/**
 * Evaluates whether a notification is currently live based on active status and scheduling dates.
 */
export function isNotificationLive(
  notif: WebsiteNotification,
  now: Date = new Date(),
): boolean {
  if (!notif.isActive) return false;

  if (notif.startDate) {
    const start = new Date(notif.startDate);
    if (!isNaN(start.getTime()) && now < start) {
      return false;
    }
  }

  if (notif.endDate) {
    const end = new Date(notif.endDate);
    if (!isNaN(end.getTime()) && now > end) {
      return false;
    }
  }

  return true;
}

/**
 * Sort notifications by priority and display order.
 */
export function sortNotifications(
  items: WebsiteNotification[],
): WebsiteNotification[] {
  const priorityWeight: Record<NotificationPriority, number> = {
    CRITICAL: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  };

  return [...items].sort((a, b) => {
    // 1. Critical priority always comes first
    if (a.priority === "CRITICAL" && b.priority !== "CRITICAL") return -1;
    if (b.priority === "CRITICAL" && a.priority !== "CRITICAL") return 1;

    // 2. Display order (ascending 1, 2, 3...)
    if (a.displayOrder !== b.displayOrder) {
      return a.displayOrder - b.displayOrder;
    }

    // 3. Higher priority weight
    return priorityWeight[b.priority] - priorityWeight[a.priority];
  });
}
