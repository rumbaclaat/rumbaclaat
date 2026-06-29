import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TradePortalTabs from "@/components/trade/trade-portal-tabs";
import TradeOrderCalculator from "@/components/trade/trade-order-calculator";
import { sendTradeMessage } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Trade Portal", robots: "noindex,nofollow" };

const EXPORT: Record<string, { code: string; origin: string; net: string; gross: string; abv: string; vol: string }> = {
  "Rumbaclaat Original Reserve": { code: "2208400000", origin: "Jamaica", net: "1.32 kg", gross: "1.85 kg", abv: "43%", vol: "700ml" },
  "Rumbaclaat Spiced Gold": { code: "2208400000", origin: "Barbados", net: "1.28 kg", gross: "1.79 kg", abv: "40%", vol: "700ml" },
};

const money = (n: number) => `£${n.toFixed(2)}`;

// Status badge styles, matching the prototype's inline pill treatment.
const badgeBase: React.CSSProperties = {
  display: "inline-block",
  fontSize: ".7rem",
  fontWeight: 600,
  borderRadius: 999,
  padding: "3px 10px",
  textTransform: "capitalize",
  border: "1px solid",
};
const greenBadge: React.CSSProperties = { ...badgeBase, color: "var(--green)", background: "rgba(111,207,151,.12)", borderColor: "rgba(111,207,151,.3)" };
const yellowBadge: React.CSSProperties = { ...badgeBase, color: "var(--yellow)", background: "rgba(232,182,90,.12)", borderColor: "rgba(232,182,90,.3)" };
const goldBadge: React.CSSProperties = { ...badgeBase, color: "var(--goldHi)", background: "var(--goldLt)", borderColor: "var(--gold-bdr)", textTransform: "none" };

const cardStyle: React.CSSProperties = { background: "var(--surface)", border: "1px solid var(--line2)", borderRadius: 16, overflow: "hidden" };
const cardPad: React.CSSProperties = { background: "var(--surface)", border: "1px solid var(--line2)", borderRadius: 16, padding: "22px 24px" };
const cardTitle: React.CSSProperties = { fontFamily: "var(--serif)", fontWeight: 600, fontSize: "1.3rem", margin: 0 };
const fieldStyle: React.CSSProperties = { width: "100%", background: "var(--surface2)", border: "1px solid var(--line2)", color: "var(--text)", borderRadius: 10, padding: "11px 14px", fontSize: ".88rem", outline: "none", fontFamily: "var(--sans)" };
const fieldLabel: React.CSSProperties = { display: "block", color: "var(--muted)", fontSize: ".78rem", marginBottom: 6 };

export default async function TradePortalPage() {
  const account = await prisma.tradeAccount.findFirst({ orderBy: { createdAt: "asc" } });
  if (!account) {
    return (
      <section style={{ padding: "clamp(36px,5vw,56px) clamp(20px,5vw,40px) clamp(72px,9vw,110px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
          <span style={{ fontSize: ".74rem", letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 600 }}>Trade Portal</span>
          <h1 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "clamp(1.9rem, 4vw, 2.7rem)", margin: "10px 0 0" }}>Trade Portal</h1>
          <p style={{ color: "var(--muted)", marginTop: 14 }}>No trade account found. <Link href="/trade-apply">Apply for trade access →</Link></p>
        </div>
      </section>
    );
  }

  const [orders, messages, pricingRows, invoices] = await Promise.all([
    prisma.tradeOrder.findMany({ where: { tradeAccountId: account.id }, orderBy: { placedAt: "desc" } }),
    prisma.tradeMessage.findMany({ where: { tradeAccountId: account.id }, orderBy: { createdAt: "desc" } }),
    prisma.tradeProductPricing.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.invoice.findMany({ where: { tradeAccountId: account.id }, orderBy: { issuedAt: "desc" } }),
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

  const now = new Date();
  const ordersThisMonth = orders.filter((o) => {
    const d = new Date(o.placedAt);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;
  const minPpb = pricingRows.length ? Math.min(...pricingRows.map((r) => Number(r.pricePerBottle))) : 0;

  const fmtDate = (d: Date | string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  // ---- Stat cards (prototype: tradeStats — label / value / icon) ----
  const stats = [
    { label: "YTD Orders", value: String(orders.length), icon: "bag-check" },
    { label: "YTD Spend", value: money(ytdSpend), icon: "graph-up" },
    { label: "Pricing tier", value: account.pricingTier, icon: "tags" },
    { label: "Open orders", value: String(openOrders), icon: "hourglass-split" },
  ];

  // ---- Dashboard panel: exact prototype 1.5fr / 1fr layout ----
  const dashboard = (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.5fr) minmax(0,1fr)", gap: 20, alignItems: "start" }} className="trade-portal-grid">
      {/* LEFT COLUMN */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Your pricing */}
        <div style={cardPad}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
            <h2 style={cardTitle}>Your pricing</h2>
            <span style={{ fontSize: ".72rem", color: "var(--goldHi)", background: "var(--goldLt)", border: "1px solid var(--gold-bdr)", borderRadius: 999, padding: "3px 10px" }}>{account.pricingTier} tier</span>
          </div>
          <p style={{ color: "var(--dim)", fontSize: ".8rem", margin: "0 0 18px" }}>Incl. UK VAT at 20% · {account.paymentTerms} · Min order 6 bottles (1 case).</p>
          {Object.entries(pricingByProduct).map(([pid, rows]) => (
            <div style={{ marginBottom: 18 }} key={pid}>
              <div style={{ fontWeight: 600, fontSize: ".92rem", color: "var(--text)", marginBottom: 10 }}>{productName(pid)}</div>
              <div style={{ border: "1px solid var(--line2)", borderRadius: 11, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: "var(--surface2)", fontSize: ".68rem", letterSpacing: ".06em", textTransform: "uppercase", color: "var(--dim)", fontWeight: 600 }}>
                  <span style={{ padding: "9px 14px" }}>Volume</span>
                  <span style={{ padding: "9px 14px", textAlign: "right" }}>Per bottle</span>
                  <span style={{ padding: "9px 14px", textAlign: "right" }}>Per case</span>
                </div>
                {rows.map((r) => (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderTop: "1px solid var(--line2)", fontSize: ".86rem" }} key={r.id}>
                    <span style={{ padding: "11px 14px", color: "var(--muted)" }}>{r.volumeBand === "10+" ? "10+ cases" : `${r.volumeBand} cases`}</span>
                    <span style={{ padding: "11px 14px", textAlign: "right", color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>{money(Number(r.pricePerBottle))}</span>
                    <span style={{ padding: "11px 14px", textAlign: "right", color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>{money(Number(r.pricePerCase))}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Recent orders */}
        <div style={cardStyle}>
          <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--line2)" }}><h2 style={cardTitle}>Recent orders</h2></div>
          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr auto auto", gap: 12, padding: "11px 24px", background: "var(--surface2)", fontSize: ".66rem", letterSpacing: ".06em", textTransform: "uppercase", color: "var(--dim)", fontWeight: 600 }}>
            <span>Order</span><span>Date</span><span style={{ textAlign: "right" }}>Total</span><span style={{ textAlign: "right" }}>Status</span>
          </div>
          {orders.length === 0 && <div style={{ padding: "14px 24px", color: "var(--dim)", fontSize: ".88rem" }}>No orders yet.</div>}
          {orders.map((o) => (
            <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr auto auto", gap: 12, alignItems: "center", padding: "14px 24px", borderTop: "1px solid var(--line2)", fontSize: ".88rem" }} key={o.id}>
              <span style={{ color: "var(--goldHi)", fontWeight: 600 }}>{o.ref}</span>
              <span style={{ color: "var(--muted)" }}>{fmtDate(o.placedAt)}</span>
              <span style={{ textAlign: "right", color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>{money(Number(o.grandTotal))}</span>
              <span style={{ textAlign: "right" }}><span style={o.status === "delivered" ? greenBadge : yellowBadge}>{o.status}</span></span>
            </div>
          ))}
        </div>

        {/* Invoices */}
        <div style={cardStyle}>
          <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--line2)" }}><h2 style={cardTitle}>Invoices</h2></div>
          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr auto auto auto", gap: 12, padding: "11px 24px", background: "var(--surface2)", fontSize: ".66rem", letterSpacing: ".06em", textTransform: "uppercase", color: "var(--dim)", fontWeight: 600 }}>
            <span>Invoice</span><span>Issued</span><span style={{ textAlign: "right" }}>Amount</span><span style={{ textAlign: "right" }}>Terms</span><span style={{ textAlign: "right" }}>Status</span>
          </div>
          {invoices.length === 0 && <div style={{ padding: "14px 24px", color: "var(--dim)", fontSize: ".88rem" }}>No invoices yet.</div>}
          {invoices.map((iv) => (
            <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr auto auto auto", gap: 12, alignItems: "center", padding: "14px 24px", borderTop: "1px solid var(--line2)", fontSize: ".88rem" }} key={iv.id}>
              <span style={{ color: "var(--goldHi)", fontWeight: 600 }}>{iv.ref}</span>
              <span style={{ color: "var(--muted)" }}>{fmtDate(iv.issuedAt)}</span>
              <span style={{ textAlign: "right", color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>{money(Number(iv.amount))}</span>
              <span style={{ textAlign: "right", color: "var(--muted)" }}>{iv.terms}</span>
              <span style={{ textAlign: "right" }}><span style={iv.status === "paid" ? greenBadge : iv.status === "overdue" ? yellowBadge : goldBadge}>{iv.status}</span></span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <TradeOrderCalculator products={calcProducts} pricing={calcPricing} />

        {/* Messages */}
        <div style={cardPad}>
          <h3 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "1.2rem", margin: "0 0 16px" }}>Messages</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {messages.length === 0 && <div style={{ color: "var(--dim)", fontSize: ".8rem" }}>No messages yet.</div>}
            {messages.map((m) => (
              <div style={{ borderLeft: "2px solid var(--gold)", padding: "2px 0 2px 13px" }} key={m.id}>
                <div style={{ fontWeight: 600, fontSize: ".86rem", color: "var(--text)" }}>{m.subject ?? "Message"}</div>
                <div style={{ color: "var(--muted)", fontSize: ".8rem", lineHeight: 1.5, marginTop: 3 }}>{m.body}</div>
                <div style={{ color: "var(--dim)", fontSize: ".72rem", marginTop: 5 }}>{m.direction === "inbound" ? "You" : "Rumbaclaat Trade Team"} · {fmtDate(m.createdAt)}</div>
              </div>
            ))}
          </div>
          <form action={sendTradeMessage} style={{ marginTop: 18, borderTop: "1px solid var(--line2)", paddingTop: 18 }}>
            <label htmlFor="m-subject" style={fieldLabel}>Subject</label>
            <input id="m-subject" name="subject" style={{ ...fieldStyle, marginBottom: 12 }} />
            <label htmlFor="m-body" style={fieldLabel}>Message *</label>
            <textarea id="m-body" name="body" rows={3} required style={{ ...fieldStyle, marginBottom: 14, resize: "vertical" }} />
            <button type="submit" style={{ width: "100%", background: "var(--gold)", color: "var(--onGold)", border: "none", borderRadius: 999, padding: 12, fontSize: ".9rem", fontWeight: 600, cursor: "pointer" }}>Send message</button>
          </form>
        </div>
      </div>
    </div>
  );

  // ---- Export compliance panel ----
  const exportPanel = (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 20 }} className="trade-portal-grid">
      {Object.entries(pricingByProduct).map(([pid]) => {
        const e = EXPORT[productName(pid)];
        if (!e) return null;
        const rows: [string, string][] = [
          ["Commodity Code", e.code],
          ["Country of Origin", e.origin],
          ["Net Weight", `${e.net}/bottle`],
          ["Gross Weight", `${e.gross}/bottle`],
          ["ABV", e.abv],
          ["Volume", e.vol],
          ["Incoterms", "EXW, FOB, CIF"],
        ];
        return (
          <div style={cardStyle} key={pid}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--line2)" }}><h2 style={cardTitle}>Export — {productName(pid)}</h2></div>
            {rows.map(([k, v], i) => (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "12px 24px", borderTop: i === 0 ? "none" : "1px solid var(--line2)", fontSize: ".88rem" }} key={k}>
                <span style={{ color: "var(--muted)" }}>{k}</span>
                <span style={{ textAlign: "right", color: k === "Commodity Code" ? "var(--goldHi)" : "var(--text)", fontWeight: k === "Commodity Code" ? 600 : 400 }}>{v}</span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );

  // ---- Account panel ----
  const accountPanel = (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 20 }} className="trade-portal-grid">
      <div style={cardPad}>
        <h3 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "1.25rem", margin: "0 0 18px" }}>Company details</h3>
        <form>
          <label htmlFor="ta-company" style={fieldLabel}>Company name</label>
          <input id="ta-company" name="companyName" defaultValue={account.companyName} autoComplete="organization" style={{ ...fieldStyle, marginBottom: 14 }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label htmlFor="ta-contact" style={fieldLabel}>Contact name</label>
              <input id="ta-contact" name="contactName" defaultValue={account.contactName} autoComplete="name" style={{ ...fieldStyle, marginBottom: 14 }} />
            </div>
            <div>
              <label htmlFor="ta-email" style={fieldLabel}>Email</label>
              <input id="ta-email" name="contactEmail" type="email" defaultValue={account.contactEmail} autoComplete="email" style={{ ...fieldStyle, marginBottom: 14 }} />
            </div>
          </div>
          <label htmlFor="ta-btype" style={fieldLabel}>Business type</label>
          <select id="ta-btype" name="businessType" defaultValue={account.businessType ?? "Off-licence / Retailer"} style={{ ...fieldStyle, marginBottom: 14, cursor: "pointer" }}>
            <option>Restaurant / Bar</option>
            <option>Off-licence / Retailer</option>
            <option>Wholesale Distributor</option>
            <option>Export / International</option>
          </select>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label htmlFor="ta-vat" style={fieldLabel}>VAT number</label>
              <input id="ta-vat" name="vatNumber" defaultValue={account.vatNumber ?? ""} style={{ ...fieldStyle, marginBottom: 14 }} />
            </div>
            <div>
              <label htmlFor="ta-terms" style={fieldLabel}>Payment terms</label>
              <input id="ta-terms" name="paymentTerms" defaultValue={account.paymentTerms} readOnly style={{ ...fieldStyle, marginBottom: 14, opacity: 0.6 }} />
            </div>
          </div>
          <button type="submit" style={{ background: "var(--gold)", color: "var(--onGold)", border: "none", borderRadius: 999, padding: "12px 26px", fontSize: ".9rem", fontWeight: 600, cursor: "pointer" }}>Save changes</button>
        </form>
      </div>
      <div style={cardPad}>
        <h3 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "1.25rem", margin: "0 0 18px" }}>Account summary</h3>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--line2)" }}><span style={{ color: "var(--muted)" }}>Account status</span><span style={greenBadge}>{account.status}</span></div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--line2)" }}><span style={{ color: "var(--muted)" }}>Pricing tier</span><span style={goldBadge}>{account.pricingTier}</span></div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--line2)" }}><span style={{ color: "var(--muted)" }}>Credit limit</span><span style={{ fontFamily: "var(--serif)", color: "var(--goldHi)", fontVariantNumeric: "tabular-nums" }}>{money(Number(account.creditLimit))}</span></div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--line2)" }}><span style={{ color: "var(--muted)" }}>Outstanding balance</span><span style={{ fontFamily: "var(--serif)", color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>{money(Number(account.outstandingBalance))}</span></div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0" }}><span style={{ color: "var(--muted)" }}>Account manager</span><span style={{ fontSize: ".875rem" }}><a href={`mailto:${account.accountManager ?? "trade@rumbaclaat.com"}`}>{account.accountManager ?? "trade@rumbaclaat.com"}</a></span></div>
      </div>
    </div>
  );

  const tabs = [
    { id: "dashboard", label: "Dashboard", content: dashboard },
    { id: "export", label: "Export compliance", content: exportPanel },
    { id: "account", label: "Account", content: accountPanel },
    { id: "messages", label: "Messages", badge: unread || undefined, content: dashboard },
  ];

  return (
    <section style={{ padding: "clamp(36px,5vw,56px) clamp(20px,5vw,40px) clamp(72px,9vw,110px)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginBottom: 26 }}>
          <div>
            <span style={{ fontSize: ".74rem", letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 600 }}>Trade Portal · Wholesale &amp; Export</span>
            <h1 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "clamp(1.9rem,4vw,2.7rem)", lineHeight: 1.05, margin: "10px 0 0" }}>{account.companyName}</h1>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 10, color: "var(--green)", fontSize: ".82rem" }}><i className="bi bi-check-circle-fill" />Signed in · {account.pricingTier} tier · {account.paymentTerms} terms</div>
          </div>
          <Link href="/trade" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", border: "1px solid var(--line)", color: "var(--muted)", borderRadius: 999, padding: "10px 20px", fontSize: ".86rem", textDecoration: "none" }}>
            <i className="bi bi-box-arrow-right" />Sign out
          </Link>
        </div>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 16, marginBottom: 24 }} className="trade-stat-grid">
          {stats.map((s) => (
            <div style={{ background: "var(--surface)", border: "1px solid var(--line2)", borderRadius: 14, padding: "18px 20px" }} key={s.label}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: ".7rem", letterSpacing: ".08em", textTransform: "uppercase", color: "var(--dim)" }}>{s.label}</span>
                <i className={`bi bi-${s.icon}`} style={{ color: "var(--gold)", fontSize: ".95rem" }} />
              </div>
              <div style={{ fontFamily: "var(--serif)", fontSize: "1.85rem", color: "var(--text)", lineHeight: 1, marginTop: 10 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Tab pills + panels */}
        <TradePortalTabs tabs={tabs} />

        {/* Helper note — minPpb surfaced for the rate card */}
        {minPpb ? <p style={{ color: "var(--dim)", fontSize: ".74rem", marginTop: 18 }}>Wholesale rate card from {money(minPpb)} per bottle · {ordersThisMonth} order(s) placed this month.</p> : null}
      </div>
    </section>
  );
}
