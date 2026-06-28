import Link from "next/link";

export const metadata = {
  title: "FAQ",
  description: "Answers to common questions about Rumbaclaat orders, delivery, membership, products and your account.",
};

const GROUPS: { eyebrow: string; heading: string; items: { q: string; a: string }[] }[] = [
  {
    eyebrow: "Getting your order",
    heading: "Orders, delivery & returns",
    items: [
      { q: "How do I return an item?", a: "Email hello@rumbaclaat.com with your order number and we'll send return instructions. You pay return postage unless the item is faulty." },
      { q: "When will I get my refund?", a: "Refunds are issued within 14 days of us receiving the return, to your original payment method." },
      { q: "My bottle arrived damaged. What do I do?", a: "We're sorry. Email us within 48 hours with a photo of the damage and we'll arrange a replacement or refund — no need to return the damaged item." },
    ],
  },
  {
    eyebrow: "Rewards & tiers",
    heading: "Membership & points",
    items: [
      { q: "Is Bronze membership really free?", a: "Yes. Bronze gives you 5% off every order, 1× RPM points, birthday bonus and early newsletter access at no cost." },
      { q: "Can I cancel my paid membership?", a: "Anytime from your member portal. Cancellation takes effect at the end of your current billing period. New paid memberships have a 14-day money-back guarantee." },
      { q: "How do RPM points work?", a: "You earn points on every purchase, multiplied by your tier (1× Bronze, 1.5× Silver, 2× Gold, 3× Black Reserve). Redeem points for credits, products and experiences from the Rewards tab." },
      { q: "What happens when I upgrade tiers?", a: "Upgrades are immediate. You start earning at the new rate from your next purchase. Downgrades take effect at the end of your billing period." },
    ],
  },
  {
    eyebrow: "The rum itself",
    heading: "Products",
    items: [
      { q: "Where is Rumbaclaat made?", a: "Our Original Reserve is distilled in Jamaica and aged in American oak. Each expression comes from selected Caribbean distilleries — see each product page for origin details." },
      { q: "What's the ABV and bottle size?", a: "Original Reserve and Spiced Gold are 700ml; ABV varies by expression (43% Original Reserve, 40% Spiced Gold). Check the product page for the specific bottle." },
      { q: "Are there allergens or animal products?", a: "Our rums contain no allergens listed under UK FSA rules and are suitable for vegetarians. Spiced expressions may contain natural botanicals — see the product page ingredients." },
      { q: "How should I store opened rum?", a: "Upright, sealed, away from direct sunlight. An opened bottle keeps its character for around 6–12 months." },
    ],
  },
];

export default function FaqPage() {
  return (
    <>
      <section className="section-sm section--sunken">
        <div className="container reveal" style={{ maxWidth: 820 }}>
          <span className="eyebrow">Help Centre</span>
          <h1 className="serif" style={{ fontSize: "clamp(2rem, 4.4vw, 3.4rem)" }}>Frequently asked questions</h1>
          <p style={{ maxWidth: 560, marginTop: 14, color: "var(--text-muted)", fontSize: "1.0625rem", lineHeight: 1.7 }}>
            Everything about orders, delivery, membership and our rum. Can&apos;t find it? <Link href="/contact">Contact us</Link>.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 820 }}>
          {GROUPS.map((g) => (
            <div key={g.heading} style={{ marginBottom: 56 }}>
              <span className="eyebrow">{g.eyebrow}</span>
              <h2 className="serif" style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", marginBottom: 18 }}>{g.heading}</h2>

              <div className="d-flex flex-column gap-3">
                {g.items.map((it) => (
                  <details key={it.q} className="card-brand" style={{ padding: "18px 22px" }}>
                    <summary
                      className="serif"
                      style={{
                        cursor: "pointer",
                        fontSize: "1.2rem",
                        fontWeight: 600,
                        color: "var(--text)",
                        listStyle: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 16,
                      }}
                    >
                      <span>{it.q}</span>
                      <span aria-hidden="true" className="gold" style={{ fontSize: "1.4rem", lineHeight: 1, flexShrink: 0 }}>+</span>
                    </summary>
                    <p style={{ color: "var(--text-muted)", marginTop: 14, marginBottom: 0, fontSize: ".95rem", lineHeight: 1.7 }}>{it.a}</p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
