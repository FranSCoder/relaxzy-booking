import { PrismaClient } from "@prisma/client";

// Prevent multiple instances of Prisma Client in development (Next.js hot reload)
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query", "error", "warn"], // optional: helpful for debugging
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
