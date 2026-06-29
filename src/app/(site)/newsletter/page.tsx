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
    <>
      <section
        className="section-sm"
        style={{ background: "linear-gradient(135deg,#15151B,#0E0E12)", borderBottom: "1px solid var(--gold-bdr)" }}
      >
        <div className="container reveal" style={{ maxWidth: 680 }}>
          <span className="eyebrow">JOIN THE LIST</span>
          <h1>Stories, drops, and the occasional good cocktail</h1>
          <p style={{ color: "var(--text-muted)", maxWidth: 520 }}>
            No account required. A few emails a month — new releases, journal pieces, cocktail recipes. Unsubscribe whenever you like.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 560 }}>
          <div className="card-brand">
            {subscribed ? (
              <div className="text-center" role="status" style={{ padding: "20px 0" }}>
                <div style={{ fontSize: "2.5rem", color: "var(--gold-hi)" }} aria-hidden="true">✦</div>
                <h2 className="h4 mt-2">You&apos;re on the list</h2>
                <p style={{ color: "var(--text-muted)" }}>
                  Check your inbox to confirm your email address. We&apos;ll be in touch soon.
                </p>
              </div>
            ) : (
              <form action={subscribe} noValidate>
                {error && (
                  <div
                    className="alert"
                    role="alert"
                    style={{
                      background: "rgba(242,109,109,.12)",
                      border: "1px solid rgba(242,109,109,.35)",
                      color: "var(--red)",
                      borderRadius: "var(--radius)",
                    }}
                  >
                    Please complete: Email.
                  </div>
                )}
                <div className="row g-3">
                  <div className="col-sm-6">
                    <label className="form-label" htmlFor="news-fname">First name *</label>
                    <input className="form-control" id="news-fname" name="firstName" autoComplete="given-name" required />
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label" htmlFor="news-email">Email *</label>
                    <input className="form-control" type="email" id="news-email" name="email" autoComplete="email" required />
                  </div>
                </div>
                <fieldset className="mt-3" style={{ border: 0, padding: 0, margin: 0 }}>
                  <legend className="form-label">What you&apos;d like to hear about</legend>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="ni-drops" name="interests" value="drops" defaultChecked />
                    <label className="form-check-label" htmlFor="ni-drops">New rum drops &amp; releases</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="ni-cocktails" name="interests" value="cocktails" defaultChecked />
                    <label className="form-check-label" htmlFor="ni-cocktails">Cocktail recipes &amp; serves</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="ni-journal" name="interests" value="journal" />
                    <label className="form-check-label" htmlFor="ni-journal">Journal stories &amp; brand news</label>
                  </div>
                </fieldset>
                <div className="form-check mt-3">
                  <input className="form-check-input" type="checkbox" id="news-terms" name="terms" value="yes" required />
                  <label className="form-check-label" htmlFor="news-terms" style={{ fontSize: ".8125rem", color: "var(--text-muted)" }}>
                    I&apos;m 18+ and agree to receive emails. I can unsubscribe any time. See{" "}
                    <Link href="/privacy">Privacy Policy</Link>.
                  </label>
                </div>
                <button type="submit" className="btn btn-gold w-100 mt-3">Join the list</button>
              </form>
            )}
          </div>
          <p style={{ fontSize: ".75rem", color: "var(--text-dim)", textAlign: "center", marginTop: 16 }}>
            Already have an account? Email preferences are in your <Link href="/account">member portal</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
