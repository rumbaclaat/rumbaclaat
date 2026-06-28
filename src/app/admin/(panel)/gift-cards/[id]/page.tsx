import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import Breadcrumbs from "@/components/admin/ui/breadcrumbs";
import AdminCard from "@/components/admin/ui/admin-card";
import StatCard from "@/components/admin/ui/stat-card";
import SectionLabel from "@/components/admin/ui/section-label";
import StatusBadge from "@/components/admin/ui/status-badge";
import { Field } from "@/components/admin/ui/field";
import { adjustGiftCard, setGiftCardStatus } from "../actions";

export const dynamic = "force-dynamic";

const STATUSES = ["active", "redeemed", "disabled"];

export default async function GiftCardDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const card = await prisma.giftCard.findUnique({ where: { id }, include: { txns: { orderBy: { createdAt: "desc" } } } });
  if (!card) notFound();

  return (
    <>
      <Breadcrumbs items={[{ label: "Dashboard", href: "/admin" }, { label: "Gift cards", href: "/admin/gift-cards" }, { label: card.code }]} />
      <div className="admin-page-head">
        <div>
          <h1 className="d-flex align-items-center gap-2 flex-wrap">
            {card.code}
            <StatusBadge status={card.status} />
          </h1>
          <div className="admin-page-sub">Issued {new Date(card.createdAt).toLocaleDateString("en-GB")}</div>
        </div>
      </div>

      <div className="row g-4">
        {/* Main */}
        <div className="col-12 col-lg-8">
          <div className="admin-stat-row mb-4">
            <StatCard label="Balance" value={formatMoney(Number(card.balance))} icon="bi-wallet2" variant="hero" />
            <StatCard label="Initial value" value={formatMoney(Number(card.initialAmount))} icon="bi-gift" />
            <StatCard label="Transactions" value={card.txns.length} icon="bi-arrow-left-right" />
          </div>

          <AdminCard title="Transactions">
            <div className="table-responsive">
              <table className="admin-table">
                <thead><tr><th>Date</th><th>Reason</th><th className="td-num">Change</th></tr></thead>
                <tbody>
                  {card.txns.map((t) => (
                    <tr key={t.id}>
                      <td className="td-muted">{new Date(t.createdAt).toLocaleString("en-GB")}</td>
                      <td style={{ textTransform: "capitalize" }}>{t.reason}</td>
                      <td className="td-num" style={{ color: Number(t.delta) >= 0 ? "var(--green)" : "var(--red)" }}>{Number(t.delta) >= 0 ? "+" : ""}{formatMoney(Number(t.delta))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AdminCard>
        </div>

        {/* Rail */}
        <div className="col-12 col-lg-4">
          <AdminCard title="Status">
            <div className="mb-3"><StatusBadge status={card.status} /></div>
            <form action={setGiftCardStatus} className="d-flex flex-column gap-2">
              <input type="hidden" name="id" value={card.id} />
              <select name="status" defaultValue={card.status} className="form-select form-select-sm">
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button type="submit" className="btn btn-gold btn-sm">Update status</button>
            </form>
            <SectionLabel>Adjust balance</SectionLabel>
            <form action={adjustGiftCard} className="d-flex gap-2 align-items-end mt-2">
              <input type="hidden" name="id" value={card.id} />
              <Field label="Amount (+/−)" htmlFor="delta" col="flex-grow-1">
                <input id="delta" name="delta" type="number" step="0.01" className="form-control form-control-sm" placeholder="-10" />
              </Field>
              <button className="btn btn-outline-gold btn-sm">Apply</button>
            </form>
          </AdminCard>

          <AdminCard title="Details" className="mt-4">
            <p className="mb-1"><span className="td-muted">Initial:</span> {formatMoney(Number(card.initialAmount))}</p>
            <p className="mb-1"><span className="td-muted">Balance:</span> {formatMoney(Number(card.balance))}</p>
            {card.recipient && <p className="mb-1"><span className="td-muted">Recipient:</span> {card.recipient}</p>}
            {card.sender && <p className="mb-0"><span className="td-muted">Sender:</span> {card.sender}</p>}
          </AdminCard>
        </div>
      </div>
    </>
  );
}
