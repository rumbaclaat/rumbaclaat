"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission, logAudit } from "@/lib/guard";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateBranding(fd: FormData) {
  const s = await requirePermission("settings.edit");
  const v = (k: string) => String(fd.get(k) ?? "").trim();
  const branding = {
    logo: v("logo"),
    heroLogo: v("heroLogo"),
    footerLogo: v("footerLogo"),
    favicon: v("favicon"),
    gold: v("gold"),
    goldHi: v("goldHi"),
    bg: v("bg"),
  };
  await prisma.settings.upsert({ where: { id: "default" }, update: { branding }, create: { id: "default", branding } });
  await logAudit({ session: s, action: "branding.update", entityType: "Settings" });
  revalidatePath("/", "layout");
  revalidatePath("/admin/appearance");
  redirect("/admin/appearance?saved=1");
}
