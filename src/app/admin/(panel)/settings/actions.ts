"use server";

import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateSettings(formData: FormData) {
  await requireStaff();

  const num = (k: string) => Number(formData.get(k) ?? 0);
  const int = (k: string) => parseInt(String(formData.get(k) ?? "0"), 10) || 0;

  const data = {
    shippingStandardCost: num("shippingStandardCost"),
    shippingExpressCost: num("shippingExpressCost"),
    freeShippingThreshold: num("freeShippingThreshold"),
    pointsPerPound: int("pointsPerPound"),
    vatRatePct: int("vatRatePct"),
    currency: String(formData.get("currency") ?? "GBP"),
    ageThreshold: int("ageThreshold"),
  };

  await prisma.settings.upsert({
    where: { id: "default" },
    update: data,
    create: { id: "default", ...data },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
  redirect("/admin/settings?saved=1");
}
