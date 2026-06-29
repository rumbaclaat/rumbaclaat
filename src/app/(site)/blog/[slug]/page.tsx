import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BlogShareRow from "./BlogShareRow";

export const dynamic = "force-dynamic";

async function getPost(slug: string) {
  return prisma.blogPost.findFirst({
    where: { slug, status: "published" },
    include: { author: true },
  });
}

async function getRelatedPosts(slug: string) {
  return prisma.blogPost.findMany({
    where: { status: "published", slug: { not: slug } },
    orderBy: { publishDate: "desc" },
    take: 3,
    select: { slug: true, title: true, category: true, excerpt: true },
  });
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
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

  const related = await getRelatedPosts(slug);
  const authorName = post.author?.name ?? "Rumbaclaat";
  const dateLabel = post.publishDate
    ? new Date(post.publishDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;
  const dateISO = post.publishDate
    ? new Date(post.publishDate).toISOString().slice(0, 10)
    : undefined;
  // Hero figcaption is a real caption, not the post title. The BlogPost model
  // has no dedicated caption field, so fall back to a brand image credit that
  // mirrors the static source ("American oak barrels at our partner
  // distillery, Jamaica.") rather than echoing the headline.
  const heroCaption = "Original Reserve, aged in American oak at our partner distillery.";

  return (
    <>
      {/* Hero band — left-aligned gradient with bottom gold border */}
      <section
        className="section-sm"
        style={{
          background: "linear-gradient(135deg,#15151B,#0E0E12)",
          borderBottom: "1px solid var(--gold-bdr)",
        }}
      >
        <div className="container" style={{ maxWidth: 780 }}>
          <nav aria-label="Breadcrumb">
            <ol
              className="breadcrumb"
              style={{ fontSize: ".75rem", marginBottom: 16 }}
            >
              <li className="breadcrumb-item">
                <Link href="/">Home</Link>
              </li>
              <li className="breadcrumb-item">
                <Link href="/blog">Journal</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Article
              </li>
            </ol>
          </nav>
          {post.category && <span className="eyebrow">{post.category}</span>}
          <h1 style={{ fontSize: "clamp(2rem,4vw,3rem)" }}>{post.title}</h1>
          {post.excerpt && (
            <p
              className="lede"
              style={{
                fontSize: "1.1rem",
                color: "var(--text-muted)",
                maxWidth: 580,
                marginTop: 14,
              }}
            >
              {post.excerpt}
            </p>
          )}
          <div
            className="d-flex align-items-center gap-3 mt-3 flex-wrap"
            style={{ fontSize: ".8125rem", color: "var(--text-dim)" }}
          >
            <span>
              <strong style={{ color: "var(--text)" }}>{authorName}</strong>
            </span>
            {dateLabel && (
              <>
                <span aria-hidden="true">·</span>
                <time dateTime={dateISO}>{dateLabel}</time>
              </>
            )}
            {post.readTime && (
              <>
                <span aria-hidden="true">·</span>
                <span>{post.readTime}</span>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Hero image as figure with caption on card background */}
      {post.heroImage && (
        <figure className="my-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.heroImage}
            alt={post.title}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              maxHeight: 520,
              objectFit: "cover",
            }}
          />
          <figcaption
            style={{
              textAlign: "center",
              fontSize: ".75rem",
              color: "var(--text-dim)",
              padding: "10px 16px",
              background: "var(--bg-card)",
            }}
          >
            {heroCaption}
          </figcaption>
        </figure>
      )}

      {/* Article body — 740px reading column */}
      <article className="section" style={{ paddingTop: 48 }}>
        <div className="container" style={{ maxWidth: 740 }}>
          {post.body ? (
            <div
              className="blog-body"
              style={{ fontSize: "1.0625rem" }}
              dangerouslySetInnerHTML={{ __html: post.body }}
            />
          ) : (
            <p style={{ color: "var(--text-muted)" }}>
              This article has no content yet.
            </p>
          )}

          {/* Share row */}
          <BlogShareRow title={post.seoTitle ?? post.title} />

          {/* Author bio */}
          <div
            className="card-brand d-flex gap-3 align-items-center mt-4"
            style={{ padding: 18 }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "var(--gold-lt)",
                border: "1px solid var(--gold-md)",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--serif)",
                color: "var(--gold-hi)",
                fontSize: "1.4rem",
              }}
              aria-hidden="true"
            >
              {initials(authorName)}
            </div>
            <div>
              <p
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "1.05rem",
                  marginBottom: 2,
                  color: "var(--text)",
                }}
              >
                {authorName}
              </p>
              <p
                style={{
                  fontSize: ".8125rem",
                  color: "var(--text-muted)",
                  margin: 0,
                }}
              >
                {post.author?.bio ??
                  "Founder & storyteller. Writes about the work behind the bottle."}
              </p>
            </div>
          </div>
        </div>
      </article>

      {/* More from the journal */}
      {related.length > 0 && (
        <section
          className="section"
          style={{
            background: "#0E0E12",
            borderTop: "1px solid var(--gold-bdr)",
          }}
        >
          <div className="container">
            <h2 className="h3 mb-4">More from the journal</h2>
            <div className="row g-4">
              {related.map((r) => (
                <div className="col-12 col-md-4" key={r.slug}>
                  <Link
                    className="card-brand h-100 d-block"
                    href={`/blog/${r.slug}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    {r.category && <span className="eyebrow">{r.category}</span>}
                    <h3
                      className="h5 mt-2"
                      style={{ fontFamily: "var(--serif)" }}
                    >
                      {r.title}
                    </h3>
                    {r.excerpt && (
                      <p
                        style={{
                          fontSize: ".875rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        {r.excerpt}
                      </p>
                    )}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
