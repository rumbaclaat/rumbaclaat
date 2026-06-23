import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const statusColor: Record<string, string> = {
  received: "var(--yellow)",
  paid: "var(--green)",
  packed: "var(--gold-hi)",
  dispatched: "var(--gold-hi)",
  delivered: "var(--green)",
  cancelled: "var(--red)",
};

export default async function OrdersList() {
  const orders = await prisma.order.findMany({
    orderBy: { placedAt: "desc" },
    include: { _count: { select: { items: true } } },
  });

  return (
    <>
      <div className="admin-page-head">
        <h1>Orders</h1>
      </div>

      <div className="admin-card p-0" style={{ overflow: "hidden" }}>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ref</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Placed</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr><td colSpan={6} style={{ color: "var(--text-dim)" }}>No orders yet.</td></tr>
              )}
              {orders.map((o) => (
                <tr key={o.id}>
                  <td><Link href={`/admin/orders/${o.id}`} className="gold">{o.ref}</Link></td>
                  <td style={{ color: "var(--text-muted)" }}>{o.customerName ?? o.email}</td>
                  <td>{o._count.items}</td>
                  <td>£{Number(o.total).toFixed(2)}</td>
                  <td style={{ textTransform: "capitalize", color: statusColor[o.status] ?? "var(--text)" }}>{o.status}</td>
                  <td style={{ color: "var(--text-muted)" }}>{new Date(o.placedAt).toLocaleDateString("en-GB")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
