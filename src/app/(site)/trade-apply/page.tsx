import Link from "next/link";
import { submitTradeApplication } from "./actions";

export const metadata = {
  title: "Apply for a trade account",
  description:
    "Apply for a Rumbaclaat trade account. Bars, restaurants, retailers and distributors — we'll review your application and respond within one working day.",
};

const BUSINESS_TYPES = [
  "Bar / restaurant",
  "Independent retailer",
  "Off-licence chain",
  "Hotel / hospitality group",
  "Wholesaler / distributor",
  "Other",
];
const VOLUMES = ["1–4 cases / month", "5–9 cases / month", "10–24 cases / month", "25+ cases / month"];

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "var(--muted)",
  fontSize: ".78rem",
  marginBottom: 6,
};

const fieldStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--surface2)",
  border: "1px solid var(--line2)",
  color: "var(--text)",
  borderRadius: 10,
  padding: "12px 14px",
  fontSize: ".9rem",
  outline: "none",
  fontFamily: "var(--sans)",
};

export default async function TradeApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { sent, error } = await searchParams;

  if (sent) {
    const reference = `TR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    return (
      <div data-screen-label="Trade — applied">
        <section style={{ padding: "clamp(40px,5vw,64px) clamp(20px,5vw,40px) clamp(72px,9vw,110px)" }}>
          <div style={{ maxWidth: 780, margin: "0 auto" }}>
            <div style={{ fontSize: ".78rem", color: "var(--dim)", marginBottom: 14 }}>
              <Link href="/trade" style={{ color: "var(--dim)" }}>Trade</Link>{" "}
              <span style={{ opacity: 0.5 }}>/</span>{" "}
              <span style={{ color: "var(--muted)" }}>Apply</span>
            </div>
            <span
              style={{
                fontSize: ".74rem",
                letterSpacing: ".24em",
                textTransform: "uppercase",
                color: "var(--gold)",
                fontWeight: 600,
              }}
            >
              Application received
            </span>
            <h1 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "clamp(2rem,4.4vw,3rem)", lineHeight: 1.05, margin: "12px 0 0" }}>
              Thanks — we&apos;ve got your details
            </h1>
            <p style={{ color: "var(--muted)", fontSize: "1.02rem", lineHeight: 1.6, margin: "14px 0 0" }}>
              Reference{" "}
              <strong style={{ color: "var(--goldHi)", fontFamily: "var(--serif)" }}>{reference}</strong>. Our trade
              team will review your application and be in touch by email within one working day.
            </p>

            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--line2)",
                borderRadius: 18,
                padding: "30px 30px 32px",
                marginTop: 30,
              }}
            >
              <p style={{ fontSize: ".74rem", letterSpacing: ".24em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 600, margin: "0 0 16px" }}>
                What happens next
              </p>
              <ol style={{ fontSize: ".9rem", color: "var(--muted)", paddingLeft: "1.2em", margin: 0, lineHeight: 1.9 }}>
                <li>Your application enters our CRM (GoHighLevel) as a new lead.</li>
                <li>An account manager checks your business details against our trade criteria.</li>
                <li>You&apos;ll receive a decision email within 1 working day, including your portal login if approved.</li>
                <li>Once signed in, you can place wholesale orders, message your account manager and download invoices.</li>
              </ol>
              <div style={{ marginTop: 24 }}>
                <Link
                  href="/"
                  style={{
                    display: "inline-block",
                    background: "var(--gold)",
                    color: "var(--onGold)",
                    border: "none",
                    borderRadius: 999,
                    padding: "13px 30px",
                    fontSize: ".92rem",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Return home
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div data-screen-label="Trade — apply">
      <section style={{ padding: "clamp(40px,5vw,64px) clamp(20px,5vw,40px) clamp(72px,9vw,110px)" }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <div style={{ fontSize: ".78rem", color: "var(--dim)", marginBottom: 14 }}>
            <Link href="/trade" style={{ color: "var(--dim)" }}>Trade</Link>{" "}
            <span style={{ opacity: 0.5 }}>/</span>{" "}
            <span style={{ color: "var(--muted)" }}>Apply</span>
          </div>
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
          <h1 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "clamp(2rem,4.4vw,3rem)", lineHeight: 1.05, margin: "12px 0 0" }}>
            Apply for a trade account
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "1.02rem", lineHeight: 1.6, margin: "14px 0 0" }}>
            Bars, restaurants, retailers and distributors — tell us about your business and we&apos;ll be in touch
            within one working day.
          </p>

          <form
            action={submitTradeApplication}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--line2)",
              borderRadius: 18,
              padding: "30px 30px 32px",
              marginTop: 30,
            }}
          >
            {error && (
              <div
                role="alert"
                style={{
                  background: "rgba(242,109,109,.12)",
                  border: "1px solid rgba(242,109,109,.35)",
                  color: "var(--red)",
                  borderRadius: 10,
                  padding: "12px 14px",
                  fontSize: ".85rem",
                  marginBottom: 16,
                }}
              >
                Please complete: Company name, Contact name, Business email.
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label htmlFor="ta-company" style={labelStyle}>Company name *</label>
                <input id="ta-company" name="company" autoComplete="organization" required style={fieldStyle} />
              </div>
              <div>
                <label htmlFor="ta-name" style={labelStyle}>Contact name *</label>
                <input id="ta-name" name="name" autoComplete="name" required style={fieldStyle} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label htmlFor="ta-email" style={labelStyle}>Business email *</label>
                <input id="ta-email" name="email" type="email" autoComplete="email" required style={fieldStyle} />
              </div>
              <div>
                <label htmlFor="ta-phone" style={labelStyle}>Business phone</label>
                <input id="ta-phone" name="phone" type="tel" autoComplete="tel" style={fieldStyle} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label htmlFor="ta-type" style={labelStyle}>Business type</label>
                <select id="ta-type" name="businessType" defaultValue={BUSINESS_TYPES[0]} style={{ ...fieldStyle, color: "var(--muted)", cursor: "pointer", appearance: "none" }}>
                  {BUSINESS_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="ta-volume" style={labelStyle}>Estimated monthly volume</label>
                <select id="ta-volume" name="volume" defaultValue={VOLUMES[1]} style={{ ...fieldStyle, color: "var(--muted)", cursor: "pointer", appearance: "none" }}>
                  {VOLUMES.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label htmlFor="ta-vat" style={labelStyle}>VAT / Companies House number</label>
              <input id="ta-vat" name="vat" style={fieldStyle} />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label htmlFor="ta-message" style={labelStyle}>Anything else?</label>
              <textarea id="ta-message" name="message" rows={4} style={{ ...fieldStyle, resize: "vertical", lineHeight: 1.55 }} />
            </div>

            <p style={{ color: "var(--dim)", fontSize: ".78rem", lineHeight: 1.5, margin: "0 0 18px" }}>
              By applying you confirm you are an authorised buyer aged 18+. We&apos;ll store your details to process
              your application.
            </p>

            <button
              type="submit"
              style={{
                background: "var(--gold)",
                color: "var(--onGold)",
                border: "none",
                borderRadius: 999,
                padding: "13px 30px",
                fontSize: ".92rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Submit application
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
