/* eslint-disable @next/next/no-img-element */
import { prisma } from "@/lib/prisma";
import BlockRenderer from "@/components/blocks/block-renderer";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "About — Rumbaclaat",
  description:
    "The Rumbaclaat story: Caribbean heritage, craft distillation, and rum aged a minimum of 12 years in American oak.",
};

const STORY_IMG =
  "https://images.unsplash.com/photo-1582106245687-cbb466a9f07f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=900";

const VALUES = [
  { ic: "bi-droplet-half", h: "Patience", p: "No shortcuts. Time in the cask is what gives the rum its character." },
  { ic: "bi-globe-americas", h: "Heritage", p: "Rooted in Caribbean culture, from the canefields to the crest on every bottle." },
  { ic: "bi-award", h: "Craft", p: "Award-winning expressions, made to be shared and worn with pride." },
];

export default async function AboutPage() {
  // Editable about page: if a published "about" page with blocks exists, render it.
  // Otherwise fall back to this hand-built design.
  const aboutPage = await prisma.page.findFirst({
    where: { slug: "about", status: "published" },
    include: { blocks: { orderBy: { order: "asc" } } },
  });
  if (aboutPage && aboutPage.blocks.length > 0) {
    return <>{aboutPage.blocks.map((b) => <BlockRenderer key={b.id} block={b} />)}</>;
  }

  return (
    <div data-screen-label="About">
      <section
        style={{
          position: "relative",
          padding: "clamp(56px,8vw,104px) clamp(20px,5vw,40px) clamp(40px,6vw,64px)",
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
          <span
            style={{
              fontSize: ".74rem",
              letterSpacing: ".24em",
              textTransform: "uppercase",
              color: "var(--gold)",
              fontWeight: 600,
            }}
          >
            Our Story
          </span>
          <h1
            style={{
              fontFamily: "var(--serif)",
              fontWeight: 600,
              fontSize: "clamp(2.4rem,5.6vw,4rem)",
              lineHeight: 1.03,
              margin: "14px 0 0",
            }}
          >
            From the canefields
            <br />
            <span style={{ fontStyle: "italic", color: "var(--gold)" }}>to your glass</span>
          </h1>
          <p
            style={{
              color: "var(--muted)",
              fontSize: "1.08rem",
              lineHeight: 1.65,
              margin: "20px auto 0",
              maxWidth: 560,
            }}
          >
            Rumbaclaat began with a single idea — to bottle the spirit of the Caribbean, with patience and without
            compromise.
          </p>
        </div>
      </section>

      <section style={{ padding: "clamp(56px,7vw,96px) clamp(20px,5vw,40px)" }}>
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
              aspectRatio: "4/5",
              borderRadius: 16,
              overflow: "hidden",
              border: "1px solid var(--line)",
            }}
          >
            <img
              src={STORY_IMG}
              alt="Ageing casks"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              loading="lazy"
            />
          </div>
          <div>
            <span
              style={{
                fontSize: ".74rem",
                letterSpacing: ".24em",
                textTransform: "uppercase",
                color: "var(--gold)",
                fontWeight: 600,
              }}
            >
              Heritage &amp; craft
            </span>
            <h2
              style={{
                fontFamily: "var(--serif)",
                fontWeight: 600,
                fontSize: "clamp(1.9rem,3.8vw,2.7rem)",
                lineHeight: 1.1,
                margin: "14px 0 0",
              }}
            >
              Twelve years, minimum
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "1.02rem", lineHeight: 1.7, margin: "18px 0 0" }}>
              Distilled in Jamaica and aged in ex-bourbon American oak, every expression is a tribute to heritage. The
              Caribbean heat accelerates maturation — one year in Trinidad is worth three in Scotland — giving our rum
              its depth, warmth and unmistakable character.
            </p>
            <p style={{ color: "var(--muted)", fontSize: "1.02rem", lineHeight: 1.7, margin: "14px 0 0" }}>
              What began as a single cask is now a lifestyle brand worn behind the best bars in the country. The rum
              leads; the apparel follows. Both carry the same gold crest.
            </p>
          </div>
        </div>
      </section>

      <section style={{ padding: "0 clamp(20px,5vw,40px) clamp(64px,8vw,104px)" }}>
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 18,
          }}
        >
          {VALUES.map((v) => (
            <div
              key={v.h}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--line2)",
                borderRadius: 16,
                padding: "28px 24px",
              }}
            >
              <i className={`bi ${v.ic}`} style={{ color: "var(--gold)", fontSize: "1.5rem" }} />
              <h3 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "1.3rem", margin: "14px 0 0" }}>
                {v.h}
              </h3>
              <p style={{ color: "var(--muted)", fontSize: ".9rem", lineHeight: 1.6, margin: "8px 0 0" }}>{v.p}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
