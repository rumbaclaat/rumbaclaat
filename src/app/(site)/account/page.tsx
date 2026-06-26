import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCustomer } from "@/lib/auth";
import AccountAuth from "@/components/account/account-auth";
import { signOutCustomer, subscribeTier, redeemReward } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Account", robots: "noindex,nofollow" };

const statLabel: React.CSSProperties = {
  fontSize: ".7rem",
  fontWeight: 600,
  letterSpacing: ".08em",
  textTransform: "uppercase",
  color: "var(--text-dim)",
};
const statNumber: React.CSSProperties = {
  fontFamily: "var(--serif)",
  fontWeight: 600,
  fontSize: "clamp(1.9rem, 4vw, 2.4rem)",
  lineHeight: 1.05,
  color: "var(--gold-hi)",
  fontVariantNumeric: "tabular-nums",
};
const sectionEyebrow: React.CSSProperties = { marginBottom: 6 };

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string; error?: string; tier?: string; redeemed?: string }>;
}) {
  const { registered, error, tier: tierFlag, redeemed } = await searchParams;
  const session = await getCustomer();

  if (!session) {
    return <AccountAuth registered={!!registered} errorCode={error} />;
  }

  const { customer } = session;
  const [tier, orders, tiers, rewards, ledger] = await Promise.all([
    customer.membershipTierId
      ? prisma.membershipTier.findUnique({ where: { id: customer.membershipTierId } })
      : null,
    prisma.order.findMany({ where: { email: customer.email }, orderBy: { placedAt: "desc" }, take: 10 }),
    prisma.membershipTier.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.reward.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.pointsLedger.findMany({ where: { customerId: customer.id }, orderBy: { createdAt: "desc" }, take: 10 }),
  ]);

  const pointsEarned = orders.reduce((s, o) => s + o.pointsEarned, 0);
  const name = [customer.firstName, customer.lastName].filter(Boolean).join(" ") || customer.email;

  return (
    <section className="section">
      <div className="container">
        {/* Header: eyebrow → serif title → tier badge + sign out */}
        <header className="d-flex align-items-start justify-content-between flex-wrap gap-3 mb-5">
          <div>
            <span className="eyebrow" style={sectionEyebrow}>Member Dashboard</span>
            <h1 style={{ marginBottom: 10 }}>
              Welcome back, <span className="serif gold" style={{ fontStyle: "italic" }}>{customer.firstName ?? "member"}</span>
            </h1>
            <span className="badge-brand">{tier?.name ?? "Bronze"} member</span>
          </div>
          <form action={signOutCustomer}>
            <button type="submit" className="btn btn-ghost btn-sm">Sign out</button>
          </form>
        </header>

        {(tierFlag || redeemed || error) && (
          <div role="status" className="mb-5" style={{ background: error ? "rgba(242,109,109,.12)" : "rgba(74,222,128,.12)", border: `1px solid ${error ? "rgba(242,109,109,.35)" : "rgba(74,222,128,.35)"}`, color: error ? "var(--red)" : "var(--green)", borderRadius: 10, padding: "10px 14px", fontSize: ".875rem" }}>
            {error === "points" ? "Not enough points for that reward." : error === "reward" ? "That reward isn't available." : tierFlag ? "Membership updated." : "Reward redeemed."}
          </div>
        )}

        {/* Stat cards — label .7rem uppercase --text-dim, big serif --gold-hi number */}
        <div className="row g-3 mb-5">
          <div className="col-6 col-lg-3">
            <div className="card-brand h-100" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={statLabel}>Membership tier</span>
              <span className="serif gold" style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "clamp(1.6rem, 3vw, 2rem)", lineHeight: 1.05 }}>{tier?.name ?? "Bronze"}</span>
            </div>
          </div>
          <div className="col-6 col-lg-3">
            <div className="card-brand h-100" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={statLabel}>Points earned</span>
              <span style={statNumber}>{pointsEarned}</span>
            </div>
          </div>
          <div className="col-6 col-lg-3">
            <div className="card-brand h-100" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={statLabel}>Orders placed</span>
              <span style={statNumber}>{orders.length}</span>
            </div>
          </div>
          <div className="col-6 col-lg-3">
            <div className="card-brand h-100" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={statLabel}>Member discount</span>
              <span style={statNumber}>{tier?.memberDiscountPct ?? 5}%</span>
            </div>
          </div>
        </div>

        {/* Recent orders (main) + membership rail (two-column) */}
        <div className="row g-4">
          <div className="col-12 col-lg-8">
            <div className="card-brand h-100">
              <span className="eyebrow" style={sectionEyebrow}>Order history</span>
              <h2 className="serif" style={{ fontSize: "1.5rem", margin: "0 0 18px" }}>Recent orders</h2>
              {orders.length === 0 ? (
                <p style={{ color: "var(--text-dim)", margin: 0 }}>No orders yet. <Link href="/shop" className="gold">Start shopping →</Link></p>
              ) : (
                <div className="table-responsive">
                  <table className="m-table" style={{ fontVariantNumeric: "tabular-nums" }}>
                    <thead><tr><th>Ref</th><th>Date</th><th style={{ textAlign: "right" }}>Total</th><th>Status</th></tr></thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o.id}>
                          <td className="gold">{o.ref}</td>
                          <td>{new Date(o.placedAt).toLocaleDateString("en-GB")}</td>
                          <td style={{ textAlign: "right" }}>£{Number(o.total).toFixed(2)}</td>
                          <td style={{ textTransform: "capitalize" }}>{o.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="col-12 col-lg-4">
            <div className="card-brand card-brand--feature h-100">
              <span className="eyebrow" style={sectionEyebrow}>Your details</span>
              <h2 className="serif" style={{ fontSize: "1.5rem", margin: "0 0 14px" }}>Membership</h2>
              <p style={{ margin: "0 0 4px", fontWeight: 600 }}>{name}</p>
              <p style={{ fontSize: ".875rem", color: "var(--text-muted)", margin: 0 }}>{customer.email}</p>
              <hr style={{ borderColor: "var(--gold-bdr)", margin: "18px 0" }} />
              <p style={{ fontSize: ".875rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 18 }}>
                {tier && !tier.isFree
                  ? `You're on ${tier.name}.`
                  : "Upgrade for bigger discounts and faster points."}
              </p>
              <Link href="/join" className="btn btn-outline-gold btn-sm w-100">View all plans</Link>
            </div>
          </div>
        </div>

        {/* Membership tiers */}
        <div className="mt-5 pt-4">
          <span className="eyebrow" style={sectionEyebrow}>Plans</span>
          <h2 className="serif" style={{ fontSize: "clamp(1.6rem, 3vw, 2.1rem)", margin: "0 0 22px" }}>Your membership</h2>
          <div className="row g-3">
            {tiers.map((t) => {
              const current = t.id === customer.membershipTierId;
              return (
                <div className="col-6 col-lg-3" key={t.id}>
                  <div className={`card-brand h-100 text-center${current ? " card-brand--feature" : ""}`}>
                    <div className="serif gold" style={{ fontSize: "1.2rem" }}>{t.name}</div>
                    <div className="serif" style={{ fontSize: "1.5rem", fontVariantNumeric: "tabular-nums", marginTop: 4 }}>{t.isFree ? "Free" : `£${Number(t.priceMonthly).toFixed(2)}/mo`}</div>
                    <p style={{ fontSize: ".72rem", color: "var(--text-muted)", margin: "10px 0 16px", fontVariantNumeric: "tabular-nums" }}>{t.memberDiscountPct}% off · {Number(t.pointsMultiplier)}× points</p>
                    {current ? (
                      <span className="badge-brand">Current</span>
                    ) : (
                      <form action={subscribeTier}>
                        <input type="hidden" name="tierId" value={t.id} />
                        <input type="hidden" name="billingCycle" value="monthly" />
                        <button type="submit" className="btn btn-outline-gold btn-sm w-100">{t.isFree ? "Switch to free" : "Choose"}</button>
                      </form>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: ".72rem", color: "var(--text-dim)", marginTop: 14 }}>Billing is simulated during the build — choosing a tier sets it instantly (Stripe connects later).</p>
        </div>

        {/* Rewards */}
        <div className="mt-5 pt-4">
          <span className="eyebrow" style={sectionEyebrow}>Redeem</span>
          <h2 className="serif d-flex flex-wrap align-items-baseline gap-2" style={{ fontSize: "clamp(1.6rem, 3vw, 2.1rem)", margin: "0 0 22px" }}>
            Rewards
            <span style={{ fontSize: ".8125rem", fontFamily: "var(--sans)", fontWeight: 400, color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>{customer.pointsBalance} points available</span>
          </h2>
          <div className="row g-3">
            {rewards.map((r) => {
              const affordable = customer.pointsBalance >= r.pointsCost && r.availability === "available";
              return (
                <div className="col-6 col-lg-4" key={r.id}>
                  <div className="reward-card h-100 d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start gap-2">
                      <strong className="serif" style={{ fontSize: "1.1rem" }}>{r.name}</strong>
                      <span className="badge-brand" style={{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{r.pointsCost} pts</span>
                    </div>
                    {r.description && <p style={{ fontSize: ".8125rem", color: "var(--text-muted)", margin: "10px 0", lineHeight: 1.6 }}>{r.description}</p>}
                    <div className="mt-auto pt-2">
                      {r.availability === "coming_soon" ? (
                        <span style={{ fontSize: ".75rem", color: "var(--text-dim)" }}>Coming soon</span>
                      ) : (
                        <form action={redeemReward}>
                          <input type="hidden" name="rewardId" value={r.id} />
                          <button type="submit" className="btn btn-gold btn-sm w-100" disabled={!affordable}>{affordable ? "Redeem" : "Not enough points"}</button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Points activity */}
        {ledger.length > 0 && (
          <div className="mt-5 pt-4">
            <span className="eyebrow" style={sectionEyebrow}>History</span>
            <h2 className="serif" style={{ fontSize: "clamp(1.6rem, 3vw, 2.1rem)", margin: "0 0 22px" }}>Points activity</h2>
            <div className="card-brand p-0" style={{ overflow: "hidden" }}>
              <div className="table-responsive">
                <table className="m-table" style={{ fontVariantNumeric: "tabular-nums" }}>
                  <thead><tr><th>Date</th><th>Reason</th><th style={{ textAlign: "right" }}>Points</th><th style={{ textAlign: "right" }}>Balance</th></tr></thead>
                  <tbody>
                    {ledger.map((l) => (
                      <tr key={l.id}>
                        <td>{new Date(l.createdAt).toLocaleDateString("en-GB")}</td>
                        <td style={{ textTransform: "capitalize" }}>{l.note ?? l.reason}</td>
                        <td style={{ textAlign: "right", color: l.delta >= 0 ? "var(--green)" : "var(--red)" }}>{l.delta >= 0 ? "+" : ""}{l.delta}</td>
                        <td style={{ textAlign: "right" }}>{l.balanceAfter}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
