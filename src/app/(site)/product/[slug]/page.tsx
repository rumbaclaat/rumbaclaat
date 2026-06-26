/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AddToCartButton from "@/components/cart/add-to-cart-button";

export const dynamic = "force-dynamic";

async function getProduct(slug: string) {
  return prisma.product.findFirst({
    where: { slug, status: "published" },
    include: {
      category: true,
      variants: { orderBy: { sku: "asc" } },
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

  const price = product.onSale && product.salePrice != null
    ? Number(product.salePrice)
    : Number(product.basePrice);
  const maxDiscount = tiers[0]?.memberDiscountPct ?? 0;
  const memberPrice = price * (1 - maxDiscount / 100);

  const colours = Array.from(
    new Map(
      product.variants
        .filter((v) => v.colourName)
        .map((v) => [v.colourName, v.colourHex])
    ).entries()
  );
  const sizes = Array.from(
    new Set(product.variants.map((v) => v.size).filter(Boolean))
  );

  return (
    <section className="section" style={{ paddingTop: 32 }}>
      <div className="container">
        <nav aria-label="Breadcrumb" className="mb-3">
          <ol className="breadcrumb" style={{ fontSize: ".75rem" }}>
            <li className="breadcrumb-item"><Link href="/">Home</Link></li>
            <li className="breadcrumb-item"><Link href="/shop">Shop</Link></li>
            {product.category && (
              <li className="breadcrumb-item">
                <Link href={`/shop?category=${product.category.slug}`}>{product.category.name}</Link>
              </li>
            )}
            <li className="breadcrumb-item active" aria-current="page">{product.name}</li>
          </ol>
        </nav>

        <div className="row g-5">
          {/* Gallery — sticky on desktop */}
          <div className="col-12 col-lg-6">
            <div style={{ position: "sticky", top: 96 }}>
              <div className="gallery-main mb-3">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} />
                ) : (
                  <div style={{ width: "100%", height: "100%", background: "var(--bg-card)" }} />
                )}
              </div>
              {product.galleryImages.length > 0 && (
                <div className="row g-2">
                  {[product.imageUrl, ...product.galleryImages].filter(Boolean).slice(0, 4).map((src, i) => (
                    <div className="col-3" key={i}>
                      <div className="thumb w-100">
                        <img src={src as string} alt="" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Buy-box */}
          <div className="col-12 col-lg-6">
            {product.category && <span className="eyebrow">{product.category.name}</span>}
            <h1 className="serif" style={{ fontSize: "clamp(2rem,4.4vw,3.4rem)", marginBottom: 8 }}>{product.name}</h1>
            {product.subtitle && (
              <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", marginBottom: 18 }}>{product.subtitle}</p>
            )}

            {/* Rating */}
            <div className="d-flex align-items-center gap-2 mb-4" aria-hidden="true">
              <span className="stars">★★★★★</span>
              <span style={{ fontSize: ".8rem", color: "var(--text-dim)" }}>Trusted by the bold</span>
            </div>

            {/* Price · member price · points */}
            <div
              className="mb-4"
              style={{
                paddingBottom: 24,
                borderBottom: "1px solid var(--line)",
              }}
            >
              <div className="d-flex align-items-baseline gap-3 flex-wrap">
                <span className="serif gold" style={{ fontSize: "2.6rem", lineHeight: 1 }}>£{price.toFixed(2)}</span>
                {product.onSale && product.salePrice != null && (
                  <span style={{ color: "var(--text-dim)", textDecoration: "line-through", fontSize: "1.1rem" }}>£{Number(product.basePrice).toFixed(2)}</span>
                )}
              </div>
              {maxDiscount > 0 && (
                <p style={{ fontSize: ".9rem", color: "var(--gold-hi)", margin: "10px 0 0" }}>
                  Members from £{memberPrice.toFixed(2)} · earn {product.basePoints} pts
                </p>
              )}
            </div>

            {product.description && (
              <p style={{ color: "var(--text-muted)", margin: "0 0 24px" }}>{product.description}</p>
            )}

            {/* Colours / sizes */}
            {colours.length > 0 && (
              <div className="mb-4">
                <div className="eyebrow" style={{ marginBottom: 10 }}>Colour</div>
                <div className="d-flex gap-2 flex-wrap">
                  {colours.map(([name, hex]) => (
                    <span key={name} className="badge-brand" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      {hex && <span style={{ width: 12, height: 12, borderRadius: "50%", background: hex, display: "inline-block", border: "1px solid rgba(255,255,255,.2)" }} />}
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {sizes.length > 0 && (
              <div className="mb-4">
                <div className="eyebrow" style={{ marginBottom: 10 }}>Size</div>
                <div className="d-flex gap-2 flex-wrap">
                  {sizes.map((sz) => (
                    <span key={sz} className="badge-brand">{sz}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Add to cart — single gold primary action */}
            <div className="d-flex gap-3 align-items-center mt-2">
              {product.stockQty > 0 ? (
                <AddToCartButton
                  productId={product.id}
                  name={product.name}
                  price={price}
                  className="btn btn-gold btn-lg"
                />
              ) : (
                <button type="button" className="btn btn-gold btn-lg" disabled>
                  Out of stock
                </button>
              )}
              <span style={{ fontSize: ".78rem", color: "var(--text-dim)" }}>
                {product.stockQty > 0 ? `${product.stockQty} in stock` : "Out of stock"}
              </span>
            </div>

            {/* Trust line */}
            <p style={{ fontSize: ".78rem", color: "var(--text-dim)", margin: "16px 0 0" }}>
              Free UK shipping over £50 · 18+ only, age verified on delivery.
            </p>

            {/* Detail accordions (native details) */}
            <div className="mt-4">
              <details className="card-brand mb-2" open>
                <summary className="serif" style={{ cursor: "pointer", fontWeight: 600, fontSize: "1.1rem" }}>Description</summary>
                <p style={{ color: "var(--text-muted)", marginTop: 12, marginBottom: 0 }}>
                  {product.description ?? "A signature Rumbaclaat expression."}
                </p>
              </details>
              <details className="card-brand mb-2">
                <summary className="serif" style={{ cursor: "pointer", fontWeight: 600, fontSize: "1.1rem" }}>Delivery &amp; returns</summary>
                <p style={{ color: "var(--text-muted)", marginTop: 12, marginBottom: 0 }}>
                  Standard UK delivery £4.99 (free over £50), 3–5 working days. Someone aged 18+ must sign on delivery.
                </p>
              </details>
              <details className="card-brand">
                <summary className="serif" style={{ cursor: "pointer", fontWeight: 600, fontSize: "1.1rem" }}>Drink responsibly</summary>
                <p style={{ color: "var(--text-muted)", marginTop: 12, marginBottom: 0 }}>
                  For those of legal drinking age. Please enjoy responsibly. Visit drinkaware.co.uk.
                </p>
              </details>
            </div>
          </div>
        </div>

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
