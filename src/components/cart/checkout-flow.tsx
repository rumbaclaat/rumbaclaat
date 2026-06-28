"use client";

import Link from "next/link";
import { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useCart } from "@/components/cart/cart-provider";
import { createOrder, createPaypalOrder, capturePaypalOrder, type OrderInput } from "@/app/(site)/checkout/actions";

const PP_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";

type Settings = {
  freeShippingThreshold: number;
  shippingStandardCost: number;
  shippingExpressCost: number;
};

/** Saved details for a signed-in member, used to pre-fill the delivery form. */
export type CheckoutPrefill = {
  fname?: string; lname?: string; email?: string; phone?: string;
  addr1?: string; addr2?: string; city?: string; postcode?: string; country?: string;
};

const STEP_LABELS = ["Delivery", "Payment", "Confirm", "Complete"];

// --- Payment-method brand marks (decorative; the text label carries the a11y name) ---
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#fff", borderRadius: 4, padding: "2px 5px", height: 22 }}>
      {children}
    </span>
  );
}
const brandFont = "Arial, Helvetica, sans-serif";
function VisaMark() {
  return <Chip><span style={{ fontFamily: brandFont, fontWeight: 800, fontStyle: "italic", fontSize: ".72rem", color: "#1A1F71", letterSpacing: "-.02em", lineHeight: 1 }}>VISA</span></Chip>;
}
function MastercardMark() {
  return (
    <Chip>
      <svg width="24" height="15" viewBox="0 0 38 24" aria-hidden="true" focusable="false">
        <circle cx="15" cy="12" r="11" fill="#EB001B" />
        <circle cx="23" cy="12" r="11" fill="#F79E1B" />
        <path d="M19 3.5a11 11 0 000 17 11 11 0 000-17z" fill="#FF5F00" />
      </svg>
    </Chip>
  );
}
function PayPalMark() {
  return <Chip><span style={{ fontFamily: brandFont, fontWeight: 800, fontStyle: "italic", fontSize: ".72rem", lineHeight: 1 }}><span style={{ color: "#003087" }}>Pay</span><span style={{ color: "#009cde" }}>Pal</span></span></Chip>;
}
function GooglePayMark() {
  return (
    <Chip>
      <span style={{ fontFamily: brandFont, fontWeight: 600, fontSize: ".72rem", lineHeight: 1 }}>
        <span style={{ color: "#4285F4" }}>G</span><span style={{ color: "#EA4335" }}>o</span><span style={{ color: "#FBBC04" }}>o</span><span style={{ color: "#4285F4" }}>g</span><span style={{ color: "#34A853" }}>l</span><span style={{ color: "#EA4335" }}>e</span>
        <span style={{ color: "#5F6368", marginLeft: 3 }}>Pay</span>
      </span>
    </Chip>
  );
}
const PAY_METHODS = [
  { id: "card", label: "Card", logo: <><VisaMark /><MastercardMark /></> },
  { id: "paypal", label: "PayPal", logo: <PayPalMark /> },
  { id: "googlepay", label: "Google Pay", logo: <GooglePayMark /> },
];

export default function CheckoutFlow({ settings, initial }: { settings: Settings; initial?: CheckoutPrefill }) {
  const { items, subtotal, clear } = useCart();
  const [step, setStep] = useState(1);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ ref: string; total: number } | null>(null);

  const isMember = Boolean(initial?.email);
  const [form, setForm] = useState({
    fname: initial?.fname ?? "",
    lname: initial?.lname ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    addr1: initial?.addr1 ?? "",
    addr2: initial?.addr2 ?? "",
    city: initial?.city ?? "",
    postcode: initial?.postcode ?? "",
    country: initial?.country || "United Kingdom",
  });
  const [delivery, setDelivery] = useState<"standard" | "express">("standard");
  const [payment, setPayment] = useState("card");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const shipping =
    delivery === "express"
      ? settings.shippingExpressCost
      : subtotal >= settings.freeShippingThreshold
        ? 0
        : settings.shippingStandardCost;
  const total = subtotal + shipping;
  const money = (n: number) => `£${n.toFixed(2)}`;

  function go(n: number) { setError(""); setStep(n); }

  function submitDelivery(e: React.FormEvent) {
    e.preventDefault();
    const required: (keyof typeof form)[] = ["fname", "lname", "email", "addr1", "city", "postcode"];
    const missing = required.filter((k) => !form[k].trim());
    if (missing.length) { setError("Please complete all required fields."); return; }
    go(2);
  }

  const buildInput = (): OrderInput => ({
    items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, qty: i.qty })),
    email: form.email,
    name: `${form.fname} ${form.lname}`.trim(),
    phone: form.phone || undefined,
    address: { line1: form.addr1, line2: form.addr2 || undefined, city: form.city, postcode: form.postcode, country: form.country },
    deliveryMethod: delivery,
    paymentMethod: payment,
  });

  async function placeOrder() {
    setPlacing(true); setError("");
    try {
      const res = await createOrder(buildInput());
      setResult(res);
      clear();
      go(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPlacing(false);
    }
  }

  if (items.length === 0 && step < 4) {
    return (
      <div className="text-center" style={{ padding: "40px 0" }}>
        <p style={{ color: "var(--text-muted)" }}>Your cart is empty.</p>
        <Link href="/shop" className="btn btn-gold mt-2">Browse the shop →</Link>
      </div>
    );
  }

  return (
    <div className="container section" style={{ maxWidth: 1060 }}>
      {/* Step bar */}
      <ol className="step-bar list-unstyled" aria-label="Checkout progress">
        {STEP_LABELS.map((label, i) => {
          const n = i + 1;
          const state = n < step ? "done" : n === step ? "active" : "pending";
          return (
            <li className="step-node" key={label} style={{ display: "contents" }}>
              {i > 0 && <li className="step-connector" aria-hidden="true" />}
              <span className="step-node">
                <span className={`step-circle ${state}`}>{n < step ? "✓" : n}</span>
                <span className={`step-label ${n === step ? "gold" : "text-dim"}`}>{label}</span>
              </span>
            </li>
          );
        })}
      </ol>

      <div className="row g-4 mt-2">
        <div className="col-12 col-lg-8">
          {error && (
            <div role="alert" className="mb-3" style={{ background: "rgba(242,109,109,.12)", border: "1px solid rgba(242,109,109,.35)", color: "var(--red)", borderRadius: 8, padding: "8px 12px", fontSize: ".875rem" }}>{error}</div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <div className="card-brand">
              <h2 className="h3 mb-4">Delivery Details</h2>
              {isMember && (
                <p style={{ fontSize: ".8125rem", color: "var(--gold-hi)", background: "var(--bg-card2)", border: "1px solid var(--gold-bdr)", borderRadius: 8, padding: "8px 12px", marginBottom: 18 }}>
                  ✓ Signed in{form.email ? ` as ${form.email}` : ""} — we’ve pre-filled your saved details. Edit anything below before continuing.
                </p>
              )}
              <form onSubmit={submitDelivery} noValidate>
                <div className="row g-3">
                  <div className="col-sm-6"><label className="form-label">First name *</label><input className="form-control" value={form.fname} onChange={set("fname")} autoComplete="given-name" /></div>
                  <div className="col-sm-6"><label className="form-label">Last name *</label><input className="form-control" value={form.lname} onChange={set("lname")} autoComplete="family-name" /></div>
                  <div className="col-12"><label className="form-label">Email *</label><input type="email" className="form-control" value={form.email} onChange={set("email")} autoComplete="email" /></div>
                  <div className="col-12"><label className="form-label">Phone</label><input type="tel" className="form-control" value={form.phone} onChange={set("phone")} autoComplete="tel" /></div>
                  <div className="col-12"><label className="form-label">Address line 1 *</label><input className="form-control" value={form.addr1} onChange={set("addr1")} autoComplete="address-line1" /></div>
                  <div className="col-12"><label className="form-label">Address line 2</label><input className="form-control" value={form.addr2} onChange={set("addr2")} autoComplete="address-line2" /></div>
                  <div className="col-sm-6"><label className="form-label">City *</label><input className="form-control" value={form.city} onChange={set("city")} autoComplete="address-level2" /></div>
                  <div className="col-sm-6"><label className="form-label">Postcode *</label><input className="form-control" value={form.postcode} onChange={set("postcode")} autoComplete="postal-code" /></div>
                  <div className="col-12"><label className="form-label">Country *</label>
                    <select className="form-select" value={form.country} onChange={set("country")}>
                      <option>United Kingdom</option><option>United States</option><option>Germany</option><option>France</option><option>Jamaica</option>
                    </select>
                  </div>
                </div>
                <fieldset className="mt-3" style={{ border: "1px solid var(--gold-bdr)", borderRadius: "var(--radius)", padding: 16, background: "var(--bg-card2)" }}>
                  <legend className="form-label" style={{ fontSize: ".875rem", fontWeight: 600, float: "none", width: "auto" }}>Delivery method</legend>
                  <div className="form-check"><input className="form-check-input" type="radio" name="delivery" id="d-std" checked={delivery === "standard"} onChange={() => setDelivery("standard")} /><label className="form-check-label" htmlFor="d-std" style={{ fontSize: ".875rem" }}>Standard UK (3–5 days) — {money(settings.shippingStandardCost)} · FREE on {money(settings.freeShippingThreshold)}+</label></div>
                  <div className="form-check"><input className="form-check-input" type="radio" name="delivery" id="d-exp" checked={delivery === "express"} onChange={() => setDelivery("express")} /><label className="form-check-label" htmlFor="d-exp" style={{ fontSize: ".875rem" }}>Express UK (1–2 days) — {money(settings.shippingExpressCost)}</label></div>
                </fieldset>
                <button type="submit" className="btn btn-gold w-100 mt-4">Continue to Payment →</button>
              </form>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="card-brand">
              <h2 className="h3 mb-4">Payment</h2>
              <div className="row g-2 mb-3" role="radiogroup" aria-label="Payment method">
                {PAY_METHODS.map((m) => (
                  <div className="col-4" key={m.id}>
                    <input type="radio" className="btn-check" name="paymethod" id={`pm-${m.id}`} checked={payment === m.id} onChange={() => setPayment(m.id)} />
                    <label className="btn btn-outline-gold w-100 d-flex flex-column align-items-center justify-content-center gap-2 py-3" htmlFor={`pm-${m.id}`} style={{ minHeight: 72 }}>
                      <span className="d-flex align-items-center gap-1" aria-hidden="true">{m.logo}</span>
                      <span style={{ fontSize: ".75rem", fontWeight: 600 }}>{m.label}</span>
                    </label>
                  </div>
                ))}
              </div>
              {payment === "card" && (
                <div style={{ background: "var(--bg-card2)", border: "1px solid var(--gold-bdr)", borderRadius: "var(--radius)", padding: 20 }}>
                  <div className="mb-3"><label className="form-label">Card number</label><input className="form-control" placeholder="1234 5678 9012 3456" inputMode="numeric" /></div>
                  <div className="mb-3"><label className="form-label">Name on card</label><input className="form-control" /></div>
                  <div className="row g-3">
                    <div className="col-6"><label className="form-label">Expiry</label><input className="form-control" placeholder="MM/YY" /></div>
                    <div className="col-6"><label className="form-label">CVV</label><input className="form-control" type="password" inputMode="numeric" /></div>
                  </div>
                </div>
              )}
              <p style={{ fontSize: ".6875rem", color: "var(--text-dim)", margin: "16px 0" }}>🔒 No card data stored. Card &amp; Google Pay are simulated in this build — choose <strong style={{ color: "var(--gold-hi)" }}>PayPal</strong> for a live (sandbox) payment.</p>
              <button type="button" className="btn btn-gold w-100" onClick={() => go(3)}>Review order →</button>
              <button type="button" className="btn btn-outline-gold mt-3" onClick={() => go(1)}>← Back to Delivery</button>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="card-brand">
              <h2 className="h3 mb-4">Confirm Your Order</h2>
              <div style={{ background: "var(--bg-card2)", borderRadius: "var(--radius)", padding: 20, marginBottom: 20 }}>
                {items.map((i) => (
                  <div className="order-summary-item" key={i.key}><span>{i.name} ×{i.qty}</span><span>{money(i.price * i.qty)}</span></div>
                ))}
              </div>
              <div className="d-flex justify-content-between" style={{ fontWeight: 600, padding: "12px 0", borderTop: "1px solid var(--gold-bdr)" }}>
                <span>Total charged</span><span className="serif gold" style={{ fontSize: "1.375rem" }}>{money(total)}</span>
              </div>
              <p style={{ fontSize: ".75rem", color: "var(--text-dim)", margin: "8px 0 24px" }}>By placing this order you confirm you are 18 or over and agree to our <Link href="/terms">Terms</Link>. Age is verified on delivery.</p>
              {payment === "paypal" ? (
                PP_CLIENT_ID ? (
                  <PayPalScriptProvider options={{ clientId: PP_CLIENT_ID, currency: "GBP", intent: "capture" }}>
                    <PayPalButtons
                      style={{ layout: "vertical", color: "gold", shape: "pill", label: "paypal" }}
                      disabled={placing}
                      createOrder={async () => {
                        setError("");
                        const r = await createPaypalOrder(buildInput());
                        return r.id;
                      }}
                      onApprove={async (data) => {
                        setPlacing(true);
                        try {
                          const res = await capturePaypalOrder(String(data.orderID), buildInput());
                          setResult(res); clear(); go(4);
                        } catch (e) {
                          setError(e instanceof Error ? e.message : "Payment could not be completed.");
                        } finally {
                          setPlacing(false);
                        }
                      }}
                      onError={() => setError("PayPal could not process the payment. Please try again.")}
                    />
                  </PayPalScriptProvider>
                ) : (
                  <p style={{ color: "var(--yellow)", fontSize: ".85rem" }}>PayPal isn’t configured yet — choose another payment method.</p>
                )
              ) : (
                <button type="button" className="btn btn-gold btn-lg w-100" onClick={placeOrder} disabled={placing}>{placing ? "Placing order…" : "Place Order"}</button>
              )}
              <button type="button" className="btn btn-outline-gold mt-3" onClick={() => go(2)}>← Back to Payment</button>
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && result && (
            <div className="card-brand text-center" style={{ padding: "48px 24px" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(74,222,128,.12)", border: "1px solid rgba(74,222,128,.4)", margin: "0 auto 18px", display: "flex", alignItems: "center", justifyContent: "center" }} aria-hidden="true">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <p style={{ fontSize: ".6875rem", letterSpacing: ".3em", color: "var(--gold-hi)", marginBottom: 12 }}>PAYMENT SUCCESSFUL · ORDER CONFIRMED</p>
              <h2 className="mb-3" style={{ fontSize: "clamp(1.5rem,3vw,2.25rem)" }}>Thank you for your order</h2>
              <p style={{ maxWidth: 460, margin: "0 auto 8px" }}>Your order <strong className="gold">#{result.ref}</strong> has been placed.</p>
              <p style={{ maxWidth: 460, margin: "0 auto 28px", fontSize: ".9375rem", color: "var(--text-muted)" }}>We&apos;ve emailed a receipt to <strong style={{ color: "var(--text)" }}>{form.email}</strong>. Someone aged 18+ must sign for the parcel.</p>
              <div className="d-flex gap-2 justify-content-center flex-wrap">
                <Link href="/shop" className="btn btn-gold">Continue shopping</Link>
                <Link href="/" className="btn btn-outline-gold">Back to home</Link>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        {step < 4 && (
          <div className="col-12 col-lg-4">
            <div className="card-brand">
              <h2 className="h4 mb-3">Order Summary</h2>
              {items.map((i) => (
                <div className="order-summary-item" key={i.key}><span style={{ color: "var(--text-muted)" }}>{i.name} ×{i.qty}</span><span>{money(i.price * i.qty)}</span></div>
              ))}
              <div className="order-summary-item"><span style={{ color: "var(--text-muted)" }}>Subtotal</span><span>{money(subtotal)}</span></div>
              <div className="order-summary-item"><span style={{ color: "var(--text-muted)" }}>Shipping</span><span>{shipping === 0 ? "FREE" : money(shipping)}</span></div>
              <div className="order-summary-item" style={{ fontWeight: 600, border: "none", paddingTop: 14 }}><span>Total</span><span className="serif gold" style={{ fontSize: "1.375rem" }}>{money(total)}</span></div>
              <p style={{ fontSize: ".75rem", color: "var(--text-dim)", textAlign: "center", marginTop: 14 }}>🔒 Secure · 18+ verified on delivery</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
