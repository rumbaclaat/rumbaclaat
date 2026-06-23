import PageHeader from "@/components/admin/ui/page-header";
import BannerForm from "@/components/admin/banners/banner-form";
import { createBanner } from "../actions";

export default function NewBannerPage() {
  return (
    <>
      <PageHeader title="New banner" breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Banners", href: "/admin/banners" }, { label: "New" }]} />
      <BannerForm action={createBanner} submitLabel="Create banner" />
    </>
  );
}
