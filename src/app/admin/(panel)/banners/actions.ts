"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/guard";
import { persistOrder } from "@/lib/reorder";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function date(fd: FormData, k: string): Date | null {
  const v = String(fd.get(k) ?? "").trim();
  return v ? new Date(v) : null;
}
function read(fd: FormData) {
  return {
    type: String(fd.get("type") ?? "announcement"),
    icon: String(fd.get("icon") ?? "").trim() || null,
    message: String(fd.get("message") ?? "").trim(),
    detail: String(fd.get("detail") ?? "").trim() || null,
    link: String(fd.get("link") ?? "").trim() || null,
    startDate: date(fd, "startDate"),
    endDate: date(fd, "endDate"),
    active: fd.get("active") === "on",
  };
}
export async function createBanner(fd: FormData) {
  await requirePermission("content.edit");
  const last = await prisma.banner.findFirst({ orderBy: { sortOrder: "desc" } });
  await prisma.banner.create({ data: { ...read(fd), sortOrder: (last?.sortOrder ?? -1) + 1 } });
  revalidatePath("/admin/banners");
  redirect("/admin/banners");
}
export async function updateBanner(fd: FormData) {
  await requirePermission("content.edit");
  await prisma.banner.update({ where: { id: String(fd.get("id")) }, data: read(fd) });
  revalidatePath("/admin/banners");
  redirect("/admin/banners");
}
export async function deleteBanner(fd: FormData) {
  await requirePermission("content.edit");
  await prisma.banner.delete({ where: { id: String(fd.get("id")) } });
  revalidatePath("/admin/banners");
}
export async function reorderBanners(ids: string[]) {
  await requirePermission("content.edit");
  await persistOrder(ids, (id, sortOrder) => prisma.banner.update({ where: { id }, data: { sortOrder } }));
  revalidatePath("/admin/banners");
}
