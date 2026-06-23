import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/ui/page-header";
import EntityGrid, { type GridRow } from "@/components/admin/grid/entity-grid";
import { deleteBanner, reorderBanners } from "./actions";

export const dynamic = "force-dynamic";

export default async function BannersPage() {
  const items = await prisma.banner.findMany({ orderBy: { sortOrder: "asc" } });
  const rows: GridRow[] = items.map((b) => ({ id: b.id, message: b.message, type: b.type, link: b.link ?? "—", active: b.active ? "active" : "inactive" }));
  return (
    <>
      <PageHeader
        title="Banners"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Banners" }]}
        subtitle="Announcement bars shown at the top of the storefront."
        action={<Link href="/admin/banners/new" className="btn btn-gold btn-sm"><i className="bi bi-plus-lg me-1" />New banner</Link>}
      />
      <EntityGrid
        rows={rows}
        columns={[{ field: "message", header: "Message", flex: 2.4 }, { field: "type", header: "Type", width: 140 }, { field: "link", header: "Link", flex: 1.2 }, { field: "active", header: "Status", type: "status", width: 120 }]}
        nameField="message" editBase="/admin/banners" deleteAction={deleteBanner} reorderAction={reorderBanners}
        resultsLabel="banners" quickFilter="Search banners…" exportName="banners"
      />
    </>
  );
}
