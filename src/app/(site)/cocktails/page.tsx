/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cocktails",
  description: "Rum-forward cocktails crafted by master bartenders — classics and Rumbaclaat originals.",
};

const diffClass: Record<string, string> = { Easy: "diff-easy", Medium: "diff-medium", Hard: "diff-hard" };
const diffText: Record<string, string> = { Easy: "diff-text-easy", Medium: "diff-text-medium", Hard: "diff-text-medium" };

export default async function CocktailsIndex() {
  const cocktails = await prisma.cocktail.findMany({
    where: { status: "published" },
    orderBy: { name: "asc" },
  });

  return (
    <>
      {/* Hero (parallax) — static-source/cocktails.html */}
      <section
        className="parallax-section"
        style={{ minHeight: 440, backgroundImage: "url('https://images.unsplash.com/photo-1767745455688-49391131f751?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1800&q=80')" }}
        aria-labelledby="ck-hero"
      >
        <div className="parallax-overlay" />
        <div className="parallax-content reveal">
          <span className="eyebrow eyebrow-center">Craft Cocktails</span>
          <h1 id="ck-hero">The Art of<br />the Perfect Serve</h1>
          <p style={{ color: "var(--text-muted)" }}>Discover rum-forward cocktails crafted by master bartenders — from timeless classics to Rumbaclaat originals.</p>
        </div>
      </section>

      {/* Filter / search bar */}
      <div style={{ background: "var(--bg-card3)", borderBottom: "1px solid var(--gold-bdr)", padding: "16px 0" }}>
        <div className="container d-flex align-items-center gap-3 flex-wrap">
          <div className="ck-search">
            <label className="visually-hidden" htmlFor="ck-search">Search cocktails or ingredients</label>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
            <input type="search" className="form-control" id="ck-search" placeholder="Search cocktails or ingredients…" />
          </div>
          <div className="d-flex gap-2 flex-wrap" role="group" aria-label="Filter by difficulty">
            <button type="button" className="btn btn-ghost btn-sm active" aria-pressed="true">All</button>
            <button type="button" className="btn btn-outline-gold btn-sm"><span className="diff-dot diff-easy" />Easy</button>
            <button type="button" className="btn btn-outline-gold btn-sm"><span className="diff-dot diff-medium" />Medium</button>
            <button type="button" className="btn btn-outline-gold btn-sm"><span className="diff-dot diff-hard" />Hard</button>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <p className="mb-4" style={{ fontSize: ".8125rem", color: "var(--text-dim)" }}>{cocktails.length} cocktails</p>

          {cocktails.length === 0 ? (
            <p style={{ color: "var(--text-dim)" }}>No recipes yet.</p>
          ) : (
            <div className="row g-4">
              {cocktails.map((c) => {
                const ings = Array.isArray(c.ingredients) ? (c.ingredients as string[]) : [];
                const dc = c.difficulty ? diffClass[c.difficulty] ?? "diff-easy" : "diff-easy";
                const dt = c.difficulty ? diffText[c.difficulty] ?? "diff-text-easy" : "diff-text-easy";
                return (
                  <div className="col-12 col-md-6 col-lg-4" key={c.id}>
                    <article className="ck-card reveal">
                      <Link href={`/cocktails/${c.slug}`} className="ck-card-img-link" aria-label={`View ${c.name} recipe`}>
                        <div className="ck-card-img">
                          {c.image ? (
                            <img src={c.image} alt={`${c.name} cocktail`} loading="lazy" />
                          ) : (
                            <div style={{ width: "100%", height: "100%", background: "linear-gradient(180deg,#1a1a1a,#0f0f0f)" }} />
                          )}
                          <div className="gradient" />
                          <div style={{ position: "absolute", bottom: 12, left: 16, right: 16 }}>
                            <div className="d-flex align-items-center gap-2 mb-1">
                              {c.difficulty && (
                                <span className={dt} style={{ fontSize: ".6875rem", fontWeight: 600 }}>
                                  <span className={`diff-dot ${dc}`} />{c.difficulty}
                                </span>
                              )}
                              {c.occasion && <span style={{ color: "var(--text-dim)", fontSize: ".6875rem" }}>· {c.occasion}</span>}
                            </div>
                            <h2 className="h3" style={{ fontSize: "1.375rem" }}>{c.name}</h2>
                          </div>
                        </div>
                      </Link>
                      <div className="ck-card-body">
                        <div className="d-flex align-items-center gap-3 pb-2 mb-2" style={{ borderBottom: "1px solid var(--gold-bdr)" }}>
                          {c.timeMins && <span style={{ fontSize: ".75rem", color: "var(--text-muted)" }}>⏱ {c.timeMins} mins</span>}
                          {c.occasion && <span style={{ fontSize: ".6875rem", color: "var(--text-dim)" }}>{c.occasion}</span>}
                        </div>
                        <div className="flex-grow-1 mb-3">
                          {ings.slice(0, 3).map((ing, i) => <p className="ck-ing" key={i}>{ing}</p>)}
                          {ings.length > 3 && <p className="ck-ing" style={{ color: "var(--text-dim)" }}>+{ings.length - 3} more</p>}
                        </div>
                        <div className="d-flex gap-2">
                          <Link href={`/cocktails/${c.slug}`} className="btn btn-gold btn-sm flex-grow-1" role="button">View Recipe ›</Link>
                        </div>
                      </div>
                    </article>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA — static-source/cocktails.html */}
      <section
        className="parallax-section"
        style={{ minHeight: 360, backgroundImage: "url('https://images.unsplash.com/photo-1744730850457-8795330490df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1800&q=80')" }}
        aria-labelledby="ck-cta"
      >
        <div className="parallax-overlay" />
        <div className="parallax-content reveal">
          <span className="eyebrow eyebrow-center">The Bottle Behind the Bar</span>
          <h2 id="ck-cta">Shop the Collection</h2>
          <p style={{ color: "var(--text-muted)" }}>Every great cocktail starts with exceptional rum. Explore our premium range.</p>
          <Link href="/shop?category=rum" className="btn btn-gold mt-4">Shop Rum ›</Link>
        </div>
      </section>
    </>
  );
}
