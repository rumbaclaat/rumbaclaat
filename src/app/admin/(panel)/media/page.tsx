/* eslint-disable @next/next/no-img-element */
import { prisma } from "@/lib/prisma";
import { uploadMedia, deleteMedia } from "./actions";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const media = await prisma.media.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <>
      <div className="admin-page-head">
        <h1>Media library</h1>
      </div>

      <form action={uploadMedia} className="admin-card mb-4 d-flex flex-wrap align-items-end gap-3">
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

      <div className="row g-3">
        {media.length === 0 && (
          <p style={{ color: "var(--text-dim)" }}>No media yet. Upload an image — then copy its URL into a product, page or blog post.</p>
        )}
        {media.map((m) => (
          <div className="col-6 col-md-4 col-lg-3" key={m.id}>
            <div className="admin-card p-2">
              <div style={{ aspectRatio: "1", borderRadius: 8, overflow: "hidden", background: "var(--bg-card3)", marginBottom: 8 }}>
                <img src={m.url} alt={m.alt ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <input className="form-control form-control-sm" readOnly value={m.url} style={{ fontSize: ".6875rem" }} />
              <form action={deleteMedia} className="mt-2">
                <input type="hidden" name="id" value={m.id} />
                <button type="submit" className="btn btn-ghost btn-sm w-100" style={{ color: "var(--red)" }}>Delete</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
