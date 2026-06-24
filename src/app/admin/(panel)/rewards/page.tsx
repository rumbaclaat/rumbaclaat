import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/ui/page-header";
import EntityGrid, { type GridRow } from "@/components/admin/grid/entity-grid";
import { deleteReward, reorderRewards } from "./actions";

export const dynamic = "force-dynamic";

export default async function RewardsPage() {
  const items = await prisma.reward.findMany({ orderBy: { sortOrder: "asc" } });
  const rows: GridRow[] = items.map((r) => ({ id: r.id, name: r.name, points: r.pointsCost, type: r.type, value: r.value ?? "—", availability: r.availability }));
  return (
    <>
      <PageHeader
        title="Rewards"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Rewards" }]}
        subtitle="The points-redemption catalogue."
        action={<Link href="/admin/rewards/new" className="btn btn-gold btn-sm"><i className="bi bi-plus-lg me-1" aria-hidden="true" />New reward</Link>}
      />
      <EntityGrid
        rows={rows}
        columns={[{ field: "name", header: "Reward", flex: 1.8 }, { field: "points", header: "Points", width: 110 }, { field: "type", header: "Type", width: 130 }, { field: "value", header: "Value", width: 130 }, { field: "availability", header: "Availability", type: "status", width: 150 }]}
        nameField="name" editBase="/admin/rewards" deleteAction={deleteReward} reorderAction={reorderRewards}
        resultsLabel="rewards" quickFilter="Search rewards…" exportName="rewards"
      />
    </>
  );
}
