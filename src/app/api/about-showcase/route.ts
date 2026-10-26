// src/app/api/about-showcase/route.ts

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import {
  DEFAULT_ABOUT_SHOWCASE,
  AboutShowcaseItem,
  sortShowcaseItems,
} from "@/data/aboutShowcaseData";
import { getSecurityHeaders } from "@/lib/security";

const STORAGE_PATH = path.join(
  process.cwd(),
  "src",
  "data",
  "aboutShowcaseStore.json",
);

function getItemsFromDisk(): AboutShowcaseItem[] {
  try {
    if (fs.existsSync(STORAGE_PATH)) {
      const raw = fs.readFileSync(STORAGE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error reading aboutShowcaseStore.json:", err);
  }
  return [...DEFAULT_ABOUT_SHOWCASE];
}

function saveItemsToDisk(items: AboutShowcaseItem[]): boolean {
  try {
    fs.writeFileSync(STORAGE_PATH, JSON.stringify(items, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing aboutShowcaseStore.json:", err);
    return false;
  }
}

let cachedItems: AboutShowcaseItem[] = getItemsFromDisk();

export async function GET(request: Request) {
  const headers = getSecurityHeaders();
  const { searchParams } = new URL(request.url);
  const activeOnly = searchParams.get("activeOnly") === "true";

  if (!cachedItems || cachedItems.length === 0) {
    cachedItems = getItemsFromDisk();
  }

  const list = activeOnly
    ? cachedItems.filter((item) => item.isActive)
    : cachedItems;

  return NextResponse.json(
    {
      success: true,
      data: sortShowcaseItems(list),
    },
    { headers },
  );
}

export async function POST(request: Request) {
  const headers = getSecurityHeaders();
  try {
    const body: Partial<AboutShowcaseItem> = await request.json();

    if (!body.title || !body.image) {
      return NextResponse.json(
        { success: false, message: "Title and Image are required." },
        { status: 400, headers },
      );
    }

    const newItem: AboutShowcaseItem = {
      id: body.id || `showcase-${Date.now()}`,
      title: body.title.trim(),
      badge: body.badge?.trim() || "Showcase Highlight",
      iconType: body.iconType || "users",
      bubbleColor: body.bubbleColor || "blue",
      description: body.description?.trim() || "",
      image: body.image.trim(),
      alt: body.alt?.trim() || body.title.trim(),
      displayOrder:
        typeof body.displayOrder === "number"
          ? body.displayOrder
          : (cachedItems.length + 1),
      isActive: typeof body.isActive === "boolean" ? body.isActive : true,
    };

    cachedItems.push(newItem);
    saveItemsToDisk(cachedItems);

    return NextResponse.json(
      { success: true, data: newItem, message: "Showcase picture added successfully." },
      { status: 201, headers },
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ success: false, message: msg }, { status: 500, headers });
  }
}

export async function PUT(request: Request) {
  const headers = getSecurityHeaders();
  try {
    const body = await request.json();

    // Check if bulk reordering
    if (Array.isArray(body)) {
      cachedItems = body;
      saveItemsToDisk(cachedItems);
      return NextResponse.json(
        { success: true, data: sortShowcaseItems(cachedItems), message: "Reordered successfully." },
        { headers },
      );
    }

    const { id, ...updates } = body as Partial<AboutShowcaseItem>;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Item ID is required." },
        { status: 400, headers },
      );
    }

    const index = cachedItems.findIndex((item) => item.id === id);
    if (index === -1) {
      return NextResponse.json(
        { success: false, message: "Item not found." },
        { status: 404, headers },
      );
    }

    cachedItems[index] = {
      ...cachedItems[index],
      ...updates,
      title: updates.title?.trim() ?? cachedItems[index].title,
      badge: updates.badge?.trim() ?? cachedItems[index].badge,
      description: updates.description?.trim() ?? cachedItems[index].description,
      image: updates.image?.trim() ?? cachedItems[index].image,
    };

    saveItemsToDisk(cachedItems);

    return NextResponse.json(
      { success: true, data: cachedItems[index], message: "Updated successfully." },
      { headers },
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ success: false, message: msg }, { status: 500, headers });
  }
}

export async function DELETE(request: Request) {
  const headers = getSecurityHeaders();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Item ID is required." },
        { status: 400, headers },
      );
    }

    const initialLen = cachedItems.length;
    cachedItems = cachedItems.filter((item) => item.id !== id);

    if (cachedItems.length === initialLen) {
      return NextResponse.json(
        { success: false, message: "Item not found." },
        { status: 404, headers },
      );
    }

    saveItemsToDisk(cachedItems);

    return NextResponse.json(
      { success: true, message: "Item deleted successfully." },
      { headers },
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ success: false, message: msg }, { status: 500, headers });
  }
}
