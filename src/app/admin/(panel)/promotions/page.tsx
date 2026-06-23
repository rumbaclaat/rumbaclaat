import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/ui/page-header";
import EntityGrid, { type GridRow } from "@/components/admin/grid/entity-grid";
import { deletePromotion } from "./actions";

export const dynamic = "force-dynamic";

export default async function PromotionsPage() {
  const items = await prisma.promotion.findMany({ orderBy: { active: "desc" } });
  const rows: GridRow[] = items.map((p) => ({
    id: p.id, name: p.name, code: p.code ?? "—",
    type: p.discountType, value: p.discountType === "percentage" ? `${Number(p.value)}%` : p.discountType === "free_shipping" ? "Free ship" : `£${Number(p.value)}`,
    applies: p.appliesTo, active: p.active ? "active" : "inactive",
  }));
  return (
    <>
      <PageHeader
        title="Promotions & coupons"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Promotions" }]}
        action={<Link href="/admin/promotions/new" className="btn btn-gold btn-sm"><i className="bi bi-plus-lg me-1" />New promotion</Link>}
      />
      <EntityGrid
        rows={rows}
        columns={[{ field: "name", header: "Name", flex: 1.8 }, { field: "code", header: "Code", width: 140 }, { field: "type", header: "Type", width: 140 }, { field: "value", header: "Value", width: 120 }, { field: "applies", header: "Applies to", width: 140 }, { field: "active", header: "Status", type: "status", width: 120 }]}
        nameField="name" editBase="/admin/promotions" deleteAction={deletePromotion}
        resultsLabel="promotions" quickFilter="Search promotions…" exportName="promotions"
      />
    </>
  );
}
