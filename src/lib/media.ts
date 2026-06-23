import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Uploads a file to the Supabase "media" bucket and records it in the Media
 * table. Shared by the media-library page action and the inline image uploader
 * API route. Returns the created Media row (with its public URL).
 */
export async function uploadToMediaLibrary(file: File, alt: string | null) {
  const admin = createAdminClient();
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
  const path = `uploads/${Date.now()}-${safe}`;

  const { error } = await admin.storage
    .from("media")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);

  const { data: pub } = admin.storage.from("media").getPublicUrl(path);

  return prisma.media.create({
    data: { bucketPath: path, url: pub.publicUrl, alt, mimeType: file.type },
  });
}
