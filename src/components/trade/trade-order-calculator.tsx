"use client";

import { useState } from "react";
import { submitTradeOrder } from "@/app/(site)/trade/portal/actions";

type Band = { band: string; ppb: number };

const fieldStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--surface2)",
  border: "1px solid var(--line2)",
  color: "var(--text)",
  borderRadius: 10,
  padding: "11px 14px",
  fontSize: ".88rem",
  outline: "none",
  fontFamily: "var(--sans)",
  marginBottom: 14,
};
const labelStyle: React.CSSProperties = {
  display: "block",
  color: "var(--muted)",
  fontSize: ".78rem",
  marginBottom: 6,
};

export default function TradeOrderCalculator({
  products,
  pricing,
}: {
  products: { id: string; name: string }[];
  pricing: Record<string, Band[]>;
}) {
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [cases, setCases] = useState("");

  const n = parseInt(cases, 10) || 0;
  const bands = pricing[productId] ?? [];
  const ppb =
    n <= 0
      ? 0
      : (bands.find((b) => (b.band === "1-4" && n <= 4) || (b.band === "5-9" && n >= 5 && n <= 9) || (b.band === "10+" && n >= 10))?.ppb ?? bands[0]?.ppb ?? 0);
  const bottles = n * 6;
  const net = bottles * ppb;
  const vat = net * 0.2;
  const total = net + vat;
  const money = (x: number) => `£${x.toFixed(2)}`;

  return (
    <form
      action={submitTradeOrder}
      style={{
        background: "linear-gradient(165deg, rgba(205,181,130,.13), var(--card))",
        border: "1px solid var(--gold)",
        borderRadius: 16,
        padding: 24,
      }}
    >
      <h3 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "1.25rem", margin: "0 0 16px" }}>Place a new order</h3>

      <label htmlFor="t-product" style={labelStyle}>Product *</label>
      <select
        id="t-product"
        name="productId"
        value={productId}
        onChange={(e) => setProductId(e.target.value)}
        required
        style={{ ...fieldStyle, cursor: "pointer", color: "var(--muted)" }}
      >
        {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>

      <label htmlFor="t-cases" style={labelStyle}>Number of cases *</label>
      <input
        id="t-cases"
        name="cases"
        type="number"
        min={1}
        placeholder="6"
        value={cases}
        onChange={(e) => setCases(e.target.value)}
        required
        style={fieldStyle}
      />

      <label htmlFor="t-po" style={labelStyle}>PO reference</label>
      <input id="t-po" name="poReference" style={{ ...fieldStyle, marginBottom: 18 }} />

      <input type="hidden" name="deliveryNotes" value="" />

      {n > 0 && (
        <div
          aria-live="polite"
          style={{ background: "var(--surface2)", border: "1px solid var(--line2)", borderRadius: 11, padding: 16, marginBottom: 18 }}
        >
          <div className="d-flex justify-content-between" style={{ fontSize: ".84rem", marginBottom: 8 }}><span style={{ color: "var(--muted)" }}>Cases × 6 = Bottles</span><span style={{ fontVariantNumeric: "tabular-nums" }}>{bottles}</span></div>
          <div className="d-flex justify-content-between" style={{ fontSize: ".84rem", marginBottom: 8 }}><span style={{ color: "var(--muted)" }}>Price per bottle</span><span style={{ fontVariantNumeric: "tabular-nums" }}>{money(ppb)}</span></div>
          <div className="d-flex justify-content-between" style={{ fontSize: ".84rem", marginBottom: 8 }}><span style={{ color: "var(--muted)" }}>Net total</span><span style={{ fontVariantNumeric: "tabular-nums" }}>{money(net)}</span></div>
          <div className="d-flex justify-content-between" style={{ fontSize: ".84rem", marginBottom: 10 }}><span style={{ color: "var(--muted)" }}>VAT (20%)</span><span style={{ fontVariantNumeric: "tabular-nums" }}>{money(vat)}</span></div>
          <div className="d-flex justify-content-between align-items-center" style={{ borderTop: "1px solid var(--line2)", paddingTop: 10 }}><span style={{ fontWeight: 600, fontSize: ".88rem" }}>Grand total (inc VAT)</span><span style={{ fontFamily: "var(--serif)", color: "var(--goldHi)", fontSize: "1.35rem", fontVariantNumeric: "tabular-nums" }}>{money(total)}</span></div>
        </div>
      )}

      <button
        type="submit"
        style={{ width: "100%", background: "var(--gold)", color: "var(--onGold)", border: "none", borderRadius: 999, padding: 12, fontSize: ".9rem", fontWeight: 600, cursor: "pointer" }}
      >
        Submit order request
      </button>
    </form>
  );
}
