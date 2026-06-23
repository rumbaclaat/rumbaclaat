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
        <div className="gift-card-banner">
          <div className="gift-card-banner-visual" aria-hidden="true">
            <div className="gift-card-mock">
              <div className="gift-card-mock-eyebrow">RUMBACLAAT</div>
              <div className="gift-card-mock-value">£100</div>
              <div className="gift-card-mock-label">GIFT CARD</div>
              <div className="gift-card-mock-code">····  ····  ····  2026</div>
            </div>
          </div>
          <div className="gift-card-banner-copy">
            <span className="eyebrow">The Perfect Gift</span>
            <h1 className="gift-card-banner-h">Rumbaclaat Gift Cards</h1>
            <p className="gift-card-banner-lede">For the rum-lover in your life. Use against any product — rum, apparel, or membership upgrades. Delivered by email instantly, or scheduled for the big day.</p>
            <ul className="gift-card-banner-feats list-unstyled">
              <li><span aria-hidden="true">✓</span> Values from £25 to £500</li>
              <li><span aria-hidden="true">✓</span> Email or printable PDF — your choice</li>
              <li><span aria-hidden="true">✓</span> Schedule send for a birthday, anniversary or holiday</li>
              <li><span aria-hidden="true">✓</span> Never expire</li>
            </ul>
          </div>
        </div>

        <div id="values" className="mt-5">
          <h2 className="h4 text-center mb-4">Choose a value</h2>
          <div className="row g-3 justify-content-center">
            {VALUES.map((v) => (
              <div className="col-6 col-md-2" key={v}>
                <div className="gc-card text-center">
                  <div className="gc-amount">{v}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center" style={{ color: "var(--text-dim)", fontSize: ".8125rem", marginTop: 16 }}>
            Custom values £10–£500. Online purchase is coming with the gift-card checkout — meanwhile <Link href="/contact">contact us</Link> to buy.
          </p>
        </div>
      </div>
    </section>
  );
}
