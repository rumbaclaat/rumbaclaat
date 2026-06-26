import Link from "next/link";
import { submitContact } from "./actions";

export const metadata = {
  title: "Contact",
  description: "Get in touch with the Rumbaclaat team — orders, trade enquiries, press and general questions.",
};

const INFO = [
  { label: "Email", value: "hello@rumbaclaat.com", href: "mailto:hello@rumbaclaat.com", icon: "✉" },
  { label: "Trade", value: "trade@rumbaclaat.com", href: "mailto:trade@rumbaclaat.com", icon: "❖" },
  { label: "Address", value: "14 Rum Yard, London EC1A 1AA", icon: "✦" },
];

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { sent, error } = await searchParams;

  return (
    <>
      <section className="section-sm section--sunken">
        <div className="container reveal" style={{ maxWidth: 820 }}>
          <span className="eyebrow">Get in touch</span>
          <h1 className="serif" style={{ fontSize: "clamp(2rem, 4.4vw, 3.4rem)" }}>Contact us</h1>
          <p style={{ maxWidth: 560, marginTop: 14, color: "var(--text-muted)", fontSize: "1.0625rem", lineHeight: 1.7 }}>
            Questions about an order, a trade account, or just want to talk rum? We&apos;re here.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 1100 }}>
          <div className="row g-4 g-lg-5">
            <div className="col-12 col-lg-5">
              <span className="eyebrow">Reach us</span>
              <h2 className="serif" style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", marginBottom: 24 }}>How to find us</h2>

              <div className="d-flex flex-column gap-3">
                {INFO.map((i) => (
                  <div className="card-brand d-flex align-items-center gap-3" style={{ padding: "18px 20px" }} key={i.label}>
                    <span className="info-icon" aria-hidden="true">{i.icon}</span>
                    <div>
                      <div style={{ fontSize: ".6875rem", letterSpacing: ".18em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 4 }}>{i.label}</div>
                      {i.href
                        ? <a href={i.href} style={{ fontSize: "1.0625rem" }}>{i.value}</a>
                        : <span style={{ fontSize: "1.0625rem", color: "var(--text)" }}>{i.value}</span>}
                    </div>
                  </div>
                ))}
              </div>

              <p style={{ fontSize: ".875rem", color: "var(--text-muted)", marginTop: 24, lineHeight: 1.7 }}>
                Looking to stock Rumbaclaat? Visit the <Link href="/trade">Trade Portal</Link>.
              </p>
            </div>

            <div className="col-12 col-lg-7">
              <div className="card-brand card-brand--feature" style={{ padding: 32 }}>
                <span className="eyebrow">Send a message</span>
                <h2 className="serif" style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", marginBottom: 8 }}>Drop us a line</h2>
                <p style={{ color: "var(--text-muted)", fontSize: ".9375rem", marginBottom: 24 }}>
                  Fill in the form and we&apos;ll get back to you, usually within two working days.
                </p>

                {sent && (
                  <div role="status" className="mb-4" style={{ background: "rgba(111,207,151,.12)", border: "1px solid rgba(111,207,151,.35)", color: "var(--green)", borderRadius: "var(--radius)", padding: "10px 14px", fontSize: ".875rem" }}>✓ Thanks — your message has been sent. We&apos;ll be in touch.</div>
                )}
                {error && (
                  <div role="alert" className="mb-4" style={{ background: "rgba(236,139,139,.12)", border: "1px solid rgba(236,139,139,.35)", color: "var(--red)", borderRadius: "var(--radius)", padding: "10px 14px", fontSize: ".875rem" }}>Please complete name, email and message.</div>
                )}

                <form action={submitContact}>
                  <div className="row g-3">
                    <div className="col-sm-6"><label className="form-label" htmlFor="name">Name *</label><input id="name" name="name" className="form-control" required /></div>
                    <div className="col-sm-6"><label className="form-label" htmlFor="email">Email *</label><input id="email" name="email" type="email" className="form-control" required /></div>
                    <div className="col-sm-6"><label className="form-label" htmlFor="phone">Phone</label><input id="phone" name="phone" className="form-control" /></div>
                    <div className="col-sm-6"><label className="form-label" htmlFor="subject">Subject</label><input id="subject" name="subject" className="form-control" /></div>
                    <div className="col-12"><label className="form-label" htmlFor="message">Message *</label><textarea id="message" name="message" rows={5} className="form-control" required /></div>
                  </div>
                  <button type="submit" className="btn btn-gold btn-lg mt-4">Send message</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
