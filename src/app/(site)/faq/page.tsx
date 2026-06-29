import Link from "next/link";
import { type ReactNode } from "react";
import FaqAccordion from "./FaqAccordion";

export const metadata = {
  title: "FAQ",
  description:
    "Answers to common questions about Rumbaclaat orders, shipping, age verification, returns, membership, and the rum itself.",
};

type Item = { q: string; a: ReactNode };
type Group = { id: string; cat: string; items: Item[] };

const GROUPS: Group[] = [
  {
    id: "g1",
    cat: "Orders & shipping",
    items: [
      {
        q: "How long does UK delivery take?",
        a: "Standard UK delivery is 3–5 working days. Express options are available at checkout. Free shipping on orders over £50.",
      },
      {
        q: "Do you ship internationally?",
        a: (
          <>
            We currently ship throughout the UK and EU. International orders outside the EU are handled
            case-by-case via our trade team — <Link href="/contact">contact us</Link>.
          </>
        ),
      },
      {
        q: "Will my order arrive in time for Christmas?",
        a: "Order by Saturday 13 December for guaranteed UK delivery before the 25th. Express options extend this by a few days.",
      },
      {
        q: "How do I track my order?",
        a: (
          <>
            You&apos;ll receive a tracking link by email once your order ships. You can also find tracking in your{" "}
            <Link href="/account">account</Link> under Order History.
          </>
        ),
      },
      {
        q: "Can I change or cancel my order?",
        a: (
          <>
            Contact <a href="mailto:hello@rumbaclaat.com">hello@rumbaclaat.com</a> within 1 hour of placing the
            order and we&apos;ll do our best. After dispatch, orders can&apos;t be changed but you can return them.
          </>
        ),
      },
    ],
  },
  {
    id: "g2",
    cat: "Age verification",
    items: [
      {
        q: "Why do I have to verify my age?",
        a: "UK law requires us to confirm everyone buying alcohol is at least 18 years old. We verify at checkout and our couriers also verify on delivery.",
      },
      {
        q: "Who needs to sign for the delivery?",
        a: "Someone aged 18 or over must be at the address to sign. Our couriers may ask for ID. If no one suitable is home, they'll attempt redelivery or leave a card.",
      },
      {
        q: "What happens if you can't verify my age?",
        a: "We may cancel and refund the order. You're welcome to contact us if you think there's an issue.",
      },
    ],
  },
  {
    id: "g3",
    cat: "Returns & refunds",
    items: [
      {
        q: "What's your returns policy?",
        a: "You have 14 days to cancel most orders under the UK Consumer Contracts Regulations. Items must be unopened, unused and in resaleable condition. Perishables and personalised items are excluded.",
      },
      {
        q: "How do I return an item?",
        a: (
          <>
            Email <a href="mailto:hello@rumbaclaat.com">hello@rumbaclaat.com</a> with your order number and we&apos;ll
            send return instructions. You pay return postage unless the item is faulty.
          </>
        ),
      },
      {
        q: "When will I get my refund?",
        a: "Refunds are issued within 14 days of us receiving the return, to your original payment method.",
      },
      {
        q: "My bottle arrived damaged. What do I do?",
        a: "We're sorry. Email us within 48 hours with a photo of the damage and we'll arrange a replacement or refund — no need to return the damaged item.",
      },
    ],
  },
  {
    id: "g4",
    cat: "Membership & points",
    items: [
      {
        q: "Is Bronze membership really free?",
        a: "Yes. Bronze gives you 5% off every order, 1× loyalty points, birthday bonus and early newsletter access at no cost.",
      },
      {
        q: "Can I cancel my paid membership?",
        a: (
          <>
            Anytime from your <Link href="/membership">member portal</Link>. Cancellation takes effect at the end of
            your current billing period. New paid memberships have a 14-day money-back guarantee.
          </>
        ),
      },
      {
        q: "How do loyalty points work?",
        a: "You earn loyalty points on every purchase, multiplied by your tier (1× Bronze, 1.5× Silver, 2× Gold, 3× Black Reserve). Redeem points for credits, products and experiences from the Rewards tab.",
      },
      {
        q: "What happens when I upgrade tiers?",
        a: "Upgrades are immediate. You start earning at the new rate from your next purchase. Downgrades take effect at the end of your billing period.",
      },
    ],
  },
  {
    id: "g5",
    cat: "The rum",
    items: [
      {
        q: "Where is Rumbaclaat made?",
        a: "Our Original Reserve is distilled in Jamaica and aged in American oak. Each expression comes from selected Caribbean distilleries — see each product page for origin details.",
      },
      {
        q: "What's the ABV and bottle size?",
        a: "Original Reserve and Spiced Gold are 700ml; ABV varies by expression (43% Original Reserve, 40% Spiced Gold). Check the product page for the specific bottle.",
      },
      {
        q: "Are there allergens or animal products?",
        a: "Our rums contain no allergens listed under UK FSA rules and are suitable for vegetarians. Spiced expressions may contain natural botanicals — see the product page ingredients.",
      },
      {
        q: "How should I store opened rum?",
        a: "Upright, sealed, away from direct sunlight. An opened bottle keeps its character for around 6–12 months.",
      },
    ],
  },
  {
    id: "g6",
    cat: "Account & privacy",
    items: [
      {
        q: "How do I reset my password?",
        a: (
          <>
            On the <Link href="/account">sign-in page</Link>, click &quot;Forgot password&quot;. You&apos;ll get a
            reset link by email valid for 60 minutes.
          </>
        ),
      },
      {
        q: "How do you use my data?",
        a: (
          <>
            We process personal data under our <Link href="/privacy">Privacy Policy</Link>, in line with UK GDPR. We
            never sell your data. You can request access, correction or deletion at any time.
          </>
        ),
      },
      {
        q: "How do I manage my emails?",
        a: (
          <>
            From your <Link href="/unsubscribe">email preferences</Link> page. You can turn off categories
            individually or unsubscribe from all marketing in one click.
          </>
        ),
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <section
      style={{
        padding:
          "clamp(48px,7vw,84px) clamp(20px,5vw,40px) clamp(72px,9vw,110px)",
      }}
    >
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <span
            style={{
              fontSize: ".74rem",
              letterSpacing: ".24em",
              textTransform: "uppercase",
              color: "var(--gold)",
              fontWeight: 600,
            }}
          >
            Help Centre
          </span>
          <h1
            style={{
              fontFamily: "var(--serif)",
              fontWeight: 600,
              fontSize: "clamp(2.2rem,5vw,3.4rem)",
              lineHeight: 1.05,
              margin: "12px 0 0",
            }}
          >
            Frequently asked questions
          </h1>
          <p
            style={{
              color: "var(--muted)",
              fontSize: "1.05rem",
              lineHeight: 1.6,
              margin: "14px auto 0",
              maxWidth: 480,
            }}
          >
            Everything about orders, delivery, membership and our rum. Can&apos;t find it?{" "}
            <Link href="/contact" style={{ color: "var(--goldHi)" }}>
              Contact us.
            </Link>
          </p>
        </div>

        <FaqAccordion groups={GROUPS} />
      </div>
    </section>
  );
}
