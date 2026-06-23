import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/ui/page-header";
import EntityGrid, { type GridRow } from "@/components/admin/grid/entity-grid";
import { deleteCollection, reorderCollections } from "./actions";

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  const collections = await prisma.collection.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { products: true } } } });
  const rows: GridRow[] = collections.map((c) => ({ id: c.id, slug: c.slug, name: c.name, slugv: c.slug, products: c._count.products, active: c.active ? "active" : "inactive" }));
  return (
    <>
      <PageHeader
        title="Collections"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Collections" }]}
        action={<Link href="/admin/collections/new" className="btn btn-gold btn-sm"><i className="bi bi-plus-lg me-1" />New collection</Link>}
      />
      <EntityGrid
        rows={rows}
        columns={[
          { field: "name", header: "Name", flex: 2 },
          { field: "slugv", header: "Slug", flex: 1.4 },
          { field: "products", header: "Products", width: 120 },
          { field: "active", header: "Status", type: "status", width: 130 },
        ]}
        nameField="name"
        editBase="/admin/collections"
        viewBase="/shop"
        deleteAction={deleteCollection}
        reorderAction={reorderCollections}
        resultsLabel="collections"
        quickFilter="Search collections…"
        exportName="collections"
      />
    </>
  );
}
