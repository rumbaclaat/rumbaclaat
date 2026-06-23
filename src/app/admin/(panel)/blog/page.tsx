import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deletePost } from "./actions";
import PageHeader from "@/components/admin/ui/page-header";
import BlogGrid, { type BlogRow } from "@/components/admin/blog/blog-grid";

export const dynamic = "force-dynamic";

export default async function BlogAdminList() {
  const posts = await prisma.blogPost.findMany({ orderBy: { updatedAt: "desc" } });
  const rows: BlogRow[] = posts.map((p) => ({
    id: p.id, title: p.title, slug: p.slug, category: p.category ?? "—", status: p.status, featured: p.featured ? "★ Featured" : "",
  }));
  return (
    <>
      <PageHeader
        title="Blog"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Blog" }]}
        action={<Link href="/admin/blog/new" className="btn btn-gold btn-sm"><i className="bi bi-plus-lg me-1" aria-hidden="true" />New post</Link>}
      />
      <BlogGrid rows={rows} deleteAction={deletePost} />
    </>
  );
}
