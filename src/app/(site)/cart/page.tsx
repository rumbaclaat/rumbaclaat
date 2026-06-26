import Link from "next/link";

export const metadata = { title: "Cart", robots: "noindex,nofollow" };

type CartLine = {
  name: string;
  variant: string;
  price: number;
  regularPrice?: number;
  onSale?: boolean;
  qty: number;
  image: string;
};

const ITEMS: CartLine[] = [
  {
    name: "Original Reserve Rum",
    variant: "700ml · 43% ABV",
    price: 42.0,
    qty: 1,
    image:
      "https://images.unsplash.com/photo-1758871993077-e084cc7eca86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
  },
  {
    name: "Spiced Gold Rum",
    variant: "700ml · 40% ABV",
    price: 32.0,
    regularPrice: 38.0,
    onSale: true,
    qty: 2,
    image:
      "https://images.unsplash.com/photo-1758871993077-e084cc7eca86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
  },
  {
    name: "Heritage Crest Tee",
    variant: "Charcoal · Size L",
    price: 28.0,
    qty: 1,
    image:
      "https://images.unsplash.com/photo-1758871993077-e084cc7eca86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
  },
];

function money(n: number) {
  return "£" + n.toFixed(2);
}

export default function CartPage() {
  const subtotal = ITEMS.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal >= 50 ? 0 : 4.99;
  const memberSavings = 6.0;
  const total = subtotal + shipping;

  return (
    <div className="container section">
      <div className="mb-4">
        <span className="eyebrow">Your Cart</span>
        <h1 className="mb-0">Shopping Cart</h1>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <ul className="list-unstyled mb-0">
            {ITEMS.map((item, i) => (
              <li key={i} className="cart-item">
                <img src={item.image} alt={item.name} loading="lazy" />
                <div>
                  <p style={{ fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>
                    {item.name}
                    {item.onSale ? (
                      <span
                        style={{
                          marginLeft: 8,
                          fontSize: ".625rem",
                          fontWeight: 700,
                          letterSpacing: ".08em",
                          color: "var(--on-gold)",
                          background: "var(--gold)",
                          borderRadius: 999,
                          padding: "2px 8px",
                          verticalAlign: "middle",
                        }}
                      >
                        SALE
                      </span>
                    ) : null}
                  </p>
                  <p style={{ fontSize: ".8125rem", color: "var(--text-muted)", marginBottom: 0 }}>
                    {item.variant}
                  </p>
                  <p style={{ fontSize: ".8125rem", color: "var(--text-muted)", marginBottom: 0 }}>
                    {money(item.price)} each
                    {item.onSale && item.regularPrice ? (
                      <span
                        style={{
                          textDecoration: "line-through",
                          color: "var(--text-dim)",
                          marginLeft: 4,
                        }}
                      >
                        {money(item.regularPrice)}
                      </span>
                    ) : null}
                  </p>
                  <div
                    className="d-flex align-items-center gap-2 mt-2"
                    role="group"
                    aria-label={`Quantity for ${item.name}`}
                  >
                    <button
                      type="button"
                      className="qty-btn"
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      −
                    </button>
                    <span style={{ minWidth: 24, textAlign: "center" }}>{item.qty}</span>
                    <button
                      type="button"
                      className="qty-btn"
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="text-end cart-line-total">
                  <p
                    style={{
                      fontFamily: "var(--serif)",
                      fontSize: "1.125rem",
                      fontWeight: 700,
                      color: "var(--gold-hi)",
                      marginBottom: 0,
                    }}
                  >
                    {money(item.price * item.qty)}
                  </p>
                  <button
                    type="button"
                    style={{
                      fontSize: ".75rem",
                      color: "var(--text-dim)",
                      background: "none",
                      border: "none",
                      textDecoration: "underline",
                      marginTop: 6,
                    }}
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <Link href="/shop" className="btn btn-outline-gold mt-4">
            ← Continue Shopping
          </Link>
        </div>

        <div className="col-12 col-lg-4">
          <div
            style={{
              background: "linear-gradient(135deg,#1C1A14,#161310)",
              border: "1px solid var(--gold-md)",
              borderRadius: "var(--radius-lg)",
              padding: 20,
              marginBottom: 16,
            }}
          >
            <div className="d-flex align-items-center justify-content-between mb-2">
              <p
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "var(--gold-hi)",
                  margin: 0,
                }}
              >
                Loyalty Points
              </p>
              <span className="badge-brand">4,450 pts</span>
            </div>
            <p style={{ fontSize: ".8125rem", marginBottom: 14 }}>
              Redeem points for a discount on this order. 100 pts = £1.00 off.
            </p>
            <label className="form-label" htmlFor="pts-slider">
              Points to redeem
            </label>
            <input
              type="range"
              className="form-range"
              id="pts-slider"
              min={0}
              max={100}
              step={10}
              defaultValue={0}
              style={{ accentColor: "var(--gold)" }}
            />
            <div className="d-flex justify-content-between" style={{ fontSize: ".8125rem" }}>
              <span style={{ color: "var(--text-muted)" }}>Redeeming: 0 pts</span>
              <span style={{ color: "var(--green)" }}>Saving: £0.00</span>
            </div>
          </div>

          <div className="card-brand">
            <h2 className="h3 mb-4">Order Summary</h2>
            <div className="d-flex justify-content-between mb-3">
              <span style={{ color: "var(--text-muted)" }}>Subtotal</span>
              <span>{money(subtotal)}</span>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <span style={{ color: "var(--text-muted)" }}>Shipping</span>
              <span>{shipping === 0 ? "FREE" : money(shipping)}</span>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <span style={{ color: "var(--green)" }}>Member savings</span>
              <span style={{ color: "var(--green)" }}>-{money(memberSavings)}</span>
            </div>
            <hr style={{ borderColor: "var(--gold-bdr)" }} />
            <div className="d-flex justify-content-between">
              <span style={{ fontWeight: 600 }}>Total</span>
              <span
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "var(--gold-hi)",
                }}
              >
                {money(total)}
              </span>
            </div>
            <Link href="/checkout" className="btn btn-gold w-100 mt-4">
              Proceed to Checkout →
            </Link>
            <p
              style={{
                fontSize: ".75rem",
                color: "var(--text-dim)",
                textAlign: "center",
                marginTop: 14,
                marginBottom: 0,
              }}
            >
              🔒 Secure checkout · 18+ — age verified at delivery
            </p>
          </div>
        </div>
      </div>

      {/* Empty state — shown when the cart has no items */}
      {ITEMS.length === 0 && (
        <div className="text-center py-5">
          <div style={{ fontSize: "3rem", marginBottom: 16 }} aria-hidden="true">
            🛍
          </div>
          <h2 className="h3 mb-2">Your cart is empty</h2>
          <p className="mb-4">Add some rum or apparel to get started.</p>
          <Link href="/shop" className="btn btn-gold">
            Browse the Collection →
          </Link>
        </div>
      )}
    </div>
  );
}
