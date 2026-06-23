"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function submitContact(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  if (!name || !email || !message) {
    redirect("/contact?error=1");
  }
  await prisma.contactEnquiry.create({
    data: {
      type: String(formData.get("type") ?? "general"),
      name,
      email,
      phone: String(formData.get("phone") ?? "").trim() || null,
      subject: String(formData.get("subject") ?? "").trim() || null,
      message,
    },
  });
  redirect("/contact?sent=1");
}
