import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import PageHeader from "@/components/admin/ui/page-header";
import EntityGrid, { type GridRow } from "@/components/admin/grid/entity-grid";
import { deleteGiftCard } from "./actions";

export const dynamic = "force-dynamic";

export default async function GiftCardsPage() {
  const items = await prisma.giftCard.findMany({ orderBy: { createdAt: "desc" } });
  const rows: GridRow[] = items.map((g) => ({ id: g.id, code: g.code, initial: formatMoney(Number(g.initialAmount)), balance: formatMoney(Number(g.balance)), status: g.status, created: g.createdAt.toISOString() }));
  return (
    <>
      <PageHeader
        title="Gift cards"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Gift cards" }]}
        action={<Link href="/admin/gift-cards/new" className="btn btn-gold btn-sm"><i className="bi bi-plus-lg me-1" aria-hidden="true" />Issue gift card</Link>}
      />
      <EntityGrid
        rows={rows}
        columns={[{ field: "code", header: "Code", flex: 1.4 }, { field: "initial", header: "Initial", width: 120 }, { field: "balance", header: "Balance", width: 120 }, { field: "status", header: "Status", type: "status", width: 130 }, { field: "created", header: "Issued", type: "date", width: 150 }]}
        nameField="code" editBase="/admin/gift-cards" deleteAction={deleteGiftCard}
        resultsLabel="gift cards" quickFilter="Search codes…" exportName="gift-cards"
      />
    </>
  );
}
