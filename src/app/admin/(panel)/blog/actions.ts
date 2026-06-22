"use server";

import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { PublishStatus } from "@/generated/prisma/client";

function readPost(fd: FormData) {
  const title = String(fd.get("title") ?? "").trim();
  const pub = String(fd.get("publishDate") ?? "").trim();
  const str = (k: string) => String(fd.get(k) ?? "").trim() || null;
  return {
    title,
    slug: slugify(String(fd.get("slug") ?? "").trim() || title),
    category: str("category"),
    excerpt: str("excerpt"),
    body: str("body"),
    heroImage: str("heroImage"),
    readTime: str("readTime"),
    featured: fd.get("featured") === "on",
    status: String(fd.get("status") ?? "draft") as PublishStatus,
    publishDate: pub ? new Date(pub) : null,
    seoTitle: str("seoTitle"),
    seoDescription: str("seoDescription"),
  };
}

export async function createPost(formData: FormData) {
  await requireStaff();
  const data = readPost(formData);
  if (!data.title) throw new Error("Title required");
  await prisma.blogPost.create({ data });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  redirect("/admin/blog");
}

export async function updatePost(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id"));
  const data = readPost(formData);
  await prisma.blogPost.update({ where: { id }, data });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${data.slug}`);
  redirect("/admin/blog");
}

export async function deletePost(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id"));
  await prisma.blogPost.delete({ where: { id } });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}
