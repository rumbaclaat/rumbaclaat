"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission, logAudit } from "@/lib/guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma, type StaffRole } from "@/generated/prisma/client";

export async function inviteStaff(fd: FormData) {
  const s = await requirePermission("staff.manage");
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const role = String(fd.get("role") ?? "content_editor") as StaffRole;
  const name = String(fd.get("name") ?? "").trim() || null;
  if (!email) return;

  let authUserId = `pending-${email}`;
  try {
    const admin = createAdminClient();
    const { data } = await admin.auth.admin.inviteUserByEmail(email);
    if (data?.user?.id) authUserId = data.user.id;
  } catch {
    /* Supabase invite needs SMTP configured — fall back to a pending record. */
  }

  const existing = await prisma.staffUser.findUnique({ where: { email } });
  if (existing) {
    await prisma.staffUser.update({ where: { email }, data: { role, name: name ?? existing.name, invitedById: s.staff.id, invitedAt: new Date() } });
  } else {
    await prisma.staffUser.create({ data: { authUserId, email, name, role, active: true, invitedById: s.staff.id, invitedAt: new Date() } });
  }
  await logAudit({ session: s, action: "staff.invite", entityType: "StaffUser", entityId: email, summary: role });
  revalidatePath("/admin/staff");
  redirect("/admin/staff");
}

export async function updateStaff(fd: FormData) {
  const s = await requirePermission("staff.manage");
  const id = String(fd.get("id"));
  const role = String(fd.get("role")) as StaffRole;
  const useCustom = fd.get("useCustomPerms") === "on";
  const permissions = fd.getAll("permissions").map(String);
  await prisma.staffUser.update({
    where: { id },
    data: {
      role,
      name: String(fd.get("name") ?? "").trim() || null,
      title: String(fd.get("title") ?? "").trim() || null,
      photo: String(fd.get("photo") ?? "").trim() || null,
      permissions: useCustom ? permissions : Prisma.JsonNull,
      active: fd.get("active") === "on",
    },
  });
  await logAudit({ session: s, action: "staff.update", entityType: "StaffUser", entityId: id, summary: role });
  revalidatePath("/admin/staff");
  redirect("/admin/staff");
}

export async function deleteStaff(fd: FormData) {
  const s = await requirePermission("staff.manage");
  const id = String(fd.get("id"));
  await prisma.staffUser.update({ where: { id }, data: { active: false } });
  await logAudit({ session: s, action: "staff.deactivate", entityType: "StaffUser", entityId: id });
  revalidatePath("/admin/staff");
}
