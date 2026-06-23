"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/guard";
import { persistOrder } from "@/lib/reorder";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function read(fd: FormData) {
  const free = String(fd.get("freeOver") ?? "").trim();
  return {
    name: String(fd.get("name") ?? "").trim(),
    countries: String(fd.get("countries") ?? "").split(",").map((s) => s.trim()).filter(Boolean),
    price: Number(fd.get("price") ?? 0) || 0,
    freeOver: free ? Number(free) : null,
  };
}
export async function createZone(fd: FormData) {
  await requirePermission("catalog.manage");
  const last = await prisma.shippingZone.findFirst({ orderBy: { sortOrder: "desc" } });
  await prisma.shippingZone.create({ data: { ...read(fd), sortOrder: (last?.sortOrder ?? -1) + 1 } });
  revalidatePath("/admin/shipping-zones");
  redirect("/admin/shipping-zones");
}
export async function updateZone(fd: FormData) {
  await requirePermission("catalog.manage");
  await prisma.shippingZone.update({ where: { id: String(fd.get("id")) }, data: read(fd) });
  revalidatePath("/admin/shipping-zones");
  redirect("/admin/shipping-zones");
}
export async function deleteZone(fd: FormData) {
  await requirePermission("catalog.manage");
  await prisma.shippingZone.delete({ where: { id: String(fd.get("id")) } });
  revalidatePath("/admin/shipping-zones");
}
export async function reorderZones(ids: string[]) {
  await requirePermission("catalog.manage");
  await persistOrder(ids, (id, sortOrder) => prisma.shippingZone.update({ where: { id }, data: { sortOrder } }));
  revalidatePath("/admin/shipping-zones");
}
