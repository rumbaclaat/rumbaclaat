import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/ui/page-header";
import EntityGrid, { type GridRow } from "@/components/admin/grid/entity-grid";
import { deleteRedirect } from "./actions";

export const dynamic = "force-dynamic";

export default async function RedirectsPage() {
  const items = await prisma.redirect.findMany({ orderBy: { fromPath: "asc" } });
  const rows: GridRow[] = items.map((r) => ({ id: r.id, fromPath: r.fromPath, toPath: r.toPath, code: r.statusCode, active: r.active ? "active" : "inactive" }));
  return (
    <>
      <PageHeader
        title="Redirects"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Redirects" }]}
        action={<Link href="/admin/redirects/new" className="btn btn-gold btn-sm"><i className="bi bi-plus-lg me-1" aria-hidden="true" />New redirect</Link>}
      />
      <EntityGrid
        rows={rows}
        columns={[{ field: "fromPath", header: "From", flex: 1.6 }, { field: "toPath", header: "To", flex: 1.6 }, { field: "code", header: "Code", width: 110 }, { field: "active", header: "Status", type: "status", width: 120 }]}
        nameField="fromPath" editBase="/admin/redirects" deleteAction={deleteRedirect}
        resultsLabel="redirects" quickFilter="Search redirects…" exportName="redirects"
      />
    </>
  );
}
