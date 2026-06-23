import PageHeader from "@/components/admin/ui/page-header";
import PromotionForm from "@/components/admin/promotions/promotion-form";
import { createPromotion } from "../actions";

export default function NewPromotionPage() {
  return (
    <>
      <PageHeader title="New promotion" breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Promotions", href: "/admin/promotions" }, { label: "New" }]} />
      <PromotionForm action={createPromotion} submitLabel="Create promotion" />
    </>
  );
}
