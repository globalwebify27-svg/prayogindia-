import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { OFFERS_DATA } from '@/data/offersData';

/**
 * GET /api/offers/[slug]
 * Returns single public promotional offer details with associated product references.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  if (!slug) {
    return NextResponse.json({ success: false, message: 'Offer slug or ID is required.' }, { status: 400 });
  }

  if (process.env.DATABASE_URL) {
    try {
      const offer = await db.offer.findFirst({
        where: {
          OR: [
            { slug },
            { id: slug },
          ],
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
                  inStock: true,
                },
              },
            },
          },
        },
      });

      if (offer) {
        return NextResponse.json({
          success: true,
          data: {
            ...offer,
            products: offer.products.map(p => p.product),
            productIds: offer.products.map(p => p.productId),
          },
        });
      }
    } catch (error) {
      console.warn('Database lookup failed for offer slug', error);
    }
  }

  const mockOffer = OFFERS_DATA.find(o => o.slug === slug || o.id === slug);
  if (!mockOffer) {
    return NextResponse.json({ success: false, message: 'Offer not found.' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: mockOffer,
  });
}
