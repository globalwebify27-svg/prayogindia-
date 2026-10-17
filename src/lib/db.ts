import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const isStale =
  globalForPrisma.prisma &&
  (!("review" in globalForPrisma.prisma) ||
    !("invoice" in globalForPrisma.prisma) ||
    !("auditLog" in globalForPrisma.prisma) ||
    !("loyaltyRule" in globalForPrisma.prisma));

export const prisma =
  !isStale && globalForPrisma.prisma
    ? globalForPrisma.prisma
    : new PrismaClient({
        log:
          process.env.NODE_ENV === "development"
            ? ["query", "error", "warn"]
            : ["error"],
      });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export const db = prisma;

/**
 * Returns true if DATABASE_URL is configured with a valid reachable connection.
 * If running on Vercel or in production, guards against localhost/127.0.0.1 which cannot be reached.
 */
export const isDatabaseAvailable = (): boolean => {
  const url = process.env.DATABASE_URL;
  if (!url) return false;
  if (
    (process.env.VERCEL || process.env.NODE_ENV === "production") &&
    (url.includes("localhost") || url.includes("127.0.0.1"))
  ) {
    return false;
  }
  return true;
};
