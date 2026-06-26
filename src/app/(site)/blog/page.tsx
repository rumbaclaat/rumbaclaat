import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Blog & Stories",
  description: "Stories, craft and cocktail culture from Rumbaclaat.",
};

function formatDate(d: Date | null | undefined) {
  return d
    ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "";
}

export default async function BlogIndex() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "published" },
    orderBy: [{ featured: "desc" }, { publishDate: "desc" }],
  });

  const [featured, ...rest] = posts;

  return (
    <section className="section">
      <div className="container">
        <div className="text-center mb-5">
          <span className="eyebrow eyebrow-center">From the blog</span>
          <h1 className="serif" style={{ fontSize: "clamp(2rem,4.4vw,3.4rem)", margin: ".25rem 0 0" }}>
            Stories &amp; Craft
          </h1>
          <p className="hero-lede">
            Heritage, craft and cocktail culture from the Rumbaclaat house — long reads, short stories and everything between.
          </p>
        </div>

        {posts.length === 0 ? (
          <p className="text-center" style={{ color: "var(--text-dim)" }}>No posts yet.</p>
        ) : (
          <>
            {/* Featured story */}
            {featured && (
              <Link
                href={`/blog/${featured.slug}`}
                className="card-brand card-brand--feature d-block text-decoration-none mb-5"
                aria-label={`Read featured story: ${featured.title}`}
                style={{ overflow: "hidden" }}
              >
                <div className="row g-0 g-md-4 align-items-center">
                  <div className="col-12 col-md-6">
                    <div
                      style={{
                        aspectRatio: "16/10",
                        borderRadius: "var(--radius-lg)",
                        background: "var(--surface-sunken)",
                        backgroundImage: featured.heroImage ? `url('${featured.heroImage}')` : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <div style={{ padding: "20px 8px 4px" }}>
                      <span className="eyebrow" style={{ marginBottom: 10 }}>Featured story</span>
                      <h2
                        className="serif"
                        style={{ fontSize: "clamp(1.6rem,3vw,2.4rem)", color: "var(--text)", margin: "0 0 12px" }}
                      >
                        {featured.title}
                      </h2>
                      {featured.category && <span className="badge-brand mb-3 d-inline-block">{featured.category}</span>}
                      {featured.excerpt && (
                        <p style={{ color: "var(--text-muted)", margin: "0 0 16px", maxWidth: 480 }}>{featured.excerpt}</p>
                      )}
                      <p style={{ fontSize: ".75rem", color: "var(--text-dim)", margin: 0 }}>
                        {formatDate(featured.publishDate)}
                        {featured.readTime ? ` · ${featured.readTime}` : ""}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* 3-up grid */}
            {rest.length > 0 && (
              <div className="row g-4">
                {rest.map((p) => (
                  <div className="col-12 col-md-6 col-lg-4" key={p.id}>
                    <Link
                      href={`/blog/${p.slug}`}
                      className="card-brand d-flex flex-column h-100 text-decoration-none"
                    >
                      <div
                        style={{
                          aspectRatio: "16/9",
                          borderRadius: "var(--radius-lg)",
                          background: "var(--surface-sunken)",
                          marginBottom: 16,
                          backgroundImage: p.heroImage ? `url('${p.heroImage}')` : undefined,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      />
                      {p.category && <span className="badge-brand mb-2 align-self-start">{p.category}</span>}
                      <h2 className="serif" style={{ fontSize: "1.3rem", color: "var(--text)", margin: "0 0 8px" }}>
                        {p.title}
                      </h2>
                      {p.excerpt && (
                        <p style={{ fontSize: ".875rem", color: "var(--text-muted)", margin: "0 0 16px" }}>{p.excerpt}</p>
                      )}
                      <p
                        className="mt-auto"
                        style={{ fontSize: ".75rem", color: "var(--text-dim)", margin: 0 }}
                      >
                        {formatDate(p.publishDate)}
                        {p.readTime ? ` · ${p.readTime}` : ""}
                      </p>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
