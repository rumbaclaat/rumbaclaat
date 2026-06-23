import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import PageHeader from "@/components/admin/ui/page-header";
import AdminCard from "@/components/admin/ui/admin-card";
import EntityGrid, { type GridRow } from "@/components/admin/grid/entity-grid";
import { issueGiftCard, deleteGiftCard } from "./actions";

export const dynamic = "force-dynamic";

export default async function GiftCardsPage() {
  const items = await prisma.giftCard.findMany({ orderBy: { createdAt: "desc" } });
  const rows: GridRow[] = items.map((g) => ({ id: g.id, code: g.code, initial: formatMoney(Number(g.initialAmount)), balance: formatMoney(Number(g.balance)), status: g.status, created: g.createdAt.toISOString() }));
  return (
    <>
      <PageHeader title="Gift cards" breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Gift cards" }]} />
      <EntityGrid
        rows={rows}
        columns={[{ field: "code", header: "Code", flex: 1.4 }, { field: "initial", header: "Initial", width: 120 }, { field: "balance", header: "Balance", width: 120 }, { field: "status", header: "Status", type: "status", width: 130 }, { field: "created", header: "Issued", type: "date", width: 150 }]}
        nameField="code" editBase="/admin/gift-cards" deleteAction={deleteGiftCard}
        resultsLabel="gift cards" quickFilter="Search codes…" exportName="gift-cards"
      />
      <AdminCard title="Issue gift card" className="mt-4">
        <form action={issueGiftCard} className="row g-2 align-items-end">
          <div className="col-md-2"><label className="form-label" htmlFor="ga">Amount (£)</label><input id="ga" name="amount" type="number" step="0.01" className="form-control form-control-sm" defaultValue="25" required /></div>
          <div className="col-md-3"><label className="form-label" htmlFor="gr">Recipient</label><input id="gr" name="recipient" className="form-control form-control-sm" /></div>
          <div className="col-md-3"><label className="form-label" htmlFor="gs">Sender</label><input id="gs" name="sender" className="form-control form-control-sm" /></div>
          <div className="col-md-2"><label className="form-label" htmlFor="gm">Message</label><input id="gm" name="message" className="form-control form-control-sm" /></div>
          <div className="col-md-2"><button className="btn btn-gold btn-sm w-100">Issue</button></div>
        </form>
      </AdminCard>
    </>
  );
}
