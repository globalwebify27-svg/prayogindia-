import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { LEARNING_RESOURCES, LearningResource } from '@/data/learningData';

/**
 * GET /api/learning
 * List public Learning Hub content with server-side search (q), category filter, level filter, and pagination.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim().toLowerCase();
  const category = searchParams.get('category')?.trim();
  const level = searchParams.get('level')?.trim();
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));

  if (process.env.DATABASE_URL) {
    try {
      const whereClause: any = {};

      if (category && category !== 'all') {
        whereClause.category = { equals: category, mode: 'insensitive' };
      }

      if (level && level !== 'all') {
        whereClause.level = { equals: level, mode: 'insensitive' };
      }

      if (q) {
        whereClause.OR = [
          { title: { contains: q, mode: 'insensitive' } },
          { shortDescription: { contains: q, mode: 'insensitive' } },
          { content: { contains: q, mode: 'insensitive' } },
        ];
      }

      const total = await db.learningContent.count({ where: whereClause });
      const totalPages = Math.ceil(total / limit) || 1;

      const items = await db.learningContent.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      });

      if (items.length > 0) {
        return NextResponse.json({
          success: true,
          data: {
            items,
            page,
            limit,
            total,
            totalPages,
          },
        });
      }
    } catch (error) {
      console.warn('Database query failed for learning content, falling back to mock dataset', error);
    }
  }

  // Fallback dataset filtering for mock mode
  let filtered = [...LEARNING_RESOURCES];

  if (category && category !== 'all') {
    filtered = filtered.filter(item => item.category.toLowerCase() === category.toLowerCase());
  }

  if (level && level !== 'all') {
    filtered = filtered.filter(item => item.level.toLowerCase() === level.toLowerCase());
  }

  if (q) {
    filtered = filtered.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.shortDescription.toLowerCase().includes(q) ||
      item.content.toLowerCase().includes(q)
    );
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const paginatedItems = filtered.slice((page - 1) * limit, page * limit);

  return NextResponse.json({
    success: true,
    data: {
      items: paginatedItems,
      page,
      limit,
      total,
      totalPages,
    },
  });
}
