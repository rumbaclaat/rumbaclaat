/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { prisma } from "@/lib/prisma";
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
      {/* Hero — Storefront Redesign.dc.html L391-398 */}
      <section
        style={{
          position: "relative",
          padding: "clamp(56px,8vw,104px) clamp(20px,5vw,40px) clamp(36px,5vw,56px)",
          overflow: "hidden",
          borderBottom: "1px solid var(--line2)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(90% 80% at 50% 0%, rgba(205,181,130,.12), transparent 60%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <span style={{ fontSize: ".74rem", letterSpacing: ".24em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 600 }}>
            Craft Cocktails
          </span>
          <h1 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "clamp(2.3rem,5.4vw,3.8rem)", lineHeight: 1.04, margin: "14px 0 0" }}>
            The Art of the<br />
            <span style={{ fontStyle: "italic", color: "var(--gold)" }}>Perfect Serve</span>
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "1.06rem", lineHeight: 1.6, margin: "18px auto 0", maxWidth: 520 }}>
            Rum-forward cocktails crafted by master bartenders — from timeless classics to Rumbaclaat originals.
          </p>
        </div>
      </section>

      {/* Chips + search + card grid (live data) — Storefront Redesign.dc.html L399-425 */}
      <CocktailsBrowser cocktails={data} />

      {/* CTA band — Storefront Redesign.dc.html L426-431 */}
      <section style={{ padding: "0 clamp(20px,5vw,40px) clamp(72px,9vw,110px)" }}>
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            border: "1px solid var(--line)",
            borderRadius: 20,
            background: "linear-gradient(135deg, rgba(205,181,130,.13), var(--surface) 60%)",
            padding: "clamp(32px,5vw,52px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <div>
            <span style={{ fontSize: ".72rem", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 600 }}>
              The bottle behind the bar
            </span>
            <h2 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "clamp(1.7rem,3.4vw,2.4rem)", margin: "10px 0 0" }}>
              Every great cocktail starts with exceptional rum
            </h2>
          </div>
          <Link
            href="/shop?category=rum"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
              background: "var(--gold)",
              color: "var(--onGold)",
              borderRadius: 999,
              padding: "14px 30px",
              fontSize: ".94rem",
              fontWeight: 600,
              cursor: "pointer",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            Shop the collection <i className="bi bi-arrow-right" />
          </Link>
        </div>
      </section>
    </>
  );
}
