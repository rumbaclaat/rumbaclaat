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
const VOLUMES = ["1–4 cases", "5–9 cases", "10–24 cases", "25+ cases"];

export default async function TradeApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { sent, error } = await searchParams;

  if (sent) {
    const reference = `TR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    return (
      <div className="container section">
        <h1 className="visually-hidden">Apply for a trade account</h1>
        <div className="text-center reveal" style={{ maxWidth: 600, margin: "0 auto" }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "rgba(74,222,128,.12)",
              border: "1px solid rgba(74,222,128,.4)",
              margin: "0 auto 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-hidden="true"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <span className="eyebrow">APPLICATION RECEIVED</span>
          <h2 style={{ fontSize: "clamp(1.75rem,4vw,2.5rem)", fontFamily: "var(--serif)", fontWeight: 600 }}>
            Thanks — we&apos;ve got your details
          </h2>
          <p style={{ fontSize: "1.0625rem", color: "var(--text-muted)", maxWidth: 520, margin: "14px auto 0" }}>
            Reference{" "}
            <strong style={{ color: "var(--gold-hi)", fontFamily: "var(--serif)" }}>{reference}</strong>.
            Our trade team will review your application and be in touch by email within one working day.
          </p>

          <div className="card-brand reveal text-start mt-4" style={{ maxWidth: 520, margin: "32px auto 0" }}>
            <p style={{ fontSize: ".6875rem", letterSpacing: ".12em", color: "var(--text-dim)", marginBottom: 14 }}>
              WHAT HAPPENS NEXT
            </p>
            <ol style={{ fontSize: ".9375rem", color: "var(--text-muted)", paddingLeft: "1.2em", margin: 0, lineHeight: 1.9 }}>
              <li>Your application enters our CRM (GoHighLevel) as a new lead.</li>
              <li>An account manager checks your business details against our trade criteria.</li>
              <li>You&apos;ll receive a decision email within 1 working day, including your portal login if approved.</li>
              <li>Once signed in, you can place wholesale orders, message your account manager and download invoices.</li>
            </ol>
          </div>

          <div className="d-flex justify-content-center mt-4">
            <Link href="/" className="btn btn-outline-gold">Return home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container section">
      <h1 className="visually-hidden">Apply for a trade account</h1>
      <nav aria-label="Breadcrumb" className="mb-2">
        <ol className="breadcrumb" style={{ fontSize: ".75rem", margin: 0 }}>
          <li className="breadcrumb-item"><Link href="/">Home</Link></li>
          <li className="breadcrumb-item"><Link href="/trade">Trade</Link></li>
          <li className="breadcrumb-item active" aria-current="page">Apply for access</li>
        </ol>
      </nav>

      <div className="text-center reveal mb-5" style={{ maxWidth: 720, margin: "0 auto" }}>
        <span className="eyebrow">RUMBACLAAT TRADE</span>
        <h2 style={{ fontSize: "clamp(2rem,4vw,2.75rem)", fontFamily: "var(--serif)", fontWeight: 600 }}>
          Apply for a trade account
        </h2>
        <p className="lede" style={{ fontSize: "1.05rem", color: "var(--text-muted)", marginTop: 14 }}>
          For bars, restaurants, retailers and distributors. Tell us about your business and we&apos;ll be in touch
          within one working day.
        </p>
      </div>

      <div className="row g-4 justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card-brand reveal" style={{ borderColor: "var(--gold-md)" }}>
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
                Please complete: Contact name, Business email, Business name.
              </div>
            )}

            <form action={submitTradeApplication}>
              <h3 className="h4 mb-3" style={{ fontFamily: "var(--serif)", fontWeight: 600 }}>Your details</h3>
              <div className="row g-3 mb-2">
                <div className="col-12 col-sm-6">
                  <label className="form-label" htmlFor="ta-name">Contact name *</label>
                  <input className="form-control" id="ta-name" name="name" autoComplete="name" required />
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label" htmlFor="ta-role">Your role *</label>
                  <input className="form-control" id="ta-role" name="role" placeholder="e.g. Bar manager, Buyer, Owner" required />
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label" htmlFor="ta-email">Business email *</label>
                  <input className="form-control" type="email" id="ta-email" name="email" autoComplete="email" required />
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label" htmlFor="ta-phone">Business phone *</label>
                  <input className="form-control" type="tel" id="ta-phone" name="phone" autoComplete="tel" required />
                </div>
              </div>

              <hr style={{ borderColor: "var(--gold-bdr)", margin: "24px 0" }} />

              <h3 className="h4 mb-3" style={{ fontFamily: "var(--serif)", fontWeight: 600 }}>About the business</h3>
              <div className="row g-3 mb-2">
                <div className="col-12">
                  <label className="form-label" htmlFor="ta-business">Business name *</label>
                  <input className="form-control" id="ta-business" name="company" autoComplete="organization" required />
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label" htmlFor="ta-type">Business type *</label>
                  <select className="form-select" id="ta-type" name="businessType" required defaultValue="">
                    <option value="">Select…</option>
                    {BUSINESS_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label" htmlFor="ta-volume">Estimated monthly volume *</label>
                  <select className="form-select" id="ta-volume" name="volume" required defaultValue="">
                    <option value="">Select…</option>
                    {VOLUMES.map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label" htmlFor="ta-postcode">Trading postcode *</label>
                  <input className="form-control" id="ta-postcode" name="postcode" autoComplete="postal-code" required style={{ maxWidth: 200 }} />
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label" htmlFor="ta-companies">Companies House no. (UK)</label>
                  <input className="form-control" id="ta-companies" name="vat" placeholder="Optional but speeds things up" />
                </div>
                <div className="col-12">
                  <label className="form-label" htmlFor="ta-message">Anything else we should know?</label>
                  <textarea
                    className="form-control"
                    id="ta-message"
                    name="message"
                    rows={4}
                    placeholder="Venue type, existing supplier(s), launch date, special pricing requests…"
                  />
                </div>
              </div>

              <hr style={{ borderColor: "var(--gold-bdr)", margin: "24px 0" }} />

              <div className="mb-3">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="ta-terms" name="terms" required />
                  <label className="form-check-label" htmlFor="ta-terms" style={{ fontSize: ".875rem" }}>
                    I confirm I am over 18 and authorised to apply on behalf of this business. *
                  </label>
                </div>
                <div className="form-check mt-2">
                  <input className="form-check-input" type="checkbox" id="ta-marketing" name="marketing" />
                  <label className="form-check-label" htmlFor="ta-marketing" style={{ fontSize: ".875rem" }}>
                    Send me trade-only news, new releases, and tasting invitations.
                  </label>
                </div>
              </div>

              <div className="d-flex gap-2 flex-wrap mt-4">
                <button type="submit" className="btn btn-gold btn-lg flex-grow-1">Submit application</button>
                <Link href="/trade" className="btn btn-ghost">Cancel</Link>
              </div>
              <p style={{ fontSize: ".6875rem", color: "var(--text-dim)", margin: "14px 0 0", textAlign: "center" }}>
                Submissions are sent to our CRM (GoHighLevel) and reviewed by our trade team.
              </p>
            </form>
          </div>

          <p className="mt-3 text-center" style={{ fontSize: ".875rem", color: "var(--text-muted)" }}>
            Already approved? <Link href="/trade">Sign in to the trade portal →</Link>
          </p>
        </div>
      </div>

      <section className="section-sm" style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid var(--gold-bdr)" }}>
        <h2 className="h4 mb-3" style={{ textAlign: "center", fontFamily: "var(--serif)", fontWeight: 600 }}>
          Why open a trade account?
        </h2>
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <div className="card-brand h-100">
              <p style={{ fontSize: "1rem", fontWeight: 600, color: "var(--gold-hi)", marginBottom: 6 }}>Tiered wholesale pricing</p>
              <p style={{ fontSize: ".875rem", color: "var(--text-muted)", margin: 0 }}>
                From £22.75 / bottle on Original Reserve at volume — full schedule visible once approved.
              </p>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card-brand h-100">
              <p style={{ fontSize: "1rem", fontWeight: 600, color: "var(--gold-hi)", marginBottom: 6 }}>60-day payment terms</p>
              <p style={{ fontSize: ".875rem", color: "var(--text-muted)", margin: 0 }}>
                Net 60 invoicing on every order after the first two cleared payments.
              </p>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card-brand h-100">
              <p style={{ fontSize: "1rem", fontWeight: 600, color: "var(--gold-hi)", marginBottom: 6 }}>Dedicated account manager</p>
              <p style={{ fontSize: ".875rem", color: "var(--text-muted)", margin: 0 }}>
                Direct line for new orders, pricing queries, and bespoke export paperwork.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
