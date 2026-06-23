"use server";

import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getCustomer } from "@/lib/auth";
import { creditPoints } from "@/lib/points";
import { revalidatePath } from "next/cache";
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

export async function subscribeTier(formData: FormData) {
  const session = await getCustomer();
  if (!session) redirect("/account");
  const tierId = String(formData.get("tierId"));
  const billingCycle = String(formData.get("billingCycle") ?? "monthly");
  const tier = await prisma.membershipTier.findUnique({ where: { id: tierId } });
  if (!tier) redirect("/account");

  await prisma.customer.update({
    where: { id: session!.customer.id },
    data: { membershipTierId: tier.id },
  });

  if (tier.isFree) {
    await prisma.membershipSubscription.updateMany({
      where: { customerId: session!.customer.id },
      data: { status: "cancelled", cancelledAt: new Date() },
    });
  } else {
    const price = billingCycle === "annual" ? tier.priceAnnual : tier.priceMonthly;
    await prisma.membershipSubscription.upsert({
      where: { customerId: session!.customer.id },
      update: { tierId: tier.id, billingCycle, price, status: "active", cancelledAt: null },
      create: { customerId: session!.customer.id, tierId: tier.id, billingCycle, price, status: "active" },
    });
  }

  revalidatePath("/account");
  redirect("/account?tier=1");
}

export async function redeemReward(formData: FormData) {
  const session = await getCustomer();
  if (!session) redirect("/account");
  const rewardId = String(formData.get("rewardId"));
  const reward = await prisma.reward.findUnique({ where: { id: rewardId } });
  if (!reward || reward.availability !== "available") redirect("/account?error=reward");
  if (session!.customer.pointsBalance < reward!.pointsCost) redirect("/account?error=points");

  await creditPoints(session!.customer.id, -reward!.pointsCost, "redemption", {
    relatedRewardId: reward!.id,
    note: reward!.name,
  });
  revalidatePath("/account");
  redirect("/account?redeemed=1");
}
