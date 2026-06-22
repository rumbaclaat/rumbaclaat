import { defineConfig } from "prisma/config";

// Prisma 7 reads connection URLs from here (no longer from schema.prisma).
// Loads .env.local (Next's convention) first, then .env, into process.env.
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Prisma 7 config takes a single `url`. For Supabase use the direct/session
    // connection here (migrations); the app can use a pooled URL at runtime.
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || "",
  },
});
