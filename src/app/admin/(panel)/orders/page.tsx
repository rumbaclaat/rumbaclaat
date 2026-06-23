import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/ui/page-header";
import OrdersGrid, { type OrderRow } from "@/components/admin/orders/orders-grid";
import { bulkOrderStatus } from "./actions";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { placedAt: "desc" },
    include: { _count: { select: { items: true } } },
  });

  const rows: OrderRow[] = orders.map((o) => ({
    id: o.id,
    ref: o.ref,
    customerName: o.customerName ?? "",
    email: o.email,
    items: o._count.items,
    total: Number(o.total),
    status: o.status,
    paymentStatus: o.paymentStatus,
    placedAt: o.placedAt.toISOString(),
  }));

  return (
    <>
      <PageHeader
        title="Orders"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Orders" }]}
        action={
          <Link href="/admin/orders/new" className="btn btn-gold btn-sm">
            <i className="bi bi-plus-lg me-1" aria-hidden="true" />Create order
          </Link>
        }
      />
      <OrdersGrid rows={rows} bulkStatus={bulkOrderStatus} />
    </>
  );
}
