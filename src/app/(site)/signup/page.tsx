import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import SignupWizard, { type WizardTier } from "@/components/signup/signup-wizard";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Join Membership — Rumbaclaat",
  description:
    "Sign up for Rumbaclaat membership. Choose your tier, create your account, and join the Inner Circle. 18+ only.",
  robots: "noindex,nofollow",
};

export default async function SignupPage() {
  const tiers = await prisma.membershipTier.findMany({ orderBy: { sortOrder: "asc" } });

  const wizardTiers: WizardTier[] = tiers.map((t) => ({
    name: t.name,
    slug: t.slug,
    priceMonthly: Number(t.priceMonthly),
    priceAnnual: Number(t.priceAnnual),
    pointsMultiplier: Number(t.pointsMultiplier),
    memberDiscountPct: t.memberDiscountPct,
    isFree: t.isFree,
  }));

  return (
    <main id="main">
      <Suspense
        fallback={
          <section style={{ padding: "clamp(40px,5vw,64px) clamp(20px,5vw,40px) clamp(72px,9vw,110px)" }}>
            <div style={{ maxWidth: 680, margin: "0 auto" }} />
          </section>
        }
      >
        <SignupWizard tiers={wizardTiers} />
      </Suspense>
    </main>
  );
}
