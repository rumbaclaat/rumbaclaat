import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

/**
 * Persist a new order for a list of records in one transaction. `updateOne`
 * returns a Prisma update promise that writes the order field (sortOrder/order)
 * for a given id + index. Shared by categories, collections, nav items,
 * banners, blocks, rewards, tiers, etc.
 *
 *   await persistOrder(ids, (id, sortOrder) =>
 *     prisma.category.update({ where: { id }, data: { sortOrder } }));
 */
export async function persistOrder<R>(
  ids: string[],
  updateOne: (id: string, sortOrder: number) => Prisma.PrismaPromise<R>
) {
  await prisma.$transaction(ids.map((id, i) => updateOne(id, i)));
}
