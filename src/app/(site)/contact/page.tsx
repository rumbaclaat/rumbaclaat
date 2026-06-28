import { submitContact } from "./actions";
import ContactForms from "./contact-forms";

export const metadata = {
  title: "Contact",
  description: "Contact Rumbaclaat for general enquiries, trade and wholesale, or press. 18+ only.",
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  await searchParams;

  return (
    <>
      <section className="section-sm" style={{ background: "linear-gradient(135deg,#161208,#0E0E0E)", borderBottom: "1px solid var(--gold-bdr)" }}>
        <div className="container reveal">
          <span className="eyebrow">GET IN TOUCH</span>
          <h1>Contact Us</h1>
          <p style={{ maxWidth: 480, marginTop: 10 }}>General enquiries, trade questions, or press — we&apos;d love to hear from you.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="row g-5">
            <div className="col-12 col-lg-5">
              <div className="card-brand reveal mb-4">
                <h2 className="h4 mb-4">Contact Information</h2>
                <div className="d-flex gap-3 mb-3">
                  <span className="info-icon" aria-hidden="true">✉</span>
                  <div>
                    <p style={{ fontWeight: 600, color: "var(--text)", fontSize: ".875rem", marginBottom: 2 }}>Email</p>
                    <p style={{ fontSize: ".875rem" }}><a href="mailto:hello@rumbaclaat.com">hello@rumbaclaat.com</a></p>
                  </div>
                </div>
                <div className="d-flex gap-3 mb-3">
                  <span className="info-icon" aria-hidden="true">📞</span>
                  <div>
                    <p style={{ fontWeight: 600, color: "var(--text)", fontSize: ".875rem", marginBottom: 2 }}>Phone</p>
                    <p style={{ fontSize: ".875rem" }}><a href="tel:+442071234567">+44 (0)20 7123 4567</a></p>
                  </div>
                </div>
                <div className="d-flex gap-3 mb-3">
                  <span className="info-icon" aria-hidden="true">📍</span>
                  <div>
                    <p style={{ fontWeight: 600, color: "var(--text)", fontSize: ".875rem", marginBottom: 2 }}>Head Office</p>
                    <p style={{ fontSize: ".875rem" }}>14 Rum Yard, London, EC1A 1AA</p>
                  </div>
                </div>
                <div className="d-flex gap-3">
                  <span className="info-icon" aria-hidden="true">🕐</span>
                  <div>
                    <p style={{ fontWeight: 600, color: "var(--text)", fontSize: ".875rem", marginBottom: 2 }}>Hours</p>
                    <p style={{ fontSize: ".875rem" }}>Mon–Fri 9am–6pm GMT</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-7">
              <ContactForms action={submitContact} />
            </div>
          </div>
        </div>
      </section>

      <section
        className="parallax-section"
        style={{ minHeight: 380, backgroundImage: "url('https://images.unsplash.com/photo-1585216144643-ffe746118349?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1800&q=80')" }}
        aria-labelledby="listen-px"
      >
        <div className="parallax-overlay"></div>
        <div className="parallax-content reveal">
          <span className="eyebrow eyebrow-center">THE RUMBACLAAT FAMILY</span>
          <h2 id="listen-px">We&apos;re Always<br />Listening</h2>
          <p>Whether it&apos;s a trade partnership, a cocktail question, or just a story to share — we&apos;re here for every conversation.</p>
        </div>
      </section>
    </>
  );
}
