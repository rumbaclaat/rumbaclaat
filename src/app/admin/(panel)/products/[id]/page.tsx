import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/product-form";
import PageHeader from "@/components/admin/ui/page-header";
import AdminCard from "@/components/admin/ui/admin-card";
import VariantEditor from "@/components/admin/products/variant-editor";
import { updateProduct, cloneProduct, addVariant, updateVariant, deleteVariant, reorderVariants } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories, collections, taxClasses, shippingClasses] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { variants: { orderBy: { sortOrder: "asc" } }, collections: true } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.collection.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    prisma.taxClass.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    prisma.shippingClass.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!product) notFound();
  const collectionIds = product.collections.map((c) => c.collectionId);

  return (
    <>
      <PageHeader
        title="Edit product"
        subtitle={product.sku}
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Products", href: "/admin/products" }, { label: product.name }]}
        action={
          <div className="d-flex gap-2">
            <form action={cloneProduct}>
              <input type="hidden" name="id" value={product.id} />
              <button type="submit" className="btn btn-ghost btn-sm"><i className="bi bi-files me-1" />Duplicate</button>
            </form>
            <Link href={`/product/${product.slug}`} target="_blank" className="btn btn-outline-gold btn-sm">View ↗</Link>
          </div>
        }
      />

      <ProductForm
        action={updateProduct}
        product={product}
        categories={categories}
        collections={collections}
        taxClasses={taxClasses}
        shippingClasses={shippingClasses}
        collectionIds={collectionIds}
        submitLabel="Save changes"
      />

      <AdminCard title={`Variants (${product.variants.length})`} className="mt-4">
        <VariantEditor
          productId={product.id}
          variants={product.variants.map((v) => ({
            id: v.id, name: v.name, colourName: v.colourName, colourHex: v.colourHex, size: v.size,
            sku: v.sku, priceDelta: Number(v.priceDelta), stockQty: v.stockQty, imageUrl: v.imageUrl, active: v.active,
          }))}
          updateAction={updateVariant}
          deleteAction={deleteVariant}
          addAction={addVariant}
          reorderAction={reorderVariants}
        />
      </AdminCard>
    </>
  );
}
