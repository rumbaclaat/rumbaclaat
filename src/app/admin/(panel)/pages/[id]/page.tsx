import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BLOCKS, BLOCK_TYPES, type BlockField } from "@/lib/blocks/registry";
import RichTextEditor from "@/components/admin/rich-text-editor";
import PageHeader from "@/components/admin/ui/page-header";
import FormSection from "@/components/admin/ui/form-section";
import SaveBar from "@/components/admin/ui/save-bar";
import StatusBadge from "@/components/admin/ui/status-badge";
import AdminTabs from "@/components/admin/ui/tabs";
import RowActions from "@/components/admin/ui/row-actions";
import ImageField from "@/components/admin/media/image-field";
import {
  updatePage,
  addBlock,
  updateBlock,
  deleteBlock,
  toggleBlock,
  moveBlock,
} from "../actions";

export const dynamic = "force-dynamic";

const PAGE_FORM_ID = "page-settings-form";
const TEXTAREA_TYPES = new Set(["textarea", "lines", "pairs", "richtext"]);
const STATUSES = ["draft", "published", "archived"];

function FieldInput({ field, value }: { field: BlockField; value: unknown }) {
  const v = value == null ? "" : String(value);
  if (field.type === "richtext") {
    return <RichTextEditor name={field.key} defaultValue={v} />;
  }
  if (TEXTAREA_TYPES.has(field.type)) {
    return (
      <textarea
        name={field.key}
        rows={5}
        className="form-control form-control-sm"
        defaultValue={v}
        placeholder={field.placeholder}
      />
    );
  }
  return (
    <input
      name={field.key}
      type={field.type === "number" ? "number" : "text"}
      className="form-control form-control-sm"
      defaultValue={v}
      placeholder={field.placeholder}
    />
  );
}

export default async function PageEditor({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const page = await prisma.page.findUnique({
    where: { id },
    include: { blocks: { orderBy: { order: "asc" } } },
  });
  if (!page) notFound();

  // General + SEO tab content. These inputs are associated with the standalone
  // <form id={PAGE_FORM_ID} action={updatePage}> via the HTML `form` attribute,
  // so they can live inside the tab panels while the block forms below stay
  // independent (never nested). Field names are unchanged — the server action
  // receives the same FormData.
  const generalTab = (
    <FormSection title="Page settings" description="Title and slug for this page.">
      <div className="col-md-8">
        <label className="form-label" htmlFor="title">Title</label>
        <input form={PAGE_FORM_ID} id="title" name="title" className="form-control" defaultValue={page.title} />
      </div>
      <div className="col-md-4">
        <label className="form-label" htmlFor="slug">Slug</label>
        <input form={PAGE_FORM_ID} id="slug" name="slug" className="form-control" defaultValue={page.slug} />
      </div>
    </FormSection>
  );

  const seoTab = (
    <FormSection title="Search engine (SEO)" description="How this page appears in search and when shared.">
      <div className="col-12">
        <label className="form-label" htmlFor="seoTitle">SEO title</label>
        <input form={PAGE_FORM_ID} id="seoTitle" name="seoTitle" className="form-control" defaultValue={page.seoTitle ?? ""} />
      </div>
      <div className="col-12">
        <label className="form-label" htmlFor="seoDescription">SEO description</label>
        <textarea form={PAGE_FORM_ID} id="seoDescription" name="seoDescription" rows={4} className="form-control" defaultValue={page.seoDescription ?? ""} />
      </div>
      {/* Social share image (OG) — rendered inside the bound settings form below,
          because ImageField writes a hidden <input> that can't be attached to a
          form via the HTML `form` attribute (and the shared component must not be
          edited). */}
    </FormSection>
  );

  const contentTab = (
    <>
      <div className="d-flex align-items-end justify-content-between flex-wrap gap-3 mb-3">
        <div>
          <h2 className="admin-form-section-title" style={{ fontSize: "1.3rem" }}>Content blocks</h2>
          <p className="admin-form-section-desc">Add, reorder, hide and edit the sections that make up this page.</p>
        </div>
        <form action={addBlock} className="d-flex gap-2 align-items-center">
          <input type="hidden" name="pageId" value={page.id} />
          <select name="type" className="form-select form-select-sm" aria-label="Block type to add" style={{ minWidth: 180 }}>
            {BLOCK_TYPES.map((t) => (
              <option key={t} value={t}>{BLOCKS[t].label}</option>
            ))}
          </select>
          <button type="submit" className="btn btn-outline-gold btn-sm text-nowrap">
            <i className="bi bi-plus-lg me-1" aria-hidden="true" />Add block
          </button>
        </form>
      </div>

      {page.blocks.length === 0 && (
        <div className="admin-card admin-empty">
          <i className="bi bi-layout-text-window" aria-hidden="true" />
          <div className="admin-empty-title">No blocks yet</div>
          <div>Choose a block type above and click “Add block” to start composing the page.</div>
        </div>
      )}

      {page.blocks.map((block, i) => {
        const def = BLOCKS[block.type];
        const data = (block.data ?? {}) as Record<string, unknown>;
        return (
          <div key={block.id} className="admin-card mb-3" style={{ opacity: block.visible ? 1 : 0.62 }}>
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 pb-3" style={{ borderBottom: "1px solid var(--gold-bdr)" }}>
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-grip-vertical" aria-hidden="true" style={{ color: "var(--text-dim)", fontSize: "1.1rem" }} />
                <span style={{ fontWeight: 600 }}>{def?.label ?? block.type}</span>
                {!block.visible && <span className="admin-badge admin-badge--muted">Hidden</span>}
              </div>
              <div className="d-flex align-items-center gap-1">
                <form action={moveBlock}>
                  <input type="hidden" name="id" value={block.id} />
                  <input type="hidden" name="pageId" value={page.id} />
                  <input type="hidden" name="dir" value="up" />
                  <button className="btn btn-ghost btn-sm" disabled={i === 0} title="Move up" aria-label="Move up">
                    <i className="bi bi-arrow-up" aria-hidden="true" />
                  </button>
                </form>
                <form action={moveBlock}>
                  <input type="hidden" name="id" value={block.id} />
                  <input type="hidden" name="pageId" value={page.id} />
                  <input type="hidden" name="dir" value="down" />
                  <button className="btn btn-ghost btn-sm" disabled={i === page.blocks.length - 1} title="Move down" aria-label="Move down">
                    <i className="bi bi-arrow-down" aria-hidden="true" />
                  </button>
                </form>
                <form action={toggleBlock}>
                  <input type="hidden" name="id" value={block.id} />
                  <input type="hidden" name="pageId" value={page.id} />
                  <button className="btn btn-ghost btn-sm" title={block.visible ? "Hide" : "Show"} aria-label={block.visible ? "Hide block" : "Show block"}>
                    <i className={`bi ${block.visible ? "bi-eye" : "bi-eye-slash"}`} aria-hidden="true" />
                  </button>
                </form>
                <RowActions
                  deleteAction={deleteBlock}
                  deleteFields={{ id: block.id, pageId: page.id }}
                  confirmLabel={`Delete the “${def?.label ?? block.type}” block?`}
                />
              </div>
            </div>

            {def && def.dataDriven && (
              <p className="admin-form-section-desc mb-3">{def.description}</p>
            )}

            <form action={updateBlock}>
              <input type="hidden" name="id" value={block.id} />
              <input type="hidden" name="pageId" value={page.id} />
              <input type="hidden" name="type" value={block.type} />
              <div className="row g-2">
                {def?.fields.map((f) =>
                  f.type === "image" ? (
                    <ImageField
                      key={f.key}
                      name={f.key}
                      label={f.label}
                      value={data[f.key] ? String(data[f.key]) : ""}
                      col="col-12"
                    />
                  ) : (
                    <div className={TEXTAREA_TYPES.has(f.type) ? "col-12" : "col-md-6"} key={f.key}>
                      <label className="form-label">{f.label}</label>
                      <FieldInput field={f} value={data[f.key]} />
                    </div>
                  )
                )}
              </div>
              <button type="submit" className="btn btn-outline-gold btn-sm mt-3">Save block</button>
            </form>
          </div>
        );
      })}
    </>
  );

  return (
    <>
      <PageHeader
        title={page.title}
        subtitle={`/${page.slug}`}
        breadcrumb={[
          { label: "Dashboard", href: "/admin" },
          { label: "Pages", href: "/admin/pages" },
          { label: page.title },
        ]}
        action={
          <Link href={`/${page.slug}`} target="_blank" className="btn btn-outline-gold btn-sm">
            View ↗
          </Link>
        }
      />

      <div className="admin-product-grid">
        {/* Tabbed main column — only the active section renders */}
        <div className="admin-product-main">
          <AdminTabs
            tabs={[
              { id: "general", label: "General", content: generalTab },
              { id: "seo", label: "SEO", content: seoTab },
              { id: "content", label: "Content", badge: page.blocks.length, content: contentTab },
            ]}
          />
        </div>

        {/* Persistent rail — Publish state lives here on every tab */}
        <div className="admin-product-rail">
          <FormSection title="Publish">
            <div className="col-12 mb-1">
              <StatusBadge status={page.status} />
            </div>
            <div className="col-12">
              <label className="form-label" htmlFor="status">Status</label>
              <select form={PAGE_FORM_ID} id="status" name="status" className="form-select" defaultValue={page.status}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-12">
              <label className="form-label" htmlFor="templateType">Template</label>
              <input form={PAGE_FORM_ID} id="templateType" name="templateType" className="form-control" defaultValue={page.templateType} />
            </div>
          </FormSection>
        </div>
      </div>

      {/* Standalone page-settings form. The General / SEO / Publish inputs above
          bind to it via the HTML `form` attribute, so the Content-tab block forms
          are never nested inside it. The OG image lives here (ImageField can't be
          bound via `form`), and the sticky save bar carries the one gold Save. */}
      <form id={PAGE_FORM_ID} action={updatePage}>
        <input type="hidden" name="id" value={page.id} />
        <FormSection title="Social share image" description="Shown when the page is shared on social media (SEO).">
          <ImageField name="ogImage" label="Social share image (OG)" value={page.ogImage ?? ""} col="col-md-6" />
        </FormSection>
        <SaveBar submitLabel="Save settings" cancelHref="/admin/pages" />
      </form>
    </>
  );
}
