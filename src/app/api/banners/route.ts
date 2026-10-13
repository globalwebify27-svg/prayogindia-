import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import {
  DEFAULT_HERO_BANNERS,
  HeroBanner,
  sortHeroBanners,
} from "@/data/heroBannersData";
import { getSecurityHeaders } from "@/lib/security";

const STORAGE_PATH = path.join(
  process.cwd(),
  "src",
  "data",
  "heroBannersStore.json",
);

function getBannersFromDisk(): HeroBanner[] {
  try {
    if (fs.existsSync(STORAGE_PATH)) {
      const raw = fs.readFileSync(STORAGE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error reading heroBannersStore.json:", err);
  }
  return [...DEFAULT_HERO_BANNERS];
}

function saveBannersToDisk(banners: HeroBanner[]): boolean {
  try {
    fs.writeFileSync(STORAGE_PATH, JSON.stringify(banners, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing heroBannersStore.json:", err);
    return false;
  }
}

// In-memory cache synced with disk
let cachedBanners: HeroBanner[] = getBannersFromDisk();

export async function GET(request: Request) {
  const headers = getSecurityHeaders();
  const { searchParams } = new URL(request.url);
  const activeOnly = searchParams.get("activeOnly") === "true";

  // Re-read if cache is empty
  if (!cachedBanners || cachedBanners.length === 0) {
    cachedBanners = getBannersFromDisk();
  }

  const list = activeOnly
    ? cachedBanners.filter((b) => b.isActive)
    : cachedBanners;

  return NextResponse.json(
    {
      success: true,
      data: sortHeroBanners(list),
    },
    { headers },
  );
}

export async function POST(request: Request) {
  const headers = getSecurityHeaders();
  try {
    const body: Partial<HeroBanner> = await request.json();

    if (!body.titlePrefix && !body.badge) {
      return NextResponse.json(
        { success: false, message: "Title or Badge is required." },
        { status: 400, headers },
      );
    }

    const newBanner: HeroBanner = {
      id: body.id || `banner-${Date.now()}`,
      badge: body.badge?.trim() || "🇮🇳 Prayog India Exclusive",
      titlePrefix: body.titlePrefix?.trim() || "Build. Learn.",
      titleHighlight: body.titleHighlight?.trim() || "Innovate.",
      description: body.description?.trim() || "",
      primaryButtonText: body.primaryButtonText?.trim() || "Explore Products",
      primaryButtonLink: body.primaryButtonLink?.trim() || "/products",
      secondaryButtonText: body.secondaryButtonText?.trim() || "",
      secondaryButtonLink: body.secondaryButtonLink?.trim() || "",
      image: body.image?.trim() || "/images/robot_banner_stem.jpg",
      alt: body.alt?.trim() || body.titlePrefix || "Prayog India Robotics Banner",
      noteLines: Array.isArray(body.noteLines)
        ? body.noteLines
        : typeof body.noteLines === "string"
        ? (body.noteLines as string).split("\n").filter(Boolean)
        : [],
      displayOrder:
        typeof body.displayOrder === "number"
          ? body.displayOrder
          : cachedBanners.length + 1,
      isActive: typeof body.isActive === "boolean" ? body.isActive : true,
      theme: body.theme || "blue-gradient",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    cachedBanners.push(newBanner);
    saveBannersToDisk(cachedBanners);

    return NextResponse.json(
      {
        success: true,
        data: newBanner,
        all: sortHeroBanners(cachedBanners),
      },
      { status: 201, headers },
    );
  } catch (error) {
    console.error("Failed to create banner:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create banner." },
      { status: 500, headers },
    );
  }
}

export async function PUT(request: Request) {
  const headers = getSecurityHeaders();
  try {
    const body: Partial<HeroBanner> & { id: string } = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { success: false, message: "Banner ID is required." },
        { status: 400, headers },
      );
    }

    const index = cachedBanners.findIndex((b) => b.id === body.id);
    if (index === -1) {
      return NextResponse.json(
        { success: false, message: "Banner not found." },
        { status: 404, headers },
      );
    }

    cachedBanners[index] = {
      ...cachedBanners[index],
      ...body,
      noteLines: Array.isArray(body.noteLines)
        ? body.noteLines
        : typeof body.noteLines === "string"
        ? (body.noteLines as string).split("\n").filter(Boolean)
        : cachedBanners[index].noteLines,
      updatedAt: new Date().toISOString(),
    };

    saveBannersToDisk(cachedBanners);

    return NextResponse.json(
      {
        success: true,
        data: cachedBanners[index],
        all: sortHeroBanners(cachedBanners),
      },
      { headers },
    );
  } catch (error) {
    console.error("Failed to update banner:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update banner." },
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
      { success: false, message: "Banner ID is required." },
      { status: 400, headers },
    );
  }

  cachedBanners = cachedBanners.filter((b) => b.id !== id);
  saveBannersToDisk(cachedBanners);

  return NextResponse.json(
    {
      success: true,
      message: "Banner deleted.",
      all: sortHeroBanners(cachedBanners),
    },
    { headers },
  );
}
