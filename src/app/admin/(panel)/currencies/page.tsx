import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/ui/page-header";
import EntityGrid, { type GridRow } from "@/components/admin/grid/entity-grid";
import { deleteCurrency } from "./actions";

export const dynamic = "force-dynamic";

export default async function CurrenciesPage() {
  const items = await prisma.currency.findMany({ orderBy: { sortOrder: "asc" } });
  const rows: GridRow[] = items.map((c) => ({ id: c.code, code: c.code, symbol: c.symbol, rate: Number(c.rate).toString(), base: c.isBase ? "base" : "—", active: c.active ? "active" : "inactive" }));
  return (
    <>
      <PageHeader
        title="Currencies"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Currencies" }]}
        subtitle="Multi-currency display from a base rate."
        action={<Link href="/admin/currencies/new" className="btn btn-gold btn-sm"><i className="bi bi-plus-lg me-1" aria-hidden="true" />New currency</Link>}
      />
      <EntityGrid
        rows={rows}
        columns={[{ field: "code", header: "Code", width: 120 }, { field: "symbol", header: "Symbol", width: 110 }, { field: "rate", header: "Rate vs base", width: 150 }, { field: "base", header: "Base", width: 110 }, { field: "active", header: "Status", type: "status", width: 120 }]}
        nameField="code" editBase="/admin/currencies" deleteAction={deleteCurrency}
        resultsLabel="currencies" quickFilter="Search currencies…" exportName="currencies"
      />
    </>
  );
}
