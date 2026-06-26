import Link from "next/link";
import { submitTradeApplication } from "./actions";

export const metadata = {
  title: "Apply for Trade",
  description: "Apply for a Rumbaclaat wholesale trade account. Approved within one working day.",
};

const BUSINESS_TYPES = ["Restaurant / Bar", "Off-licence / Retailer", "Wholesale Distributor", "Export / International"];
const VOLUMES = ["1–4 cases / month", "5–9 cases / month", "10–24 cases / month", "25+ cases / month"];

const labelStyle = { fontSize: ".78rem", color: "var(--text-muted)", marginBottom: 6 } as const;

export default async function TradeApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { sent, error } = await searchParams;

  if (sent) {
    return (
      <section className="section">
        <div className="container" style={{ maxWidth: 640 }}>
          <div className="card-brand text-center reveal" style={{ padding: "52px 28px" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--gold-lt)", border: "1px solid var(--gold-md)", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center" }} aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <span className="eyebrow eyebrow-center">Rumbaclaat Trade</span>
            <h1 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "clamp(2rem, 4.4vw, 3rem)", margin: "0 0 10px" }}>Application received</h1>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>Thank you. Our trade team will review your application and respond within one working day.</p>
            <Link href="/" className="btn btn-gold mt-4">Back to home</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 760 }}>
        <div className="reveal mb-4">
          <span className="eyebrow">Rumbaclaat Trade</span>
          <h1 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "clamp(2rem, 4.4vw, 3.4rem)", lineHeight: 1.05, margin: 0 }}>Apply for a trade account</h1>
          <p className="lede" style={{ color: "var(--text-muted)", fontSize: "1.0625rem", lineHeight: 1.7, marginTop: 14 }}>
            Bars, restaurants, retailers and distributors — tell us about your business and we&apos;ll be in touch within one working day.
          </p>
        </div>

        {error && (
          <div role="alert" className="mb-3" style={{ background: "rgba(236,139,139,.12)", border: "1px solid rgba(236,139,139,.35)", color: "var(--red)", borderRadius: "var(--radius)", padding: "10px 14px", fontSize: ".875rem" }}>Please complete company, contact name and email.</div>
        )}

        <form action={submitTradeApplication} className="card-brand reveal" style={{ padding: 28 }}>
          <div className="row g-3">
            <div className="col-sm-6">
              <label className="form-label" htmlFor="company" style={labelStyle}>Company name *</label>
              <input id="company" name="company" className="form-control" required />
            </div>
            <div className="col-sm-6">
              <label className="form-label" htmlFor="name" style={labelStyle}>Contact name *</label>
              <input id="name" name="name" className="form-control" required />
            </div>
            <div className="col-sm-6">
              <label className="form-label" htmlFor="email" style={labelStyle}>Business email *</label>
              <input id="email" name="email" type="email" className="form-control" required />
            </div>
            <div className="col-sm-6">
              <label className="form-label" htmlFor="phone" style={labelStyle}>Business phone</label>
              <input id="phone" name="phone" className="form-control" />
            </div>
            <div className="col-sm-6">
              <label className="form-label" htmlFor="businessType" style={labelStyle}>Business type</label>
              <select id="businessType" name="businessType" className="form-select">{BUSINESS_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
            </div>
            <div className="col-sm-6">
              <label className="form-label" htmlFor="volume" style={labelStyle}>Estimated monthly volume</label>
              <select id="volume" name="volume" className="form-select">{VOLUMES.map((v) => <option key={v}>{v}</option>)}</select>
            </div>
            <div className="col-12">
              <label className="form-label" htmlFor="vat" style={labelStyle}>VAT / Companies House number</label>
              <input id="vat" name="vat" className="form-control" />
            </div>
            <div className="col-12">
              <label className="form-label" htmlFor="message" style={labelStyle}>Anything else?</label>
              <textarea id="message" name="message" rows={4} className="form-control" />
            </div>
          </div>
          <p style={{ fontSize: ".75rem", color: "var(--text-dim)", lineHeight: 1.6, margin: "18px 0 0" }}>By applying you confirm you are an authorised buyer aged 18+. We&apos;ll store your details to process your application.</p>
          <button type="submit" className="btn btn-gold mt-3">Submit application</button>
        </form>
      </div>
    </section>
  );
}
