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
    <>
      {/* ---- Sign-in + intro band ---- */}
      <section className="section">
        <div className="container">
          <div className="text-center reveal" style={{ maxWidth: 720, margin: "0 auto 48px" }}>
            <span className="eyebrow eyebrow-center">Rumbaclaat Trade</span>
            <h1 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "clamp(2rem, 4.4vw, 3.4rem)", lineHeight: 1.05, margin: 0 }}>
              Wholesale &amp; Export Portal
            </h1>
            <p className="lede" style={{ fontSize: "1.0625rem", color: "var(--text-muted)", lineHeight: 1.7, maxWidth: 580, margin: "16px auto 0" }}>
              Sign in to your wholesale account below. New here? Apply for trade access and we&apos;ll respond within one working day.
            </p>
          </div>

          <div className="row g-4 justify-content-center">
            <div className="col-12 col-md-9 col-lg-7">
              <div className="card-brand reveal d-flex flex-column" style={{ padding: 28 }}>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <span className="badge-brand badge-gold">Existing customers</span>
                </div>
                <h2 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "1.5rem", margin: "0 0 6px" }}>Sign in to your trade account</h2>
                <p style={{ fontSize: ".9375rem", color: "var(--text-muted)", lineHeight: 1.7, margin: "0 0 22px" }}>View your pricing, place new orders, message your account manager, and download invoices.</p>
                <form action="/trade/portal">
                  <div className="mb-3">
                    <label className="form-label" htmlFor="ts-email" style={{ fontSize: ".78rem", color: "var(--text-muted)", marginBottom: 6 }}>Business email *</label>
                    <input className="form-control" type="email" id="ts-email" autoComplete="email" />
                  </div>
                  <div className="mb-4">
                    <label className="form-label" htmlFor="ts-password" style={{ fontSize: ".78rem", color: "var(--text-muted)", marginBottom: 6 }}>Password *</label>
                    <input className="form-control" type="password" id="ts-password" autoComplete="current-password" />
                  </div>
                  <button type="submit" className="btn btn-gold w-100">Sign in to trade portal</button>
                </form>
                <p style={{ fontSize: ".75rem", color: "var(--text-dim)", margin: "14px 0 0" }}>Trade portal access is enabled once your application is approved.</p>
              </div>

              <div className="card-brand card-brand--feature reveal mt-3 d-flex align-items-center justify-content-between flex-wrap gap-3" style={{ padding: 24 }}>
                <div>
                  <p style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "1.2rem", color: "var(--gold-hi)", margin: "0 0 4px" }}>No trade account yet?</p>
                  <p style={{ fontSize: ".9375rem", color: "var(--text-muted)", margin: 0 }}>Bars, restaurants, retailers and distributors can apply for wholesale access.</p>
                </div>
                <Link href="/trade-apply" className="btn btn-outline-gold">Apply for a trade account →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Benefits band ---- */}
      <section className="section section--surface">
        <div className="container">
          <div className="text-center reveal" style={{ maxWidth: 640, margin: "0 auto 40px" }}>
            <span className="eyebrow eyebrow-center">Why apply</span>
            <h2 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "clamp(1.9rem, 4vw, 3rem)", lineHeight: 1.08, margin: 0 }}>
              Why open a trade account?
            </h2>
          </div>
          <div className="row g-4">
            {WHY.map((w) => (
              <div className="col-12 col-md-4" key={w.h}>
                <div className="card-brand h-100" style={{ padding: 26 }}>
                  <h3 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "1.25rem", color: "var(--gold-hi)", margin: "0 0 10px" }}>{w.h}</h3>
                  <p style={{ fontSize: ".9375rem", color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>{w.p}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
