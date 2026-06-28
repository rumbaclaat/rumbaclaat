import { prisma } from "@/lib/prisma";
import { getCustomer } from "@/lib/auth";
import AccountAuth from "@/components/account/account-auth";
import AccountDashboard from "@/components/account/account-dashboard";
import { signOutCustomer, subscribeTier, redeemReward, updateDetails, saveAddress } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Account", robots: "noindex,nofollow" };

type Tier = {
  id: string;
  name: string;
  slug: string;
  priceMonthly: number;
  priceAnnual: number;
  pointsMultiplier: number;
  memberDiscountPct: number;
  isFree: boolean;
  benefits: string[];
  sortOrder: number;
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{
    registered?: string;
    error?: string;
    tier?: string;
    redeemed?: string;
    saved?: string;
  }>;
}) {
  const sp = await searchParams;
  const session = await getCustomer();

  if (!session) {
    return <AccountAuth registered={!!sp.registered} errorCode={sp.error} />;
  }

  const { customer } = session;
  const [tier, orders, tiers, rewards, ledger, addresses] = await Promise.all([
    customer.membershipTierId
      ? prisma.membershipTier.findUnique({ where: { id: customer.membershipTierId } })
      : null,
    prisma.order.findMany({ where: { email: customer.email }, orderBy: { placedAt: "desc" }, take: 10 }),
    prisma.membershipTier.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.reward.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.pointsLedger.findMany({ where: { customerId: customer.id }, orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.address.findMany({ where: { customerId: customer.id }, orderBy: { isDefault: "desc" } }),
  ]);

  const serTier = (t: {
    id: string; name: string; slug: string;
    priceMonthly: unknown; priceAnnual: unknown; pointsMultiplier: unknown;
    memberDiscountPct: number; isFree: boolean; benefits: string[]; sortOrder: number;
  }): Tier => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    priceMonthly: Number(t.priceMonthly),
    priceAnnual: Number(t.priceAnnual),
    pointsMultiplier: Number(t.pointsMultiplier),
    memberDiscountPct: t.memberDiscountPct,
    isFree: t.isFree,
    benefits: t.benefits,
    sortOrder: t.sortOrder,
  });

  const flash =
    sp.error === "points"
      ? { ok: false, message: "Not enough points for that reward." }
      : sp.error === "reward"
        ? { ok: false, message: "That reward isn’t available." }
        : sp.error === "address"
          ? { ok: false, message: "Please complete the required address fields." }
          : sp.tier
            ? { ok: true, message: "Membership updated." }
            : sp.redeemed
              ? { ok: true, message: "Reward redeemed." }
              : sp.saved === "details"
                ? { ok: true, message: "Your details have been saved." }
                : sp.saved === "address"
                  ? { ok: true, message: "Address saved." }
                  : null;

  return (
    <AccountDashboard
      customer={{
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        dob: customer.dateOfBirth ? customer.dateOfBirth.toISOString().slice(0, 10) : null,
        pointsBalance: customer.pointsBalance,
        lifetimeSpend: Number(customer.lifetimeSpend),
        referralCode: customer.referralCode,
      }}
      currentTierId={customer.membershipTierId}
      tier={tier ? serTier(tier) : null}
      tiers={tiers.map(serTier)}
      orders={orders.map((o) => ({
        id: o.id,
        ref: o.ref,
        date: new Date(o.placedAt).toLocaleDateString("en-GB"),
        total: Number(o.total),
        status: o.status,
      }))}
      rewards={rewards.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        pointsCost: r.pointsCost,
        type: r.type,
        availability: r.availability,
      }))}
      ledger={ledger.map((l) => ({
        id: l.id,
        date: new Date(l.createdAt).toLocaleDateString("en-GB"),
        label: l.note ?? l.reason,
        delta: l.delta,
        balanceAfter: l.balanceAfter,
      }))}
      addresses={addresses.map((a) => ({
        id: a.id,
        line1: a.line1,
        line2: a.line2,
        city: a.city,
        postcode: a.postcode,
        country: a.country,
        isDefault: a.isDefault,
      }))}
      flash={flash}
      actions={{
        signOut: signOutCustomer,
        subscribe: subscribeTier,
        redeem: redeemReward,
        updateDetails,
        saveAddress,
      }}
    />
  );
}
