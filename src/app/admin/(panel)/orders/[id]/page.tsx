import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateOrderStatus } from "../actions";

export const dynamic = "force-dynamic";

const STATUSES = ["received", "paid", "packed", "dispatched", "delivered", "cancelled"];

export default async function OrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) notFound();

  const addr = (order.shippingAddress ?? {}) as Record<string, string>;

  return (
    <>
      <div className="admin-page-head">
        <h1>Order {order.ref}</h1>
        <form action={updateOrderStatus} className="d-flex gap-2 align-items-center">
          <input type="hidden" name="id" value={order.id} />
          <select name="status" className="form-select form-select-sm" defaultValue={order.status} style={{ width: "auto" }}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button type="submit" className="btn btn-gold btn-sm">Update status</button>
        </form>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="admin-card">
            <h2 className="h5 mb-3">Items</h2>
            <div className="table-responsive">
              <table className="admin-table">
                <thead><tr><th>Item</th><th>Unit</th><th>Qty</th><th>Line</th></tr></thead>
                <tbody>
                  {order.items.map((i) => (
                    <tr key={i.id}>
                      <td>{i.name}</td>
                      <td>£{Number(i.unitPrice).toFixed(2)}</td>
                      <td>{i.qty}</td>
                      <td>£{Number(i.lineTotal).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3" style={{ maxWidth: 280, marginLeft: "auto" }}>
              <div className="order-summary-item"><span style={{ color: "var(--text-muted)" }}>Subtotal</span><span>£{Number(order.subtotal).toFixed(2)}</span></div>
              <div className="order-summary-item"><span style={{ color: "var(--text-muted)" }}>Shipping</span><span>£{Number(order.shipping).toFixed(2)}</span></div>
              <div className="order-summary-item" style={{ fontWeight: 600 }}><span>Total</span><span className="gold">£{Number(order.total).toFixed(2)}</span></div>
              <div className="order-summary-item"><span style={{ color: "var(--text-muted)" }}>Points earned</span><span>{order.pointsEarned}</span></div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="admin-card">
            <h2 className="h5 mb-3">Customer</h2>
            <p style={{ margin: "0 0 4px" }}>{order.customerName ?? "—"}</p>
            <p style={{ fontSize: ".875rem", color: "var(--text-muted)", margin: "0 0 4px" }}>{order.email}</p>
            {order.phone && <p style={{ fontSize: ".875rem", color: "var(--text-muted)", margin: 0 }}>{order.phone}</p>}

            <h2 className="h6 mt-4 mb-2">Shipping address</h2>
            <p style={{ fontSize: ".875rem", color: "var(--text-muted)", margin: 0 }}>
              {[addr.line1, addr.line2, addr.city, addr.postcode, addr.country].filter(Boolean).join(", ")}
            </p>

            <h2 className="h6 mt-4 mb-2">Payment</h2>
            <p style={{ fontSize: ".875rem", color: "var(--text-muted)", margin: 0 }}>
              {order.paymentMethod} · {order.paymentStatus}
            </p>
            <p style={{ fontSize: ".875rem", color: "var(--text-muted)", margin: "4px 0 0" }}>
              Delivery: {order.deliveryMethod}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
