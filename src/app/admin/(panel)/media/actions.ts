"use server";

import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function uploadMedia(formData: FormData) {
  await requireStaff();
  const file = formData.get("file") as File | null;
  const alt = String(formData.get("alt") ?? "").trim() || null;
  if (!file || file.size === 0) return;

  const admin = createAdminClient();
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
  const path = `uploads/${Date.now()}-${safe}`;

  const { error } = await admin.storage
    .from("media")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);

  const { data: pub } = admin.storage.from("media").getPublicUrl(path);

  await prisma.media.create({
    data: { bucketPath: path, url: pub.publicUrl, alt, mimeType: file.type },
  });
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
