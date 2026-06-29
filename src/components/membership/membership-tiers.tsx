"use client";

import Link from "next/link";
import { useState } from "react";

type Tier = {
  name: string;
  blurb: string;
  monthly: string;
  annual: string;
  free?: boolean;
  multiplier: string;
  perks: string[];
  cta: string;
  popular?: boolean;
  primary?: boolean;
  border: string;
};

const TIERS: Tier[] = [
  { name: "Bronze", blurb: "Start your journey — always free", monthly: "Free", annual: "Free", free: true, multiplier: "1× points", perks: ["5% member discount", "Birthday bonus points", "Early email access", "Members newsletter"], cta: "Join Free →", border: "rgba(205,127,50,.25)" },
  { name: "Silver", blurb: "For the committed rum enthusiast", monthly: "£9.99", annual: "£89.99", multiplier: "1.5× points", perks: ["10% member discount", "Early drop access (24hrs)", "Free UK standard shipping", "Exclusive cocktail recipes"], cta: "Get Silver →", border: "rgba(192,192,192,.25)" },
  { name: "Gold", blurb: "The premium Rumbaclaat experience", monthly: "£24.99", annual: "£224.99", multiplier: "2× points", perks: ["15% member discount", "Early drop access (48hrs)", "Free UK express shipping", "Annual gift bottle", "Tasting event invitations"], cta: "Get Gold →", popular: true, primary: true, border: "rgba(205, 181, 130,.45)" },
  { name: "Black Reserve", blurb: "Unrivalled access. The inner circle.", monthly: "£54.99", annual: "£499.99", multiplier: "3× points", perks: ["20% member discount", "Priority drop access (72hrs)", "Free worldwide shipping", "Private distillery visits", "Concierge service", "Bespoke bottle engraving"], cta: "Get Black Reserve →", border: "rgba(205, 181, 130,.35)" },
];

export default function MembershipTiers() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const period = billing === "monthly" ? "per month" : "per year — 2 months free";

  return (
    <div className="container" id="plans">
      <div className="text-center reveal mb-4">
        <span className="eyebrow">Membership Plans</span>
        <h2>Choose your tier</h2>
        <div className="d-flex justify-content-center mt-3">
          <div className="billing-toggle" role="group" aria-label="Billing period">
            <button type="button" className={`btn btn-sm ${billing === "monthly" ? "btn-gold" : "btn-outline-gold"}`} aria-pressed={billing === "monthly"} onClick={() => setBilling("monthly")}>Monthly</button>
            <button type="button" className={`btn btn-sm ${billing === "annual" ? "btn-gold" : "btn-outline-gold"}`} aria-pressed={billing === "annual"} onClick={() => setBilling("annual")}>Annual (save 2 months)</button>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {TIERS.map((t) => (
          <div className="col-12 col-md-6 col-lg-3" key={t.name}>
            <div className="tier-card reveal" style={{ background: "linear-gradient(135deg,#1C1C24,#15151B)", border: `${t.primary ? "2px" : "1px"} solid ${t.border}` }}>
              {t.popular && <div style={{ textAlign: "center", padding: "6px 0", background: "var(--gold)", fontSize: ".6875rem", fontWeight: 700, color: "#0E0E12", letterSpacing: ".1em" }}>MOST POPULAR</div>}
              <div className="tier-body">
                <h2 className="h3" style={{ color: "var(--gold-hi)", fontSize: "1.5rem", marginBottom: 4 }}>{t.name}</h2>
                <p style={{ fontSize: ".8125rem", marginBottom: 20 }}>{t.blurb}</p>
                <div className="price" style={{ fontSize: "2.5rem", marginBottom: 4 }}>{t.free ? "Free" : billing === "monthly" ? t.monthly : t.annual}</div>
                <p style={{ fontSize: ".75rem" }}>{t.free ? "Always free" : period}</p>
                <div className="badge-brand my-3">⚡ {t.multiplier}</div>
                <ul className="tier-list list-unstyled mt-1">
                  {t.perks.map((p) => <li key={p}>{p}</li>)}
                </ul>
              </div>
              <div className="tier-foot">
                <Link href={`/signup?tier=${encodeURIComponent(t.name)}`} className={`btn ${t.primary ? "btn-gold" : "btn-outline-gold"} w-100`}>{t.cta}</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-center" style={{ marginTop: 24, fontSize: ".8125rem", color: "var(--text-dim)" }}>All paid tiers include a 14-day money-back guarantee · Cancel anytime · GBP incl. VAT</p>
    </div>
  );
}
