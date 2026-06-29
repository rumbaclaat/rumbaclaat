"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/cart/cart-provider";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Cocktails", href: "/cocktails" },
  { label: "Blog", href: "/blog" },
  { label: "Membership", href: "/join" },
  { label: "Trade", href: "/trade" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header
      style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "color-mix(in srgb, var(--bg) 88%, transparent)",
        backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
        borderBottom: "1px solid var(--line2)",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", gap: 26, height: 68, padding: "0 clamp(18px,4vw,40px)" }}>
        <Link href="/" aria-label="Rumbaclaat — home" style={{ display: "flex", alignItems: "baseline", gap: 1, textDecoration: "none", flex: "0 0 auto" }}>
          <span style={{ fontFamily: "var(--serif)", fontWeight: 700, fontSize: "1.5rem", color: "var(--text)", letterSpacing: ".01em" }}>Rumbaclaat</span>
          <span style={{ color: "var(--gold)", fontSize: "1.5rem", lineHeight: 1 }}>.</span>
        </Link>

        <nav className="sf-nav" aria-label="Primary" style={{ display: "flex", alignItems: "center", gap: 3, marginLeft: 8, flex: "1 1 auto" }}>
          {NAV_LINKS.map((l) => {
            const active = isActive(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                style={{ padding: "8px 12px", borderRadius: 999, fontSize: ".88rem", fontWeight: active ? 600 : 500, textDecoration: "none", color: active ? "var(--goldHi)" : "var(--muted)", background: active ? "var(--gold-lt)" : "transparent" }}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 14, flex: "0 0 auto" }}>
          <Link href="/join" className="sf-join" style={{ display: "inline-flex", alignItems: "center", gap: 7, border: "1px solid var(--gold)", color: "var(--goldHi)", borderRadius: 999, padding: "8px 16px", fontSize: ".82rem", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>
            <i className="bi bi-star-fill" style={{ fontSize: ".72rem" }} />Join Free
          </Link>
          <Link href="/account" title="My account" aria-label="My account" style={{ color: "var(--text)", fontSize: "1.12rem", display: "inline-flex" }}>
            <i className="bi bi-person" />
          </Link>
          <Link href="/cart" aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`} style={{ position: "relative", color: "var(--text)", fontSize: "1.15rem", display: "inline-flex" }}>
            <i className="bi bi-bag" />
            {count > 0 && (
              <span style={{ position: "absolute", top: -5, right: -7, background: "var(--gold)", color: "var(--onGold)", fontSize: ".6rem", fontWeight: 700, width: 15, height: 15, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>{count}</span>
            )}
          </Link>
          <button type="button" className="sf-burger" onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open} style={{ display: "none", background: "none", border: 0, color: "var(--text)", fontSize: "1.4rem", cursor: "pointer", padding: 0, lineHeight: 1 }}>
            <i className={`bi ${open ? "bi-x-lg" : "bi-list"}`} />
          </button>
        </div>
      </div>

      {open && (
        <nav className="sf-mobile-nav" aria-label="Primary mobile" style={{ display: "flex", flexDirection: "column", padding: "6px 20px 16px", borderTop: "1px solid var(--line2)", background: "var(--bg)" }}>
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} style={{ padding: "11px 4px", color: isActive(l.href) ? "var(--goldHi)" : "var(--muted)", textDecoration: "none", fontSize: ".96rem", borderBottom: "1px solid var(--line2)" }}>
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
