/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { CSSProperties } from "react";
import { prisma } from "@/lib/prisma";
import BlockRenderer from "@/components/blocks/block-renderer";
import HeroCarousel from "@/components/home/hero-carousel";

export const dynamic = "force-dynamic";

const U = (id: string, w = 800) =>
  `https://images.unsplash.com/${id}?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=${w}`;

/** Inline chevron — matches the prototype's `bi bi-arrow-right`. */
function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"
      />
    </svg>
  );
}

/** Inline tick — matches the prototype's `bi bi-check-lg`. */
function CheckLg({ color }: { color: string }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 16 16"
      fill={color}
      aria-hidden="true"
      style={{ flex: "none" }}
    >
      <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022z" />
    </svg>
  );
}

const SECTION_PAD = "clamp(72px,9vw,120px) clamp(20px,5vw,40px)";
const WRAP_1240: CSSProperties = { maxWidth: 1240, margin: "0 auto" };
const EYEBROW: CSSProperties = {
  fontSize: ".74rem",
  letterSpacing: ".24em",
  textTransform: "uppercase",
  color: "var(--gold)",
  fontWeight: 600,
};
const SECTION_HEAD: CSSProperties = {
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: 24,
  flexWrap: "wrap",
  marginBottom: 44,
};
const SECTION_LINK: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  border: "1px solid var(--line)",
  color: "var(--text)",
  borderRadius: 999,
  padding: "11px 22px",
  fontSize: ".86rem",
  fontWeight: 600,
  textDecoration: "none",
  whiteSpace: "nowrap",
};
const H2: CSSProperties = {
  fontFamily: "var(--serif)",
  fontWeight: 600,
  fontSize: "clamp(2rem,4.2vw,3rem)",
  lineHeight: 1.08,
  margin: "14px 0 0",
};

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

  return (
    <>
      {/* HERO */}
      <HeroCarousel />

      {/* TRUST STRIP */}
      <section
        style={{
          borderTop: "1px solid var(--line2)",
          borderBottom: "1px solid var(--line2)",
          background: "var(--surface)",
        }}
      >
        <div
          style={{
            ...WRAP_1240,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "clamp(16px,4vw,52px)",
            padding: "18px clamp(20px,5vw,40px)",
          }}
        >
          {[
            "12+ Year Aged Expressions",
            "Free UK Shipping on £50+",
            "50,000+ Members",
            "Caribbean Heritage",
            "Award-Winning Distillery",
          ].map((t) => (
            <span
              key={t}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                fontSize: ".82rem",
                color: "var(--muted)",
              }}
            >
              <span style={{ color: "var(--gold)" }}>✦</span>
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* STORY: PATIENCE (editorial split) */}
      <section style={{ padding: SECTION_PAD }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "clamp(32px,6vw,80px)",
            alignItems: "center",
          }}
        >
          <div
            style={{
              position: "relative",
              aspectRatio: "5/4",
              borderRadius: 16,
              overflow: "hidden",
              border: "1px solid var(--line)",
            }}
          >
            <img
              src={U("photo-1582106245687-cbb466a9f07f", 1000)}
              alt="Oak casks ageing"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div>
            <span style={EYEBROW}>Aged in American Oak</span>
            <h2
              style={{
                fontFamily: "var(--serif)",
                fontWeight: 600,
                fontSize: "clamp(2rem,4.2vw,3.1rem)",
                lineHeight: 1.08,
                margin: "16px 0 0",
              }}
            >
              Patience is the
              <br />
              <span style={{ fontStyle: "italic", color: "var(--gold)" }}>
                Secret Ingredient
              </span>
            </h2>
            <p
              style={{
                color: "var(--muted)",
                fontSize: "1.05rem",
                lineHeight: 1.7,
                maxWidth: 440,
                margin: "20px 0 0",
              }}
            >
              Twelve years minimum. Caribbean heat accelerates maturation — one
              year in Trinidad is worth three in Scotland.
            </p>
            <Link
              href="/blog"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                color: "var(--goldHi)",
                fontWeight: 600,
                fontSize: ".92rem",
                marginTop: 26,
                textDecoration: "none",
              }}
            >
              Read our craft story <ArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* SIGNATURE COLLECTION (raised band) */}
      <section
        style={{
          padding: SECTION_PAD,
          background: "var(--surface)",
          borderTop: "1px solid var(--line2)",
          borderBottom: "1px solid var(--line2)",
        }}
      >
        <div style={WRAP_1240}>
          <div style={SECTION_HEAD}>
            <div>
              <span style={EYEBROW}>Signature Collection</span>
              <h2
                style={{
                  fontFamily: "var(--serif)",
                  fontWeight: 600,
                  fontSize: "clamp(2rem,4.2vw,3rem)",
                  lineHeight: 1.08,
                  margin: "14px 0 0",
                }}
              >
                From the cask to the wardrobe
              </h2>
              <p
                style={{
                  color: "var(--muted)",
                  fontSize: "1.02rem",
                  lineHeight: 1.6,
                  maxWidth: 520,
                  margin: "14px 0 0",
                }}
              >
                Two Caribbean expressions and the apparel we wear behind the
                bar. Pick a flagship from each side of the brand.
              </p>
            </div>
            <Link href="/shop" style={SECTION_LINK}>
              View full collection <ArrowRight />
            </Link>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 22,
            }}
          >
            <FeaturedCard
              href="/product/original-reserve"
              img={U("photo-1758871993077-e084cc7eca86")}
              tag="12 Year"
              name="Original Reserve"
              variant="12 Year Aged Rum — Jamaica"
              notes="Vanilla, toasted caramel, tropical fruit. A long, warming finish that defines the Rumbaclaat character."
              price="£49.99"
              member="Members from £42.49"
              cta="add"
            />
            <FeaturedCard
              href="/product/spiced-gold"
              img={U("photo-1764699186296-9dac0ddb5edb")}
              tag="Spiced"
              name="Spiced Gold"
              variant="Signature Spiced Expression — Barbados"
              notes="Cinnamon, orange peel, warm spice & honey. The perfect companion for any occasion."
              price="£38.99"
              member="Members from £33.14"
              cta="add"
            />
            <FeaturedCard
              href="/product/gold-label-hoodie"
              img={U("photo-1499971442178-8c10fdf5f6ac")}
              tag="Apparel"
              name="Gold Label Hoodie"
              variant="Heavyweight French Terry — 3 colourways"
              notes="450gsm garment-washed fleece. Embroidered gold crest. Cut for a relaxed fit."
              price="£95.00"
              member="Members from £80.75"
              cta="view"
            />
          </div>
        </div>
      </section>

      {/* INNER CIRCLE */}
      <section style={{ position: "relative", padding: SECTION_PAD, overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(90% 80% at 50% 0%, rgba(205,181,130,.1), transparent 60%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ textAlign: "center", maxWidth: 620, margin: "0 auto 48px" }}>
            <span style={EYEBROW}>Loyalty Programme</span>
            <h2 style={H2}>Members get more</h2>
            <p
              style={{
                color: "var(--muted)",
                fontSize: "1.02rem",
                lineHeight: 1.6,
                margin: "14px 0 0",
              }}
            >
              Four tiers. Exclusive perks. Member-only pricing. Join free —
              upgrade when you&apos;re ready.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 16,
            }}
          >
            <TierCard
              name="Bronze"
              price="Free"
              perk1="5% member discount"
              perk2="1× loyalty points"
            />
            <TierCard
              name="Silver"
              price="£9.99/mo"
              perk1="10% member discount"
              perk2="1.5× loyalty points"
            />
            <TierCard
              name="Gold"
              price="£24.99/mo"
              perk1="15% member discount"
              perk2="2× loyalty points"
              featured
            />
            <TierCard
              name="Black Reserve"
              price="£54.99/mo"
              perk1="20% member discount"
              perk2="3× loyalty points"
            />
          </div>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <Link
              href="/join"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                background: "var(--gold)",
                color: "var(--onGold)",
                borderRadius: 999,
                padding: "14px 32px",
                fontSize: ".95rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              View all plans &amp; join <ArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* COCKTAILS (raised band) */}
      <section
        style={{
          padding: SECTION_PAD,
          background: "var(--surface)",
          borderTop: "1px solid var(--line2)",
          borderBottom: "1px solid var(--line2)",
        }}
      >
        <div style={WRAP_1240}>
          <div style={SECTION_HEAD}>
            <div>
              <span style={EYEBROW}>Cocktail Recipes</span>
              <h2 style={H2}>Mix it up</h2>
            </div>
            <Link href="/cocktails" style={SECTION_LINK}>
              View all recipes <ArrowRight />
            </Link>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 22,
            }}
          >
            <CocktailCard
              href="/cocktails/rumbaclaat-sour"
              img={U("photo-1748674755168-266c309d4712", 600)}
              level="Easy"
              time="5 mins"
              name="Rumbaclaat Sour"
              desc="Fresh lime, egg white, bitters. Elegant aperitif."
            />
            <CocktailCard
              href="/cocktails"
              img={U("photo-1767745455688-49391131f751", 600)}
              level="Medium"
              time="8 mins"
              name="Dark & Smoky"
              desc="Mezcal, dark honey, mole bitters. An evening classic."
            />
            <CocktailCard
              href="/cocktails/old-fashioned"
              img={U("photo-1609189123897-42db027571c9", 600)}
              level="Easy"
              time="4 mins"
              name="Caribbean Old Fashioned"
              desc="Demerara sugar, bitters, orange peel. Timeless."
            />
          </div>
        </div>
      </section>

      {/* BLOG */}
      <section style={{ padding: SECTION_PAD }}>
        <div style={WRAP_1240}>
          <div style={SECTION_HEAD}>
            <div>
              <span style={EYEBROW}>Journal</span>
              <h2 style={H2}>Stories &amp; Craft</h2>
            </div>
            <Link href="/blog" style={SECTION_LINK}>
              All stories <ArrowRight />
            </Link>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 22,
            }}
          >
            <BlogCard
              href="/blog/the-story-behind-rumbaclaat"
              img={U("photo-1642963036562-affa2703f5ad")}
              cat="Heritage"
              title="The Story Behind Rumbaclaat"
              excerpt="From the Caribbean canefields to your glass — the origins of our brand."
            />
            <BlogCard
              href="/blog/the-art-of-rum-ageing"
              img={U("photo-1764699186296-9dac0ddb5edb")}
              cat="Craft"
              title="The Art of Rum Ageing"
              excerpt="Understanding the journey from distillate to reserve expression."
            />
            <BlogCard
              href="/blog/cocktail-culture-in-2025"
              img={U("photo-1767745455688-49391131f751")}
              cat="Cocktails"
              title="Cocktail Culture in 2025"
              excerpt="The trends shaping premium cocktail experiences worldwide."
            />
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section
        style={{
          padding: "clamp(20px,5vw,40px) clamp(20px,5vw,40px) clamp(72px,9vw,110px)",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            position: "relative",
            border: "1px solid var(--line)",
            borderRadius: 22,
            overflow: "hidden",
            background:
              "linear-gradient(135deg, rgba(205,181,130,.14), var(--surface) 60%)",
            padding: "clamp(40px,6vw,72px) clamp(28px,5vw,64px)",
            textAlign: "center",
          }}
        >
          <span style={EYEBROW}>Join the list</span>
          <h2
            style={{
              fontFamily: "var(--serif)",
              fontWeight: 600,
              fontSize: "clamp(1.9rem,3.8vw,2.7rem)",
              lineHeight: 1.1,
              margin: "14px 0 0",
            }}
          >
            Drop alerts, recipes &amp; member events
          </h2>
          <p
            style={{
              color: "var(--muted)",
              fontSize: "1rem",
              margin: "12px auto 0",
              maxWidth: 460,
            }}
          >
            No spam — just good rum and the occasional cocktail worth your
            evening.
          </p>
          <form
            action="/newsletter"
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              justifyContent: "center",
              marginTop: 28,
              maxWidth: 480,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            <label htmlFor="hn-email" className="visually-hidden">
              Email address
            </label>
            <input
              id="hn-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@email.com"
              style={{
                flex: "1 1 220px",
                background: "var(--bg)",
                border: "1px solid var(--line)",
                color: "var(--text)",
                borderRadius: 999,
                padding: "14px 22px",
                fontSize: ".92rem",
                outline: "none",
                fontFamily: "var(--sans)",
              }}
            />
            <button
              type="submit"
              style={{
                background: "var(--gold)",
                color: "var(--onGold)",
                border: "none",
                borderRadius: 999,
                padding: "14px 28px",
                fontSize: ".92rem",
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

function FeaturedCard(props: {
  href: string;
  img: string;
  tag: string;
  name: string;
  variant: string;
  notes: string;
  price: string;
  member: string;
  cta: "add" | "view";
}) {
  return (
    <div
      style={{
        background: "var(--bg)",
        border: "1px solid var(--line2)",
        borderRadius: 16,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Link
        href={props.href}
        aria-label={`View ${props.name}`}
        style={{
          position: "relative",
          aspectRatio: "1",
          overflow: "hidden",
          background: "var(--card)",
          display: "block",
        }}
      >
        <img
          src={props.img}
          alt={props.name}
          loading="lazy"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <span
          style={{
            position: "absolute",
            top: 13,
            left: 13,
            background: "color-mix(in srgb,var(--bg) 72%,transparent)",
            backdropFilter: "blur(6px)",
            border: "1px solid var(--line)",
            borderRadius: 999,
            padding: "4px 11px",
            fontSize: ".68rem",
            fontWeight: 600,
            color: "var(--goldHi)",
            letterSpacing: ".04em",
          }}
        >
          {props.tag}
        </span>
      </Link>
      <div
        style={{
          padding: "20px 20px 22px",
          display: "flex",
          flexDirection: "column",
          flex: "1 1 auto",
        }}
      >
        <div style={{ color: "var(--gold)", fontSize: ".78rem", letterSpacing: ".04em" }}>
          ★★★★★
        </div>
        <h3
          style={{
            fontFamily: "var(--serif)",
            fontWeight: 600,
            fontSize: "1.35rem",
            margin: "7px 0 0",
          }}
        >
          <Link href={props.href} style={{ color: "inherit", textDecoration: "none" }}>
            {props.name}
          </Link>
        </h3>
        <div style={{ color: "var(--dim)", fontSize: ".82rem", marginTop: 3 }}>
          {props.variant}
        </div>
        <p
          style={{
            color: "var(--muted)",
            fontSize: ".88rem",
            lineHeight: 1.55,
            margin: "12px 0 0",
            flex: "1 1 auto",
          }}
        >
          {props.notes}
        </p>
        <div style={{ display: "flex", alignItems: "baseline", gap: 9, marginTop: 18 }}>
          <span
            style={{ fontFamily: "var(--serif)", fontSize: "1.4rem", color: "var(--text)" }}
          >
            {props.price}
          </span>
          <span style={{ fontSize: ".76rem", color: "var(--gold)" }}>{props.member}</span>
        </div>
        <Link
          href={props.href}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginTop: 16,
            borderRadius: 999,
            padding: 11,
            fontSize: ".86rem",
            fontWeight: 600,
            textDecoration: "none",
            ...(props.cta === "add"
              ? { background: "var(--gold)", color: "var(--onGold)" }
              : { border: "1px solid var(--line)", color: "var(--text)" }),
          }}
        >
          {props.cta === "add" ? "Add to cart" : "View product"}
        </Link>
      </div>
    </div>
  );
}

function TierCard({
  name,
  price,
  perk1,
  perk2,
  featured,
}: {
  name: string;
  price: string;
  perk1: string;
  perk2: string;
  featured?: boolean;
}) {
  return (
    <div
      style={{
        position: "relative",
        background: featured ? "var(--card)" : "var(--surface2)",
        border: featured ? "1px solid var(--gold)" : "1px solid var(--line2)",
        borderRadius: 16,
        padding: "26px 22px",
      }}
    >
      {featured && (
        <span
          style={{
            position: "absolute",
            top: -11,
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--gold)",
            color: "var(--onGold)",
            fontSize: ".64rem",
            fontWeight: 700,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            borderRadius: 999,
            padding: "4px 12px",
            whiteSpace: "nowrap",
          }}
        >
          Most popular
        </span>
      )}
      <div
        style={{
          fontSize: ".74rem",
          letterSpacing: ".14em",
          textTransform: "uppercase",
          color: "var(--dim)",
        }}
      >
        {name}
      </div>
      <div
        style={{
          fontFamily: "var(--serif)",
          fontSize: "1.7rem",
          color: "var(--text)",
          marginTop: 8,
          lineHeight: 1,
        }}
      >
        {price}
      </div>
      <div style={{ height: 1, background: "var(--line2)", margin: "16px 0" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            fontSize: ".86rem",
            color: "var(--muted)",
          }}
        >
          <CheckLg color="var(--gold)" />
          {perk1}
        </span>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            fontSize: ".86rem",
            color: "var(--muted)",
          }}
        >
          <CheckLg color="var(--gold)" />
          {perk2}
        </span>
      </div>
    </div>
  );
}

function CocktailCard({
  href,
  img,
  level,
  time,
  name,
  desc,
}: {
  href: string;
  img: string;
  level: string;
  time: string;
  name: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      style={{
        position: "relative",
        aspectRatio: "3/4",
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid var(--line2)",
        textDecoration: "none",
        display: "block",
      }}
    >
      <img
        src={img}
        alt={name}
        loading="lazy"
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(8,8,10,.92) 6%, rgba(8,8,10,.1) 56%)",
        }}
      />
      <div style={{ position: "absolute", left: 18, right: 18, bottom: 18 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 9 }}>
          <span
            style={{
              background: "var(--goldLt)",
              border: "1px solid var(--line)",
              color: "var(--goldHi)",
              fontSize: ".66rem",
              fontWeight: 600,
              borderRadius: 999,
              padding: "3px 10px",
            }}
          >
            {level}
          </span>
          <span
            style={{
              background: "color-mix(in srgb,var(--bg) 60%,transparent)",
              color: "var(--muted)",
              fontSize: ".66rem",
              borderRadius: 999,
              padding: "3px 10px",
            }}
          >
            {time}
          </span>
        </div>
        <h3
          style={{
            fontFamily: "var(--serif)",
            fontWeight: 600,
            fontSize: "1.4rem",
            color: "var(--text)",
            margin: 0,
          }}
        >
          {name}
        </h3>
        <div style={{ color: "var(--muted)", fontSize: ".82rem", marginTop: 3 }}>
          {desc}
        </div>
      </div>
    </Link>
  );
}

function BlogCard({
  href,
  img,
  cat,
  title,
  excerpt,
}: {
  href: string;
  img: string;
  cat: string;
  title: string;
  excerpt: string;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
      }}
    >
      <div
        style={{
          aspectRatio: "3/2",
          borderRadius: 14,
          overflow: "hidden",
          border: "1px solid var(--line2)",
          marginBottom: 16,
        }}
      >
        <img
          src={img}
          alt={title}
          loading="lazy"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      <span
        style={{
          fontSize: ".7rem",
          letterSpacing: ".14em",
          textTransform: "uppercase",
          color: "var(--gold)",
        }}
      >
        {cat}
      </span>
      <h3
        style={{
          fontFamily: "var(--serif)",
          fontWeight: 600,
          fontSize: "1.3rem",
          color: "var(--text)",
          margin: "8px 0 0",
          lineHeight: 1.2,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          color: "var(--muted)",
          fontSize: ".88rem",
          lineHeight: 1.55,
          margin: "8px 0 0",
        }}
      >
        {excerpt}
      </p>
    </Link>
  );
}
