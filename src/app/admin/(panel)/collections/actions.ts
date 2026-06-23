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
    description: String(fd.get("description") ?? "").trim() || null,
    image: String(fd.get("image") ?? "").trim() || null,
    heroImage: String(fd.get("heroImage") ?? "").trim() || null,
    active: fd.get("active") === "on",
  };
}

export async function createCollection(fd: FormData) {
  await requirePermission("catalog.manage");
  const last = await prisma.collection.findFirst({ orderBy: { sortOrder: "desc" } });
  await prisma.collection.create({ data: { ...read(fd), sortOrder: (last?.sortOrder ?? -1) + 1 } });
  revalidatePath("/admin/collections");
  redirect("/admin/collections");
}
export async function updateCollection(fd: FormData) {
  await requirePermission("catalog.manage");
  await prisma.collection.update({ where: { id: String(fd.get("id")) }, data: read(fd) });
  revalidatePath("/admin/collections");
  redirect("/admin/collections");
}
export async function deleteCollection(fd: FormData) {
  await requirePermission("catalog.manage");
  await prisma.collection.delete({ where: { id: String(fd.get("id")) } });
  revalidatePath("/admin/collections");
}
export async function reorderCollections(ids: string[]) {
  await requirePermission("catalog.manage");
  await persistOrder(ids, (id, sortOrder) => prisma.collection.update({ where: { id }, data: { sortOrder } }));
  revalidatePath("/admin/collections");
}
