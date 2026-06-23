import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteProduct } from "./actions";
import PageHeader from "@/components/admin/ui/page-header";
import ProductsGrid, { type ProductRow } from "@/components/admin/products/products-grid";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true, _count: { select: { variants: true } } },
  });

  const rows: ProductRow[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    imageUrl: p.imageUrl ?? "",
    category: p.category?.name ?? "—",
    price: Number(p.basePrice),
    salePrice: p.onSale && p.salePrice != null ? Number(p.salePrice) : null,
    stock: p.stockQty,
    variants: p._count.variants,
    status: p.status,
    slug: p.slug,
  }));

  return (
    <>
      <PageHeader
        title="Products"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Products" }]}
        action={
          <Link href="/admin/products/new" className="btn btn-gold btn-sm">
            <i className="bi bi-plus-lg me-1" aria-hidden="true" />New product
          </Link>
        }
      />
      <ProductsGrid rows={rows} deleteAction={deleteProduct} />
    </>
  );
}
