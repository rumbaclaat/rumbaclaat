"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function subscribe(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const firstName = String(formData.get("firstName") ?? "").trim() || null;
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    redirect("/newsletter?error=1");
  }
  await prisma.newsletterSubscriber.upsert({
    where: { email },
    update: { status: "subscribed", firstName },
    create: { email, firstName },
  });
  redirect("/newsletter?subscribed=1");
}
