import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "Search" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  let products: { slug: string; name: string; subtitle: string | null }[] = [];
  let cocktails: { slug: string; name: string; lede: string | null }[] = [];
  let posts: { slug: string; title: string; excerpt: string | null }[] = [];

  if (query.length >= 2) {
    [products, cocktails, posts] = await Promise.all([
      prisma.product.findMany({ where: { status: "published", name: { contains: query, mode: "insensitive" } }, select: { slug: true, name: true, subtitle: true }, take: 8 }),
      prisma.cocktail.findMany({ where: { status: "published", name: { contains: query, mode: "insensitive" } }, select: { slug: true, name: true, lede: true }, take: 8 }),
      prisma.blogPost.findMany({ where: { status: "published", title: { contains: query, mode: "insensitive" } }, select: { slug: true, title: true, excerpt: true }, take: 8 }),
    ]);
  }

  const total = products.length + cocktails.length + posts.length;
  const hasQuery = query.length >= 2;

  return (
    <section className="section">
      <div className="container">
        {/* Query header */}
        <header style={{ maxWidth: 760, marginBottom: 36 }}>
          <span className="eyebrow">Search</span>
          <h1 className="mb-3">
            {hasQuery ? <>Results for <em className="gold">“{query}”</em></> : "Find your serve"}
          </h1>
          <form action="/search" className="ck-search" style={{ maxWidth: "100%" }} role="search">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
            <label htmlFor="q" className="visually-hidden">Search rum, cocktails and journal</label>
            <input id="q" type="search" name="q" className="form-control" placeholder="Search rum, cocktails, journal…" defaultValue={query} />
          </form>
          {hasQuery && (
            <p style={{ fontSize: ".8125rem", color: "var(--text-dim)", margin: "14px 0 0" }}>
              {total} result{total === 1 ? "" : "s"} across rum &amp; apparel, cocktails and journal
            </p>
          )}
        </header>

        {hasQuery && total > 0 && (
          <div className="row g-4 g-lg-5">
            {/* Filter rail — anchors to result groups */}
            <aside className="col-12 col-lg-3" aria-label="Filter results">
              <div className="card-brand" style={{ position: "sticky", top: 90, padding: 20 }}>
                <div style={{ fontSize: ".6875rem", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 600, marginBottom: 12 }}>Jump to</div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                  {products.length > 0 && (
                    <li><a href="#results-products" style={filterLink}><span>Rum &amp; Apparel</span><span style={filterCount}>{products.length}</span></a></li>
                  )}
                  {cocktails.length > 0 && (
                    <li><a href="#results-cocktails" style={filterLink}><span>Cocktails</span><span style={filterCount}>{cocktails.length}</span></a></li>
                  )}
                  {posts.length > 0 && (
                    <li><a href="#results-journal" style={filterLink}><span>Journal</span><span style={filterCount}>{posts.length}</span></a></li>
                  )}
                </ul>
              </div>
            </aside>

            {/* Result grid */}
            <div className="col-12 col-lg-9">
              {products.length > 0 && (
                <section id="results-products" aria-labelledby="h-products" style={{ marginBottom: 40, scrollMarginTop: 90 }}>
                  <h2 id="h-products" className="h4 mb-3">Rum &amp; Apparel</h2>
                  <div className="row g-3">
                    {products.map((p) => (
                      <div className="col-12 col-sm-6 col-xl-4" key={`p-${p.slug}`}>
                        <Link href={`/product/${p.slug}`} className="card-brand h-100 d-block" style={resultCard}>
                          <span className="badge-brand" style={{ marginBottom: 12 }}>Rum &amp; Apparel</span>
                          <h3 className="serif" style={resultTitle}>{p.name}</h3>
                          {p.subtitle && <p style={resultLede}>{p.subtitle}</p>}
                        </Link>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {cocktails.length > 0 && (
                <section id="results-cocktails" aria-labelledby="h-cocktails" style={{ marginBottom: 40, scrollMarginTop: 90 }}>
                  <h2 id="h-cocktails" className="h4 mb-3">Cocktails</h2>
                  <div className="row g-3">
                    {cocktails.map((c) => (
                      <div className="col-12 col-sm-6 col-xl-4" key={`c-${c.slug}`}>
                        <Link href={`/cocktails/${c.slug}`} className="card-brand h-100 d-block" style={resultCard}>
                          <span className="badge-brand" style={{ marginBottom: 12 }}>Cocktail</span>
                          <h3 className="serif" style={resultTitle}>{c.name}</h3>
                          {c.lede && <p style={resultLede}>{c.lede}</p>}
                        </Link>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {posts.length > 0 && (
                <section id="results-journal" aria-labelledby="h-journal" style={{ scrollMarginTop: 90 }}>
                  <h2 id="h-journal" className="h4 mb-3">Journal</h2>
                  <div className="row g-3">
                    {posts.map((b) => (
                      <div className="col-12 col-sm-6 col-xl-4" key={`b-${b.slug}`}>
                        <Link href={`/blog/${b.slug}`} className="card-brand h-100 d-block" style={resultCard}>
                          <span className="badge-brand" style={{ marginBottom: 12 }}>Journal</span>
                          <h3 className="serif" style={resultTitle}>{b.title}</h3>
                          {b.excerpt && <p style={resultLede}>{b.excerpt}</p>}
                        </Link>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        )}

        {/* Empty state */}
        {hasQuery && total === 0 && (
          <div className="card-brand text-center" style={{ maxWidth: 560, margin: "0 auto", padding: "48px 28px" }}>
            <div className="info-icon" style={{ width: 52, height: 52, margin: "0 auto 18px", fontSize: "1.4rem" }} aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
            </div>
            <h2 className="h4 mb-2">No matches for “{query}”</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: 22 }}>We couldn&apos;t find anything by that name. Try a different spelling, or explore the collections below.</p>
            <div className="d-flex gap-2 justify-content-center flex-wrap">
              <Link href="/shop" className="btn btn-gold">Browse the shop</Link>
              <Link href="/cocktails" className="btn btn-outline-gold">View cocktails</Link>
            </div>
          </div>
        )}

        {/* Prompt before a query is entered */}
        {!hasQuery && (
          <p style={{ color: "var(--text-muted)", maxWidth: 560 }}>Start typing to search across rum &amp; apparel, cocktails and the journal. Enter at least two characters.</p>
        )}
      </div>
    </section>
  );
}

const filterLink: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  padding: "8px 10px",
  borderRadius: 9,
  color: "var(--text-muted)",
  textDecoration: "none",
  fontSize: ".875rem",
};
const filterCount: React.CSSProperties = {
  fontSize: ".75rem",
  color: "var(--gold-hi)",
  background: "var(--gold-lt)",
  border: "1px solid var(--gold-bdr)",
  borderRadius: 999,
  padding: "1px 9px",
  fontVariantNumeric: "tabular-nums",
};
const resultCard: React.CSSProperties = {
  padding: 20,
  textDecoration: "none",
  color: "var(--text)",
};
const resultTitle: React.CSSProperties = {
  fontSize: "1.15rem",
  margin: "0 0 6px",
};
const resultLede: React.CSSProperties = {
  fontSize: ".875rem",
  color: "var(--text-muted)",
  margin: 0,
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};
