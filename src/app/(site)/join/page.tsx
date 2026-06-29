import Link from "next/link";
import MembershipTiers from "@/components/membership/membership-tiers";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "RPM",
  description: "Join RPM. Four loyalty tiers from free Bronze to Black Reserve, with member pricing and exclusive drops.",
};

export default async function JoinPage() {
  return (
    <div data-screen-label="Membership">
      <section style={{ position: "relative", padding: "clamp(56px,8vw,104px) clamp(20px,5vw,40px) clamp(36px,5vw,52px)", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(90% 80% at 50% 0%, rgba(205,181,130,.13), transparent 60%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: 740, margin: "0 auto", textAlign: "center" }}>
          <span style={{ fontSize: ".74rem", letterSpacing: ".24em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 600 }}>RPM Membership</span>
          <h1 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "clamp(2.3rem,5.4vw,3.8rem)", lineHeight: 1.04, margin: "14px 0 0" }}>
            Membership, the<br />
            <span style={{ fontStyle: "italic", color: "var(--gold)" }}>Rumbaclaat way</span>
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "1.06rem", lineHeight: 1.6, margin: "18px auto 0", maxWidth: 500 }}>
            Four tiers. Exclusive perks. Member-only pricing. Join free — upgrade when you&apos;re ready.
          </p>
        </div>
      </section>

      <MembershipTiers />

      <section style={{ padding: "0 clamp(20px,5vw,40px) clamp(72px,9vw,110px)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "clamp(1.7rem,3.4vw,2.4rem)" }}>Every tier earns points</h2>
          <p style={{ color: "var(--muted)", fontSize: "1rem", lineHeight: 1.6, margin: "12px auto 0", maxWidth: 520 }}>
            Spend on rum and apparel, earn points, redeem for vouchers, free shipping and exclusive bottlings. The higher your tier, the faster you climb.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginTop: 28 }}>
            <Link href="/shop" style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "var(--gold)", color: "var(--onGold)", borderRadius: 999, padding: "14px 30px", fontSize: ".94rem", fontWeight: 600, cursor: "pointer", textDecoration: "none" }}>
              Start shopping <i className="bi bi-arrow-right" />
            </Link>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 9, border: "1px solid var(--line)", color: "var(--text)", borderRadius: 999, padding: "14px 28px", fontSize: ".94rem", fontWeight: 600, cursor: "pointer", textDecoration: "none" }}>
              Back to home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
