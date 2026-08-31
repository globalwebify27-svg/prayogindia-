import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SERVICES_DATA } from '@/data/servicesData';
import { ServiceSlug } from '@prisma/client';

/**
 * GET /api/services/[slug]
 * Returns single service details by slug with 404 handling.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  if (!slug) {
    return NextResponse.json({ success: false, message: 'Service slug is required.' }, { status: 400 });
  }

  if (process.env.DATABASE_URL) {
    try {
      const dbService = await db.service.findFirst({
        where: {
          slug: slug.toUpperCase().replace(/-/g, '_') as ServiceSlug,
        },
      });

      if (dbService) {
        return NextResponse.json({
          success: true,
          data: {
            ...dbService,
            image: dbService.bannerImage,
          },
        });
      }
    } catch (error) {
      console.warn('Database lookup failed for service slug', error);
    }
  }

  const mockService = SERVICES_DATA.find(s => s.slug === slug || s.id === slug);
  if (!mockService) {
    return NextResponse.json({ success: false, message: 'Service not found.' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: mockService,
  });
}
