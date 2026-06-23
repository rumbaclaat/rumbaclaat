"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { useCart } from "@/components/cart/cart-provider";
import BrandImage from "@/components/brand-image";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Cocktails", href: "/cocktails" },
  { label: "Blog", href: "/blog" },
  { label: "Membership", href: "/membership" },
  { label: "Trade", href: "/trade" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const { count } = useCart();

  return (
    <header>
      <Navbar
        expand="lg"
        fixed="top"
        aria-label="Primary"
        className="navbar-brand-rc"
      >
        <Container>
          <Navbar.Brand as={Link} href="/" aria-label="Rumbaclaat — home">
            <BrandImage
              src="/brand/wordmark.png"
              alt="Rumbaclaat"
              className="brand-logo-img"
              fallback={
                <span className="brand-wordmark">
                  Rumbaclaat<span className="dot">.</span>
                </span>
              }
            />
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="primaryNav" />

          <Navbar.Collapse id="primaryNav">
            <Nav className="mx-auto mb-2 mb-lg-0">
              {NAV_LINKS.map((l) => (
                <Nav.Link
                  key={l.href}
                  as={Link}
                  href={l.href}
                  active={
                    l.href === "/" ? pathname === "/" : pathname.startsWith(l.href)
                  }
                >
                  {l.label}
                </Nav.Link>
              ))}
            </Nav>

            <div className="d-flex align-items-center gap-2">
              <Link className="nav-join-btn" href="/join">
                ★ Join Free
              </Link>
              <Link className="nav-icon-btn" href="/search" aria-label="Search">
                <SearchIcon />
              </Link>
              <Link
                className="nav-icon-btn"
                href="/cart"
                aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
              >
                <CartIcon />
                {count > 0 && <span className="cart-count">{count}</span>}
              </Link>
              <Link
                className="nav-icon-btn"
                href="/account"
                aria-label="My account"
              >
                <AccountIcon />
              </Link>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
