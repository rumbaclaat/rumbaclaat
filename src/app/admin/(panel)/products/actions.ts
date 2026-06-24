"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission, logAudit } from "@/lib/guard";
import { persistOrder } from "@/lib/reorder";
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
function date(fd: FormData, k: string): Date | null {
  const v = String(fd.get(k) ?? "").trim();
  return v ? new Date(v) : null;
}

function readProduct(fd: FormData) {
  const name = String(fd.get("name") ?? "").trim();
  return {
    name,
    slug: slugify(String(fd.get("slug") ?? "").trim() || name),
    sku: String(fd.get("sku") ?? "").trim(),
    type: String(fd.get("type") ?? "rum") as ProductType,
    subtitle: str(fd, "subtitle"),
    description: str(fd, "description"),
    categoryId: String(fd.get("categoryId") ?? "").trim() || null,
    taxClassId: String(fd.get("taxClassId") ?? "").trim() || null,
    shippingClassId: String(fd.get("shippingClassId") ?? "").trim() || null,
    basePrice: num(fd, "basePrice"),
    onSale: fd.get("onSale") === "on",
    salePrice: optNum(fd, "salePrice"),
    saleEndDate: date(fd, "saleEndDate"),
    basePoints: int(fd, "basePoints"),
    abv: optNum(fd, "abv"),
    volume: str(fd, "volume"),
    origin: str(fd, "origin"),
    tastingNotes: str(fd, "tastingNotes"),
    caskType: str(fd, "caskType"),
    ageStatement: str(fd, "ageStatement"),
    material: str(fd, "material"),
    gsm: str(fd, "gsm"),
    fit: str(fd, "fit"),
    careInstructions: str(fd, "careInstructions"),
    stockQty: int(fd, "stockQty"),
    lowStockThreshold: String(fd.get("lowStockThreshold") ?? "").trim() ? int(fd, "lowStockThreshold") : null,
    maxQtyPerOrder: String(fd.get("maxQtyPerOrder") ?? "").trim() ? int(fd, "maxQtyPerOrder") : null,
    imageUrl: str(fd, "imageUrl"),
    galleryImages: String(fd.get("galleryImages") ?? "").split(/[\n,]/).map((s) => s.trim()).filter(Boolean),
    seoTitle: str(fd, "seoTitle"),
    seoDescription: str(fd, "seoDescription"),
    canonical: str(fd, "canonical"),
    publishAt: date(fd, "publishAt"),
    unpublishAt: date(fd, "unpublishAt"),
    status: String(fd.get("status") ?? "draft") as PublishStatus,
  };
}

async function setCollections(productId: string, ids: string[]) {
  await prisma.productCollection.deleteMany({ where: { productId } });
  if (ids.length) {
    await prisma.productCollection.createMany({
      data: ids.map((collectionId, i) => ({ productId, collectionId, sortOrder: i })),
      skipDuplicates: true,
    });
  }
}

export async function createProduct(formData: FormData) {
  const s = await requirePermission("products.edit");
  const data = readProduct(formData);
  if (!data.name || !data.sku) throw new Error("Name and SKU are required");
  const created = await prisma.product.create({ data });
  await setCollections(created.id, formData.getAll("collections").map(String).filter(Boolean));
  await logAudit({ session: s, action: "product.create", entityType: "Product", entityId: created.id, summary: data.name });
  revalidatePath("/admin/products");
  redirect(`/admin/products/${created.id}`);
}

export async function updateProduct(formData: FormData) {
  const s = await requirePermission("products.edit");
  const id = String(formData.get("id"));
  const data = readProduct(formData);
  await prisma.product.update({ where: { id }, data });
  await setCollections(id, formData.getAll("collections").map(String).filter(Boolean));
  await logAudit({ session: s, action: "product.update", entityType: "Product", entityId: id });
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  const s = await requirePermission("products.delete");
  const id = String(formData.get("id"));
  await prisma.product.delete({ where: { id } });
  await logAudit({ session: s, action: "product.delete", entityType: "Product", entityId: id });
  revalidatePath("/admin/products");
}

export async function cloneProduct(formData: FormData) {
  const s = await requirePermission("products.edit");
  const id = String(formData.get("id"));
  const src = await prisma.product.findUnique({ where: { id }, include: { variants: true, collections: true } });
  if (!src) return;
  const suffix = Math.floor((Date.now() / 1000) % 100000);
  const created = await prisma.product.create({
    data: {
      name: `${src.name} (copy)`, slug: `${src.slug}-copy-${suffix}`, sku: `${src.sku}-COPY-${suffix}`,
      type: src.type, subtitle: src.subtitle, description: src.description, categoryId: src.categoryId,
      taxClassId: src.taxClassId, shippingClassId: src.shippingClassId, basePrice: src.basePrice,
      basePoints: src.basePoints, abv: src.abv, volume: src.volume, origin: src.origin,
      tastingNotes: src.tastingNotes, caskType: src.caskType, ageStatement: src.ageStatement,
      material: src.material, gsm: src.gsm, fit: src.fit, careInstructions: src.careInstructions,
      stockQty: src.stockQty, imageUrl: src.imageUrl, galleryImages: src.galleryImages, status: "draft",
    },
  });
  if (src.variants.length) {
    await prisma.productVariant.createMany({
      data: src.variants.map((v) => ({
        productId: created.id, name: v.name, colourName: v.colourName, colourHex: v.colourHex,
        size: v.size, sku: `${v.sku}-C${suffix}`, priceDelta: v.priceDelta, stockQty: v.stockQty,
        imageUrl: v.imageUrl, active: v.active, sortOrder: v.sortOrder,
      })),
    });
  }
  await setCollections(created.id, src.collections.map((c) => c.collectionId));
  await logAudit({ session: s, action: "product.clone", entityType: "Product", entityId: created.id });
  revalidatePath("/admin/products");
  redirect(`/admin/products/${created.id}`);
}

export async function bulkProductStatus(ids: string[], status: string) {
  await requirePermission("products.edit");
  await prisma.product.updateMany({ where: { id: { in: ids } }, data: { status: status as PublishStatus } });
  revalidatePath("/admin/products");
}

export async function bulkDeleteProducts(ids: string[]) {
  await requirePermission("products.delete");
  await prisma.product.deleteMany({ where: { id: { in: ids } } });
  revalidatePath("/admin/products");
}

export async function importProductsCsv(formData: FormData) {
  await requirePermission("products.edit");
  const file = formData.get("file") as File | null;
  if (!file) return;
  const text = await file.text();
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const header = lines.shift()?.split(",").map((h) => h.trim().toLowerCase()) ?? [];
  const col = (row: string[], name: string) => row[header.indexOf(name)]?.trim() ?? "";
  for (const line of lines) {
    const row = line.split(",");
    const sku = col(row, "sku");
    if (!sku) continue;
    const name = col(row, "name") || sku;
    const data = {
      name, sku, slug: slugify(name + "-" + sku),
      type: (col(row, "type") || "rum") as ProductType,
      basePrice: Number(col(row, "price") || col(row, "baseprice") || 0) || 0,
      stockQty: parseInt(col(row, "stock") || col(row, "stockqty") || "0", 10) || 0,
      status: (col(row, "status") || "draft") as PublishStatus,
    };
    const existing = await prisma.product.findUnique({ where: { sku } });
    if (existing) await prisma.product.update({ where: { sku }, data: { name: data.name, basePrice: data.basePrice, stockQty: data.stockQty, status: data.status } });
    else await prisma.product.create({ data });
  }
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

// ---- variants ----

export async function addVariant(formData: FormData) {
  await requirePermission("products.edit");
  const productId = String(formData.get("productId"));
  const colourName = str(formData, "colourName");
  const size = str(formData, "size");
  const base = String(formData.get("sku") ?? "").trim();
  const sku = base || [(await prisma.product.findUnique({ where: { id: productId } }))?.sku ?? "var", colourName ?? "", size ?? ""].filter(Boolean).join("-");
  const last = await prisma.productVariant.findFirst({ where: { productId }, orderBy: { sortOrder: "desc" } });
  await prisma.productVariant.create({
    data: {
      productId, name: str(formData, "name"), colourName, colourHex: str(formData, "colourHex"), size, sku,
      stockQty: int(formData, "stockQty"), priceDelta: num(formData, "priceDelta"),
      imageUrl: str(formData, "imageUrl"), active: true, sortOrder: (last?.sortOrder ?? -1) + 1,
    },
  });
  revalidatePath(`/admin/products/${productId}`);
}

export async function updateVariant(formData: FormData) {
  await requirePermission("products.edit");
  const id = String(formData.get("id"));
  const productId = String(formData.get("productId"));
  await prisma.productVariant.update({
    where: { id },
    data: {
      name: str(formData, "name"), colourName: str(formData, "colourName"), colourHex: str(formData, "colourHex"),
      size: str(formData, "size"), priceDelta: num(formData, "priceDelta"), stockQty: int(formData, "stockQty"),
      imageUrl: str(formData, "imageUrl"), active: formData.get("active") === "on",
    },
  });
  revalidatePath(`/admin/products/${productId}`);
}

export async function deleteVariant(formData: FormData) {
  await requirePermission("products.edit");
  const id = String(formData.get("id"));
  const productId = String(formData.get("productId"));
  await prisma.productVariant.delete({ where: { id } });
  revalidatePath(`/admin/products/${productId}`);
}

export async function reorderVariants(productId: string, ids: string[]) {
  await requirePermission("products.edit");
  await persistOrder(ids, (id, sortOrder) => prisma.productVariant.update({ where: { id }, data: { sortOrder } }));
  revalidatePath(`/admin/products/${productId}`);
}
