import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/ui/page-header";
import CustomersGrid, { type CustomerRow } from "@/components/admin/customers/customers-grid";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: { membershipTier: true, _count: { select: { orders: true } } },
  });

  const rows: CustomerRow[] = customers.map((c) => ({
    id: c.id,
    name: [c.firstName, c.lastName].filter(Boolean).join(" "),
    email: c.email,
    tier: c.membershipTier?.name ?? "—",
    points: c.pointsBalance,
    spend: Number(c.lifetimeSpend),
    orders: c._count.orders,
    joined: c.createdAt.toISOString(),
  }));

  return (
    <>
      <PageHeader
        title="Customers"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Customers" }]}
        action={
          <Link href="/admin/customers/new" className="btn btn-gold btn-sm">
            <i className="bi bi-plus-lg me-1" aria-hidden="true" />New customer
          </Link>
        }
      />
      <CustomersGrid rows={rows} />
    </>
  );
}
