import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import PageHeader from "@/components/admin/ui/page-header";
import EntityGrid, { type GridRow } from "@/components/admin/grid/entity-grid";
import { deleteTier, reorderTiers } from "./actions";

export const dynamic = "force-dynamic";

export default async function MembershipPage() {
  const tiers = await prisma.membershipTier.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { customers: true } } } });
  const rows: GridRow[] = tiers.map((t) => ({
    id: t.id, name: t.name, monthly: t.isFree ? "Free" : formatMoney(Number(t.priceMonthly)), annual: t.isFree ? "—" : formatMoney(Number(t.priceAnnual)),
    mult: `${Number(t.pointsMultiplier)}×`, discount: `${t.memberDiscountPct}%`, members: t._count.customers,
  }));
  return (
    <>
      <PageHeader
        title="RPM tiers"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "RPM tiers" }]}
        action={<Link href="/admin/membership/new" className="btn btn-gold btn-sm"><i className="bi bi-plus-lg me-1" />New tier</Link>}
      />
      <EntityGrid
        rows={rows}
        columns={[{ field: "name", header: "Tier", flex: 1.4 }, { field: "monthly", header: "Monthly", width: 120 }, { field: "annual", header: "Annual", width: 120 }, { field: "mult", header: "Points", width: 110 }, { field: "discount", header: "Discount", width: 110 }, { field: "members", header: "Members", width: 110 }]}
        nameField="name" editBase="/admin/membership" deleteAction={deleteTier} reorderAction={reorderTiers}
        resultsLabel="tiers" quickFilter="Search tiers…" exportName="tiers"
      />
    </>
  );
}
