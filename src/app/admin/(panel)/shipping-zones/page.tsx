import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import PageHeader from "@/components/admin/ui/page-header";
import AdminCard from "@/components/admin/ui/admin-card";
import EntityGrid, { type GridRow } from "@/components/admin/grid/entity-grid";
import { createZone, deleteZone, reorderZones } from "./actions";

export const dynamic = "force-dynamic";

export default async function ShippingZonesPage() {
  const items = await prisma.shippingZone.findMany({ orderBy: { sortOrder: "asc" } });
  const rows: GridRow[] = items.map((z) => ({ id: z.id, name: z.name, countries: z.countries.join(", ") || "—", price: formatMoney(Number(z.price)), free: z.freeOver != null ? formatMoney(Number(z.freeOver)) : "—" }));
  return (
    <>
      <PageHeader title="Shipping zones" breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Shipping zones" }]} subtitle="International shipping rates by country." />
      <EntityGrid
        rows={rows}
        columns={[{ field: "name", header: "Zone", flex: 1.4 }, { field: "countries", header: "Countries", flex: 2 }, { field: "price", header: "Price", width: 120 }, { field: "free", header: "Free over", width: 120 }]}
        nameField="name" editBase="/admin/shipping-zones" deleteAction={deleteZone} reorderAction={reorderZones}
        resultsLabel="zones" quickFilter="Search zones…" exportName="shipping-zones"
      />
      <AdminCard title="Add zone" className="mt-4">
        <form action={createZone} className="row g-2 align-items-end">
          <div className="col-md-3"><label className="form-label" htmlFor="zn">Name</label><input id="zn" name="name" className="form-control form-control-sm" placeholder="e.g. Europe" required /></div>
          <div className="col-md-4"><label className="form-label" htmlFor="zc">Countries</label><input id="zc" name="countries" className="form-control form-control-sm" placeholder="FR, DE, ES (comma-separated)" /></div>
          <div className="col-md-2"><label className="form-label" htmlFor="zp">Price (£)</label><input id="zp" name="price" type="number" step="0.01" className="form-control form-control-sm" defaultValue="12.99" /></div>
          <div className="col-md-2"><label className="form-label" htmlFor="zf">Free over (£)</label><input id="zf" name="freeOver" type="number" step="0.01" className="form-control form-control-sm" /></div>
          <div className="col-md-1"><button className="btn btn-gold btn-sm w-100">Add</button></div>
        </form>
      </AdminCard>
    </>
  );
}
