"use server";

import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function readForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  return {
    name,
    slug: slugify(slugRaw || name),
    description: String(formData.get("description") ?? "").trim() || null,
    heroImage: String(formData.get("heroImage") ?? "").trim() || null,
    sortOrder: parseInt(String(formData.get("sortOrder") ?? "0"), 10) || 0,
  };
}

export async function createCategory(formData: FormData) {
  await requireStaff();
  const data = readForm(formData);
  if (!data.name) throw new Error("Name is required");
  await prisma.category.create({ data });
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function updateCategory(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id"));
  const data = readForm(formData);
  await prisma.category.update({ where: { id }, data });
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function deleteCategory(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id"));
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
}
