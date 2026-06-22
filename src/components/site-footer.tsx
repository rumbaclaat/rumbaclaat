import Link from "next/link";

const COLUMNS = [
  {
    heading: "Shop",
    links: [
      { label: "Rum Collection", href: "/shop-rum" },
      { label: "Men's Apparel", href: "/shop-men" },
      { label: "Women's Apparel", href: "/shop-women" },
      { label: "Cart", href: "/cart" },
    ],
  },
  {
    heading: "Discover",
    links: [
      { label: "Cocktail Recipes", href: "/cocktails" },
      { label: "Blog & Stories", href: "/blog" },
      { label: "Membership", href: "/join" },
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

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="row g-4 mb-4">
          <div className="col-12 col-lg-5">
            <div className="brand-wordmark mb-3" style={{ fontSize: "1.6rem" }}>
              Rumbaclaat<span className="dot">.</span>
            </div>
            <p style={{ fontSize: ".875rem", maxWidth: 320 }}>
              Premium Caribbean rum &amp; luxury lifestyle brand. From the
              canefields of Jamaica to your glass.
            </p>
            <p style={{ fontSize: ".75rem", color: "var(--text-dim)" }}>
              Please drink responsibly. You must be 18 or over to buy alcohol.
              Age verified at checkout and on delivery.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <nav
              key={col.heading}
              className="col-6 col-lg-2 footer-col"
              aria-label={col.heading}
            >
              <h2>{col.heading}</h2>
              {col.links.map((l) => (
                <Link key={l.href + l.label} href={l.href}>
                  {l.label}
                </Link>
              ))}
            </nav>
          ))}
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
