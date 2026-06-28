import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import PageHeader from "@/components/admin/ui/page-header";
import AdminCard from "@/components/admin/ui/admin-card";
import AdminTabs from "@/components/admin/ui/tabs";
import StatusBadge from "@/components/admin/ui/status-badge";
import FormSection from "@/components/admin/ui/form-section";
import { TextField, TextareaField, SelectField } from "@/components/admin/ui/field";
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

  return (
    <>
      <PageHeader
        title={name}
        subtitle={customer.email}
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Customers", href: "/admin/customers" }, { label: name }]}
        action={
          <div className="d-flex gap-2">
            <a href={`mailto:${customer.email}`} className="btn btn-ghost btn-sm"><i className="bi bi-envelope me-1" />Email</a>
            <a href={`/admin/api/customers/${customer.id}/export`} className="btn btn-ghost btn-sm"><i className="bi bi-download me-1" />GDPR export</a>
            <form action={deleteCustomer}>
              <input type="hidden" name="id" value={customer.id} />
              <button type="submit" className="btn btn-ghost btn-sm text-danger"><i className="bi bi-trash me-1" />Erase</button>
            </form>
          </div>
        }
      />

      <div className="admin-stat-row">
        <div className="admin-stat"><span className="admin-stat-label">Points</span><span className="admin-stat-num">{customer.pointsBalance}</span></div>
        <div className="admin-stat"><span className="admin-stat-label">Lifetime spend</span><span className="admin-stat-num">{formatMoney(Number(customer.lifetimeSpend))}</span></div>
        <div className="admin-stat"><span className="admin-stat-label">Orders</span><span className="admin-stat-num">{orders.length}</span></div>
        <div className="admin-stat"><span className="admin-stat-label">Tier</span><span className="admin-stat-num" style={{ fontSize: "1.4rem" }}>{customer.membershipTier?.name ?? "—"}</span></div>
      </div>

      <AdminTabs
        tabs={[
          {
            id: "overview", label: "Overview",
            content: (
              <form action={updateCustomer}>
                <input type="hidden" name="id" value={customer.id} />
                <FormSection title="Contact & membership">
                  <TextField name="firstName" label="First name" defaultValue={customer.firstName ?? ""} col="col-md-6" />
                  <TextField name="lastName" label="Last name" defaultValue={customer.lastName ?? ""} col="col-md-6" />
                  <TextField name="phone" label="Phone" defaultValue={customer.phone ?? ""} col="col-md-6" />
                  <SelectField name="membershipTierId" label="Membership tier" options={tiers.map((t) => ({ value: t.id, label: t.name }))} defaultValue={customer.membershipTierId ?? ""} blankLabel="— none —" col="col-md-6" />
                  <TextField name="tags" label="Tags" defaultValue={customer.tags.join(", ")} col="col-12" hint="Comma-separated." />
                  <TextareaField name="notes" label="Internal notes" defaultValue={customer.notes ?? ""} rows={3} />
                </FormSection>
                <div className="d-flex justify-content-end"><button className="btn btn-gold">Save customer</button></div>
              </form>
            ),
          },
          {
            id: "orders", label: "Orders", badge: orders.length,
            content: (
              <AdminCard
                title="Orders"
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
            ),
          },
          {
            id: "points", label: "Points", badge: customer.pointsBalance,
            content: (
              <>
                <AdminCard title="Adjust points">
                  <form action={adjustPoints} className="row g-2 align-items-end">
                    <input type="hidden" name="id" value={customer.id} />
                    <div className="col-6 col-md-3"><label className="form-label" htmlFor="delta">Amount (+/−)</label><input id="delta" name="delta" type="number" className="form-control form-control-sm" placeholder="e.g. 250 or -100" /></div>
                    <div className="col-12 col-md-6"><label className="form-label" htmlFor="pnote">Note</label><input id="pnote" name="note" className="form-control form-control-sm" /></div>
                    <div className="col-12 col-md-3"><button className="btn btn-outline-gold btn-sm w-100">Apply</button></div>
                  </form>
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
              </>
            ),
          },
          {
            id: "addresses", label: "Addresses", badge: customer.addresses.length,
            content: (
              <>
                {customer.addresses.map((a) => (
                  <AdminCard key={a.id} className="mb-3">
                    <div className="d-flex justify-content-between align-items-start">
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
                  </AdminCard>
                ))}
                <AdminCard title="Add address">
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
              </>
            ),
          },
          {
            id: "membership", label: "RPM",
            content: (
              <AdminCard title="Subscription">
                {subscription ? (
                  <div className="row g-3">
                    <div className="col-md-4"><div className="admin-stat-label">Status</div><StatusBadge status={subscription.status} /></div>
                    <div className="col-md-4"><div className="admin-stat-label">Cycle</div><div>{subscription.billingCycle}</div></div>
                    <div className="col-md-4"><div className="admin-stat-label">Price</div><div>{formatMoney(Number(subscription.price))}</div></div>
                    <div className="col-md-4"><div className="admin-stat-label">Started</div><div>{new Date(subscription.startedAt).toLocaleDateString("en-GB")}</div></div>
                    {subscription.nextChargeDate && <div className="col-md-4"><div className="admin-stat-label">Next charge</div><div>{new Date(subscription.nextChargeDate).toLocaleDateString("en-GB")}</div></div>}
                  </div>
                ) : (
                  <p className="td-muted mb-0">No paid subscription. Change the tier in the Overview tab to enrol.</p>
                )}
              </AdminCard>
            ),
          },
        ]}
      />
    </>
  );
}
