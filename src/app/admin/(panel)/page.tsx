import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import PageHeader from "@/components/admin/ui/page-header";
import AdminCard from "@/components/admin/ui/admin-card";
import StatCard from "@/components/admin/ui/stat-card";
import SectionLabel from "@/components/admin/ui/section-label";
import StatusBadge from "@/components/admin/ui/status-badge";
import { BarChart, Donut, Sparkline } from "@/components/admin/analytics/charts";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const now = new Date();
  const since30 = new Date(now.getTime() - 30 * 86400000);
  const since6m = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [revAll, rev30, orderCount, pending, customers, new30, points, statusGroup, paidOrders, lowStockProducts, openInvoices, recentOrders, recentEnq] = await Promise.all([
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "paid" } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "paid", placedAt: { gte: since30 } } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: { in: ["received", "paid", "packed"] } } }),
    prisma.customer.count(),
    prisma.customer.count({ where: { createdAt: { gte: since30 } } }),
    prisma.customer.aggregate({ _sum: { pointsBalance: true } }),
    prisma.order.groupBy({ by: ["status"], _count: true }),
    prisma.order.findMany({ where: { paymentStatus: "paid", placedAt: { gte: since6m } }, select: { placedAt: true, total: true } }),
    prisma.product.findMany({ select: { stockQty: true, lowStockThreshold: true } }),
    prisma.invoice.count({ where: { status: { in: ["open", "overdue"] } } }),
    prisma.order.findMany({ orderBy: { placedAt: "desc" }, take: 8 }),
    prisma.contactEnquiry.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const months: { key: string; label: string; value: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString("en-GB", { month: "short" }), value: 0 });
  }
  paidOrders.forEach((o) => {
    const d = new Date(o.placedAt);
    const m = months.find((x) => x.key === `${d.getFullYear()}-${d.getMonth()}`);
    if (m) m.value += Number(o.total);
  });

  const lowStock = lowStockProducts.filter((p) => p.stockQty <= (p.lowStockThreshold ?? 5)).length;
  const statusSegments = statusGroup.map((g) => ({ label: g.status, value: g._count }));

  return (
    <>
      <PageHeader title="Dashboard" subtitle={now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} />

      {/* Headline: hero revenue + a secondary strip */}
      <div className="admin-stat-row">
        <StatCard
          variant="hero"
          label="Revenue · last 30 days"
          value={formatMoney(Number(rev30._sum.total ?? 0))}
          icon="bi-graph-up-arrow"
          href="/admin/analytics"
          foot={<div className="mt-3"><Sparkline data={months.map((m) => m.value)} /></div>}
        />
        <StatCard label="Orders" value={orderCount} icon="bi-bag" href="/admin/orders" />
        <StatCard label="Pending" value={pending} icon="bi-hourglass-split" href="/admin/orders" />
        <StatCard label="Customers" value={customers} icon="bi-people" href="/admin/customers" />
        <StatCard label="Low stock" value={lowStock} icon="bi-exclamation-triangle" href="/admin/inventory" />
      </div>

      <SectionLabel>Detail</SectionLabel>
      <div className="admin-stat-row">
        <StatCard label="Revenue (all time)" value={formatMoney(Number(revAll._sum.total ?? 0))} icon="bi-cash-stack" />
        <StatCard label="New customers (30d)" value={new30} icon="bi-person-plus" />
        <StatCard label="Points liability" value={(points._sum.pointsBalance ?? 0).toLocaleString()} icon="bi-coin" />
        <StatCard label="Open invoices" value={openInvoices} icon="bi-receipt" href="/admin/trade" />
      </div>

      <div className="row g-4 admin-chart-row">
        <div className="col-12 col-lg-7">
          <AdminCard
            title="Revenue — last 6 months"
            className="admin-card--chart"
            actions={<span className="admin-badge admin-badge--info admin-badge--no-dot">{formatMoney(months.reduce((a, m) => a + m.value, 0))}</span>}
          >
            <BarChart data={months.map((m) => ({ label: m.label, value: m.value }))} money />
          </AdminCard>
        </div>
        <div className="col-12 col-lg-5">
          <AdminCard title="Orders by status" className="admin-card--chart">
            {statusSegments.length ? <Donut segments={statusSegments} centerValue={orderCount} centerLabel="orders" /> : <p className="td-muted">No orders yet.</p>}
          </AdminCard>
        </div>
      </div>

      <div className="row g-4 mt-0">
        <div className="col-12 col-lg-8">
          <AdminCard title="Recent orders" actions={<Link href="/admin/orders" className="btn btn-ghost btn-sm">All orders</Link>}>
            <div className="table-responsive">
              <table className="admin-table">
                <thead><tr><th>Ref</th><th>Customer</th><th>Total</th><th>Status</th><th>Placed</th></tr></thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td><Link href={`/admin/orders/${o.id}`} className="gold">{o.ref}</Link></td>
                      <td className="td-muted">{o.customerName ?? o.email}</td>
                      <td>{formatMoney(Number(o.total), o.currency)}</td>
                      <td><StatusBadge status={o.status} /></td>
                      <td className="td-muted">{new Date(o.placedAt).toLocaleDateString("en-GB")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AdminCard>
        </div>
        <div className="col-12 col-lg-4">
          <AdminCard title="Latest enquiries" actions={<Link href="/admin/enquiries" className="btn btn-ghost btn-sm">All</Link>}>
            {recentEnq.length === 0 && <p className="td-muted mb-0">No enquiries.</p>}
            {recentEnq.map((e) => (
              <div key={e.id} className="mb-2 pb-2" style={{ borderBottom: "1px solid var(--gold-bdr)" }}>
                <Link href={`/admin/enquiries/${e.id}`} className="gold">{e.subject || e.name}</Link>
                <div className="td-muted" style={{ fontSize: ".78rem" }}>{e.name} · {new Date(e.createdAt).toLocaleDateString("en-GB")}</div>
              </div>
            ))}
            <div className="d-flex gap-2 flex-wrap mt-3">
              <Link href="/admin/products/new" className="btn btn-gold btn-sm">New product</Link>
              <Link href="/admin/orders/new" className="btn btn-outline-gold btn-sm">New order</Link>
            </div>
          </AdminCard>
        </div>
      </div>
    </>
  );
}
