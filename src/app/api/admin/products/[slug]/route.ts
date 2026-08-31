import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedAdmin } from '@/lib/adminAuth';

// PATCH /api/admin/products/[slug] - Update Product (Price, Stock, InStock Status)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
  }

  const resolvedParams = await params;
  const targetIdOrSlug = resolvedParams.slug;

  try {
    const body = await request.json();
    const { price, stock, inStock, name, description } = body;

    if (process.env.DATABASE_URL) {
      const updateData: any = {};
      if (price !== undefined) updateData.price = parseFloat(price);
      if (stock !== undefined) {
        updateData.stock = parseInt(stock, 10);
        updateData.inStock = parseInt(stock, 10) > 0;
      }
      if (inStock !== undefined) updateData.inStock = Boolean(inStock);
      if (name) updateData.name = name;
      if (description) updateData.description = description;

      const updated = await db.product.update({
        where: { id: targetIdOrSlug },
        data: updateData,
      });

      return NextResponse.json({
        success: true,
        message: 'Product updated successfully.',
        data: updated,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Product updated (Mock Mode).',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
