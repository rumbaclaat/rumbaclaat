import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/ui/page-header";
import FaqForm from "@/components/admin/faq-form";
import { updateFaq } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditFaq({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const f = await prisma.fAQItem.findUnique({ where: { id } });
  if (!f) notFound();
  return (
    <>
      <PageHeader title="Edit question" breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "FAQ", href: "/admin/faq" }, { label: f.question.slice(0, 32) }]} />
      <FaqForm action={updateFaq} faq={f} submitLabel="Save changes" />
    </>
  );
}
