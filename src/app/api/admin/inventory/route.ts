import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedAdmin } from '@/lib/adminAuth';

// GET /api/admin/inventory - Get stock & availability across all products & variants
export async function GET(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Forbidden. Admin access required.' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim();
  const lowStockOnly = searchParams.get('lowStock') === 'true';

  if (process.env.DATABASE_URL) {
    try {
      const where: any = {};
      if (lowStockOnly) where.stock = { lte: 5 };
      if (q) {
        where.OR = [
          { name: { contains: q, mode: 'insensitive' } },
          { sku: { contains: q, mode: 'insensitive' } },
        ];
      }

      const products = await db.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          sku: true,
          price: true,
          stock: true,
          inStock: true,
          updatedAt: true,
          category: { select: { name: true } },
          variants: true,
        },
        orderBy: { stock: 'asc' },
      });

      return NextResponse.json({
        success: true,
        data: products,
      });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true, data: [] });
}

// PATCH /api/admin/inventory - Batch/Single stock level updates with validation
export async function PATCH(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Forbidden. Admin access required.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { productId, stock } = body;

    if (!productId || typeof stock !== 'number' || stock < 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid product ID or negative stock quantity.' },
        { status: 400 }
      );
    }

    if (process.env.DATABASE_URL) {
      const updated = await db.$transaction(async (tx) => {
        return tx.product.update({
          where: { id: productId },
          data: {
            stock,
            inStock: stock > 0,
          },
        });
      });

      return NextResponse.json({
        success: true,
        message: 'Inventory updated successfully.',
        data: updated,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Inventory updated (Mock mode).',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
