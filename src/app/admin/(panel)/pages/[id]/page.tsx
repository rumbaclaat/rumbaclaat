import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BLOCKS, BLOCK_TYPES, type BlockField } from "@/lib/blocks/registry";
import {
  updatePage,
  addBlock,
  updateBlock,
  deleteBlock,
  toggleBlock,
  moveBlock,
} from "../actions";

export const dynamic = "force-dynamic";

const TEXTAREA_TYPES = new Set(["textarea", "lines", "pairs", "richtext"]);

function FieldInput({ field, value }: { field: BlockField; value: unknown }) {
  const v = value == null ? "" : String(value);
  if (TEXTAREA_TYPES.has(field.type)) {
    return (
      <textarea
        name={field.key}
        rows={field.type === "richtext" ? 5 : 3}
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

  return (
    <>
      <div className="admin-page-head">
        <h1>Edit page: {page.title}</h1>
        <Link href={`/${page.slug}`} target="_blank" className="btn btn-outline-gold btn-sm">
          View page ↗
        </Link>
      </div>

      {/* Page settings */}
      <form action={updatePage} className="admin-card mb-4">
        <input type="hidden" name="id" value={page.id} />
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label" htmlFor="title">Title</label>
            <input id="title" name="title" className="form-control" defaultValue={page.title} />
          </div>
          <div className="col-md-3">
            <label className="form-label" htmlFor="slug">Slug</label>
            <input id="slug" name="slug" className="form-control" defaultValue={page.slug} />
          </div>
          <div className="col-md-3">
            <label className="form-label" htmlFor="status">Status</label>
            <select id="status" name="status" className="form-select" defaultValue={page.status}>
              <option value="draft">draft</option>
              <option value="published">published</option>
              <option value="archived">archived</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="seoTitle">SEO title</label>
            <input id="seoTitle" name="seoTitle" className="form-control" defaultValue={page.seoTitle ?? ""} />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="ogImage">OG image URL</label>
            <input id="ogImage" name="ogImage" className="form-control" defaultValue={page.ogImage ?? ""} />
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="seoDescription">SEO description</label>
            <textarea id="seoDescription" name="seoDescription" rows={2} className="form-control" defaultValue={page.seoDescription ?? ""} />
          </div>
        </div>
        <button type="submit" className="btn btn-gold mt-3">Save page settings</button>
      </form>

      {/* Blocks */}
      <h2 className="h5 mb-3">Content blocks</h2>

      {page.blocks.length === 0 && (
        <p style={{ color: "var(--text-dim)" }}>No blocks yet. Add one below.</p>
      )}

      {page.blocks.map((block, i) => {
        const def = BLOCKS[block.type];
        const data = (block.data ?? {}) as Record<string, unknown>;
        return (
          <div key={block.id} className="admin-card mb-3" style={{ opacity: block.visible ? 1 : 0.55 }}>
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
              <div>
                <span className="badge-brand">{def?.label ?? block.type}</span>
                {!block.visible && <span className="ms-2" style={{ color: "var(--text-dim)", fontSize: ".75rem" }}>hidden</span>}
              </div>
              <div className="d-flex gap-1">
                <form action={moveBlock}>
                  <input type="hidden" name="id" value={block.id} />
                  <input type="hidden" name="pageId" value={page.id} />
                  <input type="hidden" name="dir" value="up" />
                  <button className="btn btn-ghost btn-sm" disabled={i === 0} title="Move up">↑</button>
                </form>
                <form action={moveBlock}>
                  <input type="hidden" name="id" value={block.id} />
                  <input type="hidden" name="pageId" value={page.id} />
                  <input type="hidden" name="dir" value="down" />
                  <button className="btn btn-ghost btn-sm" disabled={i === page.blocks.length - 1} title="Move down">↓</button>
                </form>
                <form action={toggleBlock}>
                  <input type="hidden" name="id" value={block.id} />
                  <input type="hidden" name="pageId" value={page.id} />
                  <button className="btn btn-ghost btn-sm" title="Toggle visibility">{block.visible ? "Hide" : "Show"}</button>
                </form>
                <form action={deleteBlock}>
                  <input type="hidden" name="id" value={block.id} />
                  <input type="hidden" name="pageId" value={page.id} />
                  <button className="btn btn-ghost btn-sm" style={{ color: "var(--red)" }} title="Delete">✕</button>
                </form>
              </div>
            </div>

            {def && def.dataDriven && (
              <p style={{ color: "var(--text-dim)", fontSize: ".8125rem" }}>
                {def.description}
              </p>
            )}

            <form action={updateBlock}>
              <input type="hidden" name="id" value={block.id} />
              <input type="hidden" name="pageId" value={page.id} />
              <input type="hidden" name="type" value={block.type} />
              <div className="row g-2">
                {def?.fields.map((f) => (
                  <div className={TEXTAREA_TYPES.has(f.type) ? "col-12" : "col-md-6"} key={f.key}>
                    <label className="form-label">{f.label}</label>
                    <FieldInput field={f} value={data[f.key]} />
                  </div>
                ))}
              </div>
              <button type="submit" className="btn btn-outline-gold btn-sm mt-3">Save block</button>
            </form>
          </div>
        );
      })}

      {/* Add block */}
      <form action={addBlock} className="admin-card d-flex gap-2 align-items-end" style={{ maxWidth: 480 }}>
        <input type="hidden" name="pageId" value={page.id} />
        <div className="flex-grow-1">
          <label className="form-label" htmlFor="add-type">Add a block</label>
          <select id="add-type" name="type" className="form-select form-select-sm">
            {BLOCK_TYPES.map((t) => (
              <option key={t} value={t}>{BLOCKS[t].label}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-gold btn-sm">+ Add</button>
      </form>
    </>
  );
}
