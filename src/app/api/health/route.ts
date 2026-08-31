import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSecurityHeaders } from '@/lib/security';

/**
 * GET /api/health
 * Returns lightweight application & database readiness status without exposing secrets.
 */
export async function GET() {
  const headers = getSecurityHeaders();
  let dbStatus = 'ok';

  if (process.env.DATABASE_URL) {
    try {
      await db.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'degraded';
    }
  } else {
    dbStatus = 'mock_mode';
  }

  return NextResponse.json(
    {
      status: dbStatus === 'degraded' ? 'degraded' : 'ok',
      timestamp: new Date().toISOString(),
      service: 'prayog-india-backend',
      version: '1.0.0',
      database: dbStatus,
    },
    {
      status: dbStatus === 'degraded' ? 503 : 200,
      headers,
    }
  );
}
