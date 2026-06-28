import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import PageHeader from "@/components/admin/ui/page-header";
import AdminCard from "@/components/admin/ui/admin-card";
import StatCard from "@/components/admin/ui/stat-card";
import SectionLabel from "@/components/admin/ui/section-label";
import AnalyticsFilters from "@/components/admin/analytics/analytics-filters";
import { BarChart, RankedBars, Donut } from "@/components/admin/analytics/charts";

export const dynamic = "force-dynamic";

type RangeKey = "today" | "7d" | "30d" | "month" | "quarter" | "year" | "all";
const RANGE_KEYS: RangeKey[] = ["today", "7d", "30d", "month", "quarter", "year", "all"];

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function resolveWindow(range: RangeKey, now: Date): { start: Date; defaultGran: "day" | "month" } {
  switch (range) {
    case "today":   return { start: startOfDay(now), defaultGran: "day" };
    case "7d":      return { start: new Date(startOfDay(now).getTime() - 6 * 86400000), defaultGran: "day" };
    case "30d":     return { start: new Date(startOfDay(now).getTime() - 29 * 86400000), defaultGran: "day" };
    case "month":   return { start: new Date(now.getFullYear(), now.getMonth(), 1), defaultGran: "day" };
    case "quarter": return { start: new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1), defaultGran: "month" };
    case "year":    return { start: new Date(now.getFullYear(), 0, 1), defaultGran: "month" };
    case "all":     return { start: new Date(2000, 0, 1), defaultGran: "month" };
  }
}

type Bucket = { key: string; label: string; rev: number; ord: number };

function buildBuckets(range: RangeKey, gran: "day" | "month", start: Date, end: Date): { buckets: Bucket[]; keyOf: (d: Date) => string } {
  // Today → hourly buckets so a single-day view is still readable.
  if (range === "today") {
    const buckets: Bucket[] = [];
    for (let h = 0; h <= end.getHours(); h++) {
      buckets.push({ key: `h${h}`, label: `${(h % 12) || 12}${h < 12 ? "a" : "p"}`, rev: 0, ord: 0 });
    }
    return { buckets, keyOf: (d) => `h${d.getHours()}` };
  }

  // Day granularity, but guard against hundreds of bars (fall back to month).
  if (gran === "day") {
    const days = Math.round((startOfDay(end).getTime() - startOfDay(start).getTime()) / 86400000) + 1;
    if (days <= 92) {
      const buckets: Bucket[] = [];
      const weekday = days <= 7;
      const cur = startOfDay(start);
      while (cur <= end) {
        buckets.push({
          key: `${cur.getFullYear()}-${cur.getMonth()}-${cur.getDate()}`,
          label: weekday ? cur.toLocaleDateString("en-GB", { weekday: "short" }) : `${cur.getDate()}`,
          rev: 0,
          ord: 0,
        });
        cur.setDate(cur.getDate() + 1);
      }
      return { buckets, keyOf: (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` };
    }
  }

  // Month granularity.
  const buckets: Bucket[] = [];
  const spanYears = end.getFullYear() !== start.getFullYear();
  const cur = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cur <= end) {
    buckets.push({
      key: `${cur.getFullYear()}-${cur.getMonth()}`,
      label: cur.toLocaleDateString("en-GB", spanYears ? { month: "short", year: "2-digit" } : { month: "short" }),
      rev: 0,
      ord: 0,
    });
    cur.setMonth(cur.getMonth() + 1);
  }
  return { buckets, keyOf: (d) => `${d.getFullYear()}-${d.getMonth()}` };
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; granularity?: string }>;
}) {
  const sp = await searchParams;
  const range: RangeKey = RANGE_KEYS.includes(sp.range as RangeKey) ? (sp.range as RangeKey) : "year";
  const now = new Date();
  const end = now;
  const { start, defaultGran } = resolveWindow(range, now);
  const granularity: "day" | "month" =
    sp.granularity === "day" || sp.granularity === "month" ? sp.granularity : defaultGran;

  const where = { placedAt: { gte: start, lte: end } };

  const [paid, ordersAllCount, customers, members, itemsByProduct, tierGroup, issued, redeemed, tradeOut, tradeRev] = await Promise.all([
    prisma.order.findMany({ where: { paymentStatus: "paid", ...where }, select: { placedAt: true, total: true } }),
    prisma.order.count({ where }),
    prisma.customer.count({ where: { createdAt: { gte: start, lte: end } } }),
    prisma.customer.count({ where: { membershipTierId: { not: null }, createdAt: { gte: start, lte: end } } }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { lineTotal: true },
      where: { productId: { not: null }, order: { paymentStatus: "paid", placedAt: { gte: start, lte: end } } },
      orderBy: { _sum: { lineTotal: "desc" } },
      take: 8,
    }),
    prisma.customer.groupBy({ by: ["membershipTierId"], _count: true }),
    prisma.pointsLedger.aggregate({ _sum: { delta: true }, where: { delta: { gt: 0 }, createdAt: { gte: start, lte: end } } }),
    prisma.pointsLedger.aggregate({ _sum: { delta: true }, where: { delta: { lt: 0 }, createdAt: { gte: start, lte: end } } }),
    prisma.tradeAccount.aggregate({ _sum: { outstandingBalance: true } }),
    prisma.tradeOrder.aggregate({ _sum: { grandTotal: true } }),
  ]);

  const { buckets, keyOf } = buildBuckets(range, granularity, start, end);
  const bmap = new Map(buckets.map((b) => [b.key, b] as const));
  let revTotal = 0;
  paid.forEach((o) => {
    const v = Number(o.total);
    revTotal += v;
    const b = bmap.get(keyOf(new Date(o.placedAt)));
    if (b) { b.rev += v; b.ord += 1; }
  });
  const paidCount = paid.length;
  const aov = paidCount ? revTotal / paidCount : 0;

  const prodIds = itemsByProduct.map((i) => i.productId!).filter(Boolean);
  const prods = prodIds.length ? await prisma.product.findMany({ where: { id: { in: prodIds } }, select: { id: true, name: true } }) : [];
  const nameById = new Map(prods.map((p) => [p.id, p.name] as const));
  const topProducts = itemsByProduct.map((i) => ({ label: nameById.get(i.productId!) ?? "—", value: Number(i._sum.lineTotal ?? 0) }));

  const tiers = await prisma.membershipTier.findMany({ select: { id: true, name: true } });
  const totalCustomers = tierGroup.reduce((a, g) => a + g._count, 0);
  const tierSegments = tierGroup.map((g) => ({
    label: g.membershipTierId ? tiers.find((t) => t.id === g.membershipTierId)?.name ?? "—" : "No tier",
    value: g._count,
  }));

  const issuedV = issued._sum.delta ?? 0;
  const redeemedV = Math.abs(redeemed._sum.delta ?? 0);
  const periodLabel = range === "today" ? "by hour" : granularity === "day" ? "by day" : "by month";

  return (
    <>
      <PageHeader
        title="Analytics"
        subtitle="Commerce performance. Web traffic lives in your Vercel Analytics dashboard."
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Analytics" }]}
      />

      <AnalyticsFilters range={range} granularity={granularity} />

      <SectionLabel>Headline</SectionLabel>
      <div className="admin-stat-row">
        <StatCard variant="primary" label="Revenue" value={formatMoney(revTotal)} icon="bi-cash-stack" />
        <StatCard variant="primary" label="Orders" value={ordersAllCount} icon="bi-bag" />
        <StatCard variant="primary" label="New customers" value={customers} icon="bi-people" />
      </div>

      <SectionLabel>Detail</SectionLabel>
      <div className="admin-stat-row">
        <StatCard label="Avg order value" value={formatMoney(aov)} icon="bi-receipt" />
        <StatCard label="New members" value={members} icon="bi-award" />
        <StatCard label="Trade revenue (all)" value={formatMoney(Number(tradeRev._sum.grandTotal ?? 0))} icon="bi-briefcase" />
        <StatCard label="Trade outstanding" value={formatMoney(Number(tradeOut._sum.outstandingBalance ?? 0))} icon="bi-exclamation-circle" />
      </div>

      <div className="row g-4 admin-chart-row">
        <div className="col-12">
          <AdminCard
            title={`Revenue ${periodLabel}`}
            className="admin-card--chart"
            actions={<span className="admin-badge admin-badge--info admin-badge--no-dot">{formatMoney(revTotal)}</span>}
          >
            <BarChart data={buckets.map((b) => ({ label: b.label, value: b.rev }))} money />
          </AdminCard>
        </div>
      </div>

      <div className="row g-4 admin-chart-row mt-1">
        <div className="col-12 col-lg-7">
          <AdminCard
            title={`Orders ${periodLabel}`}
            className="admin-card--chart"
            actions={<span className="admin-badge admin-badge--info admin-badge--no-dot">{paidCount}</span>}
          >
            <BarChart data={buckets.map((b) => ({ label: b.label, value: b.ord }))} />
          </AdminCard>
        </div>
        <div className="col-12 col-lg-5">
          <AdminCard title="RPM tiers" className="admin-card--chart">
            {tierSegments.length ? <Donut segments={tierSegments} centerValue={totalCustomers} centerLabel="customers" /> : <p className="td-muted">No data.</p>}
          </AdminCard>
        </div>
      </div>

      <div className="row g-4 admin-chart-row mt-1">
        <div className="col-12 col-lg-5">
          <AdminCard title="Points issued vs redeemed" className="admin-card--chart">
            <Donut
              segments={[
                { label: "Issued", value: issuedV, color: "#6FCF97" },
                { label: "Redeemed", value: redeemedV, color: "#EC8B8B" },
              ]}
              centerValue={(issuedV - redeemedV).toLocaleString()}
              centerLabel="liability"
            />
          </AdminCard>
        </div>
        <div className="col-12 col-lg-7">
          <AdminCard title="Top products (by revenue)" className="admin-card--chart">
            {topProducts.length ? <RankedBars data={topProducts} money /> : <p className="td-muted">No sales in this period.</p>}
          </AdminCard>
        </div>
      </div>
    </>
  );
}
