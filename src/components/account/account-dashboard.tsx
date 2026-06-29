"use client";

import { useState } from "react";
import Link from "next/link";

type Tier = {
  id: string;
  name: string;
  slug: string;
  priceMonthly: number;
  priceAnnual: number;
  pointsMultiplier: number;
  memberDiscountPct: number;
  isFree: boolean;
  benefits: string[];
  sortOrder: number;
};
type Reward = {
  id: string;
  name: string;
  description: string | null;
  pointsCost: number;
  type: string;
  availability: string;
};
type Order = { id: string; ref: string; date: string; total: number; status: string };
type Ledger = { id: string; date: string; label: string; delta: number; balanceAfter: number };
type Address = {
  id: string;
  line1: string;
  line2: string | null;
  city: string;
  postcode: string;
  country: string;
  isDefault: boolean;
};
type ServerAction = (formData: FormData) => void | Promise<void>;

export type AccountDashboardProps = {
  customer: {
    firstName: string | null;
    lastName: string | null;
    email: string;
    phone: string | null;
    dob: string | null;
    pointsBalance: number;
    lifetimeSpend: number;
    referralCode: string | null;
  };
  currentTierId: string | null;
  tier: Tier | null;
  tiers: Tier[];
  orders: Order[];
  rewards: Reward[];
  ledger: Ledger[];
  addresses: Address[];
  flash: { ok: boolean; message: string } | null;
  actions: {
    signOut: ServerAction;
    subscribe: ServerAction;
    redeem: ServerAction;
    updateDetails: ServerAction;
    saveAddress: ServerAction;
  };
};

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "orders", label: "Orders" },
  { id: "tiers", label: "Tiers" },
  { id: "manage", label: "Manage Tier" },
  { id: "earn", label: "Earn Points" },
  { id: "rewards", label: "Rewards" },
  { id: "refer", label: "Refer & Earn" },
  { id: "prefs", label: "Preferences" },
] as const;

function tierKey(t: { slug: string; name: string }) {
  const s = `${t.slug} ${t.name}`.toLowerCase();
  if (s.includes("bronze")) return "bronze";
  if (s.includes("silver")) return "silver";
  if (s.includes("gold")) return "gold";
  return "black";
}
const TIER_STYLE: Record<string, { color: string; grad?: string; border: string }> = {
  bronze: { color: "#CD7F32", grad: "linear-gradient(135deg,#2A1800,#1A1200)", border: "rgba(205,127,50,.25)" },
  silver: { color: "#C0C0C0", border: "rgba(192,192,192,.2)" },
  gold: { color: "var(--gold-hi)", border: "var(--gold)" },
  black: { color: "var(--gold-hi)", grad: "linear-gradient(135deg,#0E0E12,#15151B)", border: "rgba(205, 181, 130,.35)" },
};
// Points thresholds keyed to each tier's RPM identity (presentation label only —
// the tier model carries no threshold field; live tier data still drives everything else).
const TIER_THRESHOLD: Record<string, number> = {
  bronze: 0,
  silver: 1000,
  gold: 2500,
  black: 5000,
};

export default function AccountDashboard(props: AccountDashboardProps) {
  const { customer, tier, tiers, orders, rewards, addresses, flash, actions } = props;
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("overview");
  // Subscriptions default to monthly billing; the Manage Tier flow applies the chosen tier.
  const [cycle] = useState<"monthly" | "annual">("monthly");
  const [editAddr, setEditAddr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const mult = tier ? tier.pointsMultiplier : 1;
  const refLink = customer.referralCode
    ? `https://rumbaclaat.com/ref/${customer.referralCode}`
    : null;

  // Tiers ordered by points threshold so we can find the member's "next tier up".
  const orderedTiers = [...tiers].sort(
    (a, b) => TIER_THRESHOLD[tierKey(a)] - TIER_THRESHOLD[tierKey(b)],
  );
  const currentIdx = props.currentTierId
    ? orderedTiers.findIndex((t) => t.id === props.currentTierId)
    : 0;
  const nextTier = currentIdx >= 0 ? orderedTiers[currentIdx + 1] : orderedTiers[1];
  const pointsToNext = nextTier
    ? Math.max(0, TIER_THRESHOLD[tierKey(nextTier)] - customer.pointsBalance)
    : 0;
  // Progress bar fills from the current tier's threshold toward the next tier's.
  const currentThreshold = currentIdx >= 0 ? TIER_THRESHOLD[tierKey(orderedTiers[currentIdx])] : 0;
  const tierProgressPct = nextTier
    ? Math.min(
        100,
        Math.max(
          0,
          Math.round(
            ((customer.pointsBalance - currentThreshold) /
              (TIER_THRESHOLD[tierKey(nextTier)] - currentThreshold || 1)) *
              100,
          ),
        ),
      )
    : 100;

  // Prototype stat grid (lines 635-642) — 4 cards driven by live data + bi icons.
  const acctStats = [
    { label: "Points balance", value: customer.pointsBalance.toLocaleString(), icon: "stars" },
    { label: "Tier discount", value: `${tier?.memberDiscountPct ?? 5}%`, icon: "tag" },
    {
      label: "Points to next",
      value: nextTier ? pointsToNext.toLocaleString() : "—",
      icon: "graph-up-arrow",
    },
    { label: "Lifetime spend", value: `£${customer.lifetimeSpend.toFixed(0)}`, icon: "wallet2" },
  ];

  // Prototype "Recent orders" status chip (line 653, {{ o.badge.style }}/{{ o.badge.label }}).
  function orderBadge(status: string): { style: React.CSSProperties; label: string } {
    const base: React.CSSProperties = {
      borderRadius: 999,
      padding: "4px 12px",
      fontSize: ".74rem",
      fontWeight: 600,
      whiteSpace: "nowrap",
    };
    const s = status.toLowerCase();
    if (s === "delivered" || s === "completed" || s === "fulfilled") {
      return { style: { ...base, background: "rgba(74,222,128,.12)", color: "var(--green)" }, label: status };
    }
    if (s === "cancelled" || s === "refunded" || s === "failed") {
      return { style: { ...base, background: "rgba(242,109,109,.12)", color: "var(--red)" }, label: status };
    }
    return { style: { ...base, background: "var(--goldLt)", color: "var(--goldHi)" }, label: status };
  }

  function copyLink() {
    if (!refLink) return;
    navigator.clipboard?.writeText(refLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <section style={{ padding: "clamp(40px,5vw,64px) clamp(20px,5vw,40px) clamp(72px,9vw,110px)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header — prototype lines 626-633 */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 20,
            flexWrap: "wrap",
            marginBottom: 30,
          }}
        >
          <div>
            <span
              style={{
                fontSize: ".74rem",
                letterSpacing: ".22em",
                textTransform: "uppercase",
                color: "var(--gold)",
                fontWeight: 600,
              }}
            >
              Inner Circle
            </span>
            <h1
              style={{
                fontFamily: "var(--serif)",
                fontWeight: 600,
                fontSize: "clamp(2rem,4.4vw,3rem)",
                lineHeight: 1.05,
                margin: "10px 0 0",
              }}
            >
              Welcome back, {customer.firstName ?? "member"}
            </h1>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                marginTop: 12,
                background: "var(--goldLt)",
                border: "1px solid var(--gold)",
                color: "var(--goldHi)",
                borderRadius: 999,
                padding: "5px 14px",
                fontSize: ".8rem",
                fontWeight: 600,
              }}
            >
              <i className="bi bi-award-fill" />
              {tier?.name ?? "Bronze"} member
            </div>
          </div>
          <form action={actions.signOut}>
            <button
              type="submit"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "transparent",
                border: "1px solid var(--line)",
                color: "var(--muted)",
                borderRadius: 999,
                padding: "10px 20px",
                fontSize: ".86rem",
                cursor: "pointer",
              }}
            >
              <i className="bi bi-box-arrow-right" />
              Sign out
            </button>
          </form>
        </div>

        {flash && (
          <div
            role="status"
            className="mb-4"
            style={{
              background: flash.ok ? "rgba(74,222,128,.12)" : "rgba(242,109,109,.12)",
              border: `1px solid ${flash.ok ? "rgba(74,222,128,.35)" : "rgba(242,109,109,.35)"}`,
              color: flash.ok ? "var(--green)" : "var(--red)",
              borderRadius: 10,
              padding: "10px 14px",
              fontSize: ".875rem",
            }}
          >
            {flash.message}
          </div>
        )}

        {/* Stat cards — prototype lines 635-642 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 16,
            marginBottom: 30,
          }}
        >
          {acctStats.map((s) => (
            <div
              key={s.label}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--line2)",
                borderRadius: 14,
                padding: "20px 22px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: ".7rem", letterSpacing: ".08em", textTransform: "uppercase", color: "var(--dim)" }}>
                  {s.label}
                </span>
                <i className={`bi bi-${s.icon}`} style={{ color: "var(--gold)", fontSize: "1rem" }} />
              </div>
              <div style={{ fontFamily: "var(--serif)", fontSize: "2.1rem", color: "var(--text)", lineHeight: 1, marginTop: 12 }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Tab nav */}
        <ul className="nav nav-pills gap-2 mb-4" role="tablist" aria-label="Account sections">
          {TABS.map((t) => (
            <li className="nav-item" role="presentation" key={t.id}>
              <button
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                className={`nav-link${tab === t.id ? " active" : ""}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            </li>
          ))}
        </ul>

        {/* ---------------- OVERVIEW (prototype lines 644-679) ---------------- */}
        {tab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20, alignItems: "start" }}>
            {/* Recent orders */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--line2)", borderRadius: 16, overflow: "hidden" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "18px 22px",
                  borderBottom: "1px solid var(--line2)",
                }}
              >
                <h2 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "1.3rem", margin: 0 }}>Recent orders</h2>
                <Link href="/shop" style={{ color: "var(--muted)", fontSize: ".82rem" }}>
                  Shop again
                </Link>
              </div>
              {orders.length === 0 ? (
                <div style={{ padding: "22px", color: "var(--dim)", fontSize: ".88rem" }}>
                  No orders yet. <Link href="/shop" className="gold">Start shopping →</Link>
                </div>
              ) : (
                orders.slice(0, 3).map((o) => {
                  const badge = orderBadge(o.status);
                  return (
                    <div
                      key={o.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto auto",
                        gap: 16,
                        alignItems: "center",
                        padding: "16px 22px",
                        borderBottom: "1px solid var(--line2)",
                      }}
                    >
                      <div>
                        <div style={{ color: "var(--goldHi)", fontWeight: 600, fontSize: ".92rem" }}>{o.ref}</div>
                        <div style={{ color: "var(--dim)", fontSize: ".78rem", marginTop: 2 }}>{o.date}</div>
                      </div>
                      <span style={badge.style}>{badge.label}</span>
                      <div style={{ fontFamily: "var(--serif)", fontSize: "1.2rem", color: "var(--text)", minWidth: 80, textAlign: "right" }}>
                        £{o.total.toFixed(2)}
                      </div>
                    </div>
                  );
                })
              )}
              <div style={{ padding: "16px 22px" }}>
                <button
                  type="button"
                  onClick={() => setTab("orders")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    background: "transparent",
                    border: 0,
                    padding: 0,
                    color: "var(--goldHi)",
                    fontWeight: 600,
                    fontSize: ".86rem",
                    cursor: "pointer",
                  }}
                >
                  View all orders <i className="bi bi-arrow-right" />
                </button>
              </div>
            </div>

            {/* Membership + Account sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div
                style={{
                  background: "linear-gradient(165deg, rgba(205,181,130,.15), var(--card))",
                  border: "1px solid var(--gold)",
                  borderRadius: 16,
                  padding: 24,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h3 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "1.25rem", margin: 0 }}>
                    {tier?.name ?? "Bronze"} membership
                  </h3>
                  <i className="bi bi-award-fill" style={{ color: "var(--gold)", fontSize: "1.3rem" }} />
                </div>
                <div style={{ margin: "16px 0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".8rem", color: "var(--muted)", marginBottom: 7 }}>
                    <span>{nextTier ? `Progress to ${nextTier.name}` : "Top tier reached"}</span>
                    <span>
                      {nextTier
                        ? `${customer.pointsBalance.toLocaleString()} / ${TIER_THRESHOLD[tierKey(nextTier)].toLocaleString()}`
                        : "All benefits unlocked"}
                    </span>
                  </div>
                  <div style={{ height: 8, borderRadius: 999, background: "var(--surface2)", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${tierProgressPct}%`,
                        borderRadius: 999,
                        background: "linear-gradient(90deg,var(--gold),var(--goldHi))",
                      }}
                    />
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}>
                  {(tier?.benefits ?? []).slice(0, 6).map((perk, i) => (
                    <span
                      key={i}
                      style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: ".85rem", color: "var(--muted)", lineHeight: 1.4 }}
                    >
                      <i className="bi bi-check-lg" style={{ color: "var(--gold)", marginTop: 1 }} />
                      {perk}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setTab("manage")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    marginTop: 20,
                    background: "var(--gold)",
                    color: "var(--onGold)",
                    border: 0,
                    borderRadius: 999,
                    padding: 11,
                    fontSize: ".86rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Manage membership
                </button>
              </div>

              <div style={{ background: "var(--surface)", border: "1px solid var(--line2)", borderRadius: 16, padding: "22px 24px" }}>
                <h3 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "1.2rem", margin: "0 0 14px" }}>Account</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <AccountLink icon="geo-alt" label="Addresses" onClick={() => setTab("prefs")} bordered />
                  <AccountLink icon="credit-card" label="Payment methods" onClick={() => setTab("prefs")} bordered />
                  <AccountLink icon="gift" label="Rewards & points" onClick={() => setTab("rewards")} bordered />
                  <AccountLink icon="gear" label="Settings" onClick={() => setTab("prefs")} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- ORDERS ---------------- */}
        {tab === "orders" && (
          <div className="card-brand">
            <h2 className="h4 mb-3">Order history</h2>
            {orders.length === 0 ? (
              <p style={{ color: "var(--text-dim)", margin: 0 }}>
                No orders yet. <Link href="/shop" className="gold">Start shopping →</Link>
              </p>
            ) : (
              <div className="table-responsive">
                <table className="m-table" style={{ fontVariantNumeric: "tabular-nums" }}>
                  <thead>
                    <tr>
                      <th>Ref</th>
                      <th>Date</th>
                      <th style={{ textAlign: "right" }}>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td className="gold">{o.ref}</td>
                        <td>{o.date}</td>
                        <td style={{ textAlign: "right" }}>£{o.total.toFixed(2)}</td>
                        <td style={{ textTransform: "capitalize" }}>{o.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ---------------- TIERS (comparison grid) ---------------- */}
        {tab === "tiers" && (
          <>
            <div className="card-brand mb-3" style={{ borderColor: "var(--gold-md)" }}>
              <p className="serif" style={{ fontSize: "1rem", fontWeight: 600, color: "var(--gold-hi)", marginBottom: 6 }}>
                ✦ {tier?.name ?? "Bronze"} — Your Current Tier
              </p>
              <p style={{ margin: 0, color: "var(--text-muted)" }}>
                {nextTier ? (
                  <>
                    You need <strong style={{ color: "var(--text)" }}>{pointsToNext.toLocaleString()} more points</strong> to reach {nextTier.name}.
                    Keep shopping and referring to advance your tier.
                  </>
                ) : (
                  <>You’ve reached the top tier — enjoy every benefit available.</>
                )}
              </p>
            </div>
            <div className="row g-4">
              {orderedTiers.map((t) => {
                const k = tierKey(t);
                const st = TIER_STYLE[k];
                const current = t.id === props.currentTierId;
                const threshold = TIER_THRESHOLD[k];
                return (
                  <div className="col-6 col-lg-3" key={t.id}>
                    <div
                      className="card-brand h-100"
                      style={{
                        position: "relative",
                        background: st.grad,
                        border: current ? "2px solid var(--gold)" : `1px solid ${st.border}`,
                      }}
                    >
                      {current && (
                        <div
                          style={{
                            position: "absolute",
                            top: -12,
                            left: "50%",
                            transform: "translateX(-50%)",
                            background: "var(--gold)",
                            color: "#0E0E12",
                            fontSize: ".625rem",
                            fontWeight: 700,
                            padding: "4px 12px",
                            borderRadius: 999,
                            whiteSpace: "nowrap",
                          }}
                        >
                          YOUR TIER
                        </div>
                      )}
                      <div style={{ color: st.color, fontSize: "1.5rem", margin: current ? "8px 0 10px" : "0 0 10px" }}>✦</div>
                      <h3 className="serif" style={{ fontSize: "1.25rem", fontWeight: 700, color: st.color, marginBottom: 4 }}>
                        {t.name}
                      </h3>
                      <p style={{ fontSize: ".7rem", color: "var(--text-dim)" }}>{threshold.toLocaleString()}+ pts</p>
                      <span
                        className={`badge-brand my-2 d-inline-flex${current ? " badge-gold" : ""}`}
                        style={current ? undefined : { color: st.color, borderColor: st.border }}
                      >
                        {t.pointsMultiplier}× points
                      </span>
                      <ul style={{ fontSize: ".75rem", color: "var(--text-muted)", listStyle: "none", padding: 0, margin: 0 }}>
                        <li className="mb-1">{t.memberDiscountPct}% member discount</li>
                        {t.benefits.slice(0, 4).map((b, i) => (
                          <li className="mb-1" key={i}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ---------------- MANAGE TIER ---------------- */}
        {tab === "manage" && (
          <>
            <div
              className="card-brand mb-4 d-flex align-items-center gap-3 flex-wrap"
              style={{ borderColor: "var(--gold-md)" }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "var(--gold-lt)",
                  border: "1px solid var(--gold-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span style={{ color: "var(--gold-hi)", fontSize: "1.5rem" }}>✦</span>
              </div>
              <div className="flex-grow-1">
                <p style={{ fontSize: ".75rem", color: "var(--text-muted)" }}>YOUR CURRENT TIER</p>
                <h2 className="h3" style={{ color: "var(--gold-hi)" }}>
                  {tier?.name ?? "Bronze"}
                  {tier && !tier.isFree ? ` — £${tier.priceMonthly.toFixed(2)}/mo` : tier?.isFree ? " — Free" : ""}
                </h2>
                <p style={{ fontSize: ".75rem", margin: 0 }}>
                  {mult}× points · {customer.pointsBalance.toLocaleString()} pts balance
                </p>
              </div>
            </div>
            <p style={{ fontSize: ".6875rem", letterSpacing: ".18em", color: "var(--text-muted)", marginBottom: 16 }}>
              ALL TIERS — UPGRADE OR DOWNGRADE
            </p>
            <div className="row g-4">
              {orderedTiers.map((t) => {
                const k = tierKey(t);
                const st = TIER_STYLE[k];
                const current = t.id === props.currentTierId;
                const idx = orderedTiers.findIndex((x) => x.id === t.id);
                const isUp = idx > currentIdx;
                const priceLabel = t.isFree ? "Free" : `£${t.priceMonthly.toFixed(2)}/mo`;
                const cardStyle: React.CSSProperties = current
                  ? { border: "2px solid var(--gold)", position: "relative" }
                  : { background: st.grad, borderColor: st.border };
                const body = (
                  <>
                    {current && (
                      <div
                        style={{
                          position: "absolute",
                          top: -10,
                          left: "50%",
                          transform: "translateX(-50%)",
                          background: "var(--gold)",
                          color: "#0E0E12",
                          fontSize: ".5875rem",
                          fontWeight: 700,
                          padding: "3px 10px",
                          borderRadius: 999,
                        }}
                      >
                        CURRENT
                      </div>
                    )}
                    <div className={`d-flex align-items-center justify-content-between mb-2${current ? " mt-2" : ""}`}>
                      <span className="serif" style={{ color: st.color, fontWeight: 700 }}>{t.name}</span>
                      <span className="serif" style={{ fontWeight: 700 }}>{priceLabel}</span>
                    </div>
                    <p style={{ fontSize: ".75rem", color: "var(--text-muted)", margin: current ? 0 : "0 0 10px" }}>
                      {t.pointsMultiplier}× points · {t.memberDiscountPct}% discount
                    </p>
                    {!current && (
                      <span style={{ fontSize: ".75rem", color: isUp ? "var(--gold-hi)" : "var(--text-dim)" }}>
                        {isUp ? "↑ Upgrade →" : "↓ Downgrade"}
                      </span>
                    )}
                  </>
                );
                return (
                  <div className="col-6 col-lg-3" key={t.id}>
                    {current ? (
                      <div className="card-brand h-100" style={cardStyle}>{body}</div>
                    ) : (
                      <form action={actions.subscribe} className="h-100">
                        <input type="hidden" name="tierId" value={t.id} />
                        <input type="hidden" name="billingCycle" value={cycle} />
                        <button type="submit" className="card-brand w-100 text-start h-100" style={cardStyle}>
                          {body}
                        </button>
                      </form>
                    )}
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize: ".75rem", color: "var(--text-dim)", textAlign: "center", marginTop: 20 }}>
              Upgrades are immediate. Downgrades take effect at end of billing period. Cancel anytime.
            </p>
          </>
        )}

        {/* ---------------- EARN ---------------- */}
        {tab === "earn" && (
          <>
            <div className="card-brand mb-3" style={{ borderColor: "var(--gold-md)" }}>
              <p className="serif" style={{ fontSize: "1rem", fontWeight: 600, color: "var(--gold-hi)", margin: 0 }}>
                ⚡ Your multiplier: {mult}× — {tier?.name ?? "Bronze"} member
              </p>
              <p style={{ fontSize: ".875rem", margin: "4px 0 0", color: "var(--text-muted)" }}>
                Purchase points are multiplied by {mult}×. Upgrade your tier to earn faster.
              </p>
            </div>
            <div className="card-brand p-0" style={{ overflow: "hidden" }}>
              <div className="table-responsive">
                <table className="m-table">
                  <caption className="visually-hidden">Ways to earn points</caption>
                  <thead>
                    <tr>
                      <th scope="col">Action</th>
                      <th scope="col">Base points</th>
                      <th scope="col">Your rate</th>
                      <th scope="col">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["🥃 Purchase rum", "Per bottle", `×${mult} applied`, "Based on your tier multiplier"],
                      ["👕 Buy apparel", "Per item", `×${mult} applied`, "Multiplied by tier rate"],
                      ["👥 Refer a friend", "500 pts", "Fixed", "When they make their first purchase"],
                      ["⭐ Leave a review", "50 pts", "Fixed", "On any verified purchase"],
                      ["📱 Follow on social", "100 pts", "Fixed", "One-time bonus per platform"],
                      ["🎂 Birthday bonus", "200 pts", "Fixed", "Credited on your birthday"],
                    ].map((row) => (
                      <tr key={row[0]}>
                        <td>{row[0]}</td>
                        <td><strong className="serif" style={{ color: "var(--gold-hi)" }}>{row[1]}</strong></td>
                        <td>{row[2]}</td>
                        <td style={{ color: "var(--text-muted)" }}>{row[3]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ---------------- REWARDS ---------------- */}
        {tab === "rewards" && (
          <>
            <div className="card-brand mb-4 d-inline-flex align-items-center gap-3" style={{ padding: "14px 20px" }}>
              <div>
                <p style={{ fontSize: ".75rem", color: "var(--text-muted)", margin: 0 }}>Available to redeem</p>
                <p className="serif" style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--gold-hi)", lineHeight: 1, margin: 0 }}>
                  {customer.pointsBalance.toLocaleString()} pts
                </p>
              </div>
            </div>
            <div className="row g-4">
              {rewards.map((r) => {
                const soon = r.availability === "coming_soon";
                const affordable = customer.pointsBalance >= r.pointsCost && r.availability === "available";
                return (
                  <div className="col-12 col-md-6 col-lg-4" key={r.id}>
                    <div className="reward-card h-100 d-flex flex-column" style={soon ? { opacity: 0.6 } : undefined}>
                      <span className="badge-brand mb-2 d-inline-flex" style={{ textTransform: "capitalize", alignSelf: "flex-start" }}>
                        {r.type}
                      </span>
                      <p className="serif" style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: 6 }}>{r.name}</p>
                      {r.description && (
                        <p style={{ fontSize: ".8125rem", color: "var(--text-muted)", margin: "0 0 10px", lineHeight: 1.6 }}>
                          {r.description}
                        </p>
                      )}
                      <p className="serif" style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--gold-hi)", margin: "auto 0 14px" }}>
                        {r.pointsCost.toLocaleString()} pts
                      </p>
                      {soon ? (
                        <button type="button" className="btn btn-outline-gold w-100 btn-sm" disabled>Coming soon</button>
                      ) : (
                        <form action={actions.redeem}>
                          <input type="hidden" name="rewardId" value={r.id} />
                          <button type="submit" className="btn btn-gold w-100 btn-sm" disabled={!affordable}>
                            {affordable ? "Redeem now" : "Not enough points"}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ---------------- REFER ---------------- */}
        {tab === "refer" && (
          <>
            <div className="card-brand mb-3" style={{ borderColor: "var(--gold-md)" }}>
              <p className="serif" style={{ fontSize: "1rem", fontWeight: 600, color: "var(--gold-hi)", marginBottom: 4 }}>
                🎁 Refer a friend — earn 500 points each
              </p>
              <p style={{ margin: 0, fontSize: ".875rem", color: "var(--text-muted)" }}>
                Share your unique code. When your friend makes their first purchase, you both receive 500 points.
              </p>
            </div>
            <div className="card-brand">
              <div className="d-flex justify-content-between flex-wrap gap-3 pb-3 mb-3" style={{ borderBottom: "1px solid var(--gold-bdr)" }}>
                <div>
                  <p className="serif" style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--gold-hi)", margin: 0 }}>RUMBACLAAT</p>
                  <p style={{ fontSize: ".75rem", margin: 0, color: "var(--text-muted)" }}>Referral programme · earn together</p>
                </div>
                <div className="text-end">
                  <p className="serif" style={{ fontSize: "1rem", fontWeight: 600, margin: 0 }}>YOUR CODE</p>
                  <p className="serif" style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--gold-hi)", letterSpacing: ".06em", margin: 0 }}>
                    {customer.referralCode ?? "—"}
                  </p>
                </div>
              </div>
              {refLink ? (
                <div className="d-flex gap-3 align-items-center flex-wrap">
                  <label className="visually-hidden" htmlFor="ref-link">Your referral link</label>
                  <input id="ref-link" className="form-control flex-grow-1" value={refLink} readOnly style={{ minWidth: 0 }} />
                  <button type="button" className="btn btn-gold btn-sm" onClick={copyLink}>
                    {copied ? "Copied ✓" : "Copy link"}
                  </button>
                </div>
              ) : (
                <p style={{ fontSize: ".875rem", color: "var(--text-muted)", margin: 0 }}>
                  Your referral code will appear here once your account is fully set up.
                </p>
              )}
            </div>
          </>
        )}

        {/* ---------------- PREFERENCES ---------------- */}
        {tab === "prefs" && (
          <div className="row g-4">
            <div className="col-12 col-lg-6">
              <div className="card-brand h-100">
                <h2 className="h4 mb-3">Personal details</h2>
                <form action={actions.updateDetails}>
                  <div className="row g-3">
                    <div className="col-sm-6">
                      <label className="form-label" htmlFor="p-first">First name</label>
                      <input className="form-control" id="p-first" name="firstName" defaultValue={customer.firstName ?? ""} autoComplete="given-name" />
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label" htmlFor="p-last">Last name</label>
                      <input className="form-control" id="p-last" name="lastName" defaultValue={customer.lastName ?? ""} autoComplete="family-name" />
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label" htmlFor="p-email">Email</label>
                      <input className="form-control" id="p-email" type="email" value={customer.email} readOnly style={{ opacity: 0.6 }} />
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label" htmlFor="p-phone">Phone</label>
                      <input className="form-control" id="p-phone" name="phone" type="tel" defaultValue={customer.phone ?? ""} autoComplete="tel" />
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label" htmlFor="p-dob">Date of birth</label>
                      <input className="form-control" id="p-dob" name="dateOfBirth" type="date" defaultValue={customer.dob ?? ""} />
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label" htmlFor="p-tier">Membership tier</label>
                      <input className="form-control" id="p-tier" value={tier?.name ?? "Bronze"} readOnly style={{ opacity: 0.6 }} />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-gold mt-3">Save details</button>
                </form>
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div className="card-brand h-100">
                <h2 className="h4 mb-3">Notifications</h2>
                <div className="form-check mb-2">
                  <input className="form-check-input" type="checkbox" id="n1" defaultChecked />
                  <label className="form-check-label" htmlFor="n1" style={{ fontSize: ".875rem" }}>New drop announcements</label>
                </div>
                <div className="form-check mb-2">
                  <input className="form-check-input" type="checkbox" id="n2" defaultChecked />
                  <label className="form-check-label" htmlFor="n2" style={{ fontSize: ".875rem" }}>Points &amp; tier updates</label>
                </div>
                <div className="form-check mb-2">
                  <input className="form-check-input" type="checkbox" id="n3" />
                  <label className="form-check-label" htmlFor="n3" style={{ fontSize: ".875rem" }}>Marketing emails</label>
                </div>
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="n4" defaultChecked />
                  <label className="form-check-label" htmlFor="n4" style={{ fontSize: ".875rem" }}>Order updates</label>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div className="card-brand h-100">
                <h2 className="h4 mb-3">Addresses</h2>
                {addresses.map((a) => (
                  <div key={a.id} className="d-flex justify-content-between align-items-start gap-2 pb-3 mb-3" style={{ borderBottom: "1px solid var(--gold-bdr)" }}>
                    <div style={{ fontSize: ".875rem", color: "var(--text-muted)" }}>
                      {a.isDefault && <span className="badge-brand mb-1 d-inline-flex">Default</span>}
                      <p style={{ margin: "4px 0 0", color: "var(--text)" }}>{a.line1}{a.line2 ? `, ${a.line2}` : ""}</p>
                      <p style={{ margin: 0 }}>{a.city}, {a.postcode}</p>
                      <p style={{ margin: 0 }}>{a.country}</p>
                    </div>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditAddr(editAddr === a.id ? null : a.id)}>
                      {editAddr === a.id ? "Cancel" : "Edit"}
                    </button>
                  </div>
                ))}

                <form action={actions.saveAddress}>
                  {editAddr && <input type="hidden" name="addressId" value={editAddr} />}
                  {(() => {
                    const a = addresses.find((x) => x.id === editAddr);
                    return (
                      <>
                        <p className="form-label" style={{ fontWeight: 600 }}>{a ? "Edit address" : "Add an address"}</p>
                        <div className="row g-2">
                          <div className="col-12">
                            <input className="form-control" name="line1" placeholder="Address line 1" defaultValue={a?.line1 ?? ""} key={`l1-${editAddr ?? "new"}`} autoComplete="address-line1" />
                          </div>
                          <div className="col-12">
                            <input className="form-control" name="line2" placeholder="Address line 2 (optional)" defaultValue={a?.line2 ?? ""} key={`l2-${editAddr ?? "new"}`} autoComplete="address-line2" />
                          </div>
                          <div className="col-6">
                            <input className="form-control" name="city" placeholder="City" defaultValue={a?.city ?? ""} key={`ci-${editAddr ?? "new"}`} autoComplete="address-level2" />
                          </div>
                          <div className="col-6">
                            <input className="form-control" name="postcode" placeholder="Postcode" defaultValue={a?.postcode ?? ""} key={`pc-${editAddr ?? "new"}`} autoComplete="postal-code" />
                          </div>
                          <div className="col-12">
                            <input className="form-control" name="country" placeholder="Country" defaultValue={a?.country ?? "United Kingdom"} key={`co-${editAddr ?? "new"}`} autoComplete="country-name" />
                          </div>
                        </div>
                        <div className="form-check mt-2">
                          <input className="form-check-input" type="checkbox" name="isDefault" id="addr-default" value="1" defaultChecked={a?.isDefault ?? addresses.length === 0} key={`df-${editAddr ?? "new"}`} />
                          <label className="form-check-label" htmlFor="addr-default" style={{ fontSize: ".8125rem" }}>Set as default delivery address</label>
                        </div>
                        <button type="submit" className="btn btn-outline-gold btn-sm mt-3">{a ? "Save address" : "Add address"}</button>
                      </>
                    );
                  })()}
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// Prototype "Account" sidebar links (lines 671-676) — route to live tabs/sections.
function AccountLink({
  icon,
  label,
  onClick,
  bordered,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  bordered?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 11,
        padding: "10px 0",
        color: "var(--muted)",
        fontSize: ".9rem",
        cursor: "pointer",
        background: "transparent",
        border: 0,
        textAlign: "left",
        width: "100%",
        borderBottom: bordered ? "1px solid var(--line2)" : "none",
      }}
    >
      <i className={`bi bi-${icon}`} />
      {label}
    </button>
  );
}
