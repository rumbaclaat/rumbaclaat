"use client";

/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/cart-provider";

export type ShopProduct = {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  categoryLabel: string; // uppercase category (RUM / APPAREL / GIFT CARD)
  variant: string; // subtitle line (e.g. "12 Yr · 70cl · Jamaica")
  price: number; // current unit price (sale or base)
  basePrice: number;
  onSale: boolean;
  memberPrice: number | null;
  rating: number; // 0–5
  inStock: boolean;
  image: string | null;
};
export type ShopFacet = { slug: string; title: string; count: number };

const PRICE_BANDS = [
  { id: "u40", label: "Under £40", test: (p: number) => p < 40 },
  { id: "40-75", label: "£40 – £75", test: (p: number) => p >= 40 && p <= 75 },
  { id: "75+", label: "£75+", test: (p: number) => p > 75 },
] as const;

const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "name", label: "Name" },
] as const;

function Check({ on }: { on: boolean }) {
  return (
    <span
      style={{
        width: 18, height: 18, borderRadius: 5, flex: "0 0 18px",
        border: `1px solid ${on ? "var(--gold)" : "var(--line)"}`,
        background: on ? "var(--gold)" : "var(--surface2)",
        color: "var(--onGold)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: ".74rem",
      }}
    >
      {on && <i className="bi bi-check-lg" />}
    </span>
  );
}

export default function ShopCollection({
  products,
  facets,
  total,
  initialCategory,
}: {
  products: ShopProduct[];
  facets: ShopFacet[];
  total: number;
  initialCategory: string; // "all" or a category slug
}) {
  const router = useRouter();
  const { add } = useCart();
  const [category, setCategory] = useState(initialCategory);
  const [bands, setBands] = useState<Set<string>>(new Set());
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState<(typeof SORTS)[number]["id"]>("featured");
  const [sortOpen, setSortOpen] = useState(false);
  const [added, setAdded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (category !== "all" && p.categorySlug !== category) return false;
      if (inStockOnly && !p.inStock) return false;
      if (bands.size > 0) {
        const match = PRICE_BANDS.some((b) => bands.has(b.id) && b.test(p.price));
        if (!match) return false;
      }
      return true;
    });
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [products, category, bands, inStockOnly, sort]);

  function toggleBand(id: string) {
    setBands((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  function go(slug: string) {
    setCategory(slug);
    const qs = slug === "all" ? "?category=all" : `?category=${slug}`;
    router.replace(`/shop${qs}`, { scroll: false });
  }
  function addToCart(p: ShopProduct) {
    add({ productId: p.id, name: p.name, price: p.price }, 1);
    setAdded(p.id);
    setTimeout(() => setAdded((cur) => (cur === p.id ? null : cur)), 1400);
  }

  const catList: ShopFacet[] = [{ slug: "all", title: "All products", count: total }, ...facets];
  const heading =
    category === "all" ? "All products" : `${facets.find((f) => f.slug === category)?.title ?? "Shop"} Collection`;

  return (
    <>
      {/* Collection hero */}
      <section style={{ padding: "clamp(44px,6vw,72px) clamp(20px,5vw,40px) clamp(28px,4vw,40px)", borderBottom: "1px solid var(--line2)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div style={{ fontSize: ".78rem", color: "var(--dim)", marginBottom: 12 }}>
            <a href="/" style={{ color: "var(--dim)" }}>Home</a> <span style={{ opacity: 0.5 }}>/</span>{" "}
            <button type="button" onClick={() => go("all")} style={{ color: "var(--dim)", background: "none", border: 0, padding: 0, cursor: "pointer" }}>Shop</button>{" "}
            <span style={{ opacity: 0.5 }}>/</span> <span style={{ color: "var(--muted)" }}>{category === "all" ? "All products" : catList.find((c) => c.slug === category)?.title}</span>
          </div>
          <span style={{ fontSize: ".74rem", letterSpacing: ".24em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 600 }}>The Collection</span>
          <h1 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "clamp(2.2rem,5vw,3.4rem)", lineHeight: 1.05, margin: "12px 0 0" }}>{heading}</h1>
          <p style={{ color: "var(--muted)", fontSize: "1.05rem", lineHeight: 1.6, maxWidth: 560, margin: "14px 0 0" }}>
            Caribbean expressions and the apparel we wear behind the bar — aged, crafted and ready to ship.
          </p>
        </div>
      </section>

      <section style={{ padding: "clamp(32px,5vw,52px) clamp(20px,5vw,40px) clamp(72px,9vw,110px)" }}>
        <div className="shop-collection-grid" style={{ maxWidth: 1240, margin: "0 auto", display: "grid", gridTemplateColumns: "228px 1fr", gap: "clamp(24px,4vw,48px)", alignItems: "start" }}>
          {/* Sidebar filters */}
          <aside style={{ position: "sticky", top: 96, display: "flex", flexDirection: "column", gap: 26 }} className="shop-filter-rail">
            <div>
              <div style={{ fontSize: ".72rem", letterSpacing: ".16em", textTransform: "uppercase", color: "var(--dim)", marginBottom: 12 }}>Category</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {catList.map((f) => {
                  const active = category === f.slug;
                  return (
                    <button
                      key={f.slug}
                      type="button"
                      onClick={() => go(f.slug)}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
                        padding: "9px 12px", borderRadius: 9, border: "1px solid transparent",
                        background: active ? "var(--gold-lt)" : "transparent",
                        color: active ? "var(--goldHi)" : "var(--muted)",
                        fontSize: ".88rem", fontWeight: active ? 600 : 500, cursor: "pointer", textAlign: "left",
                      }}
                    >
                      <span>{f.title}</span>
                      <span style={{ fontSize: ".74rem", color: "var(--dim)" }}>{f.count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ height: 1, background: "var(--line2)" }} />
            <div>
              <div style={{ fontSize: ".72rem", letterSpacing: ".16em", textTransform: "uppercase", color: "var(--dim)", marginBottom: 12 }}>Price</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {PRICE_BANDS.map((b) => {
                  const on = bands.has(b.id);
                  return (
                    <label key={b.id} style={{ display: "flex", alignItems: "center", gap: 10, color: on ? "var(--text)" : "var(--muted)", fontSize: ".86rem", cursor: "pointer" }}>
                      <input type="checkbox" checked={on} onChange={() => toggleBand(b.id)} style={{ position: "absolute", opacity: 0, width: 0, height: 0 }} />
                      <Check on={on} />
                      {b.label}
                    </label>
                  );
                })}
              </div>
            </div>
            <div style={{ height: 1, background: "var(--line2)" }} />
            <label style={{ display: "flex", alignItems: "center", gap: 10, color: inStockOnly ? "var(--text)" : "var(--muted)", fontSize: ".86rem", cursor: "pointer" }}>
              <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} style={{ position: "absolute", opacity: 0, width: 0, height: 0 }} />
              <Check on={inStockOnly} />
              In stock only
            </label>
          </aside>

          {/* Product grid */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 22 }}>
              <span style={{ color: "var(--dim)", fontSize: ".86rem" }}>{filtered.length} product{filtered.length !== 1 ? "s" : ""}</span>
              <div style={{ position: "relative" }}>
                <button type="button" onClick={() => setSortOpen((o) => !o)} style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid var(--line)", borderRadius: 999, padding: "8px 15px", color: "var(--muted)", fontSize: ".84rem", cursor: "pointer", background: "transparent" }}>
                  Sort: {SORTS.find((s) => s.id === sort)?.label} <i className="bi bi-chevron-down" style={{ fontSize: ".66rem" }} />
                </button>
                {sortOpen && (
                  <div style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: 6, zIndex: 20, minWidth: 200 }}>
                    {SORTS.map((s) => (
                      <button key={s.id} type="button" onClick={() => { setSort(s.id); setSortOpen(false); }} style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 12px", borderRadius: 8, border: 0, background: sort === s.id ? "var(--gold-lt)" : "transparent", color: sort === s.id ? "var(--goldHi)" : "var(--muted)", fontSize: ".85rem", cursor: "pointer" }}>{s.label}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {filtered.length === 0 ? (
              <p style={{ color: "var(--dim)" }}>No products match these filters.</p>
            ) : (
              <div className="shop-product-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
                {filtered.map((p) => (
                  <div key={p.id} style={{ background: "var(--surface)", border: "1px solid var(--line2)", borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                    <a href={`/product/${p.slug}`} style={{ aspectRatio: "1", overflow: "hidden", background: "var(--card)", display: "block" }}>
                      {p.image && <img src={p.image} alt={p.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                    </a>
                    <div style={{ padding: "16px 17px 18px", display: "flex", flexDirection: "column", flex: "1 1 auto" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                        <span style={{ fontSize: ".68rem", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--dim)" }}>{p.categoryLabel}</span>
                        <span style={{ color: "var(--gold)", fontSize: ".72rem" }} aria-label={`Rated ${p.rating} of 5`}>{"★★★★★".slice(0, Math.round(p.rating)) || "★★★★★"}</span>
                      </div>
                      <h3 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "1.2rem", margin: "7px 0 0" }}>
                        <a href={`/product/${p.slug}`} style={{ color: "inherit", textDecoration: "none" }}>{p.name}</a>
                      </h3>
                      <div style={{ color: "var(--dim)", fontSize: ".8rem", marginTop: 3, flex: "1 1 auto" }}>{p.variant}</div>
                      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, marginTop: 14 }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
                          <span style={{ fontFamily: "var(--serif)", fontSize: "1.25rem" }}>£{p.price.toFixed(2)}</span>
                          {p.onSale && <span style={{ fontSize: ".78rem", color: "var(--dim)", textDecoration: "line-through" }}>£{p.basePrice.toFixed(2)}</span>}
                          {!p.onSale && p.memberPrice != null && <span style={{ fontSize: ".72rem", color: "var(--gold)" }}>£{p.memberPrice.toFixed(2)}</span>}
                        </div>
                        <button
                          type="button"
                          onClick={() => addToCart(p)}
                          aria-label={`Add ${p.name} to cart`}
                          disabled={!p.inStock}
                          style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--gold)", color: "var(--onGold)", border: "none", cursor: p.inStock ? "pointer" : "not-allowed", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: ".95rem", opacity: p.inStock ? 1 : 0.5 }}
                        >
                          <i className={`bi ${added === p.id ? "bi-check-lg" : "bi-plus-lg"}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
