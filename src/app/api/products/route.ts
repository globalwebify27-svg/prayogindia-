import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PRODUCTS, Product } from '@/data/mockData';

// Allowed Predefined Sorting Whitelist
const ALLOWED_SORT_OPTIONS = ['newest', 'price-asc', 'price-desc', 'name'];

// GET /api/products - Customer Product List with Search, Multi-Filter, Safe Sort & Server Pagination
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category')?.trim();
    const search = searchParams.get('q')?.trim();
    const minPriceParam = searchParams.get('minPrice');
    const maxPriceParam = searchParams.get('maxPrice');
    const inStockOnly = searchParams.get('inStock') === 'true';
    const sortParam = searchParams.get('sort') || 'newest';

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') || '12', 10)));

    // Validate & Clamp Price Range Filters
    let minPrice: number | null = null;
    let maxPrice: number | null = null;

    if (minPriceParam) {
      const parsedMin = parseFloat(minPriceParam);
      if (!isNaN(parsedMin) && parsedMin >= 0) minPrice = parsedMin;
    }
    if (maxPriceParam) {
      const parsedMax = parseFloat(maxPriceParam);
      if (!isNaN(parsedMax) && parsedMax >= 0) maxPrice = parsedMax;
    }

    if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
      return NextResponse.json(
        { success: false, message: 'Invalid price range: minPrice cannot be greater than maxPrice.' },
        { status: 400 }
      );
    }

    // Validate Sort Whitelist
    const safeSort = ALLOWED_SORT_OPTIONS.includes(sortParam) ? sortParam : 'newest';

    // 1. PostgreSQL Relational Database Mode
    if (process.env.DATABASE_URL) {
      const where: any = {};

      if (category && category !== 'all') {
        where.OR = [
          { categoryId: category },
          { category: { slug: { equals: category, mode: 'insensitive' } } },
        ];
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { brand: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (inStockOnly) {
        where.inStock = true;
      }

      if (minPrice !== null || maxPrice !== null) {
        where.price = {};
        if (minPrice !== null) where.price.gte = minPrice;
        if (maxPrice !== null) where.price.lte = maxPrice;
      }

      let orderBy: any = { createdAt: 'desc' };
      if (safeSort === 'price-asc') orderBy = { price: 'asc' };
      if (safeSort === 'price-desc') orderBy = { price: 'desc' };
      if (safeSort === 'name') orderBy = { name: 'asc' };

      const [products, total] = await Promise.all([
        db.product.findMany({
          where,
          include: { category: true, images: true, variants: true },
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
        }),
        db.product.count({ where }),
      ]);

      return NextResponse.json({
        success: true,
        data: products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
        source: 'database',
      });
    }

    // 2. Mock Fallback Filtering Mode
    let result = [...PRODUCTS];

    if (category && category !== 'all') {
      result = result.filter(
        p => p.category.toLowerCase().replace(/\s+/g, '-') === category.toLowerCase()
      );
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q))
      );
    }

    if (inStockOnly) {
      result = result.filter(p => p.inStock);
    }

    if (minPrice !== null) {
      result = result.filter(p => p.price >= minPrice!);
    }
    if (maxPrice !== null) {
      result = result.filter(p => p.price <= maxPrice!);
    }

    if (safeSort === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (safeSort === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (safeSort === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    const total = result.length;
    const paginatedItems = result.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      success: true,
      data: paginatedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
      source: 'mock',
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch products catalogue.' },
      { status: 500 }
    );
  }
}
