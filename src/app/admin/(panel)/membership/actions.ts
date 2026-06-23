"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/guard";
import { persistOrder } from "@/lib/reorder";
import { slugify } from "@/lib/slug";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function read(fd: FormData) {
  const name = String(fd.get("name") ?? "").trim();
  return {
    name,
    slug: slugify(String(fd.get("slug") ?? "").trim() || name),
    priceMonthly: Number(fd.get("priceMonthly") ?? 0) || 0,
    priceAnnual: Number(fd.get("priceAnnual") ?? 0) || 0,
    pointsMultiplier: Number(fd.get("pointsMultiplier") ?? 1) || 1,
    memberDiscountPct: parseInt(String(fd.get("memberDiscountPct") ?? "0"), 10) || 0,
    isFree: fd.get("isFree") === "on",
    benefits: String(fd.get("benefits") ?? "").split("\n").map((s) => s.trim()).filter(Boolean),
  };
}
export async function createTier(fd: FormData) {
  await requirePermission("loyalty.manage");
  const last = await prisma.membershipTier.findFirst({ orderBy: { sortOrder: "desc" } });
  await prisma.membershipTier.create({ data: { ...read(fd), sortOrder: (last?.sortOrder ?? -1) + 1 } });
  revalidatePath("/admin/membership");
  redirect("/admin/membership");
}
export async function updateTier(fd: FormData) {
  await requirePermission("loyalty.manage");
  await prisma.membershipTier.update({ where: { id: String(fd.get("id")) }, data: read(fd) });
  revalidatePath("/admin/membership");
  redirect("/admin/membership");
}
export async function deleteTier(fd: FormData) {
  await requirePermission("loyalty.manage");
  await prisma.membershipTier.delete({ where: { id: String(fd.get("id")) } });
  revalidatePath("/admin/membership");
}
export async function reorderTiers(ids: string[]) {
  await requirePermission("loyalty.manage");
  await persistOrder(ids, (id, sortOrder) => prisma.membershipTier.update({ where: { id }, data: { sortOrder } }));
  revalidatePath("/admin/membership");
}
