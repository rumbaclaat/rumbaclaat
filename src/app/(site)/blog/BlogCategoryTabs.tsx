"use client";

/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from "react";
import Link from "next/link";

export type BlogCardData = {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  excerpt: string | null;
  heroImage: string | null;
  meta: string;
};

/**
 * Category filter pills + tab panes for the blog post grid.
 * Reproduces static-source/blog.html ll.114-210 (ul.nav.nav-pills tablist +
 * .tab-content panes of product-card items). Bootstrap's data-bs-toggle pills
 * are JS-driven, so the filtering is reimplemented with React state here.
 */
export default function BlogCategoryTabs({ posts }: { posts: BlogCardData[] }) {
  // Fixed source order; "Membership" is rendered as the RPM equivalent.
  const ORDER = ["Heritage", "Craft", "Cocktails", "Membership"];
  const LABELS: Record<string, string> = { Membership: "RPM" };

  const categories = useMemo(() => {
    const present = new Set(posts.map((p) => p.category).filter((c): c is string => !!c));
    const ordered = ORDER.filter((c) => present.has(c));
    const extras = [...present].filter((c) => !ORDER.includes(c)).sort();
    return [...ordered, ...extras];
  }, [posts]);

  const [active, setActive] = useState<string>("all");

  const visible = active === "all" ? posts : posts.filter((p) => p.category === active);

  return (
    <>
      <ul className="nav nav-pills gap-2 mb-4 reveal" role="tablist" aria-label="Filter posts by category">
        <li className="nav-item" role="presentation">
          <button
            type="button"
            role="tab"
            aria-selected={active === "all"}
            onClick={() => setActive("all")}
            className={`nav-link${active === "all" ? " active" : ""}`}
            style={
              active === "all"
                ? { background: "var(--gold-lt)", color: "var(--gold-hi)" }
                : { color: "var(--text-muted)" }
            }
          >
            All
          </button>
        </li>
        {categories.map((cat) => {
          const isActive = active === cat;
          return (
            <li className="nav-item" role="presentation" key={cat}>
              <button
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(cat)}
                className={`nav-link${isActive ? " active" : ""}`}
                style={isActive ? { background: "var(--gold-lt)", color: "var(--gold-hi)" } : { color: "var(--text-muted)" }}
              >
                {LABELS[cat] ?? cat}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="tab-content">
        <div className="tab-pane fade show active" role="tabpanel">
          {visible.length === 0 ? (
            <p style={{ color: "var(--text-dim)" }}>No posts in this category yet.</p>
          ) : (
            <div className="row g-4">
              {visible.map((p) => (
                <div className="col-12 col-md-6 col-lg-3" key={p.id}>
                  <article className="product-card reveal">
                    <div className="product-card-img">
                      {p.heroImage ? (
                        <img src={p.heroImage} alt={p.title} loading="lazy" />
                      ) : (
                        <div style={{ width: "100%", height: "100%", background: "var(--bg-card2)" }} />
                      )}
                    </div>
                    <div className="product-card-body">
                      {p.category && (
                        <span className="badge-brand mb-2">{LABELS[p.category] ?? p.category}</span>
                      )}
                      <h3 style={{ fontSize: "1.0625rem" }}>
                        <Link className="stretched-card-link gold" href={`/blog/${p.slug}`}>
                          {p.title}
                        </Link>
                      </h3>
                      {p.excerpt && <p style={{ fontSize: ".8125rem", margin: "6px 0" }}>{p.excerpt}</p>}
                      <p style={{ fontSize: ".75rem", color: "var(--text-dim)", marginTop: "auto" }}>{p.meta}</p>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
