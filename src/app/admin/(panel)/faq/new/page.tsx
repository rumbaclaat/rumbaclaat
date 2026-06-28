import PageHeader from "@/components/admin/ui/page-header";
import FaqForm from "@/components/admin/faq-form";
import { createFaq } from "../actions";

export default function NewFaq() {
  return (
    <>
      <PageHeader title="New question" breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "FAQ", href: "/admin/faq" }, { label: "New" }]} />
      <FaqForm action={createFaq} submitLabel="Create question" />
    </>
  );
}
