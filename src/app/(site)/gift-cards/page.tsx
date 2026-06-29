import GiftCardConfigurator from "./gift-card-configurator";

export const metadata = {
  title: "Gift Cards",
  description:
    "Send a Rumbaclaat gift card by email. Choose an amount from £10 to £500, write a message, and schedule the delivery date.",
};

const STEPS = [
  {
    n: "1",
    title: "Choose & personalise",
    body: "Pick an amount, write your message, choose the send date.",
  },
  {
    n: "2",
    title: "We deliver",
    body: "Sent by email at the date you set. Beautifully designed, on-brand.",
  },
  {
    n: "3",
    title: "They redeem",
    body: "A unique code applies at checkout. Never expires. Any product.",
  },
];

export default function GiftCardsPage() {
  return (
    <div data-screen-label="Gift cards">
      {/* Hero */}
      <section
        style={{
          position: "relative",
          padding:
            "clamp(48px,7vw,84px) clamp(20px,5vw,40px) clamp(40px,6vw,56px)",
          overflow: "hidden",
          borderBottom: "1px solid var(--line2)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(80% 70% at 50% 0%, rgba(205,181,130,.1), transparent 60%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", maxWidth: 1180, margin: "0 auto" }}>
          <span
            style={{
              fontSize: ".74rem",
              letterSpacing: ".24em",
              textTransform: "uppercase",
              color: "var(--gold)",
              fontWeight: 600,
            }}
          >
            Gift Cards
          </span>
          <h1
            style={{
              fontFamily: "var(--serif)",
              fontWeight: 600,
              fontSize: "clamp(2.2rem,5vw,3.4rem)",
              lineHeight: 1.05,
              margin: "12px 0 0",
            }}
          >
            The gift of choice
          </h1>
          <p
            style={{
              color: "var(--muted)",
              fontSize: "1.05rem",
              lineHeight: 1.6,
              maxWidth: 560,
              margin: "14px 0 0",
            }}
          >
            A Rumbaclaat gift card — sent digitally, never expires, redeemable
            across the whole shop. Pick an amount, write a message, and
            we&apos;ll deliver it on the date you choose.
          </p>
        </div>
      </section>

      {/* Configurator */}
      <section
        style={{
          padding:
            "clamp(36px,5vw,60px) clamp(20px,5vw,40px) clamp(40px,6vw,64px)",
        }}
      >
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <GiftCardConfigurator />
        </div>
      </section>

      {/* How it works */}
      <section
        style={{
          padding:
            "clamp(36px,5vw,60px) clamp(20px,5vw,40px) clamp(72px,9vw,110px)",
          borderTop: "1px solid var(--line2)",
        }}
      >
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <h2
            style={{
              fontFamily: "var(--serif)",
              fontWeight: 600,
              fontSize: "clamp(1.5rem,3vw,2rem)",
              margin: "0 0 22px",
            }}
          >
            How it works
          </h2>
          <div
            className="gift-steps-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 16,
            }}
          >
            {STEPS.map((s) => (
              <div
                key={s.n}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--line2)",
                  borderRadius: 14,
                  padding: "24px 26px",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--serif)",
                    fontWeight: 600,
                    fontSize: "1.5rem",
                    color: "var(--goldHi)",
                  }}
                >
                  {s.n}.
                </span>
                <h3
                  style={{
                    fontFamily: "var(--serif)",
                    fontWeight: 600,
                    fontSize: "1.1rem",
                    margin: "10px 0 0",
                    color: "var(--text)",
                  }}
                >
                  {s.title}
                </h3>
                <p
                  style={{
                    fontSize: ".88rem",
                    color: "var(--muted)",
                    lineHeight: 1.55,
                    margin: "6px 0 0",
                  }}
                >
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
