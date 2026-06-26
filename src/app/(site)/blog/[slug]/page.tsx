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
      <div className="container" style={{ maxWidth: 820 }}>
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="breadcrumb" style={{ fontSize: ".75rem" }}>
            <li className="breadcrumb-item"><Link href="/">Home</Link></li>
            <li className="breadcrumb-item"><Link href="/blog">Blog</Link></li>
            <li className="breadcrumb-item active" aria-current="page">{post.title}</li>
          </ol>
        </nav>

        {/* Article head — centred reading column */}
        <header className="text-center" style={{ maxWidth: 760, margin: "0 auto" }}>
          {post.category && <span className="eyebrow eyebrow-center">{post.category}</span>}
          <h1 className="serif" style={{ fontSize: "clamp(2rem,4.4vw,3.4rem)", margin: ".25rem 0 16px" }}>
            {post.title}
          </h1>
          <p style={{ fontSize: ".8125rem", color: "var(--text-dim)", margin: 0 }}>
            {post.author?.name ?? "Rumbaclaat"}
            {post.publishDate ? ` · ${new Date(post.publishDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}` : ""}
            {post.readTime ? ` · ${post.readTime}` : ""}
          </p>
        </header>

        {/* Wide hero image */}
        {post.heroImage && (
          <div
            role="img"
            aria-label={`${post.title} — feature image`}
            style={{
              aspectRatio: "16/9",
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--gold-bdr)",
              backgroundImage: `url('${post.heroImage}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              margin: "32px 0",
            }}
          />
        )}

        {/* Serif lede */}
        {post.excerpt && (
          <p
            className="serif"
            style={{
              fontSize: "clamp(1.2rem,2.4vw,1.5rem)",
              lineHeight: 1.55,
              color: "var(--text)",
              margin: post.heroImage ? "0 0 32px" : "32px 0",
            }}
          >
            {post.excerpt}
          </p>
        )}

        {/* Sectioned body */}
        {post.body ? (
          <div
            className="blog-body"
            style={{ fontSize: "1.0625rem", lineHeight: 1.8, color: "var(--text-muted)" }}
            dangerouslySetInnerHTML={{ __html: post.body }}
          />
        ) : (
          <p style={{ color: "var(--text-muted)" }}>This article has no content yet.</p>
        )}

        {/* Prev / shop footer */}
        <footer
          className="mt-5 pt-4 d-flex flex-wrap align-items-center gap-3"
          style={{ borderTop: "1px solid var(--gold-bdr)" }}
        >
          <Link href="/blog" className="btn btn-outline-gold">← All posts</Link>
          <Link href="/shop" className="btn btn-gold ms-auto">Shop the collection →</Link>
        </footer>
      </div>
    </article>
  );
}
