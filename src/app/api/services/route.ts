import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SERVICES_DATA } from "@/data/servicesData";

/**
 * GET /api/services
 * Returns public list of Prayog India Turnkey Technology & STEM services.
 */
export async function GET() {
  if (process.env.DATABASE_URL) {
    try {
      const dbServices = await db.service.findMany({
        select: {
          id: true,
          slug: true,
          name: true,
          shortDescription: true,
          description: true,
          bannerImage: true,
          features: true,
          applications: true,
          gallery: true,
        },
      });

      if (dbServices.length > 0) {
        return NextResponse.json({
          success: true,
          data: dbServices.map((s) => ({
            ...s,
            image: s.bannerImage,
          })),
        });
      }
    } catch (error) {
      console.warn(
        "Database query failed for services, falling back to dataset",
        error,
      );
    }
  }

  return NextResponse.json({
    success: true,
    data: SERVICES_DATA,
  });
}
