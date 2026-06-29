"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart/cart-provider";

export default function CartView({
  freeShippingThreshold,
  shippingStandardCost,
  pointsBalance,
  pointsPerPound,
  signedIn,
}: {
  freeShippingThreshold: number;
  shippingStandardCost: number;
  pointsBalance: number;
  pointsPerPound: number;
  signedIn: boolean;
}) {
  const { items, subtotal, setQty, remove, loaded } = useCart();
  const [pointsToRedeem, setPointsToRedeem] = useState(0);

  const money = (n: number) => `£${n.toFixed(2)}`;

  const eyebrow: React.CSSProperties = {
    fontSize: ".74rem",
    letterSpacing: ".24em",
    textTransform: "uppercase",
    color: "var(--gold)",
    fontWeight: 600,
  };

  const goldPill: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "var(--gold)",
    color: "var(--onGold)",
    border: "none",
    borderRadius: 999,
    padding: "13px 30px",
    fontSize: ".92rem",
    fontWeight: 600,
    textDecoration: "none",
    cursor: "pointer",
  };

  // ---- Cart hero (shared across all rebuilt pages) ----
  const Hero = (
    <section
      style={{
        position: "relative",
        padding: "clamp(44px,6vw,72px) clamp(20px,5vw,40px) clamp(28px,4vw,40px)",
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
        <div style={{ fontSize: ".78rem", color: "var(--dim)", marginBottom: 12 }}>
          <Link href="/" style={{ color: "var(--dim)" }}>Home</Link>{" "}
          <span style={{ opacity: 0.5 }}>/</span>{" "}
          <span style={{ color: "var(--muted)" }}>Cart</span>
        </div>
        <span style={eyebrow}>Your order</span>
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "clamp(2.2rem,5vw,3.4rem)", lineHeight: 1.05, margin: "12px 0 0" }}>
          Your cart
        </h1>
      </div>
    </section>
  );

  if (loaded && items.length === 0) {
    return (
      <div data-screen-label="Cart — empty">
        {Hero}
        <section style={{ padding: "clamp(40px,6vw,72px) clamp(20px,5vw,40px) clamp(72px,9vw,110px)" }}>
          <div
            style={{
              maxWidth: 560,
              margin: "0 auto",
              textAlign: "center",
              background: "var(--surface)",
              border: "1px solid var(--line2)",
              borderRadius: 18,
              padding: "clamp(40px,6vw,56px) 30px",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                margin: "0 auto",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--gold-lt)",
                color: "var(--gold)",
                fontSize: "1.6rem",
              }}
              aria-hidden="true"
            >
              <i className="bi bi-bag" />
            </div>
            <h2 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "clamp(1.6rem,3.2vw,2.1rem)", margin: "20px 0 0" }}>
              Your cart is empty
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "1rem", lineHeight: 1.6, margin: "12px 0 0" }}>
              Add some rum or apparel to get started.
            </p>
            <div style={{ marginTop: 26 }}>
              <Link href="/shop" style={goldPill}>
                Browse the collection <i className="bi bi-arrow-right" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const shipping = subtotal >= freeShippingThreshold ? 0 : shippingStandardCost;

  // Points redemption: pointsPerPound points = £1.00 off. Cap redeemable
  // points at the member's balance and at what the order is worth.
  const perPound = pointsPerPound > 0 ? pointsPerPound : 100;
  const maxRedeemable = Math.min(pointsBalance, Math.floor(subtotal * perPound));
  const sliderStep = perPound; // one whole pound increment
  const discount = pointsToRedeem / perPound;
  const showPointsPanel = signedIn && pointsBalance > 0;
  const total = Math.max(0, subtotal + shipping - discount);

  const summaryRow: React.CSSProperties = {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 14,
    fontSize: ".92rem",
  };

  return (
    <div data-screen-label="Cart">
      {Hero}

      <section style={{ padding: "clamp(32px,5vw,52px) clamp(20px,5vw,40px) clamp(72px,9vw,110px)" }}>
        <div
          className="cart-grid"
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 360px",
            gap: "clamp(24px,4vw,40px)",
            alignItems: "start",
          }}
        >
          {/* Items list */}
          <div>
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--line2)",
                borderRadius: 18,
                padding: "8px 24px",
              }}
            >
              {items.map((item, i) => (
                <div
                  key={item.key}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "84px 1fr auto",
                    gap: 18,
                    alignItems: "center",
                    padding: "22px 0",
                    borderTop: i === 0 ? "none" : "1px solid var(--line2)",
                  }}
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      style={{ width: 84, height: 84, borderRadius: 12, objectFit: "cover", border: "1px solid var(--line)" }}
                    />
                  ) : (
                    <div style={{ width: 84, height: 84, borderRadius: 12, background: "var(--card)", border: "1px solid var(--line)" }} />
                  )}
                  <div>
                    <p style={{ fontFamily: "var(--serif)", fontSize: "1.15rem", fontWeight: 600, color: "var(--text)", margin: 0 }}>{item.name}</p>
                    <p style={{ fontSize: ".82rem", color: "var(--dim)", margin: "4px 0 0" }}>{money(item.price)} each</p>
                    <div
                      style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 12, border: "1px solid var(--line2)", borderRadius: 999, padding: 3, background: "var(--surface2)" }}
                      role="group"
                      aria-label={`Quantity for ${item.name}`}
                    >
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${item.name}`}
                        onClick={() => setQty(item.key, item.qty - 1)}
                        style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: "transparent", color: "var(--muted)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: ".9rem" }}
                      >
                        <i className="bi bi-dash-lg" />
                      </button>
                      <span style={{ minWidth: 24, textAlign: "center", color: "var(--text)", fontSize: ".9rem" }} aria-live="polite">{item.qty}</span>
                      <button
                        type="button"
                        aria-label={`Increase quantity of ${item.name}`}
                        onClick={() => setQty(item.key, item.qty + 1)}
                        style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: "transparent", color: "var(--muted)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: ".9rem" }}
                      >
                        <i className="bi bi-plus-lg" />
                      </button>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontFamily: "var(--serif)", fontSize: "1.2rem", fontWeight: 600, color: "var(--goldHi)", margin: 0 }}>{money(item.price * item.qty)}</p>
                    <button
                      type="button"
                      onClick={() => remove(item.key)}
                      aria-label={`Remove ${item.name} from cart`}
                      style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: ".78rem", color: "var(--dim)", background: "none", border: "none", cursor: "pointer", marginTop: 10, padding: 0 }}
                    >
                      <i className="bi bi-trash3" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 22 }}>
              <Link
                href="/shop"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--goldHi)", textDecoration: "none", fontSize: ".9rem", fontWeight: 600 }}
              >
                <i className="bi bi-arrow-left" /> Continue shopping
              </Link>
            </div>
          </div>

          {/* Order summary column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {showPointsPanel && (
              <div
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--gold-md)",
                  borderRadius: 16,
                  padding: "24px 24px 26px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                  <span style={eyebrow}>Loyalty points</span>
                  <span
                    style={{
                      fontSize: ".74rem",
                      fontWeight: 600,
                      letterSpacing: ".06em",
                      color: "var(--goldHi)",
                      background: "var(--gold-lt)",
                      border: "1px solid var(--gold-bdr)",
                      borderRadius: 999,
                      padding: "4px 11px",
                    }}
                  >
                    {pointsBalance.toLocaleString("en-GB")} pts
                  </span>
                </div>
                <p style={{ fontSize: ".86rem", color: "var(--muted)", lineHeight: 1.55, margin: "8px 0 16px" }}>
                  Redeem points for a discount on this order. {perPound.toLocaleString("en-GB")} pts = £1.00 off.
                </p>
                <label htmlFor="pts-slider" style={{ display: "block", color: "var(--muted)", fontSize: ".78rem", marginBottom: 8 }}>
                  Points to redeem
                </label>
                <input
                  type="range"
                  id="pts-slider"
                  min={0}
                  max={maxRedeemable}
                  step={sliderStep}
                  value={Math.min(pointsToRedeem, maxRedeemable)}
                  onChange={(e) => setPointsToRedeem(parseInt(e.target.value, 10) || 0)}
                  style={{ width: "100%", accentColor: "var(--gold)" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".82rem", marginTop: 8 }}>
                  <span style={{ color: "var(--muted)" }}>
                    Redeeming: <span id="pts-redeeming">{Math.min(pointsToRedeem, maxRedeemable)}</span> pts
                  </span>
                  <span style={{ color: "var(--green)" }}>
                    Saving: <span id="pts-saving">{money(discount)}</span>
                  </span>
                </div>
              </div>
            )}

            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--line2)",
                borderRadius: 18,
                padding: "26px 26px 28px",
              }}
            >
              <span style={eyebrow}>Summary</span>
              <h2 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "1.5rem", margin: "10px 0 20px" }}>Order summary</h2>

              <div style={summaryRow}>
                <span style={{ color: "var(--muted)" }}>Subtotal</span>
                <span id="subtotal" style={{ color: "var(--text)" }}>{money(subtotal)}</span>
              </div>
              <div style={summaryRow}>
                <span style={{ color: "var(--muted)" }}>Shipping</span>
                <span id="shipping" style={{ color: shipping === 0 ? "var(--green)" : "var(--text)" }}>
                  {shipping === 0 ? "FREE" : money(shipping)}
                </span>
              </div>
              {discount > 0 && (
                <div style={summaryRow} id="discount-row">
                  <span style={{ color: "var(--green)" }}>Points discount</span>
                  <span id="discount-val" style={{ color: "var(--green)" }}>-{money(discount)}</span>
                </div>
              )}

              <div style={{ height: 1, background: "var(--line2)", margin: "18px 0" }} />

              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
                <span style={{ fontWeight: 600, color: "var(--text)" }}>Total</span>
                <span id="cart-total" style={{ fontFamily: "var(--serif)", fontSize: "1.7rem", fontWeight: 600, color: "var(--goldHi)" }}>{money(total)}</span>
              </div>

              {subtotal < freeShippingThreshold && (
                <p style={{ fontSize: ".78rem", color: "var(--dim)", lineHeight: 1.5, margin: "10px 0 0" }}>
                  Add {money(freeShippingThreshold - subtotal)} more for free UK shipping.
                </p>
              )}

              <Link href="/checkout" style={{ ...goldPill, width: "100%", justifyContent: "center", marginTop: 22 }}>
                Proceed to checkout <i className="bi bi-arrow-right" />
              </Link>
              <p style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: ".76rem", color: "var(--dim)", lineHeight: 1.5, textAlign: "center", margin: "16px 0 0" }}>
                <i className="bi bi-shield-lock" /> Secure checkout · 18+ — age verified at delivery
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
