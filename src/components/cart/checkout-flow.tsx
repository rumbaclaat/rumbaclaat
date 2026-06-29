"use client";

import Link from "next/link";
import { Fragment, useState } from "react";
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

// --- Shared champagne style tokens (inline, per prototype) ---
const labelStyle: React.CSSProperties = {
  display: "block",
  color: "var(--muted)",
  fontSize: ".78rem",
  marginBottom: 6,
};
const fieldStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--surface2)",
  border: "1px solid var(--line2)",
  color: "var(--text)",
  borderRadius: 10,
  padding: "12px 14px",
  fontSize: ".9rem",
  outline: "none",
  fontFamily: "var(--sans)",
};
const cardStyle: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--line2)",
  borderRadius: 18,
  padding: "30px 30px 32px",
};
const goldPill: React.CSSProperties = {
  background: "var(--gold)",
  color: "var(--onGold)",
  border: "none",
  borderRadius: 999,
  padding: "13px 30px",
  fontSize: ".92rem",
  fontWeight: 600,
  cursor: "pointer",
};
const goldPillFull: React.CSSProperties = { ...goldPill, width: "100%", textAlign: "center" };
const ghostPill: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 9,
  background: "transparent",
  border: "1px solid var(--gold)",
  color: "var(--goldHi)",
  borderRadius: 999,
  padding: "12px 24px",
  fontSize: ".9rem",
  fontWeight: 600,
  cursor: "pointer",
  textDecoration: "none",
};
const eyebrowStyle: React.CSSProperties = {
  fontSize: ".74rem",
  letterSpacing: ".24em",
  textTransform: "uppercase",
  color: "var(--gold)",
  fontWeight: 600,
};
const panelStyle: React.CSSProperties = {
  background: "var(--surface2)",
  border: "1px solid var(--line2)",
  borderRadius: 14,
  padding: 20,
};
const sectionHeading: React.CSSProperties = {
  fontFamily: "var(--serif)",
  fontWeight: 600,
  fontSize: "clamp(1.5rem,3vw,1.9rem)",
  color: "var(--text)",
  margin: "0 0 22px",
};
const rowItem: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  fontSize: ".9rem",
  padding: "7px 0",
  color: "var(--text)",
};

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
  // Snapshot of the order lines/totals taken before the cart is cleared, for the success recap.
  const [recap, setRecap] = useState<{ lines: { name: string; qty: number; lineTotal: number }[]; subtotal: number; shipping: number; total: number } | null>(null);
  const snapshotRecap = () => setRecap({
    lines: items.map((i) => ({ name: i.name, qty: i.qty, lineTotal: i.price * i.qty })),
    subtotal,
    shipping,
    total,
  });

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
      snapshotRecap();
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
      <section style={{ padding: "clamp(48px,7vw,84px) clamp(20px,5vw,40px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          <p style={{ color: "var(--muted)", fontSize: "1.02rem", margin: "0 0 18px" }}>Your cart is empty.</p>
          <Link href="/shop" style={{ ...ghostPill, justifyContent: "center" }}>
            Browse the shop <i className="bi bi-arrow-right" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section
      style={{
        position: "relative",
        padding: "clamp(40px,5vw,64px) clamp(20px,5vw,40px) clamp(72px,9vw,110px)",
        overflow: "hidden",
        borderBottom: "1px solid var(--line2)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(80% 70% at 50% 0%, rgba(205,181,130,.1), transparent 60%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto" }}>
        <span style={eyebrowStyle}>Secure Checkout</span>

        {/* Step bar */}
        <ol
          aria-label="Checkout progress"
          style={{
            display: "flex",
            alignItems: "center",
            listStyle: "none",
            padding: 0,
            margin: "20px 0 32px",
            gap: 0,
            flexWrap: "wrap",
          }}
        >
          {STEP_LABELS.map((label, i) => {
            const n = i + 1;
            const done = n < step;
            const active = n === step;
            const circleBg = active ? "var(--gold)" : done ? "var(--goldLt)" : "var(--surface2)";
            const circleColor = active ? "var(--onGold)" : done ? "var(--goldHi)" : "var(--dim)";
            const circleBorder = active ? "var(--gold)" : done ? "var(--gold)" : "var(--line2)";
            const labelColor = active ? "var(--goldHi)" : done ? "var(--muted)" : "var(--dim)";
            return (
              <Fragment key={label}>
                {i > 0 && (
                  <li
                    aria-hidden="true"
                    style={{
                      flex: 1,
                      minWidth: 24,
                      height: 1,
                      background: done || active ? "var(--gold)" : "var(--line2)",
                      margin: "0 8px",
                    }}
                  />
                )}
                <li style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
                  <span
                    aria-current={active ? "step" : undefined}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      flex: "0 0 30px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: circleBg,
                      border: `1px solid ${circleBorder}`,
                      color: circleColor,
                      fontFamily: "var(--serif)",
                      fontWeight: 600,
                      fontSize: ".95rem",
                    }}
                  >
                    {done ? <i className="bi bi-check-lg" /> : n}
                  </span>
                  <span style={{ fontSize: ".82rem", fontWeight: 600, color: labelColor }}>{label}</span>
                </li>
              </Fragment>
            );
          })}
        </ol>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: step < 4 ? "minmax(0,1.7fr) minmax(0,1fr)" : "minmax(0,1fr)",
            gap: 20,
            alignItems: "start",
          }}
        >
          <div>
            {error && (
              <div
                role="alert"
                style={{
                  background: "rgba(242,109,109,.12)",
                  border: "1px solid rgba(242,109,109,.35)",
                  color: "var(--red)",
                  borderRadius: 10,
                  padding: "12px 14px",
                  fontSize: ".85rem",
                  marginBottom: 16,
                }}
              >
                {error}
              </div>
            )}

            {/* Step 1 — Delivery */}
            {step === 1 && (
              <div style={cardStyle}>
                <h2 style={sectionHeading}>Delivery Details</h2>
                {isMember && (
                  <p
                    style={{
                      fontSize: ".84rem",
                      color: "var(--goldHi)",
                      background: "var(--goldLt)",
                      border: "1px solid var(--line)",
                      borderRadius: 10,
                      padding: "10px 14px",
                      margin: "0 0 18px",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                    }}
                  >
                    <i className="bi bi-check-circle-fill" style={{ marginTop: 2 }} />
                    <span>
                      Signed in{form.email ? ` as ${form.email}` : ""} — we&apos;ve pre-filled your saved details. Edit
                      anything below before continuing.
                    </span>
                  </p>
                )}
                <form onSubmit={submitDelivery} noValidate>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                    <div>
                      <label htmlFor="co-fname" style={labelStyle}>First name *</label>
                      <input id="co-fname" style={fieldStyle} value={form.fname} onChange={set("fname")} autoComplete="given-name" />
                    </div>
                    <div>
                      <label htmlFor="co-lname" style={labelStyle}>Last name *</label>
                      <input id="co-lname" style={fieldStyle} value={form.lname} onChange={set("lname")} autoComplete="family-name" />
                    </div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label htmlFor="co-email" style={labelStyle}>Email *</label>
                    <input id="co-email" type="email" style={fieldStyle} value={form.email} onChange={set("email")} autoComplete="email" />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label htmlFor="co-phone" style={labelStyle}>Phone</label>
                    <input id="co-phone" type="tel" style={fieldStyle} value={form.phone} onChange={set("phone")} autoComplete="tel" />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label htmlFor="co-addr1" style={labelStyle}>Address line 1 *</label>
                    <input id="co-addr1" style={fieldStyle} value={form.addr1} onChange={set("addr1")} autoComplete="address-line1" />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label htmlFor="co-addr2" style={labelStyle}>Address line 2</label>
                    <input id="co-addr2" style={fieldStyle} value={form.addr2} onChange={set("addr2")} autoComplete="address-line2" />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                    <div>
                      <label htmlFor="co-city" style={labelStyle}>City *</label>
                      <input id="co-city" style={fieldStyle} value={form.city} onChange={set("city")} autoComplete="address-level2" />
                    </div>
                    <div>
                      <label htmlFor="co-postcode" style={labelStyle}>Postcode *</label>
                      <input id="co-postcode" style={fieldStyle} value={form.postcode} onChange={set("postcode")} autoComplete="postal-code" />
                    </div>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label htmlFor="co-country" style={labelStyle}>Country *</label>
                    <select id="co-country" style={{ ...fieldStyle, cursor: "pointer", appearance: "none" }} value={form.country} onChange={set("country")}>
                      <option>United Kingdom</option><option>United States</option><option>Germany</option><option>France</option><option>Jamaica</option>
                    </select>
                  </div>

                  <fieldset style={{ ...panelStyle, marginBottom: 22, border: "1px solid var(--line2)" }}>
                    <legend style={{ ...labelStyle, color: "var(--text)", fontWeight: 600, fontSize: ".88rem", padding: 0, marginBottom: 12, float: "none", width: "auto" }}>
                      Delivery method
                    </legend>
                    <label
                      htmlFor="d-std"
                      style={{ display: "flex", alignItems: "center", gap: 10, fontSize: ".88rem", color: "var(--muted)", cursor: "pointer", marginBottom: 10 }}
                    >
                      <input type="radio" name="delivery" id="d-std" checked={delivery === "standard"} onChange={() => setDelivery("standard")} style={{ accentColor: "var(--gold)" }} />
                      <span>Standard UK (3–5 days) — {money(settings.shippingStandardCost)} · FREE on {money(settings.freeShippingThreshold)}+</span>
                    </label>
                    <label
                      htmlFor="d-exp"
                      style={{ display: "flex", alignItems: "center", gap: 10, fontSize: ".88rem", color: "var(--muted)", cursor: "pointer" }}
                    >
                      <input type="radio" name="delivery" id="d-exp" checked={delivery === "express"} onChange={() => setDelivery("express")} style={{ accentColor: "var(--gold)" }} />
                      <span>Express UK (1–2 days) — {money(settings.shippingExpressCost)}</span>
                    </label>
                  </fieldset>

                  <button type="submit" style={{ ...goldPillFull, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    Continue to Payment <i className="bi bi-arrow-right" />
                  </button>
                </form>
              </div>
            )}

            {/* Step 2 — Payment */}
            {step === 2 && (
              <div style={cardStyle}>
                <h2 style={sectionHeading}>Payment</h2>
                <div role="radiogroup" aria-label="Payment method" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
                  {PAY_METHODS.map((m) => {
                    const on = payment === m.id;
                    return (
                      <label
                        key={m.id}
                        htmlFor={`pm-${m.id}`}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                          minHeight: 78,
                          padding: "14px 8px",
                          borderRadius: 14,
                          cursor: "pointer",
                          background: on ? "var(--goldLt)" : "var(--surface2)",
                          border: `1px solid ${on ? "var(--gold)" : "var(--line2)"}`,
                          color: on ? "var(--goldHi)" : "var(--muted)",
                        }}
                      >
                        <input type="radio" name="paymethod" id={`pm-${m.id}`} checked={on} onChange={() => setPayment(m.id)} style={{ position: "absolute", opacity: 0, width: 0, height: 0 }} />
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }} aria-hidden="true">{m.logo}</span>
                        <span style={{ fontSize: ".78rem", fontWeight: 600 }}>{m.label}</span>
                      </label>
                    );
                  })}
                </div>

                {payment === "card" && (
                  <div style={panelStyle}>
                    <div style={{ marginBottom: 16 }}>
                      <label htmlFor="cc-num" style={labelStyle}>Card number</label>
                      <input id="cc-num" style={fieldStyle} placeholder="1234 5678 9012 3456" inputMode="numeric" />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <label htmlFor="cc-name" style={labelStyle}>Name on card</label>
                      <input id="cc-name" style={fieldStyle} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div>
                        <label htmlFor="cc-exp" style={labelStyle}>Expiry</label>
                        <input id="cc-exp" style={fieldStyle} placeholder="MM/YY" />
                      </div>
                      <div>
                        <label htmlFor="cc-cvv" style={labelStyle}>CVV</label>
                        <input id="cc-cvv" style={fieldStyle} type="password" inputMode="numeric" />
                      </div>
                    </div>
                    <p style={{ fontSize: ".74rem", color: "var(--dim)", lineHeight: 1.5, margin: "16px 0 0" }}>
                      <i className="bi bi-lock-fill" /> 256-bit SSL · No card data stored · Card &amp; Google Pay are
                      simulated in this build — choose <strong style={{ color: "var(--goldHi)" }}>PayPal</strong> for a
                      live (sandbox) payment.
                    </p>
                  </div>
                )}

                {payment === "paypal" && (
                  <div style={{ ...panelStyle, textAlign: "center", padding: 28 }}>
                    <h3 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "1.3rem", color: "var(--text)", margin: "0 0 8px" }}>Continue with PayPal</h3>
                    <p style={{ fontSize: ".9rem", color: "var(--muted)", lineHeight: 1.6, margin: "0 0 22px" }}>
                      You&apos;ll be redirected to PayPal to authorise payment of <strong style={{ color: "var(--text)" }}>{money(total)}</strong>.
                    </p>
                    <button type="button" style={{ ...goldPillFull, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }} onClick={() => go(3)}>
                      Continue to PayPal <i className="bi bi-arrow-right" />
                    </button>
                  </div>
                )}

                {payment === "googlepay" && (
                  <div style={{ ...panelStyle, textAlign: "center", padding: 28 }}>
                    <h3 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "1.3rem", color: "var(--text)", margin: "0 0 8px" }}>Pay with Google Pay</h3>
                    <p style={{ fontSize: ".9rem", color: "var(--muted)", lineHeight: 1.6, margin: "0 0 22px" }}>
                      Confirm payment of <strong style={{ color: "var(--text)" }}>{money(total)}</strong> using your saved Google Pay method.
                    </p>
                    <button type="button" style={goldPillFull} onClick={() => go(3)}>Pay with Google Pay</button>
                  </div>
                )}

                {payment === "card" && (
                  <button type="button" style={{ ...goldPillFull, marginTop: 16, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }} onClick={() => go(3)}>
                    Review order <i className="bi bi-arrow-right" />
                  </button>
                )}
                <button type="button" style={{ ...ghostPill, marginTop: 16 }} onClick={() => go(1)}>
                  <i className="bi bi-arrow-left" /> Back to Delivery
                </button>
              </div>
            )}

            {/* Step 3 — Confirm */}
            {step === 3 && (
              <div style={cardStyle}>
                <h2 style={sectionHeading}>Confirm Your Order</h2>
                <div style={{ ...panelStyle, marginBottom: 20 }}>
                  <p style={{ ...eyebrowStyle, fontSize: ".7rem", margin: "0 0 12px" }}>Items</p>
                  {items.map((i) => (
                    <div style={rowItem} key={i.key}>
                      <span style={{ color: "var(--muted)" }}>{i.name} ×{i.qty}</span>
                      <span>{money(i.price * i.qty)}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 600, padding: "12px 0", borderTop: "1px solid var(--line2)" }}>
                  <span style={{ color: "var(--text)" }}>Total charged</span>
                  <span style={{ fontFamily: "var(--serif)", color: "var(--goldHi)", fontSize: "1.5rem" }}>{money(total)}</span>
                </div>
                <p style={{ fontSize: ".78rem", color: "var(--dim)", lineHeight: 1.5, margin: "8px 0 24px" }}>
                  By placing this order you confirm you are 18 or over and agree to our{" "}
                  <Link href="/terms" style={{ color: "var(--goldHi)" }}>Terms &amp; Conditions</Link>. Age is verified
                  on delivery. Standard 14-day returns apply.
                </p>
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
                            setResult(res); snapshotRecap(); clear(); go(4);
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
                    <p style={{ color: "var(--yellow)", fontSize: ".85rem" }}>PayPal isn&apos;t configured yet — choose another payment method.</p>
                  )
                ) : (
                  <button type="button" style={{ ...goldPillFull, padding: "15px 30px", fontSize: "1rem" }} onClick={placeOrder} disabled={placing}>
                    {placing ? "Placing order…" : "Place Order"}
                  </button>
                )}
                <button type="button" style={{ ...ghostPill, marginTop: 16 }} onClick={() => go(2)}>
                  <i className="bi bi-arrow-left" /> Back to Payment
                </button>
              </div>
            )}

            {/* Step 4 — Complete */}
            {step === 4 && result && (
              <div style={{ ...cardStyle, textAlign: "center", padding: "48px 30px" }}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: "rgba(111,207,151,.12)",
                    border: "1px solid rgba(111,207,151,.4)",
                    margin: "0 auto 18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--green)",
                    fontSize: "1.9rem",
                  }}
                  aria-hidden="true"
                >
                  <i className="bi bi-check-lg" />
                </div>
                <p style={{ ...eyebrowStyle, color: "var(--goldHi)", margin: "0 0 12px" }}>Payment Successful · Order Confirmed</p>
                <h2 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "clamp(1.6rem,3.4vw,2.4rem)", color: "var(--text)", margin: "0 0 12px" }}>
                  Thank you for your order
                </h2>
                <p style={{ maxWidth: 460, margin: "0 auto 8px", color: "var(--muted)", fontSize: ".96rem" }}>
                  Your order <strong style={{ color: "var(--goldHi)", fontFamily: "var(--serif)" }}>#{result.ref}</strong> has been placed.
                </p>
                <p style={{ maxWidth: 460, margin: "0 auto 28px", fontSize: ".92rem", color: "var(--muted)", lineHeight: 1.6 }}>
                  We&apos;ve emailed a receipt to <strong style={{ color: "var(--text)" }}>{form.email}</strong>. Standard
                  UK delivery — expect dispatch within 1 working day, then 3–5 working days to arrive. Someone aged 18+
                  must sign for the parcel.
                </p>

                {/* Compact order recap */}
                {recap && recap.lines.length > 0 && (
                  <div style={{ ...panelStyle, textAlign: "left", maxWidth: 460, margin: "0 auto" }}>
                    <div style={{ ...eyebrowStyle, fontSize: ".7rem", marginBottom: 12 }}>Order Summary</div>
                    {recap.lines.map((l, idx) => (
                      <div style={rowItem} key={idx}>
                        <span style={{ color: "var(--muted)" }}>{l.qty} × {l.name}</span>
                        <span>{money(l.lineTotal)}</span>
                      </div>
                    ))}
                    <div style={rowItem}><span style={{ color: "var(--muted)" }}>Subtotal</span><span>{money(recap.subtotal)}</span></div>
                    <div style={rowItem}><span style={{ color: "var(--muted)" }}>Shipping</span><span>{recap.shipping === 0 ? "FREE" : money(recap.shipping)}</span></div>
                    <div style={{ ...rowItem, fontWeight: 600, borderTop: "1px solid var(--line2)", marginTop: 6, paddingTop: 14 }}>
                      <span style={{ color: "var(--text)" }}>Total paid</span>
                      <span style={{ fontFamily: "var(--serif)", color: "var(--goldHi)", fontSize: "1.5rem" }}>{money(recap.total)}</span>
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 26 }}>
                  <Link href="/order" style={{ ...goldPill, display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
                    View order details <i className="bi bi-arrow-right" />
                  </Link>
                  <Link href="/" style={{ ...ghostPill }}>Back to home</Link>
                  <Link href="/account" style={{ color: "var(--goldHi)", fontSize: ".9rem", fontWeight: 600, textDecoration: "none", alignSelf: "center" }}>My account</Link>
                </div>
              </div>
            )}
          </div>

          {/* Summary sidebar */}
          {step < 4 && (
            <aside style={cardStyle}>
              <h2 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "1.3rem", color: "var(--text)", margin: "0 0 18px" }}>Order Summary</h2>
              {items.map((i) => (
                <div style={rowItem} key={i.key}>
                  <span style={{ color: "var(--muted)" }}>{i.name} ×{i.qty}</span>
                  <span>{money(i.price * i.qty)}</span>
                </div>
              ))}
              <hr style={{ border: "none", borderTop: "1px solid var(--line2)", margin: "14px 0" }} />
              <div style={rowItem}><span style={{ color: "var(--muted)" }}>Subtotal</span><span>{money(subtotal)}</span></div>
              <div style={rowItem}><span style={{ color: "var(--muted)" }}>Shipping</span><span>{shipping === 0 ? "FREE" : money(shipping)}</span></div>
              <div style={{ ...rowItem, fontWeight: 600, borderTop: "1px solid var(--line2)", marginTop: 6, paddingTop: 14 }}>
                <span style={{ color: "var(--text)" }}>Total</span>
                <span style={{ fontFamily: "var(--serif)", color: "var(--goldHi)", fontSize: "1.5rem" }}>{money(total)}</span>
              </div>
              <p style={{ fontSize: ".76rem", color: "var(--dim)", textAlign: "center", marginTop: 16 }}>
                <i className="bi bi-lock-fill" /> Secure · 18+ verified on delivery
              </p>
            </aside>
          )}
        </div>
      </div>
    </section>
  );
}
