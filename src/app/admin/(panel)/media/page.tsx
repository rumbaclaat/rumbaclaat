import { prisma } from "@/lib/prisma";
import { uploadMedia, deleteMedia } from "./actions";
import PageHeader from "@/components/admin/ui/page-header";
import AdminCard from "@/components/admin/ui/admin-card";
import MediaGrid, { type MediaRow } from "@/components/admin/media/media-grid";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const media = await prisma.media.findMany({ orderBy: { createdAt: "desc" } });
  const rows: MediaRow[] = media.map((m) => ({
    id: m.id, url: m.url, alt: m.alt ?? "", type: m.mimeType ?? "—", created: m.createdAt.toISOString(),
  }));

  return (
    <>
      <PageHeader title="Media library" breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Media" }]} />

      <AdminCard className="mb-4">
        <form action={uploadMedia} className="d-flex flex-wrap align-items-end gap-3">
          <div>
            <label className="form-label" htmlFor="file">Upload image</label>
            <input id="file" name="file" type="file" accept="image/*" className="form-control" required />
          </div>
          <div className="flex-grow-1">
            <label className="form-label" htmlFor="alt">Alt text</label>
            <input id="alt" name="alt" className="form-control" placeholder="Describe the image" />
          </div>
          <button type="submit" className="btn btn-gold">Upload</button>
        </form>
      </AdminCard>

      <MediaGrid rows={rows} deleteAction={deleteMedia} />
    </>
  );
}
