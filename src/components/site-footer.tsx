import Link from "next/link";

const COLS = [
  { title: "Shop", links: [
    { label: "Rum", href: "/shop?category=rum" },
    { label: "Apparel", href: "/shop?category=mens-apparel" },
    { label: "Gift cards", href: "/gift-cards" },
    { label: "All products", href: "/shop?category=all" },
  ] },
  { title: "Discover", links: [
    { label: "Cocktails", href: "/cocktails" },
    { label: "Blog", href: "/blog" },
    { label: "Membership", href: "/join" },
    { label: "About", href: "/about" },
  ] },
  { title: "Help & business", links: [
    { label: "Contact", href: "/contact" },
    { label: "Delivery", href: "/delivery" },
    { label: "FAQ", href: "/faq" },
    { label: "Trade portal", href: "/trade" },
  ] },
];

const LEGAL = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Cookies", href: "/cookies" },
];

const social: React.CSSProperties = { width: 36, height: 36, borderRadius: "50%", border: "1px solid var(--line)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" };

export default function SiteFooter() {
  return (
    <footer style={{ borderTop: "1px solid var(--line2)", background: "var(--surface)", padding: "clamp(48px,6vw,72px) clamp(20px,5vw,40px) 28px" }}>
      <div className="sf-footer-grid" style={{ maxWidth: 1240, margin: "0 auto", display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr", gap: "clamp(28px,4vw,56px)" }}>
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <span style={{ fontFamily: "var(--serif)", fontWeight: 700, fontSize: "1.4rem" }}>Rumbaclaat</span>
            <span style={{ color: "var(--gold)", fontSize: "1.4rem" }}>.</span>
          </div>
          <p style={{ color: "var(--muted)", fontSize: ".86rem", lineHeight: 1.6, maxWidth: 300, margin: "14px 0 0" }}>
            Premium Caribbean rum &amp; luxury lifestyle brand. From the canefields of Jamaica to your glass.
          </p>
          <p style={{ color: "var(--dim)", fontSize: ".74rem", lineHeight: 1.55, maxWidth: 320, margin: "16px 0 0" }}>
            Please drink responsibly. You must be 18 or over to buy alcohol. Age verified at checkout and on delivery.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <a href="https://instagram.com" aria-label="Instagram" style={social}><i className="bi bi-instagram" /></a>
            <a href="https://tiktok.com" aria-label="TikTok" style={social}><i className="bi bi-tiktok" /></a>
            <a href="https://facebook.com" aria-label="Facebook" style={social}><i className="bi bi-facebook" /></a>
          </div>
        </div>
        {COLS.map((col) => (
          <div key={col.title}>
            <div style={{ fontSize: ".72rem", letterSpacing: ".16em", textTransform: "uppercase", color: "var(--dim)", marginBottom: 15 }}>{col.title}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {col.links.map((lk) => (
                <Link key={lk.href} href={lk.href} style={{ color: "var(--muted)", fontSize: ".86rem", textDecoration: "none" }}>{lk.label}</Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ maxWidth: 1240, margin: "36px auto 0", paddingTop: 20, borderTop: "1px solid var(--line2)", display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ color: "var(--dim)", fontSize: ".78rem" }}>© 2026 Rumbaclaat Limited. All rights reserved.</span>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {LEGAL.map((lk) => (
            <Link key={lk.href} href={lk.href} style={{ color: "var(--dim)", fontSize: ".78rem", textDecoration: "none" }}>{lk.label}</Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
