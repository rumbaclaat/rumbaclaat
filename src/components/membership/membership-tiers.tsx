"use client";

import Link from "next/link";

type Tier = {
  name: string;
  price: string;
  sub: string;
  perks: string[];
  featured: boolean;
};

const TIERS: Tier[] = [
  { name: "Bronze", price: "Free", sub: "Always free", perks: ["5% member discount", "1× points on every order", "Birthday treat", "Member newsletter"], featured: false },
  { name: "Silver", price: "£9.99", sub: "per month", perks: ["10% member discount", "1.5× points", "Early access to drops", "Free standard shipping"], featured: false },
  { name: "Gold", price: "£24.99", sub: "per month", perks: ["15% member discount", "2× points", "Exclusive bottlings", "Tasting event invites", "Free express shipping"], featured: true },
  { name: "Black Reserve", price: "£54.99", sub: "per month", perks: ["20% member discount", "3× points", "Concierge service", "Private cask access", "All Gold perks included"], featured: false },
];

function cardStyle(featured: boolean): React.CSSProperties {
  return {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    background: featured ? "linear-gradient(165deg, rgba(205,181,130,.16), var(--card))" : "var(--card)",
    border: `1px solid ${featured ? "var(--gold)" : "var(--line2)"}`,
    borderRadius: "18px",
    padding: "28px 24px",
  };
}

function btnStyle(featured: boolean): React.CSSProperties {
  return featured
    ? { background: "var(--gold)", color: "var(--onGold)", border: "1px solid var(--gold)" }
    : { background: "transparent", color: "var(--text)", border: "1px solid var(--line)" };
}

export default function MembershipTiers() {
  return (
    <section id="plans" style={{ padding: "clamp(20px,3vw,32px) clamp(20px,5vw,40px) clamp(56px,7vw,80px)" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18, alignItems: "start" }} className="mem-tier-grid">
        {TIERS.map((t) => (
          <div key={t.name} style={cardStyle(t.featured)}>
            {t.featured && (
              <span style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", background: "var(--gold)", color: "var(--onGold)", fontSize: ".64rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", borderRadius: 999, padding: "4px 13px", whiteSpace: "nowrap" }}>
                Most popular
              </span>
            )}
            <div style={{ fontSize: ".74rem", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--dim)" }}>{t.name}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 10 }}>
              <span style={{ fontFamily: "var(--serif)", fontSize: "2rem", color: "var(--text)", lineHeight: 1 }}>{t.price}</span>
              <span style={{ color: "var(--dim)", fontSize: ".78rem" }}>{t.sub}</span>
            </div>
            <Link
              href={`/account?tier=${encodeURIComponent(t.name)}`}
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", marginTop: 18, borderRadius: 999, padding: 11, fontSize: ".86rem", fontWeight: 600, cursor: "pointer", textDecoration: "none", whiteSpace: "nowrap", ...btnStyle(t.featured) }}
            >
              Choose plan
            </Link>
            <div style={{ height: 1, background: "var(--line2)", margin: "20px 0" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {t.perks.map((perk) => (
                <span key={perk} style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: ".85rem", color: "var(--muted)", lineHeight: 1.4 }}>
                  <i className="bi bi-check-lg" style={{ color: "var(--gold)", marginTop: 1 }} />
                  {perk}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
