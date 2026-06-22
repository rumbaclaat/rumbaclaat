import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteProduct } from "./actions";

export const dynamic = "force-dynamic";

const statusColor: Record<string, string> = {
  published: "var(--green)",
  draft: "var(--yellow)",
  archived: "var(--text-dim)",
};

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true, _count: { select: { variants: true } } },
  });

  return (
    <>
      <div className="admin-page-head">
        <h1>Products</h1>
        <Link href="/admin/products/new" className="btn btn-gold btn-sm">
          + New product
        </Link>
      </div>

      <div className="admin-card p-0" style={{ overflow: "hidden" }}>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Variants</th>
                <th>Status</th>
                <th style={{ width: 1 }}></th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ color: "var(--text-dim)" }}>
                    No products yet.
                  </td>
                </tr>
              )}
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link href={`/admin/products/${p.id}`} className="gold">
                      {p.name}
                    </Link>
                  </td>
                  <td style={{ color: "var(--text-muted)" }}>{p.sku}</td>
                  <td style={{ color: "var(--text-muted)" }}>{p.category?.name ?? "—"}</td>
                  <td>
                    £{Number(p.basePrice).toFixed(2)}
                    {p.onSale && p.salePrice != null && (
                      <span style={{ color: "var(--gold-hi)" }}> → £{Number(p.salePrice).toFixed(2)}</span>
                    )}
                  </td>
                  <td>{p.stockQty}</td>
                  <td>{p._count.variants}</td>
                  <td>
                    <span style={{ color: statusColor[p.status] ?? "var(--text)", textTransform: "capitalize" }}>
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <form action={deleteProduct}>
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" className="btn btn-ghost btn-sm" style={{ color: "var(--red)" }}>
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
