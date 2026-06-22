"use server";

import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { BLOCKS } from "@/lib/blocks/registry";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { BlockType, PublishStatus } from "@/generated/prisma/client";

function readPage(fd: FormData) {
  const title = String(fd.get("title") ?? "").trim();
  return {
    title,
    slug: slugify(String(fd.get("slug") ?? "").trim() || title),
    templateType: String(fd.get("templateType") ?? "content"),
    status: String(fd.get("status") ?? "draft") as PublishStatus,
    seoTitle: String(fd.get("seoTitle") ?? "").trim() || null,
    seoDescription: String(fd.get("seoDescription") ?? "").trim() || null,
    ogImage: String(fd.get("ogImage") ?? "").trim() || null,
  };
}

export async function createPage(formData: FormData) {
  await requireStaff();
  const data = readPage(formData);
  if (!data.title) throw new Error("Title required");
  const page = await prisma.page.create({ data });
  revalidatePath("/admin/pages");
  redirect(`/admin/pages/${page.id}`);
}

export async function updatePage(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id"));
  const data = readPage(formData);
  await prisma.page.update({ where: { id }, data });
  revalidatePath("/admin/pages");
  revalidatePath(`/admin/pages/${id}`);
  revalidatePath(`/${data.slug}`);
  redirect(`/admin/pages/${id}`);
}

export async function deletePage(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id"));
  await prisma.page.delete({ where: { id } });
  revalidatePath("/admin/pages");
}

export async function addBlock(formData: FormData) {
  await requireStaff();
  const pageId = String(formData.get("pageId"));
  const type = String(formData.get("type")) as BlockType;
  const def = BLOCKS[type];
  const last = await prisma.contentBlock.findFirst({
    where: { pageId },
    orderBy: { order: "desc" },
  });
  await prisma.contentBlock.create({
    data: {
      pageId,
      type,
      order: (last?.order ?? -1) + 1,
      data: (def?.defaults ?? {}) as object,
    },
  });
  revalidatePath(`/admin/pages/${pageId}`);
}

export async function updateBlock(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id"));
  const pageId = String(formData.get("pageId"));
  const type = String(formData.get("type")) as BlockType;
  const def = BLOCKS[type];
  const data: Record<string, unknown> = {};
  for (const f of def?.fields ?? []) {
    const raw = formData.get(f.key);
    data[f.key] = f.type === "number" ? Number(raw ?? 0) : String(raw ?? "");
  }
  await prisma.contentBlock.update({
    where: { id },
    data: { data: data as object },
  });
  revalidatePath(`/admin/pages/${pageId}`);
}

export async function deleteBlock(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id"));
  const pageId = String(formData.get("pageId"));
  await prisma.contentBlock.delete({ where: { id } });
  revalidatePath(`/admin/pages/${pageId}`);
}

export async function toggleBlock(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id"));
  const pageId = String(formData.get("pageId"));
  const block = await prisma.contentBlock.findUnique({ where: { id } });
  if (block) {
    await prisma.contentBlock.update({
      where: { id },
      data: { visible: !block.visible },
    });
  }
  revalidatePath(`/admin/pages/${pageId}`);
}

export async function moveBlock(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id"));
  const pageId = String(formData.get("pageId"));
  const dir = String(formData.get("dir")); // up | down
  const blocks = await prisma.contentBlock.findMany({
    where: { pageId },
    orderBy: { order: "asc" },
  });
  const idx = blocks.findIndex((b) => b.id === id);
  const swapWith = dir === "up" ? idx - 1 : idx + 1;
  if (idx !== -1 && swapWith >= 0 && swapWith < blocks.length) {
    const a = blocks[idx];
    const b = blocks[swapWith];
    await prisma.$transaction([
      prisma.contentBlock.update({ where: { id: a.id }, data: { order: b.order } }),
      prisma.contentBlock.update({ where: { id: b.id }, data: { order: a.order } }),
    ]);
  }
  revalidatePath(`/admin/pages/${pageId}`);
}
