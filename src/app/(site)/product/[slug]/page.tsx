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
          {/* Gallery placeholder */}
          <div className="col-12 col-lg-6">
            <div style={{ aspectRatio: "1", borderRadius: "var(--radius-xl)", background: "var(--bg-card2)", border: "1px solid var(--gold-bdr)" }} />
          </div>

          {/* Info */}
          <div className="col-12 col-lg-6">
            {product.category && <span className="eyebrow">{product.category.name}</span>}
            <h1 style={{ fontSize: "clamp(2rem,4vw,2.75rem)" }}>{product.name}</h1>
            {product.subtitle && (
              <p style={{ color: "var(--text-muted)" }}>{product.subtitle}</p>
            )}

            <div className="d-flex align-items-baseline gap-3 my-3">
              <span className="serif gold" style={{ fontSize: "2rem" }}>£{price.toFixed(2)}</span>
              {product.onSale && product.salePrice != null && (
                <span style={{ color: "var(--text-dim)", textDecoration: "line-through" }}>£{Number(product.basePrice).toFixed(2)}</span>
              )}
              {maxDiscount > 0 && (
                <span style={{ fontSize: ".9rem", color: "var(--gold-hi)" }}>
                  Members from £{memberPrice.toFixed(2)} · earn {product.basePoints} pts
                </span>
              )}
            </div>

            {product.description && <p style={{ margin: "14px 0 20px" }}>{product.description}</p>}

            {/* Colours / sizes */}
            {colours.length > 0 && (
              <div className="mb-3">
                <div className="form-label">Colour</div>
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
              <div className="mb-3">
                <div className="form-label">Size</div>
                <div className="d-flex gap-2 flex-wrap">
                  {sizes.map((sz) => (
                    <span key={sz} className="badge-brand">{sz}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="d-flex gap-2 align-items-center mt-3">
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
              <span style={{ fontSize: ".75rem", color: "var(--text-dim)" }}>
                {product.stockQty > 0 ? `${product.stockQty} in stock` : "Out of stock"}
              </span>
            </div>
            <p style={{ fontSize: ".75rem", color: "var(--text-dim)", marginTop: 10 }}>
              Free UK shipping over £50 · 18+ only, age verified on delivery.
            </p>

            {/* Accordion (native details) */}
            <div className="mt-4">
              <details className="card-brand mb-2" open>
                <summary style={{ cursor: "pointer", fontFamily: "var(--serif)", fontWeight: 600 }}>Description</summary>
                <p style={{ color: "var(--text-muted)", marginTop: 10, marginBottom: 0 }}>
                  {product.description ?? "A signature Rumbaclaat expression."}
                </p>
              </details>
              <details className="card-brand mb-2">
                <summary style={{ cursor: "pointer", fontFamily: "var(--serif)", fontWeight: 600 }}>Delivery &amp; returns</summary>
                <p style={{ color: "var(--text-muted)", marginTop: 10, marginBottom: 0 }}>
                  Standard UK delivery £4.99 (free over £50), 3–5 working days. Someone aged 18+ must sign on delivery.
                </p>
              </details>
              <details className="card-brand">
                <summary style={{ cursor: "pointer", fontFamily: "var(--serif)", fontWeight: 600 }}>Drink responsibly</summary>
                <p style={{ color: "var(--text-muted)", marginTop: 10, marginBottom: 0 }}>
                  For those of legal drinking age. Please enjoy responsibly. Visit drinkaware.co.uk.
                </p>
              </details>
            </div>
          </div>
        </div>

        {/* Reviews */}
        {product.reviews.length > 0 && (
          <div className="mt-5 pt-4" style={{ borderTop: "1px solid var(--gold-bdr)" }}>
            <h2 className="h4 mb-4">Customer reviews</h2>
            <div className="row g-3">
              {product.reviews.map((r) => (
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
