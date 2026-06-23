"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/guard";
import { persistOrder } from "@/lib/reorder";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function read(fd: FormData) {
  return { name: String(fd.get("name") ?? "").trim(), ratePct: Number(fd.get("ratePct") ?? 0) || 0, isDefault: fd.get("isDefault") === "on" };
}
export async function createTaxClass(fd: FormData) {
  await requirePermission("catalog.manage");
  const d = read(fd);
  if (d.isDefault) await prisma.taxClass.updateMany({ data: { isDefault: false } });
  const last = await prisma.taxClass.findFirst({ orderBy: { sortOrder: "desc" } });
  await prisma.taxClass.create({ data: { ...d, sortOrder: (last?.sortOrder ?? -1) + 1 } });
  revalidatePath("/admin/tax-classes");
  redirect("/admin/tax-classes");
}
export async function updateTaxClass(fd: FormData) {
  await requirePermission("catalog.manage");
  const id = String(fd.get("id"));
  const d = read(fd);
  if (d.isDefault) await prisma.taxClass.updateMany({ data: { isDefault: false } });
  await prisma.taxClass.update({ where: { id }, data: d });
  revalidatePath("/admin/tax-classes");
  redirect("/admin/tax-classes");
}
export async function deleteTaxClass(fd: FormData) {
  await requirePermission("catalog.manage");
  await prisma.taxClass.delete({ where: { id: String(fd.get("id")) } });
  revalidatePath("/admin/tax-classes");
}
export async function reorderTaxClasses(ids: string[]) {
  await requirePermission("catalog.manage");
  await persistOrder(ids, (id, sortOrder) => prisma.taxClass.update({ where: { id }, data: { sortOrder } }));
  revalidatePath("/admin/tax-classes");
}
