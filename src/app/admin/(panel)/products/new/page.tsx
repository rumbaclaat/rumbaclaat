import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/product-form";
import { createProduct } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return (
    <>
      <div className="admin-page-head">
        <h1>New product</h1>
      </div>
      <ProductForm action={createProduct} categories={categories} submitLabel="Create product" />
    </>
  );
}
