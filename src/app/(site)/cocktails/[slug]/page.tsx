/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AddToCartButton from "@/components/cart/add-to-cart-button";
import CocktailRatingWidget from "./cocktail-rating-widget";

export const dynamic = "force-dynamic";

const diffClass: Record<string, string> = { Easy: "diff-easy", Medium: "diff-medium", Hard: "diff-hard" };

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
  const dc = cocktail.difficulty ? diffClass[cocktail.difficulty] ?? "diff-easy" : "diff-easy";

  const ratingAvg = cocktail.ratingAvg != null ? Number(cocktail.ratingAvg) : null;
  const ratingCount = cocktail.ratingCount ?? 0;

  // Featured rum CTA — derive presentation from the real product record.
  let featuredPrice: number | null = null;
  let featuredTasting: string | null = null;
  if (featured) {
    const fBase = Number(featured.basePrice);
    featuredPrice =
      featured.onSale && featured.salePrice != null ? Number(featured.salePrice) : fBase;
    featuredTasting =
      [
        featured.ageStatement,
        featured.origin,
        featured.abv != null ? `${Number(featured.abv)}% ABV` : null,
      ]
        .filter(Boolean)
        .join(" · ") || featured.tastingNotes || null;
  }

  return (
    <>
    {/* ── Breadcrumb + intro ─────────────────────────────────── */}
    <section
      className="section-sm"
      style={{
        background: "linear-gradient(135deg,#15151B,#0E0E12)",
        borderBottom: "1px solid var(--gold-bdr)",
        paddingBottom: 36,
      }}
    >
      <div className="container reveal" style={{ maxWidth: 1080 }}>
        <nav aria-label="Breadcrumb">
          <ol className="breadcrumb" style={{ fontSize: ".75rem", marginBottom: 16 }}>
            <li className="breadcrumb-item"><Link href="/">Home</Link></li>
            <li className="breadcrumb-item"><Link href="/cocktails">Cocktails</Link></li>
            <li className="breadcrumb-item active" aria-current="page">{cocktail.name}</li>
          </ol>
        </nav>
        <span className="eyebrow">{cocktail.eyebrow || "Craft Cocktail"}</span>
        <h1 style={{ fontSize: "clamp(2rem,5vw,3.25rem)" }}>{cocktail.name}</h1>
        {cocktail.lede && (
          <p
            className="lede"
            style={{
              maxWidth: 640,
              fontSize: "1.075rem",
              color: "var(--text-muted)",
              marginTop: 14,
            }}
          >
            {cocktail.lede}
          </p>
        )}

        <div className="ck-meta-row mt-3">
          {cocktail.difficulty && (
            <span className="meta-pill"><span className={`diff-dot ${dc}`} />{cocktail.difficulty}</span>
          )}
          {cocktail.timeMins && <span className="meta-pill">⏱ {cocktail.timeMins} mins</span>}
          {cocktail.occasion && <span className="meta-pill">{cocktail.occasion}</span>}
          {ratingAvg != null && (
            <span className="meta-pill meta-pill-plain">
              ★ {ratingAvg.toFixed(1)}{" "}
              <span style={{ color: "var(--text-dim)" }}>({ratingCount})</span>
            </span>
          )}
        </div>
      </div>
    </section>

    {/* ── Main layout: portrait image + recipe ─────────────── */}
    <section className="section">
      <div className="container" style={{ maxWidth: 1080 }}>
        <div className="ck-layout">
          {/* Portrait image card */}
          <div className="ck-image-card">
            <div className="ck-image-frame">
              {cocktail.image ? (
                <img src={cocktail.image} alt={cocktail.name} loading="lazy" />
              ) : (
                <div style={{ width: "100%", height: "100%" }} />
              )}
            </div>
            <p className="ck-image-caption">{cocktail.name}{featured ? ` · made with ${featured.name}` : ""}</p>
          </div>

          {/* Recipe content */}
          <div>
            {ingredients.length > 0 && (
              <div className="ck-section">
                <h2 className="ck-section-title">Ingredients</h2>
                <ul className="ck-ings">
                  {ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                </ul>
                {Object.keys(serviceNotes).length > 0 && (
                  <div className="ck-glance" aria-label="Service notes">
                    {Object.entries(serviceNotes).map(([k, v]) => (
                      <div key={k}>
                        <span className="lbl">{k}</span>
                        <span className="val">{v}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {method.length > 0 && (
              <div className="ck-section">
                <h2 className="ck-section-title">Method</h2>
                <ol className="ck-method-list">
                  {method.map((step, i) => (
                    <li key={i}>
                      <span className="step-num">{i + 1}</span>
                      <p>{step}</p>
                    </li>
                  ))}
                </ol>
                {cocktail.bartenderTip && (
                  <div className="recipe-tip">
                    <p
                      style={{
                        fontSize: ".75rem",
                        fontWeight: 600,
                        color: "var(--gold-hi)",
                        marginBottom: 4,
                        letterSpacing: ".08em",
                      }}
                    >
                      BARTENDER&apos;S TIP
                    </p>
                    <p
                      style={{
                        fontSize: ".9375rem",
                        color: "var(--text-muted)",
                        lineHeight: 1.7,
                        margin: 0,
                      }}
                    >
                      {cocktail.bartenderTip}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>

    {/* ── Member rating ─────────────────────────────────────── */}
    <section className="section-sm" aria-labelledby="rate-h">
      <div className="container" style={{ maxWidth: 880 }}>
        <h2 id="rate-h" className="h5 mb-3" style={{ fontFamily: "var(--serif)", fontWeight: 600 }}>
          Rate this cocktail
        </h2>
        <CocktailRatingWidget average={ratingAvg ?? 0} count={ratingCount} />
        <p style={{ fontSize: ".75rem", color: "var(--text-dim)", margin: "10px 0 0" }}>
          Members only — one rating per cocktail.{" "}
          <Link href="/account#my-ratings" style={{ color: "var(--gold-hi)" }}>
            See your rating history
          </Link>
          .
        </p>
      </div>
    </section>

    {/* ── Featured rum CTA ───────────────────────────────────── */}
    {featured && (
      <section
        className="section-sm"
        style={{
          background: "#0E0E12",
          borderTop: "1px solid var(--gold-bdr)",
          borderBottom: "1px solid var(--gold-bdr)",
        }}
      >
        <div className="container" style={{ maxWidth: 880 }}>
          <div
            className="card-brand d-flex align-items-center gap-4 flex-wrap"
            style={{ borderColor: "var(--gold-md)", padding: 24 }}
          >
            <div style={{ flex: "0 0 auto" }}>
              {featured.imageUrl ? (
                <img
                  src={featured.imageUrl}
                  alt=""
                  width={120}
                  height={120}
                  style={{
                    width: 120,
                    height: 120,
                    objectFit: "cover",
                    borderRadius: 12,
                    border: "1px solid var(--gold-bdr)",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 12,
                    border: "1px solid var(--gold-bdr)",
                    background: "linear-gradient(180deg,#191920,#0E0E12)",
                  }}
                />
              )}
            </div>
            <div style={{ flex: "1 1 280px", minWidth: 240 }}>
              <p className="eyebrow" style={{ marginBottom: 4 }}>THE RUM</p>
              <h2 className="h4" style={{ marginBottom: 6 }}>{featured.name}</h2>
              {featuredTasting && (
                <p style={{ fontSize: ".875rem", color: "var(--text-muted)", margin: 0 }}>
                  {featuredTasting}
                </p>
              )}
            </div>
            <div
              className="d-flex flex-column align-items-end gap-2"
              style={{ flex: "0 0 auto" }}
            >
              {featuredPrice != null && (
                <p style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", color: "var(--gold-hi)", margin: 0 }}>
                  £{featuredPrice.toFixed(2)}
                </p>
              )}
              <div className="d-flex gap-2 flex-wrap">
                <Link href={`/product/${featured.slug}`} className="btn btn-outline-gold btn-sm">View</Link>
                <AddToCartButton
                  productId={featured.id}
                  name={featured.name}
                  price={featuredPrice ?? 0}
                  className="btn btn-gold btn-sm"
                  label="＋ Add to cart"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    )}

    {/* ── Related cocktails ──────────────────────────────────── */}
    {related.length > 0 && (
      <section className="section">
        <div className="container">
          <h2 className="h3 mb-4">Try next</h2>
          <div className="row g-4">
            {related.map((r) => {
              const rdc = r.difficulty ? diffClass[r.difficulty] ?? "diff-easy" : "diff-easy";
              return (
                <div className="col-12 col-md-4" key={r.id}>
                  <Link href={`/cocktails/${r.slug}`} className="ck-rel-card" aria-label={`View ${r.name} recipe`}>
                    <div className="ck-rel-img">
                      {r.image ? (
                        <img src={r.image} alt="" loading="lazy" />
                      ) : (
                        <div style={{ width: "100%", height: "100%", background: "linear-gradient(180deg,#191920,#0E0E12)" }} />
                      )}
                    </div>
                    <div className="ck-rel-meta">
                      {r.difficulty && <span className={`diff-dot ${rdc}`} style={{ marginRight: 6 }} />}
                      {r.difficulty}{r.difficulty && r.occasion ? " · " : ""}{r.occasion}
                    </div>
                    <h3>{r.name}</h3>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    )}
    </>
  );
}
