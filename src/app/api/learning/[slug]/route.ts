import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { LEARNING_RESOURCES } from "@/data/learningData";

/**
 * GET /api/learning/[slug]
 * Returns single public Learning Hub resource detail with 404 handling.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  if (!slug) {
    return NextResponse.json(
      { success: false, message: "Learning slug is required." },
      { status: 400 },
    );
  }

  if (process.env.DATABASE_URL) {
    try {
      const item = await db.learningContent.findFirst({
        where: {
          OR: [{ slug }, { id: slug }],
        },
      });

      if (item) {
        return NextResponse.json({
          success: true,
          data: item,
        });
      }
    } catch (error) {
      console.warn("Database lookup failed for learning slug", error);
    }
  }

  const mockItem = LEARNING_RESOURCES.find(
    (l) => l.slug === slug || l.id === slug,
  );
  if (!mockItem) {
    return NextResponse.json(
      { success: false, message: "Learning resource not found." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    data: mockItem,
  });
}
