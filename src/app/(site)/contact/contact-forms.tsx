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
      <div
        className="card-brand contact-success"
        tabIndex={-1}
        aria-live="polite"
        style={{ textAlign: "center", padding: 40 }}
      >
        <div
          className="contact-success-icon"
          aria-hidden="true"
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "var(--gold-lt)",
            border: "1px solid var(--gold-md)",
            color: "var(--gold-hi)",
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
        <span className="eyebrow eyebrow-center">MESSAGE RECEIVED</span>
        <h2 style={{ fontSize: "clamp(1.75rem,4vw,2.5rem)", fontFamily: "var(--serif)", fontWeight: 600, margin: "8px 0 12px" }}>
          Thanks {success.firstName ? `${success.firstName}, ` : ""}— we&apos;ve got your {success.type}
        </h2>
        <p style={{ fontSize: "1.0625rem", color: "var(--text-muted)", maxWidth: 520, margin: "0 auto 18px" }}>
          Reference <strong style={{ color: "var(--gold-hi)", fontFamily: "var(--serif)" }}>{success.ref}</strong>.
          {" "}We&apos;ll reply to <strong style={{ color: "var(--text)" }}>{success.email || "your email"}</strong> within one working day.
        </p>

        <div
          className="contact-success-next"
          style={{
            background: "var(--bg-card2)",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius)",
            padding: "16px 18px",
            maxWidth: 520,
            margin: "0 auto",
          }}
        >
          <p style={{ fontSize: ".6875rem", letterSpacing: ".12em", color: "var(--text-dim)", marginBottom: 8 }}>WHAT HAPPENS NEXT</p>
          <ol style={{ fontSize: ".9375rem", color: "var(--text-muted)", paddingLeft: "1.2em", margin: 0, lineHeight: 1.8, textAlign: "left" }}>
            <li>A confirmation email is on its way to your inbox now.</li>
            <li>Our team triages your enquiry within one working day.</li>
            <li>You&apos;ll receive a personal reply from the right person, not a noreply address.</li>
          </ol>
        </div>

        <div className="d-flex justify-content-center gap-2 mt-4 flex-wrap">
          <button
            type="button"
            className="btn btn-gold"
            onClick={() => {
              setSuccess(null);
              setGenError("");
              setTradeError("");
            }}
          >
            Send another message
          </button>
          <a href="/" className="btn btn-outline-gold">Back to home</a>
        </div>
      </div>
    );
  }

  return (
    <div className="card-brand reveal" id="contact-form-card">
      <ul className="nav nav-pills gap-2 mb-4" role="tablist" aria-label="Enquiry type">
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${active === "general" ? "active" : ""}`}
            id="tab-general"
            type="button"
            role="tab"
            aria-controls="pane-general"
            aria-selected={active === "general"}
            onClick={() => setActive("general")}
          >
            General Enquiry
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${active === "trade" ? "active" : ""}`}
            id="tab-trade"
            type="button"
            role="tab"
            aria-controls="pane-trade"
            aria-selected={active === "trade"}
            onClick={() => setActive("trade")}
          >
            Trade Enquiry
          </button>
        </li>
      </ul>

      <div className="tab-content">
        <div
          className={`tab-pane fade ${active === "general" ? "show active" : ""}`}
          id="pane-general"
          role="tabpanel"
          aria-labelledby="tab-general"
          hidden={active !== "general"}
        >
          {genError && (
            <div className="alert" role="alert" tabIndex={-1} style={{ background: "rgba(242,109,109,.12)", border: "1px solid rgba(242,109,109,.35)", color: "var(--red)", borderRadius: "var(--radius)" }}>
              {genError}
            </div>
          )}
          <form id="form-general" action={action} onSubmit={onSubmitGeneral} noValidate>
            <input type="hidden" name="type" value="general" />
            <div className="row g-3">
              <div className="col-sm-6">
                <label className="form-label" htmlFor="g-fname">First name *</label>
                <input className="form-control" id="g-fname" name="firstName" autoComplete="given-name" required />
              </div>
              <div className="col-sm-6">
                <label className="form-label" htmlFor="g-lname">Last name *</label>
                <input className="form-control" id="g-lname" name="lastName" autoComplete="family-name" required />
              </div>
              <div className="col-12">
                <label className="form-label" htmlFor="g-email">Email address *</label>
                <input className="form-control" type="email" id="g-email" name="email" autoComplete="email" required />
              </div>
              <div className="col-12">
                <label className="form-label" htmlFor="g-subject">Subject *</label>
                <select className="form-select" id="g-subject" name="subject" required defaultValue="">
                  <option value="">Select a subject…</option>
                  <option>Product enquiry</option>
                  <option>Order issue</option>
                  <option>Membership question</option>
                  <option>Press &amp; media</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="col-12">
                <label className="form-label" htmlFor="g-message">Message *</label>
                <textarea className="form-control" id="g-message" name="message" rows={5} required />
              </div>
              <div className="col-12">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="g-gdpr" required />
                  <label className="form-check-label" htmlFor="g-gdpr" style={{ fontSize: ".8125rem", color: "var(--text-muted)" }}>
                    I agree to the <a href="/privacy">Privacy Policy</a> and consent to being contacted.
                  </label>
                </div>
              </div>
            </div>
            <button type="submit" className="btn btn-gold w-100 mt-4">Send Message</button>
          </form>
        </div>

        <div
          className={`tab-pane fade ${active === "trade" ? "show active" : ""}`}
          id="pane-trade"
          role="tabpanel"
          aria-labelledby="tab-trade"
          hidden={active !== "trade"}
        >
          {tradeError && (
            <div className="alert" role="alert" tabIndex={-1} style={{ background: "rgba(242,109,109,.12)", border: "1px solid rgba(242,109,109,.35)", color: "var(--red)", borderRadius: "var(--radius)" }}>
              {tradeError}
            </div>
          )}
          <form id="form-trade" action={action} onSubmit={onSubmitTrade} noValidate>
            <input type="hidden" name="type" value="trade" />
            <div className="row g-3">
              <div className="col-sm-6">
                <label className="form-label" htmlFor="t-name">Contact name *</label>
                <input className="form-control" id="t-name" name="name" autoComplete="name" required />
              </div>
              <div className="col-sm-6">
                <label className="form-label" htmlFor="t-business">Business name *</label>
                <input className="form-control" id="t-business" name="business" autoComplete="organization" required />
              </div>
              <div className="col-sm-6">
                <label className="form-label" htmlFor="t-email">Email address *</label>
                <input className="form-control" type="email" id="t-email" name="email" autoComplete="email" required />
              </div>
              <div className="col-sm-6">
                <label className="form-label" htmlFor="t-phone">Phone number</label>
                <input className="form-control" type="tel" id="t-phone" name="phone" autoComplete="tel" />
              </div>
              <div className="col-12">
                <label className="form-label" htmlFor="t-btype">Business type *</label>
                <select className="form-select" id="t-btype" name="businessType" required defaultValue="">
                  <option value="">Select business type…</option>
                  <option>Restaurant / Bar</option>
                  <option>Off-licence / Retailer</option>
                  <option>Wholesale Distributor</option>
                  <option>Export / International</option>
                  <option>Hotel / Hospitality</option>
                  <option>Event / Catering</option>
                </select>
              </div>
              <div className="col-12">
                <label className="form-label" htmlFor="t-volume">Estimated monthly volume</label>
                <select className="form-select" id="t-volume" name="volume" defaultValue="">
                  <option value="">Select volume range…</option>
                  <option>1–5 cases</option>
                  <option>6–20 cases</option>
                  <option>21–50 cases</option>
                  <option>50+ cases</option>
                </select>
              </div>
              <div className="col-12">
                <label className="form-label" htmlFor="t-message">Enquiry details *</label>
                <textarea className="form-control" id="t-message" name="message" rows={4} required />
              </div>
              <div className="col-12">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="t-gdpr" required />
                  <label className="form-check-label" htmlFor="t-gdpr" style={{ fontSize: ".8125rem", color: "var(--text-muted)" }}>
                    I agree to the <a href="/privacy">Privacy Policy</a> and consent to being contacted for trade purposes.
                  </label>
                </div>
              </div>
            </div>
            <button type="submit" className="btn btn-gold w-100 mt-4">Submit Trade Enquiry</button>
          </form>
        </div>
      </div>
    </div>
  );
}
