"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission, logAudit } from "@/lib/guard";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function str(fd: FormData, k: string): string | null {
  const v = String(fd.get(k) ?? "").trim();
  return v === "" ? null : v;
}

export async function updateCustomer(fd: FormData) {
  const s = await requirePermission("customers.edit");
  const id = String(fd.get("id"));
  await prisma.customer.update({
    where: { id },
    data: {
      firstName: str(fd, "firstName"),
      lastName: str(fd, "lastName"),
      phone: str(fd, "phone"),
      membershipTierId: String(fd.get("membershipTierId") ?? "").trim() || null,
      notes: str(fd, "notes"),
      tags: String(fd.get("tags") ?? "").split(",").map((t) => t.trim()).filter(Boolean),
    },
  });
  await logAudit({ session: s, action: "customer.update", entityType: "Customer", entityId: id });
  revalidatePath(`/admin/customers/${id}`);
}

export async function createCustomer(fd: FormData) {
  await requirePermission("customers.edit");
  const email = String(fd.get("email") ?? "").trim();
  if (!email) throw new Error("Email required");
  const c = await prisma.customer.create({
    data: { email, firstName: str(fd, "firstName"), lastName: str(fd, "lastName"), phone: str(fd, "phone") },
  });
  revalidatePath("/admin/customers");
  redirect(`/admin/customers/${c.id}`);
}

export async function adjustPoints(fd: FormData) {
  const s = await requirePermission("customers.edit");
  const id = String(fd.get("id"));
  const delta = parseInt(String(fd.get("delta") ?? "0"), 10) || 0;
  if (!delta) { revalidatePath(`/admin/customers/${id}`); return; }
  const cust = await prisma.customer.findUnique({ where: { id } });
  if (!cust) return;
  const balanceAfter = cust.pointsBalance + delta;
  await prisma.$transaction([
    prisma.pointsLedger.create({ data: { customerId: id, delta, reason: "adjustment", balanceAfter, note: str(fd, "note") } }),
    prisma.customer.update({ where: { id }, data: { pointsBalance: balanceAfter } }),
  ]);
  await logAudit({ session: s, action: "customer.points", entityType: "Customer", entityId: id, summary: String(delta) });
  revalidatePath(`/admin/customers/${id}`);
}

export async function addAddress(fd: FormData) {
  await requirePermission("customers.edit");
  const customerId = String(fd.get("customerId"));
  await prisma.address.create({
    data: {
      customerId,
      name: str(fd, "name"),
      line1: String(fd.get("line1") ?? ""),
      line2: str(fd, "line2"),
      city: String(fd.get("city") ?? ""),
      postcode: String(fd.get("postcode") ?? ""),
      country: String(fd.get("country") ?? "United Kingdom"),
    },
  });
  revalidatePath(`/admin/customers/${customerId}`);
}

export async function deleteAddress(fd: FormData) {
  await requirePermission("customers.edit");
  const id = String(fd.get("id"));
  const customerId = String(fd.get("customerId"));
  await prisma.address.delete({ where: { id } });
  revalidatePath(`/admin/customers/${customerId}`);
}

export async function deleteCustomer(fd: FormData) {
  const s = await requirePermission("customers.delete");
  const id = String(fd.get("id"));
  await prisma.pointsLedger.deleteMany({ where: { customerId: id } });
  await prisma.membershipSubscription.deleteMany({ where: { customerId: id } });
  await prisma.order.updateMany({ where: { customerId: id }, data: { customerId: null } });
  await prisma.customer.delete({ where: { id } }); // addresses cascade
  await logAudit({ session: s, action: "customer.delete", entityType: "Customer", entityId: id, summary: "GDPR erase" });
  revalidatePath("/admin/customers");
  redirect("/admin/customers");
}
