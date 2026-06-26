import Link from "next/link";
import { subscribe } from "./actions";

export const metadata = {
  title: "Newsletter",
  description: "Join the Rumbaclaat list — new releases, journal pieces, cocktail recipes and member events.",
};

export default async function NewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ subscribed?: string; error?: string }>;
}) {
  const { subscribed, error } = await searchParams;

  return (
    <section className="section section--sunken">
      <div className="container">
        <div
          className="card-brand card-brand--feature"
          style={{ maxWidth: 680, marginInline: "auto", textAlign: "center", padding: "clamp(32px, 5vw, 48px)" }}
        >
          <span className="eyebrow eyebrow-center">Letters from the Distillery</span>
          <h1 className="serif" style={{ fontSize: "clamp(2rem, 4.4vw, 3.2rem)", margin: 0 }}>
            Join the <em className="gold">Rumbaclaat</em> list
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1.0625rem", lineHeight: 1.7, maxWidth: 520, margin: "18px auto 0" }}>
            A few emails a month. New releases, journal pieces, cocktail recipes, member events. No noise — unsubscribe whenever you like.
          </p>

          {subscribed ? (
            <div
              role="status"
              style={{
                marginTop: 28,
                background: "var(--gold-lt)",
                border: "1px solid var(--gold-bdr)",
                color: "var(--gold-hi)",
                borderRadius: "var(--radius-lg)",
                padding: "16px 20px",
                lineHeight: 1.6,
              }}
            >
              <span className="gold" aria-hidden="true" style={{ fontWeight: 700, marginRight: 8 }}>✓</span>
              You&apos;re on the list. Look out for the first letter from us.
            </div>
          ) : (
            <>
              {error && (
                <div
                  role="alert"
                  style={{
                    marginTop: 24,
                    background: "rgba(236,139,139,.12)",
                    border: "1px solid rgba(236,139,139,.35)",
                    color: "var(--red)",
                    borderRadius: "var(--radius)",
                    padding: "10px 14px",
                    fontSize: ".9rem",
                  }}
                >
                  Please enter a valid email address.
                </div>
              )}
              <form
                action={subscribe}
                style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", marginTop: 28 }}
              >
                <label htmlFor="nl-email" className="visually-hidden">Email address</label>
                <input
                  className="form-control form-control-lg"
                  type="email"
                  id="nl-email"
                  name="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  style={{ flex: "1 1 260px", minWidth: 0 }}
                />
                <button type="submit" className="btn btn-gold btn-lg">Subscribe →</button>
              </form>
              <p style={{ color: "var(--text-dim)", fontSize: ".8125rem", marginTop: 16 }}>
                By subscribing you confirm you&apos;re 18+ and accept our{" "}
                <Link href="/privacy" className="gold">Privacy Policy</Link>.
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
