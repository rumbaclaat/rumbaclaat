import GiftCardConfigurator from "./gift-card-configurator";

export const metadata = {
  title: "Gift Cards",
  description:
    "Send a Rumbaclaat gift card by email. Choose an amount from £10 to £500, write a message, and schedule the delivery date.",
};

export default function GiftCardsPage() {
  return (
    <>
      <section
        className="section-sm"
        style={{
          background: "linear-gradient(135deg,#15151B,#0E0E12)",
          borderBottom: "1px solid var(--gold-bdr)",
        }}
      >
        <div className="container reveal" style={{ maxWidth: 820 }}>
          <span className="eyebrow">GIFT CARDS</span>
          <h1>The gift of choice</h1>
          <p style={{ color: "var(--text-muted)", maxWidth: 560 }}>
            A Rumbaclaat gift card — sent digitally, never expires, redeemable
            across the whole shop. Pick an amount, write a message, and we&apos;ll
            deliver it on the date you choose.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 1100 }}>
          <GiftCardConfigurator />
        </div>
      </section>

      <section
        className="section"
        style={{ background: "#0E0E12", borderTop: "1px solid var(--gold-bdr)" }}
      >
        <div className="container" style={{ maxWidth: 820 }}>
          <h2 className="h4 mb-3">How it works</h2>
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <div className="card-brand h-100">
                <span
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: "1.5rem",
                    color: "var(--gold-hi)",
                  }}
                >
                  1.
                </span>
                <h3 className="h6 mt-2">Choose &amp; personalise</h3>
                <p style={{ fontSize: ".875rem", color: "var(--text-muted)", margin: 0 }}>
                  Pick an amount, write your message, choose the send date.
                </p>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="card-brand h-100">
                <span
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: "1.5rem",
                    color: "var(--gold-hi)",
                  }}
                >
                  2.
                </span>
                <h3 className="h6 mt-2">We deliver</h3>
                <p style={{ fontSize: ".875rem", color: "var(--text-muted)", margin: 0 }}>
                  Sent by email at the date you set. Beautifully designed,
                  on-brand.
                </p>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="card-brand h-100">
                <span
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: "1.5rem",
                    color: "var(--gold-hi)",
                  }}
                >
                  3.
                </span>
                <h3 className="h6 mt-2">They redeem</h3>
                <p style={{ fontSize: ".875rem", color: "var(--text-muted)", margin: 0 }}>
                  A unique code applies at checkout. Never expires. Any product.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
