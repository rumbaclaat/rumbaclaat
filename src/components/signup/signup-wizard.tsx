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

// Per-tier name colour, mapped onto the champagne palette.
function tierColor(name: string): string {
  if (name === "Bronze") return "var(--bronze)";
  if (name === "Silver") return "#C0C0C0";
  return "var(--goldHi)";
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

// ---- Champagne design-language tokens (inline-style objects) ----

const ERR_BOX: React.CSSProperties = {
  background: "rgba(242,109,109,.12)",
  border: "1px solid rgba(242,109,109,.35)",
  color: "var(--red)",
  borderRadius: 10,
  padding: "12px 14px",
  fontSize: ".85rem",
};

const PANEL: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--line2)",
  borderRadius: 18,
  padding: "30px 30px 32px",
};

const EYEBROW: React.CSSProperties = {
  fontSize: ".74rem",
  letterSpacing: ".24em",
  textTransform: "uppercase",
  color: "var(--gold)",
  fontWeight: 600,
};

const HEADING: React.CSSProperties = {
  fontFamily: "var(--serif)",
  fontWeight: 600,
  fontSize: "clamp(1.6rem,3.4vw,2.1rem)",
  lineHeight: 1.1,
  color: "var(--text)",
  margin: "10px 0 0",
};

const INTRO: React.CSSProperties = {
  color: "var(--muted)",
  fontSize: ".96rem",
  lineHeight: 1.6,
  margin: "12px 0 0",
};

const LABEL: React.CSSProperties = {
  display: "block",
  color: "var(--muted)",
  fontSize: ".78rem",
  marginBottom: 6,
};

const FIELD: React.CSSProperties = {
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

const HINT: React.CSSProperties = {
  display: "block",
  fontSize: ".74rem",
  color: "var(--dim)",
  marginTop: 6,
};

const BTN_GOLD: React.CSSProperties = {
  background: "var(--gold)",
  color: "var(--onGold)",
  border: "none",
  borderRadius: 999,
  padding: "13px 30px",
  fontSize: ".92rem",
  fontWeight: 600,
  cursor: "pointer",
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
};

const BTN_OUTLINE: React.CSSProperties = {
  background: "transparent",
  border: "1px solid var(--gold)",
  color: "var(--goldHi)",
  borderRadius: 999,
  padding: "12px 24px",
  fontSize: ".9rem",
  fontWeight: 600,
  cursor: "pointer",
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
};

const STEP_LINE: React.CSSProperties = {
  flex: "1 1 auto",
  height: 1,
  margin: "0 6px 18px",
  background: "var(--line2)",
};

// .step-circle base + per-state colours mapped onto the champagne palette.
function stepCircleStyle(state: "done" | "active" | "pending"): React.CSSProperties {
  const base: React.CSSProperties = {
    width: 34,
    height: 34,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: "1.5px",
    borderStyle: "solid",
    fontSize: ".85rem",
    fontWeight: 700,
  };
  if (state === "done")
    return { ...base, background: "rgba(111,207,151,.15)", borderColor: "rgba(111,207,151,.4)", color: "var(--green)" };
  if (state === "active")
    return { ...base, background: "var(--gold)", borderColor: "var(--gold)", color: "var(--onGold)" };
  return { ...base, background: "var(--surface2)", borderColor: "var(--line2)", color: "var(--dim)" };
}

const STEP_LABEL: React.CSSProperties = {
  fontSize: ".64rem",
  letterSpacing: ".06em",
  color: "var(--dim)",
  marginTop: 7,
};

export default function SignupWizard({ tiers }: { tiers: WizardTier[] }) {
  const params = useSearchParams();
  const presetName = params?.get("tier") ?? "";
  const presetTier = tiers.find((t) => t.name === presetName);

  const [step, setStep] = useState(1);
  const [tier, setTier] = useState<WizardTier | null>(presetTier ?? null);
  const [hoverSlug, setHoverSlug] = useState<string | null>(null);
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

  const circleState = (n: number): "done" | "active" | "pending" =>
    n < step ? "done" : n === step ? "active" : "pending";

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

  const STEPS = ["Choose Tier", "Create Account", "Payment", "Confirm"] as const;

  return (
    <section style={{ padding: "clamp(40px,5vw,64px) clamp(20px,5vw,40px) clamp(72px,9vw,110px)" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <h1 className="visually-hidden">Join Rumbaclaat Membership</h1>

        {/* Step bar */}
        <ol
          className="list-unstyled"
          style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", margin: "0 0 36px", padding: 0 }}
          aria-label="Signup progress"
        >
          {STEPS.map((label, i) => {
            const n = i + 1;
            const state = circleState(n);
            return (
              <li key={label} style={{ display: "contents" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={stepCircleStyle(state)} aria-current={step === n ? "step" : undefined}>
                    {state === "done" ? <i className="bi bi-check-lg" /> : n}
                  </span>
                  <span style={STEP_LABEL}>{label}</span>
                </div>
                {n < STEPS.length && <span style={STEP_LINE} aria-hidden="true" />}
              </li>
            );
          })}
        </ol>

        {/* Step 1: Tier */}
        {step === 1 && (
          <section aria-labelledby="su1h" style={PANEL}>
            <span style={EYEBROW}>Membership</span>
            <h2 id="su1h" style={HEADING}>Choose your tier</h2>
            <p style={INTRO}>Select the membership that suits you. You can change tier any time.</p>

            <fieldset style={{ border: 0, padding: 0, margin: "24px 0 0" }}>
              <legend className="visually-hidden">Membership tier</legend>
              <div
                role="radiogroup"
                aria-label="Membership tier"
                style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}
              >
                {tiers.map((t) => {
                  const selected = tier?.slug === t.slug;
                  const lit = selected || hoverSlug === t.slug;
                  return (
                    <button
                      key={t.slug}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setTier(t)}
                      onMouseEnter={() => setHoverSlug(t.slug)}
                      onMouseLeave={() => setHoverSlug(null)}
                      style={{
                        textAlign: "left",
                        borderRadius: 14,
                        padding: "18px 20px",
                        border: `1.5px solid ${lit ? "var(--gold)" : "var(--line2)"}`,
                        background: lit ? "var(--goldLt)" : "var(--surface2)",
                        width: "100%",
                        height: "100%",
                        cursor: "pointer",
                        display: "block",
                      }}
                    >
                      <span style={{ color: tierColor(t.name), fontFamily: "var(--serif)", fontSize: "1.25rem", fontWeight: 700 }}>
                        {t.name}
                      </span>
                      <span style={{ display: "block", fontFamily: "var(--serif)", fontSize: "1.5rem", color: "var(--text)", marginTop: 2 }}>
                        {priceLabel(t, "monthly")}
                        {!t.isFree && <span style={{ fontSize: ".875rem", color: "var(--muted)" }}>/mo</span>}
                      </span>
                      <span style={{ display: "block", fontSize: ".75rem", color: "var(--muted)", marginTop: 6 }}>
                        {fmtMultiplier(t.pointsMultiplier)} points · {t.memberDiscountPct}% discount
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {tier && !tier.isFree && (
              <div style={{ marginTop: 20 }}>
                <span style={LABEL}>Billing period</span>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }} role="group" aria-label="Billing period">
                  <button
                    type="button"
                    aria-pressed={billing === "monthly"}
                    onClick={() => setBilling("monthly")}
                    style={billing === "monthly" ? { ...BTN_GOLD, padding: "9px 18px", fontSize: ".84rem" } : { ...BTN_OUTLINE, padding: "9px 18px", fontSize: ".84rem" }}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    aria-pressed={billing === "annual"}
                    onClick={() => setBilling("annual")}
                    style={billing === "annual" ? { ...BTN_GOLD, padding: "9px 18px", fontSize: ".84rem" } : { ...BTN_OUTLINE, padding: "9px 18px", fontSize: ".84rem" }}
                  >
                    Annual (save 2 months)
                  </button>
                </div>
              </div>
            )}

            {errTier && (
              <p role="alert" style={{ ...ERR_BOX, margin: "20px 0 0" }}>{errTier}</p>
            )}
            <button type="button" style={{ ...BTN_GOLD, width: "100%", marginTop: 24 }} onClick={continueFromTier}>
              Continue <i className="bi bi-arrow-right" />
            </button>
          </section>
        )}

        {/* Step 2: Account */}
        {step === 2 && (
          <section aria-labelledby="su2h" style={PANEL}>
            <span style={EYEBROW}>Create account</span>
            <h2 id="su2h" style={{ ...HEADING, marginBottom: 20 }}>Create your account</h2>
            {errAccount && (
              <div role="alert" style={{ ...ERR_BOX, marginBottom: 16 }}>{errAccount}</div>
            )}
            <form onSubmit={submitAccount} noValidate>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={LABEL} htmlFor="su-fname">First name *</label>
                  <input style={FIELD} id="su-fname" autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                </div>
                <div>
                  <label style={LABEL} htmlFor="su-lname">Last name *</label>
                  <input style={FIELD} id="su-lname" autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={LABEL} htmlFor="su-email">Email *</label>
                <input style={FIELD} type="email" id="su-email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={LABEL} htmlFor="su-pw">Password *</label>
                <input style={FIELD} type="password" id="su-pw" autoComplete="new-password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
                <span style={HINT}>Minimum 8 characters.</span>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={LABEL} htmlFor="su-dob">Date of birth *</label>
                <input style={FIELD} type="date" id="su-dob" autoComplete="bday" value={dob} onChange={(e) => setDob(e.target.value)} required />
                <span style={HINT}>You must be 18 or over to join.</span>
              </div>
              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: ".8125rem", color: "var(--muted)", lineHeight: 1.5, cursor: "pointer" }}>
                <input type="checkbox" id="su-terms" checked={terms} onChange={(e) => setTerms(e.target.checked)} required style={{ marginTop: 2, accentColor: "var(--gold)" }} />
                <span>
                  I am 18+ and agree to the <a href="/terms" style={{ color: "var(--goldHi)" }}>Terms</a> and <a href="/privacy" style={{ color: "var(--goldHi)" }}>Privacy Policy</a>.
                </span>
              </label>
              <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
                <button type="button" style={BTN_OUTLINE} onClick={() => goTo(1)}>
                  <i className="bi bi-arrow-left" /> Back
                </button>
                <button type="submit" style={{ ...BTN_GOLD, flex: "1 1 auto" }}>
                  Continue <i className="bi bi-arrow-right" />
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Step 3: Payment */}
        {step === 3 && tier && (
          <section aria-labelledby="su3h" style={PANEL}>
            <span style={EYEBROW}>Payment</span>
            <h2 id="su3h" style={{ ...HEADING, marginBottom: 18 }}>Payment</h2>

            <div style={{ background: "var(--goldLt)", border: "1px solid var(--line)", borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                <span style={{ fontSize: ".8125rem", color: "var(--muted)" }}>{tier.name} Membership</span>
                <span style={{ fontFamily: "var(--serif)", fontSize: "1.25rem", fontWeight: 700, color: "var(--goldHi)" }}>{priceLabel(tier, billing)}</span>
              </div>
              <p style={{ fontSize: ".75rem", color: "var(--dim)", margin: "4px 0 0" }}>
                {isFree ? "No charge" : billing === "monthly" ? "per month" : "per year — 2 months free"}
              </p>
            </div>

            {isFree ? (
              <p style={{ color: "var(--muted)", fontSize: ".9rem", lineHeight: 1.6 }}>
                Bronze is free — no payment needed. Click continue to finish.
              </p>
            ) : (
              <div>
                {errPay && (
                  <div role="alert" style={{ ...ERR_BOX, marginBottom: 16 }}>{errPay}</div>
                )}
                <form noValidate onSubmit={(e) => e.preventDefault()}>
                  <div style={{ marginBottom: 16 }}>
                    <label style={LABEL} htmlFor="su-card">Card number *</label>
                    <input style={FIELD} id="su-card" inputMode="numeric" autoComplete="cc-number" maxLength={19} placeholder="1234 5678 9012 3456" value={card} onChange={(e) => setCard(e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim())} required />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={LABEL} htmlFor="su-cardname">Name on card *</label>
                    <input style={FIELD} id="su-cardname" autoComplete="cc-name" value={cardName} onChange={(e) => setCardName(e.target.value)} required />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={LABEL} htmlFor="su-exp">Expiry *</label>
                      <input style={FIELD} id="su-exp" autoComplete="cc-exp" placeholder="MM/YY" maxLength={5} value={exp} onChange={(e) => { const d = e.target.value.replace(/\D/g, "").slice(0, 4); setExp(d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d); }} required />
                    </div>
                    <div>
                      <label style={LABEL} htmlFor="su-cvv">CVV *</label>
                      <input style={FIELD} type="password" id="su-cvv" inputMode="numeric" maxLength={4} autoComplete="cc-csc" value={cvv} onChange={(e) => setCvv(e.target.value)} required />
                    </div>
                  </div>
                  <p style={{ fontSize: ".72rem", color: "var(--dim)", margin: "16px 0 0", display: "flex", alignItems: "center", gap: 6 }}>
                    <i className="bi bi-lock" /> Payment is simulated in this demo. No card is charged.
                  </p>
                </form>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button type="button" style={BTN_OUTLINE} onClick={() => goTo(2)}>
                <i className="bi bi-arrow-left" /> Back
              </button>
              <button type="button" style={{ ...BTN_GOLD, flex: "1 1 auto", opacity: submitting ? 0.7 : 1, cursor: submitting ? "default" : "pointer" }} onClick={complete} disabled={submitting}>
                {submitting ? "Creating account…" : "Complete Sign-Up"}
              </button>
            </div>
          </section>
        )}

        {/* Step 4: Done */}
        {step === 4 && (
          <section aria-labelledby="su4h" style={{ ...PANEL, textAlign: "center", padding: "clamp(40px,6vw,56px) 28px" }}>
            <div style={{ fontSize: "2.6rem", marginBottom: 14, color: "var(--gold)" }} aria-hidden="true">
              <i className="bi bi-stars" />
            </div>
            <span style={{ ...EYEBROW, display: "block", marginBottom: 12 }}>Welcome to RPM</span>
            <h2 id="su4h" style={{ ...HEADING, margin: "0 0 12px" }}>You&apos;re all set!</h2>
            <p style={{ color: "var(--muted)", fontSize: ".96rem", lineHeight: 1.6, maxWidth: 420, margin: "0 auto 28px" }}>
              Your <strong style={{ color: "var(--goldHi)" }}>{tier?.name ?? "Bronze"}</strong> membership is active. We&apos;ve sent a confirmation to your email — check your inbox to verify your account.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="/account" style={BTN_GOLD}>Go to Member Portal</a>
              <a href="/shop" style={BTN_OUTLINE}>Start Shopping <i className="bi bi-arrow-right" /></a>
            </div>
          </section>
        )}
      </div>
    </section>
  );
}
