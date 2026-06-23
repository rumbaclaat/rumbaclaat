import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/product-form";
import PageHeader from "@/components/admin/ui/page-header";
import { createProduct } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return (
    <>
      <PageHeader
        title="New product"
        breadcrumb={[
          { label: "Dashboard", href: "/admin" },
          { label: "Products", href: "/admin/products" },
          { label: "New product" },
        ]}
      />
      <ProductForm action={createProduct} categories={categories} submitLabel="Create product" />
    </>
  );
}
