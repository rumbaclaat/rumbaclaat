import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TradeAccountsPage() {
  const accounts = await prisma.tradeAccount.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true, invoices: true } } },
  });

  return (
    <>
      <div className="admin-page-head">
        <h1>Trade accounts</h1>
      </div>

      <div className="admin-card p-0" style={{ overflow: "hidden" }}>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Contact</th>
                <th>Type</th>
                <th>Terms</th>
                <th>Orders</th>
                <th>Outstanding</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {accounts.length === 0 && (
                <tr><td colSpan={7} style={{ color: "var(--text-dim)" }}>No trade accounts yet. Applications arrive under Enquiries.</td></tr>
              )}
              {accounts.map((a) => (
                <tr key={a.id}>
                  <td>{a.companyName}</td>
                  <td style={{ color: "var(--text-muted)" }}>{a.contactName}<br /><a href={`mailto:${a.contactEmail}`}>{a.contactEmail}</a></td>
                  <td style={{ color: "var(--text-muted)" }}>{a.businessType ?? "—"}</td>
                  <td>{a.paymentTerms}</td>
                  <td>{a._count.orders}</td>
                  <td>£{Number(a.outstandingBalance).toFixed(2)}</td>
                  <td style={{ textTransform: "capitalize", color: a.status === "active" ? "var(--green)" : "var(--yellow)" }}>{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
