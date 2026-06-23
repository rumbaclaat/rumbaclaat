import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/ui/page-header";
import TradeGrid, { type TradeRow } from "@/components/admin/trade/trade-grid";

export const dynamic = "force-dynamic";

export default async function TradeAccountsPage() {
  const accounts = await prisma.tradeAccount.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  const rows: TradeRow[] = accounts.map((a) => ({
    id: a.id,
    company: a.companyName,
    contactName: a.contactName,
    contactEmail: a.contactEmail,
    businessType: a.businessType ?? "—",
    terms: a.paymentTerms,
    orders: a._count.orders,
    outstanding: Number(a.outstandingBalance),
    status: a.status,
  }));

  return (
    <>
      <PageHeader
        title="Trade accounts"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Trade accounts" }]}
      />
      <TradeGrid rows={rows} />
    </>
  );
}
