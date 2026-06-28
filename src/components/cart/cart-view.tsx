"use client";

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

  if (loaded && items.length === 0) {
    return (
      <div className="text-center py-5">
        <div style={{ fontSize: "3rem", marginBottom: 16 }} aria-hidden="true">🛍</div>
        <h2 className="h3 mb-2">Your cart is empty</h2>
        <p className="mb-4">Add some rum or apparel to get started.</p>
        <Link href="/shop" className="btn btn-gold">Browse the Collection →</Link>
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

  return (
    <div className="row g-4">
      <div className="col-12 col-lg-8">
        <div>
          {items.map((item) => (
            <div className="cart-item" key={item.key}>
              <div style={{ width: 80, height: 80, borderRadius: 10, background: "var(--bg-card2)" }} />
              <div>
                <p style={{ fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>{item.name}</p>
                <p style={{ fontSize: ".8125rem", color: "var(--text-muted)", margin: 0 }}>{money(item.price)} each</p>
                <div className="d-flex align-items-center gap-2 mt-2" role="group" aria-label={`Quantity for ${item.name}`}>
                  <button type="button" className="qty-btn" aria-label={`Decrease quantity of ${item.name}`} onClick={() => setQty(item.key, item.qty - 1)}>−</button>
                  <span style={{ minWidth: 24, textAlign: "center" }} aria-live="polite">{item.qty}</span>
                  <button type="button" className="qty-btn" aria-label={`Increase quantity of ${item.name}`} onClick={() => setQty(item.key, item.qty + 1)}>+</button>
                </div>
              </div>
              <div className="text-end cart-line-total">
                <p style={{ fontFamily: "var(--serif)", fontSize: "1.125rem", fontWeight: 700, color: "var(--gold-hi)" }}>{money(item.price * item.qty)}</p>
                <button
                  type="button"
                  onClick={() => remove(item.key)}
                  style={{ fontSize: ".75rem", color: "var(--text-dim)", background: "none", border: "none", textDecoration: "underline", marginTop: 6 }}
                  aria-label={`Remove ${item.name} from cart`}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        <Link href="/shop" className="btn btn-outline-gold mt-4">← Continue Shopping</Link>
      </div>

      <div className="col-12 col-lg-4">
        {showPointsPanel && (
          <div style={{ background: "linear-gradient(135deg,#1C1A14,#161310)", border: "1px solid var(--gold-md)", borderRadius: "var(--radius-lg)", padding: 20, marginBottom: 16 }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <p style={{ fontFamily: "var(--serif)", fontSize: "1rem", fontWeight: 600, color: "var(--gold-hi)", margin: 0 }}>RPM points</p>
              <span className="badge-brand">{pointsBalance.toLocaleString("en-GB")} pts</span>
            </div>
            <p style={{ fontSize: ".8125rem", marginBottom: 14 }}>
              Redeem points for a discount on this order. {perPound.toLocaleString("en-GB")} pts = £1.00 off.
            </p>
            <label className="form-label" htmlFor="pts-slider">Points to redeem</label>
            <input
              type="range"
              className="form-range"
              id="pts-slider"
              min={0}
              max={maxRedeemable}
              step={sliderStep}
              value={Math.min(pointsToRedeem, maxRedeemable)}
              onChange={(e) => setPointsToRedeem(parseInt(e.target.value, 10) || 0)}
              style={{ accentColor: "var(--gold)" }}
            />
            <div className="d-flex justify-content-between" style={{ fontSize: ".8125rem" }}>
              <span style={{ color: "var(--text-muted)" }}>Redeeming: <span id="pts-redeeming">{Math.min(pointsToRedeem, maxRedeemable)}</span> pts</span>
              <span style={{ color: "var(--green)" }}>Saving: <span id="pts-saving">{money(discount)}</span></span>
            </div>
          </div>
        )}

        <div className="card-brand">
          <h2 className="h3 mb-4">Order Summary</h2>
          <div className="d-flex justify-content-between mb-3"><span style={{ color: "var(--text-muted)" }}>Subtotal</span><span id="subtotal">{money(subtotal)}</span></div>
          <div className="d-flex justify-content-between mb-3"><span style={{ color: "var(--text-muted)" }}>Shipping</span><span id="shipping">{shipping === 0 ? "FREE" : money(shipping)}</span></div>
          {discount > 0 && (
            <div className="d-flex justify-content-between mb-3" id="discount-row">
              <span style={{ color: "var(--green)" }}>Points Discount</span>
              <span id="discount-val" style={{ color: "var(--green)" }}>-{money(discount)}</span>
            </div>
          )}
          <hr style={{ borderColor: "var(--gold-bdr)" }} />
          <div className="d-flex justify-content-between"><span style={{ fontWeight: 600 }}>Total</span><span id="cart-total" style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", fontWeight: 700, color: "var(--gold-hi)" }}>{money(total)}</span></div>
          {subtotal < freeShippingThreshold && (
            <p style={{ fontSize: ".75rem", color: "var(--text-dim)", marginTop: 8 }}>
              Add {money(freeShippingThreshold - subtotal)} more for free UK shipping.
            </p>
          )}
          <Link href="/checkout" className="btn btn-gold w-100 mt-4">Proceed to Checkout →</Link>
          <p style={{ fontSize: ".75rem", color: "var(--text-dim)", textAlign: "center", marginTop: 14 }}>🔒 Secure checkout · 18+ — age verified at delivery</p>
        </div>
      </div>
    </div>
  );
}
