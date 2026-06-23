import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/ui/page-header";
import AdminCard from "@/components/admin/ui/admin-card";
import NavItemsEditor from "@/components/admin/navigation/nav-items-editor";
import { addNavItem, updateNavItem, deleteNavItem, reorderNavItems } from "../actions";

export const dynamic = "force-dynamic";

export default async function MenuEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const menu = await prisma.navigationMenu.findUnique({ where: { id }, include: { items: { orderBy: { sortOrder: "asc" } } } });
  if (!menu) notFound();
  return (
    <>
      <PageHeader title={`Menu: ${menu.location}`} breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Navigation", href: "/admin/navigation" }, { label: menu.location }]} />

      <NavItemsEditor
        menuId={menu.id}
        items={menu.items.map((i) => ({ id: i.id, label: i.label, url: i.url, visible: i.visible }))}
        updateAction={updateNavItem}
        deleteAction={deleteNavItem}
        reorderAction={reorderNavItems}
      />

      <AdminCard title="Add item" className="mt-3">
        <form action={addNavItem} className="row g-2 align-items-end">
          <input type="hidden" name="menuId" value={menu.id} />
          <div className="col-md-5"><label className="form-label" htmlFor="nl">Label</label><input id="nl" name="label" className="form-control form-control-sm" required /></div>
          <div className="col-md-5"><label className="form-label" htmlFor="nu">URL</label><input id="nu" name="url" className="form-control form-control-sm" placeholder="/shop" required /></div>
          <div className="col-md-2"><button className="btn btn-gold btn-sm w-100">Add item</button></div>
        </form>
      </AdminCard>
    </>
  );
}
