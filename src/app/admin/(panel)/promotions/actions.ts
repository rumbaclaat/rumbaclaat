"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission, logAudit } from "@/lib/guard";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function date(fd: FormData, k: string): Date | null {
  const v = String(fd.get(k) ?? "").trim();
  return v ? new Date(v) : null;
}
function read(fd: FormData) {
  return {
    name: String(fd.get("name") ?? "").trim(),
    code: String(fd.get("code") ?? "").trim().toUpperCase() || null,
    discountType: String(fd.get("discountType") ?? "percentage"),
    value: Number(fd.get("value") ?? 0) || 0,
    appliesTo: String(fd.get("appliesTo") ?? "all"),
    targetId: String(fd.get("targetId") ?? "").trim() || null,
    minSpend: String(fd.get("minSpend") ?? "").trim() ? Number(fd.get("minSpend")) : null,
    usageLimit: String(fd.get("usageLimit") ?? "").trim() ? parseInt(String(fd.get("usageLimit")), 10) : null,
    perCustomerLimit: String(fd.get("perCustomerLimit") ?? "").trim() ? parseInt(String(fd.get("perCustomerLimit")), 10) : null,
    startDate: date(fd, "startDate"),
    endDate: date(fd, "endDate"),
    badgeLabel: String(fd.get("badgeLabel") ?? "").trim() || null,
    active: fd.get("active") === "on",
  };
}

async function assertCodeUnique(code: string | null, exceptId?: string) {
  if (!code) return;
  const existing = await prisma.promotion.findFirst({ where: { code, ...(exceptId ? { id: { not: exceptId } } : {}) } });
  if (existing) throw new Error(`Coupon code "${code}" is already in use`);
}

export async function createPromotion(fd: FormData) {
  const s = await requirePermission("promotions.edit");
  const data = read(fd);
  await assertCodeUnique(data.code);
  const p = await prisma.promotion.create({ data });
  await logAudit({ session: s, action: "promotion.create", entityType: "Promotion", entityId: p.id, summary: data.name });
  revalidatePath("/admin/promotions");
  redirect("/admin/promotions");
}
export async function updatePromotion(fd: FormData) {
  await requirePermission("promotions.edit");
  const id = String(fd.get("id"));
  const data = read(fd);
  await assertCodeUnique(data.code, id);
  await prisma.promotion.update({ where: { id }, data });
  revalidatePath("/admin/promotions");
  redirect("/admin/promotions");
}
export async function deletePromotion(fd: FormData) {
  await requirePermission("promotions.edit");
  await prisma.promotion.delete({ where: { id: String(fd.get("id")) } });
  revalidatePath("/admin/promotions");
}
