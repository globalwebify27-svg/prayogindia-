import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { DEFAULT_CATEGORY_SHOWCASE, CategoryCardItem } from "@/data/defaultCategoryShowcase";

const STORE_PATH = path.join(process.cwd(), "src", "data", "categoryShowcaseStore.json");

async function readStore(): Promise<CategoryCardItem[]> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // fallback
  }
  return DEFAULT_CATEGORY_SHOWCASE;
}

async function writeStore(data: CategoryCardItem[]): Promise<void> {
  const dir = path.dirname(STORE_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("activeOnly") === "true";

    let items = await readStore();

    if (activeOnly) {
      items = items.filter((item) => item.isActive !== false);
    }

    items.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    return NextResponse.json({ success: true, data: items });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to load showcase categories." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: "Payload must be an array of category showcase items." },
        { status: 400 }
      );
    }

    await writeStore(body);

    return NextResponse.json({
      success: true,
      message: "Category showcase items updated successfully.",
      data: body,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to save showcase categories." },
      { status: 500 }
    );
  }
}
