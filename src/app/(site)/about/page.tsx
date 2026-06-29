/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import BlockRenderer from "@/components/blocks/block-renderer";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "About — Rumbaclaat",
  description:
    "The Rumbaclaat story: Caribbean heritage, craft distillation, and rum aged a minimum of 12 years in American oak.",
};

const U = (id: string, w = 800, q = false) =>
  `https://images.unsplash.com/${id}?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=${w}${q ? "&q=80" : ""}`;

const HERO_IMG = U("photo-1635771747900-a19e5c866031", 1800, true);
const STORY_IMG = U("photo-1635771747900-a19e5c866031", 800);
const PARALLAX_IMG = U("photo-1719469243598-0191cfae6f83", 1800, true);

const STATS = [
  { n: "1997", l: "Founded in Jamaica" },
  { n: "12+", l: "Years average age" },
  { n: "40+", l: "Countries distributed" },
  { n: "18+", l: "Awards won" },
];

const CRAFT = [
  { ic: "🌾", h: "Harvest", p: "Hand-selected sugarcane from our partner estates across Jamaica, Trinidad, and Barbados." },
  { ic: "🍶", h: "Distillation", p: "Pot still and column still blending creates the complex character that defines each expression." },
  { ic: "🪵", h: "Ageing", p: "American ex-bourbon oak barrels. Minimum 12 years. The climate does the rest — warm days accelerate maturation." },
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
    <>
      <section className="hero" style={{ minHeight: "60vh" }}>
        <div className="hero-bg" style={{ backgroundImage: `url('${HERO_IMG}')` }} />
        <div className="hero-overlay" />
        <div className="hero-content reveal">
          <span className="eyebrow eyebrow-center">OUR STORY</span>
          <h1>Born in the Caribbean.<br /><em className="gold">Built with purpose.</em></h1>
          <p className="hero-lede">A tribute to heritage, craft, and the people who shaped Caribbean rum culture across generations.</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 1060 }}>
          <div className="row g-5 align-items-center reveal">
            <div className="col-12 col-md-6">
              <span className="eyebrow">HERITAGE</span>
              <h2 className="mb-3">The Name Carries Weight</h2>
              <p className="mb-3">The name Rumbaclaat carries cultural, historical, and deeply personal weight. Born in the heart of the Caribbean, our rum tells the story of people, land, and craft that spans generations.</p>
              <p>Our founder, originally from Jamaica, grew up watching the rhythms of rum production — the harvest of sugarcane, the sweet smell of fermentation, and the patient art of ageing. Rumbaclaat is a tribute to that heritage.</p>
            </div>
            <div className="col-12 col-md-6">
              <img src={STORY_IMG} alt="Rum ageing in oak barrels in a warehouse" style={{ width: "100%", borderRadius: "var(--radius-xl)", aspectRatio: "4/3", objectFit: "cover" }} loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      <section style={{ background: "var(--bg-card)", borderTop: "1px solid var(--gold-bdr)", borderBottom: "1px solid var(--gold-bdr)" }} aria-label="Rumbaclaat by the numbers">
        <div className="container section-sm">
          <div className="row g-4 text-center reveal">
            {STATS.map((s) => (
              <div className="col-6 col-md-3" key={s.l}>
                <div style={{ fontFamily: "var(--serif)", fontSize: "2.75rem", fontWeight: 700, color: "var(--gold-hi)" }}>{s.n}</div>
                <p style={{ fontSize: ".875rem", marginTop: 6 }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="craft-title">
        <div className="container" style={{ maxWidth: 1060 }}>
          <div className="text-center reveal mb-5"><span className="eyebrow">THE CRAFT</span><h2 id="craft-title">From Cane to Cask</h2></div>
          <div className="row g-4">
            {CRAFT.map((c) => (
              <div className="col-12 col-md-4" key={c.h}>
                <div className="card-brand reveal text-center h-100">
                  <div style={{ fontSize: "2rem", marginBottom: 12 }} aria-hidden="true">{c.ic}</div>
                  <h3 className="h4 mb-2">{c.h}</h3>
                  <p style={{ fontSize: ".875rem" }}>{c.p}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="parallax-section" style={{ minHeight: 480, backgroundImage: `url('${PARALLAX_IMG}')` }} aria-labelledby="heritage-px">
        <div className="parallax-overlay" />
        <div className="parallax-content reveal"><span className="eyebrow eyebrow-center">CARIBBEAN HERITAGE</span><h2 id="heritage-px">Where the Sun<br />Meets the Sea</h2><p>Our roots run deep in the islands. Every expression carries the warmth, the colour, and the defiance of the Caribbean.</p></div>
      </section>

      <section style={{ padding: "80px 0", textAlign: "center", background: "linear-gradient(135deg,#15151B,#0E0E12)" }} aria-labelledby="join-cta">
        <div className="container reveal" style={{ maxWidth: 860 }}>
          <span className="eyebrow">JOIN US</span>
          <h2 id="join-cta" className="mb-3">Become Part of the Story</h2>
          <p style={{ maxWidth: 440, margin: "0 auto 32px" }}>The Inner Circle welcomes those who appreciate craft, heritage, and the slow, patient art of exceptional rum.</p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Link href="/join" className="btn btn-gold btn-lg">Join the Membership</Link>
            <Link href="/contact" className="btn btn-outline-gold btn-lg">Get in Touch</Link>
          </div>
        </div>
      </section>
    </>
  );
}
