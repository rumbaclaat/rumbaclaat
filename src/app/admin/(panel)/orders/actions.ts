"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission, logAudit } from "@/lib/guard";
import { sendEmail, emailShell } from "@/lib/email";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateOrderStatus(formData: FormData) {
  const s = await requirePermission("orders.edit");
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const note = String(formData.get("note") ?? "").trim() || null;
  await prisma.order.update({ where: { id }, data: { status } });
  await prisma.orderTimeline.create({ data: { orderId: id, status, note, createdBy: s.email } });
  await logAudit({ session: s, action: "order.status", entityType: "Order", entityId: id, summary: status });
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
}

export async function updateOrderFulfilment(formData: FormData) {
  const s = await requirePermission("orders.edit");
  const id = String(formData.get("id"));
  const trackingCarrier = String(formData.get("trackingCarrier") ?? "").trim() || null;
  const trackingNumber = String(formData.get("trackingNumber") ?? "").trim() || null;
  await prisma.order.update({ where: { id }, data: { trackingCarrier, trackingNumber, status: "dispatched" } });
  await prisma.orderTimeline.create({
    data: { orderId: id, status: "dispatched", note: trackingNumber ? `Dispatched — ${trackingCarrier ?? ""} ${trackingNumber}`.trim() : "Marked dispatched", createdBy: s.email },
  });
  await logAudit({ session: s, action: "order.fulfil", entityType: "Order", entityId: id });
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
}

export async function updateOrderNotes(formData: FormData) {
  await requirePermission("orders.edit");
  const id = String(formData.get("id"));
  const internalNotes = String(formData.get("internalNotes") ?? "").trim() || null;
  await prisma.order.update({ where: { id }, data: { internalNotes } });
  revalidatePath(`/admin/orders/${id}`);
}

export async function refundOrder(formData: FormData) {
  const s = await requirePermission("orders.refund");
  const id = String(formData.get("id"));
  const amount = Number(formData.get("amount") ?? 0) || 0;
  await prisma.order.update({
    where: { id },
    data: { refundedAmount: amount, refundedAt: new Date(), paymentStatus: "refunded", status: "cancelled" },
  });
  await prisma.orderTimeline.create({ data: { orderId: id, status: "refunded", note: `Refunded £${amount.toFixed(2)}`, createdBy: s.email } });
  await logAudit({ session: s, action: "order.refund", entityType: "Order", entityId: id, summary: `£${amount.toFixed(2)}` });
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
}

export async function emailCustomer(formData: FormData) {
  const s = await requirePermission("orders.edit");
  const id = String(formData.get("id"));
  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const order = await prisma.order.findUnique({ where: { id } });
  if (order && subject && body) {
    const res = await sendEmail({ to: order.email, subject, html: emailShell(subject, body.replace(/\n/g, "<br/>")) });
    await prisma.orderTimeline.create({
      data: { orderId: id, status: order.status, note: `Emailed customer "${subject}"${res.sent ? "" : " (not sent — add RESEND_API_KEY)"}`, createdBy: s.email },
    });
  }
  revalidatePath(`/admin/orders/${id}`);
}

export async function createReturn(formData: FormData) {
  const s = await requirePermission("orders.refund");
  const id = String(formData.get("id"));
  const reason = String(formData.get("reason") ?? "").trim() || null;
  await prisma.return.create({ data: { orderId: id, items: [], reason, status: "requested", createdBy: s.email } });
  await prisma.orderTimeline.create({ data: { orderId: id, status: "return_requested", note: reason, createdBy: s.email } });
  revalidatePath(`/admin/orders/${id}`);
}

export async function bulkOrderStatus(ids: string[], status: string) {
  const s = await requirePermission("orders.edit");
  await prisma.order.updateMany({ where: { id: { in: ids } }, data: { status } });
  await prisma.orderTimeline.createMany({ data: ids.map((id) => ({ orderId: id, status, note: "Bulk update", createdBy: s.email })) });
  revalidatePath("/admin/orders");
}

// Admin-created order (also powers reorder via ?from=)
export async function createOrder(formData: FormData) {
  const s = await requirePermission("orders.create");
  const email = String(formData.get("email") ?? "").trim();
  const customerName = String(formData.get("customerName") ?? "").trim() || null;
  const customerId = String(formData.get("customerId") ?? "").trim() || null;
  const lines = JSON.parse(String(formData.get("lines") ?? "[]")) as { name: string; productId?: string; unitPrice: number; qty: number }[];
  const subtotal = lines.reduce((a, l) => a + l.unitPrice * l.qty, 0);
  const shipping = subtotal >= 50 ? 0 : 4.99;
  const total = subtotal + shipping;
  const year = new Date().getFullYear();
  const count = await prisma.order.count();
  const ref = `RC-${year}-${10000 + count}`;
  const order = await prisma.order.create({
    data: {
      ref, email, customerId, customerName, status: "received", paymentStatus: "pending",
      subtotal, shipping, total, pointsEarned: Math.round(subtotal), createdById: s.staff.id,
      paymentMethod: "manual", deliveryMethod: "Standard",
      items: { create: lines.map((l) => ({ name: l.name, productId: l.productId ?? null, unitPrice: l.unitPrice, qty: l.qty, lineTotal: l.unitPrice * l.qty })) },
      timeline: { create: { status: "received", note: "Created in admin", createdBy: s.email } },
    },
  });
  await logAudit({ session: s, action: "order.create", entityType: "Order", entityId: order.id, summary: ref });
  revalidatePath("/admin/orders");
  redirect(`/admin/orders/${order.id}`);
}
