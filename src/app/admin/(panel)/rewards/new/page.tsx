import PageHeader from "@/components/admin/ui/page-header";
import RewardForm from "@/components/admin/rewards/reward-form";
import { createReward } from "../actions";

export default function NewReward() {
  return (
    <>
      <PageHeader title="New reward" breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Rewards", href: "/admin/rewards" }, { label: "New" }]} />
      <RewardForm action={createReward} submitLabel="Create reward" />
    </>
  );
}
