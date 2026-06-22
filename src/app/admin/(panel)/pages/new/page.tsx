import Link from "next/link";
import { createPage } from "../actions";

export default function NewPagePage() {
  return (
    <>
      <div className="admin-page-head">
        <h1>New page</h1>
      </div>
      <form action={createPage} className="admin-card" style={{ maxWidth: 640 }}>
        <div className="row g-3">
          <div className="col-sm-8">
            <label className="form-label" htmlFor="title">Title *</label>
            <input id="title" name="title" className="form-control" required />
          </div>
          <div className="col-sm-4">
            <label className="form-label" htmlFor="status">Status</label>
            <select id="status" name="status" className="form-select" defaultValue="draft">
              <option value="draft">draft</option>
              <option value="published">published</option>
            </select>
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="slug">Slug <span style={{ color: "var(--text-dim)" }}>(auto if blank)</span></label>
            <input id="slug" name="slug" className="form-control" placeholder="about" />
          </div>
        </div>
        <div className="d-flex gap-2 mt-4">
          <button type="submit" className="btn btn-gold">Create &amp; add blocks</button>
          <Link href="/admin/pages" className="btn btn-ghost">Cancel</Link>
        </div>
      </form>
    </>
  );
}
