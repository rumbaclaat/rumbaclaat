/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ShopCollection, { type ShopProduct, type ShopFacet } from "./shop-collection";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shop",
  description:
    "Shop premium Caribbean rum and luxury Rumbaclaat apparel. Aged expressions, menswear, and womenswear. 18+ only.",
};

const U = (id: string, w = 900) =>
  `https://images.unsplash.com/${id}?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=${w}`;

// Per-category fallbacks (image + blurb + count unit) when the DB record has none.
const CAT_FALLBACK: Record<string, { img: string; desc: string; unit: string }> = {
  rum: { img: "photo-1758871993077-e084cc7eca86", desc: "Aged Caribbean expressions — twelve years and beyond.", unit: "bottles" },
  "mens-apparel": { img: "photo-1770795263454-2756f5d7d9b0", desc: "Heavyweight fleece, tees and caps with the gold crest.", unit: "pieces" },
  "womens-apparel": { img: "photo-1643302213971-0f21b7ada420", desc: "Editorial womenswear with soft gold detailing.", unit: "pieces" },
  "gift-cards": { img: "photo-1549465220-1a8b9238cd48", desc: "The gift of choice — delivered by email, never expires.", unit: "cards" },
};
const unitFor = (slug: string) => CAT_FALLBACK[slug]?.unit ?? "products";

function variantLine(p: {
  subtitle: string | null; ageStatement: string | null; abv: unknown; volume: string | null; origin: string | null;
}): string {
  if (p.subtitle) return p.subtitle;
  return [p.ageStatement, p.abv != null ? `${Number(p.abv)}% ABV` : null, p.volume, p.origin].filter(Boolean).join(" · ");
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  const [categories, products, tiers] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.product.findMany({
      where: { status: "published" },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.membershipTier.findMany({ orderBy: { memberDiscountPct: "desc" }, take: 1 }),
  ]);
  const maxDiscount = tiers[0]?.memberDiscountPct ?? 0;

  // Facets = categories that actually have published products.
  const countBySlug = new Map<string, number>();
  for (const p of products) {
    const s = p.category?.slug;
    if (s) countBySlug.set(s, (countBySlug.get(s) ?? 0) + 1);
  }
  const facets: ShopFacet[] = categories
    .filter((c) => (countBySlug.get(c.slug) ?? 0) > 0)
    .map((c) => ({ slug: c.slug, title: c.name, count: countBySlug.get(c.slug) ?? 0 }));

  // ---------- Collection mode (?category=…) ----------
  if (category) {
    const shopProducts: ShopProduct[] = products.map((p) => {
      const basePrice = Number(p.basePrice);
      const price = p.onSale && p.salePrice != null ? Number(p.salePrice) : basePrice;
      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        categorySlug: p.category?.slug ?? "",
        categoryLabel: (p.type ?? "rum").toString().replace("_", " ").toUpperCase(),
        variant: variantLine(p),
        price,
        basePrice,
        onSale: p.onSale,
        memberPrice: maxDiscount > 0 ? price * (1 - maxDiscount / 100) : null,
        rating: p.ratingAvg != null ? Number(p.ratingAvg) : 5,
        inStock: p.stockQty > 0,
        image: p.imageUrl ?? null,
      };
    });
    return (
      <ShopCollection
        products={shopProducts}
        facets={facets}
        total={products.length}
        initialCategory={category === "all" ? "all" : category}
      />
    );
  }

  // ---------- Shop landing (category cards) ----------
  const cards = categories
    .filter((c) => (countBySlug.get(c.slug) ?? 0) > 0)
    .map((c) => {
      const fb = CAT_FALLBACK[c.slug];
      const firstImg = products.find((p) => p.category?.slug === c.slug)?.imageUrl;
      return {
        slug: c.slug,
        name: c.name,
        desc: c.description ?? fb?.desc ?? "Explore the collection.",
        image: c.heroImage ?? firstImg ?? (fb ? U(fb.img) : null),
        count: `${countBySlug.get(c.slug) ?? 0} ${unitFor(c.slug)}`,
      };
    });

  return (
    <>
      {/* Shop hero */}
      <section style={{ position: "relative", padding: "clamp(48px,7vw,84px) clamp(20px,5vw,40px) clamp(36px,5vw,52px)", overflow: "hidden", borderBottom: "1px solid var(--line2)" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(80% 70% at 50% 0%, rgba(205,181,130,.1), transparent 60%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <span style={{ fontSize: ".74rem", letterSpacing: ".24em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 600 }}>The Shop</span>
          <h1 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "clamp(2.4rem,5.4vw,3.8rem)", lineHeight: 1.04, margin: "14px 0 0" }}>Rum, apparel &amp; gifts</h1>
          <p style={{ color: "var(--muted)", fontSize: "1.06rem", lineHeight: 1.6, margin: "18px auto 0", maxWidth: 520 }}>
            Everything we make, in one place. Choose a category to explore — or browse the full collection.
          </p>
        </div>
      </section>

      {/* Category cards */}
      <section style={{ padding: "clamp(40px,6vw,72px) clamp(20px,5vw,40px) clamp(56px,7vw,88px)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div className="shop-cat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 20 }}>
            {cards.map((c) => (
              <Link
                key={c.slug}
                href={`/shop?category=${c.slug}`}
                style={{ position: "relative", aspectRatio: "16/10", borderRadius: 18, overflow: "hidden", border: "1px solid var(--line2)", display: "block", textDecoration: "none" }}
              >
                {c.image && <img src={c.image} alt={c.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,8,10,.93) 8%, rgba(8,8,10,.15) 60%)" }} />
                <div style={{ position: "absolute", left: 24, right: 24, bottom: 22 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <h2 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "clamp(1.5rem,2.6vw,2rem)", color: "var(--text)", margin: 0 }}>{c.name}</h2>
                    <span style={{ fontSize: ".72rem", color: "var(--goldHi)", background: "color-mix(in srgb,var(--bg) 55%,transparent)", border: "1px solid var(--line)", borderRadius: 999, padding: "4px 11px", whiteSpace: "nowrap" }}>{c.count}</span>
                  </div>
                  <p style={{ color: "var(--muted)", fontSize: ".9rem", lineHeight: 1.5, margin: "8px 0 0", maxWidth: 340 }}>{c.desc}</p>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--goldHi)", fontWeight: 600, fontSize: ".86rem", marginTop: 12 }}>
                    Shop {c.name} <i className="bi bi-arrow-right" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 36 }}>
            <Link href="/shop?category=all" style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "var(--gold)", color: "var(--onGold)", borderRadius: 999, padding: "14px 32px", fontSize: ".95rem", fontWeight: 600, textDecoration: "none" }}>
              Browse all products <i className="bi bi-arrow-right" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
