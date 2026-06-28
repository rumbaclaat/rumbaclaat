import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/ui/page-header";
import RewardForm from "@/components/admin/rewards/reward-form";
import { updateReward } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditReward({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await prisma.reward.findUnique({ where: { id } });
  if (!r) notFound();
  return (
    <>
      <PageHeader
        title="Edit reward"
        subtitle={`${r.type} · ${r.pointsCost.toLocaleString()} points`}
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Rewards", href: "/admin/rewards" }, { label: r.name }]}
      />
      <RewardForm action={updateReward} reward={r} submitLabel="Save changes" />
    </>
  );
}
