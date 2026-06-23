import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deletePage } from "./actions";
import PageHeader from "@/components/admin/ui/page-header";
import PagesGrid, { type PageRow } from "@/components/admin/pages/pages-grid";

export const dynamic = "force-dynamic";

export default async function PagesList() {
  const pages = await prisma.page.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { blocks: true } } },
  });

  const rows: PageRow[] = pages.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    blocks: p._count.blocks,
    updatedAt: p.updatedAt.toISOString(),
    status: p.status,
  }));

  return (
    <>
      <PageHeader
        title="Pages"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Pages" }]}
        action={
          <Link href="/admin/pages/new" className="btn btn-gold btn-sm">
            <i className="bi bi-plus-lg me-1" aria-hidden="true" />New page
          </Link>
        }
      />
      <PagesGrid rows={rows} deleteAction={deletePage} />
    </>
  );
}
