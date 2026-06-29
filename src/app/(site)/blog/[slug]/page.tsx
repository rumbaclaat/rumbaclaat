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

  const authorName = post.author?.name ?? "Rumbaclaat";
  const dateLabel = post.publishDate
    ? new Date(post.publishDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;
  // meta line mirrors the prototype: "Rumbaclaat · 20 January 2025 · 6 min read"
  const meta = [authorName, dateLabel, post.readTime]
    .filter(Boolean)
    .join(" · ");

  return (
    <article
      style={{
        padding:
          "clamp(28px,4vw,44px) clamp(20px,5vw,40px) clamp(72px,9vw,110px)",
      }}
    >
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div
          style={{
            fontSize: ".78rem",
            color: "var(--dim)",
            marginBottom: 22,
          }}
        >
          <Link href="/" style={{ color: "var(--dim)" }}>
            Home
          </Link>{" "}
          <span style={{ opacity: 0.5 }}>/</span>{" "}
          <Link href="/blog" style={{ color: "var(--dim)" }}>
            Blog
          </Link>{" "}
          <span style={{ opacity: 0.5 }}>/</span>{" "}
          <span style={{ color: "var(--muted)" }}>{post.title}</span>
        </div>
        {post.category && (
          <span
            style={{
              fontSize: ".72rem",
              letterSpacing: ".16em",
              textTransform: "uppercase",
              color: "var(--gold)",
              fontWeight: 600,
            }}
          >
            {post.category}
          </span>
        )}
        <h1
          style={{
            fontFamily: "var(--serif)",
            fontWeight: 600,
            fontSize: "clamp(2.3rem,5vw,3.5rem)",
            lineHeight: 1.05,
            margin: "12px 0 0",
          }}
        >
          {post.title}
        </h1>
        {meta && (
          <div
            style={{
              color: "var(--dim)",
              fontSize: ".86rem",
              marginTop: 14,
            }}
          >
            {meta}
          </div>
        )}
        {post.excerpt && (
          <p
            style={{
              color: "var(--text)",
              fontSize: "1.18rem",
              lineHeight: 1.6,
              fontStyle: "italic",
              margin: "22px 0 0",
              fontFamily: "var(--serif)",
            }}
          >
            {post.excerpt}
          </p>
        )}
      </div>

      {post.heroImage && (
        <div
          style={{
            maxWidth: 960,
            margin: "32px auto 0",
            aspectRatio: "16 / 8",
            borderRadius: 18,
            overflow: "hidden",
            border: "1px solid var(--line)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.heroImage}
            alt={post.title}
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>
      )}

      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        {post.body ? (
          <div
            className="blog-body"
            style={{ marginTop: 32 }}
            dangerouslySetInnerHTML={{ __html: post.body }}
          />
        ) : (
          <p
            style={{
              color: "var(--muted)",
              fontSize: "1.05rem",
              lineHeight: 1.8,
              marginTop: 32,
            }}
          >
            This article has no content yet.
          </p>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            marginTop: 44,
            paddingTop: 24,
            borderTop: "1px solid var(--line2)",
          }}
        >
          <Link
            href="/blog"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              color: "var(--muted)",
              fontSize: ".9rem",
              textDecoration: "none",
            }}
          >
            <i className="bi bi-arrow-left"></i>All posts
          </Link>
          <Link
            href="/shop"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
              background: "var(--gold)",
              color: "var(--onGold)",
              borderRadius: 999,
              padding: "11px 24px",
              fontSize: ".9rem",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Shop the rum <i className="bi bi-arrow-right"></i>
          </Link>
        </div>
      </div>
    </article>
  );
}
