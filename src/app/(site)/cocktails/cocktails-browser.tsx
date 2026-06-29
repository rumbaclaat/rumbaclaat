"use client";

/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from "react";
import Link from "next/link";
import CocktailAddButton from "./cocktail-add-button";

export type CocktailCard = {
  id: string;
  slug: string;
  name: string;
  image: string | null;
  difficulty: string | null;
  occasion: string | null;
  timeMins: number | null;
  ratingAvg: number | null;
  tags: string[];
  ingredients: string[];
  featured: { id: string; name: string; price: number } | null;
};

const diffClass: Record<string, string> = { Easy: "diff-easy", Medium: "diff-medium", Hard: "diff-hard" };
const diffText: Record<string, string> = { Easy: "diff-text-easy", Medium: "diff-text-medium", Hard: "diff-text-medium" };
const DIFFS = ["All", "Easy", "Medium", "Hard"] as const;

export default function CocktailsBrowser({ cocktails }: { cocktails: CocktailCard[] }) {
  const [q, setQ] = useState("");
  const [diff, setDiff] = useState<(typeof DIFFS)[number]>("All");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return cocktails.filter((c) => {
      if (diff !== "All" && (c.difficulty ?? "") !== diff) return false;
      if (!needle) return true;
      return (
        c.name.toLowerCase().includes(needle) ||
        c.ingredients.some((i) => i.toLowerCase().includes(needle))
      );
    });
  }, [cocktails, q, diff]);

  return (
    <>
      {/* Filter / search bar — static-source/cocktails.html */}
      <div style={{ background: "var(--bg-card3)", borderBottom: "1px solid var(--gold-bdr)", padding: "16px 0" }}>
        <div className="container d-flex align-items-center gap-3 flex-wrap">
          <div className="ck-search">
            <label className="visually-hidden" htmlFor="ck-search">Search cocktails or ingredients</label>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
            <input
              type="search"
              className="form-control"
              id="ck-search"
              placeholder="Search cocktails or ingredients…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="d-flex gap-2 flex-wrap" role="group" aria-label="Filter by difficulty">
            {DIFFS.map((d) => {
              const active = diff === d;
              const cls =
                d === "All"
                  ? `btn btn-ghost btn-sm${active ? " active" : ""}`
                  : `btn btn-sm ${active ? "btn-gold" : "btn-outline-gold"}`;
              return (
                <button key={d} type="button" className={cls} aria-pressed={active} onClick={() => setDiff(d)}>
                  {d !== "All" && <span className={`diff-dot ${diffClass[d]}`} />}
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <p id="ck-count" className="mb-4" style={{ fontSize: ".8125rem", color: "var(--text-dim)" }} aria-live="polite">
            {filtered.length} cocktail{filtered.length !== 1 ? "s" : ""}
          </p>

          {filtered.length === 0 ? (
            <p style={{ color: "var(--text-dim)" }}>No cocktails match your search.</p>
          ) : (
            <div className="row g-4">
              {filtered.map((c) => {
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
                            <div style={{ width: "100%", height: "100%", background: "linear-gradient(180deg,#191920,#0E0E12)" }} />
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
                          {c.ratingAvg != null && <span style={{ fontSize: ".75rem", color: "var(--gold-hi)" }}>★ {c.ratingAvg.toFixed(1)}</span>}
                          {c.tags.length > 0 && <span style={{ fontSize: ".6875rem", color: "var(--text-dim)" }}>{c.tags.slice(0, 2).map((t) => `#${t}`).join(" ")}</span>}
                        </div>
                        <div className="flex-grow-1 mb-3">
                          {c.ingredients.slice(0, 3).map((ing, i) => <p className="ck-ing" key={i}>{ing}</p>)}
                          {c.ingredients.length > 3 && <p className="ck-ing" style={{ color: "var(--text-dim)" }}>+{c.ingredients.length - 3} more</p>}
                        </div>
                        <div className="d-flex gap-2">
                          <Link href={`/cocktails/${c.slug}`} className="btn btn-gold btn-sm flex-grow-1" role="button">View Recipe ›</Link>
                          {c.featured && <CocktailAddButton productId={c.featured.id} name={c.featured.name} price={c.featured.price} />}
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
    </>
  );
}
