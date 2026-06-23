"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/guard";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function read(fd: FormData) {
  return {
    code: String(fd.get("code") ?? "").trim().toUpperCase(),
    symbol: String(fd.get("symbol") ?? "").trim() || "£",
    rate: Number(fd.get("rate") ?? 1) || 1,
    isBase: fd.get("isBase") === "on",
    active: fd.get("active") === "on",
  };
}
export async function createCurrency(fd: FormData) {
  await requirePermission("settings.edit");
  const d = read(fd);
  if (!d.code) return;
  if (d.isBase) await prisma.currency.updateMany({ data: { isBase: false } });
  await prisma.currency.create({ data: d });
  revalidatePath("/admin/currencies");
  redirect("/admin/currencies");
}
export async function updateCurrency(fd: FormData) {
  await requirePermission("settings.edit");
  const code = String(fd.get("origCode") ?? fd.get("code"));
  const d = read(fd);
  if (d.isBase) await prisma.currency.updateMany({ data: { isBase: false } });
  await prisma.currency.update({ where: { code }, data: { symbol: d.symbol, rate: d.rate, isBase: d.isBase, active: d.active } });
  revalidatePath("/admin/currencies");
  redirect("/admin/currencies");
}
export async function deleteCurrency(fd: FormData) {
  await requirePermission("settings.edit");
  await prisma.currency.delete({ where: { code: String(fd.get("id")) } });
  revalidatePath("/admin/currencies");
}
