import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  __schemaVersion?: number;
};

const CURRENT_SCHEMA_VERSION = 3;

/**
 * Ensures optimal connection pooling parameters for Supabase PgBouncer in serverless (Vercel) environments.
 * - connection_limit=1 prevents lambda pool exhaustion
 * - connect_timeout=10 and pool_timeout=10 prevent indefinitely blocked requests
 */
function getOptimizedDatabaseUrl(): string | undefined {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) return undefined;
  try {
    const url = new URL(rawUrl);
    const isPooler =
      url.port === "6543" ||
      url.searchParams.get("pgbouncer") === "true" ||
      url.hostname.includes("pooler.supabase.com");

    if (isPooler) {
      if (!url.searchParams.has("pgbouncer")) {
        url.searchParams.set("pgbouncer", "true");
      }
      if (!url.searchParams.has("connection_limit")) {
        url.searchParams.set("connection_limit", "1");
      }
      if (!url.searchParams.has("pool_timeout")) {
        url.searchParams.set("pool_timeout", "10");
      }
      if (!url.searchParams.has("connect_timeout")) {
        url.searchParams.set("connect_timeout", "10");
      }
    }
    return url.toString();
  } catch {
    return rawUrl;
  }
}

const isStale =
  !globalForPrisma.prisma ||
  globalForPrisma.__schemaVersion !== CURRENT_SCHEMA_VERSION ||
  !("review" in globalForPrisma.prisma) ||
  !("invoice" in globalForPrisma.prisma) ||
  !("auditLog" in globalForPrisma.prisma) ||
  !("loyaltyRule" in globalForPrisma.prisma) ||
  !("orderCancellation" in globalForPrisma.prisma) ||
  !("customerAuthIdentity" in globalForPrisma.prisma) ||
  !("customerSession" in globalForPrisma.prisma) ||
  !("otpVerification" in globalForPrisma.prisma);

if (isStale && globalForPrisma.prisma) {
  try {
    globalForPrisma.prisma.$disconnect();
  } catch (_) {}
}

const optimizedUrl = getOptimizedDatabaseUrl();

export const prisma =
  !isStale && globalForPrisma.prisma
    ? globalForPrisma.prisma
    : new PrismaClient({
        datasources: optimizedUrl
          ? {
              db: {
                url: optimizedUrl,
              },
            }
          : undefined,
        log:
          process.env.NODE_ENV === "development"
            ? ["error", "warn"]
            : ["error"],
      });

// Persist prisma singleton globally across all environments (including Vercel warm lambdas)
globalForPrisma.prisma = prisma;
globalForPrisma.__schemaVersion = CURRENT_SCHEMA_VERSION;

export const db = prisma;

/**
 * Returns true if DATABASE_URL is configured with a valid reachable connection.
 * If running on Vercel or in production, guards against localhost/127.0.0.1 which cannot be reached.
 */
export const isDatabaseAvailable = (): boolean => {
  const url = process.env.DATABASE_URL;
  if (!url) return false;
  if (
    process.env.VERCEL ||
    process.env.VERCEL_ENV ||
    process.env.NEXT_PUBLIC_VERCEL_ENV ||
    process.env.NODE_ENV === "production"
  ) {
    if (
      url.includes("localhost") ||
      url.includes("127.0.0.1") ||
      url.includes("0.0.0.0")
    ) {
      return false;
    }
  }
  return true;
};

/**
 * Actively checks live database connectivity by running a lightweight ping query.
 * Returns true if PostgreSQL responds, false otherwise.
 */
export const checkDatabaseConnection = async (): Promise<boolean> => {
  if (!isDatabaseAvailable()) return false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
};
