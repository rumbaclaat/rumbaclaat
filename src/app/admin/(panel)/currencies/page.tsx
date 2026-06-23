import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/ui/page-header";
import AdminCard from "@/components/admin/ui/admin-card";
import EntityGrid, { type GridRow } from "@/components/admin/grid/entity-grid";
import { createCurrency, deleteCurrency } from "./actions";

export const dynamic = "force-dynamic";

export default async function CurrenciesPage() {
  const items = await prisma.currency.findMany({ orderBy: { sortOrder: "asc" } });
  const rows: GridRow[] = items.map((c) => ({ id: c.code, code: c.code, symbol: c.symbol, rate: Number(c.rate).toString(), base: c.isBase ? "base" : "—", active: c.active ? "active" : "inactive" }));
  return (
    <>
      <PageHeader title="Currencies" breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Currencies" }]} subtitle="Multi-currency display from a base rate." />
      <EntityGrid
        rows={rows}
        columns={[{ field: "code", header: "Code", width: 120 }, { field: "symbol", header: "Symbol", width: 110 }, { field: "rate", header: "Rate vs base", width: 150 }, { field: "base", header: "Base", width: 110 }, { field: "active", header: "Status", type: "status", width: 120 }]}
        nameField="code" editBase="/admin/currencies" deleteAction={deleteCurrency}
        resultsLabel="currencies" quickFilter="Search currencies…" exportName="currencies"
      />
      <AdminCard title="Add currency" className="mt-4">
        <form action={createCurrency} className="row g-2 align-items-end">
          <div className="col-md-2"><label className="form-label" htmlFor="cc">Code</label><input id="cc" name="code" className="form-control form-control-sm" placeholder="EUR" maxLength={3} required /></div>
          <div className="col-md-2"><label className="form-label" htmlFor="cs">Symbol</label><input id="cs" name="symbol" className="form-control form-control-sm" placeholder="€" required /></div>
          <div className="col-md-3"><label className="form-label" htmlFor="cr">Rate vs base (GBP)</label><input id="cr" name="rate" type="number" step="0.0001" className="form-control form-control-sm" defaultValue="1" /></div>
          <div className="col-md-2 d-flex align-items-end gap-2"><div className="form-check"><input className="form-check-input" type="checkbox" name="isBase" id="cb" /><label className="form-check-label" htmlFor="cb">Base</label></div><div className="form-check"><input className="form-check-input" type="checkbox" name="active" id="ca" defaultChecked /><label className="form-check-label" htmlFor="ca">Active</label></div></div>
          <div className="col-md-2"><button className="btn btn-gold btn-sm w-100">Add</button></div>
        </form>
      </AdminCard>
    </>
  );
}
