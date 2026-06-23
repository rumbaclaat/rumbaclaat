"use server";

import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateOrderStatus(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  await prisma.order.update({ where: { id }, data: { status } });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}
