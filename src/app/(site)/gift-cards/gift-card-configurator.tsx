"use client";

import { useMemo, useRef, useState } from "react";
import { useCart } from "@/components/cart/cart-provider";

const PRESETS = [25, 50, 75, 100, 200] as const;

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

const sectionLabelStyle: React.CSSProperties = {
  fontSize: ".74rem",
  letterSpacing: ".24em",
  textTransform: "uppercase",
  color: "var(--gold)",
  fontWeight: 600,
};

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

  function AmountTile({
    value,
    selected,
    onSelect,
    main,
    sub,
  }: {
    value: string;
    selected: boolean;
    onSelect: (v: string) => void;
    main: string;
    sub?: string;
  }) {
    return (
      <label
        htmlFor={`gc-${value}`}
        style={{
          display: "block",
          textAlign: "center",
          cursor: "pointer",
          background: selected ? "var(--goldLt)" : "var(--surface2)",
          border: `1px solid ${selected ? "var(--gold)" : "var(--line2)"}`,
          borderRadius: 12,
          padding: "18px 12px",
        }}
      >
        <input
          type="radio"
          name="gc-amount"
          id={`gc-${value}`}
          value={value}
          checked={selected}
          onChange={(e) => onSelect(e.target.value)}
          style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
        />
        <span
          style={{
            display: "block",
            fontFamily: "var(--serif)",
            fontWeight: 600,
            fontSize: sub ? "1.4rem" : "1.6rem",
            lineHeight: 1.1,
            color: selected ? "var(--goldHi)" : "var(--text)",
          }}
        >
          {main}
        </span>
        {sub && (
          <span
            style={{
              display: "block",
              fontSize: ".74rem",
              color: "var(--dim)",
              marginTop: 6,
            }}
          >
            {sub}
          </span>
        )}
      </label>
    );
  }

  return (
    <div
      className="gift-config-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "1.4fr 1fr",
        gap: "clamp(28px,4vw,48px)",
        alignItems: "start",
      }}
    >
      {/* Configure */}
      <div>
        <p style={{ ...sectionLabelStyle, margin: "0 0 14px" }}>
          1 · Choose an amount
        </p>
        <fieldset style={{ border: 0, padding: 0, margin: "0 0 32px" }}>
          <legend
            style={{
              position: "absolute",
              width: 1,
              height: 1,
              overflow: "hidden",
              clip: "rect(0,0,0,0)",
            }}
          >
            Gift card amount
          </legend>
          <div
            role="radiogroup"
            aria-label="Gift card amount"
            className="gift-amount-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 12,
            }}
          >
            {PRESETS.map((v) => (
              <AmountTile
                key={v}
                value={String(v)}
                selected={amountChoice === String(v)}
                onSelect={setAmountChoice}
                main={`£${v}`}
              />
            ))}
            <AmountTile
              value="custom"
              selected={isCustom}
              onSelect={setAmountChoice}
              main="Custom"
              sub="£10 to £500"
            />
          </div>
          {isCustom && (
            <div style={{ marginTop: 16 }}>
              <label htmlFor="gc-custom-amount" style={labelStyle}>
                Custom amount (£)
              </label>
              <input
                type="number"
                id="gc-custom-amount"
                min={10}
                max={500}
                placeholder="e.g. 150"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                style={fieldStyle}
              />
            </div>
          )}
        </fieldset>

        <p style={{ ...sectionLabelStyle, margin: "0 0 14px" }}>
          2 · Personalise it
        </p>
        <form id="gc-form" noValidate onSubmit={handleSubmit}>
          {error && (
            <div
              id="err-gc"
              role="alert"
              tabIndex={-1}
              ref={errRef}
              style={{
                background: "rgba(242,109,109,.12)",
                border: "1px solid rgba(242,109,109,.35)",
                color: "var(--red)",
                borderRadius: 10,
                padding: "12px 14px",
                fontSize: ".85rem",
                marginBottom: 16,
                outline: "none",
              }}
            >
              {error}
            </div>
          )}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginBottom: 16,
            }}
            className="gift-field-pair"
          >
            <div>
              <label htmlFor="gc-to" style={labelStyle}>
                To (recipient name) *
              </label>
              <input
                id="gc-to"
                required
                value={to}
                onChange={(e) => setTo(e.target.value)}
                style={fieldStyle}
              />
            </div>
            <div>
              <label htmlFor="gc-from" style={labelStyle}>
                From *
              </label>
              <input
                id="gc-from"
                required
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                style={fieldStyle}
              />
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginBottom: 16,
            }}
            className="gift-field-pair"
          >
            <div>
              <label htmlFor="gc-to-email" style={labelStyle}>
                Recipient email *
              </label>
              <input
                type="email"
                id="gc-to-email"
                required
                value={toEmail}
                onChange={(e) => setToEmail(e.target.value)}
                style={fieldStyle}
              />
            </div>
            <div>
              <label htmlFor="gc-send-date" style={labelStyle}>
                Send on
              </label>
              <input
                type="date"
                id="gc-send-date"
                value={sendDate}
                onChange={(e) => setSendDate(e.target.value)}
                style={fieldStyle}
              />
              <span
                style={{
                  display: "block",
                  fontSize: ".74rem",
                  color: "var(--dim)",
                  marginTop: 6,
                }}
              >
                Leave blank to send immediately
              </span>
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label htmlFor="gc-message" style={labelStyle}>
              Personal message
            </label>
            <textarea
              id="gc-message"
              rows={4}
              maxLength={500}
              placeholder="Something thoughtful…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ ...fieldStyle, resize: "vertical", lineHeight: 1.55 }}
            />
            <span
              style={{
                display: "block",
                fontSize: ".74rem",
                color: "var(--dim)",
                marginTop: 6,
              }}
            >
              <span id="gc-msg-count">{message.length}</span>/500
            </span>
          </div>

          <button
            type="submit"
            aria-live="polite"
            style={{
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
              cursor: "pointer",
            }}
          >
            {added ? (
              <>
                Added <i className="bi bi-check-lg" />
              </>
            ) : (
              <>
                Add to cart — <span id="gc-total">£{amount.toFixed(2)}</span>
              </>
            )}
          </button>
          <p
            style={{
              fontSize: ".78rem",
              color: "var(--dim)",
              lineHeight: 1.5,
              margin: "14px 0 0",
            }}
          >
            Sent by email on your chosen date. Gift cards never expire and can be
            redeemed against any product. The recipient must be 18+ when
            purchasing alcohol.
          </p>
        </form>
      </div>

      {/* Live preview */}
      <div style={{ position: "sticky", top: 96 }}>
        <p style={{ ...sectionLabelStyle, margin: "0 0 14px" }}>Preview</p>
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            background: "linear-gradient(160deg, rgba(205,181,130,.12), var(--surface))",
            border: "1px solid var(--line)",
            borderRadius: 18,
            padding: "28px 26px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 32,
            minHeight: 230,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 140,
              height: 140,
              background:
                "radial-gradient(circle, var(--goldLt) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative" }}>
            <p
              style={{
                fontFamily: "var(--serif)",
                fontWeight: 600,
                fontSize: ".95rem",
                letterSpacing: ".18em",
                color: "var(--goldHi)",
                margin: 0,
              }}
            >
              RUMBACLAAT
            </p>
            <p
              style={{
                fontSize: ".68rem",
                letterSpacing: ".18em",
                color: "var(--muted)",
                margin: 0,
              }}
            >
              GIFT CARD
            </p>
          </div>
          <div style={{ position: "relative" }}>
            <p
              id="gc-preview-amount"
              style={{
                fontFamily: "var(--serif)",
                fontSize: "3rem",
                fontWeight: 700,
                color: "var(--goldHi)",
                lineHeight: 1,
                margin: "0 0 8px",
              }}
            >
              £{amount}
            </p>
            <p
              style={{
                fontSize: ".78rem",
                color: "var(--muted)",
                margin: 0,
              }}
            >
              To:{" "}
              <span style={{ color: "var(--text)" }}>{to || "Recipient"}</span>
            </p>
            <p
              style={{
                fontSize: ".78rem",
                color: "var(--muted)",
                margin: 0,
              }}
            >
              From: <span style={{ color: "var(--text)" }}>{from || "You"}</span>
            </p>
          </div>
        </div>
        <p
          id="gc-preview-message"
          style={{
            fontSize: ".88rem",
            color: "var(--muted)",
            lineHeight: 1.6,
            fontStyle: "italic",
            marginTop: 16,
            minHeight: 60,
          }}
        >
          {message ? `“${message}”` : ""}
        </p>
      </div>
    </div>
  );
}
