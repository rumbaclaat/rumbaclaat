/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSectionImageMap, sectionImage } from "@/lib/section-images";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shop",
  description:
    "Shop premium Caribbean rum and luxury Rumbaclaat apparel. Aged expressions, menswear, and womenswear. 18+ only.",
};

const U = (id: string, w = 600) =>
  `https://images.unsplash.com/${id}?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=${w}`;

const CATEGORIES = [
  { slug: "rum", img: "photo-1758871993077-e084cc7eca86", title: "Rum Collection", desc: "Caribbean expressions aged in American oak. 2 products.", cta: "Shop Rum →", alt: "A bottle of Rumbaclaat aged rum" },
  { slug: "mens-apparel", img: "photo-1770795263454-2756f5d7d9b0", title: "Men's Apparel", desc: "Premium heavyweight menswear. 3 products.", cta: "Shop Men →", alt: "Model wearing Rumbaclaat menswear" },
  { slug: "womens-apparel", img: "photo-1643302213971-0f21b7ada420", title: "Women's Apparel", desc: "Luxury womenswear with editorial flair. 2 products.", cta: "Shop Women →", alt: "Model wearing Rumbaclaat womenswear" },
];

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  // ---- Category grid mode (?category=…) — product listing ----
  if (category) {
    const [cat, products] = await Promise.all([
      prisma.category.findUnique({ where: { slug: category } }),
      prisma.product.findMany({
        where: { status: "published", category: { slug: category } },
        orderBy: { createdAt: "desc" },
      }),
    ]);
    return (
      <>
        <section className="section section--surface">
          <div className="container reveal">
            <nav aria-label="Breadcrumb" className="mb-3">
              <ol className="breadcrumb" style={{ fontSize: ".75rem", margin: 0 }}>
                <li className="breadcrumb-item"><Link href="/shop">Shop</Link></li>
                <li className="breadcrumb-item active" aria-current="page">{cat?.name ?? category}</li>
              </ol>
            </nav>
            <span className="eyebrow">The Collection</span>
            <h1 className="serif" style={{ fontSize: "clamp(2rem, 4.4vw, 3.4rem)", margin: 0 }}>{cat?.name ?? "Shop"}</h1>
            <p className="hero-lede" style={{ margin: "14px 0 0", textAlign: "left", marginInline: 0 }}>
              Browse the {(cat?.name ?? "collection")} — crafted with intention, worn and savoured with pride.
            </p>
          </div>
        </section>

        <section className="section section--sunken">
          <div className="container">
            <span className="eyebrow">Now Showing</span>
            <h2 className="serif" style={{ fontSize: "clamp(1.9rem, 4vw, 3rem)", marginBottom: "clamp(28px, 4vw, 48px)" }}>
              The {cat?.name ?? "Collection"}
            </h2>
            {products.length === 0 ? (
              <p style={{ color: "var(--text-dim)" }}>No products in this category yet.</p>
            ) : (
              <div className="row g-4">
                {products.map((p) => (
                  <div className="col-12 col-md-6 col-lg-4" key={p.id}>
                    <article className="product-card reveal h-100">
                      <Link href={`/product/${p.slug}`} className="product-card-img-link">
                        <div className="product-card-img">
                          {p.imageUrl && <img src={p.imageUrl} alt={p.name} loading="lazy" />}
                        </div>
                      </Link>
                      <div className="product-card-body">
                        <div className="stars" aria-label="Rated 5 out of 5">★★★★★</div>
                        <h3><Link href={`/product/${p.slug}`} style={{ color: "inherit", textDecoration: "none" }}>{p.name}</Link></h3>
                        {p.subtitle && <p className="subtitle">{p.subtitle}</p>}
                        <div className="product-card-price">
                          <div>
                            <div className="price">£{Number(p.onSale && p.salePrice != null ? p.salePrice : p.basePrice).toFixed(2)}</div>
                          </div>
                          <Link href={`/product/${p.slug}`} className="btn btn-outline-gold btn-sm">View →</Link>
                        </div>
                      </div>
                    </article>
                  </div>
                ))}
              </div>
            )}
            <div className="text-center" style={{ marginTop: "clamp(40px, 5vw, 64px)" }}>
              <Link href="/shop" className="btn btn-gold btn-lg">Browse all collections →</Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  // ---- Category landing (default) — reproduced from static-source/shop.html ----
  const imgs = await getSectionImageMap();
  return (
    <>
      <section className="section section--surface">
        <div className="container reveal" style={{ textAlign: "center", maxWidth: 720 }}>
          <span className="eyebrow eyebrow-center">The Collection</span>
          <h1 className="serif" style={{ fontSize: "clamp(2.4rem, 6vw, 4rem)", margin: 0 }}>Shop</h1>
          <p className="hero-lede">Premium Caribbean rum and luxury lifestyle apparel. Crafted with intention, worn with pride.</p>
        </div>
      </section>

      {/* Sale strip */}
      <aside style={{ padding: "18px 0", background: "linear-gradient(90deg,rgba(242,109,109,.04),rgba(242,109,109,.12),rgba(242,109,109,.04))", borderBottom: "1px solid rgba(242,109,109,.2)" }} aria-label="Current sale">
        <div className="container d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <span style={{ background: "rgba(242,109,109,.92)", color: "#fff", fontSize: ".65rem", fontWeight: 700, letterSpacing: ".1em", padding: "6px 12px", borderRadius: 999 }}>SUMMER SALE</span>
            <span style={{ fontFamily: "var(--serif)", fontSize: "1.05rem", color: "var(--text)" }}>Up to <span style={{ color: "#F26D6D", fontWeight: 700 }}>20% off</span> selected rum and apparel</span>
            <span className="sale-ends" style={{ margin: 0 }}>Ends <time dateTime="2026-06-04">4 June</time></span>
          </div>
          <Link href="/shop?category=rum" className="btn btn-outline-gold btn-sm">Shop the sale →</Link>
        </div>
      </aside>

      <section className="section section--sunken">
        <div className="container">
          <span className="eyebrow">Browse by Category</span>
          <h2 className="serif" style={{ fontSize: "clamp(1.9rem, 4vw, 3rem)", marginBottom: 8 }}>Find Your Collection</h2>
          <p className="hero-lede" style={{ textAlign: "left", marginInline: 0, marginTop: 6, marginBottom: "clamp(32px, 4vw, 56px)" }}>
            From aged Caribbean expressions to heavyweight apparel — choose where to begin.
          </p>

          <div className="row g-4">
            {CATEGORIES.map((c) => (
              <div className="col-12 col-md-6 col-lg-4" key={c.slug}>
                <Link href={`/shop?category=${c.slug}`} className="card-brand reveal d-flex flex-column text-center h-100 text-decoration-none">
                  <img src={U(c.img)} alt={c.alt} style={{ width: "100%", height: 220, objectFit: "cover", borderRadius: 12, marginBottom: 18 }} loading="lazy" />
                  <h3 className="serif" style={{ fontSize: "1.4rem", marginBottom: 8 }}>{c.title}</h3>
                  <p style={{ fontSize: ".9rem", color: "var(--text-muted)" }}>{c.desc}</p>
                  <span className="btn btn-outline-gold btn-sm mt-auto" style={{ alignSelf: "center" }}>{c.cta}</span>
                </Link>
              </div>
            ))}
          </div>

          <div className="card-brand card-brand--feature reveal d-flex align-items-center justify-content-between flex-wrap gap-3" style={{ marginTop: "clamp(32px, 4vw, 56px)" }}>
            <div>
              <p style={{ fontFamily: "var(--serif)", fontSize: "1.25rem", fontWeight: 600, color: "var(--gold-hi)", marginBottom: 4 }}>Members save up to 20% on every order</p>
              <p style={{ fontSize: ".9rem", color: "var(--text-muted)", margin: 0 }}>Join the loyalty programme — free Bronze tier with instant discounts.</p>
            </div>
            <Link href="/join" className="btn btn-gold btn-lg">Join Free →</Link>
          </div>
        </div>
      </section>

      {/* Gift cards advert */}
      <section className="section section--surface gift-card-advert reveal" aria-labelledby="gift-advert-title">
        <div className="container">
          <div className="gift-card-banner">
            <div className="gift-card-banner-visual" aria-hidden="true">
              <div className="gift-card-mock">
                <div className="gift-card-mock-eyebrow">RUMBACLAAT</div>
                <div className="gift-card-mock-value">£100</div>
                <div className="gift-card-mock-label">GIFT CARD</div>
                <div className="gift-card-mock-code">····  ····  ····  2026</div>
              </div>
            </div>
            <div className="gift-card-banner-copy">
              <span className="eyebrow">The Perfect Gift</span>
              <h2 id="gift-advert-title" className="gift-card-banner-h serif">Rumbaclaat Gift Cards</h2>
              <p className="gift-card-banner-lede">For the rum-lover in your life. Use against any product — rum, apparel, or membership upgrades. Delivered by email instantly, or scheduled for the big day.</p>
              <ul className="gift-card-banner-feats list-unstyled">
                <li><span aria-hidden="true">✓</span> Values from £25 to £500</li>
                <li><span aria-hidden="true">✓</span> Email or printable PDF — your choice</li>
                <li><span aria-hidden="true">✓</span> Schedule send for a birthday, anniversary or holiday</li>
                <li><span aria-hidden="true">✓</span> Never expire</li>
              </ul>
              <div className="d-flex gap-2 flex-wrap mt-3">
                <Link href="/gift-cards" className="btn btn-gold">Shop gift cards →</Link>
                <Link href="/gift-cards#values" className="btn btn-outline-gold">View values</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="parallax-section" style={{ minHeight: 400, backgroundImage: `url('${sectionImage(imgs, "shop.parallax")}')` }} aria-labelledby="shop-px">
        <div className="parallax-overlay" />
        <div className="parallax-content reveal">
          <span className="eyebrow eyebrow-center">Premium Lifestyle</span>
          <h2 id="shop-px">Crafted for Those<br />Who Demand More</h2>
          <p style={{ color: "var(--text-muted)" }}>Every product in our collection — from aged rum to heavyweight apparel — is made with the same obsessive attention to detail.</p>
        </div>
      </section>
    </>
  );
}
