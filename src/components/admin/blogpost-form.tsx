import Link from "next/link";
import type { BlogPost } from "@/generated/prisma/client";
import RichTextEditor from "@/components/admin/rich-text-editor";

function dateInput(d: Date | null | undefined): string {
  return d ? new Date(d).toISOString().slice(0, 10) : "";
}

export default function BlogPostForm({
  action,
  post,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  post?: BlogPost;
  submitLabel: string;
}) {
  return (
    <form action={action} className="admin-card">
      {post && <input type="hidden" name="id" value={post.id} />}
      <div className="row g-3">
        <div className="col-md-8">
          <label className="form-label" htmlFor="title">Title *</label>
          <input id="title" name="title" className="form-control" defaultValue={post?.title ?? ""} required />
        </div>
        <div className="col-md-4">
          <label className="form-label" htmlFor="status">Status</label>
          <select id="status" name="status" className="form-select" defaultValue={post?.status ?? "draft"}>
            <option value="draft">draft</option>
            <option value="published">published</option>
            <option value="archived">archived</option>
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label" htmlFor="category">Category</label>
          <input id="category" name="category" className="form-control" defaultValue={post?.category ?? ""} placeholder="Heritage" />
        </div>
        <div className="col-md-4">
          <label className="form-label" htmlFor="readTime">Read time</label>
          <input id="readTime" name="readTime" className="form-control" defaultValue={post?.readTime ?? ""} placeholder="6 min read" />
        </div>
        <div className="col-md-4">
          <label className="form-label" htmlFor="publishDate">Publish date</label>
          <input id="publishDate" name="publishDate" type="date" className="form-control" defaultValue={dateInput(post?.publishDate)} />
        </div>
        <div className="col-md-8">
          <label className="form-label" htmlFor="slug">Slug <span style={{ color: "var(--text-dim)" }}>(auto if blank)</span></label>
          <input id="slug" name="slug" className="form-control" defaultValue={post?.slug ?? ""} />
        </div>
        <div className="col-md-4 d-flex align-items-end">
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="featured" name="featured" defaultChecked={post?.featured ?? false} />
            <label className="form-check-label" htmlFor="featured">Featured</label>
          </div>
        </div>
        <div className="col-12">
          <label className="form-label" htmlFor="heroImage">Hero image URL</label>
          <input id="heroImage" name="heroImage" className="form-control" defaultValue={post?.heroImage ?? ""} />
        </div>
        <div className="col-12">
          <label className="form-label" htmlFor="excerpt">Excerpt</label>
          <textarea id="excerpt" name="excerpt" rows={2} className="form-control" defaultValue={post?.excerpt ?? ""} />
        </div>
        <div className="col-12">
          <label className="form-label">Body</label>
          <RichTextEditor name="body" defaultValue={post?.body ?? ""} />
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="seoTitle">SEO title</label>
          <input id="seoTitle" name="seoTitle" className="form-control" defaultValue={post?.seoTitle ?? ""} />
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="seoDescription">SEO description</label>
          <input id="seoDescription" name="seoDescription" className="form-control" defaultValue={post?.seoDescription ?? ""} />
        </div>
      </div>
      <div className="d-flex gap-2 mt-4">
        <button type="submit" className="btn btn-gold">{submitLabel}</button>
        <Link href="/admin/blog" className="btn btn-ghost">Cancel</Link>
      </div>
    </form>
  );
}
