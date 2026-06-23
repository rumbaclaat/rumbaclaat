"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function submitTradeApplication(formData: FormData) {
  const company = String(formData.get("company") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  if (!company || !name || !email) redirect("/trade-apply?error=1");

  const details = [
    `Company: ${company}`,
    `Business type: ${String(formData.get("businessType") ?? "")}`,
    `Est. monthly volume: ${String(formData.get("volume") ?? "")}`,
    `VAT / Companies House: ${String(formData.get("vat") ?? "")}`,
    `Notes: ${String(formData.get("message") ?? "")}`,
  ].join("\n");

  await prisma.contactEnquiry.create({
    data: {
      type: "trade",
      name,
      email,
      phone: String(formData.get("phone") ?? "").trim() || null,
      subject: `Trade application — ${company}`,
      message: details,
    },
  });

  redirect("/trade-apply?sent=1");
}
