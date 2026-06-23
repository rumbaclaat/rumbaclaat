"use server";

import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/auth";
import { uploadToMediaLibrary } from "@/lib/media";
import { revalidatePath } from "next/cache";

export async function uploadMedia(formData: FormData) {
  await requireStaff();
  const file = formData.get("file") as File | null;
  const alt = String(formData.get("alt") ?? "").trim() || null;
  if (!file || file.size === 0) return;

  await uploadToMediaLibrary(file, alt);
  revalidatePath("/admin/media");
}

export async function deleteMedia(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id"));
  const media = await prisma.media.findUnique({ where: { id } });
  if (media) {
    const admin = createAdminClient();
    await admin.storage.from("media").remove([media.bucketPath]);
    await prisma.media.delete({ where: { id } });
  }
  revalidatePath("/admin/media");
}
