import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CATEGORIES } from "@/data/mockData";

// GET /api/categories - Public Customer Categories API
export async function GET() {
  try {
    if (process.env.DATABASE_URL) {
      const dbCategories = await db.category.findMany({
        orderBy: { name: "asc" },
      });
      if (dbCategories.length > 0) {
        return NextResponse.json({
          success: true,
          data: dbCategories,
          source: "database",
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: CATEGORIES,
      source: "mock",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}
