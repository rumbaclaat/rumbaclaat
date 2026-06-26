import Link from "next/link";

export const metadata = { title: "Checkout", robots: "noindex,nofollow" };

type Line = { name: string; qty: number; price: number };

const ITEMS: Line[] = [
  { name: "Original Reserve Rum", qty: 1, price: 42.0 },
  { name: "Spiced Gold Rum", qty: 2, price: 32.0 },
  { name: "Heritage Crest Tee", qty: 1, price: 28.0 },
];

function money(n: number) {
  return "£" + n.toFixed(2);
}

export default function CheckoutPage() {
  const subtotal = ITEMS.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal >= 50 ? 0 : 4.99;
  const total = subtotal + shipping;

  return (
    <div className="container section" style={{ maxWidth: 1060 }}>
      <h1 className="visually-hidden">Checkout</h1>

      <ol className="step-bar list-unstyled" aria-label="Checkout progress">
        <li className="step-node">
          <span className="step-circle active" aria-current="step" aria-label="Step 1: Contact">
            1
          </span>
          <span className="step-label gold">Contact</span>
        </li>
        <li className="step-connector" aria-hidden="true" />
        <li className="step-node">
          <span className="step-circle pending" aria-label="Step 2: Delivery">
            2
          </span>
          <span className="step-label" style={{ color: "var(--text-dim)" }}>Delivery</span>
        </li>
        <li className="step-connector" aria-hidden="true" />
        <li className="step-node">
          <span className="step-circle pending" aria-label="Step 3: Payment">
            3
          </span>
          <span className="step-label" style={{ color: "var(--text-dim)" }}>Payment</span>
        </li>
        <li className="step-connector" aria-hidden="true" />
        <li className="step-node">
          <span className="step-circle pending" aria-label="Step 4: Review">
            ✓
          </span>
          <span className="step-label" style={{ color: "var(--text-dim)" }}>Review</span>
        </li>
      </ol>

      <div className="row g-4">
        <div className="col-12 col-lg-8">
          {/* Step 1: Contact */}
          <section className="card-brand mb-4" aria-labelledby="s1h">
            <h2 id="s1h" className="h3 mb-4">
              1. Contact Details
            </h2>
            <div className="row g-3">
              <div className="col-12 col-sm-6">
                <label className="form-label" htmlFor="fname">
                  First name
                </label>
                <input className="form-control" id="fname" name="fname" autoComplete="given-name" />
              </div>
              <div className="col-12 col-sm-6">
                <label className="form-label" htmlFor="lname">
                  Last name
                </label>
                <input className="form-control" id="lname" name="lname" autoComplete="family-name" />
              </div>
              <div className="col-12">
                <label className="form-label" htmlFor="email">
                  Email address
                </label>
                <input
                  className="form-control"
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                />
              </div>
              <div className="col-12">
                <label className="form-label" htmlFor="phone">
                  Phone number
                </label>
                <input
                  className="form-control"
                  type="tel"
                  id="phone"
                  name="phone"
                  autoComplete="tel"
                />
              </div>
            </div>
          </section>

          {/* Step 2: Delivery */}
          <section className="card-brand mb-4" aria-labelledby="s2h">
            <h2 id="s2h" className="h3 mb-4">
              2. Delivery
            </h2>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label" htmlFor="addr1">
                  Address line 1
                </label>
                <input
                  className="form-control"
                  id="addr1"
                  name="addr1"
                  autoComplete="address-line1"
                />
              </div>
              <div className="col-12">
                <label className="form-label" htmlFor="addr2">
                  Address line 2
                </label>
                <input
                  className="form-control"
                  id="addr2"
                  name="addr2"
                  autoComplete="address-line2"
                />
              </div>
              <div className="col-12 col-sm-6">
                <label className="form-label" htmlFor="city">
                  City
                </label>
                <input
                  className="form-control"
                  id="city"
                  name="city"
                  autoComplete="address-level2"
                />
              </div>
              <div className="col-12 col-sm-6">
                <label className="form-label" htmlFor="postcode">
                  Postcode
                </label>
                <input
                  className="form-control"
                  id="postcode"
                  name="postcode"
                  autoComplete="postal-code"
                />
              </div>
              <div className="col-12">
                <label className="form-label" htmlFor="country">
                  Country
                </label>
                <select
                  className="form-select"
                  id="country"
                  name="country"
                  autoComplete="country-name"
                  defaultValue="United Kingdom"
                >
                  <option>United Kingdom</option>
                  <option>United States</option>
                  <option>Germany</option>
                  <option>France</option>
                  <option>Jamaica</option>
                </select>
              </div>
            </div>
            <fieldset
              className="mt-3"
              style={{
                border: "1px solid var(--gold-bdr)",
                borderRadius: "var(--radius)",
                padding: 16,
                background: "var(--bg-card2)",
              }}
            >
              <legend
                className="form-label"
                style={{
                  fontSize: ".875rem",
                  fontWeight: 600,
                  color: "var(--text)",
                  float: "none",
                  width: "auto",
                  padding: "0 6px",
                }}
              >
                Delivery method
              </legend>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="delivery"
                  id="d-std"
                  value="standard"
                  defaultChecked
                />
                <label className="form-check-label" htmlFor="d-std" style={{ fontSize: ".875rem" }}>
                  Standard UK (3–5 days) — £4.99 · FREE on £50+
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="delivery"
                  id="d-exp"
                  value="express"
                />
                <label className="form-check-label" htmlFor="d-exp" style={{ fontSize: ".875rem" }}>
                  Express UK (1–2 days) — £9.99
                </label>
              </div>
            </fieldset>
          </section>

          {/* Step 3: Payment */}
          <section className="card-brand mb-4" aria-labelledby="s3h">
            <h2 id="s3h" className="h3 mb-4">
              3. Payment
            </h2>
            <fieldset style={{ border: 0, padding: 0, margin: "0 0 24px" }}>
              <legend className="form-label" style={{ fontSize: ".875rem" }}>
                Payment method
              </legend>
              <div className="row g-2" role="radiogroup" aria-label="Payment method">
                <div className="col-4">
                  <input
                    type="radio"
                    className="btn-check"
                    name="paymethod"
                    id="pm-card"
                    value="stripe"
                    defaultChecked
                  />
                  <label className="btn btn-outline-gold w-100" htmlFor="pm-card">
                    Card
                  </label>
                </div>
                <div className="col-4">
                  <input
                    type="radio"
                    className="btn-check"
                    name="paymethod"
                    id="pm-pp"
                    value="paypal"
                  />
                  <label className="btn btn-outline-gold w-100" htmlFor="pm-pp">
                    PayPal
                  </label>
                </div>
                <div className="col-4">
                  <input
                    type="radio"
                    className="btn-check"
                    name="paymethod"
                    id="pm-gp"
                    value="googlepay"
                  />
                  <label className="btn btn-outline-gold w-100" htmlFor="pm-gp">
                    Google Pay
                  </label>
                </div>
              </div>
            </fieldset>

            <div
              style={{
                background: "var(--bg-card2)",
                border: "1px solid var(--gold-bdr)",
                borderRadius: "var(--radius)",
                padding: 20,
              }}
            >
              <div className="mb-3">
                <label className="form-label" htmlFor="card-num">
                  Card number
                </label>
                <input
                  className="form-control"
                  id="card-num"
                  name="card"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  maxLength={19}
                  placeholder="1234 5678 9012 3456"
                />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="card-name">
                  Name on card
                </label>
                <input
                  className="form-control"
                  id="card-name"
                  name="cardname"
                  autoComplete="cc-name"
                />
              </div>
              <div className="row g-3">
                <div className="col-6">
                  <label className="form-label" htmlFor="card-exp">
                    Expiry
                  </label>
                  <input
                    className="form-control"
                    id="card-exp"
                    name="exp"
                    autoComplete="cc-exp"
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label" htmlFor="card-cvv">
                    CVV
                  </label>
                  <input
                    className="form-control"
                    type="password"
                    id="card-cvv"
                    name="cvv"
                    autoComplete="cc-csc"
                    inputMode="numeric"
                    maxLength={4}
                  />
                </div>
              </div>
              <p style={{ fontSize: ".6875rem", color: "var(--text-dim)", margin: "16px 0 0" }}>
                🔒 256-bit SSL · No card data stored
              </p>
            </div>
          </section>

          {/* Step 4: Review */}
          <section className="card-brand" aria-labelledby="s4h">
            <h2 id="s4h" className="h3 mb-4">
              4. Review
            </h2>
            <div
              style={{
                background: "var(--bg-card2)",
                borderRadius: "var(--radius)",
                padding: 20,
                marginBottom: 20,
              }}
            >
              <p
                style={{
                  fontSize: ".75rem",
                  color: "var(--text-dim)",
                  marginBottom: 10,
                  letterSpacing: ".15em",
                }}
              >
                ITEMS
              </p>
              {ITEMS.map((i, idx) => (
                <div className="order-summary-item" key={idx}>
                  <span>
                    {i.name} ×{i.qty}
                  </span>
                  <span>{money(i.price * i.qty)}</span>
                </div>
              ))}
            </div>
            <div
              className="d-flex justify-content-between"
              style={{ fontWeight: 600, padding: "12px 0", borderTop: "1px solid var(--gold-bdr)" }}
            >
              <span>Total charged</span>
              <span style={{ fontFamily: "var(--serif)", fontSize: "1.375rem", color: "var(--gold-hi)" }}>
                {money(total)}
              </span>
            </div>

            {/* Age-verification (18+) notice */}
            <div
              role="note"
              style={{
                background: "var(--gold-lt)",
                border: "1px solid var(--gold-bdr)",
                borderRadius: "var(--radius)",
                padding: 16,
                margin: "16px 0",
              }}
            >
              <p style={{ fontWeight: 600, color: "var(--gold-hi)", margin: "0 0 4px" }}>
                18+ — Age verification required
              </p>
              <p style={{ fontSize: ".8125rem", color: "var(--text-muted)", margin: 0 }}>
                You must be 18 or over to buy alcohol. By placing this order you confirm you are 18 or
                over. Age is verified on delivery — someone aged 18+ must be present to sign for the
                parcel.
              </p>
            </div>

            <p style={{ fontSize: ".75rem", color: "var(--text-dim)", margin: "0 0 24px" }}>
              By placing this order you agree to our <Link href="/terms">Terms &amp; Conditions</Link>.
              Standard 14-day returns apply.
            </p>
            <button type="button" className="btn btn-gold btn-lg w-100">
              Place Order
            </button>
          </section>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card-brand">
            <h2 className="h4 mb-3">Order Summary</h2>
            {ITEMS.map((i, idx) => (
              <div className="order-summary-item" key={idx}>
                <span>
                  {i.name} ×{i.qty}
                </span>
                <span>{money(i.price * i.qty)}</span>
              </div>
            ))}
            <hr style={{ borderColor: "var(--gold-bdr)" }} />
            <div className="order-summary-item">
              <span style={{ color: "var(--text-muted)" }}>Subtotal</span>
              <span>{money(subtotal)}</span>
            </div>
            <div className="order-summary-item">
              <span style={{ color: "var(--text-muted)" }}>Shipping</span>
              <span>{shipping === 0 ? "FREE" : money(shipping)}</span>
            </div>
            <div
              className="order-summary-item"
              style={{ fontWeight: 600, border: "none", paddingTop: 14 }}
            >
              <span>Total</span>
              <span
                style={{ fontFamily: "var(--serif)", fontSize: "1.375rem", color: "var(--gold-hi)" }}
              >
                {money(total)}
              </span>
            </div>
            <p
              style={{
                fontSize: ".75rem",
                color: "var(--text-dim)",
                textAlign: "center",
                marginTop: 14,
                marginBottom: 0,
              }}
            >
              🔒 Secure · 18+ verified on delivery
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
