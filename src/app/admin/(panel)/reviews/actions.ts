"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/guard";
import { revalidatePath } from "next/cache";

async function recompute(productId: string) {
  const agg = await prisma.review.aggregate({ where: { productId, status: "live" }, _avg: { rating: true }, _count: true });
  await prisma.product.update({
    where: { id: productId },
    data: { ratingAvg: agg._avg.rating ? Math.round(agg._avg.rating * 100) / 100 : null, reviewCount: agg._count },
  });
}

export async function setReviewStatus(fd: FormData) {
  const s = await requirePermission("reviews.moderate");
  const id = String(fd.get("id"));
  const status = String(fd.get("status"));
  const r = await prisma.review.update({ where: { id }, data: { status, moderatedBy: s.email, moderatedAt: new Date() } });
  await recompute(r.productId);
  revalidatePath("/admin/reviews");
}
export async function featureReview(fd: FormData) {
  await requirePermission("reviews.moderate");
  const id = String(fd.get("id"));
  const r = await prisma.review.findUnique({ where: { id } });
  if (r) await prisma.review.update({ where: { id }, data: { featured: !r.featured } });
  revalidatePath("/admin/reviews");
}
export async function deleteReview(fd: FormData) {
  await requirePermission("reviews.moderate");
  const id = String(fd.get("id"));
  const r = await prisma.review.delete({ where: { id } });
  await recompute(r.productId);
  revalidatePath("/admin/reviews");
}
export async function bulkReviewStatus(ids: string[], status: string) {
  const s = await requirePermission("reviews.moderate");
  const reviews = await prisma.review.findMany({ where: { id: { in: ids } }, select: { productId: true } });
  await prisma.review.updateMany({ where: { id: { in: ids } }, data: { status, moderatedBy: s.email, moderatedAt: new Date() } });
  const productIds = Array.from(new Set(reviews.map((r) => r.productId)));
  for (const pid of productIds) await recompute(pid);
  revalidatePath("/admin/reviews");
}
