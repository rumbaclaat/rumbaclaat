import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/ui/page-header";
import AdminCard from "@/components/admin/ui/admin-card";
import { adjustStock } from "./actions";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const [products, adjustments] = await Promise.all([
    prisma.product.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, sku: true, stockQty: true, lowStockThreshold: true } }),
    prisma.stockAdjustment.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
  ]);
  const lowStock = products.filter((p) => p.stockQty <= (p.lowStockThreshold ?? 5));
  const nameById = new Map(products.map((p) => [p.id, p.name] as const));

  return (
    <>
      <PageHeader title="Inventory" breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Inventory" }]} subtitle={`${lowStock.length} low-stock item(s)`} />

      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <AdminCard title={`Low stock (${lowStock.length})`}>
            <div className="table-responsive">
              <table className="admin-table">
                <thead><tr><th>Product</th><th>SKU</th><th>Stock</th><th>Alert at</th></tr></thead>
                <tbody>
                  {lowStock.length === 0 && <tr><td colSpan={4} className="td-muted">Everything is well-stocked.</td></tr>}
                  {lowStock.map((p) => (
                    <tr key={p.id}>
                      <td><Link href={`/admin/products/${p.id}`} className="gold">{p.name}</Link></td>
                      <td className="td-muted">{p.sku}</td>
                      <td style={{ color: p.stockQty <= 0 ? "var(--red)" : "var(--yellow)" }}>{p.stockQty}</td>
                      <td className="td-muted">{p.lowStockThreshold ?? 5}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AdminCard>

          <AdminCard title="Recent adjustments" className="mt-4">
            <div className="table-responsive">
              <table className="admin-table">
                <thead><tr><th>Date</th><th>Product</th><th>Change</th><th>Reason</th></tr></thead>
                <tbody>
                  {adjustments.length === 0 && <tr><td colSpan={4} className="td-muted">No adjustments yet.</td></tr>}
                  {adjustments.map((a) => (
                    <tr key={a.id}>
                      <td className="td-muted">{new Date(a.createdAt).toLocaleDateString("en-GB")}</td>
                      <td>{a.productId ? nameById.get(a.productId) ?? "—" : "—"}</td>
                      <td style={{ color: a.delta >= 0 ? "var(--green)" : "var(--red)" }}>{a.delta >= 0 ? "+" : ""}{a.delta}</td>
                      <td className="td-muted" style={{ textTransform: "capitalize" }}>{a.reason}{a.note ? ` · ${a.note}` : ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AdminCard>
        </div>

        <div className="col-12 col-lg-5">
          <AdminCard title="Adjust stock">
            <form action={adjustStock} className="d-flex flex-column gap-2">
              <div><label className="form-label" htmlFor="pid">Product</label>
                <select id="pid" name="productId" className="form-select form-select-sm" required>
                  <option value="">Choose…</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.stockQty})</option>)}
                </select>
              </div>
              <div className="row g-2">
                <div className="col-6"><label className="form-label" htmlFor="delta">Change (+/−)</label><input id="delta" name="delta" type="number" className="form-control form-control-sm" placeholder="e.g. 50 or -3" /></div>
                <div className="col-6"><label className="form-label" htmlFor="reason">Reason</label><select id="reason" name="reason" className="form-select form-select-sm"><option value="restock">restock</option><option value="correction">correction</option><option value="damage">damage</option><option value="return">return</option></select></div>
              </div>
              <input name="note" className="form-control form-control-sm" placeholder="Note (optional)" />
              <button className="btn btn-gold btn-sm align-self-start">Apply adjustment</button>
            </form>
          </AdminCard>
        </div>
      </div>
    </>
  );
}
