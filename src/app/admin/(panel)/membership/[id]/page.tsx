import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/ui/page-header";
import TierForm from "@/components/admin/membership/tier-form";
import { updateTier } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditTier({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tier = await prisma.membershipTier.findUnique({ where: { id } });
  if (!tier) notFound();
  return (
    <>
      <PageHeader title="Edit tier" breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Membership tiers", href: "/admin/membership" }, { label: tier.name }]} />
      <TierForm action={updateTier} tier={tier} submitLabel="Save changes" />
    </>
  );
}
