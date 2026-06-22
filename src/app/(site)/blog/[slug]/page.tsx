import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getPost(slug: string) {
  return prisma.blogPost.findFirst({
    where: { slug, status: "published" },
    include: { author: true },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPost(slug);
  if (!p) return {};
  return {
    title: p.seoTitle ?? p.title,
    description: p.seoDescription ?? p.excerpt ?? undefined,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <article className="section">
      <div className="container" style={{ maxWidth: 760 }}>
        <nav aria-label="Breadcrumb" className="mb-3">
          <ol className="breadcrumb" style={{ fontSize: ".75rem" }}>
            <li className="breadcrumb-item"><Link href="/">Home</Link></li>
            <li className="breadcrumb-item"><Link href="/blog">Blog</Link></li>
            <li className="breadcrumb-item active" aria-current="page">{post.title}</li>
          </ol>
        </nav>

        {post.category && <span className="eyebrow">{post.category}</span>}
        <h1 className="mb-3">{post.title}</h1>
        <p style={{ fontSize: ".8125rem", color: "var(--text-dim)" }}>
          {post.author?.name ?? "Rumbaclaat"}
          {post.publishDate ? ` · ${new Date(post.publishDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}` : ""}
          {post.readTime ? ` · ${post.readTime}` : ""}
        </p>

        {post.heroImage && (
          <div style={{ aspectRatio: "16/9", borderRadius: "var(--radius-xl)", backgroundImage: `url('${post.heroImage}')`, backgroundSize: "cover", backgroundPosition: "center", margin: "20px 0" }} />
        )}

        {post.excerpt && (
          <p className="hero-lede" style={{ margin: "0 0 24px" }}>{post.excerpt}</p>
        )}

        {post.body ? (
          <div dangerouslySetInnerHTML={{ __html: post.body }} />
        ) : (
          <p style={{ color: "var(--text-muted)" }}>This article has no content yet.</p>
        )}

        <div className="mt-5">
          <Link href="/blog" className="btn btn-outline-gold">← All posts</Link>
        </div>
      </div>
    </article>
  );
}
