import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import PageHeader from "@/components/admin/ui/page-header";
import EntityGrid, { type GridRow } from "@/components/admin/grid/entity-grid";
import { deleteShippingClass, reorderShippingClasses } from "./actions";

export const dynamic = "force-dynamic";

export default async function ShippingClassesPage() {
  const items = await prisma.shippingClass.findMany({ orderBy: { sortOrder: "asc" } });
  const rows: GridRow[] = items.map((s) => ({ id: s.id, name: s.name, price: formatMoney(Number(s.price)), free: s.freeOver != null ? formatMoney(Number(s.freeOver)) : "—", def: s.isDefault ? "default" : "—" }));
  return (
    <>
      <PageHeader
        title="Shipping classes"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Shipping classes" }]}
        subtitle="Assign to products & categories to override default shipping."
        action={<Link href="/admin/shipping-classes/new" className="btn btn-gold btn-sm"><i className="bi bi-plus-lg me-1" aria-hidden="true" />New shipping class</Link>}
      />
      <EntityGrid
        rows={rows}
        columns={[{ field: "name", header: "Name", flex: 2 }, { field: "price", header: "Price", width: 130 }, { field: "free", header: "Free over", width: 130 }, { field: "def", header: "Default", width: 110 }]}
        nameField="name" editBase="/admin/shipping-classes" deleteAction={deleteShippingClass} reorderAction={reorderShippingClasses}
        resultsLabel="classes" quickFilter="Search shipping classes…" exportName="shipping-classes"
      />
    </>
  );
}
