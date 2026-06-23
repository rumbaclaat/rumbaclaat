import Link from "next/link";
import { submitTradeApplication } from "./actions";

export const metadata = {
  title: "Apply for Trade",
  description: "Apply for a Rumbaclaat wholesale trade account. Approved within one working day.",
};

const BUSINESS_TYPES = ["Restaurant / Bar", "Off-licence / Retailer", "Wholesale Distributor", "Export / International"];
const VOLUMES = ["1–4 cases / month", "5–9 cases / month", "10–24 cases / month", "25+ cases / month"];

export default async function TradeApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { sent, error } = await searchParams;

  if (sent) {
    return (
      <div className="container section" style={{ maxWidth: 640 }}>
        <div className="card-brand text-center" style={{ padding: "48px 24px" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(74,222,128,.12)", border: "1px solid rgba(74,222,128,.4)", margin: "0 auto 18px", display: "flex", alignItems: "center", justifyContent: "center" }} aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <h1 className="mb-2">Application received</h1>
          <p style={{ color: "var(--text-muted)" }}>Thank you. Our trade team will review your application and respond within one working day.</p>
          <Link href="/" className="btn btn-gold mt-3">Back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container section" style={{ maxWidth: 760 }}>
      <div className="mb-4">
        <span className="eyebrow">Rumbaclaat Trade</span>
        <h1>Apply for a trade account</h1>
        <p style={{ color: "var(--text-muted)" }}>Bars, restaurants, retailers and distributors — tell us about your business and we&apos;ll be in touch within one working day.</p>
      </div>

      {error && (
        <div role="alert" className="mb-3" style={{ background: "rgba(242,109,109,.12)", border: "1px solid rgba(242,109,109,.35)", color: "var(--red)", borderRadius: 8, padding: "8px 12px", fontSize: ".875rem" }}>Please complete company, contact name and email.</div>
      )}

      <form action={submitTradeApplication} className="card-brand">
        <div className="row g-3">
          <div className="col-sm-6"><label className="form-label" htmlFor="company">Company name *</label><input id="company" name="company" className="form-control" required /></div>
          <div className="col-sm-6"><label className="form-label" htmlFor="name">Contact name *</label><input id="name" name="name" className="form-control" required /></div>
          <div className="col-sm-6"><label className="form-label" htmlFor="email">Business email *</label><input id="email" name="email" type="email" className="form-control" required /></div>
          <div className="col-sm-6"><label className="form-label" htmlFor="phone">Business phone</label><input id="phone" name="phone" className="form-control" /></div>
          <div className="col-sm-6"><label className="form-label" htmlFor="businessType">Business type</label>
            <select id="businessType" name="businessType" className="form-select">{BUSINESS_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
          </div>
          <div className="col-sm-6"><label className="form-label" htmlFor="volume">Estimated monthly volume</label>
            <select id="volume" name="volume" className="form-select">{VOLUMES.map((v) => <option key={v}>{v}</option>)}</select>
          </div>
          <div className="col-12"><label className="form-label" htmlFor="vat">VAT / Companies House number</label><input id="vat" name="vat" className="form-control" /></div>
          <div className="col-12"><label className="form-label" htmlFor="message">Anything else?</label><textarea id="message" name="message" rows={4} className="form-control" /></div>
        </div>
        <p style={{ fontSize: ".75rem", color: "var(--text-dim)", margin: "14px 0" }}>By applying you confirm you are an authorised buyer aged 18+. We&apos;ll store your details to process your application.</p>
        <button type="submit" className="btn btn-gold">Submit application</button>
      </form>
    </div>
  );
}
