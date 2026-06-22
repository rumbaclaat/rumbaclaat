import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [products, categories, tiers, pages, posts, cocktails, media] =
    await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.membershipTier.count(),
      prisma.page.count(),
      prisma.blogPost.count(),
      prisma.cocktail.count(),
      prisma.media.count(),
    ]);

  const stats = [
    { label: "Products", value: products, href: "/admin/products" },
    { label: "Categories", value: categories, href: "/admin/categories" },
    { label: "Membership tiers", value: tiers, href: "/admin/settings" },
    { label: "Pages", value: pages, href: "/admin/pages" },
    { label: "Blog posts", value: posts, href: "/admin/blog" },
    { label: "Cocktails", value: cocktails, href: "/admin/cocktails" },
    { label: "Media files", value: media, href: "/admin/media" },
  ];

  return (
    <>
      <div className="admin-page-head">
        <h1>Dashboard</h1>
      </div>

      <div className="row g-3">
        {stats.map((s) => (
          <div className="col-6 col-md-4 col-xl-3" key={s.label}>
            <Link href={s.href} className="admin-stat d-block h-100 text-decoration-none">
              <div className="admin-stat-num">{s.value}</div>
              <div className="admin-stat-label">{s.label}</div>
            </Link>
          </div>
        ))}
      </div>

      <div className="admin-card mt-4">
        <h2 className="h5">Quick start</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: 12 }}>
          Manage your catalogue, build pages from content blocks, and edit
          editorial content. Everything here is read live by the storefront.
        </p>
        <div className="d-flex gap-2 flex-wrap">
          <Link href="/admin/products" className="btn btn-gold btn-sm">
            Manage products
          </Link>
          <Link href="/admin/pages" className="btn btn-outline-gold btn-sm">
            Edit pages
          </Link>
          <Link href="/admin/settings" className="btn btn-outline-gold btn-sm">
            Settings
          </Link>
        </div>
      </div>
    </>
  );
}
