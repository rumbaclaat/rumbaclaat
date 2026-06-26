/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import BrandImage from "@/components/brand-image";
import { prisma } from "@/lib/prisma";
import BlockRenderer from "@/components/blocks/block-renderer";
import { getSectionImageMap, sectionImage } from "@/lib/section-images";

export const dynamic = "force-dynamic";

const U = (id: string, w = 800) =>
  `https://images.unsplash.com/${id}?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=${w}`;

export default async function HomePage() {
  // Editable homepage: if a published "home" page with blocks exists, render it.
  // Otherwise fall back to this hand-built design.
  const homePage = await prisma.page.findFirst({
    where: { slug: "home", status: "published" },
    include: { blocks: { orderBy: { order: "asc" } } },
  });
  if (homePage && homePage.blocks.length > 0) {
    return <>{homePage.blocks.map((b) => <BlockRenderer key={b.id} block={b} />)}</>;
  }

  const imgs = await getSectionImageMap();

  return (
    <>
      {/* Static hero banner */}
      <section className="hero">
        <div className="hero-bg" style={{ backgroundImage: `url('${sectionImage(imgs, "home.hero")}')` }} />
        <div className="hero-overlay" />
        <div className="hero-content">
          <BrandImage src="/brand/logo.png" alt="Rumbaclaat Rum" className="hero-logo" />
          <span className="eyebrow eyebrow-center">Premium Caribbean Rum</span>
          <h1>Born in the Caribbean.<br /><em className="gold">Bottled for the Bold.</em></h1>
          <p className="hero-lede">Aged in American oak. Crafted with heritage. Rumbaclaat rum is a tribute to Caribbean culture, distilled into every drop.</p>
          <div className="d-flex gap-3 justify-content-center flex-wrap mt-4">
            <Link href="/shop" className="btn btn-gold btn-lg">Shop Rum</Link>
            <Link href="/join" className="btn btn-outline-gold btn-lg">Join the Inner Circle</Link>
          </div>
        </div>
      </section>

      {/* Announcement ticker */}
      <section className="announcement-ticker" role="region" aria-label="Site announcements">
        <div className="container">
          <div className="at-inner">
            <div className="at-viewport">
              <div className="at-msg show">
                <span className="at-ic" aria-hidden="true">🎁</span>
                <span className="at-lead">Order by Saturday 13 December</span>
                <span className="at-det">for guaranteed Christmas delivery in the UK</span>
              </div>
              <div className="at-msg">
                <span className="at-ic" aria-hidden="true">🚚</span>
                <span className="at-lead">Free UK shipping over £50</span>
                <span className="at-det">— express upgrades available at checkout</span>
              </div>
              <div className="at-msg">
                <span className="at-ic" aria-hidden="true">✦</span>
                <span className="at-lead">Gold Members — Spiced Tasting Night, 12 Jan</span>
                <span className="at-det">— London, RSVP via Member Portal</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="section--sunken">
        <div className="container">
          <ul className="trust-bar list-unstyled m-0">
            <li className="trust-item"><span className="trust-icon" aria-hidden="true">✦</span> 12+ Year Aged Expressions</li>
            <li className="trust-item"><span className="trust-icon" aria-hidden="true">✦</span> Free UK Shipping on £50+</li>
            <li className="trust-item"><span className="trust-icon" aria-hidden="true">✦</span> 50,000+ Members</li>
            <li className="trust-item"><span className="trust-icon" aria-hidden="true">✦</span> Caribbean Heritage</li>
            <li className="trust-item"><span className="trust-icon" aria-hidden="true">✦</span> Award-Winning Distillery</li>
          </ul>
        </div>
      </section>

      {/* Oak parallax */}
      <section
        className="parallax-section"
        aria-labelledby="oak-title"
        style={{ minHeight: 440, backgroundImage: `url('${sectionImage(imgs, "home.oak")}')` }}
      >
        <div className="parallax-overlay" />
        <div className="parallax-content reveal">
          <span className="eyebrow eyebrow-center">Aged in American Oak</span>
          <h2 id="oak-title">Patience is<br />the Secret Ingredient</h2>
          <p style={{ color: "var(--text-muted)" }}>Twelve years minimum. Caribbean heat accelerates maturation — one year in Trinidad is worth three in Scotland.</p>
        </div>
      </section>

      {/* Editorial story split — product collection */}
      <section className="section" aria-labelledby="featured-title">
        <div className="container">
          <div className="text-center reveal mb-5">
            <span className="eyebrow eyebrow-center">Signature Collection</span>
            <h2 className="serif" id="featured-title">From the cask to the wardrobe</h2>
            <p style={{ maxWidth: 720, margin: "12px auto 0", color: "var(--text-muted)" }}>
              Two Caribbean expressions and the apparel we wear behind the bar. Pick a flagship from each side of the brand.
            </p>
          </div>
          <div className="row g-4">
            <FeaturedCard
              href="/product/original-reserve"
              img={U("photo-1758871993077-e084cc7eca86")}
              badge="12 Year"
              title="Rumbaclaat Original Reserve"
              subtitle="12 Year Aged Rum — Jamaica"
              desc="Vanilla, toasted caramel, tropical fruit. A long, warming finish that defines the Rumbaclaat character."
              price="£49.99"
              member="Members from £42.49"
            />
            <FeaturedCard
              href="/product/spiced-gold"
              img={U("photo-1764699186296-9dac0ddb5edb")}
              title="Rumbaclaat Spiced Gold"
              subtitle="Signature Spiced Expression — Barbados"
              desc="Cinnamon, orange peel, warm spice & honey. The perfect companion for any occasion."
              price="£38.99"
              member="Members from £33.14"
            />
            <FeaturedCard
              href="/product/gold-label-hoodie"
              img={U("photo-1499971442178-8c10fdf5f6ac")}
              badge="Apparel"
              title="Gold Label Hoodie"
              subtitle="Heavyweight French Terry — 3 colourways"
              desc="450gsm garment-washed fleece. Embroidered gold crest. Cut for a relaxed fit. Black, Charcoal, Stone."
              price="£95.00"
              member="Members from £80.75"
              cta="view"
            />
          </div>
          <div className="text-center mt-5 d-flex gap-2 justify-content-center flex-wrap">
            <Link href="/shop" className="btn btn-gold btn-lg">View Full Rum Collection →</Link>
            <Link href="/shop?category=mens-apparel" className="btn btn-outline-gold btn-lg">View All Apparel →</Link>
          </div>
        </div>
      </section>

      {/* Membership tiers */}
      <section
        className="section"
        style={{ background: "linear-gradient(135deg,#1C1A14,#161310)", borderTop: "1px solid var(--gold-bdr)", borderBottom: "1px solid var(--gold-bdr)" }}
        aria-labelledby="tiers-title"
      >
        <div className="container">
          <div className="text-center reveal mb-5">
            <span className="eyebrow eyebrow-center">Loyalty Programme</span>
            <h2 className="serif" id="tiers-title">The Inner Circle of Rum</h2>
            <p style={{ maxWidth: 720, margin: "12px auto 0", color: "var(--text-muted)" }}>Four tiers. Exclusive perks. Member-only pricing. Join free — upgrade when ready.</p>
          </div>
          <div className="row g-4">
            <TierCard color="var(--bronze)" cls="tier-bronze" name="Bronze" price="Free" perk="5% discount · 1× points" />
            <TierCard color="var(--silver)" cls="tier-silver" name="Silver" price="£9.99/mo" perk="10% off · 1.5× points" />
            <TierCard color="var(--gold)" cls="tier-gold" name="Gold" price="£24.99/mo" perk="15% off · 2× points" highlight />
            <TierCard color="var(--gold)" cls="tier-black" name="Black Reserve" price="£54.99/mo" perk="20% off · 3× points" />
          </div>
          <div className="text-center mt-5 reveal">
            <Link href="/join" className="btn btn-gold btn-lg">View All Plans &amp; Join →</Link>
          </div>
        </div>
      </section>

      {/* Cocktails — 3-up */}
      <section className="section section--surface" aria-labelledby="cocktails-title">
        <div className="container">
          <div className="text-center reveal mb-5">
            <span className="eyebrow eyebrow-center">Cocktail Recipes</span>
            <h2 className="serif" id="cocktails-title">Mix it up</h2>
            <p style={{ maxWidth: 720, margin: "12px auto 0", color: "var(--text-muted)" }}>Three signature serves to pour at home — from a five-minute sour to a slow evening sipper.</p>
          </div>
          <div className="row g-4">
            <CocktailCard href="/cocktails/rumbaclaat-sour" img={U("photo-1748674755168-266c309d4712", 600)} badge="Easy · 5 mins" title="Rumbaclaat Sour" desc="Fresh lime, egg white, bitters. Elegant aperitif." />
            <CocktailCard href="/cocktails" img={U("photo-1767745455688-49391131f751", 600)} badge="Medium · 8 mins" title="Dark & Smoky" desc="Mezcal, dark honey, mole bitters. An evening classic." />
            <CocktailCard href="/cocktails/spiced-mule" img={U("photo-1609189123897-42db027571c9", 600)} badge="Easy · 3 mins" title="Spiced Mule" desc="Spiced Gold, ginger beer, lime. Refreshing and easy." />
          </div>
          <div className="text-center mt-5 reveal">
            <Link href="/cocktails" className="btn btn-gold btn-lg">View All Recipes →</Link>
          </div>
        </div>
      </section>

      {/* Journal — 3-up */}
      <section className="section" aria-labelledby="blog-title">
        <div className="container">
          <div className="text-center reveal mb-5">
            <span className="eyebrow eyebrow-center">From the Journal</span>
            <h2 className="serif" id="blog-title">Stories &amp; Craft</h2>
            <p style={{ maxWidth: 720, margin: "12px auto 0", color: "var(--text-muted)" }}>Heritage, craft and cocktail culture — dispatches from behind the bar and inside the distillery.</p>
          </div>
          <div className="row g-4">
            <BlogCard href="/blog/the-story-behind-rumbaclaat" img={U("photo-1642963036562-affa2703f5ad")} badge="Heritage" title="The Story Behind Rumbaclaat" desc="From the Caribbean canefields to your glass — the origins of our brand." meta="Jan 20, 2025 · 6 min read" />
            <BlogCard href="/blog/the-art-of-rum-ageing" img={U("photo-1764699186296-9dac0ddb5edb")} badge="Craft" title="The Art of Rum Ageing" desc="Understanding the journey from distillate to reserve expression." meta="Jan 10, 2025 · 8 min read" />
            <BlogCard href="/blog/cocktail-culture-in-2025" img={U("photo-1767745455688-49391131f751")} badge="Cocktails" title="Cocktail Culture in 2025" desc="The trends shaping premium cocktail experiences worldwide." meta="Jan 5, 2025 · 5 min read" />
          </div>
          <div className="text-center mt-5 reveal">
            <Link href="/blog" className="btn btn-gold btn-lg">Read All Posts →</Link>
          </div>
        </div>
      </section>

      {/* Newsletter band */}
      <section className="section section--sunken home-newsletter reveal" aria-labelledby="newsletter-title">
        <div className="container">
          <div className="home-newsletter-card">
            <span className="eyebrow eyebrow-center">Letters from the Distillery</span>
            <h2 className="serif" id="newsletter-title">Join the Rumbaclaat list</h2>
            <p style={{ color: "var(--text-muted)" }}>A few emails a month. New releases, journal pieces, cocktail recipes, member events. No noise — unsubscribe whenever you like.</p>
            <form className="home-newsletter-row" action="/newsletter">
              <label htmlFor="hn-email" className="visually-hidden">Email address</label>
              <input className="form-control form-control-lg" type="email" id="hn-email" name="email" placeholder="you@example.com" autoComplete="email" />
              <button type="submit" className="btn btn-gold btn-lg">Subscribe →</button>
            </form>
            <p className="home-newsletter-help">By subscribing you confirm you&apos;re 18+ and accept our <Link href="/privacy">Privacy Policy</Link>.</p>
          </div>
        </div>
      </section>

      {/* Socials */}
      <section className="section home-socials reveal" aria-labelledby="follow-title">
        <div className="container">
          <div className="home-socials-inner">
            <div className="home-socials-copy">
              <span className="eyebrow">From Our Feed</span>
              <h2 className="serif" id="follow-title">Follow Rumbaclaat</h2>
              <p style={{ color: "var(--text-muted)" }}>Behind-the-bar moments, new cocktails, distillery dispatches, drops and member events. We post when there&apos;s something worth saying — never more.</p>
              <p className="home-socials-handle">@rumbaclaat</p>
            </div>
            <ul className="home-socials-grid list-unstyled" aria-label="Our social channels">
              <Social name="Instagram" meta="Stills + reels · 18.4k" href="https://www.instagram.com/" />
              <Social name="TikTok" meta="Cocktails & pours · 9.1k" href="https://www.tiktok.com/" />
              <Social name="Facebook" meta="Events & news · 5.6k" href="https://www.facebook.com/" />
              <Social name="LinkedIn" meta="Trade & press · 1.2k" href="https://www.linkedin.com/" />
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}

function FeaturedCard(props: {
  href: string; img: string; badge?: string; title: string; subtitle: string; desc: string; price: string; member: string; cta?: "view";
}) {
  return (
    <div className="col-12 col-md-6 col-lg-4">
      <article className="product-card reveal">
        <Link href={props.href} className="product-card-img-link" aria-label={`View ${props.title}`}>
          <div className="product-card-img">
            <img src={props.img} alt={props.title} loading="lazy" />
            {props.badge && <span className="badge-brand" style={{ position: "absolute", top: 12, left: 12 }}>{props.badge}</span>}
          </div>
        </Link>
        <div className="product-card-body">
          <div className="stars" aria-label="Rated 5 out of 5">★★★★★</div>
          <h3><Link href={props.href} style={{ color: "inherit", textDecoration: "none" }}>{props.title}</Link></h3>
          <p className="subtitle">{props.subtitle}</p>
          <p style={{ fontSize: ".8125rem" }}>{props.desc}</p>
          <div className="product-card-price">
            <div>
              <div className="price">{props.price}</div>
              <div className="price-member">{props.member}</div>
            </div>
            {props.cta === "view" ? (
              <Link href={props.href} className="btn btn-outline-gold btn-sm">View →</Link>
            ) : (
              <Link href={props.href} className="btn btn-outline-gold btn-sm">Add to Cart</Link>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}

function TierCard({ color, cls, name, price, perk, highlight }: { color: string; cls: string; name: string; price: string; perk: string; highlight?: boolean }) {
  return (
    <div className="col-6 col-lg-3">
      <div className="tier-strip-card reveal" style={highlight ? { borderColor: "var(--gold-md)" } : undefined}>
        <div style={{ fontSize: "1.5rem", color }} aria-hidden="true">✦</div>
        <div className={`tier-name ${cls}`}>{name}</div>
        <div className="tier-price">{price}</div>
        <p style={{ fontSize: ".75rem", marginTop: 6 }}>{perk}</p>
      </div>
    </div>
  );
}

function CocktailCard({ href, img, badge, title, desc }: { href: string; img: string; badge: string; title: string; desc: string }) {
  return (
    <div className="col-12 col-md-4">
      <Link className="img-overlay reveal d-block" href={href} style={{ aspectRatio: "3/4" }}>
        <img src={img} alt={title} loading="lazy" />
        <span className="img-overlay-text">
          <span className="badge-brand mb-2">{badge}</span>
          <span className="h4 d-block">{title}</span>
          <span className="d-block" style={{ fontSize: ".8125rem", color: "rgba(245,240,232,.82)" }}>{desc}</span>
        </span>
      </Link>
    </div>
  );
}

function BlogCard({ href, img, badge, title, desc, meta }: { href: string; img: string; badge: string; title: string; desc: string; meta: string }) {
  return (
    <div className="col-12 col-md-4">
      <article className="product-card reveal">
        <div className="product-card-img"><img src={img} alt={title} loading="lazy" /></div>
        <div className="product-card-body">
          <span className="badge-brand mb-2">{badge}</span>
          <h3 style={{ fontSize: "1.0625rem" }}><Link className="stretched-card-link gold" href={href}>{title}</Link></h3>
          <p style={{ fontSize: ".8125rem", marginTop: 6 }}>{desc}</p>
          <p style={{ fontSize: ".75rem", color: "var(--text-dim)", marginTop: 12 }}>{meta}</p>
        </div>
      </article>
    </div>
  );
}

function Social({ name, meta, href }: { name: string; meta: string; href: string }) {
  return (
    <li>
      <a href={href} rel="noopener" target="_blank" className="home-social">
        <span className="home-social-icon" aria-hidden="true">✦</span>
        <span className="home-social-text">
          <span className="home-social-name">{name}</span>
          <span className="home-social-meta">{meta}</span>
        </span>
      </a>
    </li>
  );
}
