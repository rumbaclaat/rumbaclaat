import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Prisma 7 uses driver adapters (no Rust engine). Pool over the Supabase
// Postgres connection string.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "",
});

// Reuse a single PrismaClient across hot reloads in development.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
