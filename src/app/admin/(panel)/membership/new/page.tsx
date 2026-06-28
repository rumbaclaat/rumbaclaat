import PageHeader from "@/components/admin/ui/page-header";
import TierForm from "@/components/admin/membership/tier-form";
import { createTier } from "../actions";

export default function NewTierPage() {
  return (
    <>
      <PageHeader title="New tier" breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "RPM tiers", href: "/admin/membership" }, { label: "New" }]} />
      <TierForm action={createTier} submitLabel="Create tier" />
    </>
  );
}
