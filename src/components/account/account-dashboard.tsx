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
  black: { color: "var(--gold-hi)", grad: "linear-gradient(135deg,#0A0A0A,#161208)", border: "rgba(198,167,94,.35)" },
};
// Points thresholds keyed to each tier's RPM identity (presentation label only —
// the tier model carries no threshold field; live tier data still drives everything else).
const TIER_THRESHOLD: Record<string, number> = {
  bronze: 0,
  silver: 1000,
  gold: 2500,
  black: 5000,
};

// .notif-item is defined only in the static source's page <style>, not theme.css,
// so reproduce its look with an inline style object.
const notifCard: React.CSSProperties = {
  background: "var(--bg-card2)",
  border: "1px solid var(--gold-bdr)",
  borderRadius: "var(--radius)",
  padding: "12px 16px",
  marginBottom: 10,
};
const notifCardUnread: React.CSSProperties = {
  ...notifCard,
  borderColor: "rgba(198,167,94,.3)",
};

export default function AccountDashboard(props: AccountDashboardProps) {
  const { customer, tier, tiers, orders, rewards, ledger, addresses, flash, actions } = props;
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("overview");
  // Subscriptions default to monthly billing; the Manage Tier flow applies the chosen tier.
  const [cycle] = useState<"monthly" | "annual">("monthly");
  const [editAddr, setEditAddr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const name = [customer.firstName, customer.lastName].filter(Boolean).join(" ") || customer.email;
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

  function copyLink() {
    if (!refLink) return;
    navigator.clipboard?.writeText(refLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <section className="section">
      <div className="container">
        {/* Header */}
        <header className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
          <div>
            <span className="eyebrow">LOYALTY PORTAL</span>
            <h1 style={{ fontSize: "2rem" }}>
              Welcome,{" "}
              <span className="serif gold" style={{ fontStyle: "italic" }}>
                {customer.firstName ?? "member"}
              </span>
            </h1>
          </div>
          <div className="d-flex gap-2 align-items-center flex-wrap">
            <span className="badge-brand">⚡ {customer.pointsBalance.toLocaleString()} pts</span>
            <span className="badge-brand badge-gold">✦ {tier?.name ?? "Bronze"}</span>
            <form action={actions.signOut}>
              <button type="submit" className="btn btn-ghost btn-sm">Sign out</button>
            </form>
          </div>
        </header>

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

        {/* Stat cards */}
        <div className="row g-3 mb-4">
          <Stat
            label="Total Points"
            value={customer.pointsBalance.toLocaleString()}
            sub={`${mult}× multiplier active`}
          />
          <Stat label="Tier Discount" value={`${tier?.memberDiscountPct ?? 5}% off`} sub="Applied at checkout" />
          <Stat
            label="Points to Next Tier"
            value={nextTier ? pointsToNext.toLocaleString() : "—"}
            sub={nextTier ? `Reach ${nextTier.name}` : "Top tier reached"}
          />
          <Stat label="Lifetime Spend" value={`£${customer.lifetimeSpend.toFixed(2)}`} sub="Thank you" />
        </div>

        {/* Progress to next tier */}
        <div className="mt-3 mb-2">
          <div
            className="d-flex justify-content-between"
            style={{ fontSize: ".75rem", color: "var(--text-muted)", marginBottom: 6 }}
          >
            <span>{nextTier ? `Progress to ${nextTier.name}` : "Top tier reached"}</span>
            <span style={{ color: "var(--gold-hi)" }}>
              {nextTier ? `${pointsToNext.toLocaleString()} pts to go` : "All benefits unlocked"}
            </span>
          </div>
          <div
            className="progress"
            role="progressbar"
            aria-label={nextTier ? `Progress to ${nextTier.name}` : "Top tier reached"}
            aria-valuenow={customer.pointsBalance}
            aria-valuemin={0}
            aria-valuemax={nextTier ? TIER_THRESHOLD[tierKey(nextTier)] : customer.pointsBalance}
            style={{ height: 6, background: "#2A2520" }}
          >
            <div
              className="progress-bar"
              style={{ width: `${tierProgressPct}%`, background: "linear-gradient(90deg,var(--gold),#D4B96B)" }}
            />
          </div>
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

        {/* ---------------- OVERVIEW ---------------- */}
        {tab === "overview" && (
          <>
            <div className="row g-4">
              <div className="col-12 col-lg-8">
                <div className="card-brand h-100">
                  <h2 className="h4 mb-3">Membership status</h2>
                  <div
                    className="d-flex justify-content-between flex-wrap gap-3"
                    style={{
                      background: "linear-gradient(135deg,#1C1A14,#161310)",
                      border: "1px solid rgba(198,167,94,.2)",
                      borderRadius: "var(--radius)",
                      padding: 20,
                      marginBottom: 16,
                    }}
                  >
                    <div>
                      <p style={{ fontSize: ".75rem", color: "var(--text-muted)", marginBottom: 4 }}>Welcome back,</p>
                      <h3 style={{ fontSize: "1.5rem" }}>{name}</h3>
                      <div className="d-flex align-items-end gap-2 mt-2">
                        <span className="serif" style={{ fontSize: "2.5rem", fontWeight: 700, color: "var(--gold-hi)", lineHeight: 1 }}>
                          {customer.pointsBalance.toLocaleString()}
                        </span>
                        <span style={{ color: "var(--text-muted)", fontSize: ".875rem" }}>points</span>
                      </div>
                    </div>
                    <div className="d-flex flex-column gap-2 align-items-end">
                      <span className="badge-brand badge-gold">✦ {tier?.name ?? "Bronze"}</span>
                      <span className="badge-brand">⚡ {mult}× multiplier</span>
                    </div>
                  </div>
                  <div className="row g-3">
                    <OverviewMini label="Tier discount" value={`${tier?.memberDiscountPct ?? 5}%`} />
                    <OverviewMini label="Points rate" value={`${mult}×`} />
                    <OverviewMini label="Referral code" value={customer.referralCode ?? "—"} />
                  </div>
                </div>
              </div>
              <div className="col-12 col-lg-4">
                <div className="card-brand h-100">
                  <div className="d-flex justify-content-between mb-3">
                    <h2 className="h4 mb-0">Notifications</h2>
                    {ledger.length > 0 && (
                      <span className="badge-brand">{Math.min(ledger.length, 2)} new</span>
                    )}
                  </div>
                  {ledger.length === 0 ? (
                    <p style={{ color: "var(--text-dim)", margin: 0, fontSize: ".875rem" }}>No points activity yet.</p>
                  ) : (
                    ledger.slice(0, 4).map((l, i) => (
                      <div key={l.id} style={i < 2 ? notifCardUnread : notifCard}>
                        <p
                          style={{
                            fontSize: ".8125rem",
                            fontWeight: i < 2 ? 600 : 400,
                            color: i < 2 ? "var(--text)" : "var(--text-muted)",
                            marginBottom: 2,
                          }}
                        >
                          {l.label}
                        </p>
                        <p style={{ fontSize: ".6875rem", color: "var(--text-dim)", margin: 0 }}>
                          {l.date} ·{" "}
                          <span style={{ color: l.delta >= 0 ? "var(--green)" : "var(--red)" }}>
                            {l.delta >= 0 ? "+" : ""}
                            {l.delta} pts
                          </span>
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="row g-4 mt-1">
              <QuickAction title="Redeem rewards" body="Use points for credits, discounts and experiences." onClick={() => setTab("rewards")} />
              <QuickAction title="Refer a friend" body="Share your code — earn 500 points each." onClick={() => setTab("refer")} />
              <QuickAction title="Shop & earn" body="Every purchase earns toward your next tier." href="/shop" />
            </div>
          </>
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
                            color: "#0E0E0E",
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
                          color: "#0E0E0E",
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

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="col-6 col-lg-3">
      <div className="card-brand h-100">
        <div style={{ fontSize: ".75rem", color: "var(--text-muted)", marginBottom: 8 }}>{label}</div>
        <div style={{ fontFamily: "var(--serif)", fontSize: "1.75rem", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
          {value}
        </div>
        <div style={{ fontSize: ".6875rem", color: "var(--green)", marginTop: 4 }}>{sub}</div>
      </div>
    </div>
  );
}

function OverviewMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="col-4">
      <p style={{ fontSize: ".75rem", color: "var(--text-muted)", margin: 0 }}>{label}</p>
      <p className="serif" style={{ fontSize: "1rem", fontWeight: 700, color: "var(--gold-hi)", margin: "2px 0 0" }}>{value}</p>
    </div>
  );
}

function QuickAction({ title, body, href, onClick }: { title: string; body: string; href?: string; onClick?: () => void }) {
  return (
    <div className="col-12 col-md-4">
      <div className="card-brand h-100">
        <p className="serif" style={{ fontSize: "1.0625rem", fontWeight: 600, marginBottom: 4 }}>{title}</p>
        <p style={{ fontSize: ".875rem", marginBottom: 14, color: "var(--text-muted)" }}>{body}</p>
        {href ? (
          <Link href={href} className="btn btn-ghost btn-sm">Shop now →</Link>
        ) : (
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClick}>Go →</button>
        )}
      </div>
    </div>
  );
}
