"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission, logAudit } from "@/lib/guard";
import { sendEmail, emailShell } from "@/lib/email";
import { revalidatePath } from "next/cache";

function str(fd: FormData, k: string): string | null {
  const v = String(fd.get(k) ?? "").trim();
  return v === "" ? null : v;
}
function num(fd: FormData, k: string): number {
  return Number(fd.get(k) ?? 0) || 0;
}

export async function updateTradeAccount(fd: FormData) {
  const s = await requirePermission("trade.manage");
  const id = String(fd.get("id"));
  await prisma.tradeAccount.update({
    where: { id },
    data: {
      phone: str(fd, "phone"),
      businessType: str(fd, "businessType"),
      vatNumber: str(fd, "vatNumber"),
      pricingTier: String(fd.get("pricingTier") ?? "Wholesale"),
      paymentTerms: String(fd.get("paymentTerms") ?? "Net 60"),
      creditLimit: num(fd, "creditLimit"),
      accountManager: str(fd, "accountManager") ?? undefined,
      status: String(fd.get("status") ?? "active"),
    },
  });
  await logAudit({ session: s, action: "trade.update", entityType: "TradeAccount", entityId: id });
  revalidatePath(`/admin/trade/${id}`);
}

export async function createTradeOrder(fd: FormData) {
  await requirePermission("trade.manage");
  const tradeAccountId = String(fd.get("tradeAccountId"));
  const name = String(fd.get("name") ?? "Order");
  const cases = Math.max(1, Math.round(num(fd, "cases")));
  const ppb = num(fd, "pricePerBottle");
  const net = Math.round(cases * 6 * ppb * 100) / 100;
  const vat = Math.round(net * 0.2 * 100) / 100;
  const year = new Date().getFullYear();
  const count = await prisma.tradeOrder.count();
  await prisma.tradeOrder.create({
    data: {
      ref: `ORD-${year}-${6000 + count}`, tradeAccountId,
      lines: [{ name, cases, pricePerBottle: ppb }],
      netTotal: net, vat, grandTotal: net + vat, status: "processing",
    },
  });
  revalidatePath(`/admin/trade/${tradeAccountId}`);
}

export async function createInvoice(fd: FormData) {
  await requirePermission("trade.manage");
  const tradeAccountId = String(fd.get("tradeAccountId"));
  const amount = num(fd, "amount");
  const vat = Math.round(amount * 0.2 * 100) / 100;
  const year = new Date().getFullYear();
  const count = await prisma.invoice.count();
  const due = new Date(); due.setDate(due.getDate() + 60);
  await prisma.invoice.create({
    data: { ref: `INV-${year}-${6000 + count}`, tradeAccountId, amount, vat, status: "open", dueDate: due },
  });
  await prisma.tradeAccount.update({ where: { id: tradeAccountId }, data: { outstandingBalance: { increment: amount + vat } } });
  revalidatePath(`/admin/trade/${tradeAccountId}`);
}

export async function updateInvoiceStatus(fd: FormData) {
  await requirePermission("trade.manage");
  const id = String(fd.get("id"));
  const tradeAccountId = String(fd.get("tradeAccountId"));
  const status = String(fd.get("status"));
  const invoice = await prisma.invoice.findUnique({ where: { id } });
  await prisma.invoice.update({ where: { id }, data: { status } });
  if (invoice && status === "paid") {
    await prisma.tradeAccount.update({ where: { id: tradeAccountId }, data: { outstandingBalance: { decrement: Number(invoice.amount) + Number(invoice.vat) } } });
  }
  revalidatePath(`/admin/trade/${tradeAccountId}`);
}

export async function replyTrade(fd: FormData) {
  const s = await requirePermission("trade.manage");
  const tradeAccountId = String(fd.get("tradeAccountId"));
  const subject = String(fd.get("subject") ?? "").trim() || "Message from Rumbaclaat Trade";
  const body = String(fd.get("body") ?? "").trim();
  const acct = await prisma.tradeAccount.findUnique({ where: { id: tradeAccountId } });
  if (acct && body) {
    const res = await sendEmail({ to: acct.contactEmail, subject, html: emailShell(subject, body.replace(/\n/g, "<br/>")) });
    await prisma.tradeMessage.create({ data: { tradeAccountId, direction: "outbound", subject: res.sent ? subject : `${subject} (not sent)`, body, read: true } });
  }
  await logAudit({ session: s, action: "trade.reply", entityType: "TradeAccount", entityId: tradeAccountId });
  revalidatePath(`/admin/trade/${tradeAccountId}`);
}

export async function addTradePricing(fd: FormData) {
  await requirePermission("trade.manage");
  const tradeAccountId = String(fd.get("tradeAccountId"));
  await prisma.tradeProductPricing.create({
    data: {
      productId: String(fd.get("productId")),
      volumeBand: String(fd.get("volumeBand") ?? "1-4"),
      pricePerBottle: num(fd, "pricePerBottle"),
      pricePerCase: Math.round(num(fd, "pricePerBottle") * 6 * 100) / 100,
    },
  });
  revalidatePath(`/admin/trade/${tradeAccountId}`);
}

export async function deleteTradePricing(fd: FormData) {
  await requirePermission("trade.manage");
  const id = String(fd.get("id"));
  const tradeAccountId = String(fd.get("tradeAccountId"));
  await prisma.tradeProductPricing.delete({ where: { id } });
  revalidatePath(`/admin/trade/${tradeAccountId}`);
}
