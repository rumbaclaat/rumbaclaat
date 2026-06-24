"use server";

import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { managedPage, SLOT_DEFAULTS } from "@/lib/section-images";

/**
 * Save (or clear) a single section-image override for a hand-built page.
 * Empty url, or a url equal to the coded default, clears the override so the
 * page falls back to its built-in image.
 */
export async function updateSectionImage(formData: FormData) {
  await requireStaff();

  const key = String(formData.get("key") ?? "");
  const slot = String(formData.get("slot") ?? "");
  const url = String(formData.get("url") ?? "").trim();

  const page = managedPage(key);
  // Whitelist the slot — never write an arbitrary key.
  if (!page || !(slot in SLOT_DEFAULTS)) throw new Error("Unknown section image slot");

  const current = await prisma.settings.findUnique({ where: { id: "default" } });
  const map: Record<string, unknown> = { ...((current?.sectionImages ?? {}) as Record<string, unknown>) };

  if (!url || url === SLOT_DEFAULTS[slot]) delete map[slot];
  else map[slot] = url;

  await prisma.settings.upsert({
    where: { id: "default" },
    update: { sectionImages: map as object },
    create: { id: "default", sectionImages: map as object },
  });

  revalidatePath(`/admin/pages/layouts/${key}`);
  revalidatePath("/admin/pages");
  revalidatePath(page.slug);
}
