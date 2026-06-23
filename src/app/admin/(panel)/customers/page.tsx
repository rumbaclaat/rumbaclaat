import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: { membershipTier: true },
    take: 200,
  });

  return (
    <>
      <div className="admin-page-head">
        <h1>Customers &amp; members</h1>
      </div>

      <div className="admin-card p-0" style={{ overflow: "hidden" }}>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Tier</th>
                <th>Points</th>
                <th>Lifetime spend</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 && (
                <tr><td colSpan={6} style={{ color: "var(--text-dim)" }}>No customers yet.</td></tr>
              )}
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>{[c.firstName, c.lastName].filter(Boolean).join(" ") || "—"}</td>
                  <td style={{ color: "var(--text-muted)" }}>{c.email}</td>
                  <td>{c.membershipTier ? <span className="badge-brand">{c.membershipTier.name}</span> : "—"}</td>
                  <td>{c.pointsBalance}</td>
                  <td>£{Number(c.lifetimeSpend).toFixed(2)}</td>
                  <td style={{ color: "var(--text-dim)" }}>{new Date(c.createdAt).toLocaleDateString("en-GB")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
