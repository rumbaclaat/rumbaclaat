"use server";

import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function registerCustomer(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const firstName = String(formData.get("firstName") ?? "").trim() || null;
  const lastName = String(formData.get("lastName") ?? "").trim() || null;

  if (!email || password.length < 8) {
    redirect("/account?error=invalid");
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error || !data.user) {
    redirect("/account?error=exists");
  }

  const bronze = await prisma.membershipTier.findFirst({ where: { slug: "bronze" } });
  await prisma.customer.upsert({
    where: { email },
    update: { authUserId: data.user.id, firstName, lastName },
    create: {
      email,
      authUserId: data.user.id,
      firstName,
      lastName,
      membershipTierId: bronze?.id ?? null,
    },
  });

  redirect("/account?registered=1");
}

export async function signOutCustomer() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/account");
}
