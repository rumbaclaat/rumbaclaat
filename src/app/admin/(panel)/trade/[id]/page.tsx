import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import PageHeader from "@/components/admin/ui/page-header";
import AdminCard from "@/components/admin/ui/admin-card";
import AdminTabs from "@/components/admin/ui/tabs";
import StatusBadge from "@/components/admin/ui/status-badge";
import FormSection from "@/components/admin/ui/form-section";
import { TextField, SelectField } from "@/components/admin/ui/field";
import {
  updateTradeAccount, createTradeOrder, createInvoice, updateInvoiceStatus, replyTrade, addTradePricing, deleteTradePricing,
} from "../actions";

export const dynamic = "force-dynamic";

export default async function TradeDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const acct = await prisma.tradeAccount.findUnique({
    where: { id },
    include: {
      orders: { orderBy: { placedAt: "desc" } },
      invoices: { orderBy: { issuedAt: "desc" } },
      messages: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!acct) notFound();
  const [products, pricing] = await Promise.all([
    prisma.product.findMany({ where: { type: "rum" }, select: { id: true, name: true } }),
    prisma.tradeProductPricing.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  const prodName = new Map(products.map((p) => [p.id, p.name] as const));

  return (
    <>
      <PageHeader
        title={acct.companyName}
        subtitle={`${acct.contactName} · ${acct.contactEmail}`}
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Trade accounts", href: "/admin/trade" }, { label: acct.companyName }]}
        action={<a href={`mailto:${acct.contactEmail}`} className="btn btn-ghost btn-sm"><i className="bi bi-envelope me-1" />Email</a>}
      />

      <div className="admin-stat-row">
        <div className="admin-stat"><span className="admin-stat-label">Status</span><span style={{ marginTop: 6 }}><StatusBadge status={acct.status} /></span></div>
        <div className="admin-stat"><span className="admin-stat-label">Outstanding</span><span className="admin-stat-num">{formatMoney(Number(acct.outstandingBalance))}</span></div>
        <div className="admin-stat"><span className="admin-stat-label">Credit limit</span><span className="admin-stat-num">{formatMoney(Number(acct.creditLimit))}</span></div>
        <div className="admin-stat"><span className="admin-stat-label">Terms</span><span className="admin-stat-num" style={{ fontSize: "1.3rem" }}>{acct.paymentTerms}</span></div>
      </div>

      <AdminTabs
        tabs={[
          {
            id: "account", label: "Account",
            content: (
              <form action={updateTradeAccount}>
                <input type="hidden" name="id" value={acct.id} />
                <FormSection title="Account details">
                  <TextField name="phone" label="Phone" defaultValue={acct.phone ?? ""} col="col-md-6" />
                  <TextField name="businessType" label="Business type" defaultValue={acct.businessType ?? ""} col="col-md-6" />
                  <TextField name="vatNumber" label="VAT number" defaultValue={acct.vatNumber ?? ""} col="col-md-6" />
                  <TextField name="accountManager" label="Account manager" defaultValue={acct.accountManager ?? ""} col="col-md-6" />
                  <TextField name="pricingTier" label="Pricing tier" defaultValue={acct.pricingTier} col="col-md-4" />
                  <SelectField name="paymentTerms" label="Payment terms" options={["Net 30", "Net 60", "Prepaid"]} defaultValue={acct.paymentTerms} col="col-md-4" />
                  <TextField name="creditLimit" label="Credit limit (£)" type="number" step="0.01" defaultValue={Number(acct.creditLimit).toFixed(2)} col="col-md-4" />
                  <SelectField name="status" label="Status" options={["pending", "active", "suspended"]} defaultValue={acct.status} col="col-md-4" />
                </FormSection>
                <div className="d-flex justify-content-end"><button className="btn btn-gold">Save account</button></div>
              </form>
            ),
          },
          {
            id: "orders", label: "Orders", badge: acct.orders.length,
            content: (
              <>
                <AdminCard title="Wholesale orders">
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead><tr><th>Ref</th><th>Lines</th><th>Net</th><th>Total</th><th>Status</th><th>Placed</th></tr></thead>
                      <tbody>
                        {acct.orders.length === 0 && <tr><td colSpan={6} className="td-muted">No orders.</td></tr>}
                        {acct.orders.map((o) => (
                          <tr key={o.id}>
                            <td className="gold">{o.ref}</td>
                            <td className="td-muted">{(o.lines as { name: string; cases: number }[]).map((l) => `${l.cases}× ${l.name}`).join(", ")}</td>
                            <td>{formatMoney(Number(o.netTotal))}</td>
                            <td>{formatMoney(Number(o.grandTotal))}</td>
                            <td><StatusBadge status={o.status} /></td>
                            <td className="td-muted">{new Date(o.placedAt).toLocaleDateString("en-GB")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </AdminCard>
                <AdminCard title="New order" className="mt-4">
                  <form action={createTradeOrder} className="row g-2 align-items-end">
                    <input type="hidden" name="tradeAccountId" value={acct.id} />
                    <div className="col-md-5"><label className="form-label" htmlFor="toname">Product</label>
                      <select id="toname" name="name" className="form-select form-select-sm">{products.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}</select></div>
                    <div className="col-md-2"><label className="form-label" htmlFor="tocases">Cases</label><input id="tocases" name="cases" type="number" min={1} defaultValue={1} className="form-control form-control-sm" /></div>
                    <div className="col-md-3"><label className="form-label" htmlFor="toppb">£ / bottle</label><input id="toppb" name="pricePerBottle" type="number" step="0.01" className="form-control form-control-sm" /></div>
                    <div className="col-md-2"><button className="btn btn-outline-gold btn-sm w-100">Add order</button></div>
                  </form>
                </AdminCard>
              </>
            ),
          },
          {
            id: "invoices", label: "Invoices", badge: acct.invoices.length,
            content: (
              <>
                <AdminCard title="Invoices">
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead><tr><th>Ref</th><th>Amount</th><th>VAT</th><th>Due</th><th>Status</th><th></th></tr></thead>
                      <tbody>
                        {acct.invoices.length === 0 && <tr><td colSpan={6} className="td-muted">No invoices.</td></tr>}
                        {acct.invoices.map((inv) => (
                          <tr key={inv.id}>
                            <td className="gold">{inv.ref}</td>
                            <td>{formatMoney(Number(inv.amount))}</td>
                            <td>{formatMoney(Number(inv.vat))}</td>
                            <td className="td-muted">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("en-GB") : "—"}</td>
                            <td><StatusBadge status={inv.status} /></td>
                            <td>
                              <form action={updateInvoiceStatus} className="d-flex gap-1">
                                <input type="hidden" name="id" value={inv.id} />
                                <input type="hidden" name="tradeAccountId" value={acct.id} />
                                <select name="status" defaultValue={inv.status} className="form-select form-select-sm" style={{ width: "auto" }}><option value="open">open</option><option value="paid">paid</option><option value="overdue">overdue</option></select>
                                <button className="btn btn-ghost btn-sm">Set</button>
                              </form>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </AdminCard>
                <AdminCard title="New invoice" className="mt-4">
                  <form action={createInvoice} className="row g-2 align-items-end">
                    <input type="hidden" name="tradeAccountId" value={acct.id} />
                    <div className="col-md-4"><label className="form-label" htmlFor="invamt">Amount (£, ex VAT)</label><input id="invamt" name="amount" type="number" step="0.01" className="form-control form-control-sm" /></div>
                    <div className="col-md-3"><button className="btn btn-outline-gold btn-sm">Create invoice</button></div>
                  </form>
                </AdminCard>
              </>
            ),
          },
          {
            id: "messages", label: "Messages", badge: acct.messages.length,
            content: (
              <>
                <AdminCard title="Reply">
                  <form action={replyTrade} className="d-flex flex-column gap-2">
                    <input type="hidden" name="tradeAccountId" value={acct.id} />
                    <input name="subject" className="form-control form-control-sm" placeholder="Subject" />
                    <textarea name="body" rows={3} className="form-control form-control-sm" placeholder="Message…" required />
                    <button className="btn btn-gold btn-sm align-self-start"><i className="bi bi-send me-1" />Send</button>
                  </form>
                </AdminCard>
                <AdminCard title="Thread" className="mt-4">
                  {acct.messages.length === 0 && <p className="td-muted mb-0">No messages.</p>}
                  {acct.messages.map((m) => (
                    <div key={m.id} className="mb-3 pb-2" style={{ borderBottom: "1px solid var(--gold-bdr)" }}>
                      <div className="d-flex justify-content-between">
                        <strong style={{ color: m.direction === "outbound" ? "var(--gold-hi)" : "var(--text)" }}>{m.direction === "outbound" ? "Rumbaclaat" : acct.contactName}{m.subject ? ` · ${m.subject}` : ""}</strong>
                        <span className="td-muted" style={{ fontSize: ".75rem" }}>{new Date(m.createdAt).toLocaleString("en-GB")}</span>
                      </div>
                      <div style={{ fontSize: ".9rem", whiteSpace: "pre-wrap" }}>{m.body}</div>
                    </div>
                  ))}
                </AdminCard>
              </>
            ),
          },
          {
            id: "pricing", label: "Wholesale pricing",
            content: (
              <>
                <AdminCard title="Volume pricing (global)">
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead><tr><th>Product</th><th>Band</th><th>£ / bottle</th><th>£ / case</th><th></th></tr></thead>
                      <tbody>
                        {pricing.length === 0 && <tr><td colSpan={5} className="td-muted">No pricing bands set.</td></tr>}
                        {pricing.map((p) => (
                          <tr key={p.id}>
                            <td>{prodName.get(p.productId) ?? p.productId}</td>
                            <td>{p.volumeBand}</td>
                            <td>{formatMoney(Number(p.pricePerBottle))}</td>
                            <td>{formatMoney(Number(p.pricePerCase))}</td>
                            <td><form action={deleteTradePricing}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="tradeAccountId" value={acct.id} /><button className="btn btn-ghost btn-sm text-danger"><i className="bi bi-trash" /></button></form></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </AdminCard>
                <AdminCard title="Add pricing band" className="mt-4">
                  <form action={addTradePricing} className="row g-2 align-items-end">
                    <input type="hidden" name="tradeAccountId" value={acct.id} />
                    <div className="col-md-4"><label className="form-label" htmlFor="ppr">Product</label><select id="ppr" name="productId" className="form-select form-select-sm">{products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                    <div className="col-md-3"><label className="form-label" htmlFor="pband">Band</label><select id="pband" name="volumeBand" className="form-select form-select-sm"><option>1-4</option><option>5-9</option><option>10+</option></select></div>
                    <div className="col-md-3"><label className="form-label" htmlFor="pppb">£ / bottle</label><input id="pppb" name="pricePerBottle" type="number" step="0.01" className="form-control form-control-sm" /></div>
                    <div className="col-md-2"><button className="btn btn-outline-gold btn-sm w-100">Add</button></div>
                  </form>
                </AdminCard>
              </>
            ),
          },
        ]}
      />
    </>
  );
}
