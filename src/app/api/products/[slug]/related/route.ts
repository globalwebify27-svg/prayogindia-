import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PRODUCTS } from '@/data/mockData';

/**
 * GET /api/products/[slug]/related
 * Returns related products in the same category excluding the current product.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const resolvedParams = await params;
  const currentSlug = resolvedParams.slug;
  const { searchParams } = new URL(request.url);
  const limit = Math.min(10, Math.max(1, parseInt(searchParams.get('limit') || '4', 10)));

  if (!currentSlug) {
    return NextResponse.json({ success: false, message: 'Product slug is required.' }, { status: 400 });
  }

  if (process.env.DATABASE_URL) {
    try {
      const currentProduct = await db.product.findFirst({
        where: { OR: [{ slug: currentSlug }, { id: currentSlug }] },
      });

      if (currentProduct) {
        const relatedProducts = await db.product.findMany({
          where: {
            categoryId: currentProduct.categoryId,
            id: { not: currentProduct.id },
            inStock: true,
          },
          include: { category: true, images: true, variants: true },
          take: limit,
        });

        return NextResponse.json({
          success: true,
          data: relatedProducts,
        });
      }
    } catch (error) {
      console.warn('Database query failed for related products, falling back to mock dataset', error);
    }
  }

  // Fallback Mock Dataset
  const matchCurrent = PRODUCTS.find(p => p.id === currentSlug || p.slug === currentSlug) || PRODUCTS[0];
  const relatedMock = PRODUCTS.filter(
    p => p.category === matchCurrent.category && p.id !== matchCurrent.id
  ).slice(0, limit);

  return NextResponse.json({
    success: true,
    data: relatedMock.length > 0 ? relatedMock : PRODUCTS.filter(p => p.id !== matchCurrent.id).slice(0, limit),
  });
}
