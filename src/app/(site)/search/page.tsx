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
    <div data-screen-label="Search">
      {/* ---- Hero with live search input (form GET /search, name="q" preserved) ---- */}
      <section
        style={{
          position: "relative",
          padding: "clamp(48px,7vw,84px) clamp(20px,5vw,40px) clamp(40px,6vw,56px)",
          overflow: "hidden",
          borderBottom: "1px solid var(--line2)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(80% 70% at 50% 0%, rgba(205,181,130,.1), transparent 60%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", maxWidth: 760, margin: "0 auto" }}>
          <span
            style={{
              fontSize: ".74rem",
              letterSpacing: ".24em",
              textTransform: "uppercase",
              color: "var(--gold)",
              fontWeight: 600,
            }}
          >
            Search
          </span>
          <h1
            style={{
              fontFamily: "var(--serif)",
              fontWeight: 600,
              fontSize: "clamp(2.2rem,5vw,3.4rem)",
              lineHeight: 1.05,
              margin: "12px 0 0",
            }}
          >
            Find what you&apos;re looking for
          </h1>
          <p
            style={{
              color: "var(--muted)",
              fontSize: "1.05rem",
              lineHeight: 1.6,
              maxWidth: 560,
              margin: "14px 0 0",
            }}
          >
            Search across rum, apparel, cocktails and the journal.
          </p>
          <form
            id="search-form"
            action="/search"
            role="search"
            style={{ display: "flex", gap: 10, marginTop: 22, flexWrap: "wrap" }}
          >
            <label
              htmlFor="search-input"
              style={{
                position: "absolute",
                width: 1,
                height: 1,
                padding: 0,
                margin: -1,
                overflow: "hidden",
                clip: "rect(0,0,0,0)",
                whiteSpace: "nowrap",
                border: 0,
              }}
            >
              Search products, cocktails and articles
            </label>
            <input
              type="search"
              id="search-input"
              name="q"
              defaultValue={query}
              placeholder={'Try "rum", "hoodie", "cocktail"…'}
              autoComplete="off"
              style={{
                flex: "1 1 280px",
                background: "var(--surface2)",
                border: "1px solid var(--line2)",
                color: "var(--text)",
                borderRadius: 10,
                padding: "13px 16px",
                fontSize: ".95rem",
                outline: "none",
                fontFamily: "var(--sans)",
              }}
            />
            <button
              type="submit"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "var(--gold)",
                color: "var(--onGold)",
                border: "none",
                borderRadius: 999,
                padding: "13px 30px",
                fontSize: ".92rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <i className="bi bi-search" /> Search
            </button>
          </form>
        </div>
      </section>

      {/* ---- Results ---- */}
      <section style={{ padding: "clamp(32px,5vw,52px) clamp(20px,5vw,40px) clamp(72px,9vw,110px)" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <div
            id="search-status"
            style={{ fontSize: ".86rem", color: "var(--muted)", marginBottom: 20 }}
            aria-live="polite"
          >
            {statusText}
          </div>

          <div id="search-results" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {rows.map((r) => (
              <Link
                key={r.key}
                href={r.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  background: "var(--surface)",
                  border: "1px solid var(--line2)",
                  borderRadius: 14,
                  padding: 16,
                  textDecoration: "none",
                }}
              >
                <img
                  src={r.img ?? "https://images.unsplash.com/photo-1758871993077-e084cc7eca86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200"}
                  alt=""
                  style={{ width: 72, height: 72, borderRadius: 10, objectFit: "cover", flexShrink: 0, background: "var(--card)" }}
                />
                <div style={{ minWidth: 0 }}>
                  <span
                    style={{
                      fontSize: ".68rem",
                      letterSpacing: ".15em",
                      textTransform: "uppercase",
                      color: "var(--dim)",
                    }}
                  >
                    {r.kind}
                  </span>
                  <h3 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "1.15rem", margin: "3px 0 0", color: "var(--text)" }}>
                    {highlight(r.title, terms)}
                  </h3>
                  {r.desc && (
                    <p style={{ fontSize: ".88rem", color: "var(--muted)", lineHeight: 1.55, margin: "4px 0 0" }}>
                      {highlight(r.desc, terms)}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {hasQuery && total === 0 && (
            <div
              id="search-empty"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--line2)",
                borderRadius: 18,
                padding: "28px 28px 30px",
              }}
            >
              <p style={{ color: "var(--muted)", fontSize: ".96rem", lineHeight: 1.6, margin: 0 }}>
                No results found. Try a different keyword or browse:
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
                {[
                  { href: "/shop?category=rum", label: "Rum" },
                  { href: "/shop?category=mens-apparel", label: "Men's" },
                  { href: "/shop?category=womens-apparel", label: "Women's" },
                  { href: "/cocktails", label: "Cocktails" },
                  { href: "/blog", label: "Journal" },
                  { href: "/faq", label: "FAQ" },
                ].map((c) => (
                  <Link
                    key={c.href}
                    href={c.href}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      background: "transparent",
                      border: "1px solid var(--gold)",
                      color: "var(--goldHi)",
                      borderRadius: 999,
                      padding: "8px 18px",
                      fontSize: ".84rem",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
