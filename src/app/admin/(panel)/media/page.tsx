import { prisma } from "@/lib/prisma";
import { uploadMedia, deleteMedia } from "./actions";
import PageHeader from "@/components/admin/ui/page-header";
import MediaGrid, { type MediaRow } from "@/components/admin/media/media-grid";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const media = await prisma.media.findMany({ orderBy: { createdAt: "desc" } });
  const rows: MediaRow[] = media.map((m) => ({
    id: m.id, url: m.url, alt: m.alt ?? "", type: m.mimeType ?? "—", created: m.createdAt.toISOString(),
  }));

  return (
    <>
      <PageHeader
        title="Media library"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Media" }]}
        action={
          <details className="admin-import">
            <summary className="btn btn-gold btn-sm"><i className="bi bi-upload me-1" aria-hidden="true" />Upload</summary>
            <form action={uploadMedia} className="admin-card mt-2" style={{ position: "absolute", zIndex: 20, width: 320 }}>
              <div className="mb-2">
                <label className="form-label" htmlFor="file">Upload image</label>
                <input id="file" name="file" type="file" accept="image/*" className="form-control form-control-sm" required />
              </div>
              <div className="mb-2">
                <label className="form-label" htmlFor="alt">Alt text</label>
                <input id="alt" name="alt" className="form-control form-control-sm" placeholder="Describe the image" />
              </div>
              <button type="submit" className="btn btn-gold btn-sm w-100">Upload</button>
            </form>
          </details>
        }
      />

      <MediaGrid rows={rows} deleteAction={deleteMedia} />
    </>
  );
}
