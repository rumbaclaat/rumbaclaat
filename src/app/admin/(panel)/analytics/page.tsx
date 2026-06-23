import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import PageHeader from "@/components/admin/ui/page-header";
import AdminCard from "@/components/admin/ui/admin-card";
import StatCard from "@/components/admin/ui/stat-card";
import { BarChart, Donut } from "@/components/admin/analytics/charts";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const now = new Date();
  const since12 = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const [paid, revAll, orderCount, customers, members, itemsByProduct, tierGroup, issued, redeemed, tradeOut, tradeRev] = await Promise.all([
    prisma.order.findMany({ where: { paymentStatus: "paid", placedAt: { gte: since12 } }, select: { placedAt: true, total: true } }),
    prisma.order.aggregate({ _sum: { total: true }, _count: true, where: { paymentStatus: "paid" } }),
    prisma.order.count(),
    prisma.customer.count(),
    prisma.customer.count({ where: { membershipTierId: { not: null } } }),
    prisma.orderItem.groupBy({ by: ["productId"], _sum: { lineTotal: true }, where: { productId: { not: null } }, orderBy: { _sum: { lineTotal: "desc" } }, take: 8 }),
    prisma.customer.groupBy({ by: ["membershipTierId"], _count: true }),
    prisma.pointsLedger.aggregate({ _sum: { delta: true }, where: { delta: { gt: 0 } } }),
    prisma.pointsLedger.aggregate({ _sum: { delta: true }, where: { delta: { lt: 0 } } }),
    prisma.tradeAccount.aggregate({ _sum: { outstandingBalance: true } }),
    prisma.tradeOrder.aggregate({ _sum: { grandTotal: true } }),
  ]);

  const months: { key: string; label: string; rev: number; ord: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString("en-GB", { month: "short" }), rev: 0, ord: 0 });
  }
  paid.forEach((o) => {
    const d = new Date(o.placedAt);
    const m = months.find((x) => x.key === `${d.getFullYear()}-${d.getMonth()}`);
    if (m) { m.rev += Number(o.total); m.ord += 1; }
  });

  const prodIds = itemsByProduct.map((i) => i.productId!).filter(Boolean);
  const prods = await prisma.product.findMany({ where: { id: { in: prodIds } }, select: { id: true, name: true } });
  const nameById = new Map(prods.map((p) => [p.id, p.name] as const));
  const topProducts = itemsByProduct.map((i) => ({ label: (nameById.get(i.productId!) ?? "?").split(" ").slice(0, 2).join(" "), value: Number(i._sum.lineTotal ?? 0) }));

  const tiers = await prisma.membershipTier.findMany({ select: { id: true, name: true } });
  const tierSegments = tierGroup.map((g) => ({ label: g.membershipTierId ? tiers.find((t) => t.id === g.membershipTierId)?.name ?? "?" : "No tier", value: g._count }));

  const revTotal = Number(revAll._sum.total ?? 0);
  const aov = revAll._count ? revTotal / revAll._count : 0;
  const issuedV = issued._sum.delta ?? 0;
  const redeemedV = Math.abs(redeemed._sum.delta ?? 0);

  return (
    <>
      <PageHeader title="Analytics" subtitle="Commerce performance — last 12 months. Web traffic is in your Vercel Analytics dashboard." breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Analytics" }]} />

      <div className="admin-stat-grid">
        <StatCard label="Revenue (all)" value={formatMoney(revTotal)} icon="bi-cash-stack" />
        <StatCard label="Avg order value" value={formatMoney(aov)} icon="bi-receipt" />
        <StatCard label="Orders" value={orderCount} icon="bi-bag" />
        <StatCard label="Customers" value={customers} icon="bi-people" />
        <StatCard label="Members" value={members} icon="bi-award" />
        <StatCard label="Trade revenue" value={formatMoney(Number(tradeRev._sum.grandTotal ?? 0))} icon="bi-briefcase" />
        <StatCard label="Trade outstanding" value={formatMoney(Number(tradeOut._sum.outstandingBalance ?? 0))} icon="bi-exclamation-circle" />
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-7"><AdminCard title="Revenue by month"><BarChart data={months.map((m) => ({ label: m.label, value: m.rev }))} money /></AdminCard></div>
        <div className="col-12 col-lg-5"><AdminCard title="Membership tiers">{tierSegments.length ? <Donut segments={tierSegments} centerValue={customers} centerLabel="customers" /> : <p className="td-muted">No data.</p>}</AdminCard></div>
        <div className="col-12 col-lg-7"><AdminCard title="Orders by month"><BarChart data={months.map((m) => ({ label: m.label, value: m.ord }))} /></AdminCard></div>
        <div className="col-12 col-lg-5"><AdminCard title="Points issued vs redeemed"><Donut segments={[{ label: "Issued", value: issuedV, color: "#4ADE80" }, { label: "Redeemed", value: redeemedV, color: "#F26D6D" }]} centerValue={issuedV - redeemedV} centerLabel="liability" /></AdminCard></div>
        <div className="col-12"><AdminCard title="Top products (by revenue)">{topProducts.length ? <BarChart data={topProducts} money /> : <p className="td-muted">No sales yet.</p>}</AdminCard></div>
      </div>
    </>
  );
}
