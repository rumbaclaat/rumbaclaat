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

// Per-category hero + closing-band copy/imagery, reproduced verbatim from the
// bespoke category designs (static-source/shop-{rum,men,women}.html). The DB
// category supplies name/description/heroImage where present; these are the
// design fallbacks when a field is null. `filters` shows the rum-only static
// toolbar; `px*` drive the closing parallax band.
type CatTheme = {
  crumb: string;
  eyebrow: string;
  title: string;
  lede: string;
  filters: boolean;
  pxMinHeight: number;
  pxImage: string;
  pxEyebrow: string;
  pxTitle: string;
  pxBody: string;
};

const CAT_THEME: Record<string, CatTheme> = {
  // static-source/shop-rum.html
  rum: {
    crumb: "Rum",
    eyebrow: "Rum Collection",
    title: "Caribbean Expressions",
    lede: "Hand-selected Caribbean rums aged in American oak. Complex, bold, and unmistakably Rumbaclaat.",
    filters: true,
    pxMinHeight: 440,
    pxImage: "https://images.unsplash.com/photo-1551738936-a10dceb71107?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1800&q=80",
    pxEyebrow: "FROM CANE TO CASK",
    pxTitle: "Twelve Years<br/>in the Making",
    pxBody:
      "Caribbean heat accelerates maturation. One year in Trinidad is worth three in Scotland — by the time it reaches your glass, it has lived more than most spirits twice its age.",
  },
  // static-source/shop-men.html
  "mens-apparel": {
    crumb: "Men's",
    eyebrow: "Men's Apparel",
    title: "Premium Menswear",
    lede: "Heavyweight construction. Gold embroidery. Designed to be noticed.",
    filters: false,
    pxMinHeight: 380,
    pxImage: "https://images.unsplash.com/photo-1761522001955-19ffe0294875?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1800&q=80",
    pxEyebrow: "QUALITY OVER QUANTITY",
    pxTitle: "Built to Last<br/>a Lifetime",
    pxBody:
      "Every piece uses heavyweight organic cotton and gold-thread detailing. No fast fashion. No compromise.",
  },
  // static-source/shop-women.html
  "womens-apparel": {
    crumb: "Women's",
    eyebrow: "Women's Apparel",
    title: "Luxury Womenswear",
    lede: "Effortless silhouettes. Soft gold details. Designed for the editorial wardrobe.",
    filters: false,
    pxMinHeight: 380,
    pxImage: "https://images.unsplash.com/photo-1725121225009-3d7e049fb8a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1800&q=80",
    pxEyebrow: "EDITORIAL LUXURY",
    pxTitle: "Designed to<br/>Be Remembered",
    pxBody:
      "Every silhouette is cut with editorial precision — made for those who dress with intention.",
  },
};

const CAT_THEME_DEFAULT: CatTheme = {
  crumb: "Collection",
  eyebrow: "The Collection",
  title: "The Collection",
  lede: "Crafted with intention, worn and savoured with pride.",
  filters: false,
  pxMinHeight: 380,
  pxImage: "https://images.unsplash.com/photo-1551738936-a10dceb71107?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1800&q=80",
  pxEyebrow: "PREMIUM LIFESTYLE",
  pxTitle: "Crafted for Those<br/>Who Demand More",
  pxBody:
    "Every product in our collection — from aged rum to heavyweight apparel — is made with the same obsessive attention to detail.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  // ---- Category listing mode (?category=…) ----
  //   Reproduced from static-source/shop-rum.html, shop-men.html, shop-women.html.
  //   Shared layout: category hero (section-sm) → product grid (shop-grid) with
  //   an optional rum filter toolbar and members band → closing parallax band.
  //   Hero copy/imagery comes from the DB category, falling back to each
  //   design's bespoke copy via CAT_THEME below.
  if (category) {
    const [cat, products] = await Promise.all([
      prisma.category.findUnique({ where: { slug: category } }),
      prisma.product.findMany({
        where: { status: "published", category: { slug: category } },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const theme = CAT_THEME[category] ?? CAT_THEME_DEFAULT;
    const name = cat?.name ?? theme.crumb;
    const heroEyebrow = (cat?.name ?? theme.eyebrow).toUpperCase();
    const heroTitle = theme.title;
    const heroLede = cat?.description ?? theme.lede;

    return (
      <>
        {/* Category hero — shop-{rum,men,women}.html: <section class="section-sm"> */}
        <section
          className="section-sm"
          style={{
            background: "linear-gradient(135deg,#161208,#0E0E0E)",
            borderBottom: "1px solid var(--gold-bdr)",
          }}
        >
          <div className="container reveal">
            <nav aria-label="Breadcrumb" className="mb-2">
              <ol className="breadcrumb" style={{ fontSize: ".75rem", margin: 0 }}>
                <li className="breadcrumb-item"><Link href="/shop">Shop</Link></li>
                <li className="breadcrumb-item active" aria-current="page">{name}</li>
              </ol>
            </nav>
            <span className="eyebrow">{heroEyebrow}</span>
            <h1>{heroTitle}</h1>
            <p style={{ maxWidth: 520, marginTop: 10 }}>{heroLede}</p>
          </div>
        </section>

        {/* Product grid — shop-{rum,men,women}.html: <section class="section"> */}
        <section className="section">
          <div className="container">
            {theme.filters && (
              <div className="d-flex gap-2 flex-wrap mb-4 reveal" role="group" aria-label="Filter rum by type">
                <button type="button" className="btn btn-ghost btn-sm" aria-pressed="true">All Rum</button>
                <button type="button" className="btn btn-outline-gold btn-sm" aria-pressed="false">Aged</button>
                <button type="button" className="btn btn-outline-gold btn-sm" aria-pressed="false">Spiced</button>
                <button type="button" className="btn btn-outline-gold btn-sm" aria-pressed="false">Limited</button>
              </div>
            )}

            {products.length === 0 ? (
              <p style={{ color: "var(--text-dim)" }}>No products in this category yet.</p>
            ) : (
              <div className="row g-4 shop-grid">
                {products.map((p) => {
                  const onSale = p.onSale && p.salePrice != null;
                  const price = Number(onSale ? p.salePrice : p.basePrice).toFixed(2);
                  const regular = Number(p.basePrice).toFixed(2);
                  const saving = onSale
                    ? (Number(p.basePrice) - Number(p.salePrice)).toFixed(2)
                    : null;
                  const rating = Math.round(Number(p.ratingAvg ?? 5));
                  const stars = "★★★★★".slice(0, Math.max(0, Math.min(5, rating)));
                  return (
                    <div className="col-12 col-md-6 col-lg-4" key={p.id}>
                      <article className="product-card reveal h-100">
                        <Link href={`/product/${p.slug}`} className="product-card-img-link" aria-label={`View ${p.name} details`}>
                          <div className="product-card-img">
                            {onSale && <span className="sale-badge" aria-hidden="true">SAVE £{saving}</span>}
                            {p.imageUrl && <img src={p.imageUrl} alt={p.name} loading="lazy" />}
                          </div>
                        </Link>
                        <div className="product-card-body">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="stars" aria-label={`Rated ${rating} out of 5`}>{stars}</div>
                            {p.reviewCount > 0 && (
                              <span style={{ fontSize: ".75rem", color: "var(--text-dim)" }}>{p.reviewCount} reviews</span>
                            )}
                          </div>
                          <h2 className="h3"><Link href={`/product/${p.slug}`} style={{ color: "inherit", textDecoration: "none" }}>{p.name}</Link></h2>
                          {p.subtitle && <p className="subtitle">{p.subtitle}</p>}
                          <div className="product-card-price">
                            <div>
                              {onSale ? (
                                <span className="price-pair">
                                  <span className="visually-hidden">Sale price</span>
                                  <span className="price-sale">£{price}</span>
                                  <span className="visually-hidden">Regular price</span>
                                  <span className="price-regular">£{regular}</span>
                                  <span className="price-saving">Save £{saving}</span>
                                </span>
                              ) : (
                                <div className="price">£{price}</div>
                              )}
                            </div>
                            <Link href={`/product/${p.slug}`} className="btn btn-gold btn-sm" aria-label={`View ${p.name}`}>View →</Link>
                          </div>
                        </div>
                      </article>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Members band — shop-rum.html closing card-brand */}
            <div className="card-brand reveal mt-5 d-flex align-items-center justify-content-between flex-wrap gap-3" style={{ borderColor: "var(--gold-md)" }}>
              <div>
                <p style={{ fontFamily: "var(--serif)", fontSize: "1.125rem", fontWeight: 600, color: "var(--gold-hi)", marginBottom: 4 }}>
                  Members save up to 20% on every order
                </p>
                <p style={{ fontSize: ".875rem", margin: 0 }}>
                  Join the Rumbaclaat loyalty programme — free to join, with discounts from your first purchase.
                </p>
              </div>
              <Link href="/join" className="btn btn-gold">Join Free →</Link>
            </div>

            <div className="text-center" style={{ marginTop: "clamp(40px, 5vw, 64px)" }}>
              <Link href="/shop" className="btn btn-outline-gold btn-lg">Browse all collections →</Link>
            </div>
          </div>
        </section>

        {/* Closing parallax band — shop-{rum,men,women}.html */}
        <section
          className="parallax-section"
          style={{ minHeight: theme.pxMinHeight, backgroundImage: `url('${theme.pxImage}')` }}
          aria-labelledby="cat-px"
        >
          <div className="parallax-overlay" />
          <div className="parallax-content reveal">
            <span className="eyebrow eyebrow-center">{theme.pxEyebrow}</span>
            <h2 id="cat-px" dangerouslySetInnerHTML={{ __html: theme.pxTitle }} />
            <p>{theme.pxBody}</p>
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
              <p style={{ fontSize: ".9rem", color: "var(--text-muted)", margin: 0 }}>Join RPM — free Bronze tier with instant discounts.</p>
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
