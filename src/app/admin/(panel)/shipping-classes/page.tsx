import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import PageHeader from "@/components/admin/ui/page-header";
import AdminCard from "@/components/admin/ui/admin-card";
import EntityGrid, { type GridRow } from "@/components/admin/grid/entity-grid";
import { createShippingClass, deleteShippingClass, reorderShippingClasses } from "./actions";

export const dynamic = "force-dynamic";

export default async function ShippingClassesPage() {
  const items = await prisma.shippingClass.findMany({ orderBy: { sortOrder: "asc" } });
  const rows: GridRow[] = items.map((s) => ({ id: s.id, name: s.name, price: formatMoney(Number(s.price)), free: s.freeOver != null ? formatMoney(Number(s.freeOver)) : "—", def: s.isDefault ? "default" : "—" }));
  return (
    <>
      <PageHeader title="Shipping classes" breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Shipping classes" }]} subtitle="Assign to products & categories to override default shipping." />
      <EntityGrid
        rows={rows}
        columns={[{ field: "name", header: "Name", flex: 2 }, { field: "price", header: "Price", width: 130 }, { field: "free", header: "Free over", width: 130 }, { field: "def", header: "Default", width: 110 }]}
        nameField="name" editBase="/admin/shipping-classes" deleteAction={deleteShippingClass} reorderAction={reorderShippingClasses}
        resultsLabel="classes" quickFilter="Search shipping classes…" exportName="shipping-classes"
      />
      <AdminCard title="Add shipping class" className="mt-4">
        <form action={createShippingClass} className="row g-2 align-items-end">
          <div className="col-md-4"><label className="form-label" htmlFor="sn">Name</label><input id="sn" name="name" className="form-control form-control-sm" placeholder="e.g. Heavy / Glass" required /></div>
          <div className="col-md-2"><label className="form-label" htmlFor="sp">Price (£)</label><input id="sp" name="price" type="number" step="0.01" className="form-control form-control-sm" defaultValue="4.99" /></div>
          <div className="col-md-2"><label className="form-label" htmlFor="sf">Free over (£)</label><input id="sf" name="freeOver" type="number" step="0.01" className="form-control form-control-sm" /></div>
          <div className="col-md-2 d-flex align-items-end"><div className="form-check"><input className="form-check-input" type="checkbox" name="isDefault" id="sd" /><label className="form-check-label" htmlFor="sd">Default</label></div></div>
          <div className="col-md-2"><button className="btn btn-gold btn-sm w-100">Add</button></div>
        </form>
      </AdminCard>
    </>
  );
}
