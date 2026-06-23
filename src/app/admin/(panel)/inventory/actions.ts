"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission, logAudit } from "@/lib/guard";
import { revalidatePath } from "next/cache";

export async function adjustStock(fd: FormData) {
  const s = await requirePermission("catalog.manage");
  const productId = String(fd.get("productId"));
  const delta = parseInt(String(fd.get("delta") ?? "0"), 10) || 0;
  const reason = String(fd.get("reason") ?? "correction");
  const note = String(fd.get("note") ?? "").trim() || null;
  if (!productId || !delta) { revalidatePath("/admin/inventory"); return; }
  await prisma.$transaction([
    prisma.product.update({ where: { id: productId }, data: { stockQty: { increment: delta } } }),
    prisma.stockAdjustment.create({ data: { productId, delta, reason, note, createdBy: s.email } }),
  ]);
  await logAudit({ session: s, action: "stock.adjust", entityType: "Product", entityId: productId, summary: String(delta) });
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
}
