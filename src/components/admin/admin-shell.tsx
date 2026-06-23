"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Offcanvas from "react-bootstrap/Offcanvas";
import Dropdown from "react-bootstrap/Dropdown";
import { createClient } from "@/lib/supabase/client";

type NavItem = { href: string; label: string; icon: string; exact?: boolean; group?: string };

const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "bi-speedometer2", exact: true },
  { href: "/admin/analytics", label: "Analytics", icon: "bi-graph-up" },
  { href: "/admin/orders", label: "Orders", icon: "bi-bag" },
  { href: "/admin/customers", label: "Customers", icon: "bi-people" },
  { href: "/admin/trade", label: "Trade accounts", icon: "bi-briefcase" },
  { href: "/admin/enquiries", label: "Enquiries", icon: "bi-chat-left-text" },
  { href: "/admin/products", label: "Products", icon: "bi-box-seam", group: "Catalogue" },
  { href: "/admin/categories", label: "Categories", icon: "bi-tags", group: "Catalogue" },
  { href: "/admin/collections", label: "Collections", icon: "bi-collection", group: "Catalogue" },
  { href: "/admin/inventory", label: "Inventory", icon: "bi-boxes", group: "Catalogue" },
  { href: "/admin/promotions", label: "Promotions", icon: "bi-percent", group: "Catalogue" },
  { href: "/admin/gift-cards", label: "Gift cards", icon: "bi-gift", group: "Catalogue" },
  { href: "/admin/tax-classes", label: "Tax classes", icon: "bi-receipt", group: "Catalogue" },
  { href: "/admin/shipping-classes", label: "Shipping classes", icon: "bi-truck", group: "Catalogue" },
  { href: "/admin/reviews", label: "Reviews", icon: "bi-star", group: "Catalogue" },
  { href: "/admin/pages", label: "Pages", icon: "bi-file-earmark-text", group: "Content" },
  { href: "/admin/blog", label: "Blog", icon: "bi-journal-text", group: "Content" },
  { href: "/admin/cocktails", label: "Cocktails", icon: "bi-cup-straw", group: "Content" },
  { href: "/admin/faq", label: "FAQ", icon: "bi-question-circle", group: "Content" },
  { href: "/admin/media", label: "Media", icon: "bi-images", group: "Content" },
  { href: "/admin/membership", label: "Membership tiers", icon: "bi-award", group: "Loyalty" },
  { href: "/admin/rewards", label: "Rewards", icon: "bi-trophy", group: "Loyalty" },
  { href: "/admin/newsletter", label: "Newsletter", icon: "bi-envelope-paper", group: "Marketing" },
  { href: "/admin/navigation", label: "Navigation", icon: "bi-diagram-3", group: "Site" },
  { href: "/admin/banners", label: "Banners", icon: "bi-flag", group: "Site" },
  { href: "/admin/redirects", label: "Redirects", icon: "bi-signpost-split", group: "Site" },
  { href: "/admin/shipping-zones", label: "Shipping zones", icon: "bi-globe", group: "Site" },
  { href: "/admin/currencies", label: "Currencies", icon: "bi-currency-exchange", group: "Site" },
  { href: "/admin/settings", label: "Settings", icon: "bi-gear", group: "Site" },
  { href: "/admin/staff", label: "Staff", icon: "bi-person-badge", group: "Access" },
  { href: "/admin/audit", label: "Audit log", icon: "bi-clipboard-check", group: "Access" },
];

const GROUPS = Array.from(new Set(NAV.filter((n) => n.group).map((n) => n.group as string)));

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "RC";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function Brand() {
  return (
    <div className="admin-brand">
      <Link href="/admin" className="brand-wordmark" style={{ fontSize: "1.1rem" }}>
        Rumbaclaat<span className="dot">.</span>
      </Link>
      <span className="admin-brand-tag">Admin</span>
    </div>
  );
}

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const renderLink = (item: NavItem) => (
    <Link
      key={item.href}
      href={item.href}
      className={`admin-nav-link${isActive(item) ? " active" : ""}`}
      aria-current={isActive(item) ? "page" : undefined}
      onClick={onNavigate}
    >
      <i className={`bi ${item.icon} admin-nav-ico`} aria-hidden="true" />
      <span>{item.label}</span>
    </Link>
  );

  return (
    <nav className="admin-nav" aria-label="Admin">
      {NAV.filter((n) => !n.group).map(renderLink)}
      {GROUPS.map((g) => (
        <div key={g} className="admin-nav-group">
          <div className="admin-nav-group-label">{g}</div>
          {NAV.filter((n) => n.group === g).map(renderLink)}
        </div>
      ))}
    </nav>
  );
}

function SidebarFoot({
  onLogout,
  onNavigate,
}: {
  onLogout: () => void;
  onNavigate?: () => void;
}) {
  return (
    <div className="admin-sidebar-foot">
      <Link href="/" className="admin-nav-link" target="_blank" onClick={onNavigate}>
        <i className="bi bi-box-arrow-up-right admin-nav-ico" aria-hidden="true" />
        <span>View site</span>
      </Link>
      <button type="button" className="btn btn-outline-gold btn-sm w-100" onClick={onLogout}>
        Sign out
      </button>
    </div>
  );
}

export default function AdminShell({
  name,
  email,
  role,
  children,
}: {
  name: string;
  email: string;
  role: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  const prettyRole = role.replace(/_/g, " ");

  return (
    <div className="admin-wrap">
      {/* Desktop sidebar */}
      <aside className="admin-sidebar">
        <Brand />
        <NavLinks pathname={pathname} />
        <SidebarFoot onLogout={logout} />
      </aside>

      {/* Mobile offcanvas sidebar */}
      <Offcanvas
        show={open}
        onHide={() => setOpen(false)}
        placement="start"
        className="admin-offcanvas"
        aria-label="Admin navigation"
      >
        <Offcanvas.Header closeButton closeVariant="white">
          <Offcanvas.Title>
            <span className="brand-wordmark" style={{ fontSize: "1.1rem" }}>
              Rumbaclaat<span className="dot">.</span>
            </span>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0 d-flex flex-column">
          <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
          <SidebarFoot onLogout={logout} onNavigate={() => setOpen(false)} />
        </Offcanvas.Body>
      </Offcanvas>

      <div className="admin-main">
        <header className="admin-topbar">
          <button
            type="button"
            className="admin-hamburger"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <i className="bi bi-list" aria-hidden="true" />
          </button>

          {/* Global search (styled placeholder — wired in a later phase) */}
          <form
            className="admin-search input-group input-group-sm d-none d-sm-flex"
            role="search"
            onSubmit={(e) => e.preventDefault()}
          >
            <span className="input-group-text" aria-hidden="true">
              <i className="bi bi-search" />
            </span>
            <input
              type="search"
              className="form-control"
              placeholder="Search the admin…"
              aria-label="Search the admin"
            />
          </form>

          <Dropdown align="end" className="ms-auto">
            <Dropdown.Toggle
              as="button"
              type="button"
              className="admin-user-toggle"
              id="admin-user-menu"
              aria-label="Account menu"
            >
              <span className="admin-avatar" aria-hidden="true">{initialsOf(name)}</span>
              <span className="admin-user d-none d-md-flex">
                <span className="admin-user-name">{name}</span>
                <span className="admin-user-role">{prettyRole}</span>
              </span>
              <i className="bi bi-chevron-down" aria-hidden="true" style={{ fontSize: ".7rem", color: "var(--text-dim)" }} />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Header>
                <div style={{ fontWeight: 600, color: "var(--text)" }}>{name}</div>
                <div style={{ fontSize: ".78rem", color: "var(--text-dim)" }}>{email}</div>
              </Dropdown.Header>
              <Dropdown.Item href="/" target="_blank" rel="noopener">
                <i className="bi bi-box-arrow-up-right me-2" aria-hidden="true" />View site
              </Dropdown.Item>
              <Dropdown.Item as={Link} href="/admin/settings">
                <i className="bi bi-gear me-2" aria-hidden="true" />Settings
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item as="button" type="button" onClick={logout}>
                <i className="bi bi-box-arrow-right me-2" aria-hidden="true" />Sign out
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </header>

        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
