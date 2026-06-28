import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deletePage } from "./actions";
import PageHeader from "@/components/admin/ui/page-header";
import SectionLabel from "@/components/admin/ui/section-label";
import PagesGrid, { type PageRow } from "@/components/admin/pages/pages-grid";
import { MANAGED_PAGES } from "@/lib/section-images";

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

      {/* Subordinate secondary section — the page leads with the single pages
          grid above; these code-built layouts are a smaller, lighter follow-on. */}
      <div className="mt-5">
        <SectionLabel>Storefront layouts</SectionLabel>
        <p className="admin-form-section-desc mb-3" style={{ fontSize: ".82rem" }}>
          Hand-built pages — replace their hero &amp; parallax images in place, in page order. The other
          sections are managed in code.
        </p>
        <div className="row g-3">
          {MANAGED_PAGES.map((p) => {
            const images = p.sections.filter((s) => s.kind === "image").length;
            return (
              <div className="col-12 col-md-6 col-lg-3" key={p.key}>
                <Link
                  href={`/admin/pages/layouts/${p.key}`}
                  className="admin-card d-block h-100 text-decoration-none"
                >
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <span style={{ fontWeight: 600 }}>{p.title}</span>
                    <i className="bi bi-images" aria-hidden="true" style={{ color: "var(--gold-hi)" }} />
                  </div>
                  <div className="admin-form-section-desc" style={{ fontSize: ".8rem" }}>{p.slug}</div>
                  <span className="admin-badge admin-badge--muted mt-2 d-inline-block">
                    {images} image{images === 1 ? "" : "s"}
                  </span>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
