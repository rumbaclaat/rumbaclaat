import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { parseLines, parsePairs } from "@/lib/blocks/registry";
import type { ContentBlock } from "@/generated/prisma/client";

function s(data: Record<string, unknown>, key: string): string {
  return data[key] == null ? "" : String(data[key]);
}

export default async function BlockRenderer({ block }: { block: ContentBlock }) {
  if (!block.visible) return null;
  const d = (block.data ?? {}) as Record<string, unknown>;

  switch (block.type) {
    case "hero_banner":
      return (
        <section className="hero">
          <div
            className="hero-bg"
            style={{
              backgroundImage: s(d, "backgroundImage")
                ? `url('${s(d, "backgroundImage")}')`
                : "linear-gradient(135deg,#1C1A14,#161310 60%,#0E0E0E)",
            }}
          />
          <div className="hero-overlay" />
          <div className="hero-content">
            {s(d, "eyebrow") && <span className="eyebrow eyebrow-center">{s(d, "eyebrow")}</span>}
            <h1>{s(d, "heading")}</h1>
            {s(d, "lede") && <p className="hero-lede">{s(d, "lede")}</p>}
            <div className="d-flex gap-3 justify-content-center flex-wrap mt-4">
              {s(d, "ctaLabel") && (
                <Link href={s(d, "ctaUrl") || "#"} className="btn btn-gold btn-lg">
                  {s(d, "ctaLabel")}
                </Link>
              )}
              {s(d, "cta2Label") && (
                <Link href={s(d, "cta2Url") || "#"} className="btn btn-outline-gold btn-lg">
                  {s(d, "cta2Label")}
                </Link>
              )}
            </div>
          </div>
        </section>
      );

    case "parallax_callout":
      return (
        <section
          className="hero"
          style={{ minHeight: "44vh" }}
        >
          <div
            className="hero-bg"
            style={{
              backgroundImage: s(d, "backgroundImage")
                ? `url('${s(d, "backgroundImage")}')`
                : "linear-gradient(135deg,#161310,#0E0E0E)",
            }}
          />
          <div className="hero-overlay" />
          <div className="hero-content">
            {s(d, "eyebrow") && <span className="eyebrow eyebrow-center">{s(d, "eyebrow")}</span>}
            <h2 style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)" }}>{s(d, "heading")}</h2>
            {s(d, "body") && <p className="hero-lede">{s(d, "body")}</p>}
          </div>
        </section>
      );

    case "rich_text":
      return (
        <section className="section-sm">
          <div className="container" style={{ maxWidth: 760 }}>
            <div dangerouslySetInnerHTML={{ __html: s(d, "html") }} />
          </div>
        </section>
      );

    case "trust_bar":
      return (
        <section style={{ background: "var(--bg-card)" }}>
          <div className="container">
            <ul className="trust-bar list-unstyled m-0">
              {parseLines(d.items).map((item, i) => (
                <li className="trust-item" key={i}>
                  <span className="trust-icon" aria-hidden="true">✦</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </section>
      );

    case "stat_block":
      return (
        <section className="section-sm">
          <div className="container">
            {s(d, "heading") && <h2 className="text-center mb-4">{s(d, "heading")}</h2>}
            <div className="row g-4 text-center">
              {parsePairs(d.stats).map((p, i) => (
                <div className="col-6 col-lg-3" key={i}>
                  <div className="serif" style={{ fontSize: "clamp(2rem,4vw,2.75rem)", color: "var(--gold-hi)" }}>{p.a}</div>
                  <div style={{ fontSize: ".8125rem", color: "var(--text-muted)" }}>{p.b}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case "two_col": {
      const imageRight = s(d, "imageSide") !== "left";
      const text = (
        <div className="col-md-6">
          {s(d, "heading") && <h2 className="mb-3">{s(d, "heading")}</h2>}
          <div dangerouslySetInnerHTML={{ __html: s(d, "body") }} />
        </div>
      );
      const image = (
        <div className="col-md-6">
          {s(d, "image") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s(d, "image")} alt={s(d, "heading")} style={{ borderRadius: "var(--radius-xl)", width: "100%" }} />
          ) : (
            <div style={{ aspectRatio: "4/3", borderRadius: "var(--radius-xl)", background: "var(--bg-card2)" }} />
          )}
        </div>
      );
      return (
        <section className="section">
          <div className="container">
            <div className="row g-4 align-items-center">
              {imageRight ? (<>{text}{image}</>) : (<>{image}{text}</>)}
            </div>
          </div>
        </section>
      );
    }

    case "card_grid":
      return (
        <section className="section">
          <div className="container">
            {s(d, "heading") && <h2 className="text-center mb-5">{s(d, "heading")}</h2>}
            <div className="row g-4">
              {parsePairs(d.cards).map((c, i) => (
                <div className="col-md-4" key={i}>
                  <div className="card-brand h-100">
                    <h3 className="h5 gold">{c.a}</h3>
                    <p style={{ color: "var(--text-muted)", margin: 0 }}>{c.b}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case "faq_accordion":
      return (
        <section className="section">
          <div className="container" style={{ maxWidth: 820 }}>
            {s(d, "heading") && <h2 className="text-center mb-5">{s(d, "heading")}</h2>}
            {parsePairs(d.items).map((p, i) => (
              <details key={i} className="card-brand mb-2">
                <summary style={{ cursor: "pointer", fontFamily: "var(--serif)", fontWeight: 600 }}>{p.a}</summary>
                <p style={{ color: "var(--text-muted)", marginTop: 10, marginBottom: 0 }}>{p.b}</p>
              </details>
            ))}
          </div>
        </section>
      );

    case "cta_band":
      return (
        <section className="section" style={{ background: "linear-gradient(135deg,#161208,#1C1A14,#0E0E0E)", textAlign: "center" }}>
          <div className="container" style={{ maxWidth: 760 }}>
            {s(d, "eyebrow") && <span className="eyebrow">{s(d, "eyebrow")}</span>}
            <h2 className="mb-3">{s(d, "heading")}</h2>
            {s(d, "body") && <p style={{ color: "var(--text-muted)", maxWidth: 480, margin: "0 auto 28px" }}>{s(d, "body")}</p>}
            {s(d, "ctaLabel") && (
              <Link href={s(d, "ctaUrl") || "#"} className="btn btn-gold btn-lg">{s(d, "ctaLabel")}</Link>
            )}
          </div>
        </section>
      );

    case "newsletter":
      return (
        <section className="section">
          <div className="container">
            <div className="card-brand text-center" style={{ maxWidth: 640, margin: "0 auto" }}>
              {s(d, "eyebrow") && <span className="eyebrow">{s(d, "eyebrow")}</span>}
              <h2 className="mb-2">{s(d, "heading")}</h2>
              {s(d, "body") && <p style={{ color: "var(--text-muted)" }}>{s(d, "body")}</p>}
              <form className="d-flex gap-2 justify-content-center flex-wrap mt-3">
                <input type="email" className="form-control" placeholder="you@example.com" style={{ maxWidth: 280 }} />
                <button type="submit" className="btn btn-gold">Subscribe</button>
              </form>
            </div>
          </div>
        </section>
      );

    case "membership_tiers": {
      const tiers = await prisma.membershipTier.findMany({ orderBy: { sortOrder: "asc" } });
      return (
        <section className="section" style={{ background: "linear-gradient(135deg,#1C1A14,#161310)", borderTop: "1px solid var(--gold-bdr)", borderBottom: "1px solid var(--gold-bdr)" }}>
          <div className="container">
            {s(d, "heading") && (
              <div className="text-center mb-5">
                <span className="eyebrow">RPM</span>
                <h2>{s(d, "heading")}</h2>
              </div>
            )}
            <div className="row g-3">
              {tiers.map((t) => (
                <div className="col-6 col-lg-3" key={t.id}>
                  <div className="card-brand text-center h-100">
                    <div className="serif gold" style={{ fontSize: "1.125rem" }}>{t.name}</div>
                    <div className="serif" style={{ fontSize: "1.5rem" }}>{t.isFree ? "Free" : `£${Number(t.priceMonthly).toFixed(2)}/mo`}</div>
                    <p style={{ fontSize: ".75rem", marginTop: 6 }}>{t.memberDiscountPct}% off · {Number(t.pointsMultiplier)}× points</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case "featured_products": {
      const limit = Number(d.limit) > 0 ? Number(d.limit) : 3;
      const products = await prisma.product.findMany({
        where: { status: "published" },
        orderBy: { createdAt: "desc" },
        take: limit,
      });
      return (
        <section className="section">
          <div className="container">
            {s(d, "heading") && <h2 className="text-center mb-5">{s(d, "heading")}</h2>}
            <div className="row g-4">
              {products.map((p) => (
                <div className="col-12 col-md-4" key={p.id}>
                  <Link href={`/product/${p.slug}`} className="card-brand d-block h-100 text-decoration-none">
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.imageUrl} alt={p.name} style={{ aspectRatio: "1", width: "100%", objectFit: "cover", borderRadius: "var(--radius)", marginBottom: 12 }} />
                    ) : (
                      <div style={{ aspectRatio: "1", borderRadius: "var(--radius)", background: "var(--bg-card3)", marginBottom: 12 }} />
                    )}
                    <h3 className="h6" style={{ color: "var(--text)" }}>{p.name}</h3>
                    {p.subtitle && <p style={{ fontSize: ".8125rem", color: "var(--text-muted)" }}>{p.subtitle}</p>}
                    <div className="serif gold" style={{ fontSize: "1.25rem" }}>£{Number(p.basePrice).toFixed(2)}</div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    default:
      return null;
  }
}
