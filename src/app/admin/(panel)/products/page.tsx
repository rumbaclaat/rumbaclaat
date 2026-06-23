import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteProduct, bulkProductStatus, bulkDeleteProducts, importProductsCsv } from "./actions";
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
          <div className="d-flex gap-2">
            <details className="admin-import">
              <summary className="btn btn-ghost btn-sm"><i className="bi bi-upload me-1" aria-hidden="true" />Import CSV</summary>
              <form action={importProductsCsv} className="admin-card mt-2" style={{ position: "absolute", zIndex: 20, width: 320 }}>
                <p className="td-muted" style={{ fontSize: ".78rem" }}>Columns: name, sku, type, price, stock, status</p>
                <input type="file" name="file" accept=".csv" className="form-control form-control-sm mb-2" required />
                <button type="submit" className="btn btn-gold btn-sm w-100">Import</button>
              </form>
            </details>
            <Link href="/admin/products/new" className="btn btn-gold btn-sm">
              <i className="bi bi-plus-lg me-1" aria-hidden="true" />New product
            </Link>
          </div>
        }
      />
      <ProductsGrid rows={rows} deleteAction={deleteProduct} bulkStatus={bulkProductStatus} bulkDelete={bulkDeleteProducts} />
    </>
  );
}
