/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AddToCartButton from "@/components/cart/add-to-cart-button";
import CocktailRatingWidget from "./cocktail-rating-widget";

export const dynamic = "force-dynamic";

async function getCocktail(slug: string) {
  return prisma.cocktail.findFirst({ where: { slug, status: "published" } });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCocktail(slug);
  if (!c) return {};
  return { title: c.name, description: c.lede ?? undefined };
}

export default async function CocktailDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cocktail = await getCocktail(slug);
  if (!cocktail) notFound();

  const ingredients = Array.isArray(cocktail.ingredients) ? (cocktail.ingredients as string[]) : [];
  const method = Array.isArray(cocktail.method) ? (cocktail.method as string[]) : [];
  const serviceNotes =
    cocktail.serviceNotes && typeof cocktail.serviceNotes === "object" && !Array.isArray(cocktail.serviceNotes)
      ? (cocktail.serviceNotes as Record<string, string>)
      : {};
  const featured = cocktail.featuredProductId
    ? await prisma.product.findUnique({ where: { id: cocktail.featuredProductId } })
    : null;
  const related = await prisma.cocktail.findMany({
    where: { status: "published", id: { not: cocktail.id } },
    orderBy: { name: "asc" },
    take: 3,
  });
  const ratingAvg = cocktail.ratingAvg != null ? Number(cocktail.ratingAvg) : null;
  const ratingCount = cocktail.ratingCount ?? 0;

  // Featured rum CTA — derive the live price from the real product record.
  let featuredPrice: number | null = null;
  if (featured) {
    const fBase = Number(featured.basePrice);
    featuredPrice =
      featured.onSale && featured.salePrice != null ? Number(featured.salePrice) : fBase;
  }

  return (
    <>
    {/* ── Cocktail recipe (prototype: lines 914-955) ─────────── */}
    <section style={{ padding: "clamp(28px,4vw,44px) clamp(20px,5vw,40px) clamp(72px,9vw,110px)" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div style={{ fontSize: ".78rem", color: "var(--dim)", marginBottom: 22 }}>
          <Link href="/" style={{ color: "var(--dim)" }}>Home</Link>{" "}
          <span style={{ opacity: 0.5 }}>/</span>{" "}
          <Link href="/cocktails" style={{ color: "var(--dim)" }}>Cocktails</Link>{" "}
          <span style={{ opacity: 0.5 }}>/</span>{" "}
          <span style={{ color: "var(--muted)" }}>{cocktail.name}</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(28px,5vw,56px)", alignItems: "start" }}>
          {/* Portrait image — sticky */}
          <div style={{ position: "sticky", top: 96 }}>
            <div style={{ aspectRatio: "4/5", borderRadius: 18, overflow: "hidden", border: "1px solid var(--line)" }}>
              {cocktail.image ? (
                <img src={cocktail.image} alt={cocktail.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", background: "linear-gradient(180deg,var(--surface2),var(--bg))" }} />
              )}
            </div>
          </div>

          {/* Recipe content */}
          <div>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: ".72rem", letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 600 }}>
              {cocktail.eyebrow || "Signature serve"}
            </span>
            <h1 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "clamp(2.2rem,4.6vw,3.2rem)", lineHeight: 1.04, margin: "12px 0 0" }}>{cocktail.name}</h1>
            {cocktail.lede && (
              <p style={{ color: "var(--muted)", fontSize: "1.05rem", lineHeight: 1.6, margin: "14px 0 0" }}>{cocktail.lede}</p>
            )}

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
              {cocktail.difficulty && (
                <span style={{ background: "var(--goldLt)", border: "1px solid var(--line)", color: "var(--goldHi)", fontSize: ".78rem", fontWeight: 600, borderRadius: 999, padding: "6px 14px" }}>
                  <i className="bi bi-bar-chart" style={{ marginRight: 6 }} />{cocktail.difficulty}
                </span>
              )}
              {cocktail.timeMins != null && (
                <span style={{ background: "var(--surface)", border: "1px solid var(--line2)", color: "var(--muted)", fontSize: ".78rem", borderRadius: 999, padding: "6px 14px" }}>
                  <i className="bi bi-clock" style={{ marginRight: 6, color: "var(--gold)" }} />{cocktail.timeMins} mins
                </span>
              )}
              {cocktail.occasion && (
                <span style={{ background: "var(--surface)", border: "1px solid var(--line2)", color: "var(--muted)", fontSize: ".78rem", borderRadius: 999, padding: "6px 14px" }}>{cocktail.occasion}</span>
              )}
              {ratingAvg != null && (
                <span style={{ background: "var(--surface)", border: "1px solid var(--line2)", color: "var(--muted)", fontSize: ".78rem", borderRadius: 999, padding: "6px 14px" }}>
                  <i className="bi bi-star-fill" style={{ marginRight: 6, color: "var(--gold)" }} />{ratingAvg.toFixed(1)} ({ratingCount})
                </span>
              )}
            </div>

            {Object.keys(serviceNotes).length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 24, padding: "20px 0", borderTop: "1px solid var(--line2)", borderBottom: "1px solid var(--line2)" }}>
                {Object.entries(serviceNotes).map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: ".68rem", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--dim)" }}>{k}</div>
                    <div style={{ color: "var(--text)", fontSize: ".92rem", marginTop: 3 }}>{v}</div>
                  </div>
                ))}
              </div>
            )}

            {ingredients.length > 0 && (
              <>
                <h2 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "1.4rem", margin: "26px 0 14px" }}>Ingredients</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {ingredients.map((ing, i) => (
                    <span key={i} style={{ display: "flex", alignItems: "flex-start", gap: 11, fontSize: ".95rem", color: "var(--muted)" }}>
                      <i className="bi bi-dot" style={{ color: "var(--gold)", fontSize: "1.3rem", lineHeight: 1, marginTop: -2 }} />{ing}
                    </span>
                  ))}
                </div>
              </>
            )}

            {method.length > 0 && (
              <>
                <h2 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "1.4rem", margin: "28px 0 14px" }}>Method</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {method.map((step, i) => (
                    <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <span style={{ width: 28, height: 28, borderRadius: "50%", flex: "0 0 28px", background: "var(--goldLt)", border: "1px solid var(--gold)", color: "var(--goldHi)", fontSize: ".82rem", fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
                      <span style={{ color: "var(--muted)", fontSize: ".95rem", lineHeight: 1.5, paddingTop: 3 }}>{step}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {cocktail.bartenderTip && (
              <div style={{ background: "linear-gradient(160deg, rgba(205,181,130,.13), var(--surface))", border: "1px solid var(--line)", borderRadius: 14, padding: "18px 20px", marginTop: 26 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, color: "var(--gold)", fontSize: ".72rem", letterSpacing: ".12em", textTransform: "uppercase", fontWeight: 600 }}>
                  <i className="bi bi-lightbulb" />Bartender&apos;s tip
                </div>
                <p style={{ color: "var(--muted)", fontSize: ".92rem", lineHeight: 1.55, margin: "8px 0 0" }}>{cocktail.bartenderTip}</p>
              </div>
            )}

            {featured && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 24, alignItems: "center" }}>
                <Link
                  href={`/product/${featured.slug}`}
                  style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "var(--gold)", color: "var(--onGold)", borderRadius: 999, padding: "13px 26px", fontSize: ".92rem", fontWeight: 600, textDecoration: "none" }}
                >
                  Shop {featured.name} <i className="bi bi-arrow-right" />
                </Link>
                <AddToCartButton
                  productId={featured.id}
                  name={featured.name}
                  price={featuredPrice ?? 0}
                  image={featured.imageUrl ?? undefined}
                  className="ck-shop-add"
                  label={featuredPrice != null ? `Add to cart · £${featuredPrice.toFixed(2)}` : "Add to cart"}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>

    {/* ── Member rating ─────────────────────────────────────── */}
    <section style={{ padding: "0 clamp(20px,5vw,40px) clamp(48px,7vw,80px)" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }} aria-labelledby="rate-h">
        <div style={{ background: "var(--surface)", border: "1px solid var(--line2)", borderRadius: 14, padding: "22px 24px" }}>
          <h2 id="rate-h" style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "1.25rem", margin: "0 0 14px" }}>
            Rate this cocktail
          </h2>
          <CocktailRatingWidget average={ratingAvg ?? 0} count={ratingCount} />
          <p style={{ fontSize: ".78rem", color: "var(--dim)", margin: "12px 0 0" }}>
            Members only — one rating per cocktail.{" "}
            <Link href="/account#my-ratings" style={{ color: "var(--goldHi)" }}>
              See your rating history
            </Link>
            .
          </p>
        </div>
      </div>
    </section>

    {/* ── Related cocktails ──────────────────────────────────── */}
    {related.length > 0 && (
      <section style={{ padding: "0 clamp(20px,5vw,40px) clamp(72px,9vw,110px)" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "clamp(1.6rem,3vw,2.1rem)", margin: "0 0 22px" }}>Try next</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 22 }}>
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/cocktails/${r.slug}`}
                aria-label={`View ${r.name} recipe`}
                style={{ display: "block", border: "1px solid var(--line)", borderRadius: 16, overflow: "hidden", background: "var(--surface)", textDecoration: "none" }}
              >
                <div style={{ aspectRatio: "4/3", overflow: "hidden", borderBottom: "1px solid var(--line2)" }}>
                  {r.image ? (
                    <img src={r.image} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", background: "linear-gradient(180deg,var(--surface2),var(--bg))" }} />
                  )}
                </div>
                <div style={{ padding: "16px 18px 18px" }}>
                  <div style={{ fontSize: ".72rem", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--dim)" }}>
                    {r.difficulty}{r.difficulty && r.occasion ? " · " : ""}{r.occasion}
                  </div>
                  <h3 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "1.25rem", margin: "6px 0 0", color: "var(--text)" }}>{r.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    )}
    </>
  );
}
