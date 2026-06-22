import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deletePost } from "./actions";

export const dynamic = "force-dynamic";

export default async function BlogAdminList() {
  const posts = await prisma.blogPost.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <>
      <div className="admin-page-head">
        <h1>Blog</h1>
        <Link href="/admin/blog/new" className="btn btn-gold btn-sm">+ New post</Link>
      </div>

      <div className="admin-card p-0" style={{ overflow: "hidden" }}>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Featured</th>
                <th style={{ width: 1 }}></th>
                <th style={{ width: 1 }}></th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 && (
                <tr><td colSpan={6} style={{ color: "var(--text-dim)" }}>No posts yet.</td></tr>
              )}
              {posts.map((p) => (
                <tr key={p.id}>
                  <td><Link href={`/admin/blog/${p.id}`} className="gold">{p.title}</Link></td>
                  <td style={{ color: "var(--text-muted)" }}>{p.category ?? "—"}</td>
                  <td style={{ textTransform: "capitalize", color: p.status === "published" ? "var(--green)" : "var(--yellow)" }}>{p.status}</td>
                  <td>{p.featured ? "★" : ""}</td>
                  <td>
                    <Link href={`/blog/${p.slug}`} target="_blank" className="btn btn-ghost btn-sm">View ↗</Link>
                  </td>
                  <td>
                    <form action={deletePost}>
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" className="btn btn-ghost btn-sm" style={{ color: "var(--red)" }}>Delete</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
