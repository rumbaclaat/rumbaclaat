"use client";

import { useState } from "react";

type SuccessState = {
  type: "message" | "trade enquiry";
  email: string;
  firstName: string;
  ref: string;
};

function makeRef(type: SuccessState["type"]) {
  const prefix = type === "trade enquiry" ? "TR" : "MSG";
  return `${prefix}-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
}

const cardStyle: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--line2)",
  borderRadius: 18,
  padding: "30px 30px 32px",
};

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

const submitStyle: React.CSSProperties = {
  background: "var(--gold)",
  color: "var(--onGold)",
  border: "none",
  borderRadius: 999,
  padding: "13px 30px",
  fontSize: ".92rem",
  fontWeight: 600,
  cursor: "pointer",
};

function focusGold(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = "var(--gold)";
}
function blurGold(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = "var(--line2)";
}

export default function ContactForms({
  action,
}: {
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [active, setActive] = useState<"general" | "trade">("general");
  const [success, setSuccess] = useState<SuccessState | null>(null);
  const [genError, setGenError] = useState("");
  const [tradeError, setTradeError] = useState("");

  function validate(form: HTMLFormElement) {
    const missing: string[] = [];
    form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("[required]").forEach((f) => {
      const ok = f instanceof HTMLInputElement && f.type === "checkbox" ? f.checked : f.value.trim() !== "";
      f.setAttribute("aria-invalid", ok ? "false" : "true");
      if (!ok) {
        const label = form.querySelector(`label[for="${f.id}"]`);
        missing.push(label ? (label.textContent ?? "").replace(" *", "") : f.id);
      }
    });
    return missing;
  }

  function onSubmitGeneral(e: React.FormEvent<HTMLFormElement>) {
    const form = e.currentTarget;
    const missing = validate(form);
    if (missing.length) {
      e.preventDefault();
      setGenError(`Please complete: ${missing.join(", ")}.`);
      return;
    }
    setGenError("");
    const first = (form.querySelector<HTMLInputElement>("#g-fname")?.value ?? "").trim().split(/\s+/)[0] ?? "";
    const email = form.querySelector<HTMLInputElement>("#g-email")?.value ?? "";
    setSuccess({ type: "message", email, firstName: first, ref: makeRef("message") });
    // form submits to the server action; success panel shown immediately
  }

  function onSubmitTrade(e: React.FormEvent<HTMLFormElement>) {
    const form = e.currentTarget;
    const missing = validate(form);
    if (missing.length) {
      e.preventDefault();
      setTradeError(`Please complete: ${missing.join(", ")}.`);
      return;
    }
    setTradeError("");
    const first = (form.querySelector<HTMLInputElement>("#t-name")?.value ?? "").trim().split(/\s+/)[0] ?? "";
    const email = form.querySelector<HTMLInputElement>("#t-email")?.value ?? "";
    setSuccess({ type: "trade enquiry", email, firstName: first, ref: makeRef("trade enquiry") });
  }

  if (success) {
    return (
      <div tabIndex={-1} aria-live="polite" style={{ ...cardStyle, textAlign: "center" }}>
        <div
          aria-hidden="true"
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "var(--goldLt)",
            border: "1px solid var(--gold)",
            color: "var(--goldHi)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 18px",
          }}
        >
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <span style={{ fontSize: ".72rem", letterSpacing: ".24em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 600 }}>
          Message received
        </span>
        <h2 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "clamp(1.6rem,3.5vw,2.2rem)", lineHeight: 1.1, margin: "10px 0 12px" }}>
          Thanks {success.firstName ? `${success.firstName}, ` : ""}— we&apos;ve got your {success.type}
        </h2>
        <p style={{ fontSize: "1rem", color: "var(--muted)", lineHeight: 1.6, maxWidth: 520, margin: "0 auto 18px" }}>
          Reference <strong style={{ color: "var(--goldHi)", fontFamily: "var(--serif)" }}>{success.ref}</strong>.
          {" "}We&apos;ll reply to <strong style={{ color: "var(--text)" }}>{success.email || "your email"}</strong> within one working day.
        </p>

        <div
          style={{
            background: "var(--surface2)",
            border: "1px solid var(--line)",
            borderRadius: 14,
            padding: "16px 18px",
            maxWidth: 520,
            margin: "0 auto",
          }}
        >
          <p style={{ fontSize: ".7rem", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--dim)", marginBottom: 8 }}>What happens next</p>
          <ol style={{ fontSize: ".9rem", color: "var(--muted)", paddingLeft: "1.2em", margin: 0, lineHeight: 1.8, textAlign: "left" }}>
            <li>A confirmation email is on its way to your inbox now.</li>
            <li>Our team triages your enquiry within one working day.</li>
            <li>You&apos;ll receive a personal reply from the right person, not a noreply address.</li>
          </ol>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 22, flexWrap: "wrap" }}>
          <button
            type="button"
            style={submitStyle}
            onClick={() => {
              setSuccess(null);
              setGenError("");
              setTradeError("");
            }}
          >
            Send another message
          </button>
          <a
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              borderRadius: 999,
              padding: "13px 30px",
              fontSize: ".92rem",
              fontWeight: 600,
              color: "var(--goldHi)",
              border: "1px solid var(--line2)",
              textDecoration: "none",
            }}
          >
            Back to home
          </a>
        </div>
      </div>
    );
  }

  const tabBtn = (key: "general" | "trade"): React.CSSProperties => ({
    appearance: "none",
    background: active === key ? "var(--gold)" : "transparent",
    color: active === key ? "var(--onGold)" : "var(--muted)",
    border: `1px solid ${active === key ? "var(--gold)" : "var(--line2)"}`,
    borderRadius: 999,
    padding: "8px 18px",
    fontSize: ".82rem",
    fontWeight: 600,
    fontFamily: "var(--sans)",
    cursor: "pointer",
  });

  const errorBox: React.CSSProperties = {
    background: "rgba(236,139,139,.12)",
    border: "1px solid rgba(236,139,139,.35)",
    color: "var(--red)",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: ".85rem",
    marginBottom: 16,
  };

  return (
    <div style={cardStyle}>
      <h2 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "1.5rem", margin: "0 0 18px" }}>Send a message</h2>

      <div role="tablist" aria-label="Enquiry type" style={{ display: "flex", gap: 8, marginBottom: 22 }}>
        <button
          type="button"
          role="tab"
          id="tab-general"
          aria-controls="pane-general"
          aria-selected={active === "general"}
          style={tabBtn("general")}
          onClick={() => setActive("general")}
        >
          General Enquiry
        </button>
        <button
          type="button"
          role="tab"
          id="tab-trade"
          aria-controls="pane-trade"
          aria-selected={active === "trade"}
          style={tabBtn("trade")}
          onClick={() => setActive("trade")}
        >
          Trade Enquiry
        </button>
      </div>

      <div
        id="pane-general"
        role="tabpanel"
        aria-labelledby="tab-general"
        hidden={active !== "general"}
      >
        {genError && (
          <div role="alert" tabIndex={-1} style={errorBox}>
            {genError}
          </div>
        )}
        <form id="form-general" action={action} onSubmit={onSubmitGeneral} noValidate>
          <input type="hidden" name="type" value="general" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
            <div>
              <label style={labelStyle} htmlFor="g-fname">First name *</label>
              <input style={fieldStyle} id="g-fname" name="firstName" autoComplete="given-name" required onFocus={focusGold} onBlur={blurGold} />
            </div>
            <div>
              <label style={labelStyle} htmlFor="g-lname">Last name *</label>
              <input style={fieldStyle} id="g-lname" name="lastName" autoComplete="family-name" required onFocus={focusGold} onBlur={blurGold} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
            <div>
              <label style={labelStyle} htmlFor="g-email">Email *</label>
              <input style={fieldStyle} type="email" id="g-email" name="email" autoComplete="email" required onFocus={focusGold} onBlur={blurGold} />
            </div>
            <div>
              <label style={labelStyle} htmlFor="g-subject">Subject *</label>
              <select style={fieldStyle} id="g-subject" name="subject" required defaultValue="" onFocus={focusGold} onBlur={blurGold}>
                <option value="">Select a subject…</option>
                <option>Product enquiry</option>
                <option>Order issue</option>
                <option>Membership question</option>
                <option>Press &amp; media</option>
                <option>Other</option>
              </select>
            </div>
          </div>
          <label style={labelStyle} htmlFor="g-message">Message *</label>
          <textarea style={{ ...fieldStyle, resize: "vertical", lineHeight: 1.55, marginBottom: 16 }} id="g-message" name="message" rows={5} required onFocus={focusGold} onBlur={blurGold} />
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 20 }}>
            <input type="checkbox" id="g-gdpr" required style={{ marginTop: 3, accentColor: "var(--gold)" }} />
            <label htmlFor="g-gdpr" style={{ fontSize: ".8rem", color: "var(--muted)", lineHeight: 1.5 }}>
              I agree to the <a href="/privacy" style={{ color: "var(--goldHi)" }}>Privacy Policy</a> and consent to being contacted.
            </label>
          </div>
          <button type="submit" style={submitStyle}>Send message</button>
        </form>
      </div>

      <div
        id="pane-trade"
        role="tabpanel"
        aria-labelledby="tab-trade"
        hidden={active !== "trade"}
      >
        {tradeError && (
          <div role="alert" tabIndex={-1} style={errorBox}>
            {tradeError}
          </div>
        )}
        <form id="form-trade" action={action} onSubmit={onSubmitTrade} noValidate>
          <input type="hidden" name="type" value="trade" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
            <div>
              <label style={labelStyle} htmlFor="t-name">Contact name *</label>
              <input style={fieldStyle} id="t-name" name="name" autoComplete="name" required onFocus={focusGold} onBlur={blurGold} />
            </div>
            <div>
              <label style={labelStyle} htmlFor="t-business">Business name *</label>
              <input style={fieldStyle} id="t-business" name="business" autoComplete="organization" required onFocus={focusGold} onBlur={blurGold} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
            <div>
              <label style={labelStyle} htmlFor="t-email">Email *</label>
              <input style={fieldStyle} type="email" id="t-email" name="email" autoComplete="email" required onFocus={focusGold} onBlur={blurGold} />
            </div>
            <div>
              <label style={labelStyle} htmlFor="t-phone">Phone</label>
              <input style={fieldStyle} type="tel" id="t-phone" name="phone" autoComplete="tel" onFocus={focusGold} onBlur={blurGold} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
            <div>
              <label style={labelStyle} htmlFor="t-btype">Business type *</label>
              <select style={fieldStyle} id="t-btype" name="businessType" required defaultValue="" onFocus={focusGold} onBlur={blurGold}>
                <option value="">Select business type…</option>
                <option>Restaurant / Bar</option>
                <option>Off-licence / Retailer</option>
                <option>Wholesale Distributor</option>
                <option>Export / International</option>
                <option>Hotel / Hospitality</option>
                <option>Event / Catering</option>
              </select>
            </div>
            <div>
              <label style={labelStyle} htmlFor="t-volume">Monthly volume</label>
              <select style={fieldStyle} id="t-volume" name="volume" defaultValue="" onFocus={focusGold} onBlur={blurGold}>
                <option value="">Select volume range…</option>
                <option>1–5 cases</option>
                <option>6–20 cases</option>
                <option>21–50 cases</option>
                <option>50+ cases</option>
              </select>
            </div>
          </div>
          <label style={labelStyle} htmlFor="t-message">Enquiry details *</label>
          <textarea style={{ ...fieldStyle, resize: "vertical", lineHeight: 1.55, marginBottom: 16 }} id="t-message" name="message" rows={4} required onFocus={focusGold} onBlur={blurGold} />
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 20 }}>
            <input type="checkbox" id="t-gdpr" required style={{ marginTop: 3, accentColor: "var(--gold)" }} />
            <label htmlFor="t-gdpr" style={{ fontSize: ".8rem", color: "var(--muted)", lineHeight: 1.5 }}>
              I agree to the <a href="/privacy" style={{ color: "var(--goldHi)" }}>Privacy Policy</a> and consent to being contacted for trade purposes.
            </label>
          </div>
          <button type="submit" style={submitStyle}>Submit Trade Enquiry</button>
        </form>
      </div>
    </div>
  );
}
