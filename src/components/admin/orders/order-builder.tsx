"use client";

import { useMemo, useState } from "react";
import FormSection from "@/components/admin/ui/form-section";
import SaveBar from "@/components/admin/ui/save-bar";

type Cust = { id: string; name: string; email: string };
type Prod = { id: string; name: string; price: number };
type Line = { key: string; productId: string; name: string; unitPrice: number; qty: number };

export default function OrderBuilder({
  action,
  customers,
  products,
  initial,
}: {
  action: (fd: FormData) => void | Promise<void>;
  customers: Cust[];
  products: Prod[];
  initial?: { email: string; customerName: string | null; customerId: string | null; lines: { productId: string | null; name: string; unitPrice: number; qty: number }[] } | null;
}) {
  const [customerId, setCustomerId] = useState(initial?.customerId ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [name, setName] = useState(initial?.customerName ?? "");
  const keyRef = useState(() => ({ n: 0 }))[0];
  const [lines, setLines] = useState<Line[]>(
    () => (initial?.lines ?? []).map((l) => ({ key: `l${keyRef.n++}`, productId: l.productId ?? "", name: l.name, unitPrice: l.unitPrice, qty: l.qty }))
  );
  const [addId, setAddId] = useState("");

  function onPickCustomer(id: string) {
    setCustomerId(id);
    const c = customers.find((x) => x.id === id);
    if (c) { setEmail(c.email); setName(c.name); }
  }
  function addLine() {
    const p = products.find((x) => x.id === addId);
    if (!p) return;
    setLines((prev) => [...prev, { key: `l${keyRef.n++}`, productId: p.id, name: p.name, unitPrice: p.price, qty: 1 }]);
    setAddId("");
  }
  function setQty(key: string, qty: number) {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, qty: Math.max(1, qty) } : l)));
  }
  function remove(key: string) {
    setLines((prev) => prev.filter((l) => l.key !== key));
  }

  const subtotal = useMemo(() => lines.reduce((a, l) => a + l.unitPrice * l.qty, 0), [lines]);
  const shipping = subtotal >= 50 ? 0 : 4.99;

  return (
    <form action={action}>
      <input type="hidden" name="customerId" value={customerId} />
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="customerName" value={name} />
      <input type="hidden" name="lines" value={JSON.stringify(lines.map(({ productId, name, unitPrice, qty }) => ({ productId, name, unitPrice, qty })))} />

      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <FormSection title="Items">
            <div className="col-12 d-flex gap-2 align-items-end">
              <div className="flex-grow-1">
                <label className="form-label" htmlFor="addprod">Add product</label>
                <select id="addprod" className="form-select" value={addId} onChange={(e) => setAddId(e.target.value)}>
                  <option value="">Choose a product…</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name} — £{p.price.toFixed(2)}</option>)}
                </select>
              </div>
              <button type="button" className="btn btn-outline-gold" onClick={addLine} disabled={!addId}>Add</button>
            </div>
            <div className="col-12">
              {lines.length === 0 ? (
                <p className="td-muted">No items yet.</p>
              ) : (
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead><tr><th>Item</th><th>Unit</th><th>Qty</th><th className="td-num">Line</th><th></th></tr></thead>
                    <tbody>
                      {lines.map((l) => (
                        <tr key={l.key}>
                          <td>{l.name}</td>
                          <td>£{l.unitPrice.toFixed(2)}</td>
                          <td style={{ width: 90 }}>
                            <input type="number" min={1} className="form-control form-control-sm" value={l.qty} onChange={(e) => setQty(l.key, parseInt(e.target.value, 10) || 1)} />
                          </td>
                          <td className="td-num">£{(l.unitPrice * l.qty).toFixed(2)}</td>
                          <td><button type="button" className="btn btn-ghost btn-sm text-danger" onClick={() => remove(l.key)} aria-label="Remove"><i className="bi bi-trash" /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </FormSection>
        </div>

        <div className="col-12 col-lg-4">
          <FormSection title="Customer">
            <div className="col-12">
              <label className="form-label" htmlFor="cust">Existing customer</label>
              <select id="cust" className="form-select" value={customerId} onChange={(e) => onPickCustomer(e.target.value)}>
                <option value="">Guest / manual</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
              </select>
            </div>
            <div className="col-12">
              <label className="form-label" htmlFor="em">Email</label>
              <input id="em" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="col-12">
              <label className="form-label" htmlFor="nm">Name</label>
              <input id="nm" className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </FormSection>
          <FormSection title="Summary" grid={false}>
            <div className="order-summary-item"><span className="td-muted">Subtotal</span><span>£{subtotal.toFixed(2)}</span></div>
            <div className="order-summary-item"><span className="td-muted">Shipping</span><span>£{shipping.toFixed(2)}</span></div>
            <div className="order-summary-item" style={{ fontWeight: 600 }}><span>Total</span><span className="gold">£{(subtotal + shipping).toFixed(2)}</span></div>
          </FormSection>
        </div>
      </div>

      <SaveBar submitLabel="Create order" cancelHref="/admin/orders" />
    </form>
  );
}
