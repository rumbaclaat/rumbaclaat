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

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 760 }}>
        <span className="eyebrow">Search</span>
        <h1 className="mb-3">Find your serve</h1>
        <form action="/search" className="ck-search mb-4" style={{ maxWidth: "100%" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          <input type="search" name="q" className="form-control" placeholder="Search rum, cocktails, journal…" defaultValue={query} />
        </form>

        {query.length >= 2 && (
          <p style={{ fontSize: ".8125rem", color: "var(--text-dim)" }}>{total} result{total === 1 ? "" : "s"} for “{query}”</p>
        )}

        {products.map((p) => (
          <Link key={`p-${p.slug}`} href={`/product/${p.slug}`} className="search-result">
            <div><span className="kind">RUM &amp; APPAREL</span><h3>{p.name}</h3><p>{p.subtitle}</p></div>
          </Link>
        ))}
        {cocktails.map((c) => (
          <Link key={`c-${c.slug}`} href={`/cocktails/${c.slug}`} className="search-result">
            <div><span className="kind">COCKTAIL</span><h3>{c.name}</h3><p>{c.lede}</p></div>
          </Link>
        ))}
        {posts.map((b) => (
          <Link key={`b-${b.slug}`} href={`/blog/${b.slug}`} className="search-result">
            <div><span className="kind">JOURNAL</span><h3>{b.title}</h3><p>{b.excerpt}</p></div>
          </Link>
        ))}

        {query.length >= 2 && total === 0 && (
          <div className="text-center" style={{ padding: "30px 0" }}>
            <p style={{ color: "var(--text-muted)" }}>No results. Try the <Link href="/shop">shop</Link> or <Link href="/cocktails">cocktails</Link>.</p>
          </div>
        )}
      </div>
    </section>
  );
}
