/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import Breadcrumbs from "@/components/admin/ui/breadcrumbs";
import AdminCard from "@/components/admin/ui/admin-card";
import StatusBadge from "@/components/admin/ui/status-badge";
import {
  updateOrderStatus,
  updateOrderFulfilment,
  updateOrderNotes,
  refundOrder,
  emailCustomer,
  createReturn,
} from "../actions";

export const dynamic = "force-dynamic";

const STATUSES = ["received", "paid", "packed", "dispatched", "delivered", "cancelled"];

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, timeline: { orderBy: { createdAt: "desc" } }, returns: true },
  });
  if (!order) notFound();

  const productIds = order.items.map((i) => i.productId).filter(Boolean) as string[];
  const products = productIds.length
    ? await prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true, imageUrl: true } })
    : [];
  const imgById = new Map(products.map((p) => [p.id, p.imageUrl] as const));
  const addr = (order.shippingAddress ?? {}) as Record<string, string>;
  const cur = order.currency || "GBP";

  return (
    <>
      <Breadcrumbs items={[{ label: "Dashboard", href: "/admin" }, { label: "Orders", href: "/admin/orders" }, { label: order.ref }]} />
      <div className="admin-page-head">
        <div>
          <h1 className="d-flex align-items-center flex-wrap gap-2">
            <span>{`Order ${order.ref}`}</span>
            <StatusBadge status={order.status} />
            <StatusBadge status={order.paymentStatus} />
          </h1>
          <div className="admin-page-sub">{order.customerName ?? order.email}</div>
        </div>
        <div className="admin-page-actions">
          <div className="d-flex gap-2">
            <Link href={`/admin/orders/${order.id}/packing-slip`} target="_blank" className="btn btn-ghost btn-sm">
              <i className="bi bi-printer me-1" aria-hidden="true" />Packing slip
            </Link>
            <Link href={`/admin/orders/${order.id}/invoice`} target="_blank" className="btn btn-outline-gold btn-sm">
              <i className="bi bi-file-earmark-text me-1" aria-hidden="true" />Invoice
            </Link>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Main */}
        <div className="col-12 col-lg-8">
          <AdminCard title="Items">
            <div className="table-responsive">
              <table className="admin-table">
                <thead><tr><th>Item</th><th>Unit</th><th>Qty</th><th className="td-num">Line</th></tr></thead>
                <tbody>
                  {order.items.map((i) => {
                    const img = i.productId ? imgById.get(i.productId) : null;
                    return (
                      <tr key={i.id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            {img ? <img src={img} alt="" className="admin-thumb" /> : <span className="admin-thumb admin-thumb-ph"><i className="bi bi-box-seam" /></span>}
                            <span>{i.name}</span>
                          </div>
                        </td>
                        <td>{formatMoney(Number(i.unitPrice), cur)}</td>
                        <td>{i.qty}</td>
                        <td className="td-num">{formatMoney(Number(i.lineTotal), cur)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-3" style={{ maxWidth: 300, marginLeft: "auto" }}>
              <div className="order-summary-item"><span className="td-muted">Subtotal</span><span>{formatMoney(Number(order.subtotal), cur)}</span></div>
              <div className="order-summary-item"><span className="td-muted">Shipping</span><span>{formatMoney(Number(order.shipping), cur)}</span></div>
              {order.refundedAmount != null && <div className="order-summary-item"><span className="td-muted">Refunded</span><span style={{ color: "var(--red)" }}>−{formatMoney(Number(order.refundedAmount), cur)}</span></div>}
              <div className="order-summary-item" style={{ fontWeight: 600 }}><span>Total</span><span className="gold">{formatMoney(Number(order.total), cur)}</span></div>
              <div className="order-summary-item"><span className="td-muted">Points earned</span><span>{order.pointsEarned}</span></div>
            </div>
          </AdminCard>

          <AdminCard title="Timeline" className="mt-4">
            {order.timeline.length === 0 ? (
              <p className="td-muted">No events yet.</p>
            ) : (
              <ul className="order-timeline">
                {order.timeline.map((t) => (
                  <li key={t.id}>
                    <span className="ot-status">{t.status.replace(/_/g, " ")}</span>
                    {t.note && <div style={{ fontSize: ".85rem" }}>{t.note}</div>}
                    <div className="ot-meta">{new Date(t.createdAt).toLocaleString("en-GB")} · {t.createdBy ?? "system"}</div>
                  </li>
                ))}
              </ul>
            )}
          </AdminCard>

          <AdminCard title="Internal notes" className="mt-4">
            <form action={updateOrderNotes}>
              <input type="hidden" name="id" value={order.id} />
              <textarea name="internalNotes" rows={3} className="form-control" defaultValue={order.internalNotes ?? ""} placeholder="Notes visible only to staff…" />
              <button type="submit" className="btn btn-outline-gold btn-sm mt-2">Save notes</button>
            </form>
          </AdminCard>
        </div>

        {/* Rail */}
        <div className="col-12 col-lg-4">
          <AdminCard title="Status">
            <form action={updateOrderStatus} className="d-flex flex-column gap-2">
              <input type="hidden" name="id" value={order.id} />
              <select name="status" className="form-select form-select-sm" defaultValue={order.status}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <input name="note" className="form-control form-control-sm" placeholder="Note (optional)" />
              <button type="submit" className="btn btn-gold btn-sm">Update status</button>
            </form>
          </AdminCard>

          <AdminCard title="Customer" className="mt-4">
            <p className="mb-1" style={{ fontWeight: 600 }}>{order.customerName ?? "—"}</p>
            <p className="td-muted mb-1" style={{ fontSize: ".85rem" }}>{order.email}</p>
            {order.phone && <p className="td-muted mb-1" style={{ fontSize: ".85rem" }}>{order.phone}</p>}
            {order.customerId && (
              <Link href={`/admin/customers/${order.customerId}`} className="btn btn-ghost btn-sm mt-1">
                <i className="bi bi-person me-1" aria-hidden="true" />View customer
              </Link>
            )}
            <h3 className="h6 mt-3 mb-1">Shipping address</h3>
            <p className="td-muted mb-0" style={{ fontSize: ".85rem" }}>
              {[addr.line1, addr.line2, addr.city, addr.postcode, addr.country].filter(Boolean).join(", ") || "—"}
            </p>
          </AdminCard>

          <AdminCard title="Fulfilment" className="mt-4">
            <form action={updateOrderFulfilment} className="d-flex flex-column gap-2">
              <input type="hidden" name="id" value={order.id} />
              <input name="trackingCarrier" className="form-control form-control-sm" placeholder="Carrier (e.g. DPD)" defaultValue={order.trackingCarrier ?? ""} />
              <input name="trackingNumber" className="form-control form-control-sm" placeholder="Tracking number" defaultValue={order.trackingNumber ?? ""} />
              <button type="submit" className="btn btn-outline-gold btn-sm">Mark dispatched + save tracking</button>
            </form>
          </AdminCard>

          <AdminCard title="Email customer" className="mt-4">
            <form action={emailCustomer} className="d-flex flex-column gap-2">
              <input type="hidden" name="id" value={order.id} />
              <input name="subject" className="form-control form-control-sm" placeholder="Subject" required />
              <textarea name="body" rows={3} className="form-control form-control-sm" placeholder="Message…" required />
              <button type="submit" className="btn btn-ghost btn-sm"><i className="bi bi-envelope me-1" aria-hidden="true" />Send email</button>
            </form>
          </AdminCard>

          <AdminCard title="Refund & returns" className="mt-4">
            <form action={refundOrder} className="d-flex gap-2 align-items-end mb-3">
              <input type="hidden" name="id" value={order.id} />
              <div className="flex-grow-1">
                <label className="form-label" htmlFor="ramt">Refund amount (£)</label>
                <input id="ramt" name="amount" type="number" step="0.01" className="form-control form-control-sm" defaultValue={Number(order.total).toFixed(2)} />
              </div>
              <button type="submit" className="btn btn-ghost btn-sm text-danger">Refund</button>
            </form>
            <form action={createReturn} className="d-flex gap-2 align-items-end">
              <input type="hidden" name="id" value={order.id} />
              <div className="flex-grow-1">
                <label className="form-label" htmlFor="rrsn">Return reason</label>
                <input id="rrsn" name="reason" className="form-control form-control-sm" placeholder="e.g. Damaged" />
              </div>
              <button type="submit" className="btn btn-ghost btn-sm">Log return</button>
            </form>
            {order.returns.length > 0 && (
              <p className="td-muted mt-2 mb-0" style={{ fontSize: ".8rem" }}>{order.returns.length} return(s) logged.</p>
            )}
          </AdminCard>
        </div>
      </div>
    </>
  );
}
