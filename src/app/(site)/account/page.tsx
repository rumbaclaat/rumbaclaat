import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCustomer } from "@/lib/auth";
import AccountAuth from "@/components/account/account-auth";
import { signOutCustomer } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Account", robots: "noindex,nofollow" };

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string; error?: string }>;
}) {
  const { registered, error } = await searchParams;
  const session = await getCustomer();

  if (!session) {
    return <AccountAuth registered={!!registered} errorCode={error} />;
  }

  const { customer } = session;
  const [tier, orders] = await Promise.all([
    customer.membershipTierId
      ? prisma.membershipTier.findUnique({ where: { id: customer.membershipTierId } })
      : null,
    prisma.order.findMany({ where: { email: customer.email }, orderBy: { placedAt: "desc" }, take: 10 }),
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
              <Link href="/join" className="btn btn-outline-gold btn-sm w-100">Manage membership</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
