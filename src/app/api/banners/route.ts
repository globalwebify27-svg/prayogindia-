import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Static fallback banners used when DB has no banners configured
const STATIC_BANNERS = [
  {
    id: "banner-1",
    badge: "OFFICIAL PARTNER",
    title: "Arduino & Raspberry Pi",
    subtitle: "Build Your Ideas, Step by Step",
    buttonText: "Shop Now",
    image:
      "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80",
    gradient: ["#051329", "#09224A", "#0D3875"],
    categoryLink: "arduino-development-boards",
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "banner-2",
    badge: "AUTOPILOT & FPV",
    title: "Drone Technology",
    subtitle: "Pixhawk 6C, BLDC Motors & ESCs",
    buttonText: "Explore Drones",
    image:
      "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80",
    gradient: ["#041E42", "#004B87", "#0082C8"],
    categoryLink: "drone-technology",
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "banner-3",
    badge: "AI & ROBOTICS",
    title: "Jetson Orin Nano AI",
    subtitle: "40 TOPS Generative AI for Robotics",
    buttonText: "Order Now",
    image:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80",
    gradient: ["#111827", "#1E293B", "#334155"],
    categoryLink: "robotics",
    isActive: true,
    sortOrder: 3,
  },
];

/**
 * GET /api/banners
 * Returns active hero banner slides for the Flutter app home screen and web homepage.
 * Uses DB banners if available, otherwise returns curated static fallback banners.
 */
export async function GET() {
  try {
    if (process.env.DATABASE_URL) {
      try {
        const banners = await (db as any).banner?.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        });
        if (banners && banners.length > 0) {
          return NextResponse.json({
            success: true,
            data: banners,
            source: "database",
          });
        }
      } catch {
        // Banner model may not exist in schema yet — fall through to static
      }
    }
    return NextResponse.json({
      success: true,
      data: STATIC_BANNERS,
      source: "static",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch banners." },
      { status: 500 },
    );
  }
}
