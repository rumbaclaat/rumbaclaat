"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/guard";
import { persistOrder } from "@/lib/reorder";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function read(fd: FormData) {
  return {
    name: String(fd.get("name") ?? "").trim(),
    description: String(fd.get("description") ?? "").trim() || null,
    pointsCost: parseInt(String(fd.get("pointsCost") ?? "0"), 10) || 0,
    type: String(fd.get("type") ?? "credit"),
    value: String(fd.get("value") ?? "").trim() || null,
    availability: String(fd.get("availability") ?? "available"),
  };
}
export async function createReward(fd: FormData) {
  await requirePermission("loyalty.manage");
  const last = await prisma.reward.findFirst({ orderBy: { sortOrder: "desc" } });
  await prisma.reward.create({ data: { ...read(fd), sortOrder: (last?.sortOrder ?? -1) + 1 } });
  revalidatePath("/admin/rewards");
  redirect("/admin/rewards");
}
export async function updateReward(fd: FormData) {
  await requirePermission("loyalty.manage");
  await prisma.reward.update({ where: { id: String(fd.get("id")) }, data: read(fd) });
  revalidatePath("/admin/rewards");
  redirect("/admin/rewards");
}
export async function deleteReward(fd: FormData) {
  await requirePermission("loyalty.manage");
  await prisma.reward.delete({ where: { id: String(fd.get("id")) } });
  revalidatePath("/admin/rewards");
}
export async function reorderRewards(ids: string[]) {
  await requirePermission("loyalty.manage");
  await persistOrder(ids, (id, sortOrder) => prisma.reward.update({ where: { id }, data: { sortOrder } }));
  revalidatePath("/admin/rewards");
}
