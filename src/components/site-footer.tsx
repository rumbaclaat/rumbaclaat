import Link from "next/link";
import BrandImage from "@/components/brand-image";

const COLUMNS = [
  {
    heading: "Shop",
    links: [
      { label: "Rum Collection", href: "/shop?category=rum" },
      { label: "Men's Apparel", href: "/shop?category=mens-apparel" },
      { label: "Women's Apparel", href: "/shop?category=womens-apparel" },
      { label: "Cart", href: "/cart" },
    ],
  },
  {
    heading: "Discover",
    links: [
      { label: "Cocktail Recipes", href: "/cocktails" },
      { label: "Blog & Stories", href: "/blog" },
      { label: "RPM", href: "/join" },
      { label: "Member Portal", href: "/membership" },
      { label: "Newsletter", href: "/newsletter" },
      { label: "Gift Cards", href: "/gift-cards" },
      { label: "About Us", href: "/about" },
    ],
  },
  {
    heading: "Help & Business",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Trade Portal", href: "/trade" },
      { label: "Press", href: "/press" },
      { label: "Where to buy", href: "/where-to-buy" },
      { label: "Contact Us", href: "/contact" },
      { label: "My Account", href: "/account" },
      { label: "Delivery Policy", href: "/delivery" },
    ],
  },
];

const SOCIALS = [
  { label: "Facebook", href: "https://www.facebook.com/", d: "M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12H16l-.4 2.9h-2.2v7A10 10 0 0 0 22 12Z" },
  { label: "Instagram", href: "https://www.instagram.com/", d: "M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.5.5.7.9.9 1.4.2.5.4 1.1.4 2.2.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.5.5-.9.7-1.4.9-.5.2-1.1.4-2.2.4-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.2-2.2-.4a3.7 3.7 0 0 1-1.4-.9 3.7 3.7 0 0 1-.9-1.4c-.2-.5-.4-1.1-.4-2.2-.1-1.3-.1-1.6-.1-4.8s0-3.6.1-4.8c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.5-.5.9-.7 1.4-.9.5-.2 1.1-.4 2.2-.4 1.3-.1 1.6-.1 4.8-.1ZM12 5.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.4-11.8a1.4 1.4 0 1 0 0 2.9 1.4 1.4 0 0 0 0-2.9Z" },
  { label: "LinkedIn", href: "https://www.linkedin.com/", d: "M20.5 2h-17A1.5 1.5 0 0 0 2 3.5v17A1.5 1.5 0 0 0 3.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-17A1.5 1.5 0 0 0 20.5 2ZM8 19H5V9h3v10Zm-1.5-11.3A1.7 1.7 0 1 1 6.5 4.3a1.7 1.7 0 0 1 0 3.4ZM19 19h-3v-5c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V19h-3V9h2.9v1.4h.1a3.2 3.2 0 0 1 2.9-1.6c3.1 0 3.7 2 3.7 4.7V19Z" },
  { label: "TikTok", href: "https://www.tiktok.com/", d: "M21 8.6a8.4 8.4 0 0 1-4.9-1.6v7.5a6.2 6.2 0 1 1-5.4-6.1v3a3.2 3.2 0 1 0 2.4 3.1V2h2.9a5.5 5.5 0 0 0 5 5v3.6Z" },
];

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="row g-4 mb-4">
          <div className="col-12 col-lg-5">
            <BrandImage
              src="/brand/wordmark.png"
              alt="Rumbaclaat"
              className="footer-logo-img mb-3"
              fallback={
                <div className="brand-wordmark mb-3" style={{ fontSize: "1.6rem", display: "inline-block" }}>
                  Rumbaclaat<span className="dot">.</span>
                </div>
              }
            />
            <p style={{ fontSize: ".875rem", maxWidth: 300 }}>
              Premium Caribbean rum &amp; luxury lifestyle brand. From the canefields of Jamaica to your glass.
            </p>
            <p style={{ fontSize: ".75rem", color: "var(--text-dim)" }}>
              Please drink responsibly. You must be 18 or over to buy alcohol. Age verified at checkout and on delivery.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.heading} className={`col-6 footer-col ${col.heading === "Help & Business" ? "col-lg-3" : "col-lg-2"}`} aria-label={col.heading}>
              <h2>{col.heading}</h2>
              {col.links.map((l) => (
                <Link key={l.href + l.label} href={l.href}>{l.label}</Link>
              ))}
            </nav>
          ))}
        </div>

        {/* Partners + socials */}
        <div className="footer-meta-row">
          <div className="footer-partners">
            <a className="footer-drinkaware" href="https://www.drinkaware.co.uk/" rel="noopener" target="_blank" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: ".8125rem", letterSpacing: ".05em" }}>
              Drinkaware.co.uk
            </a>
            <BrandImage
              src="/brand/intl-drinks-specialist.png"
              alt="International Drinks Specialists — 92 / 100"
              className="footer-accreditation-img"
              fallback={
                <span className="footer-accreditation" style={{ color: "var(--text-dim)", fontSize: ".75rem" }}>
                  International Drinks Specialists — 92 / 100
                </span>
              }
            />
          </div>
          <ul className="footer-socials list-unstyled m-0" aria-label="Rumbaclaat on social media">
            {SOCIALS.map((s) => (
              <li key={s.label}>
                <a href={s.href} rel="noopener" target="_blank" aria-label={`Rumbaclaat on ${s.label}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d={s.d} /></svg>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
          <span>© {new Date().getFullYear()} Rumbaclaat Limited. All rights reserved.</span>
          <span className="d-flex gap-4 flex-wrap">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/cookies">Cookies</Link>
            <Link href="/cookie-preferences">Cookie preferences</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
