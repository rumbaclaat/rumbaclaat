"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/guard";
import { persistOrder } from "@/lib/reorder";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createMenu(fd: FormData) {
  await requirePermission("content.edit");
  const location = String(fd.get("location") ?? "").trim();
  if (!location) return;
  const existing = await prisma.navigationMenu.findUnique({ where: { location } });
  const menu = existing ?? (await prisma.navigationMenu.create({ data: { location } }));
  revalidatePath("/admin/navigation");
  redirect(`/admin/navigation/${menu.id}`);
}
export async function deleteMenu(fd: FormData) {
  await requirePermission("content.edit");
  await prisma.navigationMenu.delete({ where: { id: String(fd.get("id")) } });
  revalidatePath("/admin/navigation");
  redirect("/admin/navigation");
}
export async function addNavItem(fd: FormData) {
  await requirePermission("content.edit");
  const menuId = String(fd.get("menuId"));
  const last = await prisma.navItem.findFirst({ where: { menuId }, orderBy: { sortOrder: "desc" } });
  await prisma.navItem.create({
    data: { menuId, label: String(fd.get("label") ?? "").trim(), url: String(fd.get("url") ?? "").trim(), sortOrder: (last?.sortOrder ?? -1) + 1 },
  });
  revalidatePath(`/admin/navigation/${menuId}`);
}
export async function updateNavItem(fd: FormData) {
  await requirePermission("content.edit");
  const id = String(fd.get("id"));
  const menuId = String(fd.get("menuId"));
  await prisma.navItem.update({ where: { id }, data: { label: String(fd.get("label") ?? "").trim(), url: String(fd.get("url") ?? "").trim(), visible: fd.get("visible") === "on" } });
  revalidatePath(`/admin/navigation/${menuId}`);
}
export async function deleteNavItem(fd: FormData) {
  await requirePermission("content.edit");
  const id = String(fd.get("id"));
  const menuId = String(fd.get("menuId"));
  await prisma.navItem.delete({ where: { id } });
  revalidatePath(`/admin/navigation/${menuId}`);
}
export async function reorderNavItems(menuId: string, ids: string[]) {
  await requirePermission("content.edit");
  await persistOrder(ids, (id, sortOrder) => prisma.navItem.update({ where: { id }, data: { sortOrder } }));
  revalidatePath(`/admin/navigation/${menuId}`);
}
