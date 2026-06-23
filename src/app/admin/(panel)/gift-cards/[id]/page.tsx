import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import PageHeader from "@/components/admin/ui/page-header";
import AdminCard from "@/components/admin/ui/admin-card";
import StatusBadge from "@/components/admin/ui/status-badge";
import { adjustGiftCard, setGiftCardStatus } from "../actions";

export const dynamic = "force-dynamic";

export default async function GiftCardDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const card = await prisma.giftCard.findUnique({ where: { id }, include: { txns: { orderBy: { createdAt: "desc" } } } });
  if (!card) notFound();
  return (
    <>
      <PageHeader title={card.code} subtitle={`Balance ${formatMoney(Number(card.balance))}`} breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Gift cards", href: "/admin/gift-cards" }, { label: card.code }]} />
      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <AdminCard title="Transactions">
            <div className="table-responsive">
              <table className="admin-table">
                <thead><tr><th>Date</th><th>Reason</th><th>Change</th></tr></thead>
                <tbody>
                  {card.txns.map((t) => (
                    <tr key={t.id}><td className="td-muted">{new Date(t.createdAt).toLocaleString("en-GB")}</td><td style={{ textTransform: "capitalize" }}>{t.reason}</td><td style={{ color: Number(t.delta) >= 0 ? "var(--green)" : "var(--red)" }}>{Number(t.delta) >= 0 ? "+" : ""}{formatMoney(Number(t.delta))}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AdminCard>
        </div>
        <div className="col-12 col-lg-5">
          <AdminCard title="Details">
            <p className="mb-1"><span className="td-muted">Status:</span> <StatusBadge status={card.status} /></p>
            <p className="mb-1"><span className="td-muted">Initial:</span> {formatMoney(Number(card.initialAmount))}</p>
            <p className="mb-1"><span className="td-muted">Balance:</span> {formatMoney(Number(card.balance))}</p>
            {card.recipient && <p className="mb-1"><span className="td-muted">Recipient:</span> {card.recipient}</p>}
            {card.sender && <p className="mb-0"><span className="td-muted">Sender:</span> {card.sender}</p>}
          </AdminCard>
          <AdminCard title="Adjust balance" className="mt-4">
            <form action={adjustGiftCard} className="d-flex gap-2 align-items-end">
              <input type="hidden" name="id" value={card.id} />
              <div className="flex-grow-1"><label className="form-label" htmlFor="delta">Amount (+/−)</label><input id="delta" name="delta" type="number" step="0.01" className="form-control form-control-sm" placeholder="-10" /></div>
              <button className="btn btn-outline-gold btn-sm">Apply</button>
            </form>
          </AdminCard>
          <AdminCard title="Status" className="mt-4">
            <form action={setGiftCardStatus} className="d-flex gap-2">
              <input type="hidden" name="id" value={card.id} />
              <select name="status" defaultValue={card.status} className="form-select form-select-sm"><option value="active">active</option><option value="redeemed">redeemed</option><option value="disabled">disabled</option></select>
              <button className="btn btn-ghost btn-sm">Set</button>
            </form>
          </AdminCard>
        </div>
      </div>
    </>
  );
}
