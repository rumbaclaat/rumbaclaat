"use server";

import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { parseLines, parsePairs } from "@/lib/blocks/registry";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { PublishStatus } from "@/generated/prisma/client";

function readCocktail(fd: FormData) {
  const name = String(fd.get("name") ?? "").trim();
  const str = (k: string) => String(fd.get(k) ?? "").trim() || null;
  const timeRaw = String(fd.get("timeMins") ?? "").trim();
  const serviceNotes: Record<string, string> = {};
  for (const p of parsePairs(fd.get("serviceNotes"))) serviceNotes[p.a] = p.b;
  return {
    name,
    slug: slugify(String(fd.get("slug") ?? "").trim() || name),
    eyebrow: str("eyebrow"),
    lede: str("lede"),
    difficulty: str("difficulty"),
    occasion: str("occasion"),
    timeMins: timeRaw ? parseInt(timeRaw, 10) : null,
    ingredients: parseLines(fd.get("ingredients")) as object,
    method: parseLines(fd.get("method")) as object,
    serviceNotes: serviceNotes as object,
    bartenderTip: str("bartenderTip"),
    image: str("image"),
    featuredProductId: str("featuredProductId"),
    ratingAvg: String(fd.get("ratingAvg") ?? "").trim() ? Number(fd.get("ratingAvg")) : null,
    ratingCount: parseInt(String(fd.get("ratingCount") ?? "0"), 10) || 0,
    tags: parseLines(fd.get("tags")),
    status: String(fd.get("status") ?? "draft") as PublishStatus,
  };
}

export async function createCocktail(formData: FormData) {
  await requireStaff();
  const data = readCocktail(formData);
  if (!data.name) throw new Error("Name required");
  await prisma.cocktail.create({ data });
  revalidatePath("/admin/cocktails");
  revalidatePath("/cocktails");
  redirect("/admin/cocktails");
}

export async function updateCocktail(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id"));
  const data = readCocktail(formData);
  await prisma.cocktail.update({ where: { id }, data });
  revalidatePath("/admin/cocktails");
  revalidatePath("/cocktails");
  revalidatePath(`/cocktails/${data.slug}`);
  redirect("/admin/cocktails");
}

export async function deleteCocktail(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id"));
  await prisma.cocktail.delete({ where: { id } });
  revalidatePath("/admin/cocktails");
  revalidatePath("/cocktails");
}
