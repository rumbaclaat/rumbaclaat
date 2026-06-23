"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/cart-provider";

export default function CartView({
  freeShippingThreshold,
  shippingStandardCost,
}: {
  freeShippingThreshold: number;
  shippingStandardCost: number;
}) {
  const { items, subtotal, setQty, remove, loaded } = useCart();

  if (loaded && items.length === 0) {
    return (
      <div className="text-center" style={{ padding: "40px 0" }}>
        <p style={{ color: "var(--text-muted)" }}>Your cart is empty.</p>
        <Link href="/shop" className="btn btn-gold mt-2">Browse the shop →</Link>
      </div>
    );
  }

  const shipping = subtotal >= freeShippingThreshold ? 0 : shippingStandardCost;
  const total = subtotal + shipping;
  const money = (n: number) => `£${n.toFixed(2)}`;

  return (
    <div className="row g-5">
      <div className="col-12 col-lg-8">
        {items.map((item) => (
          <div className="cart-item" key={item.key}>
            <div style={{ width: 80, height: 80, borderRadius: 10, background: "var(--bg-card2)" }} />
            <div>
              <h3 style={{ fontSize: "1rem", marginBottom: 4 }}>{item.name}</h3>
              <p style={{ fontSize: ".8125rem", color: "var(--text-muted)", margin: 0 }}>{money(item.price)} each</p>
              <div className="d-flex align-items-center gap-2 mt-2">
                <button type="button" className="qty-btn" aria-label="Decrease quantity" onClick={() => setQty(item.key, item.qty - 1)}>−</button>
                <span style={{ minWidth: 28, textAlign: "center" }}>{item.qty}</span>
                <button type="button" className="qty-btn" aria-label="Increase quantity" onClick={() => setQty(item.key, item.qty + 1)}>+</button>
                <button type="button" className="btn btn-ghost btn-sm ms-2" style={{ color: "var(--red)" }} onClick={() => remove(item.key)}>Remove</button>
              </div>
            </div>
            <div className="cart-line-total price" style={{ fontSize: "1.05rem" }}>{money(item.price * item.qty)}</div>
          </div>
        ))}
      </div>

      <div className="col-12 col-lg-4">
        <div className="card-brand">
          <h2 className="h4 mb-3">Order Summary</h2>
          <div className="order-summary-item"><span style={{ color: "var(--text-muted)" }}>Subtotal</span><span>{money(subtotal)}</span></div>
          <div className="order-summary-item"><span style={{ color: "var(--text-muted)" }}>Shipping</span><span>{shipping === 0 ? "FREE" : money(shipping)}</span></div>
          <div className="order-summary-item" style={{ fontWeight: 600, border: "none", paddingTop: 14 }}>
            <span>Total</span>
            <span className="serif gold" style={{ fontSize: "1.375rem" }}>{money(total)}</span>
          </div>
          {subtotal < freeShippingThreshold && (
            <p style={{ fontSize: ".75rem", color: "var(--text-dim)", marginTop: 8 }}>
              Add {money(freeShippingThreshold - subtotal)} more for free UK shipping.
            </p>
          )}
          <Link href="/checkout" className="btn btn-gold w-100 mt-3">Checkout →</Link>
          <p style={{ fontSize: ".75rem", color: "var(--text-dim)", textAlign: "center", marginTop: 12 }}>🔒 Secure · 18+ verified on delivery</p>
        </div>
      </div>
    </div>
  );
}
