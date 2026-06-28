import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import PageHeader from "@/components/admin/ui/page-header";
import AdminCard from "@/components/admin/ui/admin-card";
import StatusBadge from "@/components/admin/ui/status-badge";
import StatCard from "@/components/admin/ui/stat-card";
import SaveBar from "@/components/admin/ui/save-bar";
import { updateCustomer, adjustPoints, addAddress, deleteAddress, deleteCustomer } from "../actions";

export const dynamic = "force-dynamic";

export default async function CustomerDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { membershipTier: true, addresses: { orderBy: { isDefault: "desc" } } },
  });
  if (!customer) notFound();

  const [orders, points, subscription, tiers] = await Promise.all([
    prisma.order.findMany({ where: { customerId: id }, orderBy: { placedAt: "desc" }, take: 50 }),
    prisma.pointsLedger.findMany({ where: { customerId: id }, orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.membershipSubscription.findUnique({ where: { customerId: id } }),
    prisma.membershipTier.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const name = [customer.firstName, customer.lastName].filter(Boolean).join(" ") || customer.email;
  const tierLabel = customer.membershipTier?.name ?? "No tier";

  return (
    <>
      <PageHeader
        title={name}
        subtitle={customer.email}
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Customers", href: "/admin/customers" }, { label: name }]}
        titleBadge={<StatusBadge status={customer.membershipTier ? "active" : "none"} label={tierLabel} />}
        action={
          <div className="d-flex gap-2 align-items-center">
            <a href={`mailto:${customer.email}`} className="btn btn-ghost btn-sm"><i className="bi bi-envelope me-1" />Email</a>
            <a href={`/admin/api/customers/${customer.id}/export`} className="btn btn-ghost btn-sm"><i className="bi bi-download me-1" />GDPR export</a>
          </div>
        }
      />

      <div className="row g-4">
        {/* Main */}
        <div className="col-12 col-lg-8">
          <div className="admin-stat-row mb-4">
            <StatCard label="Points balance" value={customer.pointsBalance} icon="bi-star" />
            <StatCard label="Lifetime spend" value={formatMoney(Number(customer.lifetimeSpend))} icon="bi-cash-stack" />
            <StatCard label="Orders" value={orders.length} icon="bi-bag" />
            <StatCard label="Tier" value={tierLabel} icon="bi-gem" />
          </div>

          <AdminCard title="Profile">
            <div className="row g-3">
              <div className="col-md-4"><div className="admin-stat-label">Name</div><div>{name}</div></div>
              <div className="col-md-4"><div className="admin-stat-label">Email</div><div>{customer.email}</div></div>
              <div className="col-md-4"><div className="admin-stat-label">Phone</div><div>{customer.phone ?? "—"}</div></div>
              <div className="col-md-4"><div className="admin-stat-label">Membership tier</div><div>{tierLabel}</div></div>
              <div className="col-md-4"><div className="admin-stat-label">Tags</div><div>{customer.tags.length ? customer.tags.join(", ") : "—"}</div></div>
              {subscription && <div className="col-md-4"><div className="admin-stat-label">Subscription</div><StatusBadge status={subscription.status} /></div>}
              <div className="col-12"><div className="admin-stat-label">Internal notes</div><div className="td-muted" style={{ whiteSpace: "pre-wrap" }}>{customer.notes ?? "—"}</div></div>
            </div>
          </AdminCard>

          {subscription && (
            <AdminCard title="Subscription" className="mt-4">
              <div className="row g-3">
                <div className="col-md-4"><div className="admin-stat-label">Status</div><StatusBadge status={subscription.status} /></div>
                <div className="col-md-4"><div className="admin-stat-label">Cycle</div><div>{subscription.billingCycle}</div></div>
                <div className="col-md-4"><div className="admin-stat-label">Price</div><div>{formatMoney(Number(subscription.price))}</div></div>
                <div className="col-md-4"><div className="admin-stat-label">Started</div><div>{new Date(subscription.startedAt).toLocaleDateString("en-GB")}</div></div>
                {subscription.nextChargeDate && <div className="col-md-4"><div className="admin-stat-label">Next charge</div><div>{new Date(subscription.nextChargeDate).toLocaleDateString("en-GB")}</div></div>}
              </div>
            </AdminCard>
          )}

          <AdminCard
            title="Orders"
            className="mt-4"
            actions={<Link href="/admin/orders/new" className="btn btn-outline-gold btn-sm">Create order</Link>}
          >
            <div className="table-responsive">
              <table className="admin-table">
                <thead><tr><th>Ref</th><th>Date</th><th>Total</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {orders.length === 0 && <tr><td colSpan={5} className="td-muted">No orders.</td></tr>}
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td><Link href={`/admin/orders/${o.id}`} className="gold">{o.ref}</Link></td>
                      <td className="td-muted">{new Date(o.placedAt).toLocaleDateString("en-GB")}</td>
                      <td>{formatMoney(Number(o.total), o.currency)}</td>
                      <td><StatusBadge status={o.status} /></td>
                      <td><Link href={`/admin/orders/new?from=${o.id}`} className="btn btn-ghost btn-sm">Reorder</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AdminCard>

          <AdminCard title="Points history" className="mt-4">
            <div className="table-responsive">
              <table className="admin-table">
                <thead><tr><th>Date</th><th>Reason</th><th>Change</th><th>Balance</th><th>Note</th></tr></thead>
                <tbody>
                  {points.length === 0 && <tr><td colSpan={5} className="td-muted">No points activity.</td></tr>}
                  {points.map((p) => (
                    <tr key={p.id}>
                      <td className="td-muted">{new Date(p.createdAt).toLocaleDateString("en-GB")}</td>
                      <td style={{ textTransform: "capitalize" }}>{p.reason}</td>
                      <td style={{ color: p.delta >= 0 ? "var(--green)" : "var(--red)" }}>{p.delta >= 0 ? "+" : ""}{p.delta}</td>
                      <td>{p.balanceAfter}</td>
                      <td className="td-muted">{p.note ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AdminCard>
        </div>

        {/* Rail */}
        <div className="col-12 col-lg-4">
          <form action={updateCustomer}>
            <input type="hidden" name="id" value={customer.id} />
            <AdminCard title="Status">
              <div className="mb-3"><StatusBadge status={customer.membershipTier ? "active" : "none"} label={tierLabel} /></div>
              <div className="d-flex flex-column gap-2">
                <label className="form-label" htmlFor="membershipTierId">Membership tier</label>
                <select id="membershipTierId" name="membershipTierId" className="form-select form-select-sm" defaultValue={customer.membershipTierId ?? ""}>
                  <option value="">— none —</option>
                  {tiers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            </AdminCard>

            <AdminCard title="Identity" className="mt-4">
              <div className="row g-2">
                <div className="col-md-6"><label className="form-label" htmlFor="firstName">First name</label><input id="firstName" name="firstName" className="form-control form-control-sm" defaultValue={customer.firstName ?? ""} /></div>
                <div className="col-md-6"><label className="form-label" htmlFor="lastName">Last name</label><input id="lastName" name="lastName" className="form-control form-control-sm" defaultValue={customer.lastName ?? ""} /></div>
                <div className="col-12"><label className="form-label" htmlFor="phone">Phone</label><input id="phone" name="phone" className="form-control form-control-sm" defaultValue={customer.phone ?? ""} /></div>
                <div className="col-12"><label className="form-label" htmlFor="tags">Tags</label><input id="tags" name="tags" className="form-control form-control-sm" defaultValue={customer.tags.join(", ")} /><div className="form-text" style={{ color: "var(--text-dim)" }}>Comma-separated.</div></div>
                <div className="col-12"><label className="form-label" htmlFor="notes">Internal notes</label><textarea id="notes" name="notes" rows={3} className="form-control form-control-sm" defaultValue={customer.notes ?? ""} /></div>
              </div>
            </AdminCard>

            <SaveBar submitLabel="Save customer" cancelHref="/admin/customers" />
          </form>

          <AdminCard title="Adjust points" className="mt-4">
            <form action={adjustPoints} className="row g-2 align-items-end">
              <input type="hidden" name="id" value={customer.id} />
              <div className="col-6"><label className="form-label" htmlFor="delta">Amount (+/−)</label><input id="delta" name="delta" type="number" className="form-control form-control-sm" placeholder="e.g. 250 or -100" /></div>
              <div className="col-12"><label className="form-label" htmlFor="pnote">Note</label><input id="pnote" name="note" className="form-control form-control-sm" /></div>
              <div className="col-12"><button className="btn btn-outline-gold btn-sm w-100">Apply</button></div>
            </form>
          </AdminCard>

          <AdminCard title="Addresses" className="mt-4">
            {customer.addresses.map((a) => (
              <div key={a.id} className="d-flex justify-content-between align-items-start mb-3 pb-2" style={{ borderBottom: "1px solid var(--gold-bdr)" }}>
                <div>
                  {a.isDefault && <span className="admin-badge admin-badge--info mb-1">Default</span>}
                  <div>{a.name}</div>
                  <div className="td-muted" style={{ fontSize: ".85rem" }}>{[a.line1, a.line2, a.city, a.postcode, a.country].filter(Boolean).join(", ")}</div>
                </div>
                <form action={deleteAddress}>
                  <input type="hidden" name="id" value={a.id} />
                  <input type="hidden" name="customerId" value={customer.id} />
                  <button className="btn btn-ghost btn-sm text-danger"><i className="bi bi-trash" /></button>
                </form>
              </div>
            ))}
            <form action={addAddress} className="row g-2">
              <input type="hidden" name="customerId" value={customer.id} />
              <div className="col-md-6"><label className="form-label" htmlFor="aname">Name</label><input id="aname" name="name" className="form-control form-control-sm" /></div>
              <div className="col-md-6"><label className="form-label" htmlFor="aline1">Line 1</label><input id="aline1" name="line1" className="form-control form-control-sm" /></div>
              <div className="col-md-6"><label className="form-label" htmlFor="aline2">Line 2</label><input id="aline2" name="line2" className="form-control form-control-sm" /></div>
              <div className="col-md-4"><label className="form-label" htmlFor="acity">City</label><input id="acity" name="city" className="form-control form-control-sm" /></div>
              <div className="col-md-2"><label className="form-label" htmlFor="apost">Postcode</label><input id="apost" name="postcode" className="form-control form-control-sm" /></div>
              <div className="col-12"><button className="btn btn-outline-gold btn-sm mt-1">Add address</button></div>
            </form>
          </AdminCard>

          <AdminCard title="GDPR" className="mt-4">
            <p className="td-muted" style={{ fontSize: ".85rem" }}>Export this customer&apos;s data or permanently erase the record.</p>
            <div className="d-flex flex-column gap-2">
              <a href={`/admin/api/customers/${customer.id}/export`} className="btn btn-ghost btn-sm"><i className="bi bi-download me-1" />GDPR export</a>
              <form action={deleteCustomer}>
                <input type="hidden" name="id" value={customer.id} />
                <button type="submit" className="btn btn-ghost btn-sm text-danger w-100"><i className="bi bi-trash me-1" />Erase customer</button>
              </form>
            </div>
          </AdminCard>
        </div>
      </div>
    </>
  );
}
