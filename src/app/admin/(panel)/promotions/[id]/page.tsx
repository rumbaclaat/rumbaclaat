import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/ui/page-header";
import PromotionForm from "@/components/admin/promotions/promotion-form";
import { updatePromotion } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditPromotion({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const promotion = await prisma.promotion.findUnique({ where: { id } });
  if (!promotion) notFound();
  return (
    <>
      <PageHeader title="Edit promotion" breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Promotions", href: "/admin/promotions" }, { label: promotion.name }]} />
      <PromotionForm action={updatePromotion} promotion={promotion} submitLabel="Save changes" />
    </>
  );
}
