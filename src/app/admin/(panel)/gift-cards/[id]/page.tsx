import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import PageHeader from "@/components/admin/ui/page-header";
import FormSection from "@/components/admin/ui/form-section";
import StatusBadge from "@/components/admin/ui/status-badge";
import { Field } from "@/components/admin/ui/field";
import { adjustGiftCard, setGiftCardStatus } from "../actions";

export const dynamic = "force-dynamic";

export default async function GiftCardDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const card = await prisma.giftCard.findUnique({ where: { id }, include: { txns: { orderBy: { createdAt: "desc" } } } });
  if (!card) notFound();
  return (
    <>
      <PageHeader title={card.code} subtitle={`Balance ${formatMoney(Number(card.balance))}`} breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Gift cards", href: "/admin/gift-cards" }, { label: card.code }]} />
      <div className="admin-product-grid">
        <div className="admin-product-main">
          <FormSection title="Transactions" grid={false}>
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
          </FormSection>
        </div>

        <div className="admin-product-rail">
          <FormSection title="Details" grid={false}>
            <p className="mb-1"><span className="td-muted">Status:</span> <StatusBadge status={card.status} /></p>
            <p className="mb-1"><span className="td-muted">Initial:</span> {formatMoney(Number(card.initialAmount))}</p>
            <p className="mb-1"><span className="td-muted">Balance:</span> {formatMoney(Number(card.balance))}</p>
            {card.recipient && <p className="mb-1"><span className="td-muted">Recipient:</span> {card.recipient}</p>}
            {card.sender && <p className="mb-0"><span className="td-muted">Sender:</span> {card.sender}</p>}
          </FormSection>

          <FormSection title="Adjust balance" grid={false}>
            <form action={adjustGiftCard} className="d-flex gap-2 align-items-end">
              <input type="hidden" name="id" value={card.id} />
              <Field label="Amount (+/−)" htmlFor="delta" col="flex-grow-1">
                <input id="delta" name="delta" type="number" step="0.01" className="form-control" placeholder="-10" />
              </Field>
              <button className="btn btn-outline-gold">Apply</button>
            </form>
          </FormSection>

          <FormSection title="Status" grid={false}>
            <form action={setGiftCardStatus} className="d-flex gap-2">
              <input type="hidden" name="id" value={card.id} />
              <select name="status" defaultValue={card.status} className="form-select"><option value="active">active</option><option value="redeemed">redeemed</option><option value="disabled">disabled</option></select>
              <button className="btn btn-ghost">Set</button>
            </form>
          </FormSection>
        </div>
      </div>
    </>
  );
}
