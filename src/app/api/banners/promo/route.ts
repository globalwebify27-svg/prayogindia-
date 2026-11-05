import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import {
  DEFAULT_PRODUCT_PROMO_BANNER,
  ProductPromoBanner,
} from "@/data/productPromoBannerData";
import { getSecurityHeaders } from "@/lib/security";

const STORAGE_PATH = path.join(
  process.cwd(),
  "src",
  "data",
  "productPromoBannerStore.json"
);

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getPromoBannerFromDisk(): ProductPromoBanner {
  try {
    if (fs.existsSync(STORAGE_PATH)) {
      const raw = fs.readFileSync(STORAGE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && parsed.id) {
        return {
          ...DEFAULT_PRODUCT_PROMO_BANNER,
          ...parsed,
        };
      }
    }
  } catch (err) {
    console.error("Error reading productPromoBannerStore.json:", err);
  }
  return { ...DEFAULT_PRODUCT_PROMO_BANNER };
}

function savePromoBannerToDisk(banner: ProductPromoBanner): boolean {
  try {
    fs.writeFileSync(STORAGE_PATH, JSON.stringify(banner, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing productPromoBannerStore.json:", err);
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

export async function GET() {
  const headers = getNoCacheHeaders();
  const banner = getPromoBannerFromDisk();
  return NextResponse.json(
    {
      success: true,
      data: banner,
    },
    { headers }
  );
}

export async function POST(request: Request) {
  const headers = getNoCacheHeaders();
  try {
    const body: Partial<ProductPromoBanner> = await request.json();
    const current = getPromoBannerFromDisk();

    const updated: ProductPromoBanner = {
      ...current,
      ...body,
      id: body.id || current.id || "product-promo-1",
      redirectUrl: (body.redirectUrl || current.redirectUrl || "/download").trim(),
      updatedAt: new Date().toISOString(),
    };

    const saved = savePromoBannerToDisk(updated);
    if (!saved) {
      return NextResponse.json(
        { success: false, message: "Failed to write banner to disk storage." },
        { status: 500, headers }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Product promo banner updated successfully.",
        data: updated,
      },
      { headers }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Invalid payload." },
      { status: 400, headers }
    );
  }
}

export async function PUT(request: Request) {
  return POST(request);
}

