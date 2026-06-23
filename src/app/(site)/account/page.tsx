import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCustomer } from "@/lib/auth";
import AccountAuth from "@/components/account/account-auth";
import { signOutCustomer, subscribeTier, redeemReward } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Account", robots: "noindex,nofollow" };

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
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
          <div>
            <span className="eyebrow">Member Dashboard</span>
            <h1>Welcome back, {customer.firstName ?? "member"}</h1>
          </div>
          <form action={signOutCustomer}>
            <button type="submit" className="btn btn-outline-gold btn-sm">Sign out</button>
          </form>
        </div>

        {(tierFlag || redeemed || error) && (
          <div role="status" className="mb-4" style={{ background: error ? "rgba(242,109,109,.12)" : "rgba(74,222,128,.12)", border: `1px solid ${error ? "rgba(242,109,109,.35)" : "rgba(74,222,128,.35)"}`, color: error ? "var(--red)" : "var(--green)", borderRadius: 8, padding: "8px 12px", fontSize: ".875rem" }}>
            {error === "points" ? "Not enough points for that reward." : error === "reward" ? "That reward isn't available." : tierFlag ? "✓ Membership updated." : "✓ Reward redeemed."}
          </div>
        )}

        {/* Stat cards */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-lg-3"><div className="card-brand text-center h-100"><div className="serif gold" style={{ fontSize: "1.75rem" }}>{tier?.name ?? "Bronze"}</div><div style={{ fontSize: ".75rem", color: "var(--text-muted)" }}>Membership tier</div></div></div>
          <div className="col-6 col-lg-3"><div className="card-brand text-center h-100"><div className="serif gold" style={{ fontSize: "1.75rem" }}>{pointsEarned}</div><div style={{ fontSize: ".75rem", color: "var(--text-muted)" }}>Points earned</div></div></div>
          <div className="col-6 col-lg-3"><div className="card-brand text-center h-100"><div className="serif gold" style={{ fontSize: "1.75rem" }}>{orders.length}</div><div style={{ fontSize: ".75rem", color: "var(--text-muted)" }}>Orders</div></div></div>
          <div className="col-6 col-lg-3"><div className="card-brand text-center h-100"><div className="serif gold" style={{ fontSize: "1.75rem" }}>{tier?.memberDiscountPct ?? 5}%</div><div style={{ fontSize: ".75rem", color: "var(--text-muted)" }}>Member discount</div></div></div>
        </div>

        <div className="row g-4">
          <div className="col-12 col-lg-8">
            <div className="card-brand">
              <h2 className="h5 mb-3">Order history</h2>
              {orders.length === 0 ? (
                <p style={{ color: "var(--text-dim)" }}>No orders yet. <Link href="/shop">Start shopping →</Link></p>
              ) : (
                <div className="table-responsive">
                  <table className="m-table">
                    <thead><tr><th>Ref</th><th>Date</th><th>Total</th><th>Status</th></tr></thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o.id}>
                          <td className="gold">{o.ref}</td>
                          <td>{new Date(o.placedAt).toLocaleDateString("en-GB")}</td>
                          <td>£{Number(o.total).toFixed(2)}</td>
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
            <div className="card-brand">
              <h2 className="h5 mb-3">Details</h2>
              <p style={{ margin: "0 0 4px" }}>{name}</p>
              <p style={{ fontSize: ".875rem", color: "var(--text-muted)", margin: 0 }}>{customer.email}</p>
              <hr style={{ borderColor: "var(--gold-bdr)" }} />
              <p style={{ fontSize: ".8125rem", color: "var(--text-muted)" }}>
                {tier && !tier.isFree
                  ? `You're on ${tier.name}.`
                  : "Upgrade for bigger discounts and faster points."}
              </p>
              <Link href="/join" className="btn btn-outline-gold btn-sm w-100">View all plans</Link>
            </div>
          </div>
        </div>

        {/* Membership tiers */}
        <div className="mt-5">
          <h2 className="h5 mb-3">Your membership</h2>
          <div className="row g-3">
            {tiers.map((t) => {
              const current = t.id === customer.membershipTierId;
              return (
                <div className="col-6 col-lg-3" key={t.id}>
                  <div className="card-brand h-100 text-center" style={current ? { borderColor: "var(--gold)" } : undefined}>
                    <div className="serif gold" style={{ fontSize: "1.15rem" }}>{t.name}</div>
                    <div className="serif" style={{ fontSize: "1.35rem" }}>{t.isFree ? "Free" : `£${Number(t.priceMonthly).toFixed(2)}/mo`}</div>
                    <p style={{ fontSize: ".72rem", color: "var(--text-muted)", margin: "6px 0 10px" }}>{t.memberDiscountPct}% off · {Number(t.pointsMultiplier)}× points</p>
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
          <p style={{ fontSize: ".72rem", color: "var(--text-dim)", marginTop: 8 }}>Billing is simulated during the build — choosing a tier sets it instantly (Stripe connects later).</p>
        </div>

        {/* Rewards */}
        <div className="mt-5">
          <h2 className="h5 mb-3">Rewards <span style={{ fontSize: ".8125rem", color: "var(--text-muted)" }}>· {customer.pointsBalance} points available</span></h2>
          <div className="row g-3">
            {rewards.map((r) => {
              const affordable = customer.pointsBalance >= r.pointsCost && r.availability === "available";
              return (
                <div className="col-6 col-lg-4" key={r.id}>
                  <div className="reward-card h-100">
                    <div className="d-flex justify-content-between align-items-start">
                      <strong>{r.name}</strong>
                      <span className="badge-brand">{r.pointsCost} pts</span>
                    </div>
                    {r.description && <p style={{ fontSize: ".8125rem", color: "var(--text-muted)", margin: "8px 0" }}>{r.description}</p>}
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
              );
            })}
          </div>
        </div>

        {/* Points activity */}
        {ledger.length > 0 && (
          <div className="mt-5">
            <h2 className="h5 mb-3">Points activity</h2>
            <div className="card-brand p-0" style={{ overflow: "hidden" }}>
              <div className="table-responsive">
                <table className="m-table">
                  <thead><tr><th>Date</th><th>Reason</th><th>Points</th><th>Balance</th></tr></thead>
                  <tbody>
                    {ledger.map((l) => (
                      <tr key={l.id}>
                        <td>{new Date(l.createdAt).toLocaleDateString("en-GB")}</td>
                        <td style={{ textTransform: "capitalize" }}>{l.note ?? l.reason}</td>
                        <td style={{ color: l.delta >= 0 ? "var(--green)" : "var(--red)" }}>{l.delta >= 0 ? "+" : ""}{l.delta}</td>
                        <td>{l.balanceAfter}</td>
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
