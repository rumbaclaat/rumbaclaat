"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function submitContact(formData: FormData) {
  const type = String(formData.get("type") ?? "general");

  // Name comes either as a single `name` field (trade) or first/last split (general).
  const single = String(formData.get("name") ?? "").trim();
  const first = String(formData.get("firstName") ?? "").trim();
  const last = String(formData.get("lastName") ?? "").trim();
  const name = single || [first, last].filter(Boolean).join(" ");

  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  // Subject is an explicit field for general; for trade we derive it from the
  // business type so the enquiry record stays meaningful.
  const subject =
    String(formData.get("subject") ?? "").trim() ||
    String(formData.get("businessType") ?? "").trim() ||
    null;

  if (!name || !email || !message) {
    redirect("/contact?error=1");
  }
  await prisma.contactEnquiry.create({
    data: {
      type,
      name,
      email,
      phone: String(formData.get("phone") ?? "").trim() || null,
      subject,
      message,
    },
  });
  redirect("/contact?sent=1");
}
