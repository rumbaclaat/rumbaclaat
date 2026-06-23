import Link from "next/link";

export const metadata = {
  title: "Trade Portal",
  description: "Apply for a Rumbaclaat trade account or sign in to your wholesale portal. Application-only — approved within one working day.",
};

const WHY = [
  { h: "Tiered wholesale pricing", p: "From £22.75 / bottle on Original Reserve at volume — full schedule visible once approved." },
  { h: "60-day payment terms", p: "Net 60 invoicing on every order after the first two cleared payments." },
  { h: "Dedicated account manager", p: "Direct line for new orders, pricing queries, and bespoke export paperwork." },
];

export default function TradePage() {
  return (
    <div className="container section">
      <div className="text-center reveal mb-5" style={{ maxWidth: 720, margin: "0 auto" }}>
        <span className="eyebrow">Rumbaclaat Trade</span>
        <h1 style={{ fontSize: "clamp(2rem,4vw,2.75rem)" }}>Wholesale &amp; Export Portal</h1>
        <p className="lede" style={{ fontSize: "1.05rem", color: "var(--text-muted)", marginTop: 14 }}>
          Sign in to your wholesale account below. New here? Apply for trade access and we&apos;ll respond within one working day.
        </p>
      </div>

      <div className="row g-4 justify-content-center">
        <div className="col-12 col-md-9 col-lg-7">
          <div className="card-brand reveal d-flex flex-column">
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge-brand badge-gold">Existing customers</span>
            </div>
            <h2 className="h3" style={{ fontFamily: "var(--serif)", fontWeight: 600, marginBottom: 6 }}>Sign in to your trade account</h2>
            <p style={{ fontSize: ".9375rem", color: "var(--text-muted)", marginBottom: 20 }}>View your pricing, place new orders, message your account manager, and download invoices.</p>
            <form action="/account">
              <div className="mb-3"><label className="form-label" htmlFor="ts-email">Business email *</label><input className="form-control" type="email" id="ts-email" autoComplete="email" /></div>
              <div className="mb-3"><label className="form-label" htmlFor="ts-password">Password *</label><input className="form-control" type="password" id="ts-password" autoComplete="current-password" /></div>
              <button type="submit" className="btn btn-gold w-100">Sign in to trade portal</button>
            </form>
            <p style={{ fontSize: ".75rem", color: "var(--text-dim)", marginTop: 10, marginBottom: 0 }}>Trade portal access is enabled once your application is approved.</p>
          </div>

          <div className="card-brand reveal mt-3 d-flex align-items-center justify-content-between flex-wrap gap-3" style={{ borderColor: "var(--gold-md)" }}>
            <div>
              <p style={{ fontFamily: "var(--serif)", fontWeight: 600, color: "var(--gold-hi)", margin: "0 0 4px" }}>No trade account yet?</p>
              <p style={{ fontSize: ".875rem", margin: 0 }}>Bars, restaurants, retailers and distributors can apply for wholesale access.</p>
            </div>
            <Link href="/trade-apply" className="btn btn-outline-gold">Apply for a trade account →</Link>
          </div>
        </div>
      </div>

      <section className="section-sm" style={{ marginTop: 32, paddingTop: 32, borderTop: "1px solid var(--gold-bdr)" }}>
        <h2 className="h4 mb-3 text-center">Why open a trade account?</h2>
        <div className="row g-3">
          {WHY.map((w) => (
            <div className="col-12 col-md-4" key={w.h}>
              <div className="card-brand h-100">
                <p style={{ fontSize: "1rem", fontWeight: 600, color: "var(--gold-hi)", marginBottom: 6 }}>{w.h}</p>
                <p style={{ fontSize: ".875rem", color: "var(--text-muted)", margin: 0 }}>{w.p}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
