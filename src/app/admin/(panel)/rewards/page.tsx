import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/ui/page-header";
import AdminCard from "@/components/admin/ui/admin-card";
import EntityGrid, { type GridRow } from "@/components/admin/grid/entity-grid";
import { createReward, deleteReward, reorderRewards } from "./actions";

export const dynamic = "force-dynamic";

export default async function RewardsPage() {
  const items = await prisma.reward.findMany({ orderBy: { sortOrder: "asc" } });
  const rows: GridRow[] = items.map((r) => ({ id: r.id, name: r.name, points: r.pointsCost, type: r.type, value: r.value ?? "—", availability: r.availability }));
  return (
    <>
      <PageHeader title="Rewards" breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Rewards" }]} subtitle="The points-redemption catalogue." />
      <EntityGrid
        rows={rows}
        columns={[{ field: "name", header: "Reward", flex: 1.8 }, { field: "points", header: "Points", width: 110 }, { field: "type", header: "Type", width: 130 }, { field: "value", header: "Value", width: 130 }, { field: "availability", header: "Availability", type: "status", width: 150 }]}
        nameField="name" editBase="/admin/rewards" deleteAction={deleteReward} reorderAction={reorderRewards}
        resultsLabel="rewards" quickFilter="Search rewards…" exportName="rewards"
      />
      <AdminCard title="Add reward" className="mt-4">
        <form action={createReward} className="row g-2 align-items-end">
          <div className="col-md-3"><label className="form-label" htmlFor="rn">Name</label><input id="rn" name="name" className="form-control form-control-sm" required /></div>
          <div className="col-md-2"><label className="form-label" htmlFor="rp">Points</label><input id="rp" name="pointsCost" type="number" className="form-control form-control-sm" defaultValue="500" /></div>
          <div className="col-md-2"><label className="form-label" htmlFor="rt">Type</label><select id="rt" name="type" className="form-select form-select-sm"><option value="credit">credit</option><option value="item">item</option><option value="access">access</option><option value="discount">discount</option><option value="experience">experience</option></select></div>
          <div className="col-md-2"><label className="form-label" htmlFor="rv">Value</label><input id="rv" name="value" className="form-control form-control-sm" placeholder="£10" /></div>
          <div className="col-md-2"><label className="form-label" htmlFor="ravl">Availability</label><select id="ravl" name="availability" className="form-select form-select-sm"><option value="available">available</option><option value="coming_soon">coming soon</option><option value="disabled">disabled</option></select></div>
          <div className="col-md-1"><button className="btn btn-gold btn-sm w-100">Add</button></div>
        </form>
      </AdminCard>
    </>
  );
}
