/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductPurchase, { type ProductPurchaseData } from "@/components/cart/product-purchase";

export const dynamic = "force-dynamic";

async function getProduct(slug: string) {
  return prisma.product.findFirst({
    where: { slug, status: "published" },
    include: {
      category: true,
      variants: { where: { active: true }, orderBy: { sortOrder: "asc" } },
      reviews: { where: { status: "live" }, orderBy: { createdAt: "desc" } },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return {};
  return {
    title: p.name,
    description: p.subtitle ?? p.description ?? undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, tiers] = await Promise.all([
    getProduct(slug),
    prisma.membershipTier.findMany({ orderBy: { memberDiscountPct: "desc" }, take: 1 }),
  ]);
  if (!product) notFound();

  const basePrice = Number(product.basePrice);
  const price =
    product.onSale && product.salePrice != null ? Number(product.salePrice) : basePrice;
  const maxDiscount = tiers[0]?.memberDiscountPct ?? 0;
  const memberPrice = maxDiscount > 0 ? price * (1 - maxDiscount / 100) : null;

  const kind: "rum" | "apparel" =
    product.type === "apparel" || product.type === "cap" ? "apparel" : "rum";

  // Colours (first variant per colour wins for the swatch image).
  const colourMap = new Map<string, { name: string; hex: string | null; image: string | null }>();
  for (const v of product.variants) {
    if (v.colourName && !colourMap.has(v.colourName)) {
      colourMap.set(v.colourName, {
        name: v.colourName,
        hex: v.colourHex,
        image: v.imageUrl ?? product.imageUrl ?? null,
      });
    }
  }
  const colours = [...colourMap.values()];
  const sizes = [...new Set(product.variants.map((v) => v.size).filter(Boolean))] as string[];
  const images = [product.imageUrl, ...product.galleryImages].filter(Boolean) as string[];

  // Rum spec cells from real fields.
  const specs: { label: string; value: string }[] = [];
  if (kind === "rum") {
    if (product.abv != null) specs.push({ label: "ABV", value: `${Number(product.abv)}%` });
    if (product.ageStatement) specs.push({ label: "AGE", value: product.ageStatement });
    if (product.origin) specs.push({ label: "ORIGIN", value: product.origin });
    if (product.caskType) specs.push({ label: "CASK", value: product.caskType });
  }

  const composedSubtitle =
    kind === "rum"
      ? [
          product.ageStatement,
          product.abv != null ? `${Number(product.abv)}% ABV` : null,
          product.volume,
          product.origin,
        ]
          .filter(Boolean)
          .join(" · ")
      : null;
  const subtitle = product.subtitle ?? (composedSubtitle || null);

  const saleEnds =
    product.onSale && product.saleEndDate
      ? new Date(product.saleEndDate).toLocaleDateString("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })
      : null;
  // ISO date for the semantic <time datetime> on the sale-ends label (apparel).
  const saleEndsIso =
    product.onSale && product.saleEndDate
      ? new Date(product.saleEndDate).toISOString().slice(0, 10)
      : null;

  const accordions =
    kind === "rum"
      ? [
          {
            t: "Description",
            b: product.description ?? "A signature Rumbaclaat expression, crafted with heritage.",
          },
          {
            t: "Delivery & returns",
            b: "Standard UK delivery £4.99 (free over £50), 3–5 working days. Someone aged 18+ must sign on delivery. 14-day returns on unopened bottles.",
          },
          {
            t: "Drink responsibly",
            b: "Rumbaclaat is for those of legal drinking age. Please enjoy responsibly. For guidance and support, visit drinkaware.co.uk.",
          },
        ]
      : [
          {
            t: "Details & fabric",
            b:
              [product.material, product.gsm ? `${product.gsm}gsm` : null, product.careInstructions]
                .filter(Boolean)
                .join(" · ") ||
              "Premium heavyweight construction with an embroidered gold Rumbaclaat mark.",
          },
          {
            t: "Size & fit",
            b: product.fit ?? "Relaxed fit. If you are between sizes, size down for a closer fit.",
          },
          {
            t: "Delivery & returns",
            b: "Standard UK delivery £4.99 (free over £50), 3–5 working days. Free returns within 30 days on unworn items.",
          },
        ];

  const data: ProductPurchaseData = {
    kind,
    productId: product.id,
    name: product.name,
    subtitle,
    description: product.description,
    eyebrow: (product.category?.name ?? "Rumbaclaat").toUpperCase(),
    images,
    price,
    basePrice,
    onSale: product.onSale,
    saleEnds,
    saleEndsIso,
    memberPrice,
    points: product.basePoints,
    reviewCount: product.reviewCount,
    stockQty: product.stockQty,
    variants: product.variants.map((v) => ({
      id: v.id,
      colourName: v.colourName,
      colourHex: v.colourHex,
      size: v.size,
      priceDelta: Number(v.priceDelta),
      stockQty: v.stockQty,
      imageUrl: v.imageUrl,
    })),
    colours,
    sizes,
    specs,
    tastingNotes: kind === "rum" ? product.tastingNotes : null,
    accordions,
  };

  const related = await prisma.product.findMany({
    where: {
      status: "published",
      id: { not: product.id },
      ...(product.categoryId ? { categoryId: product.categoryId } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return (
    <section
      style={{
        padding:
          "clamp(28px,4vw,44px) clamp(20px,5vw,40px) clamp(72px,9vw,110px)",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <nav
          aria-label="Breadcrumb"
          style={{ fontSize: ".78rem", color: "var(--dim)", marginBottom: 24 }}
        >
          <Link href="/" style={{ color: "var(--dim)" }}>
            Home
          </Link>{" "}
          <span style={{ opacity: 0.5 }}>/</span>{" "}
          <Link href="/shop" style={{ color: "var(--dim)" }}>
            Shop
          </Link>{" "}
          {product.category && (
            <>
              <span style={{ opacity: 0.5 }}>/</span>{" "}
              <Link
                href={`/shop?category=${product.category.slug}`}
                style={{ color: "var(--dim)" }}
              >
                {product.category.name}
              </Link>{" "}
            </>
          )}
          <span style={{ opacity: 0.5 }}>/</span>{" "}
          <span style={{ color: "var(--muted)" }}>{product.name}</span>
        </nav>

        <ProductPurchase {...data} />

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-5 pt-4" style={{ borderTop: "1px solid var(--gold-bdr)" }}>
            <h2 className="h3 mb-4">You may also like</h2>
            <div className="row g-4">
              {related.map((r) => {
                const rPrice =
                  r.onSale && r.salePrice != null ? Number(r.salePrice) : Number(r.basePrice);
                return (
                  <div className="col-12 col-md-4" key={r.id}>
                    <article className="product-card h-100">
                      <Link href={`/product/${r.slug}`} className="product-card-img-link">
                        <div className="product-card-img">
                          {r.imageUrl && <img src={r.imageUrl} alt={r.name} loading="lazy" />}
                        </div>
                      </Link>
                      <div className="product-card-body">
                        <h3>
                          <Link href={`/product/${r.slug}`} style={{ color: "inherit", textDecoration: "none" }}>
                            {r.name}
                          </Link>
                        </h3>
                        {r.subtitle && <p className="subtitle">{r.subtitle}</p>}
                        <div className="product-card-price">
                          <div className="price">£{rPrice.toFixed(2)}</div>
                          <Link href={`/product/${r.slug}`} className="btn btn-outline-gold btn-sm">View</Link>
                        </div>
                      </div>
                    </article>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Customer reviews — hidden per request (flip `false` to re-enable) */}
        {false && (product?.reviews?.length ?? 0) > 0 && (
          <div className="mt-5 pt-4" style={{ borderTop: "1px solid var(--gold-bdr)" }}>
            <h2 className="h4 mb-4">Customer reviews</h2>
            <div className="row g-3">
              {(product?.reviews ?? []).map((r) => (
                <div className="col-md-6" key={r.id}>
                  <div className="card-brand h-100">
                    <div className="d-flex justify-content-between">
                      <strong>{r.title ?? "Review"}</strong>
                      <span className="gold">{"★".repeat(r.rating)}</span>
                    </div>
                    {r.body && <p style={{ color: "var(--text-muted)", fontSize: ".875rem", margin: "8px 0 0" }}>{r.body}</p>}
                    <p style={{ fontSize: ".75rem", color: "var(--text-dim)", marginTop: 8, marginBottom: 0 }}>
                      {r.authorName}{r.memberTier ? ` · ${r.memberTier}` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
