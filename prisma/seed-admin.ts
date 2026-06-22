/**
 * Creates (or repairs) the back-office super-admin: a Supabase auth user +
 * a StaffUser row. Idempotent. Credentials can be overridden via env:
 *   ADMIN_EMAIL, ADMIN_PASSWORD
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { createClient } from "@supabase/supabase-js";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const EMAIL = process.env.ADMIN_EMAIL || "admin@rumbaclaat.com";
const PASSWORD = process.env.ADMIN_PASSWORD || "RumbaclaatAdmin!2026";

async function main() {
  let authUserId: string | undefined;

  const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
  });

  if (error) {
    // Likely already exists — find it and reset the password to the known value.
    const { data: list } = await supabaseAdmin.auth.admin.listUsers();
    const existing = list?.users?.find((u) => u.email === EMAIL);
    if (!existing) throw error;
    authUserId = existing.id;
    await supabaseAdmin.auth.admin.updateUserById(authUserId, {
      password: PASSWORD,
      email_confirm: true,
    });
  } else {
    authUserId = created.user?.id;
  }

  if (!authUserId) throw new Error("Could not resolve auth user id");

  await prisma.staffUser.upsert({
    where: { authUserId },
    update: { email: EMAIL, role: "super_admin", active: true, name: "Admin" },
    create: {
      authUserId,
      email: EMAIL,
      role: "super_admin",
      active: true,
      name: "Admin",
    },
  });

  console.log("\n✅ Admin ready");
  console.log("   Email:    ", EMAIL);
  console.log("   Password: ", PASSWORD);
  console.log("   Login at: /admin/login\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
