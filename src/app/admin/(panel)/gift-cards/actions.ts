"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission, logAudit } from "@/lib/guard";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function genCode() {
  const part = () => Math.random().toString(36).slice(2, 6).toUpperCase();
  return `GC-${part()}-${part()}`;
}

export async function issueGiftCard(fd: FormData) {
  const s = await requirePermission("promotions.edit");
  const amount = Number(fd.get("amount") ?? 0) || 0;
  const card = await prisma.giftCard.create({
    data: {
      code: genCode(), initialAmount: amount, balance: amount,
      recipient: String(fd.get("recipient") ?? "").trim() || null,
      sender: String(fd.get("sender") ?? "").trim() || null,
      message: String(fd.get("message") ?? "").trim() || null,
      status: "active",
      txns: { create: { delta: amount, reason: "issue" } },
    },
  });
  await logAudit({ session: s, action: "giftcard.issue", entityType: "GiftCard", entityId: card.id, summary: card.code });
  revalidatePath("/admin/gift-cards");
  redirect(`/admin/gift-cards/${card.id}`);
}

export async function adjustGiftCard(fd: FormData) {
  await requirePermission("promotions.edit");
  const id = String(fd.get("id"));
  const delta = Number(fd.get("delta") ?? 0) || 0;
  const card = await prisma.giftCard.findUnique({ where: { id } });
  if (!card) return;
  const balance = Number(card.balance) + delta;
  await prisma.$transaction([
    prisma.giftCard.update({ where: { id }, data: { balance, status: balance <= 0 ? "redeemed" : card.status } }),
    prisma.giftCardTxn.create({ data: { giftCardId: id, delta, reason: "adjustment" } }),
  ]);
  revalidatePath(`/admin/gift-cards/${id}`);
}

export async function setGiftCardStatus(fd: FormData) {
  await requirePermission("promotions.edit");
  const id = String(fd.get("id"));
  await prisma.giftCard.update({ where: { id }, data: { status: String(fd.get("status")) } });
  revalidatePath(`/admin/gift-cards/${id}`);
}

export async function deleteGiftCard(fd: FormData) {
  await requirePermission("promotions.edit");
  await prisma.giftCard.delete({ where: { id: String(fd.get("id")) } });
  revalidatePath("/admin/gift-cards");
}
