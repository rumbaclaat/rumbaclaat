import Link from "next/link";

const TRUST = [
  "12+ Year Aged Expressions",
  "Free UK Shipping on £50+",
  "50,000+ Members",
  "Caribbean Heritage",
  "Award-Winning Distillery",
];

const TIERS = [
  { name: "Bronze", price: "Free", perk: "5% discount · 1× points", color: "var(--bronze)" },
  { name: "Silver", price: "£9.99/mo", perk: "10% off · 1.5× points", color: "var(--silver)" },
  { name: "Gold", price: "£24.99/mo", perk: "15% off · 2× points", color: "var(--gold)" },
  { name: "Black Reserve", price: "£54.99/mo", perk: "20% off · 3× points", color: "var(--gold)" },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div
          className="hero-bg"
          style={{
            backgroundImage:
              "linear-gradient(135deg,#1C1A14,#161310 60%,#0E0E0E)",
          }}
        />
        <div className="hero-overlay" />
        <div className="hero-content">
          <span className="eyebrow eyebrow-center">Premium Caribbean Rum</span>
          <h1>
            Born in the Caribbean.
            <br />
            <em className="gold">Bottled for the Bold.</em>
          </h1>
          <p className="hero-lede">
            Aged in American oak. Crafted with heritage. Rumbaclaat rum is a
            tribute to Caribbean culture, distilled into every drop.
          </p>
          <div className="d-flex gap-3 justify-content-center flex-wrap mt-4">
            <Link href="/shop-rum" className="btn btn-gold btn-lg">
              Shop Rum
            </Link>
            <Link href="/join" className="btn btn-outline-gold btn-lg">
              Join the Inner Circle
            </Link>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section style={{ background: "var(--bg-card)" }}>
        <div className="container">
          <ul className="trust-bar list-unstyled m-0">
            {TRUST.map((t) => (
              <li className="trust-item" key={t}>
                <span className="trust-icon" aria-hidden="true">
                  ✦
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Membership strip */}
      <section
        className="section"
        style={{
          background: "linear-gradient(135deg,#1C1A14,#161310)",
          borderTop: "1px solid var(--gold-bdr)",
          borderBottom: "1px solid var(--gold-bdr)",
        }}
      >
        <div className="container">
          <div className="text-center mb-5">
            <span className="eyebrow">Loyalty Programme</span>
            <h2>The Inner Circle of Rum</h2>
            <p style={{ maxWidth: 480, margin: "12px auto 0", color: "var(--text-muted)" }}>
              Four tiers. Exclusive perks. Member-only pricing. Join free —
              upgrade when ready.
            </p>
          </div>
          <div className="row g-3">
            {TIERS.map((tier) => (
              <div className="col-6 col-lg-3" key={tier.name}>
                <div className="card-brand text-center h-100">
                  <div style={{ fontSize: "1.5rem", color: tier.color }} aria-hidden="true">
                    ✦
                  </div>
                  <div className="serif" style={{ fontSize: "1.125rem", color: "var(--gold-hi)" }}>
                    {tier.name}
                  </div>
                  <div className="serif" style={{ fontSize: "1.5rem" }}>{tier.price}</div>
                  <p style={{ fontSize: ".75rem", marginTop: 6 }}>{tier.perk}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-5">
            <Link href="/join" className="btn btn-gold btn-lg">
              View All Plans &amp; Join →
            </Link>
          </div>
        </div>
      </section>

      {/* Dev status note (Phase 0 shell) */}
      <section className="section-sm">
        <div className="container">
          <div className="card-brand" style={{ maxWidth: 720, margin: "0 auto" }}>
            <span className="badge-brand">Phase 0 · Foundation</span>
            <h2 className="h4 mt-3">CMS platform — build in progress</h2>
            <p style={{ color: "var(--text-muted)", margin: 0 }}>
              This is the live Next.js + Supabase shell. Global header, footer,
              age gate and cookie consent are wired. Catalogue, CMS blocks,
              checkout, membership, trade and the GoHighLevel sync follow per the
              approved roadmap.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
