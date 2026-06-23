"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/guard";
import { revalidatePath } from "next/cache";

export async function deleteSubscriber(fd: FormData) {
  await requirePermission("newsletter.manage");
  await prisma.newsletterSubscriber.delete({ where: { id: String(fd.get("id")) } });
  revalidatePath("/admin/newsletter");
}
export async function bulkSubscriberStatus(ids: string[], status: string) {
  await requirePermission("newsletter.manage");
  await prisma.newsletterSubscriber.updateMany({ where: { id: { in: ids } }, data: { status } });
  revalidatePath("/admin/newsletter");
}
