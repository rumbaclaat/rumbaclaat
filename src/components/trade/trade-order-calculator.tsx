"use client";

import { useState } from "react";
import { submitTradeOrder } from "@/app/(site)/trade/portal/actions";

type Band = { band: string; ppb: number };

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
    <form action={submitTradeOrder} className="card-brand">
      <h2 className="h4 mb-3">Place a new order</h2>
      <div className="row g-3 mb-3">
        <div className="col-sm-6">
          <label className="form-label" htmlFor="t-product">Product *</label>
          <select id="t-product" name="productId" className="form-select" value={productId} onChange={(e) => setProductId(e.target.value)} required>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="col-sm-6">
          <label className="form-label" htmlFor="t-cases">Number of cases *</label>
          <input id="t-cases" name="cases" type="number" min={1} className="form-control" value={cases} onChange={(e) => setCases(e.target.value)} required />
        </div>
      </div>

      {n > 0 && (
        <div className="mb-3" style={{ background: "var(--bg-card2)", border: "1px solid var(--gold-bdr)", borderRadius: "var(--radius)", padding: 16 }} aria-live="polite">
          <div className="d-flex justify-content-between mb-2" style={{ fontSize: ".875rem" }}><span style={{ color: "var(--text-muted)" }}>Cases × 6 = Bottles</span><span>{bottles}</span></div>
          <div className="d-flex justify-content-between mb-2" style={{ fontSize: ".875rem" }}><span style={{ color: "var(--text-muted)" }}>Price per bottle</span><span>{money(ppb)}</span></div>
          <div className="d-flex justify-content-between mb-2" style={{ fontSize: ".875rem" }}><span style={{ color: "var(--text-muted)" }}>Net total</span><span>{money(net)}</span></div>
          <div className="d-flex justify-content-between mb-2" style={{ fontSize: ".875rem" }}><span style={{ color: "var(--text-muted)" }}>VAT (20%)</span><span>{money(vat)}</span></div>
          <hr style={{ borderColor: "var(--gold-bdr)" }} />
          <div className="d-flex justify-content-between" style={{ fontWeight: 600 }}><span>Grand total (inc VAT)</span><span className="serif gold" style={{ fontSize: "1.375rem" }}>{money(total)}</span></div>
        </div>
      )}

      <div className="mb-3"><label className="form-label" htmlFor="t-notes">Delivery notes</label><textarea id="t-notes" name="deliveryNotes" rows={2} className="form-control" /></div>
      <div className="mb-3"><label className="form-label" htmlFor="t-po">Purchase order reference</label><input id="t-po" name="poReference" className="form-control" placeholder="Your internal PO number (optional)" /></div>
      <button type="submit" className="btn btn-gold">Submit order request</button>
    </form>
  );
}
