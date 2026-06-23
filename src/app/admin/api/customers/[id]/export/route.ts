import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/guard";

export const dynamic = "force-dynamic";

// GDPR data export — downloads everything held about a customer as JSON.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requirePermission("customers.view");
  const { id } = await params;
  const customer = await prisma.customer.findUnique({ where: { id }, include: { addresses: true, membershipTier: true } });
  if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const [orders, points, subscription] = await Promise.all([
    prisma.order.findMany({ where: { customerId: id }, include: { items: true } }),
    prisma.pointsLedger.findMany({ where: { customerId: id } }),
    prisma.membershipSubscription.findUnique({ where: { customerId: id } }),
  ]);
  const payload = JSON.stringify({ customer, orders, points, subscription }, null, 2);
  return new NextResponse(payload, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="customer-${id}.json"`,
    },
  });
}
