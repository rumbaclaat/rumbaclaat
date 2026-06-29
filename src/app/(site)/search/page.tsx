import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "Search" };

type ResultRow = {
  key: string;
  href: string;
  kind: string;
  img: string | null;
  title: string;
  desc: string;
  score: number;
};

// Split text into highlighted/plain segments for matched search terms.
// Returns React nodes with <mark> around matched terms.
function highlight(text: string, terms: string[]): React.ReactNode {
  if (!text || terms.length === 0) return text;
  const cleaned = terms.filter(Boolean);
  if (cleaned.length === 0) return text;
  const escaped = cleaned.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const lowered = cleaned.map((t) => t.toLowerCase());
  // Split on the matched terms, keeping the delimiters (capture group).
  const parts = text.split(new RegExp(`(${escaped.join("|")})`, "ig"));
  return parts.map((part, i) =>
    lowered.includes(part.toLowerCase()) ? (
      <mark key={i}>{part}</mark>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

function scoreOf(haystack: string, terms: string[]): number {
  const hay = haystack.toLowerCase();
  let score = 0;
  for (const t of terms) {
    if (t && hay.indexOf(t) !== -1) score++;
  }
  return score;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const hasQuery = query.length >= 2;

  let products: { slug: string; name: string; subtitle: string | null; imageUrl: string | null }[] = [];
  let cocktails: { slug: string; name: string; lede: string | null; image: string | null }[] = [];
  let posts: { slug: string; title: string; excerpt: string | null; heroImage: string | null }[] = [];

  if (hasQuery) {
    [products, cocktails, posts] = await Promise.all([
      prisma.product.findMany({ where: { status: "published", name: { contains: query, mode: "insensitive" } }, select: { slug: true, name: true, subtitle: true, imageUrl: true }, take: 8 }),
      prisma.cocktail.findMany({ where: { status: "published", name: { contains: query, mode: "insensitive" } }, select: { slug: true, name: true, lede: true, image: true }, take: 8 }),
      prisma.blogPost.findMany({ where: { status: "published", title: { contains: query, mode: "insensitive" } }, select: { slug: true, title: true, excerpt: true, heroImage: true }, take: 8 }),
    ]);
  }

  // Mix all matches into a single, score-ranked list (design renders one flat list).
  const rows: ResultRow[] = [
    ...products.map((p) => ({
      key: `p-${p.slug}`,
      href: `/product/${p.slug}`,
      kind: "PRODUCT",
      img: p.imageUrl,
      title: p.name,
      desc: p.subtitle ?? "",
      score: scoreOf(`${p.name} ${p.subtitle ?? ""}`, terms),
    })),
    ...cocktails.map((c) => ({
      key: `c-${c.slug}`,
      href: `/cocktails/${c.slug}`,
      kind: "COCKTAIL",
      img: c.image,
      title: c.name,
      desc: c.lede ?? "",
      score: scoreOf(`${c.name} ${c.lede ?? ""}`, terms),
    })),
    ...posts.map((b) => ({
      key: `b-${b.slug}`,
      href: `/blog/${b.slug}`,
      kind: "JOURNAL",
      img: b.heroImage,
      title: b.title,
      desc: b.excerpt ?? "",
      score: scoreOf(`${b.title} ${b.excerpt ?? ""}`, terms),
    })),
  ].sort((a, b) => b.score - a.score);

  const total = rows.length;

  let statusText = "Type at least 2 characters to search.";
  if (hasQuery) {
    statusText = total
      ? `${total} result${total === 1 ? "" : "s"} for "${query}"`
      : `No results for "${query}"`;
  }

  return (
    <>
      <section
        className="section-sm"
        style={{ background: "linear-gradient(135deg,#15151B,#0E0E12)", borderBottom: "1px solid var(--gold-bdr)" }}
      >
        <div className="container reveal" style={{ maxWidth: 760 }}>
          <span className="eyebrow">SEARCH</span>
          <h1>Find what you&apos;re looking for</h1>
          <form id="search-form" action="/search" role="search" className="mt-3">
            <label className="visually-hidden" htmlFor="search-input">Search products, cocktails and articles</label>
            <div className="d-flex gap-2">
              <input
                className="form-control form-control-lg"
                type="search"
                id="search-input"
                name="q"
                defaultValue={query}
                placeholder={'Try "rum", "hoodie", "cocktail"…'}
                autoComplete="off"
              />
              <button type="submit" className="btn btn-gold">Search</button>
            </div>
          </form>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 820 }}>
          <div id="search-status" style={{ fontSize: ".875rem", color: "var(--text-muted)", marginBottom: 18 }} aria-live="polite">
            {statusText}
          </div>

          <div id="search-results">
            {rows.map((r) => (
              <Link key={r.key} href={r.href} className="search-result">
                <img
                  src={r.img ?? "https://images.unsplash.com/photo-1758871993077-e084cc7eca86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200"}
                  alt=""
                  style={{ width: 72, height: 72, borderRadius: 8, objectFit: "cover", flexShrink: 0 }}
                />
                <div>
                  <span className="kind" style={{ fontSize: ".6875rem", letterSpacing: ".15em", color: "var(--text-dim)" }}>{r.kind}</span>
                  <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.1rem", margin: "2px 0", color: "var(--text)" }}>
                    {highlight(r.title, terms)}
                  </h3>
                  {r.desc && (
                    <p style={{ fontSize: ".875rem", color: "var(--text-muted)", margin: 0 }}>
                      {highlight(r.desc, terms)}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {hasQuery && total === 0 && (
            <div id="search-empty">
              <p style={{ color: "var(--text-muted)" }}>No results found. Try a different keyword or browse:</p>
              <div className="d-flex gap-2 flex-wrap mt-3">
                <Link className="btn btn-ghost btn-sm" href="/shop?category=rum">Rum</Link>
                <Link className="btn btn-ghost btn-sm" href="/shop?category=mens-apparel">Men&apos;s</Link>
                <Link className="btn btn-ghost btn-sm" href="/shop?category=womens-apparel">Women&apos;s</Link>
                <Link className="btn btn-ghost btn-sm" href="/cocktails">Cocktails</Link>
                <Link className="btn btn-ghost btn-sm" href="/blog">Journal</Link>
                <Link className="btn btn-ghost btn-sm" href="/faq">FAQ</Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
