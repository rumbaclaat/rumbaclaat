import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/product-form";
import PageHeader from "@/components/admin/ui/page-header";
import { createProduct } from "../actions";

export const dynamic = "force-dynamic";

const CHOICES = [
  { type: "rum", label: "Rum", icon: "bi-cup-straw", desc: "ABV, volume, origin, age, cask & tasting notes." },
  { type: "apparel", label: "Clothing", icon: "bi-bag-heart", desc: "Material, weight, fit & care — sizes/colours as variants." },
  { type: "cap", label: "Cap / accessory", icon: "bi-emoji-sunglasses", desc: "Material & fit, with size variants." },
  { type: "gift_card", label: "Gift card", icon: "bi-gift", desc: "Uses the base price as the amount." },
];

export default async function NewProductPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;

  if (!type) {
    return (
      <>
        <PageHeader
          title="New product"
          subtitle="What are you adding? The form adapts its attributes to the type."
          breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Products", href: "/admin/products" }, { label: "New" }]}
        />
        <div className="row g-3" style={{ maxWidth: 900 }}>
          {CHOICES.map((c) => (
            <div className="col-12 col-md-6" key={c.type}>
              <Link href={`/admin/products/new?type=${c.type}`} className="admin-card admin-choice d-block h-100 text-decoration-none">
                <div className="d-flex align-items-center gap-3">
                  <span className="admin-stat-icon" aria-hidden="true"><i className={`bi ${c.icon}`} /></span>
                  <div>
                    <div className="admin-form-section-title" style={{ fontSize: "1.1rem" }}>{c.label}</div>
                    <p className="td-muted mb-0" style={{ fontSize: ".85rem" }}>{c.desc}</p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </>
    );
  }

  const [categories, collections, taxClasses, shippingClasses] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.collection.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    prisma.taxClass.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    prisma.shippingClass.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);
  const label = type === "apparel" ? "clothing" : type.replace("_", " ");

  return (
    <>
      <PageHeader
        title={`New ${label}`}
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Products", href: "/admin/products" }, { label: `New ${label}` }]}
      />
      <ProductForm
        action={createProduct}
        categories={categories}
        collections={collections}
        taxClasses={taxClasses}
        shippingClasses={shippingClasses}
        initialType={type}
        submitLabel="Create product"
      />
    </>
  );
}
