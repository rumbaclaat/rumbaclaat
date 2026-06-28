import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/ui/page-header";
import OrderBuilder from "@/components/admin/orders/order-builder";
import { createOrder } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewOrderPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;
  const [customers, products] = await Promise.all([
    prisma.customer.findMany({ orderBy: { createdAt: "desc" }, take: 500, select: { id: true, firstName: true, lastName: true, email: true } }),
    prisma.product.findMany({ where: { status: "published" }, orderBy: { name: "asc" }, select: { id: true, name: true, basePrice: true } }),
  ]);

  let initial = null;
  if (from) {
    const src = await prisma.order.findUnique({ where: { id: from }, include: { items: true } });
    if (src) {
      initial = {
        email: src.email,
        customerName: src.customerName,
        customerId: src.customerId,
        lines: src.items.map((i) => ({ productId: i.productId, name: i.name, unitPrice: Number(i.unitPrice), qty: i.qty })),
      };
    }
  }

  return (
    <>
      <PageHeader
        title={from ? "Reorder" : "Create order"}
        subtitle={from ? "Start a new order from a copy of an existing one — adjust the customer and line items below." : "Create a manual order — pick or enter the customer, add line items, then review the summary and place it."}
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Orders", href: "/admin/orders" }, { label: from ? "Reorder" : "Create order" }]}
      />
      <OrderBuilder
        action={createOrder}
        customers={customers.map((c) => ({ id: c.id, name: [c.firstName, c.lastName].filter(Boolean).join(" ") || c.email, email: c.email }))}
        products={products.map((p) => ({ id: p.id, name: p.name, price: Number(p.basePrice) }))}
        initial={initial}
      />
    </>
  );
}
