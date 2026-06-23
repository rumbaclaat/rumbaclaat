import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TradeTabs from "@/components/trade/trade-tabs";
import TradeOrderCalculator from "@/components/trade/trade-order-calculator";
import { sendTradeMessage } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Trade Portal", robots: "noindex,nofollow" };

const EXPORT: Record<string, { code: string; origin: string; net: string; gross: string; abv: string; vol: string }> = {
  "Rumbaclaat Original Reserve": { code: "2208400000", origin: "Jamaica", net: "1.32 kg", gross: "1.85 kg", abv: "43%", vol: "700ml" },
  "Rumbaclaat Spiced Gold": { code: "2208400000", origin: "Barbados", net: "1.28 kg", gross: "1.79 kg", abv: "40%", vol: "700ml" },
};

const money = (n: number) => `£${n.toFixed(2)}`;

export default async function TradePortalPage() {
  const account = await prisma.tradeAccount.findFirst({ orderBy: { createdAt: "asc" } });
  if (!account) {
    return (
      <div className="container section text-center">
        <h1>Trade Portal</h1>
        <p style={{ color: "var(--text-muted)" }}>No trade account found. <Link href="/trade-apply">Apply for trade access →</Link></p>
      </div>
    );
  }

  const [orders, invoices, messages, pricingRows] = await Promise.all([
    prisma.tradeOrder.findMany({ where: { tradeAccountId: account.id }, orderBy: { placedAt: "desc" } }),
    prisma.invoice.findMany({ where: { tradeAccountId: account.id }, orderBy: { issuedAt: "desc" } }),
    prisma.tradeMessage.findMany({ where: { tradeAccountId: account.id }, orderBy: { createdAt: "desc" } }),
    prisma.tradeProductPricing.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const productIds = [...new Set(pricingRows.map((p) => p.productId))];
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  const productName = (id: string) => products.find((p) => p.id === id)?.name ?? id;

  const pricingByProduct: Record<string, typeof pricingRows> = {};
  for (const row of pricingRows) (pricingByProduct[row.productId] ??= []).push(row);

  const calcPricing: Record<string, { band: string; ppb: number }[]> = {};
  for (const [pid, rows] of Object.entries(pricingByProduct)) calcPricing[pid] = rows.map((r) => ({ band: r.volumeBand, ppb: Number(r.pricePerBottle) }));
  const calcProducts = productIds.map((id) => ({ id, name: productName(id) }));

  const ytdSpend = orders.reduce((s, o) => s + Number(o.grandTotal), 0);
  const openOrders = orders.filter((o) => o.status === "processing").length;
  const unread = messages.filter((m) => !m.read).length;

  const tabs = [
    {
      id: "pricing",
      label: "Pricing",
      content: (
        <div>
          <div className="card-brand mb-3" style={{ borderColor: "var(--gold-md)" }}>
            <p style={{ fontFamily: "var(--serif)", fontSize: "1rem", fontWeight: 600, color: "var(--gold-hi)", marginBottom: 4 }}>Your pricing tier: {account.pricingTier}</p>
            <p style={{ margin: 0 }}>All prices include UK VAT at 20%. Payment terms: {account.paymentTerms}. Minimum order: 6 bottles (1 case).</p>
          </div>
          <div className="row g-4">
            {Object.entries(pricingByProduct).map(([pid, rows]) => (
              <div className="col-12 col-lg-6" key={pid}>
                <div className="card-brand h-100">
                  <h2 className="h4 mb-3">{productName(pid)} — Wholesale</h2>
                  <div className="table-responsive">
                    <table className="trade-table">
                      <thead><tr><th>Volume</th><th>Price/Bottle</th><th>Price/Case</th></tr></thead>
                      <tbody>
                        {rows.map((r) => (
                          <tr key={r.id}>
                            <td>{r.volumeBand === "10+" ? "10+ cases" : `${r.volumeBand} cases`}</td>
                            <td style={{ color: "var(--gold-hi)", fontFamily: "var(--serif)" }}>{money(Number(r.pricePerBottle))}</td>
                            <td>{money(Number(r.pricePerCase))}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "order",
      label: "Place order",
      content: <TradeOrderCalculator products={calcProducts} pricing={calcPricing} />,
    },
    {
      id: "orders",
      label: "Orders",
      content: (
        <div className="card-brand p-0" style={{ overflow: "hidden" }}>
          <div className="table-responsive">
            <table className="trade-table">
              <thead><tr><th>Order</th><th>Date</th><th>Total (inc VAT)</th><th>Status</th></tr></thead>
              <tbody>
                {orders.length === 0 && <tr><td colSpan={4} style={{ color: "var(--text-dim)" }}>No orders yet.</td></tr>}
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td style={{ color: "var(--gold-hi)" }}>{o.ref}</td>
                    <td>{new Date(o.placedAt).toLocaleDateString("en-GB")}</td>
                    <td style={{ fontFamily: "var(--serif)", color: "var(--gold-hi)" }}>{money(Number(o.grandTotal))}</td>
                    <td style={{ textTransform: "capitalize" }}>{o.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ),
    },
    {
      id: "invoices",
      label: "Invoices",
      content: (
        <div className="card-brand p-0" style={{ overflow: "hidden" }}>
          <div className="table-responsive">
            <table className="trade-table">
              <thead><tr><th>Invoice</th><th>Issued</th><th>Amount</th><th>Terms</th><th>Status</th></tr></thead>
              <tbody>
                {invoices.length === 0 && <tr><td colSpan={5} style={{ color: "var(--text-dim)" }}>No invoices yet.</td></tr>}
                {invoices.map((iv) => (
                  <tr key={iv.id}>
                    <td style={{ color: "var(--gold-hi)" }}>{iv.ref}</td>
                    <td>{new Date(iv.issuedAt).toLocaleDateString("en-GB")}</td>
                    <td style={{ fontFamily: "var(--serif)" }}>{money(Number(iv.amount))}</td>
                    <td>{iv.terms}</td>
                    <td style={{ textTransform: "capitalize", color: iv.status === "paid" ? "var(--green)" : "var(--yellow)" }}>{iv.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ),
    },
    {
      id: "messages",
      label: "Messages",
      badge: unread || undefined,
      content: (
        <div className="row g-4">
          <div className="col-12 col-lg-6">
            {messages.map((m) => (
              <div className={`msg-item${m.read ? "" : " unread"}`} key={m.id}>
                <div className="d-flex justify-content-between mb-1"><span style={{ fontSize: ".8125rem", fontWeight: 600 }}>{m.subject ?? "Message"}</span></div>
                <span className="d-block" style={{ fontSize: ".8125rem", color: "var(--text-muted)" }}>{m.body}</span>
                <span className="d-block" style={{ fontSize: ".6875rem", color: "var(--text-dim)", marginTop: 4 }}>{m.direction === "inbound" ? "You" : "Rumbaclaat Trade Team"} · {new Date(m.createdAt).toLocaleDateString("en-GB")}</span>
              </div>
            ))}
          </div>
          <div className="col-12 col-lg-6">
            <form action={sendTradeMessage} className="card-brand">
              <h2 className="h4 mb-3">Send a message</h2>
              <div className="mb-3"><label className="form-label" htmlFor="m-subject">Subject</label><input id="m-subject" name="subject" className="form-control" /></div>
              <div className="mb-3"><label className="form-label" htmlFor="m-body">Message *</label><textarea id="m-body" name="body" rows={4} className="form-control" required /></div>
              <button type="submit" className="btn btn-gold w-100">Send message</button>
            </form>
          </div>
        </div>
      ),
    },
    {
      id: "export",
      label: "Export compliance",
      content: (
        <div className="row g-4">
          {Object.entries(pricingByProduct).map(([pid]) => {
            const e = EXPORT[productName(pid)];
            if (!e) return null;
            return (
              <div className="col-12 col-lg-6" key={pid}>
                <div className="card-brand h-100">
                  <h2 className="h4 mb-3">Export compliance — {productName(pid)}</h2>
                  <div className="table-responsive">
                    <table className="trade-table">
                      <tbody>
                        <tr><td style={{ color: "var(--text-muted)" }}>Commodity Code</td><td style={{ color: "var(--gold-hi)", fontWeight: 600 }}>{e.code}</td></tr>
                        <tr><td style={{ color: "var(--text-muted)" }}>Country of Origin</td><td>{e.origin}</td></tr>
                        <tr><td style={{ color: "var(--text-muted)" }}>Net Weight</td><td>{e.net}/bottle</td></tr>
                        <tr><td style={{ color: "var(--text-muted)" }}>Gross Weight</td><td>{e.gross}/bottle</td></tr>
                        <tr><td style={{ color: "var(--text-muted)" }}>ABV</td><td>{e.abv}</td></tr>
                        <tr><td style={{ color: "var(--text-muted)" }}>Volume</td><td>{e.vol}</td></tr>
                        <tr><td style={{ color: "var(--text-muted)" }}>Incoterms</td><td>EXW, FOB, CIF</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ),
    },
    {
      id: "account",
      label: "Account",
      content: (
        <div className="card-brand" style={{ maxWidth: 480 }}>
          <h2 className="h4 mb-3">Account summary</h2>
          <div className="d-flex justify-content-between py-2" style={{ borderBottom: "1px solid var(--gold-bdr)" }}><span style={{ color: "var(--text-muted)" }}>Company</span><span>{account.companyName}</span></div>
          <div className="d-flex justify-content-between py-2" style={{ borderBottom: "1px solid var(--gold-bdr)" }}><span style={{ color: "var(--text-muted)" }}>Status</span><span className="badge-brand" style={{ color: "var(--green)" }}>{account.status}</span></div>
          <div className="d-flex justify-content-between py-2" style={{ borderBottom: "1px solid var(--gold-bdr)" }}><span style={{ color: "var(--text-muted)" }}>Pricing tier</span><span className="badge-brand badge-gold">{account.pricingTier}</span></div>
          <div className="d-flex justify-content-between py-2" style={{ borderBottom: "1px solid var(--gold-bdr)" }}><span style={{ color: "var(--text-muted)" }}>Payment terms</span><span>{account.paymentTerms}</span></div>
          <div className="d-flex justify-content-between py-2" style={{ borderBottom: "1px solid var(--gold-bdr)" }}><span style={{ color: "var(--text-muted)" }}>Credit limit</span><span style={{ fontFamily: "var(--serif)", color: "var(--gold-hi)" }}>{money(Number(account.creditLimit))}</span></div>
          <div className="d-flex justify-content-between py-2"><span style={{ color: "var(--text-muted)" }}>Outstanding balance</span><span style={{ fontFamily: "var(--serif)" }}>{money(Number(account.outstandingBalance))}</span></div>
        </div>
      ),
    },
  ];

  return (
    <div className="container section">
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-2">
        <div><span className="eyebrow">Trade Portal</span><h1 style={{ fontSize: "2rem" }}>Wholesale &amp; Export</h1></div>
        <span className="badge-brand badge-gold">Signed in · {account.companyName}</span>
      </div>

      <div className="row g-3">
        <div className="col-6 col-lg-3"><div className="card-brand h-100"><div style={{ fontSize: ".75rem", color: "var(--text-muted)" }}>YTD Orders</div><div className="serif" style={{ fontSize: "1.75rem" }}>{orders.length}</div></div></div>
        <div className="col-6 col-lg-3"><div className="card-brand h-100"><div style={{ fontSize: ".75rem", color: "var(--text-muted)" }}>YTD Spend</div><div className="serif" style={{ fontSize: "1.75rem" }}>{money(ytdSpend)}</div></div></div>
        <div className="col-6 col-lg-3"><div className="card-brand h-100"><div style={{ fontSize: ".75rem", color: "var(--text-muted)" }}>Open Orders</div><div className="serif" style={{ fontSize: "1.75rem" }}>{openOrders}</div></div></div>
        <div className="col-6 col-lg-3"><div className="card-brand h-100"><div style={{ fontSize: ".75rem", color: "var(--text-muted)" }}>Outstanding</div><div className="serif" style={{ fontSize: "1.75rem" }}>{money(Number(account.outstandingBalance))}</div></div></div>
      </div>

      <TradeTabs tabs={tabs} />
    </div>
  );
}
