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

      <div className="row g-4">
        {/* Main — the menus list leads the page */}
        <div className="col-12 col-lg-8">
          <AdminCard title="Menus">
            {menus.length === 0 ? (
              <p className="td-muted mb-0">No menus yet. Create one in the panel on the right.</p>
            ) : (
              <div>
                {menus.map((m) => (
                  <div className="admin-mini-row" key={m.id}>
                    <div className="grow">
                      <div className="t" style={{ textTransform: "capitalize" }}>{m.location}</div>
                      <div className="s">{m._count.items} item(s)</div>
                    </div>
                    <Link href={`/admin/navigation/${m.id}`} className="btn btn-outline-gold btn-sm">Edit menu</Link>
                    <form action={deleteMenu}>
                      <input type="hidden" name="id" value={m.id} />
                      <button className="btn btn-ghost btn-sm text-danger" aria-label="Delete menu"><i className="bi bi-trash" /></button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </AdminCard>
        </div>

        {/* Rail — secondary "Create menu" action card */}
        <div className="col-12 col-lg-4">
          <AdminCard title="Create menu">
            <form action={createMenu} className="d-flex flex-column gap-2">
              <div>
                <label className="form-label" htmlFor="loc">Location</label>
                <select id="loc" name="location" className="form-select form-select-sm"><option value="header">header</option><option value="footer">footer</option><option value="footer-2">footer-2</option><option value="mobile">mobile</option></select>
              </div>
              <button className="btn btn-gold btn-sm">Create</button>
            </form>
          </AdminCard>
        </div>
      </div>
    </>
  );
}
