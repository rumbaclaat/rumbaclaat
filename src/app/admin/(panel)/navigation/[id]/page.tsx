import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/ui/page-header";
import NavItemsEditor from "@/components/admin/navigation/nav-items-editor";
import { addNavItem, updateNavItem, deleteNavItem, reorderNavItems } from "../actions";

export const dynamic = "force-dynamic";

export default async function MenuEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const menu = await prisma.navigationMenu.findUnique({ where: { id }, include: { items: { orderBy: { sortOrder: "asc" } } } });
  if (!menu) notFound();
  return (
    <>
      <PageHeader
        title={`Menu: ${menu.location}`}
        subtitle={`${menu.items.length} item(s) · ${menu.location} menu`}
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Navigation", href: "/admin/navigation" }, { label: menu.location }]}
      />

      <NavItemsEditor
        menuId={menu.id}
        menuLocation={menu.location}
        items={menu.items.map((i) => ({ id: i.id, label: i.label, url: i.url, visible: i.visible }))}
        addAction={addNavItem}
        updateAction={updateNavItem}
        deleteAction={deleteNavItem}
        reorderAction={reorderNavItems}
      />
    </>
  );
}
