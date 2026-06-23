import Link from "next/link";
import { submitContact } from "./actions";

export const metadata = {
  title: "Contact",
  description: "Get in touch with the Rumbaclaat team — orders, trade enquiries, press and general questions.",
};

const INFO = [
  { label: "Email", value: "hello@rumbaclaat.com", href: "mailto:hello@rumbaclaat.com" },
  { label: "Trade", value: "trade@rumbaclaat.com", href: "mailto:trade@rumbaclaat.com" },
  { label: "Address", value: "14 Rum Yard, London EC1A 1AA" },
];

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { sent, error } = await searchParams;

  return (
    <>
      <section className="section-sm" style={{ background: "linear-gradient(135deg,#161208,#0E0E0E)", borderBottom: "1px solid var(--gold-bdr)" }}>
        <div className="container reveal">
          <span className="eyebrow">Get in touch</span>
          <h1>Contact us</h1>
          <p style={{ maxWidth: 480, marginTop: 10, color: "var(--text-muted)" }}>Questions about an order, a trade account, or just want to talk rum? We&apos;re here.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="row g-5">
            <div className="col-12 col-lg-5">
              <h2 className="h4 mb-3">Reach us</h2>
              {INFO.map((i) => (
                <div className="d-flex align-items-center gap-3 mb-3" key={i.label}>
                  <span className="info-icon" aria-hidden="true">✦</span>
                  <div>
                    <div style={{ fontSize: ".6875rem", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--text-dim)" }}>{i.label}</div>
                    {i.href ? <a href={i.href}>{i.value}</a> : <span>{i.value}</span>}
                  </div>
                </div>
              ))}
              <p style={{ fontSize: ".8125rem", color: "var(--text-muted)", marginTop: 20 }}>
                Looking to stock Rumbaclaat? Visit the <Link href="/trade">Trade Portal</Link>.
              </p>
            </div>

            <div className="col-12 col-lg-7">
              <div className="card-brand">
                <h2 className="h4 mb-3">Send a message</h2>
                {sent && (
                  <div role="status" className="mb-3" style={{ background: "rgba(74,222,128,.12)", border: "1px solid rgba(74,222,128,.35)", color: "var(--green)", borderRadius: 8, padding: "8px 12px", fontSize: ".875rem" }}>✓ Thanks — your message has been sent. We&apos;ll be in touch.</div>
                )}
                {error && (
                  <div role="alert" className="mb-3" style={{ background: "rgba(242,109,109,.12)", border: "1px solid rgba(242,109,109,.35)", color: "var(--red)", borderRadius: 8, padding: "8px 12px", fontSize: ".875rem" }}>Please complete name, email and message.</div>
                )}
                <form action={submitContact}>
                  <div className="row g-3">
                    <div className="col-sm-6"><label className="form-label" htmlFor="name">Name *</label><input id="name" name="name" className="form-control" required /></div>
                    <div className="col-sm-6"><label className="form-label" htmlFor="email">Email *</label><input id="email" name="email" type="email" className="form-control" required /></div>
                    <div className="col-sm-6"><label className="form-label" htmlFor="phone">Phone</label><input id="phone" name="phone" className="form-control" /></div>
                    <div className="col-sm-6"><label className="form-label" htmlFor="subject">Subject</label><input id="subject" name="subject" className="form-control" /></div>
                    <div className="col-12"><label className="form-label" htmlFor="message">Message *</label><textarea id="message" name="message" rows={5} className="form-control" required /></div>
                  </div>
                  <button type="submit" className="btn btn-gold mt-3">Send message</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
