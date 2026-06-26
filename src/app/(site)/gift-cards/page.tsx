import Link from "next/link";

export const metadata = {
  title: "Gift Cards",
  description: "Rumbaclaat gift cards — use against any product. Values from £25 to £500, delivered by email, never expire.",
};

const VALUES = ["£25", "£50", "£75", "£100", "£200"];

export default function GiftCardsPage() {
  return (
    <section className="section">
      <div className="container">
        <header style={{ maxWidth: 720, marginInline: "auto", textAlign: "center", marginBottom: "clamp(36px, 5vw, 56px)" }}>
          <span className="eyebrow eyebrow-center">The Perfect Gift</span>
          <h1 className="serif" style={{ fontSize: "clamp(2rem, 4.4vw, 3.4rem)", margin: 0 }}>
            Rumbaclaat <em className="gold">Gift Cards</em>
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1.0625rem", lineHeight: 1.7, maxWidth: 600, margin: "18px auto 0" }}>
            For the rum-lover in your life. Use against any product — rum, apparel, or membership upgrades. Delivered by email instantly, or scheduled for the big day.
          </p>
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "clamp(20px, 3vw, 32px)",
            alignItems: "start",
            maxWidth: 940,
            marginInline: "auto",
          }}
        >
          {/* Preview card */}
          <div className="card-brand card-brand--feature" style={{ padding: "clamp(24px, 4vw, 36px)" }}>
            <div
              aria-hidden="true"
              style={{
                background: "linear-gradient(150deg, var(--gold-deep), var(--gold))",
                color: "var(--on-gold)",
                borderRadius: "var(--radius-lg)",
                padding: "clamp(22px, 4vw, 32px)",
                aspectRatio: "1.6",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 18px 40px rgba(0,0,0,.35)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontWeight: 700, letterSpacing: ".18em", fontSize: ".72rem", textTransform: "uppercase" }}>Rumbaclaat</span>
                <span style={{ fontWeight: 600, letterSpacing: ".18em", fontSize: ".66rem", textTransform: "uppercase", opacity: 0.85 }}>Gift Card</span>
              </div>
              <div className="serif" style={{ fontSize: "clamp(2.2rem, 6vw, 3rem)", fontWeight: 700, lineHeight: 1 }}>£100</div>
              <div style={{ fontFamily: "var(--sans)", fontSize: ".95rem", letterSpacing: ".18em", fontVariantNumeric: "tabular-nums", opacity: 0.9 }}>
                ····&nbsp;&nbsp;····&nbsp;&nbsp;····&nbsp;&nbsp;2026
              </div>
            </div>
            <ul className="list-unstyled" style={{ margin: "clamp(20px, 3vw, 28px) 0 0", display: "grid", gap: 12 }}>
              {[
                "Values from £25 to £500",
                "Email or printable PDF — your choice",
                "Schedule send for a birthday, anniversary or holiday",
                "Never expire",
              ].map((feat) => (
                <li key={feat} style={{ display: "flex", gap: 12, alignItems: "flex-start", color: "var(--text-muted)", lineHeight: 1.5 }}>
                  <span className="gold" aria-hidden="true" style={{ fontWeight: 700 }}>✓</span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Value picker card */}
          <div id="values" className="card-brand" style={{ padding: "clamp(24px, 4vw, 36px)" }}>
            <span className="eyebrow">Choose a value</span>
            <h2 className="serif" style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", marginTop: 0, marginBottom: 18 }}>
              Pick the amount
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {VALUES.map((v) => (
                <div
                  key={v}
                  className="serif"
                  style={{
                    flex: "1 0 80px",
                    textAlign: "center",
                    padding: "16px 12px",
                    borderRadius: 999,
                    border: "1px solid var(--gold-bdr)",
                    background: "var(--gold-lt)",
                    color: "var(--gold-hi)",
                    fontSize: "1.35rem",
                    fontWeight: 700,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {v}
                </div>
              ))}
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: ".9375rem", lineHeight: 1.7, marginTop: 22 }}>
              Custom values from £10 to £500. Online purchase is coming with the gift-card checkout — meanwhile{" "}
              <Link href="/contact" className="gold">contact us</Link> to buy.
            </p>
            <Link href="/contact" className="btn btn-gold btn-lg" style={{ marginTop: 8 }}>
              Contact us to buy →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
