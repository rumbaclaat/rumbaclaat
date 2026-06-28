"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { registerCustomer } from "@/app/(site)/account/actions";

export type WizardTier = {
  name: string;
  slug: string;
  priceMonthly: number;
  priceAnnual: number;
  pointsMultiplier: number;
  memberDiscountPct: number;
  isFree: boolean;
};

type Billing = "monthly" | "annual";

// Per-tier name colour, reproduced from static-source/signup.html (lines 116–119).
function tierColor(name: string): string {
  if (name === "Bronze") return "var(--bronze)";
  if (name === "Silver") return "#C0C0C0";
  return "var(--gold-hi)";
}

function fmtMultiplier(m: number): string {
  // 1 -> "1×", 1.5 -> "1.5×", 2 -> "2×"
  return `${Number.isInteger(m) ? m : m.toString()}×`;
}

function priceLabel(t: WizardTier, billing: Billing): string {
  if (t.isFree) return "Free";
  const p = billing === "monthly" ? t.priceMonthly : t.priceAnnual;
  return `£${p.toFixed(2)}`;
}

const ERR_BOX: React.CSSProperties = {
  background: "rgba(242,109,109,.12)",
  border: "1px solid rgba(242,109,109,.35)",
  color: "var(--red)",
  borderRadius: "var(--radius)",
};

const STEP_LINE: React.CSSProperties = {
  width: 40,
  height: 1,
  margin: "0 4px 16px",
  background: "var(--gold-bdr)",
};

export default function SignupWizard({ tiers }: { tiers: WizardTier[] }) {
  const params = useSearchParams();
  const presetName = params?.get("tier") ?? "";
  const presetTier = tiers.find((t) => t.name === presetName);

  const [step, setStep] = useState(1);
  const [tier, setTier] = useState<WizardTier | null>(presetTier ?? null);
  const [billing, setBilling] = useState<Billing>("monthly");

  // Step 2 account fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState("");
  const [terms, setTerms] = useState(false);

  // Step 3 card fields (simulated)
  const [card, setCard] = useState("");
  const [cardName, setCardName] = useState("");
  const [exp, setExp] = useState("");
  const [cvv, setCvv] = useState("");

  const [errTier, setErrTier] = useState("");
  const [errAccount, setErrAccount] = useState("");
  const [errPay, setErrPay] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isFree = !tier || tier.isFree;

  const circleClass = (n: number) =>
    `step-circle ${n < step ? "done" : n === step ? "active" : "pending"}`;

  function goTo(n: number) {
    setStep(n);
  }

  function continueFromTier() {
    if (!tier) {
      setErrTier("Please choose a membership tier.");
      return;
    }
    setErrTier("");
    setStep(2);
  }

  function submitAccount(e: React.FormEvent) {
    e.preventDefault();
    const missing: string[] = [];
    if (!firstName.trim()) missing.push("First name");
    if (!lastName.trim()) missing.push("Last name");
    if (!email.trim()) missing.push("Email");
    if (password.length < 8) missing.push("Password");
    if (!dob.trim()) missing.push("Date of birth");
    if (!terms) missing.push("Terms");
    if (missing.length) {
      setErrAccount("Please complete: " + missing.join(", ") + ".");
      return;
    }
    // 18+ check
    if (dob) {
      const eighteen = new Date();
      eighteen.setFullYear(eighteen.getFullYear() - 18);
      if (new Date(dob) > eighteen) {
        setErrAccount("You must be 18 or over to join.");
        return;
      }
    }
    setErrAccount("");
    setStep(3);
  }

  async function complete() {
    if (!tier) return;
    if (!isFree) {
      const missing: string[] = [];
      if (!card.trim()) missing.push("Card number");
      if (!cardName.trim()) missing.push("Name on card");
      if (!exp.trim()) missing.push("Expiry");
      if (!cvv.trim()) missing.push("CVV");
      if (missing.length) {
        setErrPay("Please complete: " + missing.join(", ") + ".");
        return;
      }
    }
    setErrPay("");
    setSubmitting(true);
    const fd = new FormData();
    fd.set("firstName", firstName);
    fd.set("lastName", lastName);
    fd.set("email", email);
    fd.set("password", password);
    fd.set("dateOfBirth", dob);
    // Real account creation via existing server action. On success it
    // redirects to /account?registered=1 (matches "Go to Member Portal").
    await registerCustomer(fd);
    setSubmitting(false);
  }

  return (
    <div className="container section" style={{ maxWidth: 680 }}>
      <h1 className="visually-hidden">Join Rumbaclaat Membership</h1>

      <ol className="step-bar list-unstyled" aria-label="Signup progress">
        <li className="d-flex flex-column align-items-center">
          <span className={circleClass(1)} aria-current={step === 1 ? "step" : undefined}>1</span>
          <span className="step-label">Choose Tier</span>
        </li>
        <li style={STEP_LINE} aria-hidden="true" />
        <li className="d-flex flex-column align-items-center">
          <span className={circleClass(2)} aria-current={step === 2 ? "step" : undefined}>2</span>
          <span className="step-label">Create Account</span>
        </li>
        <li style={STEP_LINE} aria-hidden="true" />
        <li className="d-flex flex-column align-items-center">
          <span className={circleClass(3)} aria-current={step === 3 ? "step" : undefined}>3</span>
          <span className="step-label">Payment</span>
        </li>
        <li style={STEP_LINE} aria-hidden="true" />
        <li className="d-flex flex-column align-items-center">
          <span className={circleClass(4)} aria-current={step === 4 ? "step" : undefined}>✓</span>
          <span className="step-label">Confirm</span>
        </li>
      </ol>

      {/* Step 1: Tier */}
      {step === 1 && (
        <section aria-labelledby="su1h">
          <div className="card-brand">
            <h2 id="su1h" className="h3 mb-2">Choose your tier</h2>
            <p className="mb-4">Select the membership that suits you. You can change tier any time.</p>
            <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
              <legend className="visually-hidden">Membership tier</legend>
              <div className="row g-3" role="radiogroup" aria-label="Membership tier">
                {tiers.map((t) => {
                  const selected = tier?.slug === t.slug;
                  return (
                    <div className="col-12 col-sm-6" key={t.slug}>
                      <button
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setTier(t)}
                        className="d-block w-100 text-start"
                        style={{
                          borderRadius: 16,
                          padding: 20,
                          border: `1.5px solid ${selected ? "var(--gold)" : "var(--gold-bdr)"}`,
                          background: selected ? "var(--gold-lt)" : "var(--bg-card)",
                          height: "100%",
                          cursor: "pointer",
                        }}
                      >
                        <span style={{ color: tierColor(t.name), fontFamily: "var(--serif)", fontSize: "1.25rem", fontWeight: 700 }}>{t.name}</span>
                        <span className="d-block" style={{ fontFamily: "var(--serif)", fontSize: "1.5rem" }}>
                          {priceLabel(t, "monthly")}
                          {!t.isFree && <span style={{ fontSize: ".875rem", color: "var(--text-muted)" }}>/mo</span>}
                        </span>
                        <span className="d-block" style={{ fontSize: ".75rem", color: "var(--text-muted)", marginTop: 6 }}>
                          {fmtMultiplier(t.pointsMultiplier)} points · {t.memberDiscountPct}% discount
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </fieldset>

            {tier && !tier.isFree && (
              <div className="mt-3">
                <span className="form-label d-block">Billing period</span>
                <div className="d-flex gap-2" role="group" aria-label="Billing period">
                  <button type="button" className={`btn btn-sm ${billing === "monthly" ? "btn-gold" : "btn-outline-gold"}`} aria-pressed={billing === "monthly"} onClick={() => setBilling("monthly")}>Monthly</button>
                  <button type="button" className={`btn btn-sm ${billing === "annual" ? "btn-gold" : "btn-outline-gold"}`} aria-pressed={billing === "annual"} onClick={() => setBilling("annual")}>Annual (save 2 months)</button>
                </div>
              </div>
            )}

            {errTier && (
              <p className="alert mt-3" role="alert" style={ERR_BOX}>{errTier}</p>
            )}
            <button type="button" className="btn btn-gold w-100 mt-4" onClick={continueFromTier}>Continue →</button>
          </div>
        </section>
      )}

      {/* Step 2: Account */}
      {step === 2 && (
        <section aria-labelledby="su2h">
          <div className="card-brand">
            <h2 id="su2h" className="h3 mb-4">Create your account</h2>
            {errAccount && (
              <div className="alert" role="alert" style={ERR_BOX}>{errAccount}</div>
            )}
            <form onSubmit={submitAccount} noValidate>
              <div className="row g-3">
                <div className="col-sm-6"><label className="form-label" htmlFor="su-fname">First name *</label><input className="form-control" id="su-fname" autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required /></div>
                <div className="col-sm-6"><label className="form-label" htmlFor="su-lname">Last name *</label><input className="form-control" id="su-lname" autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} required /></div>
                <div className="col-12"><label className="form-label" htmlFor="su-email">Email *</label><input className="form-control" type="email" id="su-email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                <div className="col-12"><label className="form-label" htmlFor="su-pw">Password *</label><input className="form-control" type="password" id="su-pw" autoComplete="new-password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required /><span style={{ fontSize: ".75rem", color: "var(--text-dim)" }}>Minimum 8 characters.</span></div>
                <div className="col-12"><label className="form-label" htmlFor="su-dob">Date of birth *</label><input className="form-control" type="date" id="su-dob" autoComplete="bday" value={dob} onChange={(e) => setDob(e.target.value)} required /><span style={{ fontSize: ".75rem", color: "var(--text-dim)" }}>You must be 18 or over to join.</span></div>
                <div className="col-12"><div className="form-check"><input className="form-check-input" type="checkbox" id="su-terms" checked={terms} onChange={(e) => setTerms(e.target.checked)} required /><label className="form-check-label" htmlFor="su-terms" style={{ fontSize: ".8125rem", color: "var(--text-muted)" }}>I am 18+ and agree to the <a href="/terms" className="gold">Terms</a> and <a href="/privacy" className="gold">Privacy Policy</a>.</label></div></div>
              </div>
              <div className="d-flex gap-2 mt-4">
                <button type="button" className="btn btn-outline-gold" onClick={() => goTo(1)}>← Back</button>
                <button type="submit" className="btn btn-gold flex-grow-1">Continue →</button>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* Step 3: Payment */}
      {step === 3 && tier && (
        <section aria-labelledby="su3h">
          <div className="card-brand">
            <h2 id="su3h" className="h3 mb-3">Payment</h2>
            <div style={{ background: "var(--gold-lt)", border: "1px solid var(--gold-md)", borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <div className="d-flex justify-content-between">
                <span style={{ fontSize: ".8125rem", color: "var(--text-muted)" }}>{tier.name} Membership</span>
                <span style={{ fontFamily: "var(--serif)", fontSize: "1.25rem", fontWeight: 700, color: "var(--gold-hi)" }}>{priceLabel(tier, billing)}</span>
              </div>
              <p style={{ fontSize: ".75rem", color: "var(--text-dim)", margin: "4px 0 0" }}>
                {isFree ? "No charge" : billing === "monthly" ? "per month" : "per year — 2 months free"}
              </p>
            </div>

            {isFree ? (
              <div><p>Bronze is free — no payment needed. Click continue to finish.</p></div>
            ) : (
              <div>
                {errPay && (
                  <div className="alert" role="alert" style={ERR_BOX}>{errPay}</div>
                )}
                <form noValidate onSubmit={(e) => e.preventDefault()}>
                  <div className="mb-3"><label className="form-label" htmlFor="su-card">Card number *</label><input className="form-control" id="su-card" inputMode="numeric" autoComplete="cc-number" maxLength={19} placeholder="1234 5678 9012 3456" value={card} onChange={(e) => setCard(e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim())} required /></div>
                  <div className="mb-3"><label className="form-label" htmlFor="su-cardname">Name on card *</label><input className="form-control" id="su-cardname" autoComplete="cc-name" value={cardName} onChange={(e) => setCardName(e.target.value)} required /></div>
                  <div className="row g-3">
                    <div className="col-6"><label className="form-label" htmlFor="su-exp">Expiry *</label><input className="form-control" id="su-exp" autoComplete="cc-exp" placeholder="MM/YY" maxLength={5} value={exp} onChange={(e) => { const d = e.target.value.replace(/\D/g, "").slice(0, 4); setExp(d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d); }} required /></div>
                    <div className="col-6"><label className="form-label" htmlFor="su-cvv">CVV *</label><input className="form-control" type="password" id="su-cvv" inputMode="numeric" maxLength={4} autoComplete="cc-csc" value={cvv} onChange={(e) => setCvv(e.target.value)} required /></div>
                  </div>
                  <p style={{ fontSize: ".6875rem", color: "var(--text-dim)", margin: "16px 0" }}>🔒 Payment is simulated in this demo. No card is charged.</p>
                </form>
              </div>
            )}

            <div className="d-flex gap-2 mt-2">
              <button type="button" className="btn btn-outline-gold" onClick={() => goTo(2)}>← Back</button>
              <button type="button" className="btn btn-gold flex-grow-1" onClick={complete} disabled={submitting}>{submitting ? "Creating account…" : "Complete Sign-Up"}</button>
            </div>
          </div>
        </section>
      )}

      {/* Step 4: Done */}
      {step === 4 && (
        <section aria-labelledby="su4h">
          <div className="card-brand text-center" style={{ padding: "48px 24px" }}>
            <div style={{ fontSize: "3rem", marginBottom: 16, color: "var(--gold)" }} aria-hidden="true">✦</div>
            <p style={{ fontSize: ".6875rem", letterSpacing: ".3em", color: "var(--gold-hi)", marginBottom: 12 }}>WELCOME TO RPM</p>
            <h2 id="su4h" className="mb-3">You&apos;re all set!</h2>
            <p style={{ maxWidth: 420, margin: "0 auto 28px" }}>Your <strong style={{ color: "var(--gold-hi)" }}>{tier?.name ?? "Bronze"}</strong> membership is active. We&apos;ve sent a confirmation to your email — check your inbox to verify your account.</p>
            <div className="d-flex gap-2 justify-content-center flex-wrap">
              <a href="/account" className="btn btn-gold">Go to Member Portal</a>
              <a href="/shop" className="btn btn-outline-gold">Start Shopping →</a>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
