import Link from "next/link";

export const metadata = {
  title: "FAQ",
  description: "Answers to common questions about Rumbaclaat orders, delivery, membership, products and your account.",
};

const GROUPS: { heading: string; items: { q: string; a: string }[] }[] = [
  {
    heading: "Orders, delivery & returns",
    items: [
      { q: "How do I return an item?", a: "Email hello@rumbaclaat.com with your order number and we'll send return instructions. You pay return postage unless the item is faulty." },
      { q: "When will I get my refund?", a: "Refunds are issued within 14 days of us receiving the return, to your original payment method." },
      { q: "My bottle arrived damaged. What do I do?", a: "We're sorry. Email us within 48 hours with a photo of the damage and we'll arrange a replacement or refund — no need to return the damaged item." },
    ],
  },
  {
    heading: "Membership & points",
    items: [
      { q: "Is Bronze membership really free?", a: "Yes. Bronze gives you 5% off every order, 1× loyalty points, birthday bonus and early newsletter access at no cost." },
      { q: "Can I cancel my paid membership?", a: "Anytime from your member portal. Cancellation takes effect at the end of your current billing period. New paid memberships have a 14-day money-back guarantee." },
      { q: "How do loyalty points work?", a: "You earn points on every purchase, multiplied by your tier (1× Bronze, 1.5× Silver, 2× Gold, 3× Black Reserve). Redeem points for credits, products and experiences from the Rewards tab." },
      { q: "What happens when I upgrade tiers?", a: "Upgrades are immediate. You start earning at the new rate from your next purchase. Downgrades take effect at the end of your billing period." },
    ],
  },
  {
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
      <section className="section-sm" style={{ background: "linear-gradient(135deg,#161208,#0E0E0E)", borderBottom: "1px solid var(--gold-bdr)" }}>
        <div className="container reveal">
          <span className="eyebrow">Help Centre</span>
          <h1>Frequently asked questions</h1>
          <p style={{ maxWidth: 480, marginTop: 10, color: "var(--text-muted)" }}>Everything about orders, delivery, membership and our rum. Can&apos;t find it? <Link href="/contact">Contact us</Link>.</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 860 }}>
          {GROUPS.map((g) => (
            <div key={g.heading} className="mb-5">
              <h2 className="h4 mb-3">{g.heading}</h2>
              {g.items.map((it) => (
                <details key={it.q} className="accordion-item card-brand mb-2" style={{ borderRadius: "var(--radius)" }}>
                  <summary style={{ cursor: "pointer", fontFamily: "var(--sans)", fontWeight: 600, color: "var(--text)" }}>{it.q}</summary>
                  <p style={{ color: "var(--text-muted)", marginTop: 10, marginBottom: 0, fontSize: ".9rem", lineHeight: 1.65 }}>{it.a}</p>
                </details>
              ))}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
