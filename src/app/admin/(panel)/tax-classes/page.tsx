import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/ui/page-header";
import AdminCard from "@/components/admin/ui/admin-card";
import EntityGrid, { type GridRow } from "@/components/admin/grid/entity-grid";
import { createTaxClass, deleteTaxClass, reorderTaxClasses } from "./actions";

export const dynamic = "force-dynamic";

export default async function TaxClassesPage() {
  const items = await prisma.taxClass.findMany({ orderBy: { sortOrder: "asc" } });
  const rows: GridRow[] = items.map((t) => ({ id: t.id, name: t.name, rate: `${Number(t.ratePct)}%`, def: t.isDefault ? "default" : "—" }));
  return (
    <>
      <PageHeader title="Tax classes" breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Tax classes" }]} subtitle="Assign to products & categories to override the store default VAT." />
      <EntityGrid
        rows={rows}
        columns={[{ field: "name", header: "Name", flex: 2 }, { field: "rate", header: "VAT rate", width: 140 }, { field: "def", header: "Default", width: 120 }]}
        nameField="name" editBase="/admin/tax-classes" deleteAction={deleteTaxClass} reorderAction={reorderTaxClasses}
        resultsLabel="classes" quickFilter="Search tax classes…" exportName="tax-classes"
      />
      <AdminCard title="Add tax class" className="mt-4">
        <form action={createTaxClass} className="row g-2 align-items-end">
          <div className="col-md-5"><label className="form-label" htmlFor="tn">Name</label><input id="tn" name="name" className="form-control form-control-sm" placeholder="e.g. Reduced rate" required /></div>
          <div className="col-md-3"><label className="form-label" htmlFor="tr">VAT rate (%)</label><input id="tr" name="ratePct" type="number" step="0.01" className="form-control form-control-sm" defaultValue="20" /></div>
          <div className="col-md-2 d-flex align-items-end"><div className="form-check"><input className="form-check-input" type="checkbox" name="isDefault" id="td" /><label className="form-check-label" htmlFor="td">Default</label></div></div>
          <div className="col-md-2"><button className="btn btn-gold btn-sm w-100">Add</button></div>
        </form>
      </AdminCard>
    </>
  );
}
