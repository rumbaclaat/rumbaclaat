"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const NAV: { href: string; label: string; exact?: boolean; group?: string }[] = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/enquiries", label: "Enquiries" },
  { href: "/admin/products", label: "Products", group: "Catalogue" },
  { href: "/admin/categories", label: "Categories", group: "Catalogue" },
  { href: "/admin/promotions", label: "Promotions", group: "Catalogue" },
  { href: "/admin/pages", label: "Pages", group: "Content" },
  { href: "/admin/blog", label: "Blog", group: "Content" },
  { href: "/admin/cocktails", label: "Cocktails", group: "Content" },
  { href: "/admin/media", label: "Media", group: "Content" },
  { href: "/admin/navigation", label: "Navigation", group: "Site" },
  { href: "/admin/banners", label: "Banners", group: "Site" },
  { href: "/admin/settings", label: "Settings", group: "Site" },
];

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

  const groups = Array.from(
    new Set(NAV.filter((n) => n.group).map((n) => n.group as string))
  );

  function isActive(item: (typeof NAV)[number]) {
    return item.exact ? pathname === item.href : pathname.startsWith(item.href);
  }

  return (
    <div className="admin-wrap">
      <aside className={`admin-sidebar${open ? " open" : ""}`}>
        <div className="admin-brand">
          <Link href="/admin" className="brand-wordmark" style={{ fontSize: "1.1rem" }}>
            Rumbaclaat<span className="dot">.</span>
          </Link>
          <span className="admin-brand-tag">Admin</span>
        </div>

        <nav className="admin-nav" aria-label="Admin">
          {NAV.filter((n) => !n.group).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-link${isActive(item) ? " active" : ""}`}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          {groups.map((g) => (
            <div key={g} className="admin-nav-group">
              <div className="admin-nav-group-label">{g}</div>
              {NAV.filter((n) => n.group === g).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`admin-nav-link${isActive(item) ? " active" : ""}`}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar-foot">
          <Link href="/" className="admin-nav-link" target="_blank">
            ↗ View site
          </Link>
          <button type="button" className="btn btn-outline-gold btn-sm w-100 mt-2" onClick={logout}>
            Sign out
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <button
            type="button"
            className="btn btn-ghost btn-sm d-lg-none"
            aria-label="Toggle menu"
            onClick={() => setOpen((o) => !o)}
          >
            ☰
          </button>
          <div className="ms-auto admin-user">
            <span className="admin-user-name">{name}</span>
            <span className="admin-user-role">{role.replace(/_/g, " ")}</span>
          </div>
        </header>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
