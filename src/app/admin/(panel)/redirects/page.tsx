import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/ui/page-header";
import AdminCard from "@/components/admin/ui/admin-card";
import EntityGrid, { type GridRow } from "@/components/admin/grid/entity-grid";
import { createRedirect, deleteRedirect } from "./actions";

export const dynamic = "force-dynamic";

export default async function RedirectsPage() {
  const items = await prisma.redirect.findMany({ orderBy: { fromPath: "asc" } });
  const rows: GridRow[] = items.map((r) => ({ id: r.id, fromPath: r.fromPath, toPath: r.toPath, code: r.statusCode, active: r.active ? "active" : "inactive" }));
  return (
    <>
      <PageHeader title="Redirects" breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Redirects" }]} />
      <EntityGrid
        rows={rows}
        columns={[{ field: "fromPath", header: "From", flex: 1.6 }, { field: "toPath", header: "To", flex: 1.6 }, { field: "code", header: "Code", width: 110 }, { field: "active", header: "Status", type: "status", width: 120 }]}
        nameField="fromPath" editBase="/admin/redirects" deleteAction={deleteRedirect}
        resultsLabel="redirects" quickFilter="Search redirects…" exportName="redirects"
      />
      <AdminCard title="Add redirect" className="mt-4">
        <form action={createRedirect} className="row g-2 align-items-end">
          <div className="col-md-4"><label className="form-label" htmlFor="rf">From path</label><input id="rf" name="fromPath" className="form-control form-control-sm" placeholder="/old-url" required /></div>
          <div className="col-md-4"><label className="form-label" htmlFor="rt">To path</label><input id="rt" name="toPath" className="form-control form-control-sm" placeholder="/new-url" required /></div>
          <div className="col-md-2"><label className="form-label" htmlFor="rc">Code</label><select id="rc" name="statusCode" className="form-select form-select-sm"><option value="301">301</option><option value="302">302</option></select></div>
          <div className="col-md-1 d-flex align-items-end"><div className="form-check"><input className="form-check-input" type="checkbox" name="active" id="ra" defaultChecked /><label className="form-check-label" htmlFor="ra">On</label></div></div>
          <div className="col-md-1"><button className="btn btn-gold btn-sm w-100">Add</button></div>
        </form>
      </AdminCard>
    </>
  );
}
