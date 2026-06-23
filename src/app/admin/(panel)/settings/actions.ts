"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission, logAudit } from "@/lib/guard";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateSettings(fd: FormData) {
  const s = await requirePermission("settings.edit");
  const num = (k: string) => Number(fd.get(k) ?? 0) || 0;
  const int = (k: string) => parseInt(String(fd.get(k) ?? "0"), 10) || 0;
  const str = (k: string) => String(fd.get(k) ?? "").trim() || null;

  const data = {
    shippingStandardCost: num("shippingStandardCost"),
    shippingExpressCost: num("shippingExpressCost"),
    freeShippingThreshold: num("freeShippingThreshold"),
    pointsPerPound: int("pointsPerPound"),
    loyaltyEarnRate: int("loyaltyEarnRate"),
    vatRatePct: int("vatRatePct"),
    currency: String(fd.get("currency") ?? "GBP"),
    baseCurrency: String(fd.get("baseCurrency") ?? "GBP"),
    ageThreshold: int("ageThreshold"),
    ageGateEnabled: fd.get("ageGateEnabled") === "on",
    maintenanceMode: fd.get("maintenanceMode") === "on",
    businessName: str("businessName"),
    businessAddress: str("businessAddress"),
    businessVat: str("businessVat"),
    supportEmail: str("supportEmail"),
    seoDefaultTitle: str("seoDefaultTitle"),
    seoDefaultDescription: str("seoDefaultDescription"),
    paymentConfig: {
      stripePublishableKey: String(fd.get("stripePublishableKey") ?? ""),
      paypalClientId: String(fd.get("paypalClientId") ?? ""),
      mode: String(fd.get("paymentMode") ?? "sandbox"),
      stripeEnabled: fd.get("stripeEnabled") === "on",
      paypalEnabled: fd.get("paypalEnabled") === "on",
      googlePayEnabled: fd.get("googlePayEnabled") === "on",
    },
    emailConfig: {
      fromName: String(fd.get("emailFromName") ?? ""),
      fromEmail: String(fd.get("emailFromEmail") ?? ""),
      provider: String(fd.get("emailProvider") ?? "resend"),
    },
    ghlConfig: {
      locationId: String(fd.get("ghlLocationId") ?? ""),
      customerPipelineId: String(fd.get("ghlCustomerPipeline") ?? ""),
      tradePipelineId: String(fd.get("ghlTradePipeline") ?? ""),
      syncEnabled: fd.get("ghlSyncEnabled") === "on",
    },
  };

  await prisma.settings.upsert({ where: { id: "default" }, update: data, create: { id: "default", ...data } });
  await logAudit({ session: s, action: "settings.update", entityType: "Settings" });
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
  redirect("/admin/settings?saved=1");
}
