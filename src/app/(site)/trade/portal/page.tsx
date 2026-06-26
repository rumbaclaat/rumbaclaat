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

// Champagne table header: uppercase .66rem --text-dim on --surface-sunken
const thBase = {
  fontSize: ".66rem",
  fontWeight: 600,
  letterSpacing: ".08em",
  textTransform: "uppercase" as const,
  color: "var(--text-dim)",
  background: "var(--surface-sunken)",
};
const thNum = { ...thBase, textAlign: "right" as const };
const tdNum = { textAlign: "right" as const, fontVariantNumeric: "tabular-nums" as const };
const sectionHead = (eyebrow: string, title: string, lede?: string) => (
  <div className="mb-4">
    <span className="eyebrow">{eyebrow}</span>
    <h2 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "clamp(1.5rem, 3vw, 2rem)", margin: 0 }}>{title}</h2>
    {lede ? <p style={{ color: "var(--text-muted)", lineHeight: 1.7, margin: "8px 0 0" }}>{lede}</p> : null}
  </div>
);

export default async function TradePortalPage() {
  const account = await prisma.tradeAccount.findFirst({ orderBy: { createdAt: "asc" } });
  if (!account) {
    return (
      <section className="section">
        <div className="container text-center">
          <span className="eyebrow eyebrow-center">Trade Portal</span>
          <h1 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "clamp(2rem, 4.4vw, 3rem)", margin: 0 }}>Trade Portal</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 14 }}>No trade account found. <Link href="/trade-apply">Apply for trade access →</Link></p>
        </div>
      </section>
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
          {sectionHead("Your rate card", "Wholesale pricing", `All prices include UK VAT at 20%. Payment terms: ${account.paymentTerms}. Minimum order: 6 bottles (1 case).`)}
          <div className="card-brand card-brand--feature mb-4" style={{ padding: 22 }}>
            <p style={{ fontFamily: "var(--serif)", fontSize: "1.2rem", fontWeight: 600, color: "var(--gold-hi)", margin: "0 0 4px" }}>Your pricing tier: {account.pricingTier}</p>
            <p style={{ color: "var(--text-muted)", margin: 0 }}>Tiered rates below are locked to your account and refresh automatically with each volume band.</p>
          </div>
          <div className="row g-4">
            {Object.entries(pricingByProduct).map(([pid, rows]) => (
              <div className="col-12 col-lg-6" key={pid}>
                <div className="card-brand h-100 p-0" style={{ overflow: "hidden" }}>
                  <h3 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "1.25rem", margin: 0, padding: "20px 22px 16px", borderBottom: "1px solid var(--line)" }}>{productName(pid)} — Wholesale</h3>
                  <div className="table-responsive">
                    <table className="trade-table">
                      <thead><tr><th style={thBase}>Volume</th><th style={thNum}>Price/Bottle</th><th style={thNum}>Price/Case</th></tr></thead>
                      <tbody>
                        {rows.map((r) => (
                          <tr key={r.id}>
                            <td>{r.volumeBand === "10+" ? "10+ cases" : `${r.volumeBand} cases`}</td>
                            <td style={{ ...tdNum, color: "var(--gold-hi)", fontFamily: "var(--serif)" }}>{money(Number(r.pricePerBottle))}</td>
                            <td style={tdNum}>{money(Number(r.pricePerCase))}</td>
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
      content: (
        <div>
          {sectionHead("New order", "Place an order", "Build your order against your locked rate card — totals update live as you change quantities.")}
          <TradeOrderCalculator products={calcProducts} pricing={calcPricing} />
        </div>
      ),
    },
    {
      id: "orders",
      label: "Orders",
      content: (
        <div>
          {sectionHead("History", "Your orders")}
          <div className="card-brand p-0" style={{ overflow: "hidden" }}>
            <div className="table-responsive">
              <table className="trade-table">
                <thead><tr><th style={thBase}>Order</th><th style={thBase}>Date</th><th style={thNum}>Total (inc VAT)</th><th style={thBase}>Status</th></tr></thead>
                <tbody>
                  {orders.length === 0 && <tr><td colSpan={4} style={{ color: "var(--text-dim)" }}>No orders yet.</td></tr>}
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td style={{ color: "var(--gold-hi)", fontWeight: 600 }}>{o.ref}</td>
                      <td>{new Date(o.placedAt).toLocaleDateString("en-GB")}</td>
                      <td style={{ ...tdNum, fontFamily: "var(--serif)", color: "var(--gold-hi)" }}>{money(Number(o.grandTotal))}</td>
                      <td style={{ textTransform: "capitalize" }}>{o.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "invoices",
      label: "Invoices",
      content: (
        <div>
          {sectionHead("Billing", "Your invoices")}
          <div className="card-brand p-0" style={{ overflow: "hidden" }}>
            <div className="table-responsive">
              <table className="trade-table">
                <thead><tr><th style={thBase}>Invoice</th><th style={thBase}>Issued</th><th style={thNum}>Amount</th><th style={thBase}>Terms</th><th style={thBase}>Status</th></tr></thead>
                <tbody>
                  {invoices.length === 0 && <tr><td colSpan={5} style={{ color: "var(--text-dim)" }}>No invoices yet.</td></tr>}
                  {invoices.map((iv) => (
                    <tr key={iv.id}>
                      <td style={{ color: "var(--gold-hi)", fontWeight: 600 }}>{iv.ref}</td>
                      <td>{new Date(iv.issuedAt).toLocaleDateString("en-GB")}</td>
                      <td style={{ ...tdNum, fontFamily: "var(--serif)" }}>{money(Number(iv.amount))}</td>
                      <td>{iv.terms}</td>
                      <td>
                        <span className="badge-brand" style={iv.status === "paid"
                          ? { color: "var(--green)", background: "rgba(111,207,151,.12)", borderColor: "rgba(111,207,151,.3)", textTransform: "capitalize" }
                          : { color: "var(--yellow)", background: "rgba(232,182,90,.12)", borderColor: "rgba(232,182,90,.3)", textTransform: "capitalize" }}>{iv.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "messages",
      label: "Messages",
      badge: unread || undefined,
      content: (
        <div>
          {sectionHead("Account manager", "Messages")}
          <div className="row g-4">
            <div className="col-12 col-lg-6">
              {messages.length === 0 && <p style={{ color: "var(--text-dim)" }}>No messages yet.</p>}
              {messages.map((m) => (
                <div className={`msg-item${m.read ? "" : " unread"}`} key={m.id}>
                  <div className="d-flex justify-content-between mb-1"><span style={{ fontSize: ".875rem", fontWeight: 600, color: "var(--text)" }}>{m.subject ?? "Message"}</span></div>
                  <span className="d-block" style={{ fontSize: ".875rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{m.body}</span>
                  <span className="d-block" style={{ fontSize: ".6875rem", color: "var(--text-dim)", marginTop: 6 }}>{m.direction === "inbound" ? "You" : "Rumbaclaat Trade Team"} · {new Date(m.createdAt).toLocaleDateString("en-GB")}</span>
                </div>
              ))}
            </div>
            <div className="col-12 col-lg-6">
              <form action={sendTradeMessage} className="card-brand" style={{ padding: 24 }}>
                <h3 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "1.25rem", margin: "0 0 18px" }}>Send a message</h3>
                <div className="mb-3">
                  <label className="form-label" htmlFor="m-subject" style={{ fontSize: ".78rem", color: "var(--text-muted)", marginBottom: 6 }}>Subject</label>
                  <input id="m-subject" name="subject" className="form-control" />
                </div>
                <div className="mb-4">
                  <label className="form-label" htmlFor="m-body" style={{ fontSize: ".78rem", color: "var(--text-muted)", marginBottom: 6 }}>Message *</label>
                  <textarea id="m-body" name="body" rows={4} className="form-control" required />
                </div>
                <button type="submit" className="btn btn-gold w-100">Send message</button>
              </form>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "export",
      label: "Export compliance",
      content: (
        <div>
          {sectionHead("Documentation", "Export compliance", "Commodity codes, weights and Incoterms for your international shipments.")}
          <div className="row g-4">
            {Object.entries(pricingByProduct).map(([pid]) => {
              const e = EXPORT[productName(pid)];
              if (!e) return null;
              return (
                <div className="col-12 col-lg-6" key={pid}>
                  <div className="card-brand h-100 p-0" style={{ overflow: "hidden" }}>
                    <h3 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "1.25rem", margin: 0, padding: "20px 22px 16px", borderBottom: "1px solid var(--line)" }}>Export compliance — {productName(pid)}</h3>
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
        </div>
      ),
    },
    {
      id: "account",
      label: "Account",
      content: (
        <div>
          {sectionHead("Your account", "Account summary")}
          <div className="card-brand" style={{ maxWidth: 480, padding: 24 }}>
            <div className="d-flex justify-content-between py-2" style={{ borderBottom: "1px solid var(--line-2)" }}><span style={{ color: "var(--text-muted)" }}>Company</span><span style={{ color: "var(--text)" }}>{account.companyName}</span></div>
            <div className="d-flex justify-content-between align-items-center py-2" style={{ borderBottom: "1px solid var(--line-2)" }}><span style={{ color: "var(--text-muted)" }}>Status</span><span className="badge-brand" style={{ color: "var(--green)", background: "rgba(111,207,151,.12)", borderColor: "rgba(111,207,151,.3)" }}>{account.status}</span></div>
            <div className="d-flex justify-content-between align-items-center py-2" style={{ borderBottom: "1px solid var(--line-2)" }}><span style={{ color: "var(--text-muted)" }}>Pricing tier</span><span className="badge-brand badge-gold">{account.pricingTier}</span></div>
            <div className="d-flex justify-content-between py-2" style={{ borderBottom: "1px solid var(--line-2)" }}><span style={{ color: "var(--text-muted)" }}>Payment terms</span><span style={{ color: "var(--text)" }}>{account.paymentTerms}</span></div>
            <div className="d-flex justify-content-between py-2" style={{ borderBottom: "1px solid var(--line-2)" }}><span style={{ color: "var(--text-muted)" }}>Credit limit</span><span style={{ fontFamily: "var(--serif)", color: "var(--gold-hi)", fontVariantNumeric: "tabular-nums" }}>{money(Number(account.creditLimit))}</span></div>
            <div className="d-flex justify-content-between py-2"><span style={{ color: "var(--text-muted)" }}>Outstanding balance</span><span style={{ fontFamily: "var(--serif)", color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>{money(Number(account.outstandingBalance))}</span></div>
          </div>
        </div>
      ),
    },
  ];

  const stats = [
    { label: "YTD Orders", value: String(orders.length) },
    { label: "YTD Spend", value: money(ytdSpend) },
    { label: "Open Orders", value: String(openOrders) },
    { label: "Outstanding", value: money(Number(account.outstandingBalance)) },
  ];

  return (
    <section className="section">
      <div className="container">
        <div className="d-flex align-items-end justify-content-between flex-wrap gap-3 mb-4">
          <div>
            <span className="eyebrow">Trade Portal</span>
            <h1 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "clamp(2rem, 4.4vw, 3.4rem)", lineHeight: 1.05, margin: 0 }}>Wholesale &amp; Export</h1>
          </div>
          <span className="badge-brand badge-gold">Signed in · {account.companyName}</span>
        </div>

        <div className="row g-3">
          {stats.map((s) => (
            <div className="col-6 col-lg-3" key={s.label}>
              <div className="card-brand h-100" style={{ padding: 20 }}>
                <div style={{ fontSize: ".66rem", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--text-dim)" }}>{s.label}</div>
                <div className="serif" style={{ fontSize: "1.9rem", color: "var(--gold-hi)", fontVariantNumeric: "tabular-nums", marginTop: 6 }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        <TradeTabs tabs={tabs} />
      </div>
    </section>
  );
}
