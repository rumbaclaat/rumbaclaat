import { prisma } from "@/lib/prisma";

/** Append a points-ledger entry and update the customer's balance. */
export async function creditPoints(
  customerId: string,
  delta: number,
  reason: string,
  opts?: { relatedOrderId?: string; relatedRewardId?: string; note?: string }
): Promise<number | null> {
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) return null;

  const balanceAfter = Math.max(0, customer.pointsBalance + delta);
  await prisma.$transaction([
    prisma.pointsLedger.create({
      data: {
        customerId,
        delta,
        reason,
        balanceAfter,
        relatedOrderId: opts?.relatedOrderId ?? null,
        relatedRewardId: opts?.relatedRewardId ?? null,
        note: opts?.note ?? null,
      },
    }),
    prisma.customer.update({
      where: { id: customerId },
      data: { pointsBalance: balanceAfter },
    }),
  ]);
  return balanceAfter;
}
