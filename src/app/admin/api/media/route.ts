import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { uploadToMediaLibrary } from "@/lib/media";

export const dynamic = "force-dynamic";

// List media for the picker modal (searchable, newest first).
export async function GET(req: NextRequest) {
  await requireStaff();
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  const items = await prisma.media.findMany({
    where: q
      ? {
          OR: [
            { alt: { contains: q, mode: "insensitive" } },
            { bucketPath: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 300,
  });
  return NextResponse.json(items);
}

// Inline upload used by ImageField (returns the created Media with its URL).
export async function POST(req: NextRequest) {
  await requireStaff();
  const form = await req.formData();
  const file = form.get("file") as File | null;
  const alt = String(form.get("alt") ?? "").trim() || null;
  if (!file || file.size === 0) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  const media = await uploadToMediaLibrary(file, alt);
  return NextResponse.json(media);
}
