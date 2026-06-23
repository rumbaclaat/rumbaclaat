import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/product-form";
import PageHeader from "@/components/admin/ui/page-header";
import AdminCard from "@/components/admin/ui/admin-card";
import { updateProduct, addVariant, deleteVariant } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { variants: { orderBy: { sku: "asc" } } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();

  return (
    <>
      <PageHeader
        title="Edit product"
        subtitle={product.sku}
        breadcrumb={[
          { label: "Dashboard", href: "/admin" },
          { label: "Products", href: "/admin/products" },
          { label: product.name },
        ]}
        action={
          <Link href={`/product/${product.slug}`} target="_blank" className="btn btn-outline-gold btn-sm">
            View ↗
          </Link>
        }
      />

      <ProductForm
        action={updateProduct}
        product={product}
        categories={categories}
        submitLabel="Save changes"
      />

      {/* Variants */}
      <AdminCard title={`Variants (${product.variants.length})`} className="mt-4">
        <div className="table-responsive mb-3">
          <table className="admin-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Colour</th>
                <th>Size</th>
                <th>+£</th>
                <th>Stock</th>
                <th style={{ width: 1 }}></th>
              </tr>
            </thead>
            <tbody>
              {product.variants.length === 0 && (
                <tr>
                  <td colSpan={6} className="td-muted">
                    No variants.
                  </td>
                </tr>
              )}
              {product.variants.map((v) => (
                <tr key={v.id}>
                  <td className="td-muted">{v.sku}</td>
                  <td>
                    {v.colourName ?? "—"}
                    {v.colourHex && (
                      <span
                        style={{
                          display: "inline-block",
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background: v.colourHex,
                          marginLeft: 6,
                          border: "1px solid rgba(255,255,255,.2)",
                        }}
                      />
                    )}
                  </td>
                  <td>{v.size ?? "—"}</td>
                  <td>{Number(v.priceDelta).toFixed(2)}</td>
                  <td>{v.stockQty}</td>
                  <td>
                    <form action={deleteVariant}>
                      <input type="hidden" name="id" value={v.id} />
                      <input type="hidden" name="productId" value={product.id} />
                      <button type="submit" className="btn btn-ghost btn-sm" style={{ color: "var(--red)" }}>
                        Remove
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form action={addVariant} className="row g-2 align-items-end">
          <input type="hidden" name="productId" value={product.id} />
          <div className="col-6 col-md-2">
            <label className="form-label" htmlFor="v-colour">Colour</label>
            <input id="v-colour" name="colourName" className="form-control form-control-sm" />
          </div>
          <div className="col-6 col-md-2">
            <label className="form-label" htmlFor="v-hex">Hex</label>
            <input id="v-hex" name="colourHex" className="form-control form-control-sm" placeholder="#000000" />
          </div>
          <div className="col-4 col-md-2">
            <label className="form-label" htmlFor="v-size">Size</label>
            <input id="v-size" name="size" className="form-control form-control-sm" />
          </div>
          <div className="col-4 col-md-2">
            <label className="form-label" htmlFor="v-price">+£</label>
            <input id="v-price" name="priceDelta" type="number" step="0.01" className="form-control form-control-sm" defaultValue="0" />
          </div>
          <div className="col-4 col-md-2">
            <label className="form-label" htmlFor="v-stock">Stock</label>
            <input id="v-stock" name="stockQty" type="number" className="form-control form-control-sm" defaultValue="0" />
          </div>
          <div className="col-12 col-md-2">
            <button type="submit" className="btn btn-outline-gold btn-sm w-100">+ Add variant</button>
          </div>
        </form>
      </AdminCard>
    </>
  );
}
