import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/admin/ui/page-header";
import ImageField from "@/components/admin/media/image-field";
import { managedPage, getSectionImageMap, sectionImage } from "@/lib/section-images";
import { updateSectionImage } from "../actions";

export const dynamic = "force-dynamic";

export default async function LayoutImagesEditor({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const page = managedPage(key);
  if (!page) notFound();

  const map = await getSectionImageMap();

  return (
    <>
      <PageHeader
        title={`${page.title} — section images`}
        subtitle={page.slug}
        breadcrumb={[
          { label: "Dashboard", href: "/admin" },
          { label: "Pages", href: "/admin/pages" },
          { label: page.title },
        ]}
        action={
          <Link href={page.slug} target="_blank" className="btn btn-outline-gold btn-sm">
            View ↗
          </Link>
        }
      />

      {page.note && (
        <div className="admin-card mb-3">
          <p className="admin-form-section-desc m-0">
            <i className="bi bi-info-circle me-2" aria-hidden="true" />
            {page.note}
          </p>
        </div>
      )}

      <p className="admin-form-section-desc mb-3">
        Sections are listed in the order they appear on the page. You can replace the hero and parallax
        images; the other sections are built in code and shown here for context.
      </p>

      <ol className="list-unstyled m-0">
        {page.sections.map((s, i) => {
          if (s.kind === "locked") {
            return (
              <li
                key={i}
                className="admin-card mb-2 d-flex align-items-center gap-2"
                style={{ opacity: 0.7 }}
              >
                <i className="bi bi-lock" aria-hidden="true" style={{ color: "var(--text-dim)" }} />
                <span style={{ fontWeight: 600 }}>{s.label}</span>
                <span className="admin-badge admin-badge--muted ms-auto">Managed in code</span>
              </li>
            );
          }

          const current = sectionImage(map, s.slot);
          const isCustom = Boolean(map[s.slot]);
          return (
            <li key={i} className="admin-card mb-2">
              <div
                className="d-flex align-items-center gap-2 mb-3 pb-2"
                style={{ borderBottom: "1px solid var(--gold-bdr)" }}
              >
                <i className="bi bi-image" aria-hidden="true" style={{ color: "var(--gold-hi)" }} />
                <span style={{ fontWeight: 600 }}>{s.label}</span>
                <span className={`admin-badge ms-auto ${isCustom ? "" : "admin-badge--muted"}`}>
                  {isCustom ? "Custom image" : "Default image"}
                </span>
              </div>
              <form action={updateSectionImage}>
                <input type="hidden" name="key" value={page.key} />
                <input type="hidden" name="slot" value={s.slot} />
                <ImageField
                  name="url"
                  label="Background image"
                  value={current}
                  col="col-12"
                  hint={
                    isCustom
                      ? "Replace or upload to change. Remove resets to the built-in default."
                      : "Showing the built-in default. Replace or upload to override; Remove keeps the default."
                  }
                />
                <button type="submit" className="btn btn-gold btn-sm mt-2">
                  Save image
                </button>
              </form>
            </li>
          );
        })}
      </ol>
    </>
  );
}
