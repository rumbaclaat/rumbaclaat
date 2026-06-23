"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/guard";
import { persistOrder } from "@/lib/reorder";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function read(fd: FormData) {
  const free = String(fd.get("freeOver") ?? "").trim();
  return { name: String(fd.get("name") ?? "").trim(), price: Number(fd.get("price") ?? 0) || 0, freeOver: free ? Number(free) : null, isDefault: fd.get("isDefault") === "on" };
}
export async function createShippingClass(fd: FormData) {
  await requirePermission("catalog.manage");
  const d = read(fd);
  if (d.isDefault) await prisma.shippingClass.updateMany({ data: { isDefault: false } });
  const last = await prisma.shippingClass.findFirst({ orderBy: { sortOrder: "desc" } });
  await prisma.shippingClass.create({ data: { ...d, sortOrder: (last?.sortOrder ?? -1) + 1 } });
  revalidatePath("/admin/shipping-classes");
  redirect("/admin/shipping-classes");
}
export async function updateShippingClass(fd: FormData) {
  await requirePermission("catalog.manage");
  const id = String(fd.get("id"));
  const d = read(fd);
  if (d.isDefault) await prisma.shippingClass.updateMany({ data: { isDefault: false } });
  await prisma.shippingClass.update({ where: { id }, data: d });
  revalidatePath("/admin/shipping-classes");
  redirect("/admin/shipping-classes");
}
export async function deleteShippingClass(fd: FormData) {
  await requirePermission("catalog.manage");
  await prisma.shippingClass.delete({ where: { id: String(fd.get("id")) } });
  revalidatePath("/admin/shipping-classes");
}
export async function reorderShippingClasses(ids: string[]) {
  await requirePermission("catalog.manage");
  await persistOrder(ids, (id, sortOrder) => prisma.shippingClass.update({ where: { id }, data: { sortOrder } }));
  revalidatePath("/admin/shipping-classes");
}
