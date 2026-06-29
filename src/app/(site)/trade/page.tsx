import Link from "next/link";

export const metadata = {
  title: "Trade Portal",
  description: "Apply for a Rumbaclaat trade account or sign in to your wholesale portal. Application-only — approved within one working day.",
};

type Benefit = { icon: string; title: string; body: string };

const TRADE_BENEFITS: Benefit[] = [
  {
    icon: "graph-up-arrow",
    title: "Tiered wholesale pricing",
    body: "From £22.75 / bottle on Original Reserve at volume — full schedule visible once approved.",
  },
  {
    icon: "calendar-check",
    title: "60-day payment terms",
    body: "Net 60 invoicing on every order after the first two cleared payments.",
  },
  {
    icon: "person-badge",
    title: "Dedicated account manager",
    body: "Direct line for new orders, pricing queries, and bespoke export paperwork.",
  },
];

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--surface2)",
  border: "1px solid var(--line2)",
  color: "var(--text)",
  borderRadius: 10,
  padding: "12px 14px",
  fontSize: ".9rem",
  outline: "none",
  fontFamily: "var(--sans)",
  marginBottom: 16,
};

export default function TradePage() {
  return (
    <div>
      <section
        style={{
          position: "relative",
          padding: "clamp(48px,7vw,84px) clamp(20px,5vw,40px) clamp(40px,6vw,56px)",
          overflow: "hidden",
          borderBottom: "1px solid var(--line2)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(80% 70% at 70% 0%, rgba(205,181,130,.1), transparent 60%)",
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
            Rumbaclaat Trade
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
            Wholesale &amp; Export Portal
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
            Sign in to your wholesale account, or apply for trade access — we respond within one working day.
          </p>
        </div>
      </section>

      <section style={{ padding: "clamp(36px,5vw,60px) clamp(20px,5vw,40px) clamp(40px,6vw,64px)" }}>
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            alignItems: "start",
          }}
        >
          {/* ---- Sign-in card (live form preserved) ---- */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--line2)",
              borderRadius: 18,
              padding: "30px 28px",
            }}
          >
            <h2 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "1.5rem", margin: "0 0 4px" }}>
              Sign in to your trade account
            </h2>
            <p style={{ color: "var(--dim)", fontSize: ".86rem", margin: "0 0 22px" }}>
              View your pricing, place orders, message your account manager, and download invoices.
            </p>
            <form action="/trade/portal">
              <label
                htmlFor="ts-email"
                style={{ display: "block", color: "var(--muted)", fontSize: ".78rem", marginBottom: 6 }}
              >
                Business email *
              </label>
              <input
                id="ts-email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@business.com"
                style={inputStyle}
              />
              <label
                htmlFor="ts-password"
                style={{ display: "block", color: "var(--muted)", fontSize: ".78rem", marginBottom: 6 }}
              >
                Password *
              </label>
              <input
                id="ts-password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                style={{ ...inputStyle, marginBottom: 20 }}
              />
              <button
                type="submit"
                style={{
                  width: "100%",
                  background: "var(--gold)",
                  color: "var(--onGold)",
                  border: "none",
                  borderRadius: 999,
                  padding: 13,
                  fontSize: ".92rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Sign in to trade portal
              </button>
            </form>
            <p style={{ color: "var(--dim)", fontSize: ".78rem", margin: "14px 0 0" }}>
              Trade portal access is enabled once your application is approved.
            </p>
          </div>

          {/* ---- Apply CTA + benefits ---- */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div
              style={{
                background: "linear-gradient(160deg, rgba(205,181,130,.12), var(--surface))",
                border: "1px solid var(--line)",
                borderRadius: 18,
                padding: "26px 28px",
              }}
            >
              <h3 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "1.3rem", margin: "0 0 6px" }}>
                No trade account yet?
              </h3>
              <p style={{ color: "var(--muted)", fontSize: ".92rem", lineHeight: 1.55, margin: "0 0 18px" }}>
                Bars, restaurants, retailers and distributors can apply for wholesale access.
              </p>
              <Link
                href="/trade-apply"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 9,
                  background: "transparent",
                  border: "1px solid var(--gold)",
                  color: "var(--goldHi)",
                  borderRadius: 999,
                  padding: "12px 24px",
                  fontSize: ".9rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  textDecoration: "none",
                }}
              >
                Apply for a trade account <i className="bi bi-arrow-right" />
              </Link>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {TRADE_BENEFITS.map((b) => (
                <div
                  key={b.title}
                  style={{
                    display: "flex",
                    gap: 14,
                    alignItems: "flex-start",
                    background: "var(--surface)",
                    border: "1px solid var(--line2)",
                    borderRadius: 14,
                    padding: "18px 20px",
                  }}
                >
                  <span
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      flex: "0 0 40px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "var(--goldLt)",
                      border: "1px solid var(--line)",
                      color: "var(--goldHi)",
                      fontSize: "1.1rem",
                    }}
                  >
                    <i className={`bi bi-${b.icon}`} />
                  </span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: ".96rem", color: "var(--text)" }}>{b.title}</div>
                    <div style={{ color: "var(--muted)", fontSize: ".86rem", lineHeight: 1.5, marginTop: 4 }}>
                      {b.body}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
