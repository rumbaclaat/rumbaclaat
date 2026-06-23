"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/guard";
import { persistOrder } from "@/lib/reorder";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function read(fd: FormData) {
  return {
    category: String(fd.get("category") ?? "").trim() || null,
    question: String(fd.get("question") ?? "").trim(),
    answer: String(fd.get("answer") ?? "").trim(),
  };
}
export async function createFaq(fd: FormData) {
  await requirePermission("content.edit");
  const last = await prisma.fAQItem.findFirst({ orderBy: { sortOrder: "desc" } });
  await prisma.fAQItem.create({ data: { ...read(fd), sortOrder: (last?.sortOrder ?? -1) + 1 } });
  revalidatePath("/admin/faq");
  redirect("/admin/faq");
}
export async function updateFaq(fd: FormData) {
  await requirePermission("content.edit");
  await prisma.fAQItem.update({ where: { id: String(fd.get("id")) }, data: read(fd) });
  revalidatePath("/admin/faq");
  redirect("/admin/faq");
}
export async function deleteFaq(fd: FormData) {
  await requirePermission("content.edit");
  await prisma.fAQItem.delete({ where: { id: String(fd.get("id")) } });
  revalidatePath("/admin/faq");
}
export async function reorderFaq(ids: string[]) {
  await requirePermission("content.edit");
  await persistOrder(ids, (id, sortOrder) => prisma.fAQItem.update({ where: { id }, data: { sortOrder } }));
  revalidatePath("/admin/faq");
}
