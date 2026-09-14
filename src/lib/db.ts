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
