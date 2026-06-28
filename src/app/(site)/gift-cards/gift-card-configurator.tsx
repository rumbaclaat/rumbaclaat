"use client";

import { useMemo, useRef, useState } from "react";
import { useCart } from "@/components/cart/cart-provider";

const PRESETS = [25, 50, 75, 100, 200] as const;

export default function GiftCardConfigurator() {
  const { add } = useCart();

  const [amountChoice, setAmountChoice] = useState<string>("50");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [to, setTo] = useState("");
  const [from, setFrom] = useState("");
  const [toEmail, setToEmail] = useState("");
  const [sendDate, setSendDate] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);
  const errRef = useRef<HTMLDivElement | null>(null);

  const isCustom = amountChoice === "custom";

  const amount = useMemo(() => {
    if (isCustom) return parseInt(customAmount, 10) || 0;
    return parseInt(amountChoice, 10) || 0;
  }, [amountChoice, customAmount, isCustom]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const miss: string[] = [];
    if (!to.trim()) miss.push("To (recipient name)");
    if (!from.trim()) miss.push("From");
    if (!toEmail.trim()) miss.push("Recipient email");
    if (miss.length) {
      setError("Please complete: " + miss.join(", ") + ".");
      requestAnimationFrame(() => errRef.current?.focus());
      return;
    }
    setError("");
    add(
      {
        key: `gift-card-${amount}-${Date.now()}`,
        productId: "gift-card",
        name: `Gift card — £${amount}`,
        price: amount,
      },
      1
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="row g-5">
      {/* Configure */}
      <div className="col-12 col-lg-7">
        <h2 className="h4 mb-3">1. Choose an amount</h2>
        <fieldset style={{ border: 0, padding: 0, margin: "0 0 28px" }}>
          <legend className="visually-hidden">Gift card amount</legend>
          <div className="row g-3" role="radiogroup" aria-label="Gift card amount">
            {PRESETS.map((v) => (
              <div className="col-6 col-md-4" key={v}>
                <input
                  type="radio"
                  className="btn-check"
                  name="gc-amount"
                  id={`gc-${v}`}
                  value={String(v)}
                  checked={amountChoice === String(v)}
                  onChange={(e) => setAmountChoice(e.target.value)}
                />
                <label className="gc-card d-block text-center" htmlFor={`gc-${v}`}>
                  <span className="gc-amount">£{v}</span>
                </label>
              </div>
            ))}
            <div className="col-6 col-md-4">
              <input
                type="radio"
                className="btn-check"
                name="gc-amount"
                id="gc-custom"
                value="custom"
                checked={isCustom}
                onChange={(e) => setAmountChoice(e.target.value)}
              />
              <label className="gc-card d-block text-center" htmlFor="gc-custom">
                <span className="gc-amount" style={{ fontSize: "1.5rem" }}>
                  Custom
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: ".75rem",
                    color: "var(--text-muted)",
                    marginTop: 6,
                  }}
                >
                  £10 to £500
                </span>
              </label>
            </div>
          </div>
          {isCustom && (
            <div className="mt-3">
              <label className="form-label" htmlFor="gc-custom-amount">
                Custom amount (£)
              </label>
              <input
                type="number"
                className="form-control"
                id="gc-custom-amount"
                min={10}
                max={500}
                placeholder="e.g. 150"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
              />
            </div>
          )}
        </fieldset>

        <h2 className="h4 mb-3">2. Personalise it</h2>
        <form id="gc-form" noValidate onSubmit={handleSubmit}>
          {error && (
            <div
              className="alert"
              id="err-gc"
              role="alert"
              tabIndex={-1}
              ref={errRef}
              style={{
                background: "rgba(242,109,109,.12)",
                border: "1px solid rgba(242,109,109,.35)",
                color: "var(--red)",
                borderRadius: "var(--radius)",
              }}
            >
              {error}
            </div>
          )}
          <div className="row g-3">
            <div className="col-sm-6">
              <label className="form-label" htmlFor="gc-to">
                To (recipient name) *
              </label>
              <input
                className="form-control"
                id="gc-to"
                required
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
            <div className="col-sm-6">
              <label className="form-label" htmlFor="gc-from">
                From *
              </label>
              <input
                className="form-control"
                id="gc-from"
                required
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
            <div className="col-sm-6">
              <label className="form-label" htmlFor="gc-to-email">
                Recipient email *
              </label>
              <input
                className="form-control"
                type="email"
                id="gc-to-email"
                required
                value={toEmail}
                onChange={(e) => setToEmail(e.target.value)}
              />
            </div>
            <div className="col-sm-6">
              <label className="form-label" htmlFor="gc-send-date">
                Send on
              </label>
              <input
                className="form-control"
                type="date"
                id="gc-send-date"
                value={sendDate}
                onChange={(e) => setSendDate(e.target.value)}
              />
              <span style={{ fontSize: ".75rem", color: "var(--text-dim)" }}>
                Leave blank to send immediately
              </span>
            </div>
            <div className="col-12">
              <label className="form-label" htmlFor="gc-message">
                Personal message
              </label>
              <textarea
                className="form-control"
                id="gc-message"
                rows={4}
                maxLength={500}
                placeholder="Something thoughtful…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <span style={{ fontSize: ".75rem", color: "var(--text-dim)" }}>
                <span id="gc-msg-count">{message.length}</span>/500
              </span>
            </div>
          </div>
          <button type="submit" className="btn btn-gold mt-4" aria-live="polite">
            {added ? "Added ✓" : <>Add to cart — <span id="gc-total">£{amount.toFixed(2)}</span></>}
          </button>
          <p style={{ fontSize: ".75rem", color: "var(--text-dim)", marginTop: 14 }}>
            Sent by email on your chosen date. Gift cards never expire and can be
            redeemed against any product. The recipient must be 18+ when
            purchasing alcohol.
          </p>
        </form>
      </div>

      {/* Live preview */}
      <div className="col-12 col-lg-5">
        <p className="eyebrow">PREVIEW</p>
        <div className="gc-preview">
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 120,
              height: 120,
              background:
                "radial-gradient(circle, var(--gold-lt) 0%, transparent 70%)",
            }}
          />
          <div>
            <p
              style={{
                fontFamily: "var(--serif)",
                fontSize: ".875rem",
                letterSpacing: ".18em",
                color: "var(--gold-hi)",
                marginBottom: 0,
              }}
            >
              RUMBACLAAT
            </p>
            <p
              style={{
                fontSize: ".6875rem",
                letterSpacing: ".18em",
                color: "var(--text-muted)",
                margin: 0,
              }}
            >
              GIFT CARD
            </p>
          </div>
          <div>
            <p
              id="gc-preview-amount"
              style={{
                fontFamily: "var(--serif)",
                fontSize: "3rem",
                fontWeight: 700,
                color: "var(--gold-hi)",
                lineHeight: 1,
                marginBottom: 6,
              }}
            >
              £{amount}
            </p>
            <p style={{ fontSize: ".75rem", color: "var(--text-muted)", margin: 0 }}>
              To: <span style={{ color: "var(--text)" }}>{to || "Recipient"}</span>
            </p>
            <p style={{ fontSize: ".75rem", color: "var(--text-muted)", margin: 0 }}>
              From: <span style={{ color: "var(--text)" }}>{from || "You"}</span>
            </p>
          </div>
        </div>
        <p
          id="gc-preview-message"
          style={{
            fontSize: ".875rem",
            color: "var(--text-muted)",
            fontStyle: "italic",
            marginTop: 14,
            minHeight: 60,
          }}
        >
          {message ? `“${message}”` : ""}
        </p>
      </div>
    </div>
  );
}
