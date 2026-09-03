import { NextResponse } from "next/server";
import {
  DEFAULT_NOTIFICATIONS,
  WebsiteNotification,
  sortNotifications,
  isNotificationLive,
} from "@/data/notificationSlider";
import { getSecurityHeaders } from "@/lib/security";

// In-memory runtime cache for development/demo (persists across client navigations)
let inMemoryNotifications: WebsiteNotification[] = [...DEFAULT_NOTIFICATIONS];

export async function GET(request: Request) {
  const headers = getSecurityHeaders();
  const { searchParams } = new URL(request.url);
  const liveOnly = searchParams.get("liveOnly") === "true";

  if (liveOnly) {
    const liveItems = sortNotifications(
      inMemoryNotifications.filter((n) => isNotificationLive(n)),
    );
    return NextResponse.json({ success: true, data: liveItems }, { headers });
  }

  return NextResponse.json(
    { success: true, data: sortNotifications(inMemoryNotifications) },
    { headers },
  );
}

export async function POST(request: Request) {
  const headers = getSecurityHeaders();
  try {
    const body: Partial<WebsiteNotification> = await request.json();

    if (!body.text || !body.badgeTag) {
      return NextResponse.json(
        { success: false, message: "Text and Badge Tag are required." },
        { status: 400, headers },
      );
    }

    const newItem: WebsiteNotification = {
      id: body.id || `notif-${Date.now()}`,
      badgeTag: body.badgeTag.toUpperCase().trim(),
      text: body.text.trim(),
      link: body.link?.trim() || "/products",
      linkText: body.linkText?.trim() || "Learn More",
      priority: body.priority || "MEDIUM",
      displayOrder:
        typeof body.displayOrder === "number"
          ? body.displayOrder
          : inMemoryNotifications.length + 1,
      isActive: typeof body.isActive === "boolean" ? body.isActive : true,
      startDate: body.startDate || "",
      endDate: body.endDate || "",
      theme:
        body.theme ||
        (body.priority === "CRITICAL"
          ? "red"
          : body.priority === "HIGH"
            ? "emerald"
            : body.priority === "MEDIUM"
              ? "amber"
              : "blue"),
      createdAt: new Date().toISOString(),
    };

    inMemoryNotifications.push(newItem);

    return NextResponse.json(
      {
        success: true,
        data: newItem,
        all: sortNotifications(inMemoryNotifications),
      },
      { status: 201, headers },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to create announcement." },
      { status: 500, headers },
    );
  }
}

export async function PUT(request: Request) {
  const headers = getSecurityHeaders();
  try {
    const body: WebsiteNotification = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { success: false, message: "Notification ID is required." },
        { status: 400, headers },
      );
    }

    const index = inMemoryNotifications.findIndex((n) => n.id === body.id);
    if (index === -1) {
      return NextResponse.json(
        { success: false, message: "Notification not found." },
        { status: 404, headers },
      );
    }

    inMemoryNotifications[index] = {
      ...inMemoryNotifications[index],
      ...body,
    };

    return NextResponse.json(
      {
        success: true,
        data: inMemoryNotifications[index],
        all: sortNotifications(inMemoryNotifications),
      },
      { headers },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to update announcement." },
      { status: 500, headers },
    );
  }
}

export async function DELETE(request: Request) {
  const headers = getSecurityHeaders();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { success: false, message: "ID is required." },
      { status: 400, headers },
    );
  }

  inMemoryNotifications = inMemoryNotifications.filter((n) => n.id !== id);

  return NextResponse.json(
    {
      success: true,
      message: "Notification deleted.",
      all: sortNotifications(inMemoryNotifications),
    },
    { headers },
  );
}
