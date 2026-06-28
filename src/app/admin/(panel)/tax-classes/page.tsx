import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/ui/page-header";
import EntityGrid, { type GridRow } from "@/components/admin/grid/entity-grid";
import { deleteTaxClass, reorderTaxClasses } from "./actions";

export const dynamic = "force-dynamic";

export default async function TaxClassesPage() {
  const items = await prisma.taxClass.findMany({ orderBy: { sortOrder: "asc" } });
  const rows: GridRow[] = items.map((t) => ({ id: t.id, name: t.name, rate: `${Number(t.ratePct)}%`, def: t.isDefault ? "default" : "" }));
  return (
    <>
      <PageHeader
        title="Tax classes"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Tax classes" }]}
        subtitle="Assign to products & categories to override the store default VAT."
        action={<Link href="/admin/tax-classes/new" className="btn btn-gold btn-sm"><i className="bi bi-plus-lg me-1" aria-hidden="true" />New tax class</Link>}
      />
      <EntityGrid
        rows={rows}
        columns={[{ field: "name", header: "Name", flex: 2 }, { field: "rate", header: "VAT rate", width: 140 }, { field: "def", header: "Default", width: 120, type: "status" }]}
        nameField="name" editBase="/admin/tax-classes" deleteAction={deleteTaxClass} reorderAction={reorderTaxClasses}
        resultsLabel="classes" quickFilter="Search tax classes…" exportName="tax-classes"
      />
    </>
  );
}
