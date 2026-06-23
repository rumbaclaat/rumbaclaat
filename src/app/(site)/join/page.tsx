import Link from "next/link";
import MembershipTiers from "@/components/membership/membership-tiers";

export const metadata = {
  title: "Membership",
  description: "Join the Rumbaclaat Inner Circle. Four loyalty tiers from free Bronze to Black Reserve, with member pricing and exclusive drops.",
};

const STATS = [
  { n: "50K+", l: "Active Members" },
  { n: "4", l: "Exclusive Tiers" },
  { n: "3×", l: "Max Points Multiplier" },
  { n: "£0", l: "To Join Bronze" },
];

const STEPS = [
  { n: "01", h: "Join", p: "Create a free account — instantly enrolled at Bronze. No card required. Higher tiers from £9.99/month." },
  { n: "02", h: "Shop & Earn", p: "Every purchase earns points. Your tier multiplier increases the rate — up to 3× per bottle." },
  { n: "03", h: "Redeem", p: "Use points for discounts, free shipping, exclusive experiences, or unlock member-only drops first." },
];

const FAQ = [
  { q: "Is Bronze membership really free?", a: "Yes — Bronze is completely free. Create an account and you are automatically enrolled, gaining instant access to member discounts and points earning." },
  { q: "How do I earn loyalty points?", a: "You earn points on every purchase, plus bonus points for referrals, reviews, and birthday rewards. Higher tiers multiply your points by up to 3×." },
  { q: "Can I upgrade or downgrade at any time?", a: "Yes. Upgrades are instant. Downgrades take effect at the end of your current billing cycle so you are never penalised." },
  { q: "What payment methods are accepted?", a: "All major credit and debit cards via Stripe, plus PayPal and Google Pay." },
  { q: "Will my points ever expire?", a: "Points are valid for 24 months from the date earned. We send reminders before any points expire." },
  { q: "Is there a minimum commitment on paid tiers?", a: "No — monthly billing has no minimum term. Annual plans offer 2 free months. Full refund within 14 days." },
];

export default function JoinPage() {
  return (
    <>
      <section className="hero">
        <div className="hero-bg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1579042952429-66db7c5cc528?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1800&q=80')" }} />
        <div className="hero-overlay" />
        <div className="hero-content reveal">
          <span className="eyebrow eyebrow-center">Rumbaclaat Loyalty Programme</span>
          <h1>The Inner Circle<br /><em className="gold">of Rum.</em></h1>
          <p className="hero-lede">Four tiers. Exclusive drops. Member-only pricing. Points that multiply with every purchase. Join free or unlock premium access from £9.99/month.</p>
          <div className="d-flex gap-3 justify-content-center flex-wrap mt-4">
            <Link href="#plans" className="btn btn-gold btn-lg">✦ View All Plans</Link>
            <Link href="/account" className="btn btn-outline-gold btn-lg">Sign In to Dashboard →</Link>
          </div>
        </div>
      </section>

      <section style={{ background: "rgba(198,167,94,.04)", borderTop: "1px solid var(--gold-bdr)", borderBottom: "1px solid var(--gold-bdr)" }} aria-label="Membership at a glance">
        <div className="container">
          <div className="row g-4 text-center reveal" style={{ padding: "44px 0" }}>
            {STATS.map((s) => (
              <div className="col-6 col-lg-3" key={s.l}>
                <div className="serif" style={{ fontSize: "clamp(2rem,4vw,2.75rem)", fontWeight: 700, color: "var(--gold-hi)" }}>{s.n}</div>
                <p style={{ fontSize: ".8125rem", marginTop: 6 }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="text-center reveal mb-5"><span className="eyebrow">The Programme</span><h2>Rewards that grow with you</h2></div>
          <div className="row g-4">
            {STEPS.map((s) => (
              <div className="col-12 col-md-4" key={s.n}>
                <div className="card-brand reveal text-center h-100">
                  <div className="serif" style={{ fontSize: "3rem", fontWeight: 700, color: "rgba(212,184,120,.65)", lineHeight: 1, marginBottom: 12 }}>{s.n}</div>
                  <h3 style={{ fontSize: "1.375rem", marginBottom: 10 }}>{s.h}</h3>
                  <p style={{ color: "var(--text-muted)" }}>{s.p}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="parallax-section" style={{ minHeight: 320, backgroundImage: "url('https://images.unsplash.com/photo-1635771747900-a19e5c866031?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1800&q=80')" }}>
        <div className="parallax-overlay" />
        <div className="parallax-content reveal"><h2>Some Things Improve<br />with Patience</h2><p style={{ color: "var(--text-muted)" }}>Your membership is one of them.</p></div>
      </section>

      <section className="section">
        <MembershipTiers />
      </section>

      <section className="section" style={{ background: "var(--bg-card)", borderTop: "1px solid var(--gold-bdr)" }}>
        <div className="container" style={{ maxWidth: 860 }}>
          <div className="text-center reveal mb-5"><span className="eyebrow">FAQs</span><h2>Questions answered</h2></div>
          {FAQ.map((f) => (
            <details key={f.q} className="card-brand mb-2">
              <summary style={{ cursor: "pointer", fontFamily: "var(--serif)", fontWeight: 600 }}>{f.q}</summary>
              <p style={{ color: "var(--text-muted)", marginTop: 10, marginBottom: 0 }}>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section style={{ padding: "90px 0", textAlign: "center", background: "linear-gradient(135deg,#161208,#1C1A14,#0E0E0E)" }}>
        <div className="container reveal" style={{ maxWidth: 860 }}>
          <div style={{ fontSize: "2rem", marginBottom: 16, color: "var(--gold)" }} aria-hidden="true">✦</div>
          <span className="eyebrow">Start Today</span>
          <h2 className="mb-3">Join for free.<br /><em className="gold">Upgrade when ready.</em></h2>
          <p style={{ maxWidth: 440, margin: "0 auto 36px", color: "var(--text-muted)" }}>Bronze membership is permanently free. No credit card. No commitment. Upgrade anytime — cancel anytime.</p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Link href="/account" className="btn btn-gold btn-lg">✦ Join Free — Bronze</Link>
            <Link href="#plans" className="btn btn-outline-gold btn-lg">See all plans →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
