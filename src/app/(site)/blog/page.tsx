/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import BlogCategoryTabs, { type BlogCardData } from "./BlogCategoryTabs";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Blog & Stories",
  description: "Stories, craft and cocktail culture from Rumbaclaat.",
};

const PARALLAX_IMG =
  "https://images.unsplash.com/photo-1505682499293-233fb141754c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1800&q=80";

const CAT_LABELS: Record<string, string> = { Membership: "RPM" };
const catLabel = (c: string | null | undefined) => (c ? CAT_LABELS[c] ?? c : "");

function formatDate(d: Date | null | undefined) {
  return d
    ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "";
}

function metaLine(d: Date | null | undefined, readTime: string | null | undefined) {
  const date = formatDate(d);
  if (date && readTime) return `${date} · ${readTime}`;
  return date || readTime || "";
}

export default async function BlogIndex() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "published" },
    orderBy: [{ featured: "desc" }, { publishDate: "desc" }],
  });

  const [featured, ...rest] = posts;
  const sidebar = rest.slice(0, 3);

  const gridPosts: BlogCardData[] = posts.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    category: p.category,
    excerpt: p.excerpt,
    heroImage: p.heroImage,
    meta: metaLine(p.publishDate, p.readTime),
  }));

  return (
    <>
      {/* Hero band — static-source/blog.html ll.81-87 */}
      <section
        className="section-sm"
        style={{
          background: "linear-gradient(135deg,#161208,#0E0E0E)",
          borderBottom: "1px solid var(--gold-bdr)",
        }}
      >
        <div className="container reveal">
          <span className="eyebrow">STORIES &amp; CRAFT</span>
          <h1>The Rumbaclaat Journal</h1>
          <p style={{ maxWidth: 500, marginTop: 10 }}>
            Heritage, craft, culture, and cocktails. Stories from the distillery, the bar, and the journey in between.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {posts.length === 0 ? (
            <p style={{ color: "var(--text-dim)" }}>No posts yet.</p>
          ) : (
            <>
              {/* Featured row — static-source/blog.html ll.92-110 */}
              <div className="row g-4 mb-5 reveal">
                <div className="col-12 col-lg-7">
                  {featured && (
                    <article className="product-card h-100">
                      <div className="product-card-img" style={{ aspectRatio: "16/9" }}>
                        {featured.heroImage ? (
                          <img src={featured.heroImage} alt={featured.title} loading="lazy" />
                        ) : (
                          <div style={{ width: "100%", height: "100%", background: "var(--bg-card2)" }} />
                        )}
                        <span className="badge-brand badge-gold" style={{ position: "absolute", top: 12, left: 12 }}>
                          Featured
                        </span>
                      </div>
                      <div className="product-card-body">
                        {featured.category && <span className="badge-brand mb-2">{catLabel(featured.category)}</span>}
                        <h2 style={{ fontSize: "1.75rem", marginBottom: 10 }}>
                          <Link className="stretched-card-link gold" href={`/blog/${featured.slug}`}>
                            {featured.title}
                          </Link>
                        </h2>
                        {featured.excerpt && <p style={{ flex: 1 }}>{featured.excerpt}</p>}
                        <p
                          style={{
                            fontSize: ".8125rem",
                            color: "var(--text-dim)",
                            marginTop: 16,
                            paddingTop: 16,
                            borderTop: "1px solid var(--gold-bdr)",
                          }}
                        >
                          {metaLine(featured.publishDate, featured.readTime)}
                        </p>
                      </div>
                    </article>
                  )}
                </div>

                <div className="col-12 col-lg-5 d-flex flex-column gap-3">
                  {sidebar.map((p) => (
                    <article className="product-card reveal" key={p.id}>
                      <div className="d-flex gap-3 p-3">
                        {p.heroImage ? (
                          <img
                            src={p.heroImage}
                            alt={p.title}
                            loading="lazy"
                            style={{
                              width: 90,
                              height: 90,
                              objectFit: "cover",
                              borderRadius: 10,
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 90,
                              height: 90,
                              borderRadius: 10,
                              flexShrink: 0,
                              background: "var(--bg-card2)",
                            }}
                          />
                        )}
                        <div>
                          {p.category && (
                            <span className="badge-brand mb-1 d-inline-flex">{catLabel(p.category)}</span>
                          )}
                          <h3 className="h4" style={{ fontSize: "1rem" }}>
                            <Link className="stretched-card-link gold" href={`/blog/${p.slug}`}>
                              {p.title}
                            </Link>
                          </h3>
                          {p.excerpt && <p style={{ fontSize: ".8125rem", margin: "4px 0" }}>{p.excerpt}</p>}
                          <span style={{ fontSize: ".75rem", color: "var(--text-dim)" }}>
                            {metaLine(p.publishDate, p.readTime)}
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              {/* Gold divider — static-source/blog.html l.112 */}
              <hr style={{ borderColor: "var(--gold-bdr)", marginBottom: 32 }} />

              {/* Category filter + post grid — static-source/blog.html ll.114-210 */}
              <BlogCategoryTabs posts={gridPosts} />
            </>
          )}
        </div>
      </section>

      {/* Closing parallax CTA — static-source/blog.html ll.214-217 */}
      <section
        className="parallax-section"
        style={{ minHeight: 420, backgroundImage: `url('${PARALLAX_IMG}')` }}
        aria-labelledby="blog-px"
      >
        <div className="parallax-overlay" />
        <div className="parallax-content reveal">
          <span className="eyebrow eyebrow-center">HERITAGE &amp; CRAFT</span>
          <h2 id="blog-px">
            Every Bottle
            <br />
            Has a Story
          </h2>
          <p>
            From distillery diaries to cocktail culture — the words behind the spirit, written by the people who live it.
          </p>
        </div>
      </section>
    </>
  );
}
