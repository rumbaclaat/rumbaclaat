/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

/**
 * Homepage hero — faithful reproduction of the Champagne prototype
 * (Storefront Redesign.dc.html, lines 70-91). Editorial split: copy on the
 * left, flagship bottle image with a "Flagship" tag on the right. Static —
 * no carousel interactivity in the prototype.
 */
const HERO_IMG =
  "https://images.unsplash.com/photo-1758871993077-e084cc7eca86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=900";

/** Inline chevron — matches the prototype's `bi bi-arrow-right`. */
function ArrowRight() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"
      />
    </svg>
  );
}

export default function HeroCarousel() {
  return (
    <section
      style={{
        position: "relative",
        padding:
          "clamp(64px,11vw,128px) clamp(20px,5vw,40px) clamp(56px,8vw,96px)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(120% 90% at 78% 18%, rgba(205,181,130,.16), transparent 56%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "relative",
          maxWidth: 1240,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1.05fr .95fr",
          gap: "clamp(28px,5vw,72px)",
          alignItems: "center",
        }}
      >
        <div>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
              fontSize: ".74rem",
              letterSpacing: ".24em",
              textTransform: "uppercase",
              color: "var(--gold)",
              fontWeight: 600,
            }}
          >
            — Premium Caribbean Rum
          </span>
          <h1
            style={{
              fontFamily: "var(--serif)",
              fontWeight: 600,
              fontSize: "clamp(2.7rem,6.2vw,4.6rem)",
              lineHeight: 1.02,
              letterSpacing: "-.01em",
              margin: "20px 0 0",
            }}
          >
            Born in the Caribbean.
            <br />
            <span style={{ color: "var(--gold)", fontStyle: "italic" }}>
              Bottled for the Bold.
            </span>
          </h1>
          <p
            style={{
              color: "var(--muted)",
              fontSize: "clamp(1rem,1.5vw,1.18rem)",
              lineHeight: 1.6,
              maxWidth: 480,
              margin: "22px 0 0",
            }}
          >
            Aged in American oak. Crafted with heritage. A tribute to Caribbean
            culture, distilled into every drop.
          </p>
          <div
            style={{
              display: "flex",
              gap: 13,
              flexWrap: "wrap",
              marginTop: 34,
            }}
          >
            <Link
              href="/shop"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                background: "var(--gold)",
                color: "var(--onGold)",
                borderRadius: 999,
                padding: "14px 30px",
                fontSize: ".95rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Shop Rum <ArrowRight />
            </Link>
            <Link
              href="/join"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                border: "1px solid var(--line)",
                color: "var(--text)",
                borderRadius: 999,
                padding: "14px 28px",
                fontSize: ".95rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Join the Inner Circle
            </Link>
          </div>
        </div>
        <div
          style={{
            position: "relative",
            aspectRatio: "4/5",
            borderRadius: 18,
            overflow: "hidden",
            border: "1px solid var(--line)",
            background: "linear-gradient(160deg,#241d12,#0E0E12)",
          }}
        >
          <img
            src={HERO_IMG}
            alt="Rumbaclaat Original Reserve"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.96,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 20,
              bottom: 20,
              background: "color-mix(in srgb,var(--bg) 72%,transparent)",
              backdropFilter: "blur(8px)",
              border: "1px solid var(--line)",
              borderRadius: 12,
              padding: "12px 16px",
            }}
          >
            <div
              style={{
                fontSize: ".66rem",
                letterSpacing: ".16em",
                textTransform: "uppercase",
                color: "var(--gold)",
              }}
            >
              Flagship
            </div>
            <div
              style={{
                fontFamily: "var(--serif)",
                fontSize: "1.2rem",
                marginTop: 2,
              }}
            >
              Original Reserve · 12 Yr
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
