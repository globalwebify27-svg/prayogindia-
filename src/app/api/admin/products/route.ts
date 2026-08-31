import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedAdmin } from '@/lib/adminAuth';
import { PRODUCTS } from '@/data/mockData';

// GET /api/admin/products - List All Products for Admin Management
export async function GET(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim();
  const category = searchParams.get('category');
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '15', 10)));

  if (process.env.DATABASE_URL) {
    try {
      const where: any = {};
      if (category && category !== 'all') where.categoryId = category;
      if (q) {
        where.OR = [
          { name: { contains: q, mode: 'insensitive' } },
          { sku: { contains: q, mode: 'insensitive' } },
        ];
      }

      const [items, total] = await Promise.all([
        db.product.findMany({
          where,
          include: { category: true, images: true, variants: true },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        db.product.count({ where }),
      ]);

      return NextResponse.json({
        success: true,
        data: { items, total, page, limit, totalPages: Math.ceil(total / limit) },
      });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  // Mock Fallback
  let items = [...PRODUCTS];
  if (q) items = items.filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || p.sku.toLowerCase().includes(q.toLowerCase()));
  if (category && category !== 'all') items = items.filter(p => p.category === category);

  return NextResponse.json({
    success: true,
    data: {
      items: items.slice((page - 1) * limit, page * limit),
      total: items.length,
      page,
      limit,
      totalPages: Math.ceil(items.length / limit),
    },
  });
}

// POST /api/admin/products - Create New Product
export async function POST(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, categoryId, price, mrp, stock, sku, description, brand = 'Prayog India' } = body;

    if (!name || !price || !sku || !description) {
      return NextResponse.json({ success: false, message: 'Required product fields missing.' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    if (process.env.DATABASE_URL) {
      // Find default category if categoryId not provided
      let targetCatId = categoryId;
      if (!targetCatId) {
        const defaultCat = await db.category.findFirst();
        targetCatId = defaultCat?.id;
      }

      if (!targetCatId) {
        return NextResponse.json({ success: false, message: 'Category required to create product.' }, { status: 400 });
      }

      const createdProduct = await db.product.create({
        data: {
          name,
          slug,
          sku,
          description,
          price: parseFloat(price),
          mrp: mrp ? parseFloat(mrp) : null,
          stock: parseInt(stock || 0, 10),
          inStock: parseInt(stock || 0, 10) > 0,
          brand,
          categoryId: targetCatId,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Product created successfully.',
        data: createdProduct,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Product created (Mock Mode).',
      data: { id: `prod-mock-${Date.now()}`, name, slug, price, stock, sku },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
