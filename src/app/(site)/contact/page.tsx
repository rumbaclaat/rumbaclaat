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
    <section style={{ padding: "clamp(48px,7vw,84px) clamp(20px,5vw,40px) clamp(72px,9vw,110px)" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ marginBottom: 40 }}>
          <span style={{ fontSize: ".74rem", letterSpacing: ".24em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 600 }}>
            Get in touch
          </span>
          <h1 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "clamp(2.2rem,5vw,3.4rem)", lineHeight: 1.05, margin: "12px 0 0" }}>
            Contact us
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "1.05rem", lineHeight: 1.6, maxWidth: 520, margin: "14px 0 0" }}>
            Questions about an order, a trade account, or just want to talk rum? We&apos;re here.
          </p>
        </div>

        <div className="contact-grid" style={{ display: "grid", gridTemplateColumns: ".85fr 1.15fr", gap: "clamp(24px,4vw,48px)", alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "var(--surface)", border: "1px solid var(--line2)", borderRadius: 14, padding: "20px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--gold)", fontSize: ".72rem", letterSpacing: ".14em", textTransform: "uppercase", fontWeight: 600 }}>
                <i className="bi bi-envelope"></i>Email
              </div>
              <div style={{ color: "var(--text)", fontSize: "1rem", marginTop: 8 }}>
                <a href="mailto:hello@rumbaclaat.com" style={{ color: "inherit", textDecoration: "none" }}>hello@rumbaclaat.com</a>
              </div>
            </div>

            <div style={{ background: "var(--surface)", border: "1px solid var(--line2)", borderRadius: 14, padding: "20px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--gold)", fontSize: ".72rem", letterSpacing: ".14em", textTransform: "uppercase", fontWeight: 600 }}>
                <i className="bi bi-briefcase"></i>Trade
              </div>
              <div style={{ color: "var(--text)", fontSize: "1rem", marginTop: 8 }}>
                <a href="mailto:trade@rumbaclaat.com" style={{ color: "inherit", textDecoration: "none" }}>trade@rumbaclaat.com</a>
              </div>
            </div>

            <div style={{ background: "var(--surface)", border: "1px solid var(--line2)", borderRadius: 14, padding: "20px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--gold)", fontSize: ".72rem", letterSpacing: ".14em", textTransform: "uppercase", fontWeight: 600 }}>
                <i className="bi bi-geo-alt"></i>Address
              </div>
              <div style={{ color: "var(--text)", fontSize: "1rem", marginTop: 8, lineHeight: 1.5 }}>
                14 Rum Yard,<br />London EC1A 1AA
              </div>
            </div>

            <div style={{ background: "linear-gradient(160deg, rgba(205,181,130,.12), var(--surface))", border: "1px solid var(--line)", borderRadius: 14, padding: "20px 22px" }}>
              <div style={{ color: "var(--muted)", fontSize: ".88rem", lineHeight: 1.55 }}>Looking to stock Rumbaclaat?</div>
              <a href="/trade" className="contact-trade-link" style={{ display: "inline-flex", alignItems: "center", gap: 7, color: "var(--goldHi)", fontWeight: 600, fontSize: ".88rem", marginTop: 8, textDecoration: "none" }}>
                Visit the Trade Portal <i className="bi bi-arrow-right"></i>
              </a>
            </div>
          </div>

          <ContactForms action={submitContact} />
        </div>
      </div>
    </section>
  );
}
