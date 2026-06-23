"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission, logAudit } from "@/lib/guard";
import { sendEmail, emailShell } from "@/lib/email";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateEnquiryStatus(fd: FormData) {
  await requirePermission("enquiries.view");
  const id = String(fd.get("id"));
  const status = String(fd.get("status"));
  await prisma.contactEnquiry.update({ where: { id }, data: { status } });
  revalidatePath(`/admin/enquiries/${id}`);
  revalidatePath("/admin/enquiries");
}

export async function replyEnquiry(fd: FormData) {
  const s = await requirePermission("enquiries.reply");
  const id = String(fd.get("id"));
  const subject = String(fd.get("subject") ?? "").trim() || "Re: your enquiry";
  const body = String(fd.get("body") ?? "").trim();
  const enq = await prisma.contactEnquiry.findUnique({ where: { id } });
  if (enq && body) {
    const res = await sendEmail({ to: enq.email, subject, html: emailShell(subject, body.replace(/\n/g, "<br/>")) });
    await prisma.enquiryMessage.create({ data: { enquiryId: id, direction: "outbound", body, staffEmail: s.email, emailSent: res.sent } });
    await prisma.contactEnquiry.update({ where: { id }, data: { status: "replied" } });
    await logAudit({ session: s, action: "enquiry.reply", entityType: "ContactEnquiry", entityId: id });
  }
  revalidatePath(`/admin/enquiries/${id}`);
}

export async function approveTradeApplication(fd: FormData) {
  const s = await requirePermission("trade.manage");
  const id = String(fd.get("id"));
  const enq = await prisma.contactEnquiry.findUnique({ where: { id } });
  if (enq) {
    const existing = await prisma.tradeAccount.findUnique({ where: { contactEmail: enq.email } });
    if (!existing) {
      await prisma.tradeAccount.create({
        data: { companyName: enq.subject || enq.name, contactName: enq.name, contactEmail: enq.email, phone: enq.phone, status: "active" },
      });
    }
    await prisma.contactEnquiry.update({ where: { id }, data: { status: "closed" } });
    await logAudit({ session: s, action: "trade.approve", entityType: "ContactEnquiry", entityId: id });
  }
  revalidatePath("/admin/trade");
  redirect("/admin/trade");
}
