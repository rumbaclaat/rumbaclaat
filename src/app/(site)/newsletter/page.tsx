import Link from "next/link";
import { subscribe } from "./actions";

export const metadata = {
  title: "Newsletter",
  description: "Join the Rumbaclaat list — new releases, journal pieces, cocktail recipes and member events.",
};

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

const eyebrowStyle: React.CSSProperties = {
  fontSize: ".74rem",
  letterSpacing: ".24em",
  textTransform: "uppercase",
  color: "var(--gold)",
  fontWeight: 600,
};

const INTERESTS = [
  { id: "ni-drops", value: "drops", label: "New rum drops & releases", defaultChecked: true },
  { id: "ni-cocktails", value: "cocktails", label: "Cocktail recipes & serves", defaultChecked: true },
  { id: "ni-journal", value: "journal", label: "Journal stories & brand news", defaultChecked: false },
];

export default async function NewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ subscribed?: string; error?: string }>;
}) {
  const { subscribed, error } = await searchParams;

  return (
    <div data-screen-label="Newsletter">
      <section
        style={{
          position: "relative",
          padding: "clamp(56px,8vw,104px) clamp(20px,5vw,40px) clamp(40px,6vw,64px)",
          overflow: "hidden",
          borderBottom: "1px solid var(--line2)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(80% 70% at 50% 0%, rgba(205,181,130,.1), transparent 60%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <span style={eyebrowStyle}>Join the list</span>
          <h1
            style={{
              fontFamily: "var(--serif)",
              fontWeight: 600,
              fontSize: "clamp(2rem,4.4vw,3rem)",
              lineHeight: 1.05,
              margin: "12px 0 0",
              color: "var(--text)",
            }}
          >
            Stories, drops, and the occasional good cocktail
          </h1>
          <p
            style={{
              color: "var(--muted)",
              fontSize: "1.02rem",
              lineHeight: 1.6,
              margin: "14px auto 0",
              maxWidth: 520,
            }}
          >
            No account required. A few emails a month — new releases, journal pieces, cocktail recipes.
            Unsubscribe whenever you like.
          </p>
        </div>
      </section>

      <section style={{ padding: "clamp(40px,5vw,56px) clamp(20px,5vw,40px) clamp(72px,9vw,110px)" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          {subscribed ? (
            <div
              role="status"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--line2)",
                borderRadius: 18,
                padding: "40px 30px",
                textAlign: "center",
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  width: 56,
                  height: 56,
                  margin: "0 auto 18px",
                  borderRadius: 999,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(205,181,130,.12)",
                  border: "1px solid var(--gold)",
                  color: "var(--goldHi)",
                  fontSize: "1.4rem",
                }}
              >
                <i className="bi bi-check2" />
              </div>
              <h2
                style={{
                  fontFamily: "var(--serif)",
                  fontWeight: 600,
                  fontSize: "clamp(1.4rem,3vw,1.8rem)",
                  lineHeight: 1.1,
                  margin: 0,
                  color: "var(--text)",
                }}
              >
                You&apos;re on the list
              </h2>
              <p style={{ color: "var(--muted)", fontSize: ".95rem", lineHeight: 1.6, margin: "12px 0 0" }}>
                Check your inbox to confirm your email address. We&apos;ll be in touch soon.
              </p>
            </div>
          ) : (
            <form
              action={subscribe}
              noValidate
              style={{
                background: "var(--surface)",
                border: "1px solid var(--line2)",
                borderRadius: 18,
                padding: "30px 30px 32px",
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
                  Please complete: Email.
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label htmlFor="news-fname" style={labelStyle}>First name *</label>
                  <input
                    id="news-fname"
                    name="firstName"
                    autoComplete="given-name"
                    required
                    style={fieldStyle}
                  />
                </div>
                <div>
                  <label htmlFor="news-email" style={labelStyle}>Email *</label>
                  <input
                    id="news-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    style={fieldStyle}
                  />
                </div>
              </div>

              <fieldset style={{ border: 0, padding: 0, margin: "0 0 4px" }}>
                <legend style={{ ...labelStyle, marginBottom: 10 }}>What you&apos;d like to hear about</legend>
                <div style={{ display: "grid", gap: 10 }}>
                  {INTERESTS.map((i) => (
                    <label
                      key={i.id}
                      htmlFor={i.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        color: "var(--text)",
                        fontSize: ".9rem",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        id={i.id}
                        type="checkbox"
                        name="interests"
                        value={i.value}
                        defaultChecked={i.defaultChecked}
                        style={{ width: 16, height: 16, accentColor: "var(--gold)" }}
                      />
                      {i.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <label
                htmlFor="news-terms"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  margin: "18px 0 0",
                  color: "var(--muted)",
                  fontSize: ".8125rem",
                  lineHeight: 1.5,
                  cursor: "pointer",
                }}
              >
                <input
                  id="news-terms"
                  type="checkbox"
                  name="terms"
                  value="yes"
                  required
                  style={{ width: 16, height: 16, marginTop: 2, accentColor: "var(--gold)" }}
                />
                <span>
                  I&apos;m 18+ and agree to receive emails. I can unsubscribe any time. See{" "}
                  <Link href="/privacy" style={{ color: "var(--goldHi)" }}>Privacy Policy</Link>.
                </span>
              </label>

              <button
                type="submit"
                style={{
                  width: "100%",
                  marginTop: 22,
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
                Join the list
              </button>
            </form>
          )}

          <p style={{ fontSize: ".75rem", color: "var(--dim)", textAlign: "center", margin: "16px 0 0" }}>
            Already have an account? Email preferences are in your{" "}
            <Link href="/account" style={{ color: "var(--goldHi)" }}>member portal</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}
