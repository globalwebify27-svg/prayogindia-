import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
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

const TMP_STORAGE_PATH = path.join(os.tmpdir(), "prayog_heroBannersStore.json");
const TMP_DELETED_PATH = path.join(os.tmpdir(), "prayog_deletedBannerIds.json");

// In-memory runtime store shared across lambda invocations within the same container
const globalRef = globalThis as unknown as {
  __heroBannersStore?: HeroBanner[];
  __deletedBannerIds?: Set<string>;
};

function getDeletedBannerIds(): Set<string> {
  if (!globalRef.__deletedBannerIds) {
    globalRef.__deletedBannerIds = new Set<string>();
    try {
      if (fs.existsSync(TMP_DELETED_PATH)) {
        const raw = fs.readFileSync(TMP_DELETED_PATH, "utf-8");
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          list.forEach((id: string) => globalRef.__deletedBannerIds!.add(id));
        }
      }
    } catch {}
  }
  return globalRef.__deletedBannerIds;
}

function recordDeletedBannerId(id: string) {
  const deleted = getDeletedBannerIds();
  deleted.add(id);
  try {
    fs.writeFileSync(
      TMP_DELETED_PATH,
      JSON.stringify(Array.from(deleted)),
      "utf-8"
    );
  } catch {}
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getBannersFromDisk(): HeroBanner[] {
  const deleted = getDeletedBannerIds();

  // 1. In-memory warm container cache
  if (globalRef.__heroBannersStore && Array.isArray(globalRef.__heroBannersStore)) {
    return globalRef.__heroBannersStore.filter((b) => !deleted.has(b.id));
  }

  // 2. Read from /tmp (writable in Vercel lambda)
  try {
    if (fs.existsSync(TMP_STORAGE_PATH)) {
      const raw = fs.readFileSync(TMP_STORAGE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const filtered = parsed.filter((b: HeroBanner) => !deleted.has(b.id));
        globalRef.__heroBannersStore = filtered;
        return filtered;
      }
    }
  } catch (err) {
    console.error("Error reading /tmp/prayog_heroBannersStore.json:", err);
  }

  // 3. Read from repo STORAGE_PATH
  try {
    if (fs.existsSync(STORAGE_PATH)) {
      const raw = fs.readFileSync(STORAGE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const filtered = parsed.filter((b: HeroBanner) => !deleted.has(b.id));
        globalRef.__heroBannersStore = filtered;
        return filtered;
      }
    }
  } catch (err) {
    console.error("Error reading heroBannersStore.json:", err);
  }

  const defaults = DEFAULT_HERO_BANNERS.filter((b) => !deleted.has(b.id));
  globalRef.__heroBannersStore = defaults;
  return [...defaults];
}

function saveBannersToDisk(banners: HeroBanner[]): boolean {
  const deleted = getDeletedBannerIds();
  const cleanBanners = banners.filter((b) => !deleted.has(b.id));
  globalRef.__heroBannersStore = cleanBanners;

  let written = false;

  // Try writing to repo path (works in local dev / persistent server)
  try {
    fs.writeFileSync(STORAGE_PATH, JSON.stringify(cleanBanners, null, 2), "utf-8");
    written = true;
  } catch {
    // Expected on Vercel read-only filesystem (/var/task)
  }

  // Always write to /tmp (works in Vercel serverless lambda)
  try {
    fs.writeFileSync(TMP_STORAGE_PATH, JSON.stringify(cleanBanners, null, 2), "utf-8");
    written = true;
  } catch (err) {
    console.error("Error writing /tmp/prayog_heroBannersStore.json:", err);
  }

  return written;
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

  // Tombstone deleted banner permanently so it can never be resurrected
  recordDeletedBannerId(id);

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
