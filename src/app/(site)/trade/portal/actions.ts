"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function bandForCases(cases: number): string {
  if (cases <= 4) return "1-4";
  if (cases <= 9) return "5-9";
  return "10+";
}

export async function submitTradeOrder(formData: FormData) {
  const productId = String(formData.get("productId"));
  const cases = Math.max(1, parseInt(String(formData.get("cases") ?? "1"), 10) || 1);
  const poReference = String(formData.get("poReference") ?? "").trim() || null;
  const deliveryNotes = String(formData.get("deliveryNotes") ?? "").trim() || null;

  const account = await prisma.tradeAccount.findFirst({ orderBy: { createdAt: "asc" } });
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!account || !product) redirect("/trade/portal");

  const band = bandForCases(cases);
  const pricing = await prisma.tradeProductPricing.findFirst({
    where: { productId, volumeBand: band },
  });
  const ppb = pricing ? Number(pricing.pricePerBottle) : Number(product!.basePrice);
  const bottles = cases * 6;
  const net = Math.round(bottles * ppb * 100) / 100;
  const vat = Math.round(net * 0.2 * 100) / 100;
  const grand = Math.round((net + vat) * 100) / 100;
  const ref = `ORD-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;

  const order = await prisma.tradeOrder.create({
    data: {
      ref,
      tradeAccountId: account!.id,
      lines: [{ productId, name: product!.name, cases, pricePerBottle: ppb }],
      netTotal: net,
      vat,
      grandTotal: grand,
      poReference,
      deliveryNotes,
      status: "processing",
    },
  });
  await prisma.invoice.create({
    data: {
      ref: `INV-${ref.slice(4)}`,
      tradeAccountId: account!.id,
      tradeOrderId: order.id,
      amount: grand,
      vat,
      status: "open",
    },
  });
  await prisma.tradeAccount.update({
    where: { id: account!.id },
    data: { outstandingBalance: { increment: grand } },
  });

  revalidatePath("/trade/portal");
  redirect("/trade/portal?ordered=1");
}

export async function sendTradeMessage(formData: FormData) {
  const account = await prisma.tradeAccount.findFirst({ orderBy: { createdAt: "asc" } });
  if (!account) redirect("/trade/portal");
  const subject = String(formData.get("subject") ?? "").trim() || null;
  const body = String(formData.get("body") ?? "").trim();
  if (body) {
    await prisma.tradeMessage.create({
      data: { tradeAccountId: account!.id, direction: "inbound", subject, body },
    });
  }
  revalidatePath("/trade/portal");
  redirect("/trade/portal?sent=1");
}
