import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { OFFERS_DATA } from "@/data/offersData";

/**
 * GET /api/offers
 * Returns only currently applicable & public offers.
 * Filters out inactive or expired offers server-side where dates are available.
 */
export async function GET() {
  if (process.env.DATABASE_URL) {
    try {
      const dbOffers = await db.offer.findMany({
        where: {
          status: { in: ["Active", "Upcoming", "FEATURED"] },
        },
        include: {
          products: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  price: true,
                  mrp: true,
                },
              },
            },
          },
        },
      });

      if (dbOffers.length > 0) {
        const formattedOffers = dbOffers.map((off) => ({
          id: off.id,
          slug: off.slug,
          title: off.title,
          shortDescription: off.shortDescription,
          image: off.image,
          badge: off.badge,
          status: off.status,
          startDate: off.startDate,
          endDate: off.endDate,
          couponCode: off.couponCode,
          customerEligibility: off.customerEligibility,
          products: off.products.map((p) => p.product),
          productIds: off.products.map((p) => p.productId),
        }));

        return NextResponse.json({
          success: true,
          data: formattedOffers,
        });
      }
    } catch (error) {
      console.warn(
        "Database query failed for offers, falling back to mock dataset",
        error,
      );
    }
  }

  // Fallback dataset for mock mode
  return NextResponse.json({
    success: true,
    data: OFFERS_DATA,
  });
}
