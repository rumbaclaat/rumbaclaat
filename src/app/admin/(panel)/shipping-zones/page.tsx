import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import PageHeader from "@/components/admin/ui/page-header";
import EntityGrid, { type GridRow } from "@/components/admin/grid/entity-grid";
import { deleteZone, reorderZones } from "./actions";

export const dynamic = "force-dynamic";

export default async function ShippingZonesPage() {
  const items = await prisma.shippingZone.findMany({ orderBy: { sortOrder: "asc" } });
  const rows: GridRow[] = items.map((z) => ({ id: z.id, name: z.name, countries: z.countries.join(", ") || "—", price: formatMoney(Number(z.price)), free: z.freeOver != null ? formatMoney(Number(z.freeOver)) : "—" }));
  return (
    <>
      <PageHeader
        title="Shipping zones"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Shipping zones" }]}
        subtitle="International shipping rates by country."
        action={<Link href="/admin/shipping-zones/new" className="btn btn-gold btn-sm"><i className="bi bi-plus-lg me-1" aria-hidden="true" />New zone</Link>}
      />
      <EntityGrid
        rows={rows}
        columns={[{ field: "name", header: "Zone", flex: 1.4 }, { field: "countries", header: "Countries", flex: 2 }, { field: "price", header: "Price", width: 120 }, { field: "free", header: "Free over", width: 120 }]}
        nameField="name" editBase="/admin/shipping-zones" deleteAction={deleteZone} reorderAction={reorderZones}
        resultsLabel="zones" quickFilter="Search zones…" exportName="shipping-zones"
      />
    </>
  );
}
