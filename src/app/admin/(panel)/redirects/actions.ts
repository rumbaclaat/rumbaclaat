"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/guard";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function read(fd: FormData) {
  return {
    fromPath: String(fd.get("fromPath") ?? "").trim(),
    toPath: String(fd.get("toPath") ?? "").trim(),
    statusCode: parseInt(String(fd.get("statusCode") ?? "301"), 10) || 301,
    active: fd.get("active") === "on",
  };
}
export async function createRedirect(fd: FormData) {
  await requirePermission("content.edit");
  const d = read(fd);
  if (!d.fromPath || !d.toPath) return;
  await prisma.redirect.create({ data: d });
  revalidatePath("/admin/redirects");
  redirect("/admin/redirects");
}
export async function updateRedirect(fd: FormData) {
  await requirePermission("content.edit");
  await prisma.redirect.update({ where: { id: String(fd.get("id")) }, data: read(fd) });
  revalidatePath("/admin/redirects");
  redirect("/admin/redirects");
}
export async function deleteRedirect(fd: FormData) {
  await requirePermission("content.edit");
  await prisma.redirect.delete({ where: { id: String(fd.get("id")) } });
  revalidatePath("/admin/redirects");
}
