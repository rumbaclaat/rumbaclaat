"use server";

import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ProductType, PublishStatus } from "@/generated/prisma/client";

function str(fd: FormData, k: string): string | null {
  const v = String(fd.get(k) ?? "").trim();
  return v === "" ? null : v;
}
function num(fd: FormData, k: string): number {
  return Number(fd.get(k) ?? 0) || 0;
}
function optNum(fd: FormData, k: string): number | null {
  const v = String(fd.get(k) ?? "").trim();
  return v === "" ? null : Number(v);
}
function int(fd: FormData, k: string): number {
  return parseInt(String(fd.get(k) ?? "0"), 10) || 0;
}

function readProduct(fd: FormData) {
  const name = String(fd.get("name") ?? "").trim();
  const saleEnd = String(fd.get("saleEndDate") ?? "").trim();
  return {
    name,
    slug: slugify(String(fd.get("slug") ?? "").trim() || name),
    sku: String(fd.get("sku") ?? "").trim(),
    type: (String(fd.get("type") ?? "rum") as ProductType),
    subtitle: str(fd, "subtitle"),
    description: str(fd, "description"),
    categoryId: (String(fd.get("categoryId") ?? "").trim() || null),
    basePrice: num(fd, "basePrice"),
    onSale: fd.get("onSale") === "on",
    salePrice: optNum(fd, "salePrice"),
    saleEndDate: saleEnd ? new Date(saleEnd) : null,
    basePoints: int(fd, "basePoints"),
    abv: optNum(fd, "abv"),
    volume: str(fd, "volume"),
    origin: str(fd, "origin"),
    material: str(fd, "material"),
    stockQty: int(fd, "stockQty"),
    maxQtyPerOrder: String(fd.get("maxQtyPerOrder") ?? "").trim()
      ? int(fd, "maxQtyPerOrder")
      : null,
    status: (String(fd.get("status") ?? "draft") as PublishStatus),
  };
}

export async function createProduct(formData: FormData) {
  await requireStaff();
  const data = readProduct(formData);
  if (!data.name || !data.sku) throw new Error("Name and SKU are required");
  const created = await prisma.product.create({ data });
  revalidatePath("/admin/products");
  redirect(`/admin/products/${created.id}`);
}

export async function updateProduct(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id"));
  const data = readProduct(formData);
  await prisma.product.update({ where: { id }, data });
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id"));
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
}

export async function addVariant(formData: FormData) {
  await requireStaff();
  const productId = String(formData.get("productId"));
  const colourName = str(formData, "colourName");
  const size = str(formData, "size");
  const base = String(formData.get("sku") ?? "").trim();
  const sku =
    base ||
    [
      (await prisma.product.findUnique({ where: { id: productId } }))?.sku ??
        "var",
      colourName ?? "",
      size ?? "",
    ]
      .filter(Boolean)
      .join("-");

  await prisma.productVariant.create({
    data: {
      productId,
      colourName,
      colourHex: str(formData, "colourHex"),
      size,
      sku,
      stockQty: int(formData, "stockQty"),
      priceDelta: num(formData, "priceDelta"),
    },
  });
  revalidatePath(`/admin/products/${productId}`);
}

export async function deleteVariant(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id"));
  const productId = String(formData.get("productId"));
  await prisma.productVariant.delete({ where: { id } });
  revalidatePath(`/admin/products/${productId}`);
}
