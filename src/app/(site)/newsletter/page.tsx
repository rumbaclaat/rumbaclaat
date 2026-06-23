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
    <section className="section home-newsletter">
      <div className="container">
        <div className="home-newsletter-card">
          <span className="eyebrow">Letters from the Distillery</span>
          <h1>Join the Rumbaclaat list</h1>
          <p style={{ color: "var(--text-muted)" }}>A few emails a month. New releases, journal pieces, cocktail recipes, member events. No noise — unsubscribe whenever you like.</p>

          {subscribed ? (
            <div role="status" className="mt-3" style={{ background: "rgba(74,222,128,.12)", border: "1px solid rgba(74,222,128,.35)", color: "var(--green)", borderRadius: 8, padding: "12px 16px" }}>
              ✓ You&apos;re on the list. Look out for the first letter from us.
            </div>
          ) : (
            <>
              {error && (
                <div role="alert" className="mt-3" style={{ background: "rgba(242,109,109,.12)", border: "1px solid rgba(242,109,109,.35)", color: "var(--red)", borderRadius: 8, padding: "8px 12px", fontSize: ".875rem" }}>Please enter a valid email address.</div>
              )}
              <form action={subscribe} className="home-newsletter-row">
                <label htmlFor="nl-email" className="visually-hidden">Email address</label>
                <input className="form-control form-control-lg" type="email" id="nl-email" name="email" placeholder="you@example.com" autoComplete="email" required />
                <button type="submit" className="btn btn-gold btn-lg">Subscribe →</button>
              </form>
              <p className="home-newsletter-help">By subscribing you confirm you&apos;re 18+ and accept our <Link href="/privacy">Privacy Policy</Link>.</p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
