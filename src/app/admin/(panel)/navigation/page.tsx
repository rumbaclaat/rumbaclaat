import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/ui/page-header";
import AdminCard from "@/components/admin/ui/admin-card";
import { createMenu, deleteMenu } from "./actions";

export const dynamic = "force-dynamic";

export default async function NavigationPage() {
  const menus = await prisma.navigationMenu.findMany({ include: { _count: { select: { items: true } } } });
  return (
    <>
      <PageHeader title="Navigation" breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Navigation" }]} subtitle="Build the header and footer menus." />
      <div className="row g-3">
        {menus.map((m) => (
          <div className="col-12 col-md-6 col-lg-4" key={m.id}>
            <AdminCard>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h2 className="admin-form-section-title" style={{ fontSize: "1.1rem", textTransform: "capitalize" }}>{m.location}</h2>
                  <p className="td-muted mb-2">{m._count.items} item(s)</p>
                </div>
                <form action={deleteMenu}><input type="hidden" name="id" value={m.id} /><button className="btn btn-ghost btn-sm text-danger"><i className="bi bi-trash" /></button></form>
              </div>
              <Link href={`/admin/navigation/${m.id}`} className="btn btn-outline-gold btn-sm">Edit menu</Link>
            </AdminCard>
          </div>
        ))}
      </div>

      <AdminCard title="Create menu" className="mt-4" >
        <form action={createMenu} className="d-flex gap-2 align-items-end" style={{ maxWidth: 420 }}>
          <div className="flex-grow-1">
            <label className="form-label" htmlFor="loc">Location</label>
            <select id="loc" name="location" className="form-select form-select-sm"><option value="header">header</option><option value="footer">footer</option><option value="footer-2">footer-2</option><option value="mobile">mobile</option></select>
          </div>
          <button className="btn btn-gold btn-sm">Create</button>
        </form>
      </AdminCard>
    </>
  );
}
