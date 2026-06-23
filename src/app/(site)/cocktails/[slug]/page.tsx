/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

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
  const dc = cocktail.difficulty ? diffClass[cocktail.difficulty] ?? "diff-easy" : "diff-easy";

  return (
    <section className="section">
      <div className="container">
        <nav aria-label="Breadcrumb" className="mb-3">
          <ol className="breadcrumb" style={{ fontSize: ".75rem" }}>
            <li className="breadcrumb-item"><Link href="/">Home</Link></li>
            <li className="breadcrumb-item"><Link href="/cocktails">Cocktails</Link></li>
            <li className="breadcrumb-item active" aria-current="page">{cocktail.name}</li>
          </ol>
        </nav>

        {cocktail.eyebrow && <span className="eyebrow">{cocktail.eyebrow}</span>}
        <h1 style={{ fontSize: "clamp(2rem,4vw,2.75rem)" }}>{cocktail.name}</h1>
        {cocktail.lede && <p className="hero-lede" style={{ margin: "10px 0 18px", textAlign: "left" }}>{cocktail.lede}</p>}

        <div className="ck-meta-row mb-4">
          {cocktail.difficulty && (
            <span className="meta-pill"><span className={`diff-dot ${dc}`} />{cocktail.difficulty}</span>
          )}
          {cocktail.timeMins && <span className="meta-pill meta-pill-plain">⏱ {cocktail.timeMins} mins</span>}
          {cocktail.occasion && <span className="meta-pill">{cocktail.occasion}</span>}
        </div>

        <div className="ck-layout">
          {/* Image */}
          <div className="ck-image-card">
            <div className="ck-image-frame">
              {cocktail.image ? (
                <img src={cocktail.image} alt={cocktail.name} />
              ) : (
                <div style={{ width: "100%", height: "100%" }} />
              )}
            </div>
            <div className="ck-image-caption">{cocktail.name}{featured ? ` · made with ${featured.name}` : ""}</div>
          </div>

          {/* Recipe */}
          <div>
            {ingredients.length > 0 && (
              <div className="ck-section">
                <h2 className="ck-section-title">Ingredients</h2>
                <ul className="ck-ings">
                  {ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                </ul>
              </div>
            )}

            {Object.keys(serviceNotes).length > 0 && (
              <div className="ck-glance">
                {Object.entries(serviceNotes).map(([k, v]) => (
                  <div key={k}>
                    <span className="lbl">{k}</span>
                    <span className="val">{v}</span>
                  </div>
                ))}
              </div>
            )}

            {method.length > 0 && (
              <div className="ck-section" style={{ marginTop: 32 }}>
                <h2 className="ck-section-title">Method</h2>
                <ol className="ck-method-list">
                  {method.map((step, i) => (
                    <li key={i}>
                      <span className="step-num">{i + 1}</span>
                      <p>{step}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {cocktail.bartenderTip && (
              <div className="recipe-tip">
                <span className="eyebrow">Bartender&apos;s tip</span>
                <p style={{ color: "var(--text-muted)", margin: "4px 0 0" }}>{cocktail.bartenderTip}</p>
              </div>
            )}

            {featured && (
              <div className="mt-4">
                <Link href={`/product/${featured.slug}`} className="btn btn-gold">Shop {featured.name} →</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
