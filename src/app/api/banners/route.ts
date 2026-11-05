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

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getBannersFromDisk(): HeroBanner[] {
  try {
    if (fs.existsSync(STORAGE_PATH)) {
      const raw = fs.readFileSync(STORAGE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
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

function getNoCacheHeaders(): Record<string, string> {
  const headers = getSecurityHeaders();
  return {
    ...headers,
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
    Pragma: "no-cache",
    Expires: "0",
  };
}

export async function GET(request: Request) {
  const headers = getNoCacheHeaders();
  const { searchParams } = new URL(request.url);
  const activeOnly = searchParams.get("activeOnly") === "true";

  // Always read fresh from disk — zero stale cache
  const banners = getBannersFromDisk();
  const list = activeOnly
    ? banners.filter((b) => b.isActive)
    : banners;

  return NextResponse.json(
    {
      success: true,
      data: sortHeroBanners(list),
    },
    { headers },
  );
}

export async function POST(request: Request) {
  const headers = getNoCacheHeaders();
  try {
    const body: Partial<HeroBanner> = await request.json();
    const currentBanners = getBannersFromDisk();

    if (!body.titlePrefix && !body.badge && !body.image) {
      return NextResponse.json(
        { success: false, message: "Banner image or title is required." },
        { status: 400, headers },
      );
    }

    const newBanner: HeroBanner = {
      id: body.id || `banner-${Date.now()}`,
      badge: body.badge?.trim() || "",
      titlePrefix: body.titlePrefix?.trim() || "",
      titleHighlight: body.titleHighlight?.trim() || "",
      subtitle: body.subtitle?.trim() || "",
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
          : currentBanners.length + 1,
      isActive: typeof body.isActive === "boolean" ? body.isActive : true,
      showTextOverlay:
        typeof body.showTextOverlay === "boolean"
          ? body.showTextOverlay
          : Boolean(body.titlePrefix && body.titlePrefix.trim() !== "." && body.titlePrefix.trim().length > 1),
      theme: body.theme || "blue-gradient",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedList = [...currentBanners, newBanner];
    saveBannersToDisk(updatedList);

    return NextResponse.json(
      {
        success: true,
        data: newBanner,
        all: sortHeroBanners(updatedList),
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
  const headers = getNoCacheHeaders();
  try {
    const body: Partial<HeroBanner> & { id: string } = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { success: false, message: "Banner ID is required." },
        { status: 400, headers },
      );
    }

    const currentBanners = getBannersFromDisk();
    const index = currentBanners.findIndex((b) => b.id === body.id);
    if (index === -1) {
      return NextResponse.json(
        { success: false, message: "Banner not found." },
        { status: 404, headers },
      );
    }

    currentBanners[index] = {
      ...currentBanners[index],
      ...body,
      noteLines: Array.isArray(body.noteLines)
        ? body.noteLines
        : typeof body.noteLines === "string"
        ? (body.noteLines as string).split("\n").filter(Boolean)
        : currentBanners[index].noteLines,
      updatedAt: new Date().toISOString(),
    };

    saveBannersToDisk(currentBanners);

    return NextResponse.json(
      {
        success: true,
        data: currentBanners[index],
        all: sortHeroBanners(currentBanners),
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
  const headers = getNoCacheHeaders();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { success: false, message: "Banner ID is required." },
      { status: 400, headers },
    );
  }

  const currentBanners = getBannersFromDisk();
  const updatedList = currentBanners.filter((b) => b.id !== id);
  saveBannersToDisk(updatedList);

  return NextResponse.json(
    {
      success: true,
      message: "Banner deleted.",
      all: sortHeroBanners(updatedList),
    },
    { headers },
  );
}
