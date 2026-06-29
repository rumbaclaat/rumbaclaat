"use client";

/* eslint-disable @next/next/no-img-element */
import { useMemo, useState, type CSSProperties } from "react";
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

const DIFFS = ["All", "Easy", "Medium", "Hard"] as const;

const chipBase: CSSProperties = {
  borderRadius: 999,
  padding: "8px 16px",
  fontSize: ".82rem",
  fontWeight: 600,
  cursor: "pointer",
  border: "1px solid var(--line2)",
  whiteSpace: "nowrap",
  fontFamily: "var(--sans)",
};
const chipActive: CSSProperties = {
  ...chipBase,
  background: "var(--gold)",
  color: "var(--onGold)",
  borderColor: "var(--gold)",
};
const chipIdle: CSSProperties = {
  ...chipBase,
  background: "var(--surface)",
  color: "var(--muted)",
};

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
    <section style={{ padding: "clamp(32px,5vw,52px) clamp(20px,5vw,40px) clamp(56px,7vw,88px)" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>
        {/* Chips + search — Storefront Redesign.dc.html L401-409 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 32 }}>
          <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
            {DIFFS.map((d) => (
              <span
                key={d}
                role="button"
                tabIndex={0}
                aria-pressed={diff === d}
                onClick={() => setDiff(d)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setDiff(d);
                  }
                }}
                style={diff === d ? chipActive : chipIdle}
              >
                {d}
              </span>
            ))}
          </div>
          <div style={{ position: "relative", maxWidth: 280, width: "100%" }}>
            <i className="bi bi-search" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--dim)", fontSize: ".84rem" }} />
            <label className="visually-hidden" htmlFor="ck-search">Search cocktails</label>
            <input
              id="ck-search"
              type="search"
              placeholder="Search cocktails…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{
                width: "100%",
                background: "var(--surface)",
                border: "1px solid var(--line2)",
                color: "var(--text)",
                borderRadius: 999,
                padding: "10px 16px 10px 38px",
                fontSize: ".86rem",
                outline: "none",
                fontFamily: "var(--sans)",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "var(--line2)"; }}
            />
          </div>
        </div>

        {/* Card grid — Storefront Redesign.dc.html L410-423 */}
        {filtered.length === 0 ? (
          <p style={{ color: "var(--dim)" }}>No cocktails match your search.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 22 }}>
            {filtered.map((c) => {
              const cat = c.occasion ?? (c.tags.length ? c.tags[0] : "Cocktail");
              const base = c.ingredients.length ? c.ingredients[0] : "Rum";
              const tagLine = c.tags.length ? c.tags.slice(0, 3).join(", ") : c.ingredients.slice(1, 3).join(", ");
              return (
                <div
                  key={c.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "170px 1fr",
                    background: "var(--surface)",
                    border: "1px solid var(--line2)",
                    borderRadius: 16,
                    overflow: "hidden",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--line)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--line2)"; }}
                >
                  <div style={{ overflow: "hidden", background: "var(--card)" }}>
                    {c.image ? (
                      <img src={c.image} alt={`${c.name} cocktail`} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", minHeight: 170, background: "linear-gradient(180deg,#191920,#0E0E12)" }} />
                    )}
                  </div>
                  <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                      {c.difficulty && (
                        <span style={{ background: "var(--goldLt)", border: "1px solid var(--line)", color: "var(--goldHi)", fontSize: ".68rem", fontWeight: 600, borderRadius: 999, padding: "3px 10px" }}>
                          {c.difficulty}
                        </span>
                      )}
                      <span style={{ color: "var(--dim)", fontSize: ".76rem" }}>{cat}</span>
                    </div>
                    <h3 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "1.45rem", margin: 0 }}>{c.name}</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 8, color: "var(--muted)", fontSize: ".82rem" }}>
                      {c.timeMins != null && (
                        <span><i className="bi bi-clock" style={{ marginRight: 5, color: "var(--gold)" }} />{c.timeMins} mins</span>
                      )}
                      {c.ratingAvg != null && (
                        <span><i className="bi bi-star-fill" style={{ marginRight: 5, color: "var(--gold)" }} />{c.ratingAvg.toFixed(1)}</span>
                      )}
                    </div>
                    <div style={{ color: "var(--dim)", fontSize: ".82rem", marginTop: 12, flex: "1 1 auto" }}>
                      {base}{tagLine ? ` · ${tagLine}` : ""}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 14 }}>
                      <Link
                        href={`/cocktails/${c.slug}`}
                        style={{ display: "inline-flex", alignItems: "center", gap: 7, color: "var(--goldHi)", fontWeight: 600, fontSize: ".86rem", cursor: "pointer", textDecoration: "none" }}
                      >
                        View recipe <i className="bi bi-arrow-right" />
                      </Link>
                      {c.featured && <CocktailAddButton productId={c.featured.id} name={c.featured.name} price={c.featured.price} />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
