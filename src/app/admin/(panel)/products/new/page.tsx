import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/product-form";
import PageHeader from "@/components/admin/ui/page-header";
import { createProduct } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const [categories, collections, taxClasses, shippingClasses] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.collection.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    prisma.taxClass.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    prisma.shippingClass.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);
  return (
    <>
      <PageHeader
        title="New product"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Products", href: "/admin/products" }, { label: "New product" }]}
      />
      <ProductForm
        action={createProduct}
        categories={categories}
        collections={collections}
        taxClasses={taxClasses}
        shippingClasses={shippingClasses}
        submitLabel="Create product"
      />
    </>
  );
}
