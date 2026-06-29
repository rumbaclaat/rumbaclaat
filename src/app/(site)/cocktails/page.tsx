/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSectionImageMap, sectionImage } from "@/lib/section-images";
import CocktailsBrowser, { type CocktailCard } from "./cocktails-browser";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cocktails",
  description: "Rum-forward cocktails crafted by master bartenders — classics and Rumbaclaat originals.",
};

export default async function CocktailsIndex() {
  const cocktails = await prisma.cocktail.findMany({
    where: { status: "published" },
    orderBy: { name: "asc" },
  });
  const imgs = await getSectionImageMap();

  // The card "＋" button adds the cocktail's featured rum to the cart — live DB data.
  const featuredIds = Array.from(
    new Set(cocktails.map((c) => c.featuredProductId).filter((id): id is string => Boolean(id)))
  );
  const featuredProducts = featuredIds.length
    ? await prisma.product.findMany({
        where: { id: { in: featuredIds } },
        select: { id: true, name: true, basePrice: true, salePrice: true, onSale: true },
      })
    : [];
  const featuredById = new Map(featuredProducts.map((p) => [p.id, p]));

  const data: CocktailCard[] = cocktails.map((c) => {
    const fp = c.featuredProductId ? featuredById.get(c.featuredProductId) : undefined;
    return {
      id: c.id,
      slug: c.slug,
      name: c.name,
      image: c.image,
      difficulty: c.difficulty,
      occasion: c.occasion,
      timeMins: c.timeMins,
      ratingAvg: c.ratingAvg != null ? Number(c.ratingAvg) : null,
      tags: c.tags,
      ingredients: Array.isArray(c.ingredients) ? (c.ingredients as string[]) : [],
      featured: fp
        ? { id: fp.id, name: fp.name, price: Number(fp.onSale && fp.salePrice != null ? fp.salePrice : fp.basePrice) }
        : null,
    };
  });

  return (
    <>
      {/* Hero (parallax) — static-source/cocktails.html */}
      <section
        className="parallax-section"
        style={{ minHeight: 440, backgroundImage: `url('${sectionImage(imgs, "cocktails.hero")}')` }}
        aria-labelledby="ck-hero"
      >
        <div className="parallax-overlay" />
        <div className="parallax-content reveal">
          <span className="eyebrow eyebrow-center">Craft Cocktails</span>
          <h1 id="ck-hero">The Art of<br />the Perfect Serve</h1>
          <p style={{ color: "var(--text-muted)" }}>Discover rum-forward cocktails crafted by master bartenders — from timeless classics to Rumbaclaat originals.</p>
        </div>
      </section>

      {/* Live search + difficulty filter + grid */}
      <CocktailsBrowser cocktails={data} />

      {/* CTA — static-source/cocktails.html */}
      <section
        className="parallax-section"
        style={{ minHeight: 360, backgroundImage: `url('${sectionImage(imgs, "cocktails.cta")}')` }}
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
